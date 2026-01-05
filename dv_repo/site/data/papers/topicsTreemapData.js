/**
 * data/papers/topicsTreemapData.js
 * Hierarchical topic distribution for treemap
 */

export const topicsTreemapData = {
  name: "Topics",
  children: [
    {
      name: "Visualization Techniques",
      children: [
        { name: "Graph/Network", value: 485 },
        { name: "Geospatial", value: 342 },
        { name: "Volume Rendering", value: 298 },
        { name: "Flow Visualization", value: 256 },
        { name: "Text Visualization", value: 218 },
        { name: "Multidimensional", value: 195 }
      ]
    },
    {
      name: "Interaction & Systems",
      children: [
        { name: "Visual Analytics", value: 412 },
        { name: "Interaction Design", value: 325 },
        { name: "Immersive Analytics", value: 145 },
        { name: "Collaborative Vis", value: 112 }
      ]
    },
    {
      name: "Evaluation & Perception",
      children: [
        { name: "User Studies", value: 378 },
        { name: "Perception", value: 265 },
        { name: "Visualization Literacy", value: 98 }
      ]
    },
    {
      name: "Data & Applications",
      children: [
        { name: "Scientific Data", value: 356 },
        { name: "Machine Learning", value: 312 },
        { name: "Biomedical", value: 245 },
        { name: "Temporal Data", value: 198 },
        { name: "Uncertainty", value: 165 }
      ]
    },
    {
      name: "Design & Theory",
      children: [
        { name: "Design Studies", value: 285 },
        { name: "Storytelling", value: 156 },
        { name: "Color", value: 125 },
        { name: "Guidelines", value: 98 }
      ]
    }
  ]
};

export const topicColors = {
  "Visualization Techniques": "var(--md-sys-color-primary)",
  "Interaction & Systems": "var(--md-sys-color-secondary)",
  "Evaluation & Perception": "var(--md-sys-color-tertiary)",
  "Data & Applications": "#7c4dff",
  "Design & Theory": "#00bfa5"
};
