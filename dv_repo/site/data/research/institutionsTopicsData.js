/**
 * data/research/institutionsTopicsData.js - Sankey diagram data
 */

export const institutionsTopicsData = {
  "nodes": [
    {
      "id": "Utah",
      "type": "institution",
      "fullName": "University of Utah",
      "totalPapers": 152,
      "region": "North America"
    },
    {
      "id": "UC Davis",
      "type": "institution",
      "fullName": "University of California, Davis",
      "totalPapers": 120,
      "region": "North America"
    },
    {
      "id": "Stony Brook",
      "type": "institution",
      "fullName": "Stony Brook University",
      "totalPapers": 93,
      "region": "North America"
    },
    {
      "id": "Georgia Tech",
      "type": "institution",
      "fullName": "Georgia Institute of Technology",
      "totalPapers": 92,
      "region": "North America"
    },
    {
      "id": "The Ohio State",
      "type": "institution",
      "fullName": "The Ohio State University",
      "totalPapers": 77,
      "region": "North America"
    },
    {
      "id": "UMD",
      "type": "institution",
      "fullName": "University of Maryland, College Park",
      "totalPapers": 68,
      "region": "North America"
    },
    {
      "id": "Purdue",
      "type": "institution",
      "fullName": "Purdue University West Lafayette",
      "totalPapers": 62,
      "region": "North America"
    },
    {
      "id": "LLNL",
      "type": "institution",
      "fullName": "Lawrence Livermore National Laboratory",
      "totalPapers": 61,
      "region": "North America"
    },
    {
      "id": "Harvard",
      "type": "institution",
      "fullName": "Harvard University",
      "totalPapers": 58,
      "region": "North America"
    },
    {
      "id": "Stanford",
      "type": "institution",
      "fullName": "Stanford University",
      "totalPapers": 58,
      "region": "North America"
    },
    {
      "id": "TU Wien",
      "type": "institution",
      "fullName": "TU Wien",
      "totalPapers": 100,
      "region": "Europe"
    },
    {
      "id": "Stuttgart",
      "type": "institution",
      "fullName": "University of Stuttgart",
      "totalPapers": 97,
      "region": "Europe"
    },
    {
      "id": "Konstanz",
      "type": "institution",
      "fullName": "University of Konstanz",
      "totalPapers": 82,
      "region": "Europe"
    },
    {
      "id": "INRIA (FR))",
      "type": "institution",
      "fullName": "Institut national de recherche en informatique et en automatique",
      "totalPapers": 75,
      "region": "Europe"
    },
    {
      "id": "VRVis (AT)",
      "type": "institution",
      "fullName": "VRVis GmbH (Austria)",
      "totalPapers": 74,
      "region": "Europe"
    },
    {
      "id": "TU/e",
      "type": "institution",
      "fullName": "Eindhoven University of Technology",
      "totalPapers": 58,
      "region": "Europe"
    },
    {
      "id": "CNRS (FR)",
      "type": "institution",
      "fullName": "Centre National de la Recherche Scientifique",
      "totalPapers": 53,
      "region": "Europe"
    },
    {
      "id": "HKU",
      "type": "institution",
      "fullName": "University of Hong Kong",
      "totalPapers": 108,
      "region": "Asia"
    },
    {
      "id": "HKUST",
      "type": "institution",
      "fullName": "Hong Kong University of Science and Technology",
      "totalPapers": 106,
      "region": "Asia"
    },
    {
      "id": "ZJU",
      "type": "institution",
      "fullName": "Zhejiang University",
      "totalPapers": 90,
      "region": "Asia"
    },
    {
      "id": "Causality & Temporal Analysis",
      "type": "topic",
      "category": "Causality & Temporal Analysis",
      "totalPapers": 33
    },
    {
      "id": "Geospatial & Seismic Vis",
      "type": "topic",
      "category": "Geospatial & Seismic Vis",
      "totalPapers": 18
    },
    {
      "id": "Graph Visualization & Text Mining",
      "type": "topic",
      "category": "Graph Visualization & Text Mining",
      "totalPapers": 262
    },
    {
      "id": "High-Dimensional Data Analysis",
      "type": "topic",
      "category": "High-Dimensional Data Analysis",
      "totalPapers": 210
    },
    {
      "id": "Imaging & Display Technology",
      "type": "topic",
      "category": "Imaging & Display Technology",
      "totalPapers": 86
    },
    {
      "id": "Molecular Simulation",
      "type": "topic",
      "category": "Molecular Simulation",
      "totalPapers": 24
    },
    {
      "id": "Network Security & Anomaltic",
      "type": "topic",
      "category": "Network Security & Anomaltic",
      "totalPapers": 35
    },
    {
      "id": "Perception & Uncertainty Vis",
      "type": "topic",
      "category": "Perception & Uncertainty Vis",
      "totalPapers": 66
    },
    {
      "id": "Social & Biomedical Analytics",
      "type": "topic",
      "category": "Social & Biomedical Analytics",
      "totalPapers": 80
    },
    {
      "id": "Topological Data Analysis",
      "type": "topic",
      "category": "Topological Data Analysis",
      "totalPapers": 66
    },
    {
      "id": "Visual Programming & ML",
      "type": "topic",
      "category": "Visual Programming & ML",
      "totalPapers": 252
    },
    {
      "id": "Volume Rendering & Immersive Tech",
      "type": "topic",
      "category": "Volume Rendering & Immersive Tech",
      "totalPapers": 542
    }
  ],
  "links": [
    {
      "source": "Stuttgart",
      "target": "Causality & Temporal Analysis",
      "value": 2
    },
    {
      "source": "Stuttgart",
      "target": "Graph Visualization & Text Mining",
      "value": 21
    },
    {
      "source": "Stuttgart",
      "target": "High-Dimensional Data Analysis",
      "value": 12
    },
    {
      "source": "Stuttgart",
      "target": "Imaging & Display Technology",
      "value": 4
    },
    {
      "source": "Stuttgart",
      "target": "Molecular Simulation",
      "value": 4
    },
    {
      "source": "Stuttgart",
      "target": "Perception & Uncertainty Vis",
      "value": 2
    },
    {
      "source": "Stuttgart",
      "target": "Social & Biomedical Analytics",
      "value": 5
    },
    {
      "source": "Stuttgart",
      "target": "Visual Programming & ML",
      "value": 4
    },
    {
      "source": "Stuttgart",
      "target": "Volume Rendering & Immersive Tech",
      "value": 42
    },
    {
      "source": "LLNL",
      "target": "High-Dimensional Data Analysis",
      "value": 2
    },
    {
      "source": "LLNL",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "LLNL",
      "target": "Topological Data Analysis",
      "value": 15
    },
    {
      "source": "LLNL",
      "target": "Visual Programming & ML",
      "value": 18
    },
    {
      "source": "LLNL",
      "target": "Volume Rendering & Immersive Tech",
      "value": 23
    },
    {
      "source": "CNRS (FR)",
      "target": "Graph Visualization & Text Mining",
      "value": 8
    },
    {
      "source": "CNRS (FR)",
      "target": "High-Dimensional Data Analysis",
      "value": 2
    },
    {
      "source": "CNRS (FR)",
      "target": "Molecular Simulation",
      "value": 2
    },
    {
      "source": "CNRS (FR)",
      "target": "Perception & Uncertainty Vis",
      "value": 4
    },
    {
      "source": "CNRS (FR)",
      "target": "Social & Biomedical Analytics",
      "value": 2
    },
    {
      "source": "CNRS (FR)",
      "target": "Topological Data Analysis",
      "value": 10
    },
    {
      "source": "CNRS (FR)",
      "target": "Visual Programming & ML",
      "value": 6
    },
    {
      "source": "CNRS (FR)",
      "target": "Volume Rendering & Immersive Tech",
      "value": 17
    },
    {
      "source": "Georgia Tech",
      "target": "Causality & Temporal Analysis",
      "value": 5
    },
    {
      "source": "Georgia Tech",
      "target": "Graph Visualization & Text Mining",
      "value": 19
    },
    {
      "source": "Georgia Tech",
      "target": "High-Dimensional Data Analysis",
      "value": 11
    },
    {
      "source": "Georgia Tech",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "Georgia Tech",
      "target": "Network Security & Anomaltic",
      "value": 2
    },
    {
      "source": "Georgia Tech",
      "target": "Perception & Uncertainty Vis",
      "value": 5
    },
    {
      "source": "Georgia Tech",
      "target": "Social & Biomedical Analytics",
      "value": 3
    },
    {
      "source": "Georgia Tech",
      "target": "Visual Programming & ML",
      "value": 17
    },
    {
      "source": "Georgia Tech",
      "target": "Volume Rendering & Immersive Tech",
      "value": 24
    },
    {
      "source": "INRIA (FR))",
      "target": "Causality & Temporal Analysis",
      "value": 2
    },
    {
      "source": "INRIA (FR))",
      "target": "Geospatial & Seismic Vis",
      "value": 3
    },
    {
      "source": "INRIA (FR))",
      "target": "Graph Visualization & Text Mining",
      "value": 13
    },
    {
      "source": "INRIA (FR))",
      "target": "High-Dimensional Data Analysis",
      "value": 8
    },
    {
      "source": "INRIA (FR))",
      "target": "Perception & Uncertainty Vis",
      "value": 10
    },
    {
      "source": "INRIA (FR))",
      "target": "Social & Biomedical Analytics",
      "value": 5
    },
    {
      "source": "INRIA (FR))",
      "target": "Visual Programming & ML",
      "value": 5
    },
    {
      "source": "INRIA (FR))",
      "target": "Volume Rendering & Immersive Tech",
      "value": 29
    },
    {
      "source": "VRVis (AT)",
      "target": "Geospatial & Seismic Vis",
      "value": 2
    },
    {
      "source": "VRVis (AT)",
      "target": "High-Dimensional Data Analysis",
      "value": 20
    },
    {
      "source": "VRVis (AT)",
      "target": "Imaging & Display Technology",
      "value": 8
    },
    {
      "source": "VRVis (AT)",
      "target": "Molecular Simulation",
      "value": 3
    },
    {
      "source": "VRVis (AT)",
      "target": "Network Security & Anomaltic",
      "value": 2
    },
    {
      "source": "VRVis (AT)",
      "target": "Perception & Uncertainty Vis",
      "value": 3
    },
    {
      "source": "VRVis (AT)",
      "target": "Social & Biomedical Analytics",
      "value": 3
    },
    {
      "source": "VRVis (AT)",
      "target": "Visual Programming & ML",
      "value": 6
    },
    {
      "source": "VRVis (AT)",
      "target": "Volume Rendering & Immersive Tech",
      "value": 24
    },
    {
      "source": "Harvard",
      "target": "Graph Visualization & Text Mining",
      "value": 10
    },
    {
      "source": "Harvard",
      "target": "High-Dimensional Data Analysis",
      "value": 2
    },
    {
      "source": "Harvard",
      "target": "Imaging & Display Technology",
      "value": 16
    },
    {
      "source": "Harvard",
      "target": "Perception & Uncertainty Vis",
      "value": 2
    },
    {
      "source": "Harvard",
      "target": "Social & Biomedical Analytics",
      "value": 11
    },
    {
      "source": "Harvard",
      "target": "Visual Programming & ML",
      "value": 5
    },
    {
      "source": "Harvard",
      "target": "Volume Rendering & Immersive Tech",
      "value": 10
    },
    {
      "source": "TU Wien",
      "target": "Geospatial & Seismic Vis",
      "value": 3
    },
    {
      "source": "TU Wien",
      "target": "Graph Visualization & Text Mining",
      "value": 5
    },
    {
      "source": "TU Wien",
      "target": "High-Dimensional Data Analysis",
      "value": 12
    },
    {
      "source": "TU Wien",
      "target": "Imaging & Display Technology",
      "value": 5
    },
    {
      "source": "TU Wien",
      "target": "Molecular Simulation",
      "value": 6
    },
    {
      "source": "TU Wien",
      "target": "Network Security & Anomaltic",
      "value": 2
    },
    {
      "source": "TU Wien",
      "target": "Perception & Uncertainty Vis",
      "value": 2
    },
    {
      "source": "TU Wien",
      "target": "Social & Biomedical Analytics",
      "value": 4
    },
    {
      "source": "TU Wien",
      "target": "Visual Programming & ML",
      "value": 9
    },
    {
      "source": "TU Wien",
      "target": "Volume Rendering & Immersive Tech",
      "value": 47
    },
    {
      "source": "Konstanz",
      "target": "Causality & Temporal Analysis",
      "value": 2
    },
    {
      "source": "Konstanz",
      "target": "Graph Visualization & Text Mining",
      "value": 29
    },
    {
      "source": "Konstanz",
      "target": "High-Dimensional Data Analysis",
      "value": 18
    },
    {
      "source": "Konstanz",
      "target": "Imaging & Display Technology",
      "value": 5
    },
    {
      "source": "Konstanz",
      "target": "Network Security & Anomaltic",
      "value": 5
    },
    {
      "source": "Konstanz",
      "target": "Perception & Uncertainty Vis",
      "value": 6
    },
    {
      "source": "Konstanz",
      "target": "Social & Biomedical Analytics",
      "value": 4
    },
    {
      "source": "Konstanz",
      "target": "Visual Programming & ML",
      "value": 7
    },
    {
      "source": "Konstanz",
      "target": "Volume Rendering & Immersive Tech",
      "value": 6
    },
    {
      "source": "HKUST",
      "target": "Graph Visualization & Text Mining",
      "value": 27
    },
    {
      "source": "HKUST",
      "target": "High-Dimensional Data Analysis",
      "value": 12
    },
    {
      "source": "HKUST",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "HKUST",
      "target": "Network Security & Anomaltic",
      "value": 3
    },
    {
      "source": "HKUST",
      "target": "Perception & Uncertainty Vis",
      "value": 3
    },
    {
      "source": "HKUST",
      "target": "Social & Biomedical Analytics",
      "value": 5
    },
    {
      "source": "HKUST",
      "target": "Visual Programming & ML",
      "value": 31
    },
    {
      "source": "HKUST",
      "target": "Volume Rendering & Immersive Tech",
      "value": 21
    },
    {
      "source": "Purdue",
      "target": "Causality & Temporal Analysis",
      "value": 5
    },
    {
      "source": "Purdue",
      "target": "Graph Visualization & Text Mining",
      "value": 6
    },
    {
      "source": "Purdue",
      "target": "High-Dimensional Data Analysis",
      "value": 8
    },
    {
      "source": "Purdue",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "Purdue",
      "target": "Network Security & Anomaltic",
      "value": 3
    },
    {
      "source": "Purdue",
      "target": "Perception & Uncertainty Vis",
      "value": 2
    },
    {
      "source": "Purdue",
      "target": "Social & Biomedical Analytics",
      "value": 7
    },
    {
      "source": "Purdue",
      "target": "Topological Data Analysis",
      "value": 2
    },
    {
      "source": "Purdue",
      "target": "Visual Programming & ML",
      "value": 5
    },
    {
      "source": "Purdue",
      "target": "Volume Rendering & Immersive Tech",
      "value": 21
    },
    {
      "source": "Utah",
      "target": "Geospatial & Seismic Vis",
      "value": 2
    },
    {
      "source": "Utah",
      "target": "Graph Visualization & Text Mining",
      "value": 10
    },
    {
      "source": "Utah",
      "target": "High-Dimensional Data Analysis",
      "value": 20
    },
    {
      "source": "Utah",
      "target": "Imaging & Display Technology",
      "value": 12
    },
    {
      "source": "Utah",
      "target": "Network Security & Anomaltic",
      "value": 2
    },
    {
      "source": "Utah",
      "target": "Perception & Uncertainty Vis",
      "value": 6
    },
    {
      "source": "Utah",
      "target": "Social & Biomedical Analytics",
      "value": 3
    },
    {
      "source": "Utah",
      "target": "Topological Data Analysis",
      "value": 20
    },
    {
      "source": "Utah",
      "target": "Visual Programming & ML",
      "value": 17
    },
    {
      "source": "Utah",
      "target": "Volume Rendering & Immersive Tech",
      "value": 57
    },
    {
      "source": "The Ohio State",
      "target": "Graph Visualization & Text Mining",
      "value": 5
    },
    {
      "source": "The Ohio State",
      "target": "High-Dimensional Data Analysis",
      "value": 16
    },
    {
      "source": "The Ohio State",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "The Ohio State",
      "target": "Network Security & Anomaltic",
      "value": 2
    },
    {
      "source": "The Ohio State",
      "target": "Social & Biomedical Analytics",
      "value": 3
    },
    {
      "source": "The Ohio State",
      "target": "Topological Data Analysis",
      "value": 5
    },
    {
      "source": "The Ohio State",
      "target": "Visual Programming & ML",
      "value": 7
    },
    {
      "source": "The Ohio State",
      "target": "Volume Rendering & Immersive Tech",
      "value": 34
    },
    {
      "source": "Stony Brook",
      "target": "Causality & Temporal Analysis",
      "value": 4
    },
    {
      "source": "Stony Brook",
      "target": "Graph Visualization & Text Mining",
      "value": 7
    },
    {
      "source": "Stony Brook",
      "target": "High-Dimensional Data Analysis",
      "value": 10
    },
    {
      "source": "Stony Brook",
      "target": "Imaging & Display Technology",
      "value": 8
    },
    {
      "source": "Stony Brook",
      "target": "Visual Programming & ML",
      "value": 7
    },
    {
      "source": "Stony Brook",
      "target": "Volume Rendering & Immersive Tech",
      "value": 52
    },
    {
      "source": "UMD",
      "target": "Graph Visualization & Text Mining",
      "value": 14
    },
    {
      "source": "UMD",
      "target": "High-Dimensional Data Analysis",
      "value": 11
    },
    {
      "source": "UMD",
      "target": "Imaging & Display Technology",
      "value": 3
    },
    {
      "source": "UMD",
      "target": "Perception & Uncertainty Vis",
      "value": 4
    },
    {
      "source": "UMD",
      "target": "Social & Biomedical Analytics",
      "value": 5
    },
    {
      "source": "UMD",
      "target": "Visual Programming & ML",
      "value": 5
    },
    {
      "source": "UMD",
      "target": "Volume Rendering & Immersive Tech",
      "value": 22
    },
    {
      "source": "ZJU",
      "target": "Causality & Temporal Analysis",
      "value": 5
    },
    {
      "source": "ZJU",
      "target": "Graph Visualization & Text Mining",
      "value": 29
    },
    {
      "source": "ZJU",
      "target": "High-Dimensional Data Analysis",
      "value": 11
    },
    {
      "source": "ZJU",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "ZJU",
      "target": "Network Security & Anomaltic",
      "value": 3
    },
    {
      "source": "ZJU",
      "target": "Perception & Uncertainty Vis",
      "value": 3
    },
    {
      "source": "ZJU",
      "target": "Social & Biomedical Analytics",
      "value": 4
    },
    {
      "source": "ZJU",
      "target": "Visual Programming & ML",
      "value": 24
    },
    {
      "source": "ZJU",
      "target": "Volume Rendering & Immersive Tech",
      "value": 9
    },
    {
      "source": "TU/e",
      "target": "Graph Visualization & Text Mining",
      "value": 15
    },
    {
      "source": "TU/e",
      "target": "High-Dimensional Data Analysis",
      "value": 9
    },
    {
      "source": "TU/e",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "TU/e",
      "target": "Social & Biomedical Analytics",
      "value": 3
    },
    {
      "source": "TU/e",
      "target": "Visual Programming & ML",
      "value": 11
    },
    {
      "source": "TU/e",
      "target": "Volume Rendering & Immersive Tech",
      "value": 15
    },
    {
      "source": "UC Davis",
      "target": "Geospatial & Seismic Vis",
      "value": 5
    },
    {
      "source": "UC Davis",
      "target": "Graph Visualization & Text Mining",
      "value": 10
    },
    {
      "source": "UC Davis",
      "target": "High-Dimensional Data Analysis",
      "value": 10
    },
    {
      "source": "UC Davis",
      "target": "Imaging & Display Technology",
      "value": 4
    },
    {
      "source": "UC Davis",
      "target": "Network Security & Anomaltic",
      "value": 3
    },
    {
      "source": "UC Davis",
      "target": "Perception & Uncertainty Vis",
      "value": 4
    },
    {
      "source": "UC Davis",
      "target": "Social & Biomedical Analytics",
      "value": 4
    },
    {
      "source": "UC Davis",
      "target": "Topological Data Analysis",
      "value": 8
    },
    {
      "source": "UC Davis",
      "target": "Visual Programming & ML",
      "value": 23
    },
    {
      "source": "UC Davis",
      "target": "Volume Rendering & Immersive Tech",
      "value": 48
    },
    {
      "source": "HKU",
      "target": "Graph Visualization & Text Mining",
      "value": 27
    },
    {
      "source": "HKU",
      "target": "High-Dimensional Data Analysis",
      "value": 12
    },
    {
      "source": "HKU",
      "target": "Imaging & Display Technology",
      "value": 2
    },
    {
      "source": "HKU",
      "target": "Network Security & Anomaltic",
      "value": 3
    },
    {
      "source": "HKU",
      "target": "Perception & Uncertainty Vis",
      "value": 2
    },
    {
      "source": "HKU",
      "target": "Social & Biomedical Analytics",
      "value": 6
    },
    {
      "source": "HKU",
      "target": "Visual Programming & ML",
      "value": 31
    },
    {
      "source": "HKU",
      "target": "Volume Rendering & Immersive Tech",
      "value": 23
    },
    {
      "source": "Stanford",
      "target": "Graph Visualization & Text Mining",
      "value": 6
    },
    {
      "source": "Stanford",
      "target": "High-Dimensional Data Analysis",
      "value": 4
    },
    {
      "source": "Stanford",
      "target": "Imaging & Display Technology",
      "value": 4
    },
    {
      "source": "Stanford",
      "target": "Network Security & Anomaltic",
      "value": 2
    },
    {
      "source": "Stanford",
      "target": "Perception & Uncertainty Vis",
      "value": 5
    },
    {
      "source": "Stanford",
      "target": "Social & Biomedical Analytics",
      "value": 2
    },
    {
      "source": "Stanford",
      "target": "Visual Programming & ML",
      "value": 14
    },
    {
      "source": "Stanford",
      "target": "Volume Rendering & Immersive Tech",
      "value": 18
    }
  ]
};

