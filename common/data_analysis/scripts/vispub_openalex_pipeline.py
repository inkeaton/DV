from __future__ import annotations
#pip install pandas requests tqdm
# opzionale (migliora il match title/year):
#pip install rapidfuzz

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# -----------------------------
# python vispub_openalex_pipeline.py --input ../dataset_original/dataset.csv --out ../outputs/openalex_outputs --mailto 4847306@studenti.unige.it
# -----------------------------

# Se vuoi anche il matching Title+Year quando manca DOI
""" python vispub_openalex_pipeline.py \
  --input ../dataset_original/dataset.csv \
  --out ../outputs/openalex_outputs \
  --mailto 4847306@studenti.unige.it \
  --resolve-title-year
"""

"""
Vispubdata -> (works, authors, authorships, coauthor_edges) + risoluzione OpenAlex.

Input atteso: CSV con colonne:
Conference,Year,Title,DOI,Link,FirstPage,LastPage,PaperType,Abstract,
AuthorNames-Deduped,AuthorNames,AuthorAffiliation,InternalReferences,
AuthorKeywords,AminerCitationCount,CitationCount_CrossRef,PubsCited_CrossRef,
Downloads_Xplore,Award,GraphicsReplicabilityStamp

Uso:
  python vispub_openalex_pipeline.py --input vispubdata.csv --out out --mailto you@uni.it
  python vispub_openalex_pipeline.py --input vispubdata.csv --out out --mailto you@uni.it --resolve-title-year
  python vispub_openalex_pipeline.py --input "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0" --out out --mailto you@uni.it

Output:
  out/works.csv
  out/authors.csv
  out/authorships.csv
  out/coauthor_edges.csv
  out/unresolved_works.csv
  out/ambiguous_matches.csv
  out/report.json
  out/cache_openalex_works/*.json
"""

import argparse
import dataclasses
import hashlib
import itertools
import json
import os
import re
import time
from typing import Any, Dict, Iterable, List, Optional, Tuple

import pandas as pd
import requests
from tqdm import tqdm

# -----------------------------
# Optional: rapidfuzz for better title similarity
# -----------------------------
try:
    from rapidfuzz.fuzz import token_set_ratio as _token_set_ratio  # type: ignore
except Exception:
    _token_set_ratio = None  # fallback to difflib below


def token_set_ratio(a: str, b: str) -> float:
    a = a or ""
    b = b or ""
    if _token_set_ratio is not None:
        return float(_token_set_ratio(a, b))
    # fallback: difflib
    import difflib
    return difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio() * 100.0


# -----------------------------
# Helpers: DOI + parsing
# -----------------------------
_DOI_RE = re.compile(r"(10\.\d{4,9}/[-._;()/:A-Z0-9]+)", re.IGNORECASE)

def normalize_doi(raw: Any) -> Optional[str]:
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return None
    s = str(raw).strip()
    if not s:
        return None

    s = s.replace("https://doi.org/", "").replace("http://doi.org/", "")
    s = s.replace("https://dx.doi.org/", "").replace("http://dx.doi.org/", "")
    s = s.replace("doi:", "").strip()

    m = _DOI_RE.search(s)
    if not m:
        return None
    doi = m.group(1).strip().lower()

    # ignore fake DOIs used as placeholders
    if doi.startswith("10.0000"):
        return None
    return doi


def parse_semicolon_list(raw: Any) -> List[str]:
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return []
    s = str(raw).strip()
    if not s:
        return []
    parts = [p.strip() for p in s.split(";")]
    return [p for p in parts if p]


def choose_author_list(row: pd.Series) -> List[str]:
    """
    Heuristics:
    - Prefer AuthorNames-Deduped (col J) usually.
    - If AuthorNames (raw) has different count but matches affiliation count, prefer that.
    - If Deduped empty -> use raw.
    """
    dedup = parse_semicolon_list(row.get("AuthorNames-Deduped"))
    raw = parse_semicolon_list(row.get("AuthorNames"))
    affs = parse_semicolon_list(row.get("AuthorAffiliation"))

    if not dedup and raw:
        return raw
    if not raw and dedup:
        return dedup
    if not dedup and not raw:
        return []

    # if one matches affiliations count exactly, prefer it
    if affs:
        if len(raw) == len(affs) and len(dedup) != len(affs):
            return raw
        if len(dedup) == len(affs) and len(raw) != len(affs):
            return dedup

    # else prefer dedup
    return dedup


