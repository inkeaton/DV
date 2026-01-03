/**
 * student/plots/topicPopularityData.js
 * ============================================================================
 * MOCK DATA: Topic Popularity for Students
 * 
 * Shows trending and beginner-friendly research topics.
 * This will be replaced with real CSV data.
 * ============================================================================
 */

export const topicPopularityData = [
  { topic: "Machine Learning for Vis", papers: 145, growth: 32, difficulty: "intermediate" },
  { topic: "Interactive Dashboards", papers: 234, growth: 18, difficulty: "beginner" },
  { topic: "Network Visualization", papers: 189, growth: 12, difficulty: "intermediate" },
  { topic: "Storytelling with Data", papers: 156, growth: 28, difficulty: "beginner" },
  { topic: "Immersive Analytics", papers: 87, growth: 45, difficulty: "advanced" },
  { topic: "Uncertainty Visualization", papers: 112, growth: 15, difficulty: "advanced" },
  { topic: "Visual Analytics Systems", papers: 278, growth: 8, difficulty: "intermediate" },
  { topic: "Color & Perception", papers: 134, growth: 5, difficulty: "beginner" },
  { topic: "Text Visualization", papers: 98, growth: 22, difficulty: "intermediate" },
  { topic: "Geospatial Visualization", papers: 176, growth: 10, difficulty: "beginner" }
];

export const difficultyColors = {
  beginner: "#4CAF50",    // Green - accessible
  intermediate: "#FF9800", // Orange - moderate
  advanced: "#F44336"      // Red - challenging
};
