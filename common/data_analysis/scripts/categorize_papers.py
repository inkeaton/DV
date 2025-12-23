# pip install -U pandas numpy bertopic sentence-transformers scikit-learn umap-learn hdbscan
# BERTopic

import re
from pathlib import Path

import numpy as np
import pandas as pd
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer

# Optional (nicer topic labels). If this import fails, just remove it and keep BERTopic defaults.
try:
    from bertopic.representation import KeyBERTInspired
    HAS_KEYBERT_REPR = True
except Exception:
    HAS_KEYBERT_REPR = False


def clean_text(x) -> str:
    if pd.isna(x):
        return ""
    s = str(x)
    s = s.replace("\r", " ").replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def build_document(row: pd.Series) -> str:
    # Use the most informative fields you have
    title = clean_text(row.get("Title", ""))
    abstract = clean_text(row.get("Abstract", ""))
    keywords = clean_text(row.get("AuthorKeywords", ""))

    parts = [p for p in [title, abstract, keywords] if p]
    return " . ".join(parts)


def run_bertopic(
    input_csv: str = "dataset.csv",
    output_dir: str = "topic_outputs",
    nr_topics: int | None = None,      # e.g. 30 to force ~30 categories; None = automatic
    min_topic_size: int = 15,
    language: str = "english",         # use "multilingual" if your papers are mixed-language
) -> None:
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Robust CSV reading (abstracts contain commas/quotes)
    df = pd.read_csv(
        input_csv,
        engine="c",                 # default, fastest
        encoding="utf-8",
        encoding_errors="replace",
    )

    # Optional de-duplication
    if "DOI" in df.columns:
        df = df.drop_duplicates(subset=["DOI"], keep="first").reset_index(drop=True)

    docs = df.apply(build_document, axis=1).tolist()

    # Embeddings
    if language == "multilingual":
        embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    else:
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    # Better topic words by using bigrams + stopwords
    vectorizer_model = CountVectorizer(
        stop_words="english" if language == "english" else None,
        ngram_range=(1, 2),
        min_df=2,
    )

    representation_model = KeyBERTInspired() if HAS_KEYBERT_REPR else None

    topic_model = BERTopic(
        embedding_model=embedding_model,
        vectorizer_model=vectorizer_model,
        representation_model=representation_model,
        min_topic_size=min_topic_size,
        calculate_probabilities=True,
        language=language,
        verbose=True,
    )

    topics, probs = topic_model.fit_transform(docs)

    # If you want a fixed-ish number of “categories”, reduce after fitting
    if nr_topics is not None:
        # Updates the model in-place (topics/probabilities stored on the model)
        topic_model.reduce_topics(docs, nr_topics=nr_topics)
        topics = topic_model.topics_

    # Document-level results (merges topic info into your dataframe)
    # Includes: Topic, Name, Top_n_words, Probability, Representative_document, etc.
    doc_info = topic_model.get_document_info(docs, df=df)

    # Create a simple category label column
    # (doc_info["Name"] is typically a readable topic label)
    doc_info["Category"] = doc_info["Name"]

    doc_info.to_csv(out_dir / "papers_categorized.csv", index=False)

    # Topic-level summary
    topic_info = topic_model.get_topic_info()
    topic_info.to_csv(out_dir / "topic_summary.csv", index=False)

    # Optional interactive visualizations
    try:
        topic_model.visualize_topics().write_html(str(out_dir / "topics_overview.html"))
        topic_model.visualize_barchart(top_n_topics=20).write_html(str(out_dir / "topics_barchart.html"))
    except Exception as e:
        print("Could not write HTML visualizations:", e)

    print(f"Saved:\n- {out_dir/'papers_categorized.csv'}\n- {out_dir/'topic_summary.csv'}")


if __name__ == "__main__":
    run_bertopic(
        input_csv="dataset.csv",
        output_dir="topic_outputs",
        nr_topics=30,       # change to None to let it pick automatically
        min_topic_size=15,
        language="english",
    )
