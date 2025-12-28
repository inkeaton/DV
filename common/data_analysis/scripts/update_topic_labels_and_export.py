#!/usr/bin/env python3
"""
Update topic_summary.csv with human-friendly labels and
export a labeled papers dataset with selected columns.

Inputs:
  ../outputs/topic_outputs/topic_summary.csv
  ../outputs/topic_outputs/papers_categorized.csv

Outputs:
  (overwrites) ../outputs/topic_outputs/topic_summary.csv
  (creates)    ../outputs/topic_outputs/papers_categorized_selected.csv
"""

from __future__ import annotations

from pathlib import Path
import pandas as pd

# --- Your label mapping (Topic -> (ShortLabel, DisplayLabel, MacroCategory)) ---
TOPIC_LABELS = {
    -1: ("Metadata & Interop", "Visualization Metadata & Information Interoperability", "Metadata, Standards & Infrastructure"),
     0: ("Isosurfaces & Volume Rendering", "Isosurface Extraction & Direct Volume Rendering (Meshes)", "Core Visualization Techniques"),
     1: ("Multivariate Plots", "Multivariate Projection, Scatterplots & Parallel Coordinates", "Data Representations & Multivariate Views"),
     2: ("Bar Charts & Perception", "Bar Charts, Readability & Graphical Perception", "Perception, Design & Evaluation"),
     3: ("Natural Language + Infographics", "Natural Language Interfaces for Infographics & Sensemaking", "AI for Vis & Text/Topics"),
     4: ("Flow Visualization", "Flow / Vector Field Visualization (CFD, Vortices, Tracing)", "Core Visualization Techniques"),
     5: ("Graph Layouts", "Network Visualization: Node-Link Diagrams & Graph Layout", "Graphs & Networks"),
     6: ("Event Sequences", "Temporal Event Sequence Mining & Visual Analytics", "Visual Analytics & Sensemaking"),
     7: ("Topic Modeling & Text", "Text Mining: Topic Modeling, Summarization & Evolution", "AI for Vis & Text/Topics"),
     8: ("Urban GeoVis", "Geovisualization & Cartography for Cities / Urban Data", "Earth/Geo/Weather/Urban"),
     9: ("Vascular Visualization", "Blood Vessels & Blood Flow Visualization (Medical Volume Rendering)", "Bio & Medicine"),
    10: ("Deep Learning Vis", "Visual Analytics for Deep Neural Networks", "AI for Vis & Text/Topics"),
    11: ("Treemaps", "Hierarchical Data Visualization with Treemaps", "Data Representations & Multivariate Views"),
    12: ("Haptics & 4D", "Immersive Haptics & 3D/4D Interaction", "Interaction & Immersive Systems"),
    13: ("Weather Forecasting", "Weather Forecast Visualization (Ensembles & Uncertainty)", "Earth/Geo/Weather/Urban"),
    14: ("Topological Methods", "Computational Topology: Contour Trees & Morse–Smale", "Core Visualization Techniques"),
    15: ("Microscopy & Cells", "Biomedical Imaging: Microscopy, Cells & Segmentation", "Bio & Medicine"),
    16: ("Molecular Dynamics", "Molecular Modeling & Molecular Dynamics Visualization", "Physical Sciences & Engineering"),
    17: ("Code & Performance", "Software / Compiler / Profiling Visualization Tools", "Physical Sciences & Engineering"),
    18: ("Color Maps", "Colormaps, Color Mapping & Color Perception", "Perception, Design & Evaluation"),
    19: ("DTI & Tractography", "Diffusion MRI / DTI Tractography Visualization", "Bio & Medicine"),
    20: ("Wavelets & Compression", "Wavelets, Multiresolution & (Lossless) Compression", "Core Visualization Techniques"),
    21: ("Tensor Field Topology", "Tensor Fields & Tensor Topology (2D/3D)", "Core Visualization Techniques"),
    22: ("Astro & Relativity", "Astrophysics / Cosmology Visualization & Relativistic Rendering", "Physical Sciences & Engineering"),
    23: ("Sports Analytics", "Sports Analytics: Tactics, Tracking & Video-Time Data", "Visual Analytics & Sensemaking"),
    24: ("Genomics", "Genomics & Gene Expression Visual Analytics", "Bio & Medicine"),
    25: ("Spatial Context (Video/AV)", "Situation Awareness: Spatial Context + Video / Autonomous Driving", "Visual Analytics & Sensemaking"),
    26: ("Data Storytelling", "Narrative Visualization & Data-Driven Storytelling", "Visual Analytics & Sensemaking"),
    27: ("Geo/Seismic Volumes", "Illustrative Volume Rendering for Geoscience / Seismic Data", "Earth/Geo/Weather/Urban"),
    28: ("Multi-Projector Displays", "Immersive / Tiled Displays & Multi-Projector Calibration", "Interaction & Immersive Systems"),
}