export const institutionsTopicsStats = {
  "topInstitutions": 20,
  "topTopics": 12,
  "totalConnections": 164,
  "strongestConnection": {
    "institution": "Utah",
    "topic": "Volume Rendering & Immersive Tech",
    "papers": 57
  },
  "presentRegions": [
    "North America",
    "Europe",
    "Asia"
  ]
};

export const topicColors = {
  "High-Dimensional Data Analysis": "#8E24AA",
  "Graph Visualization & Text Mining": "#D32F2F",
  "Volume Rendering & Immersive Tech": "#1E88E5",
  "Visual Programming & ML": "#388E3C",
  "Social & Biomedical Analytics": "#00897B",
  "Imaging & Display Technology": "#FB8C00",
  "Causality & Temporal Analysis": "#C2185B",
  "Perception & Uncertainty Vis": "#5E35B1",
  "Topological Data Analysis": "#F57C00",
  "Network Security & Anomaltic": "#455A64",
  "Geospatial & Seismic Vis": "#6D4C41",
  "Molecular Simulation": "#E91E63"
};

export const regionColors = {
  "North America": "#3b82f6",
  "Europe": "#10b981",
  "Asia": "#f59e0b",
  "Oceania": "#8b5cf6",
  "South America": "#ef4444",
  "Africa": "#ec4899",
  "Other": "#9ca3af"
};
