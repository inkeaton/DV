# VIS 35: Data Visualization Project 📊✨

## 🔁 Reproducibility & Project Overview

This project explores **35 years of data visualization research** using **interactive web-based storytelling**.  
✅ The codebase is fully open and reproducible, with all preprocessing and data transformation steps documented in **Jupyter notebooks**.

---

## 1. 🧹 Data Preprocessing Pipeline

🗂️ All preprocessing scripts are in the `scripts/` folder and are Jupyter notebooks. Run them **in order** for full reproducibility:

### Step 1: 🧼 Dataset Cleaning
- **Notebook:** `scripts/1_dataset_clean.ipynb`
- **Input:** `data/raw/vispubdata_1990_2024.csv`
- **Output:** `data/processed/dataset_clean.csv`

### Step 2: 🧠 Topic Clustering (BERTopic)
- **Notebook:** `scripts/2_BERTopic_clustering.ipynb`
- **Input:** `data/processed/dataset_clean.csv`
- **Outputs:**
  - `data/processed/dataset_with_clusters.csv`
  - `data/processed/topic_macro_mapping.csv`
  - `data/processed/topic_macro_mapping_renamed.csv`

### Step 3: 🌐 OpenAlex Data Enrichment
- **Notebook:** `scripts/3_openalex_pipeline.ipynb`
- **Input:** `data/processed/dataset_with_clusters.csv`
- **Outputs:** (in `data/processed/outputs/openalex_notebook_outputs/tables/`)
  - `works_enriched.csv`, `authors.csv`, `authorships.csv`, `institutions.csv`, `coauthor_edges.csv`, `institution_edges.csv`, and aggregated tables

### Step 4: 🧩 Data for Visualizations
- **Notebooks:**
  - `scripts/web_papers.ipynb` → generates JS data modules for Papers section
  - `scripts/web_authors.ipynb` → generates JS data modules for Authors section
  - `scripts/web_research.ipynb` → generates JS data modules for Research section
- **Outputs:** (in `site/data/`)
  - `site/data/papers/`, `site/data/authors/`, `site/data/research/`

#### ▶️ To run preprocessing
1. 📦 Install dependencies (see below)
2. 🧪 Open each notebook in order and run all cells
3. 📁 Generated data will be placed in the appropriate folders for the website

---

## 2. 🚀 Serving/Building the Website Locally

🧱 The website is a **static site** (no build step required). To preview locally:

### Option 1: 🐍 Python HTTP Server
From the `site/` directory, run:

```sh
cd site
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser 🌍

### Option 2: 🧰 VS Code Live Server Extension
✨ You can use the **Live Server** extension to serve the `site/` folder:
- Marketplace: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

---

## 3. 🗺️ Folder Structure & Data Locations

```
DV/
├── .github/
│   └── workflows/                          # GitHub Actions workflows (build/deploy/CI)
├── data/
│   ├── raw/                                # Raw input data (e.g., vispubdata_1990_2024.csv)
│   └── processed/                          # Cleaned/enriched data + outputs from notebooks
│       └── outputs/
│           └── openalex_notebook_outputs/
│               ├── cache_openalex_institutions/  # Cached OpenAlex API responses (institutions)
│               ├── cache_openalex_works/         # Cached OpenAlex API responses (works)
│               └── tables/                       # Final CSVs for web data generation
├── scripts/                                # Jupyter notebooks for all preprocessing steps
├── site/
│   ├── index.html                           # Homepage
│   ├── assets/                              # Shared CSS, JS, images
│   ├── data/                                # JS data modules for visualizations
│   │   ├── authors/
│   │   ├── papers/
│   │   └── research/
│   ├── authors/                             # Authors section (HTML + plots)
│   ├── papers/                              # Papers section (HTML + plots)
│   ├── research/                            # Research section (HTML + plots)
│   ├── dataset/                             # Dataset exploration page
│   └── methodology/                         # Methodology page
├── .gitignore
├── CODEBASE_STRUCTURE.txt
├── LICENSE
├── README.md
└── requirements.txt

```

### 📌 Where does the data for visualizations live?
✅ **All data used by the website's visualizations is in `site/data/`**
- `site/data/papers/` — data for Papers section plots 📄  
- `site/data/authors/` — data for Authors section plots 👤  
- `site/data/research/` — data for Research section plots 🔬  

---

## 4. 📦 Dependencies

🛠️ To run preprocessing notebooks, install dependencies:

```sh
pip install -r requirements.txt
```

### Key packages
- pandas, numpy
- bertopic
- sentence-transformers (requires PyTorch)
- scikit-learn
- umap-learn
- hdbscan
- requests
- tqdm
🧪

### Notes
- **PyTorch**: `sentence-transformers` depends on PyTorch. If `pip` cannot install a suitable wheel for your OS/CPU/GPU,
  install PyTorch first following the official instructions, then re-run the command above.
- **hdbscan** includes native extensions. On some systems you may need build tools (e.g., a C/C++ compiler). 

---

## 5. 📝 Additional Notes

- 🔎 For exploratory analysis, see `scripts/eda.ipynb`.
- 🧱 For details on code structure, see `CODEBASE_STRUCTURE.txt`.
- ✅ The site is static and does **not** require Node.js or a build step.

---

## 📄 License

See the `LICENSE` file for licensing details.  
Copyright (c) 2026 Edoardo Vassallo and Iryna Savchuk.

---

## 📬 Contact

For questions, contact the project maintainers.
