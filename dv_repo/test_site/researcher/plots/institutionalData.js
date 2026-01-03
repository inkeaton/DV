/**
 * researcher/plots/institutionalData.js
 * ============================================================================
 * MOCK DATA: Institutional Research Output
 * 
 * Shows research output by institution for identifying collaboration partners.
 * This will be replaced with real CSV data.
 * ============================================================================
 */

export const institutionalData = [
  { institution: "University of Washington", papers: 156, citations: 12450, country: "US", focus: ["Visual Analytics", "ML for Vis"] },
  { institution: "Georgia Tech", papers: 134, citations: 9870, country: "US", focus: ["Information Vis", "Perception"] },
  { institution: "MIT", papers: 98, citations: 8920, country: "US", focus: ["Visual Analytics", "Interaction"] },
  { institution: "University of Stuttgart", papers: 87, citations: 6540, country: "DE", focus: ["Scientific Vis", "Volume Rendering"] },
  { institution: "ETH Zurich", papers: 82, citations: 7230, country: "CH", focus: ["Visual Analytics", "Uncertainty"] },
  { institution: "TU Vienna", papers: 78, citations: 5890, country: "AT", focus: ["Scientific Vis", "Flow Vis"] },
  { institution: "University of Utah", papers: 75, citations: 6120, country: "US", focus: ["Scientific Vis", "Volume Rendering"] },
  { institution: "INRIA", papers: 72, citations: 5670, country: "FR", focus: ["Information Vis", "Graph Vis"] },
  { institution: "University of Maryland", papers: 68, citations: 5430, country: "US", focus: ["Visual Analytics", "HCIL"] },
  { institution: "Tsinghua University", papers: 65, citations: 4890, country: "CN", focus: ["Visual Analytics", "ML for Vis"] }
];

/**
 * Research focus areas distribution
 */
export const focusAreaDistribution = [
  { area: "Visual Analytics", count: 45 },
  { area: "Scientific Vis", count: 32 },
  { area: "Information Vis", count: 28 },
  { area: "ML for Vis", count: 22 },
  { area: "Perception", count: 18 },
  { area: "Interaction", count: 15 }
];
