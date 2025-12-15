#!/usr/bin/env python3
"""Clean `AuthorAffiliation` in `dataset.csv`.

Outputs a *paper-affiliation* table: each paper is duplicated once per unique affiliation.

Design goals:
- High precision for `Country` (prefer null over wrong).
- Canonicalize affiliation names conservatively; keep originals when unsure.
- Optional online enrichment via OpenAlex for top-N missing countries.

Usage examples (PowerShell):
  python .\common\data_analysis\clean_affiliations.py --input .\common\data_analysis\dataset.csv --output .\common\data_analysis\dataset_paper_affiliations_clean.csv

  # Optional: attempt OpenAlex for top 100 missing countries
  python .\common\data_analysis\clean_affiliations.py --input .\common\data_analysis\dataset.csv --output .\common\data_analysis\dataset_paper_affiliations_clean.csv --openalex-top 100
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass
from typing import Dict, Iterable, Iterator, List, Optional, Sequence, Tuple

try:
    import pycountry  # type: ignore
except Exception:  # pragma: no cover
    pycountry = None

try:
    from rapidfuzz import fuzz, process  # type: ignore
except Exception:  # pragma: no cover
    fuzz = None
    process = None

try:
    import requests  # type: ignore
except Exception:  # pragma: no cover
    requests = None


DATA_ANALYSIS_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_AFFILIATION_LIST = os.path.join(DATA_ANALYSIS_DIR, "lista_affiliazioni_completa.csv")
DEFAULT_ALIASES = os.path.join(DATA_ANALYSIS_DIR, "affiliation_aliases.csv")


BOILERPLATE_WITH_RE = re.compile(
    r"\b(?:are|is|was)\s+(?:with|at)\b\s*",
    flags=re.IGNORECASE,
)

WHITESPACE_RE = re.compile(r"\s+")


@dataclass(frozen=True)
class CanonicalMatch:
    canonical: str
    score: Optional[float]
    method: str


def _strip_outer_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and ((value[0] == value[-1] == '"') or (value[0] == value[-1] == "'")):
        return value[1:-1].strip()
    return value


def normalize_unicode_for_matching(value: str) -> str:
    # Keep display text intact elsewhere; use this only for matching keys.
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value


def normalize_key(value: str) -> str:
    value = _strip_outer_quotes(value)
    value = normalize_unicode_for_matching(value)
    value = value.casefold()
    value = value.replace("&", " and ")
    value = re.sub(r"\bdept\.?\b", "department", value)
    value = re.sub(r"\buniv\.?\b", "university", value)
    value = re.sub(r"\blab\.?\b", "laboratory", value)
    value = re.sub(r"\binst\.?\b", "institute", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    value = WHITESPACE_RE.sub(" ", value).strip()
    return value


def clean_affiliation_text(value: str) -> str:
    value = _strip_outer_quotes(value)
    value = WHITESPACE_RE.sub(" ", value.strip())

    # Remove common narrative patterns like: "X and Y are with Harvard University."
    lowered = value.casefold()
    m = BOILERPLATE_WITH_RE.search(lowered)
    if m:
        # Keep the text after the match.
        value = value[m.end() :].strip()

    value = value.strip(" \t\r\n,;.")
    value = WHITESPACE_RE.sub(" ", value)
    return value


def split_semicolon_list(value: str) -> List[str]:
    if value is None:
        return []
    value = value.strip()
    if not value:
        return []
    # Source format uses ';' between authors/affiliations.
    parts = [p.strip() for p in value.split(";")]
    return [p for p in parts if p]


def is_plausible_affiliation(value: str) -> bool:
    if not value:
        return False
    lowered = value.casefold()
    # Filter obvious non-affiliation fragments.
    if lowered in {"na", "n/a", "none"}:
        return False
    # Heuristic: require at least one alphabetic char.
    if not any(ch.isalpha() for ch in value):
        return False
    return True


# High-precision country synonyms (expand as needed).
COUNTRY_SYNONYMS = {
    "u s a": "United States",
    "u s": "United States",
    "usa": "United States",
    "us": "United States",
    "united states": "United States",
    "united states of america": "United States",
    "uk": "United Kingdom",
    "u k": "United Kingdom",
    "united kingdom": "United Kingdom",
    "england": "United Kingdom",
    "scotland": "United Kingdom",
    "wales": "United Kingdom",
    "peoples r china": "China",
    "people s republic of china": "China",
    "pr china": "China",
    "p r china": "China",
    "republic of korea": "South Korea",
    "south korea": "South Korea",
    "korea south": "South Korea",
}

# ISO2 codes that are too ambiguous in affiliations to accept blindly.
AMBIGUOUS_ISO2 = {"CA"}  # could be Canada or California


def _pycountry_lookup(alpha2_or_3: str) -> Optional[str]:
    if pycountry is None:
        return None
    code = alpha2_or_3.strip().upper()
    try:
        if len(code) == 2:
            c = pycountry.countries.get(alpha_2=code)
        elif len(code) == 3:
            c = pycountry.countries.get(alpha_3=code)
        else:
            return None
        return c.name if c else None
    except Exception:
        return None


def extract_country_high_precision(affiliation: str) -> Tuple[Optional[str], str]:
    """Return (country_name, method). Country may be None for high-precision."""
    if not affiliation:
        return None, "empty"

    cleaned = clean_affiliation_text(affiliation)
    # Consider comma-separated tail tokens.
    segments = [s.strip().strip(".") for s in cleaned.split(",") if s.strip()]
    if not segments:
        return None, "no-segments"

    # 1) last segment synonyms
    last_key = normalize_key(segments[-1])
    if last_key in COUNTRY_SYNONYMS:
        return COUNTRY_SYNONYMS[last_key], "synonym:last"

    # 2) last segment looks like ISO2/ISO3
    last_raw = segments[-1].strip().strip(".")
    if re.fullmatch(r"[A-Za-z]{2,3}", last_raw):
        code = last_raw.upper()
        if len(code) == 2 and code in AMBIGUOUS_ISO2:
            return None, "iso2:ambiguous"
        name = _pycountry_lookup(code)
        if name:
            return name, "iso:last"

    # 3) exact country name appears as last segment (pycountry)
    # Only accept if it's the *last* segment to keep precision.
    name_last = None
    if pycountry is not None:
        try:
            c = pycountry.countries.lookup(segments[-1])
            name_last = c.name
        except Exception:
            name_last = None
    if name_last:
        return name_last, "pycountry:last"

    # 4) common explicit tokens anywhere, but only if unambiguous word boundary.
    lowered = normalize_key(cleaned)
    for k, v in COUNTRY_SYNONYMS.items():
        if re.search(rf"\b{re.escape(k)}\b", lowered):
            return v, "synonym:any"

    return None, "unknown"


def maybe_split_on_and(token: str) -> List[str]:
    """Split tokens like "A, USA and B, USA" conservatively."""
    token = token.strip()
    if " and " not in token and " & " not in token:
        return [token]

    # Prefer splitting only on explicit pattern with countries on both sides.
    for sep in [" and ", " & "]:
        if sep not in token:
            continue
        left, right = token.split(sep, 1)
        left = left.strip(" ,.;")
        right = right.strip(" ,.;")
        if not left or not right:
            continue

        c1, _ = extract_country_high_precision(left)
        c2, _ = extract_country_high_precision(right)
        if c1 and c2:
            return [left, right]

    return [token]


def load_affiliation_list(path: str) -> List[str]:
    items: List[str] = []
    if not os.path.exists(path):
        return items
    with open(path, "r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            items.append(_strip_outer_quotes(row[0]).strip())
    return [i for i in items if i]


def load_aliases(path: str) -> Dict[str, str]:
    if not os.path.exists(path):
        return {}
    out: Dict[str, str] = {}
    with open(path, "r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw = (row.get("pattern") or "").strip()
            canonical = (row.get("canonical_affiliation_en") or "").strip()
            if not raw or not canonical:
                continue
            out[normalize_key(raw)] = canonical
    return out


def canonicalize_affiliations(
    unique_affiliations: Sequence[str],
    known_affiliations: Sequence[str],
    aliases: Dict[str, str],
    min_score: float,
) -> Dict[str, CanonicalMatch]:
    """Return mapping from raw-clean string to CanonicalMatch."""
    mapping: Dict[str, CanonicalMatch] = {}

    if process is None or fuzz is None:
        # Fallback: alias-only, else identity.
        for a in unique_affiliations:
            key = normalize_key(a)
            if key in aliases:
                mapping[a] = CanonicalMatch(aliases[key], None, "alias")
            else:
                mapping[a] = CanonicalMatch(a, None, "identity")
        return mapping

    # Build search space on normalized keys.
    known_keys = [normalize_key(k) for k in known_affiliations]
    known_key_to_index: Dict[str, int] = {}
    for idx, k in enumerate(known_keys):
        # Keep first occurrence.
        if k and k not in known_key_to_index:
            known_key_to_index[k] = idx

    for a in unique_affiliations:
        key = normalize_key(a)
        if key in aliases:
            mapping[a] = CanonicalMatch(aliases[key], 100.0, "alias")
            continue

        # Exact match on known keys
        exact_index = known_key_to_index.get(key)
        if exact_index is not None:
            mapping[a] = CanonicalMatch(known_affiliations[exact_index], 100.0, "exact")
            continue

        # Fuzzy match
        match = process.extractOne(
            query=key,
            choices=known_keys,
            scorer=fuzz.token_sort_ratio,
        )
        if match is None:
            mapping[a] = CanonicalMatch(a, None, "identity")
            continue

        matched_key, score, idx = match
        if score >= min_score:
            mapping[a] = CanonicalMatch(known_affiliations[idx], float(score), "fuzzy")
        else:
            mapping[a] = CanonicalMatch(a, float(score), "identity")

    return mapping


def read_dataset_rows(path: str, limit: Optional[int] = None) -> Iterator[Dict[str, str]]:
    with open(path, "r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if limit is not None and i >= limit:
                return
            # Normalize None values
            yield {k: (v if v is not None else "") for k, v in row.items()}


def read_dataset_fieldnames(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader.fieldnames or [])


def write_csv(path: str, fieldnames: Sequence[str], rows: Iterable[Dict[str, str]]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", errors="strict", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def build_paper_affiliation_rows(
    base_row: Dict[str, str],
) -> List[Tuple[str, str]]:
    """Return list of (raw, cleaned) affiliations for a paper."""
    raw_value = base_row.get("AuthorAffiliation", "")
    tokens = split_semicolon_list(raw_value)

    cleaned_tokens: List[str] = []
    for t in tokens:
        t = clean_affiliation_text(t)
        if not is_plausible_affiliation(t):
            continue
        for part in maybe_split_on_and(t):
            part = clean_affiliation_text(part)
            if is_plausible_affiliation(part):
                cleaned_tokens.append(part)

    # Deduplicate within paper conservatively.
    seen: set[str] = set()
    unique: List[str] = []
    for t in cleaned_tokens:
        k = normalize_key(t)
        if not k or k in seen:
            continue
        seen.add(k)
        unique.append(t)

    return [(t, t) for t in unique]


def openalex_country_lookup(name: str, timeout_s: float = 10.0) -> Optional[str]:
    """Return country name from OpenAlex Institutions API if confident, else None."""
    if requests is None:
        return None
    # OpenAlex endpoint: https://api.openalex.org/institutions?search=<query>
    url = "https://api.openalex.org/institutions"
    try:
        resp = requests.get(url, params={"search": name, "per-page": 1}, timeout=timeout_s)
        if resp.status_code != 200:
            return None
        data = resp.json()
        results = data.get("results") or []
        if not results:
            return None
        top = results[0]
        country_code = top.get("country_code")
        display_name = top.get("display_name") or ""
        if not country_code or not isinstance(country_code, str):
            return None

        # Confidence gate: name similarity must be high.
        if fuzz is not None:
            sim = fuzz.token_sort_ratio(normalize_key(name), normalize_key(display_name))
            if sim < 92:
                return None

        country_name = _pycountry_lookup(country_code)
        return country_name
    except Exception:
        return None


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to dataset.csv")
    parser.add_argument("--output", required=True, help="Output CSV path")
    parser.add_argument(
        "--affiliation-list",
        default=DEFAULT_AFFILIATION_LIST,
        help="CSV file with known affiliations (one per line)",
    )
    parser.add_argument(
        "--aliases",
        default=DEFAULT_ALIASES,
        help="CSV file with alias patterns -> canonical english name",
    )
    parser.add_argument("--min-fuzzy-score", type=float, default=95.0)
    parser.add_argument("--limit", type=int, default=None, help="Process only first N papers")
    parser.add_argument(
        "--openalex-top",
        type=int,
        default=0,
        help="If >0, attempt OpenAlex lookup for top-N affiliations missing Country",
    )
    parser.add_argument(
        "--artifacts-dir",
        default=DATA_ANALYSIS_DIR,
        help="Where to write mapping/review artifacts",
    )

    args = parser.parse_args(argv)

    if not os.path.exists(args.input):
        print(f"Input not found: {args.input}", file=sys.stderr)
        return 2

    if args.openalex_top and requests is None:
        print("OpenAlex requested but `requests` not installed; skipping OpenAlex.", file=sys.stderr)
        args.openalex_top = 0

    # Load helpers
    known_affiliations = load_affiliation_list(args.affiliation_list)
    aliases = load_aliases(args.aliases)

    input_fieldnames = read_dataset_fieldnames(args.input)

    # Pass 1: collect unique affiliations + frequency (for OpenAlex top-N)
    unique_affils: List[str] = []
    seen_affils: set[str] = set()
    affil_frequency: Counter[str] = Counter()

    for row in read_dataset_rows(args.input, limit=args.limit):
        affs = build_paper_affiliation_rows(row)
        for _raw, cleaned in affs:
            if cleaned not in seen_affils:
                seen_affils.add(cleaned)
                unique_affils.append(cleaned)
            affil_frequency[cleaned] += 1

    canonical_map = canonicalize_affiliations(
        unique_affiliations=unique_affils,
        known_affiliations=known_affiliations,
        aliases=aliases,
        min_score=float(args.min_fuzzy_score),
    )

    # Build country dictionary (from parsing) and missing counter
    country_by_canonical: Dict[str, str] = {}
    missing_counter: Counter[str] = Counter()

    # Precompute canonical for each unique affil to avoid repeated lookups.
    canonical_for_affil: Dict[str, CanonicalMatch] = {a: canonical_map[a] for a in unique_affils}

    for a, cm in canonical_for_affil.items():
        country, _method = extract_country_high_precision(cm.canonical)
        if country:
            country_by_canonical.setdefault(cm.canonical, country)

    # Optional OpenAlex for top-N missing
    if args.openalex_top > 0:
        for a, cm in canonical_for_affil.items():
            if cm.canonical in country_by_canonical:
                continue
            missing_counter[cm.canonical] += affil_frequency.get(a, 1)

        top_missing = [name for name, _ in missing_counter.most_common(args.openalex_top)]
        for name in top_missing:
            looked = openalex_country_lookup(name)
            if looked:
                country_by_canonical[name] = looked

    # Write artifacts
    os.makedirs(args.artifacts_dir, exist_ok=True)

    mapping_path = os.path.join(args.artifacts_dir, "affiliation_mapping.csv")
    write_csv(
        mapping_path,
        fieldnames=["AuthorAffiliation_clean", "canonical_affiliation_en", "canonical_method", "canonical_match_score"],
        rows=(
            {
                "AuthorAffiliation_clean": a,
                "canonical_affiliation_en": canonical_for_affil[a].canonical,
                "canonical_method": canonical_for_affil[a].method,
                "canonical_match_score": "" if canonical_for_affil[a].score is None else f"{canonical_for_affil[a].score:.1f}",
            }
            for a in sorted(unique_affils)
        ),
    )

    country_dict_path = os.path.join(args.artifacts_dir, "country_dictionary.csv")
    write_csv(
        country_dict_path,
        fieldnames=["canonical_affiliation_en", "Country"],
        rows=(
            {"canonical_affiliation_en": k, "Country": v}
            for k, v in sorted(country_by_canonical.items(), key=lambda kv: kv[0])
        ),
    )

    # Build review list (top 100 missing after all steps)
    missing_final: Counter[str] = Counter()
    for a, cm in canonical_for_affil.items():
        if cm.canonical not in country_by_canonical:
            missing_final[cm.canonical] += 1

    review_path = os.path.join(args.artifacts_dir, "top_100_country_missing.csv")
    write_csv(
        review_path,
        fieldnames=["canonical_affiliation_en", "count"],
        rows=(
            {"canonical_affiliation_en": k, "count": str(v)}
            for k, v in missing_final.most_common(100)
        ),
    )

    # Stream output (Pass 2)
    input_fieldnames = [fn for fn in input_fieldnames if fn and not fn.startswith("__")]
    out_fieldnames = input_fieldnames + [
        "AuthorAffiliation_raw",
        "AuthorAffiliation_clean",
        "canonical_affiliation_en",
        "canonical_method",
        "canonical_match_score",
        "Country",
        "needs_review",
    ]

    def iter_output() -> Iterator[Dict[str, str]]:
        for row in read_dataset_rows(args.input, limit=args.limit):
            affs = build_paper_affiliation_rows(row)
            if not affs:
                continue
            for raw, cleaned in affs:
                cm = canonical_for_affil.get(cleaned)
                if cm is None:
                    cm = CanonicalMatch(cleaned, None, "identity")

                country, _c_method = extract_country_high_precision(cm.canonical)
                if not country:
                    country = country_by_canonical.get(cm.canonical)

                needs_review = "1" if (country is None or (cm.score is not None and cm.score < 97.0)) else "0"

                out = {k: (row.get(k, "") or "") for k in input_fieldnames}
                out.update(
                    {
                        "AuthorAffiliation_raw": raw,
                        "AuthorAffiliation_clean": cleaned,
                        "canonical_affiliation_en": cm.canonical,
                        "canonical_method": cm.method,
                        "canonical_match_score": "" if cm.score is None else f"{cm.score:.1f}",
                        "Country": country or "",
                        "needs_review": needs_review,
                    }
                )
                yield out

    write_csv(args.output, fieldnames=out_fieldnames, rows=iter_output())

    print(f"Wrote: {args.output}")
    print(f"Wrote: {mapping_path}")
    print(f"Wrote: {country_dict_path}")
    print(f"Wrote: {review_path}")

    if args.openalex_top > 0:
        print("Note: OpenAlex lookups were attempted for the top missing affiliations.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
