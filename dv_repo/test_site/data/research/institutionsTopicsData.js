/**
 * data/research/institutionsTopicsData.js
 * Sankey diagram data connecting top 10 institutions to research topics
 */

export const institutionsTopicsData = {
  nodes: [
    // Institution nodes (left side)
    { id: 'Harvard University', type: 'institution', region: 'North America' },
    { id: 'MIT', type: 'institution', region: 'North America' },
    { id: 'Stanford University', type: 'institution', region: 'North America' },
    { id: 'University of Washington', type: 'institution', region: 'North America' },
    { id: 'ETH Zurich', type: 'institution', region: 'Europe' },
    { id: 'TU Wien', type: 'institution', region: 'Europe' },
    { id: 'University of Groningen', type: 'institution', region: 'Europe' },
    { id: 'Tsinghua University', type: 'institution', region: 'Asia' },
    { id: 'Zhejiang University', type: 'institution', region: 'Asia' },
    { id: 'HKUST', type: 'institution', region: 'Asia' },

    // Topic nodes (right side)
    { id: 'Information Visualization', type: 'topic', category: 'InfoVis' },
    { id: 'Scientific Visualization', type: 'topic', category: 'SciVis' },
    { id: 'Visual Analytics', type: 'topic', category: 'VAST' },
    { id: 'Graph & Network Visualization', type: 'topic', category: 'InfoVis' },
    { id: 'Machine Learning Visualization', type: 'topic', category: 'VAST' },
    { id: 'Biological Data Visualization', type: 'topic', category: 'SciVis' },
    { id: 'Immersive Analytics', type: 'topic', category: 'VAST' },
    { id: 'Text & Document Visualization', type: 'topic', category: 'InfoVis' }
  ],
  
  links: [
    // Harvard University
    { source: 'Harvard University', target: 'Information Visualization', value: 45 },
    { source: 'Harvard University', target: 'Visual Analytics', value: 38 },
    { source: 'Harvard University', target: 'Graph & Network Visualization', value: 32 },
    { source: 'Harvard University', target: 'Machine Learning Visualization', value: 25 },
    { source: 'Harvard University', target: 'Biological Data Visualization', value: 16 },

    // MIT
    { source: 'MIT', target: 'Information Visualization', value: 42 },
    { source: 'MIT', target: 'Machine Learning Visualization', value: 35 },
    { source: 'MIT', target: 'Graph & Network Visualization', value: 28 },
    { source: 'MIT', target: 'Visual Analytics', value: 26 },
    { source: 'MIT', target: 'Immersive Analytics', value: 17 },

    // Stanford University
    { source: 'Stanford University', target: 'Information Visualization', value: 48 },
    { source: 'Stanford University', target: 'Machine Learning Visualization', value: 42 },
    { source: 'Stanford University', target: 'Visual Analytics', value: 32 },
    { source: 'Stanford University', target: 'Graph & Network Visualization', value: 20 },

    // University of Washington
    { source: 'University of Washington', target: 'Information Visualization', value: 52 },
    { source: 'University of Washington', target: 'Visual Analytics', value: 38 },
    { source: 'University of Washington', target: 'Machine Learning Visualization', value: 28 },
    { source: 'University of Washington', target: 'Text & Document Visualization', value: 17 },

    // ETH Zurich
    { source: 'ETH Zurich', target: 'Scientific Visualization', value: 45 },
    { source: 'ETH Zurich', target: 'Information Visualization', value: 38 },
    { source: 'ETH Zurich', target: 'Visual Analytics', value: 32 },
    { source: 'ETH Zurich', target: 'Immersive Analytics', value: 23 },

    // TU Wien
    { source: 'TU Wien', target: 'Scientific Visualization', value: 48 },
    { source: 'TU Wien', target: 'Visual Analytics', value: 35 },
    { source: 'TU Wien', target: 'Information Visualization', value: 28 },
    { source: 'TU Wien', target: 'Biological Data Visualization', value: 17 },

    // University of Groningen
    { source: 'University of Groningen', target: 'Scientific Visualization', value: 42 },
    { source: 'University of Groningen', target: 'Information Visualization', value: 35 },
    { source: 'University of Groningen', target: 'Biological Data Visualization', value: 22 },
    { source: 'University of Groningen', target: 'Visual Analytics', value: 16 },

    // Tsinghua University
    { source: 'Tsinghua University', target: 'Visual Analytics', value: 45 },
    { source: 'Tsinghua University', target: 'Information Visualization', value: 38 },
    { source: 'Tsinghua University', target: 'Machine Learning Visualization', value: 25 },
    { source: 'Tsinghua University', target: 'Graph & Network Visualization', value: 17 },

    // Zhejiang University
    { source: 'Zhejiang University', target: 'Visual Analytics', value: 42 },
    { source: 'Zhejiang University', target: 'Machine Learning Visualization', value: 35 },
    { source: 'Zhejiang University', target: 'Information Visualization', value: 28 },
    { source: 'Zhejiang University', target: 'Graph & Network Visualization', value: 13 },

    // HKUST
    { source: 'HKUST', target: 'Visual Analytics', value: 38 },
    { source: 'HKUST', target: 'Information Visualization', value: 32 },
    { source: 'HKUST', target: 'Machine Learning Visualization', value: 22 },
    { source: 'HKUST', target: 'Text & Document Visualization', value: 16 }
  ]
};

export const institutionsTopicsStats = {
  topInstitutions: 10,
  topTopics: 8,
  totalConnections: 43,
  strongestConnection: { institution: 'University of Washington', topic: 'Information Visualization', papers: 52 },
  institutionSpecializations: {
    'InfoVis Leaders': ['Stanford', 'University of Washington', 'Harvard'],
    'SciVis Leaders': ['TU Wien', 'ETH Zurich', 'University of Groningen'],
    'VAST Leaders': ['Tsinghua', 'Zhejiang', 'Harvard']
  }
};

export const topicColors = {
  'InfoVis': '#3b82f6',
  'SciVis': '#10b981',
  'VAST': '#f59e0b'
};
