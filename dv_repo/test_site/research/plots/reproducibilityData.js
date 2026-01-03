// ============================================================================
// REPRODUCIBILITY DATA
// Open science and reproducibility trends
// ============================================================================

export const reproducibilityData = {
  // Code/data availability
  availability: [
    { year: 2010, code: 8, data: 5, both: 3 },
    { year: 2012, code: 12, data: 8, both: 5 },
    { year: 2014, code: 18, data: 12, both: 8 },
    { year: 2016, code: 28, data: 18, both: 14 },
    { year: 2018, code: 42, data: 28, both: 22 },
    { year: 2020, code: 58, data: 42, both: 35 },
    { year: 2022, code: 72, data: 55, both: 48 },
    { year: 2024, code: 82, data: 65, both: 58 }
  ],
  
  // Preregistration and replication
  practices: [
    { practice: "Open Source Code", rate: 82 },
    { practice: "Open Data", rate: 65 },
    { practice: "Supplementary Materials", rate: 78 },
    { practice: "Demo/Video", rate: 72 },
    { practice: "Preregistration", rate: 12 },
    { practice: "Replication Study", rate: 8 }
  ],
  
  // Code platforms
  platforms: [
    { platform: "GitHub", percentage: 78 },
    { platform: "OSF", percentage: 12 },
    { platform: "Personal Website", percentage: 6 },
    { platform: "Zenodo", percentage: 4 }
  ]
};
