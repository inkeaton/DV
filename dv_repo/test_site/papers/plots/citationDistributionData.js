/**
 * papers/plots/citationDistributionData.js
 * Mock data for citation distribution histogram
 */

export const citationDistributionData = [
  { range: '0-5', count: 520, label: '0-5 citations' },
  { range: '6-10', count: 680, label: '6-10 citations' },
  { range: '11-20', count: 750, label: '11-20 citations' },
  { range: '21-50', count: 620, label: '21-50 citations' },
  { range: '51-100', count: 380, label: '51-100 citations' },
  { range: '101-200', count: 220, label: '101-200 citations' },
  { range: '201-500', count: 145, label: '201-500 citations' },
  { range: '501-1000', count: 68, label: '501-1000 citations' },
  { range: '1000+', count: 35, label: '1000+ citations' }
];

export const citationStats = {
  median: 24,
  mean: 67,
  max: 4523,
  percentile90: 142,
  totalPapers: 3418
};

export const topCitedPapers = [
  { title: 'D3: Data-Driven Documents', citations: 4523, year: 2011 },
  { title: 'A Survey of Visualization Pipelines', citations: 2845, year: 2006 },
  { title: 'The Value of Visualization', citations: 2234, year: 2004 },
  { title: 'Graphical Perception and Methods', citations: 1987, year: 2010 },
  { title: 'Visual Analytics: Definition and Challenges', citations: 1756, year: 2005 }
];
