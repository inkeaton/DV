// ============================================================================
// COLLABORATION NETWORK DATA
// Co-authorship patterns and network metrics
// ============================================================================

export const collaborationData = {
  // Top collaborator pairs
  topPairs: [
    { author1: "John Doe", author2: "Jane Smith", papers: 28 },
    { author1: "Wei Chen", author2: "Yu Zhang", papers: 24 },
    { author1: "Michael Brown", author2: "Sarah Johnson", papers: 21 },
    { author1: "Hans Mueller", author2: "Maria Garcia", papers: 19 },
    { author1: "Takeshi Yamamoto", author2: "Yuki Tanaka", papers: 17 },
    { author1: "Robert Wilson", author2: "Emily Davis", papers: 16 },
    { author1: "Pierre Dubois", author2: "Marie Curie", papers: 15 },
    { author1: "Carlos Rodriguez", author2: "Ana Martinez", papers: 14 }
  ],
  
  // Network statistics over time
  networkGrowth: [
    { year: 1990, authors: 85, edges: 120, avgDegree: 2.8 },
    { year: 1995, authors: 180, edges: 310, avgDegree: 3.4 },
    { year: 2000, authors: 420, edges: 890, avgDegree: 4.2 },
    { year: 2005, authors: 780, edges: 2100, avgDegree: 5.4 },
    { year: 2010, authors: 1250, edges: 4200, avgDegree: 6.7 },
    { year: 2015, authors: 1850, edges: 7500, avgDegree: 8.1 },
    { year: 2020, authors: 2400, edges: 11200, avgDegree: 9.3 },
    { year: 2024, authors: 2850, edges: 14500, avgDegree: 10.2 }
  ],
  
  // Cross-institution collaboration rate
  crossInstitution: [
    { year: 1990, sameInst: 75, crossInst: 25 },
    { year: 1995, sameInst: 68, crossInst: 32 },
    { year: 2000, sameInst: 62, crossInst: 38 },
    { year: 2005, sameInst: 55, crossInst: 45 },
    { year: 2010, sameInst: 48, crossInst: 52 },
    { year: 2015, sameInst: 42, crossInst: 58 },
    { year: 2020, sameInst: 38, crossInst: 62 },
    { year: 2024, sameInst: 35, crossInst: 65 }
  ]
};
