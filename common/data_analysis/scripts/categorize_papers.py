# pip install -U pandas numpy bertopic sentence-transformers scikit-learn umap-learn hdbscan
# BERTopic

import re
from pathlib import Path

import numpy as np
import pandas as pd

from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS

from umap import UMAP
from hdbscan import HDBSCAN

# Optional nicer labels (if available)
try:
    from bertopic.representation import KeyBERTInspired, MaximalMarginalRelevance
    HAS_REPR = True
except Exception:
    HAS_REPR = False

try:
    from bertopic.vectorizers import ClassTfidfTransformer
    HAS_CTFIDF = True
except Exception:
    HAS_CTFIDF = False


def clean_text(x) -> str:
    if pd.isna(x):
        return ""
    s = str(x).replace("\r", " ").replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def build_document(row: pd.Series) -> str:
    title = clean_text(row.get("Title", ""))
    abstract = clean_text(row.get("Abstract", ""))
    keywords = clean_text(row.get("AuthorKeywords", ""))
    parts = [p for p in [title, abstract, keywords] if p]
    return " . ".join(parts)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def run_bertopic_better(
    input_csv: str = "../dataset_original/dataset.csv",
    output_dir: str = "../outputs/topic_outputs",
    nr_topics: int | None = 30,
    min_topic_size: int = 15,
    language: str = "english",
) -> None:
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_csv, encoding="utf-8", encoding_errors="replace")

    if "DOI" in df.columns:
        df = df.drop_duplicates(subset=["DOI"], keep="first").reset_index(drop=True)

    docs = df.apply(build_document, axis=1).tolist()

    # Drop empty docs (these inflate -1)
    keep = [i for i, d in enumerate(docs) if len(d) >= 30]
    df = df.iloc[keep].reset_index(drop=True)
    docs = [docs[i] for i in keep]

    # Better embeddings (more accurate than MiniLM; slower but worth it)
    # If speed matters, switch back to "all-MiniLM-L6-v2"
    embedding_model = SentenceTransformer("all-mpnet-base-v2")

    # Domain stopwords to improve interpretability
    domain_stop = {
        "visualization", "visualizations", "visualize", "visualizing", "visual",
        "analytics", "analysis", "approach", "method", "methods", "technique",
        "system", "framework", "model", "models", "data", "dataset", "datasets",
        "interactive", "interaction", "user", "users", "paper", "results",
        "using", "based", "task", "tasks", "provide", "propose", "present",
    }
    stop_words = set(ENGLISH_STOP_WORDS).union(domain_stop)

    vectorizer_model = CountVectorizer(
        stop_words=list(stop_words) if language == "english" else None,
        ngram_range=(1, 3),
        min_df=3,
        max_df=0.6,
    )

    # Optional: better c-TF-IDF weighting
    ctfidf_model = None
    if HAS_CTFIDF:
        ctfidf_model = ClassTfidfTransformer(bm25_weighting=True, reduce_frequent_words=True)

    # Better manifold + clustering for text corpora
    umap_model = UMAP(
        n_neighbors=25,
        n_components=5,
        min_dist=0.0,
        metric="cosine",
        random_state=42,
    )

    hdbscan_model = HDBSCAN(
        min_cluster_size=min_topic_size,
        min_samples=max(2, min_topic_size // 3),
        metric="euclidean",
        cluster_selection_method="eom",
        prediction_data=True,
    )

    # Topic representation / labeling
    representation_model = None
    if HAS_REPR:
        representation_model = [
            KeyBERTInspired(),
            MaximalMarginalRelevance(diversity=0.4),
        ]

    topic_model = BERTopic(
        embedding_model=embedding_model,
        umap_model=umap_model,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer_model,
        ctfidf_model=ctfidf_model,
        representation_model=representation_model,
        min_topic_size=min_topic_size,
        calculate_probabilities=True,
        language=language,
        verbose=True,
    )

    topics, probs = topic_model.fit_transform(docs)

    # Re-assign many -1 outliers into existing topics (huge improvement usually)
    try:
        topics = topic_model.reduce_outliers(docs, topics, probabilities=probs, threshold=0.05)
        topic_model.update_topics(docs, topics=topics, vectorizer_model=vectorizer_model,
                                  representation_model=representation_model)
    except Exception as e:
        print("Outlier reduction skipped:", e)

    # Optional: force a target number of topics after fitting
    if nr_topics is not None:
        topic_model.reduce_topics(docs, nr_topics=nr_topics)
        topics = topic_model.topics_

    # Generate readable labels
    # (Fallback: if method not available in your BERTopic version, we build manually below)
    try:
        labels = topic_model.generate_topic_labels(nr_words=4, topic_prefix=False, separator=" • ")
        # Some versions support setting labels on the model; safe if available:
        try:
            topic_model.set_topic_labels(labels)
        except Exception:
            pass
    except Exception:
        labels = None

    topic_info = topic_model.get_topic_info()

    # Build a label map even if set_topic_labels isn't supported
    if labels is not None:
        # topic_info.Topic is aligned with labels order in generate_topic_labels in recent versions,
        # but to be safe we map by index of topic_info rows.
        # We'll create a map using the Topic column.
        label_map = dict(zip(topic_info["Topic"].tolist(), labels))
    else:
        # Simple manual label from top words
        label_map = {}
        for t in topic_info["Topic"].tolist():
            if t == -1:
                label_map[t] = "Other / Mixed"
                continue
            words = [w for (w, _) in topic_model.get_topic(t)[:6]]
            label_map[t] = " • ".join(words[:4])

    # Document-level outputs
    doc_info = topic_model.get_document_info(docs, df=df)
    doc_info["Category"] = doc_info["Topic"].map(label_map)
    doc_info["CategorySlug"] = doc_info["Category"].map(slugify)

    doc_info.to_csv(out_dir / "papers_categorized.csv", index=False)
    topic_info.assign(Category=topic_info["Topic"].map(label_map)).to_csv(out_dir / "topic_summary.csv", index=False)

    # Web-friendly bubble chart (Plotly HTML)
    try:
        import plotly.express as px

        # 2D coordinates for topic bubbles
        non_out = topic_info[topic_info.Topic != -1].copy()
        topic_emb = topic_model.topic_embeddings_[non_out.Topic.values]
        umap2 = UMAP(n_neighbors=20, n_components=2, metric="cosine", random_state=42)
        xy = umap2.fit_transform(topic_emb)

        plot_df = pd.DataFrame({
            "x": xy[:, 0],
            "y": xy[:, 1],
            "Topic": non_out["Topic"].values,
            "Count": non_out["Count"].values,
            "Category": non_out["Topic"].map(label_map).values,
        })

        fig = px.scatter(
            plot_df, x="x", y="y",
            size="Count",
            hover_name="Category",
            hover_data={"Topic": True, "Count": True, "x": False, "y": False},
        )
        fig.write_html(str(out_dir / "topic_bubble_map.html"), include_plotlyjs="cdn")
    except Exception as e:
        print("Could not write bubble map HTML:", e)

    # Keep BERTopic's own visuals too
    try:
        topic_model.visualize_topics().write_html(str(out_dir / "topics_overview.html"))
        topic_model.visualize_barchart(top_n_topics=20).write_html(str(out_dir / "topics_barchart.html"))
    except Exception as e:
        print("Could not write BERTopic HTML visualizations:", e)

    print(f"Saved in: {out_dir.resolve()}")


if __name__ == "__main__":
    run_bertopic_better(
        input_csv="../dataset_original/dataset.csv",
        output_dir="../outputs/topic_outputs",
        nr_topics=30,
        min_topic_size=15,
        language="english",
    )
# Topic,ShortLabel,DisplayLabel
# -1,Metadata & Interop,Visualization Metadata & Information Interoperability
# 0,Isosurfaces & Volume Rendering,Isosurface Extraction & Direct Volume Rendering (Meshes)
# 1,Multivariate Plots,Multivariate Projection, Scatterplots & Parallel Coordinates
# 2,Bar Charts & Perception,Bar Charts, Readability & Graphical Perception
# 3,Natural Language + Infographics,Natural Language Interfaces for Infographics & Sensemaking
# 4,Flow Visualization,Flow / Vector Field Visualization (CFD, Vortices, Tracing)
# 5,Graph Layouts,Network Visualization: Node-Link Diagrams & Graph Layout
# 6,Event Sequences,Temporal Event Sequence Mining & Visual Analytics
# 7,Topic Modeling & Text,Text Mining: Topic Modeling, Summarization & Evolution
# 8,Urban GeoVis,Geovisualization & Cartography for Cities / Urban Data
# 9,Vascular Visualization,Blood Vessels & Blood Flow Visualization (Medical Volume Rendering)
# 10,Deep Learning Vis,Visual Analytics for Deep Neural Networks
# 11,Treemaps,Hierarchical Data Visualization with Treemaps
# 12,Haptics & 4D,Immersive Haptics & 3D/4D Interaction
# 13,Weather Forecasting,Weather Forecast Visualization (Ensembles & Uncertainty)
# 14,Topological Methods,Computational Topology: Contour Trees & Morse–Smale
# 15,Microscopy & Cells,Biomedical Imaging: Microscopy, Cells & Segmentation
# 16,Molecular Dynamics,Molecular Modeling & Molecular Dynamics Visualization
# 17,Code & Performance,Software / Compiler / Profiling Visualization Tools
# 18,Color Maps,Colormaps, Color Mapping & Color Perception
# 19,DTI & Tractography,Diffusion MRI / DTI Tractography Visualization
# 20,Wavelets & Compression,Wavelets, Multiresolution & (Lossless) Compression
# 21,Tensor Field Topology,Tensor Fields & Tensor Topology (2D/3D)
# 22,Astro & Relativity,Astrophysics / Cosmology Visualization & Relativistic Rendering
# 23,Sports Analytics,Sports Analytics: Tactics, Tracking & Video-Time Data
# 24,Genomics,Genomics & Gene Expression Visual Analytics
# 25,Spatial Context (Video/AV),Situation Awareness: Spatial Context + Video / Autonomous Driving
# 26,Data Storytelling,Narrative Visualization & Data-Driven Storytelling
# 27,Geo/Seismic Volumes,Illustrative Volume Rendering for Geoscience / Seismic Data
# 28,Multi-Projector Displays,Immersive / Tiled Displays & Multi-Projector Calibration

