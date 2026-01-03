// ============================================================================
// CAREER TRAJECTORY DATA
// Author publishing patterns over their careers
// ============================================================================

export const careerTrajectoryData = {
  // Years to first paper after PhD
  yearsToFirstPaper: [
    { years: "During PhD", count: 2850, percentage: 55.1 },
    { years: "0-2 after PhD", count: 1200, percentage: 23.2 },
    { years: "3-5 after PhD", count: 650, percentage: 12.6 },
    { years: "6-10 after PhD", count: 320, percentage: 6.2 },
    { years: "10+ after PhD", count: 150, percentage: 2.9 }
  ],
  
  // Average papers per career stage
  papersByStage: [
    { stage: "Year 1-3", avgPapers: 1.8, medianPapers: 1 },
    { stage: "Year 4-6", avgPapers: 3.2, medianPapers: 2 },
    { stage: "Year 7-10", avgPapers: 4.5, medianPapers: 3 },
    { stage: "Year 11-15", avgPapers: 5.8, medianPapers: 4 },
    { stage: "Year 16-20", avgPapers: 4.2, medianPapers: 3 },
    { stage: "Year 20+", avgPapers: 3.1, medianPapers: 2 }
  ],
  
  // Retention rate (still publishing after N years)
  retention: [
    { years: 1, percentage: 100 },
    { years: 2, percentage: 72 },
    { years: 3, percentage: 58 },
    { years: 5, percentage: 42 },
    { years: 7, percentage: 31 },
    { years: 10, percentage: 22 },
    { years: 15, percentage: 15 },
    { years: 20, percentage: 10 }
  ]
};
