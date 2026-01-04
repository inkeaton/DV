/**
 * data/papers/awardsData.js
 * Award counts by type for pictogram bar chart
 */

export const awardsData = [
  { type: 'Best Paper', count: 85, icon: '🏆' },
  { type: 'Honorable Mention', count: 245, icon: '🎖️' },
  { type: 'Best Case Study', count: 42, icon: '📊' },
  { type: 'Test of Time', count: 35, icon: '⏰' }
];

export const awardStats = {
  total: 407,
  percentageAwarded: 6.7 // percentage of total papers that received awards
};

// For pictogram: each cell represents N papers
export const pictogramCellValue = 5;
