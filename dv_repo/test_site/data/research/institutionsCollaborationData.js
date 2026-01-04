/**
 * data/research/institutionsCollaborationData.js
 * Chord diagram data for inter-institutional collaborations
 */

export const institutionsCollaborationData = {
  // Institution names (order matches matrix rows/columns)
  institutions: [
    'Harvard',
    'MIT',
    'Stanford',
    'UW',
    'ETH',
    'TU Wien',
    'Groningen',
    'Tsinghua',
    'Zhejiang',
    'HKUST',
    'Oxford',
    'UCL',
    'TU Munich',
    'Toronto',
    'Sydney'
  ],

  // Region grouping for hierarchical bundling
  institutionRegions: [
    'North America', // Harvard
    'North America', // MIT
    'North America', // Stanford
    'North America', // UW
    'Europe',        // ETH
    'Europe',        // TU Wien
    'Europe',        // Groningen
    'Asia',          // Tsinghua
    'Asia',          // Zhejiang
    'Asia',          // HKUST
    'Europe',        // Oxford
    'Europe',        // UCL
    'Europe',        // TU Munich
    'North America', // Toronto
    'Oceania'        // Sydney
  ],

  // Collaboration matrix (symmetric, diagonal = 0)
  // Number represents collaborative papers between institutions
  matrix: [
    // H   M   S   W   E   T   G   Ts  Z   H   O   U   Tu  To  Sy
    [  0, 28, 22, 18, 12,  8,  6,  5,  4,  3,  9,  7,  4,  15,  2], // Harvard
    [ 28,  0, 25, 20, 10,  6,  5,  7,  6,  4,  8,  9,  5,  12,  3], // MIT
    [ 22, 25,  0, 24,  8,  5,  4,  6,  5,  3,  7,  6,  3,  10,  4], // Stanford
    [ 18, 20, 24,  0,  6,  4,  7,  5,  4,  2,  5,  4,  2,  16,  5], // UW
    [ 12, 10,  8,  6,  0, 22, 18,  4,  3,  2, 15, 12, 20,   8,  6], // ETH
    [  8,  6,  5,  4, 22,  0, 16,  3,  2,  2, 12, 10, 18,   5,  4], // TU Wien
    [  6,  5,  4,  7, 18, 16,  0,  2,  2,  1, 14, 13, 15,   6,  3], // Groningen
    [  5,  7,  6,  5,  4,  3,  2,  0, 24, 20,  3,  4,  2,   4,  6], // Tsinghua
    [  4,  6,  5,  4,  3,  2,  2, 24,  0, 18,  2,  3,  2,   3,  5], // Zhejiang
    [  3,  4,  3,  2,  2,  2,  1, 20, 18,  0,  2,  2,  1,   2,  7], // HKUST
    [  9,  8,  7,  5, 15, 12, 14,  3,  2,  2,  0, 16, 14,   7,  5], // Oxford
    [  7,  9,  6,  4, 12, 10, 13,  4,  3,  2, 16,  0, 12,   6,  4], // UCL
    [  4,  5,  3,  2, 20, 18, 15,  2,  2,  1, 14, 12,  0,   4,  3], // TU Munich
    [ 15, 12, 10, 16,  8,  5,  6,  4,  3,  2,  7,  6,  4,   0,  8], // Toronto
    [  2,  3,  4,  5,  6,  4,  3,  6,  5,  7,  5,  4,  3,   8,  0]  // Sydney
  ]
};

export const institutionsCollaborationStats = {
  totalInstitutions: 15,
  totalCollaborations: 561, // Sum of upper triangle
  avgCollaborationsPerInstitution: 37.4,
  strongestPair: { inst1: 'Harvard', inst2: 'MIT', papers: 28 },
  regionalClusters: {
    'North America': ['Harvard', 'MIT', 'Stanford', 'UW', 'Toronto'],
    'Europe': ['ETH', 'TU Wien', 'Groningen', 'Oxford', 'UCL', 'TU Munich'],
    'Asia': ['Tsinghua', 'Zhejiang', 'HKUST'],
    'Oceania': ['Sydney']
  },
  crossRegionalRate: 0.32 // 32% of collaborations cross regional boundaries
};

export const regionColorsChord = {
  'North America': '#3b82f6',
  'Europe': '#10b981',
  'Asia': '#f59e0b',
  'Oceania': '#8b5cf6'
};
