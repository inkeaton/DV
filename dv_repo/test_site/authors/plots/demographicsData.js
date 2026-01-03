// ============================================================================
// AUTHOR DEMOGRAPHICS DATA
// Distribution of authors by career stage and region
// ============================================================================

export const demographicsData = {
  byCareerStage: [
    { stage: "PhD Student", count: 1820, percentage: 35.2 },
    { stage: "Postdoc", count: 780, percentage: 15.1 },
    { stage: "Assistant Prof", count: 1040, percentage: 20.1 },
    { stage: "Associate Prof", count: 820, percentage: 15.9 },
    { stage: "Full Professor", count: 540, percentage: 10.4 },
    { stage: "Industry", count: 170, percentage: 3.3 }
  ],
  byRegion: [
    { region: "North America", count: 2100, percentage: 40.6 },
    { region: "Europe", count: 1650, percentage: 31.9 },
    { region: "Asia Pacific", count: 1050, percentage: 20.3 },
    { region: "South America", count: 220, percentage: 4.3 },
    { region: "Africa/Middle East", count: 150, percentage: 2.9 }
  ],
  byDecade: [
    { decade: "1990s", students: 280, faculty: 420, industry: 45 },
    { decade: "2000s", students: 620, faculty: 780, industry: 85 },
    { decade: "2010s", students: 1450, faculty: 1350, industry: 130 },
    { decade: "2020s", students: 980, faculty: 850, industry: 95 }
  ]
};
