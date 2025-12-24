import os, json, time, hashlib
import pandas as pd
import requests
import numpy as np
from sklearn.cluster import DBSCAN

BASE = "../outputs/openalex_outputs"
MAILTO = "4847306@studenti.unige.it"  # usa la tua mail per polite pool
CACHE_DIR = os.path.join(BASE, "cache_openalex_institutions")
os.makedirs(CACHE_DIR, exist_ok=True)

def cache_path(key: str) -> str:
    h = hashlib.sha1(key.encode("utf-8")).hexdigest()
    return os.path.join(CACHE_DIR, f"{h}.json")

def get_institution(inst_id: str) -> dict | None:
    # inst_id: "I123..." oppure URL "https://openalex.org/I123..."
    inst_id = str(inst_id).replace("https://openalex.org/", "").strip()
    if not inst_id.startswith("I"):
        return None

    key = f"institution::{inst_id}"
    cp = cache_path(key)
    if os.path.exists(cp):
        with open(cp, "r", encoding="utf-8") as f:
            return json.load(f)

    url = f"https://api.openalex.org/institutions/{inst_id}"
    params = {"mailto": MAILTO} if MAILTO else {}
    for attempt in range(4):
        try:
            r = requests.get(url, params=params, timeout=30)
            if r.status_code == 200:
                data = r.json()
                with open(cp, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False)
                return data
            if r.status_code == 429:
                time.sleep(1.0 * (attempt + 1))
                continue
            if r.status_code == 404:
                return None
            time.sleep(0.5 * (attempt + 1))
        except Exception:
            time.sleep(0.5 * (attempt + 1))
    return None

def loads_list(x):
    if pd.isna(x) or x is None:
        return []
    try:
        v = json.loads(x)
        return v if isinstance(v, list) else []
    except Exception:
        return []

# 1) carica authorships
authorships = pd.read_csv(os.path.join(BASE, "authorships.csv"))

# 2) estrai tutti gli institution ids (I....)
authorships["inst_ids"] = authorships["institutions_openalex_ids"].apply(loads_list)
all_inst_ids = sorted({i for lst in authorships["inst_ids"] for i in lst if isinstance(i, str) and i.startswith("I")})
print("Unique institutions:", len(all_inst_ids))

# 3) fetch + build institutions_geo.csv
rows = []
for inst_id in all_inst_ids:
    inst = get_institution(inst_id)
    if not inst:
        continue
    geo = inst.get("geo") or {}
    rows.append({
        "institution_id": inst_id,
        "display_name": inst.get("display_name"),
        "ror": inst.get("ror"),
        "country_code": inst.get("country_code"),
        "city": geo.get("city"),
        "region": geo.get("region"),
        "latitude": geo.get("latitude"),
        "longitude": geo.get("longitude"),
    })

institutions_geo = pd.DataFrame(rows).drop_duplicates(subset=["institution_id"])
institutions_geo.to_csv(os.path.join(BASE, "institutions_geo.csv"), index=False)
print("Wrote:", os.path.join(BASE, "institutions_geo.csv"))

# 4) crea una tabella long: (author_id, institution_id) e scegli "primary" per autore
long = authorships[["author_id", "work_id", "inst_ids"]].explode("inst_ids").rename(columns={"inst_ids": "institution_id"})
long = long[long["institution_id"].notna()]

# contare quante volte autore appare con una istituzione
counts = (long.groupby(["author_id", "institution_id"]).size()
          .reset_index(name="n_papers_with_inst"))

# primary = istituzione più frequente
primary = counts.sort_values(["author_id", "n_papers_with_inst"], ascending=[True, False]).drop_duplicates("author_id")

# merge lat/lon
author_geo = primary.merge(institutions_geo, on="institution_id", how="left")
author_geo.to_csv(os.path.join(BASE, "author_primary_geo.csv"), index=False)
print("Wrote:", os.path.join(BASE, "author_primary_geo.csv"))

print("Authors with primary lat/lon:",
      author_geo["latitude"].notna().sum(), "/", len(author_geo))
#------------------------------------------------------------------------------

# 5) clustering DBSCAN sugli autori con lat/lon
author_geo = pd.read_csv(os.path.join(BASE, "author_primary_geo.csv"))
g = author_geo.dropna(subset=["latitude", "longitude"]).copy()

# DBSCAN con distanza Haversine (serve radianti)
coords = np.radians(g[["latitude", "longitude"]].to_numpy())

# eps ~ 200km: 200 / 6371
eps_km = 200
db = DBSCAN(eps=eps_km/6371.0, min_samples=5, metric="haversine")
g["geo_cluster"] = db.fit_predict(coords)

g.to_csv(os.path.join(BASE, "author_geo_clusters.csv"), index=False)
print("Wrote:", os.path.join(BASE, "author_geo_clusters.csv"))
print("N clusters (escluso -1 noise):", (g["geo_cluster"] >= 0).nunique())
