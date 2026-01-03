// ============================================================================
// RESEARCH TOPICS DATA
// Topic distribution and evolution over time
// ============================================================================

export const topicsData = {
  // Main research areas
  mainAreas: [
    { topic: "Information Visualization", papers: 980, percentage: 28.0 },
    { topic: "Scientific Visualization", papers: 720, percentage: 20.6 },
    { topic: "Visual Analytics", papers: 650, percentage: 18.6 },
    { topic: "Interaction Techniques", papers: 420, percentage: 12.0 },
    { topic: "Evaluation Studies", papers: 380, percentage: 10.9 },
    { topic: "Systems & Toolkits", papers: 350, percentage: 10.0 }
  ],
  
  // Topic evolution by decade
  evolution: [
    { decade: "1990s", scivis: 65, infovis: 25, va: 5, other: 5 },
    { decade: "2000s", scivis: 45, infovis: 35, va: 12, other: 8 },
    { decade: "2010s", scivis: 30, infovis: 35, va: 25, other: 10 },
    { decade: "2020s", scivis: 22, infovis: 32, va: 35, other: 11 }
  ],
  
  // Emerging vs declining topics
  trends: [
    { topic: "Machine Learning for Vis", trend: 245, direction: "up" },
    { topic: "Explainable AI", trend: 180, direction: "up" },
    { topic: "Immersive Analytics", trend: 165, direction: "up" },
    { topic: "Accessibility", trend: 142, direction: "up" },
    { topic: "Data Storytelling", trend: 128, direction: "up" },
    { topic: "Volume Rendering", trend: -45, direction: "down" },
    { topic: "Flow Visualization", trend: -38, direction: "down" },
    { topic: "Terrain Rendering", trend: -52, direction: "down" }
  ]
};
