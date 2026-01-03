/**
 * papers/plots/keywordTrendsData.js
 * Mock data for keyword trends treemap/word cloud
 */

export const keywordTrendsData = {
  name: 'keywords',
  children: [
    { name: 'Machine Learning', value: 342, growth: 85, category: 'technique' },
    { name: 'Deep Learning', value: 285, growth: 120, category: 'technique' },
    { name: 'Visual Analytics', value: 456, growth: 25, category: 'field' },
    { name: 'Uncertainty', value: 234, growth: 45, category: 'concept' },
    { name: 'Network Visualization', value: 312, growth: 15, category: 'field' },
    { name: 'Explainability', value: 178, growth: 95, category: 'concept' },
    { name: 'Immersive', value: 156, growth: 110, category: 'technique' },
    { name: 'Streaming Data', value: 145, growth: 55, category: 'data' },
    { name: 'Time Series', value: 287, growth: 20, category: 'data' },
    { name: 'Geospatial', value: 234, growth: 10, category: 'data' },
    { name: 'Text Visualization', value: 198, growth: 35, category: 'field' },
    { name: 'Interaction', value: 345, growth: 5, category: 'concept' },
    { name: 'Perception', value: 267, growth: -5, category: 'concept' },
    { name: 'Evaluation', value: 312, growth: 30, category: 'method' },
    { name: 'User Studies', value: 289, growth: 40, category: 'method' },
    { name: 'Accessibility', value: 87, growth: 150, category: 'concept' },
    { name: 'LLM/NLP', value: 95, growth: 200, category: 'technique' },
    { name: 'Volume Rendering', value: 178, growth: -15, category: 'technique' },
    { name: 'Flow Visualization', value: 145, growth: -10, category: 'field' },
    { name: 'Biomedical', value: 198, growth: 25, category: 'domain' }
  ]
};

export const categoryColors = {
  technique: '#4285F4',
  field: '#34A853',
  concept: '#FBBC04',
  data: '#EA4335',
  method: '#9C27B0',
  domain: '#00ACC1'
};

export const keywordsByDecade = [
  { decade: '1990s', top: ['Volume Rendering', 'Flow Visualization', 'Scientific Data', 'Isosurface', 'Parallel Coordinates'] },
  { decade: '2000s', top: ['Information Visualization', 'Visual Analytics', 'Network', 'Interaction', 'Tree Visualization'] },
  { decade: '2010s', top: ['Machine Learning', 'Uncertainty', 'Evaluation', 'Big Data', 'Perception'] },
  { decade: '2020s', top: ['Deep Learning', 'Explainability', 'Immersive', 'LLM', 'Accessibility'] }
];
