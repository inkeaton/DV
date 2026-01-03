/**
 * researcher/plots/emergingFrontsData.js
 * ============================================================================
 * MOCK DATA: Emerging Research Fronts
 * 
 * Shows emerging research areas and their growth trajectories.
 * This will be replaced with real CSV data.
 * ============================================================================
 */

export const emergingFrontsData = [
  { topic: "LLMs for Visualization", growth: 85, papers2024: 28, maturity: 0.2 },
  { topic: "Explainable AI Vis", growth: 72, papers2024: 35, maturity: 0.35 },
  { topic: "Immersive Analytics", growth: 58, papers2024: 42, maturity: 0.45 },
  { topic: "Accessibility in Vis", growth: 52, papers2024: 18, maturity: 0.3 },
  { topic: "Uncertainty Vis", growth: 28, papers2024: 25, maturity: 0.6 },
  { topic: "Narrative Vis", growth: 22, papers2024: 32, maturity: 0.55 },
  { topic: "Network Analysis", growth: 15, papers2024: 45, maturity: 0.75 },
  { topic: "Geo Visualization", growth: 8, papers2024: 38, maturity: 0.8 }
];

/**
 * Research front lifecycle stages
 */
export const lifecycleStages = {
  emerging: { min: 0, max: 0.3, label: "Emerging", color: "#4CAF50" },
  growing: { min: 0.3, max: 0.6, label: "Growing", color: "#FF9800" },
  mature: { min: 0.6, max: 1.0, label: "Mature", color: "#2196F3" }
};

/**
 * Funding trends by topic
 */
export const fundingTrends = [
  { topic: "ML/AI Integration", funding: 85 },
  { topic: "Healthcare Vis", funding: 72 },
  { topic: "Climate/Sustainability", funding: 68 },
  { topic: "Security Analytics", funding: 55 },
  { topic: "Education Tech", funding: 45 }
];