def local_author_id(name: str, context: str = "") -> str:
    # deterministic local ID (stable across runs)
    key = (name.strip().lower() + "||" + (context or "").strip().lower()).encode("utf-8", errors="ignore")
    h = hashlib.sha1(key).hexdigest()[:16]
    return f"local:{h}"


def short_openalex_id(url_or_id: Optional[str]) -> Optional[str]:
    if not url_or_id:
        return None
    s = str(url_or_id).strip()
    return s.replace("https://openalex.org/", "")


# -----------------------------
# OpenAlex client with caching + rate limit
# -----------------------------
@dataclasses.dataclass
class OpenAlexClient:
    mailto: str
    cache_dir: str
    session: requests.Session = dataclasses.field(default_factory=requests.Session)
    min_interval_sec: float = 0.12  # ~8 req/s; conservative
    _last_call_ts: float = 0.0

    def _sleep_if_needed(self) -> None:
        dt = time.time() - self._last_call_ts
        if dt < self.min_interval_sec:
            time.sleep(self.min_interval_sec - dt)

    def _get(self, url: str, params: Optional[Dict[str, Any]] = None, timeout: int = 30) -> requests.Response:
        self._sleep_if_needed()
        params = params or {}
        if self.mailto:
            params.setdefault("mailto", self.mailto)
        resp = self.session.get(url, params=params, timeout=timeout, headers={"User-Agent": "vispub-openalex-pipeline/1.0"})
        self._last_call_ts = time.time()
        return resp

    def _cache_path(self, key: str) -> str:
        os.makedirs(self.cache_dir, exist_ok=True)
        safe = hashlib.sha1(key.encode("utf-8")).hexdigest()
        return os.path.join(self.cache_dir, f"{safe}.json")

    def get_work_by_doi(self, doi: str) -> Tuple[Optional[Dict[str, Any]], str]:
        """
        Returns (work_json, status_string).
        status_string: ok | not_found | error
        """
        doi = normalize_doi(doi) or ""
        if not doi:
            return None, "not_found"

        key = f"work_by_doi::{doi}"
        cpath = self._cache_path(key)
        if os.path.exists(cpath):
            try:
                with open(cpath, "r", encoding="utf-8") as f:
                    return json.load(f), "ok"
            except Exception:
                pass  # fall through

        url = f"https://api.openalex.org/works/https://doi.org/{doi}"
        # basic retries
        for attempt in range(4):
            try:
                resp = self._get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    with open(cpath, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False)
                    return data, "ok"
                if resp.status_code == 404:
                    return None, "not_found"
                # transient errors
                if resp.status_code in (429, 500, 502, 503, 504):
                    time.sleep(0.6 * (attempt + 1))
                    continue
                return None, f"error_http_{resp.status_code}"
            except Exception:
                time.sleep(0.6 * (attempt + 1))
                continue

        return None, "error"

    def search_work_by_title_year(self, title: str, year: int, per_page: int = 10) -> Tuple[List[Dict[str, Any]], str]:
        """
        Returns (results, status_string)
        status_string: ok | error
        """
        title = (title or "").strip()
        if not title or not year:
            return [], "error"

        key = f"search::{year}::{title}"
        cpath = self._cache_path(key)
        if os.path.exists(cpath):
            try:
                with open(cpath, "r", encoding="utf-8") as f:
                    return json.load(f), "ok"
            except Exception:
                pass

        url = "https://api.openalex.org/works"
        params = {
            "search": title,
            "filter": f"publication_year:{int(year)}",
            "per_page": int(per_page),
        }
        for attempt in range(4):
            try:
                resp = self._get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", []) or []
                    with open(cpath, "w", encoding="utf-8") as f:
                        json.dump(results, f, ensure_ascii=False)
                    return results, "ok"
                if resp.status_code in (429, 500, 502, 503, 504):
                    time.sleep(0.6 * (attempt + 1))
                    continue
                return [], f"error_http_{resp.status_code}"
            except Exception:
                time.sleep(0.6 * (attempt + 1))
                continue
        return [], "error"


# -----------------------------
# Transform OpenAlex -> our tables
# -----------------------------
def extract_openalex_authorships(work: Dict[str, Any]) -> List[Dict[str, Any]]:
    return work.get("authorships", []) or []


