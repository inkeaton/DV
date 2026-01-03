/**
 * papers/plots/authorshipData.js
 * Mock data for authorship patterns (authors per paper)
 */

export const authorshipData = [
  { authors: 1, count: 145, percentage: 4.2 },
  { authors: 2, count: 520, percentage: 15.2 },
  { authors: 3, count: 890, percentage: 26.0 },
  { authors: 4, count: 765, percentage: 22.4 },
  { authors: 5, count: 534, percentage: 15.6 },
  { authors: 6, count: 298, percentage: 8.7 },
  { authors: 7, count: 145, percentage: 4.2 },
  { authors: '8+', count: 121, percentage: 3.5 }
];

export const authorshipTrends = [
  { year: 1990, avgAuthors: 2.1 },
  { year: 1995, avgAuthors: 2.4 },
  { year: 2000, avgAuthors: 2.8 },
  { year: 2005, avgAuthors: 3.2 },
  { year: 2010, avgAuthors: 3.6 },
  { year: 2015, avgAuthors: 4.0 },
  { year: 2020, avgAuthors: 4.3 },
  { year: 2024, avgAuthors: 4.6 }
];

export const collaborationTypes = [
  { type: 'Same Institution', percentage: 35, color: '#4285F4' },
  { type: 'Same Country', percentage: 28, color: '#34A853' },
  { type: 'International', percentage: 25, color: '#FBBC04' },
  { type: 'Industry-Academia', percentage: 12, color: '#EA4335' }
];

export const authorshipStats = {
  singleAuthor: 145,
  maxAuthors: 18,
  avgAuthors: 3.8,
  medianAuthors: 4,
  totalPapers: 3418
};
