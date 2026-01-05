/**
 * data/authors/authorMetricsData.js
 * Author metrics for bubble scatter chart
 * X-axis: number of papers, Y-axis: citations, Bubble size: awards
 */

export const authorMetricsData = [
  { name: 'Hanspeter Pfister', papers: 156, citations: 12450, awards: 8, category: 'prolific' },
  { name: 'Tamara Munzner', papers: 142, citations: 11230, awards: 7, category: 'prolific' },
  { name: 'Daniel Keim', papers: 138, citations: 10850, awards: 6, category: 'prolific' },
  { name: 'Jeffrey Heer', papers: 108, citations: 15680, awards: 9, category: 'highly-cited' },
  { name: 'Ben Shneiderman', papers: 105, citations: 18920, awards: 12, category: 'highly-cited' },
  { name: 'Min Chen', papers: 125, citations: 9240, awards: 5, category: 'prolific' },
  { name: 'Chris North', papers: 118, citations: 8650, awards: 4, category: 'prolific' },
  { name: 'Jean-Daniel Fekete', papers: 112, citations: 9820, awards: 6, category: 'prolific' },
  { name: 'Martin Wattenberg', papers: 42, citations: 14250, awards: 8, category: 'highly-cited' },
  { name: 'Fernanda Viégas', papers: 38, citations: 13890, awards: 7, category: 'highly-cited' },
  { name: 'Claudio Silva', papers: 95, citations: 8450, awards: 5, category: 'prolific' },
  { name: 'Jarke van Wijk', papers: 98, citations: 10120, awards: 7, category: 'prolific' },
  { name: 'Bernd Hamann', papers: 92, citations: 7250, awards: 3, category: 'steady' },
  { name: 'Kwan-Liu Ma', papers: 88, citations: 7850, awards: 4, category: 'steady' },
  { name: 'Alexandru Telea', papers: 85, citations: 6920, awards: 3, category: 'steady' },
  { name: 'Michael Sedlmair', papers: 82, citations: 5680, awards: 5, category: 'steady' },
  { name: 'Niklas Elmqvist', papers: 78, citations: 6240, awards: 4, category: 'steady' },
  { name: 'John Stasko', papers: 75, citations: 8920, awards: 5, category: 'steady' },
  { name: 'Robert Laramee', papers: 72, citations: 5850, awards: 2, category: 'steady' },
  { name: 'Torsten Möller', papers: 68, citations: 6450, awards: 3, category: 'steady' },
  { name: 'Shixia Liu', papers: 42, citations: 4820, awards: 4, category: 'emerging' },
  { name: 'Yingcai Wu', papers: 38, citations: 3950, awards: 3, category: 'emerging' },
  { name: 'Huamin Qu', papers: 45, citations: 4650, awards: 4, category: 'emerging' },
  { name: 'Nathalie Henry Riche', papers: 38, citations: 4120, awards: 3, category: 'emerging' },
  { name: 'Steven Drucker', papers: 35, citations: 5280, awards: 4, category: 'emerging' },
  { name: 'Miriah Meyer', papers: 32, citations: 3680, awards: 3, category: 'emerging' },
  { name: 'Michael Gleicher', papers: 48, citations: 5920, awards: 4, category: 'steady' },
  { name: 'Christopher Collins', papers: 42, citations: 4250, awards: 2, category: 'emerging' },
  { name: 'David Laidlaw', papers: 65, citations: 6120, awards: 3, category: 'steady' },
  { name: 'Penny Rheingans', papers: 62, citations: 5480, awards: 2, category: 'steady' },
  { name: 'Klaus Mueller', papers: 58, citations: 5850, awards: 3, category: 'steady' },
  { name: 'Georges Grinstein', papers: 55, citations: 6420, awards: 4, category: 'steady' },
  { name: 'Pak Chung Wong', papers: 52, citations: 5120, awards: 2, category: 'steady' },
  { name: 'Daniel Weiskopf', papers: 48, citations: 4850, awards: 3, category: 'steady' },
  { name: 'Hans Hagen', papers: 45, citations: 5650, awards: 3, category: 'steady' },
  { name: 'Helwig Hauser', papers: 42, citations: 4420, awards: 2, category: 'steady' },
  { name: 'Tim Dwyer', papers: 35, citations: 3820, awards: 2, category: 'emerging' },
  { name: 'Ross Maciejewski', papers: 32, citations: 3250, awards: 2, category: 'emerging' },
  { name: 'David Gotz', papers: 28, citations: 2980, awards: 1, category: 'emerging' },
  { name: 'Tobias Isenberg', papers: 38, citations: 4120, awards: 3, category: 'emerging' },
  { name: 'Chaoli Wang', papers: 35, citations: 3650, awards: 2, category: 'emerging' },
  { name: 'Christophe Hurter', papers: 32, citations: 3120, awards: 2, category: 'emerging' },
  { name: 'Gordon Kindlmann', papers: 45, citations: 6850, awards: 4, category: 'steady' },
  { name: 'Anders Ynnerman', papers: 42, citations: 4920, awards: 3, category: 'steady' },
  { name: 'Timo Ropinski', papers: 38, citations: 3850, awards: 2, category: 'emerging' },
  { name: 'Robert Kosara', papers: 35, citations: 4520, awards: 2, category: 'emerging' },
  { name: 'Jian Zhao', papers: 28, citations: 2450, awards: 2, category: 'emerging' },
  { name: 'Petra Isenberg', papers: 32, citations: 3280, awards: 2, category: 'emerging' },
  { name: 'Jessie Kennedy', papers: 38, citations: 3920, awards: 2, category: 'emerging' },
  { name: 'Steffen Oeltze-Jafra', papers: 28, citations: 2650, awards: 1, category: 'emerging' }
];

export const authorMetricsStats = {
  totalAuthors: 50,
  avgPapers: 64,
  avgCitations: 6520,
  avgAwards: 3.8,
  maxAwards: 12,
  categories: {
    'prolific': '100+ papers',
    'highly-cited': '10,000+ citations',
    'steady': '50-100 papers',
    'emerging': '<50 papers'
  }
};
