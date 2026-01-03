/**
 * researcher/plots/collaborationNetworkData.js
 * ============================================================================
 * MOCK DATA: Research Collaboration Networks
 * 
 * Shows collaboration patterns among prolific researchers.
 * This will be replaced with real CSV data.
 * ============================================================================
 */

export const collaborationNetworkData = {
  nodes: [
    { id: "Author A", papers: 45, institution: "University A", country: "US" },
    { id: "Author B", papers: 38, institution: "University B", country: "DE" },
    { id: "Author C", papers: 52, institution: "University C", country: "US" },
    { id: "Author D", papers: 28, institution: "University D", country: "UK" },
    { id: "Author E", papers: 35, institution: "University E", country: "FR" },
    { id: "Author F", papers: 42, institution: "University F", country: "US" },
    { id: "Author G", papers: 31, institution: "University G", country: "CH" },
    { id: "Author H", papers: 25, institution: "University H", country: "AT" },
    { id: "Author I", papers: 48, institution: "University I", country: "US" },
    { id: "Author J", papers: 33, institution: "University J", country: "CN" }
  ],
  links: [
    { source: "Author A", target: "Author C", weight: 12 },
    { source: "Author A", target: "Author F", weight: 8 },
    { source: "Author B", target: "Author D", weight: 6 },
    { source: "Author B", target: "Author G", weight: 5 },
    { source: "Author C", target: "Author I", weight: 15 },
    { source: "Author C", target: "Author F", weight: 7 },
    { source: "Author D", target: "Author E", weight: 4 },
    { source: "Author E", target: "Author G", weight: 6 },
    { source: "Author F", target: "Author I", weight: 9 },
    { source: "Author G", target: "Author H", weight: 8 },
    { source: "Author H", target: "Author B", weight: 3 },
    { source: "Author I", target: "Author J", weight: 5 },
    { source: "Author J", target: "Author A", weight: 4 }
  ]
};

/**
 * Country colors for visualization
 */
export const countryColors = {
  "US": "#3B82F6",
  "DE": "#10B981",
  "UK": "#F59E0B",
  "FR": "#8B5CF6",
  "CH": "#EF4444",
  "AT": "#EC4899",
  "CN": "#6366F1"
};
