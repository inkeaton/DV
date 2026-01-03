// ============================================================================
// DATA TYPES DATA
// Types of data visualized in papers
// ============================================================================

export const dataTypesData = {
  // Data type distribution
  types: [
    { type: "Tabular/Multivariate", count: 1250, icon: "table_chart" },
    { type: "Network/Graph", count: 820, icon: "hub" },
    { type: "Geospatial", count: 680, icon: "map" },
    { type: "Time Series", count: 620, icon: "timeline" },
    { type: "Text/Documents", count: 480, icon: "description" },
    { type: "3D Volumetric", count: 450, icon: "view_in_ar" },
    { type: "Hierarchical", count: 380, icon: "account_tree" },
    { type: "Sets/Collections", count: 220, icon: "join_inner" }
  ],
  
  // Data scale (number of data points)
  dataScale: [
    { scale: "< 100", papers: 320, percentage: 9.1 },
    { scale: "100 - 1K", papers: 680, percentage: 19.4 },
    { scale: "1K - 10K", papers: 920, percentage: 26.3 },
    { scale: "10K - 100K", papers: 780, percentage: 22.3 },
    { scale: "100K - 1M", papers: 520, percentage: 14.9 },
    { scale: "> 1M", papers: 280, percentage: 8.0 }
  ],
  
  // Data complexity trends
  complexityTrends: [
    { year: 1995, avgDimensions: 4, avgRecords: 500 },
    { year: 2000, avgDimensions: 6, avgRecords: 2000 },
    { year: 2005, avgDimensions: 10, avgRecords: 8000 },
    { year: 2010, avgDimensions: 15, avgRecords: 50000 },
    { year: 2015, avgDimensions: 25, avgRecords: 250000 },
    { year: 2020, avgDimensions: 45, avgRecords: 1200000 },
    { year: 2024, avgDimensions: 80, avgRecords: 5000000 }
  ]
};
