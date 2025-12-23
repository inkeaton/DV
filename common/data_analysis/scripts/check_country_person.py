import pandas as pd

def split_semicolon_list(x):
    if pd.isna(x):
        return []
    s = str(x).strip()
    if not s:
        return []
    return [p.strip() for p in s.split(";") if p.strip()]

def count_country_chunks(country_extracted):
    """
    Country_Extracted formato: "A ; B ; C" (per-autore)
    Conta i chunk separati da ';' (NON elimina 'None': è comunque un chunk).
    """
    if pd.isna(country_extracted):
        return 0
    s = str(country_extracted).strip()
    if not s:
        return 0
    return len([p.strip() for p in s.split(";") if p.strip()])

if __name__ == "__main__":
    in_file = "../outputs/country_outputs/dataset_with_countries.csv"
    out_file = "../outputs/country_outputs/author_country_count_mismatch.csv"

    df = pd.read_csv(in_file)

    issues = []

    for idx, row in df.iterrows():
        # Conteggi autori
        n_authors = len(split_semicolon_list(row.get("AuthorNames")))
        n_authors_dedup = len(split_semicolon_list(row.get("AuthorNames-Deduped")))

        # Conteggio country chunks
        n_countries = count_country_chunks(row.get("Country_Extracted"))

        # OK se almeno uno dei due matcha
        ok = (n_countries == n_authors) or (n_countries == n_authors_dedup)

        if not ok:
            issues.append({
                "row_index": idx,
                "DOI": row.get("DOI"),
                "Title": row.get("Title"),
                "n_country_chunks": n_countries,
                "n_authors": n_authors,
                "n_authors_dedup": n_authors_dedup,
                "match_AuthorNames": (n_countries == n_authors),
                "match_AuthorNames_Deduped": (n_countries == n_authors_dedup),
                "AuthorNames": row.get("AuthorNames"),
                "AuthorNames-Deduped": row.get("AuthorNames-Deduped"),
                "Country_Extracted": row.get("Country_Extracted"),
                "AuthorAffiliation": row.get("AuthorAffiliation"),
            })

    issues_df = pd.DataFrame(issues)
    issues_df.to_csv(out_file, index=False)

    print(f"Checked rows: {len(df)}")
    print(f"Mismatched rows saved: {len(issues_df)} -> {out_file}")
