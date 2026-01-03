/**
 * student/plots/collaborationData.js
 * ============================================================================
 * MOCK DATA: Collaboration Patterns for Students
 * 
 * Shows typical collaboration patterns to help students understand
 * how research teams are structured in visualization.
 * This will be replaced with real CSV data.
 * ============================================================================
 */

export const collaborationData = {
  nodes: [
    { id: "Student A", type: "student", papers: 3 },
    { id: "Advisor 1", type: "advisor", papers: 45 },
    { id: "PostDoc 1", type: "postdoc", papers: 18 },
    { id: "Student B", type: "student", papers: 2 },
    { id: "Student C", type: "student", papers: 4 },
    { id: "Advisor 2", type: "advisor", papers: 38 },
    { id: "Industry", type: "industry", papers: 12 },
    { id: "PostDoc 2", type: "postdoc", papers: 15 }
  ],
  links: [
    { source: "Student A", target: "Advisor 1", weight: 3 },
    { source: "Student B", target: "Advisor 1", weight: 2 },
    { source: "PostDoc 1", target: "Advisor 1", weight: 8 },
    { source: "Student C", target: "Advisor 2", weight: 4 },
    { source: "PostDoc 2", target: "Advisor 2", weight: 6 },
    { source: "Advisor 1", target: "Advisor 2", weight: 5 },
    { source: "Industry", target: "Advisor 1", weight: 3 },
    { source: "Student A", target: "PostDoc 1", weight: 2 }
  ]
};

/**
 * Statistics about typical paper authorship
 */
export const authorshipStats = {
  averageAuthors: 3.8,
  soloAuthorPercent: 5.2,
  studentFirstAuthor: 68.5,
  internationalCollabs: 32.1
};

export const nodeColors = {
  student: "#4CAF50",
  advisor: "#2196F3",
  postdoc: "#FF9800",
  industry: "#9C27B0"
};
