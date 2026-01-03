/**
 * dataset/plots/conferenceData.js
 * ============================================================================
 * MOCK DATA: Papers by Conference Track
 * 
 * This file contains mock data representing the distribution of papers
 * across different IEEE VIS conference tracks. This will be replaced with 
 * real CSV data.
 * ============================================================================
 */

export const conferenceData = [
  { conference: "InfoVis", count: 1456, color: "#00687A" },
  { conference: "VAST", count: 987, color: "#4B6269" },
  { conference: "SciVis", count: 876, color: "#575C7E" },
  { conference: "VIS (unified)", count: 234, color: "#85D2E7" }
];

/**
 * Conference track descriptions for tooltips
 */
export const conferenceDescriptions = {
  "InfoVis": "Information Visualization - Focus on abstract data visualization",
  "VAST": "Visual Analytics Science and Technology - Analytical reasoning with interactive visual interfaces",
  "SciVis": "Scientific Visualization - Visualization of scientific data and simulations",
  "VIS (unified)": "Unified VIS conference papers (post-2021)"
};
