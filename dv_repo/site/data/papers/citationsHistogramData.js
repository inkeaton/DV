/**
 * data/papers/citationsHistogramData.js
 * Citation count distribution for histogram
 */

// Raw citation counts (sample of papers)
export const citationsHistogramData = [
  // 0-10 citations (many papers)
  0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5,
  6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10,
  // 10-25 citations
  11, 12, 12, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  12, 14, 16, 18, 20, 22, 24, 15, 17, 19, 21, 23,
  // 25-50 citations
  26, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50,
  27, 29, 33, 36, 39, 43, 47,
  30, 35, 40, 45, 50,
  // 50-100 citations
  52, 55, 58, 62, 65, 70, 75, 80, 85, 90, 95, 100,
  55, 60, 68, 72, 78, 88,
  // 100-200 citations (fewer papers)
  105, 112, 120, 135, 150, 165, 180, 195,
  110, 125, 145, 170,
  // 200-500 citations (rare)
  210, 235, 260, 290, 320, 380, 450,
  225, 275, 350,
  // 500+ citations (very rare, highly influential)
  520, 680, 850, 1200, 1850, 2400
];

export const citationStats = {
  median: 18,
  mean: 45.2,
  max: 2400,
  papersWith100Plus: 28,
  papersWith500Plus: 6
};

// Bin configuration for histogram
export const histogramBins = {
  thresholds: [0, 10, 25, 50, 100, 200, 500, 1000, 3000],
  labels: ['0-10', '10-25', '25-50', '50-100', '100-200', '200-500', '500-1000', '1000+']
};