def extract_institutions(authorship: Dict[str, Any]) -> List[Dict[str, Any]]:
    # per docs: authorship.institutions is a list
    return authorship.get("institutions", []) or []


def pick_best_candidate_by_title(title: str, candidates: List[Dict[str, Any]], threshold: float = 92.0) -> Tuple[Optional[Dict[str, Any]], float]:
    best = None
    best_score = -1.0
    for c in candidates:
        t = c.get("title") or ""
        score = token_set_ratio(title, t)
        if score > best_score:
            best, best_score = c, score
    if best is None:
        return None, 0.0
    if best_score >= threshold:
        return best, best_score
    return None, best_score


# -----------------------------
# Main pipeline
# -----------------------------
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Path CSV oppure URL CSV (Google Sheets export)")
    ap.add_argument("--out", required=True, help="Cartella output")
    ap.add_argument("--mailto", required=True, help="Email per OpenAlex polite pool (consigliato)")
    ap.add_argument("--resolve-title-year", action="store_true", help="Se DOI manca, prova match via title+year")
    ap.add_argument("--title-year-threshold", type=float, default=92.0, help="Soglia similarità titolo per accettare match (default 92)")
    args = ap.parse_args()

    out_dir = args.out
    os.makedirs(out_dir, exist_ok=True)
    cache_dir = os.path.join(out_dir, "cache_openalex_works")
    os.makedirs(cache_dir, exist_ok=True)

    print(f"Leggo input: {args.input}")
    df = pd.read_csv(args.input)

    # basic normalization
    if "Year" in df.columns:
        df["Year"] = pd.to_numeric(df["Year"], errors="coerce").astype("Int64")

    # ensure DOI col exists
    if "DOI" not in df.columns:
        raise ValueError("Colonna DOI non trovata nel CSV.")

    client = OpenAlexClient(mailto=args.mailto, cache_dir=cache_dir)

    works_rows: List[Dict[str, Any]] = []
    authors_map: Dict[str, Dict[str, Any]] = {}  # author_id -> author row
    authorships_rows: List[Dict[str, Any]] = []
    unresolved_rows: List[Dict[str, Any]] = []
    ambiguous_rows: List[Dict[str, Any]] = []

    matched_by_counts = {"doi": 0, "title_year": 0, "none": 0}

    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing works"):
        title = str(row.get("Title") or "").strip()
        year = int(row["Year"]) if not pd.isna(row.get("Year")) else None
        conf = row.get("Conference")

        doi_norm = normalize_doi(row.get("DOI"))
        work_id = doi_norm if doi_norm else str(row.get("DOI") or f"no_doi_{idx}").strip()
        if not work_id:
            work_id = f"no_doi_{idx}"

        openalex_work = None
        openalex_status = "not_tried"
        matched_by = None
        title_year_score = None

        # 1) try DOI
        if doi_norm:
            openalex_work, openalex_status = client.get_work_by_doi(doi_norm)
            if openalex_work:
                matched_by = "doi"
                matched_by_counts["doi"] += 1

        # 2) optional: title/year search
        if openalex_work is None and args.resolve_title_year and title and year:
            candidates, st = client.search_work_by_title_year(title=title, year=year, per_page=10)
            if st == "ok" and candidates:
                best, score = pick_best_candidate_by_title(title, candidates, threshold=args.title_year_threshold)
                title_year_score = score
                if best is not None:
                    # If we got a search result, we still want the full work object.
                    # Search results are already "work-like", but safer to refetch by its OpenAlex ID if present.
                    best_id = best.get("id")
                    if best_id:
                        # best_id is like https://openalex.org/W....
                        best_key = f"work_by_openalex_id::{best_id}"
                        cpath = client._cache_path(best_key)
                        if os.path.exists(cpath):
                            try:
                                with open(cpath, "r", encoding="utf-8") as f:
                                    openalex_work = json.load(f)
                            except Exception:
                                openalex_work = None
                        if openalex_work is None:
                            url = best_id.replace("https://openalex.org/", "https://api.openalex.org/works/")
                            # url becomes https://api.openalex.org/works/W....
                            try:
                                resp = client._get(url)
                                if resp.status_code == 200:
                                    openalex_work = resp.json()
                                    with open(cpath, "w", encoding="utf-8") as f:
                                        json.dump(openalex_work, f, ensure_ascii=False)
                            except Exception:
                                openalex_work = None

                    if openalex_work:
                        matched_by = "title_year"
                        matched_by_counts["title_year"] += 1
                    else:
                        # ambiguous: good score but cannot fetch full record
                        ambiguous_rows.append({
                            "work_id": work_id,
                            "Title": title,
                            "Year": year,
                            "best_score": score,
                            "best_candidate_id": best.get("id"),
                            "best_candidate_title": best.get("title"),
                        })
                else:
                    # store ambiguity for manual review if score is close but under threshold
                    if score >= (args.title_year_threshold - 5):
                        top = candidates[0]
                        ambiguous_rows.append({
                            "work_id": work_id,
                            "Title": title,
                            "Year": year,
                            "best_score": score,
                            "best_candidate_id": top.get("id"),
                            "best_candidate_title": top.get("title"),
                        })

        if openalex_work is None:
            matched_by_counts["none"] += 1
            matched_by = "none"

        # ---- works row
        work_row = {c: row.get(c) for c in df.columns}
        work_row.update({
            "work_id": work_id,
            "doi_normalized": doi_norm,
            "openalex_work_id": short_openalex_id(openalex_work.get("id")) if openalex_work else None,
            "openalex_work_id_url": openalex_work.get("id") if openalex_work else None,
            "matched_by": matched_by,
            "title_year_score": title_year_score,
            "openalex_status": openalex_status,
        })
        works_rows.append(work_row)

        # ---- authorships
        if openalex_work:
            authorships = extract_openalex_authorships(openalex_work)
            for pos, a in enumerate(authorships, start=1):
                author = a.get("author") or {}
                author_id_url = author.get("id")
                author_id = short_openalex_id(author_id_url) or local_author_id(author.get("display_name") or f"unknown_{pos}", context=work_id)

                display_name = author.get("display_name")
                orcid = None
                # OpenAlex uses field author.orcid sometimes as URL; keep raw
                if isinstance(author.get("orcid"), str) and author.get("orcid"):
                    orcid = author.get("orcid")

                # institutions + country codes
                insts = extract_institutions(a)
                inst_ids = []
                inst_names = []
                inst_country_codes = []
                inst_rors = []
                for inst in insts:
                    inst_ids.append(short_openalex_id(inst.get("id")))
                    inst_names.append(inst.get("display_name"))
                    inst_country_codes.append(inst.get("country_code"))
                    inst_rors.append(inst.get("ror"))

                # upsert author
                if author_id not in authors_map:
                    authors_map[author_id] = {
                        "author_id": author_id,
                        "openalex_author_id_url": author_id_url,
                        "display_name": display_name,
                        "orcid": orcid,
                        "name_variants": json.dumps(sorted({n for n in [display_name] if n}), ensure_ascii=False),
                        "source": "openalex",
                    }
                else:
                    # merge variants
                    existing = authors_map[author_id]
                    variants = set()
                    try:
                        variants |= set(json.loads(existing.get("name_variants") or "[]"))
                    except Exception:
                        pass
                    if display_name:
                        variants.add(display_name)
                    existing["name_variants"] = json.dumps(sorted(variants), ensure_ascii=False)
                    if not existing.get("orcid") and orcid:
                        existing["orcid"] = orcid
                    if not existing.get("display_name") and display_name:
                        existing["display_name"] = display_name

                authorships_rows.append({
                    "work_id": work_id,
                    "author_id": author_id,
                    "author_position": pos,
                    "author_display_name": display_name,
                    "affiliation_raw": None,  # prefer OpenAlex institutions; keep raw affs for non-openalex
                    "institutions_openalex_ids": json.dumps(inst_ids, ensure_ascii=False),
                    "institutions_names": json.dumps(inst_names, ensure_ascii=False),
                    "institutions_country_codes": json.dumps(inst_country_codes, ensure_ascii=False),
                    "institutions_ror": json.dumps(inst_rors, ensure_ascii=False),
                    "from_openalex": True,
                })

        else:
            # fallback: parse from dataset strings
            names = choose_author_list(row)
            affs = parse_semicolon_list(row.get("AuthorAffiliation"))
            # align affs if lengths match, else None
            aligned_affs = affs if (affs and len(affs) == len(names)) else [None] * len(names)

            for pos, (name, aff) in enumerate(zip(names, aligned_affs), start=1):
                if not name:
                    continue
                aid = local_author_id(name, context="|".join([str(conf or ""), str(year or ""), str(pos)]))
                # upsert
                if aid not in authors_map:
                    authors_map[aid] = {
                        "author_id": aid,
                        "openalex_author_id_url": None,
                        "display_name": name,
                        "orcid": None,
                        "name_variants": json.dumps(sorted({name}), ensure_ascii=False),
                        "source": "local",
                    }
                authorships_rows.append({
                    "work_id": work_id,
                    "author_id": aid,
                    "author_position": pos,
                    "author_display_name": name,
                    "affiliation_raw": aff,
                    "institutions_openalex_ids": json.dumps([], ensure_ascii=False),
                    "institutions_names": json.dumps([], ensure_ascii=False),
                    "institutions_country_codes": json.dumps([], ensure_ascii=False),
                    "institutions_ror": json.dumps([], ensure_ascii=False),
                    "from_openalex": False,
                })

            unresolved_rows.append({
                "work_id": work_id,
                "Conference": conf,
                "Year": year,
                "Title": title,
                "doi_normalized": doi_norm,
                "reason": "openalex_not_found_or_no_doi",
            })

    # -----------------------------
    # Build coauthor edges
    # -----------------------------
    # group authorships by work, then create pairwise edges
    authorships_df = pd.DataFrame(authorships_rows)
    edge_counts: Dict[Tuple[str, str], Dict[str, Any]] = {}

    for work_id, g in authorships_df.groupby("work_id"):
        ids = list(g["author_id"].dropna().astype(str))
        ids = [i for i in ids if i]
        ids = sorted(set(ids))
        if len(ids) < 2:
            continue
        for a, b in itertools.combinations(ids, 2):
            key = (a, b)
            if key not in edge_counts:
                edge_counts[key] = {"author_id_1": a, "author_id_2": b, "weight": 0}
            edge_counts[key]["weight"] += 1

    edges_df = pd.DataFrame(list(edge_counts.values())).sort_values(["weight", "author_id_1", "author_id_2"], ascending=[False, True, True])

    # -----------------------------
    # Write outputs
    # -----------------------------
    works_df = pd.DataFrame(works_rows)
    authors_df = pd.DataFrame(list(authors_map.values()))
    unresolved_df = pd.DataFrame(unresolved_rows).drop_duplicates()
    ambiguous_df = pd.DataFrame(ambiguous_rows).drop_duplicates()

    works_path = os.path.join(out_dir, "works.csv")
    authors_path = os.path.join(out_dir, "authors.csv")
    authorships_path = os.path.join(out_dir, "authorships.csv")
    edges_path = os.path.join(out_dir, "coauthor_edges.csv")
    unresolved_path = os.path.join(out_dir, "unresolved_works.csv")
    ambiguous_path = os.path.join(out_dir, "ambiguous_matches.csv")
    report_path = os.path.join(out_dir, "report.json")

    works_df.to_csv(works_path, index=False)
    authors_df.to_csv(authors_path, index=False)
    authorships_df.to_csv(authorships_path, index=False)
    edges_df.to_csv(edges_path, index=False)
    unresolved_df.to_csv(unresolved_path, index=False)
    ambiguous_df.to_csv(ambiguous_path, index=False)

    report = {
        "n_input_works": int(len(df)),
        "n_output_works": int(len(works_df)),
        "n_authors": int(len(authors_df)),
        "n_authorships": int(len(authorships_df)),
        "n_edges": int(len(edges_df)),
        "matched_by_counts": matched_by_counts,
        "share_matched_openalex": float((matched_by_counts["doi"] + matched_by_counts["title_year"]) / max(1, len(df))),
        "unresolved_works_rows": int(len(unresolved_df)),
        "ambiguous_matches_rows": int(len(ambiguous_df)),
        "openalex_cache_dir": cache_dir,
    }
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("\n✅ Done.")
    print(f"- Works:       {works_path}")
    print(f"- Authors:     {authors_path}")
    print(f"- Authorships: {authorships_path}")
    print(f"- Edges:       {edges_path}")
    print(f"- Report:      {report_path}")
    print(f"- Unresolved:  {unresolved_path}")
    print(f"- Ambiguous:   {ambiguous_path}")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