def _lower_col_map(df: pd.DataFrame) -> dict[str, str]:
    return {c.lower(): c for c in df.columns}


def find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """Find a column by trying exact match, then case-insensitive match."""
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = _lower_col_map(df)
    for c in candidates:
        key = c.lower()
        if key in lower_map:
            return lower_map[key]
    return None


def require_topic_column(df: pd.DataFrame) -> str:
    topic_col = find_column(df, ["Topic", "topic", "topic_id", "TopicID", "topicid"])
    if topic_col is None:
        raise ValueError(f"Could not find a Topic column in: {list(df.columns)}")
    return topic_col


def build_labels_df(topic_col_name: str = "Topic") -> pd.DataFrame:
    labels = pd.DataFrame(
        [
            {"Topic": int(k), "ShortLabel": v[0], "DisplayLabel": v[1], "MacroCategory": v[2]}
            for k, v in TOPIC_LABELS.items()
        ]
    ).astype({"Topic": "int64"})
    if topic_col_name != "Topic":
        labels = labels.rename(columns={"Topic": topic_col_name})
    return labels


def update_topic_summary(topic_summary_path: Path) -> None:
    df = pd.read_csv(topic_summary_path)
    topic_col = require_topic_column(df)

    # Drop existing columns if present (avoid duplicate merge suffixes)
    for col in ["ShortLabel", "DisplayLabel", "MacroCategory"]:
        existing = find_column(df, [col])
        if existing is not None:
            df = df.drop(columns=[existing])

    labels_df = build_labels_df(topic_col_name=topic_col)

    df[topic_col] = pd.to_numeric(df[topic_col], errors="coerce").astype("Int64")
    out = df.merge(labels_df, how="left", on=topic_col)

    out.to_csv(topic_summary_path, index=False)
    print(f"[OK] Updated: {topic_summary_path}")


def export_selected_papers(papers_path: Path, out_path: Path) -> None:
    df = pd.read_csv(papers_path)
    topic_col = require_topic_column(df)

    labels_df = build_labels_df(topic_col_name=topic_col)

    df[topic_col] = pd.to_numeric(df[topic_col], errors="coerce").astype("Int64")

    # IMPORTANT: merge ShortLabel + MacroCategory (you use both later)
    merged = df.merge(
        labels_df[[topic_col, "ShortLabel", "MacroCategory"]],
        how="left",
        on=topic_col
    )

    targets: list[tuple[str, list[str]]] = [
        ("MacroCategory", ["MacroCategory"]),
        ("ShortLabel", ["ShortLabel"]),
        ("Conference", ["Conference", "Venue", "conference", "venue", "Track", "track"]),
        ("Year", ["Year", "year", "PublicationYear", "publication_year"]),
        ("Title", ["Title", "title", "PaperTitle", "paper_title"]),
        ("DOI", ["DOI", "doi"]),
        ("PaperType", ["PaperType", "Paper Type", "paper_type", "Type"]),
        ("Abstract", ["Abstract", "abstract"]),
        ("Award", ["Award", "award", "BestPaper", "Best Paper", "best_paper"]),
        ("AuthorKeywords", ["AuthorKeywords", "Author Keywords", "author_keywords", "Keywords", "keywords"]),
        ("AuthorNames-Deduped", ["AuthorNames-Deduped", "AuthorNames_Deduped", "AuthorNamesDeduped", "authornames_deduped"]),
        ("AuthorNames", ["AuthorNames", "author_names", "Authors", "authors"]),
    ]

    out = pd.DataFrame()
    missing: list[str] = []

    for target_name, candidates in targets:
        col = find_column(merged, candidates)
        if col is None:
            missing.append(target_name)
            out[target_name] = pd.NA
        else:
            out[target_name] = merged[col]

    out.to_csv(out_path, index=False)
    print(f"[OK] Created: {out_path}")
    if missing:
        print("[WARN] These columns were not found in papers_categorized.csv and were filled with NA:")
        print("       " + ", ".join(missing))


def main() -> None:
    base = Path(__file__).resolve().parent
    topic_dir = (base / "../outputs/topic_outputs").resolve()

    topic_summary_path = topic_dir / "topic_summary.csv"
    papers_path = topic_dir / "papers_categorized.csv"
    out_papers_path = topic_dir / "papers_categorized_selected.csv"

    if not topic_summary_path.exists():
        raise FileNotFoundError(f"Missing file: {topic_summary_path}")
    if not papers_path.exists():
        raise FileNotFoundError(f"Missing file: {papers_path}")

    update_topic_summary(topic_summary_path)
    export_selected_papers(papers_path, out_papers_path)


if __name__ == "__main__":
    main()
