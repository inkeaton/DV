/**
 * student/plots/awardsData.js
 * ============================================================================
 * MOCK DATA: Awards Overview for Students
 * 
 * Shows the types of awards given at IEEE VIS and what it takes
 * to win them - helpful for students setting career goals.
 * This will be replaced with real CSV data.
 * ============================================================================
 */

export const awardsData = [
  { type: "Best Paper", abbrev: "BP", count: 105, prestige: 5 },
  { type: "Honorable Mention", abbrev: "HM", count: 245, prestige: 4 },
  { type: "Test of Time", abbrev: "TT", count: 35, prestige: 5 },
  { type: "Best Student Paper", abbrev: "BSP", count: 42, prestige: 4 }
];

/**
 * Award-winning paper characteristics
 */
export const awardCharacteristics = {
  avgCitations: 156,
  avgAuthors: 4.2,
  noveltyScore: 0.85,
  replicabilityScore: 0.72
};

/**
 * Topics that frequently win awards
 */
export const awardWinningTopics = [
  { topic: "Novel Techniques", awards: 45 },
  { topic: "Perception Studies", awards: 38 },
  { topic: "System Design", awards: 32 },
  { topic: "Evaluation Methods", awards: 28 },
  { topic: "Theoretical Foundations", awards: 22 }
];

/**
 * Timeline of student award wins
 */
export const studentAwardTimeline = [
  { year: 2015, count: 3 },
  { year: 2016, count: 4 },
  { year: 2017, count: 3 },
  { year: 2018, count: 5 },
  { year: 2019, count: 4 },
  { year: 2020, count: 6 },
  { year: 2021, count: 5 },
  { year: 2022, count: 7 },
  { year: 2023, count: 6 },
  { year: 2024, count: 8 }
];
