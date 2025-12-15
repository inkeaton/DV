# Affiliation cleaning

This folder contains a reproducible script to clean the `AuthorAffiliation` column in `dataset.csv`.

## What it produces

- `dataset_paper_affiliations_clean.csv`: one row per *(paper, affiliation)*.
- `affiliation_mapping.csv`: mapping from cleaned affiliation token to `canonical_affiliation_en`.
- `country_dictionary.csv`: mapping from `canonical_affiliation_en` to `Country` (high-precision; may be empty).
- `top_100_country_missing.csv`: most frequent affiliations still missing a country.

## Install (Windows)

Install Python 3.11+ and then:

```powershell
python -m pip install -r .\common\data_analysis\requirements.txt
```

## Run

```powershell
python .\common\data_analysis\clean_affiliations.py --input .\common\data_analysis\dataset.csv --output .\common\data_analysis\dataset_paper_affiliations_clean.csv
```

Optional online enrichment (top 100 missing countries) via OpenAlex:

```powershell
python .\common\data_analysis\clean_affiliations.py --input .\common\data_analysis\dataset.csv --output .\common\data_analysis\dataset_paper_affiliations_clean.csv --openalex-top 100
```

## Customizing canonical English names

Edit `affiliation_aliases.csv` to force specific translations/normalizations (exact-match on a normalized key).

Example:

- `Technische Universität München` -> `Technical University of Munich`

## Notes

- `Country` extraction is conservative: it prefers empty over wrong.
- If you need higher coverage, start from `top_100_country_missing.csv` and add more aliases or dictionary entries.
