// ============================================================================
// METHODOLOGY DATA
// Research methods and study types
// ============================================================================

export const methodologyData = {
  // Study types distribution
  studyTypes: [
    { type: "Design Study", count: 820, percentage: 23.4 },
    { type: "Algorithm/Technique", count: 750, percentage: 21.4 },
    { type: "User Study", count: 680, percentage: 19.4 },
    { type: "System Paper", count: 520, percentage: 14.9 },
    { type: "Survey/Review", count: 380, percentage: 10.9 },
    { type: "Theory/Model", count: 350, percentage: 10.0 }
  ],
  
  // Evaluation methods over time
  evaluationTrends: [
    { year: 1995, userStudy: 15, caseStudy: 45, noEval: 40 },
    { year: 2000, userStudy: 22, caseStudy: 42, noEval: 36 },
    { year: 2005, userStudy: 32, caseStudy: 40, noEval: 28 },
    { year: 2010, userStudy: 45, caseStudy: 35, noEval: 20 },
    { year: 2015, userStudy: 55, caseStudy: 32, noEval: 13 },
    { year: 2020, userStudy: 62, caseStudy: 30, noEval: 8 },
    { year: 2024, userStudy: 68, caseStudy: 27, noEval: 5 }
  ],
  
  // Average participants per user study
  participantCounts: [
    { year: 2000, avg: 8, median: 6 },
    { year: 2005, avg: 12, median: 10 },
    { year: 2010, avg: 18, median: 14 },
    { year: 2015, avg: 24, median: 18 },
    { year: 2020, avg: 45, median: 28 },
    { year: 2024, avg: 85, median: 42 }
  ]
};
