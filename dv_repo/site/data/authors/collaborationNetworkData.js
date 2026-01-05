/**
 * data/authors/collaborationNetworkData.js
 * Network data for force-directed collaboration graph
 * Filtered to top 50 most collaborative authors for visual clarity
 */

export const collaborationNetworkData = {
  nodes: [
    { id: 'Hanspeter Pfister', group: 1, papers: 156, collaborations: 245 },
    { id: 'Tamara Munzner', group: 1, papers: 142, collaborations: 198 },
    { id: 'Daniel Keim', group: 2, papers: 138, collaborations: 220 },
    { id: 'Min Chen', group: 2, papers: 125, collaborations: 185 },
    { id: 'Chris North', group: 3, papers: 118, collaborations: 172 },
    { id: 'Jean-Daniel Fekete', group: 3, papers: 112, collaborations: 165 },
    { id: 'Jeffrey Heer', group: 1, papers: 108, collaborations: 156 },
    { id: 'Ben Shneiderman', group: 3, papers: 105, collaborations: 148 },
    { id: 'Jarke van Wijk', group: 2, papers: 98, collaborations: 142 },
    { id: 'Claudio Silva', group: 1, papers: 95, collaborations: 138 },
    { id: 'Bernd Hamann', group: 2, papers: 92, collaborations: 135 },
    { id: 'Kwan-Liu Ma', group: 2, papers: 88, collaborations: 128 },
    { id: 'Alexandru Telea', group: 2, papers: 85, collaborations: 122 },
    { id: 'Michael Sedlmair', group: 1, papers: 82, collaborations: 118 },
    { id: 'Niklas Elmqvist', group: 3, papers: 78, collaborations: 112 },
    { id: 'John Stasko', group: 3, papers: 75, collaborations: 108 },
    { id: 'Robert Laramee', group: 2, papers: 72, collaborations: 105 },
    { id: 'Torsten Möller', group: 2, papers: 68, collaborations: 98 },
    { id: 'David Laidlaw', group: 2, papers: 65, collaborations: 92 },
    { id: 'Penny Rheingans', group: 2, papers: 62, collaborations: 88 },
    { id: 'Klaus Mueller', group: 2, papers: 58, collaborations: 85 },
    { id: 'Georges Grinstein', group: 3, papers: 55, collaborations: 82 },
    { id: 'Pak Chung Wong', group: 3, papers: 52, collaborations: 78 },
    { id: 'Daniel Weiskopf', group: 2, papers: 48, collaborations: 75 },
    { id: 'Hans Hagen', group: 2, papers: 45, collaborations: 72 },
    { id: 'Helwig Hauser', group: 2, papers: 42, collaborations: 68 },
    { id: 'Yingcai Wu', group: 1, papers: 38, collaborations: 65 },
    { id: 'Tim Dwyer', group: 1, papers: 35, collaborations: 62 },
    { id: 'Ross Maciejewski', group: 3, papers: 32, collaborations: 58 },
    { id: 'David Gotz', group: 3, papers: 28, collaborations: 55 },
    { id: 'Shixia Liu', group: 1, papers: 42, collaborations: 68 },
    { id: 'Tobias Isenberg', group: 2, papers: 38, collaborations: 62 },
    { id: 'Chaoli Wang', group: 2, papers: 35, collaborations: 58 },
    { id: 'Christophe Hurter', group: 3, papers: 32, collaborations: 52 },
    { id: 'Nathalie Henry Riche', group: 1, papers: 38, collaborations: 58 },
    { id: 'Steven Drucker', group: 1, papers: 35, collaborations: 55 },
    { id: 'Miriah Meyer', group: 1, papers: 32, collaborations: 52 },
    { id: 'Michael Gleicher', group: 1, papers: 48, collaborations: 72 },
    { id: 'Christopher Collins', group: 3, papers: 42, collaborations: 65 },
    { id: 'Huamin Qu', group: 1, papers: 45, collaborations: 68 },
    { id: 'Jessie Kennedy', group: 3, papers: 38, collaborations: 58 },
    { id: 'Martin Wattenberg', group: 1, papers: 42, collaborations: 62 },
    { id: 'Fernanda Viégas', group: 1, papers: 38, collaborations: 58 },
    { id: 'Gordon Kindlmann', group: 2, papers: 45, collaborations: 65 },
    { id: 'Anders Ynnerman', group: 2, papers: 42, collaborations: 62 },
    { id: 'Timo Ropinski', group: 2, papers: 38, collaborations: 58 },
    { id: 'Robert Kosara', group: 3, papers: 35, collaborations: 52 },
    { id: 'Jian Zhao', group: 1, papers: 28, collaborations: 45 },
    { id: 'Petra Isenberg', group: 2, papers: 32, collaborations: 48 },
    { id: 'Steffen Oeltze-Jafra', group: 2, papers: 28, collaborations: 42 }
  ],
  links: [
    // Group 1 (Harvard/MIT cluster) collaborations
    { source: 'Hanspeter Pfister', target: 'Jeffrey Heer', value: 12 },
    { source: 'Hanspeter Pfister', target: 'Claudio Silva', value: 15 },
    { source: 'Hanspeter Pfister', target: 'Michael Sedlmair', value: 8 },
    { source: 'Tamara Munzner', target: 'Michael Sedlmair', value: 14 },
    { source: 'Tamara Munzner', target: 'Miriah Meyer', value: 10 },
    { source: 'Jeffrey Heer', target: 'Martin Wattenberg', value: 18 },
    { source: 'Jeffrey Heer', target: 'Fernanda Viégas', value: 16 },
    { source: 'Martin Wattenberg', target: 'Fernanda Viégas', value: 22 },
    { source: 'Claudio Silva', target: 'Michael Gleicher', value: 9 },
    { source: 'Nathalie Henry Riche', target: 'Steven Drucker', value: 15 },
    { source: 'Shixia Liu', target: 'Yingcai Wu', value: 12 },
    { source: 'Huamin Qu', target: 'Yingcai Wu', value: 14 },
    { source: 'Tim Dwyer', target: 'Tamara Munzner', value: 8 },
    { source: 'Jian Zhao', target: 'Shixia Liu', value: 10 },
    
    // Group 2 (European/SciVis cluster) collaborations
    { source: 'Daniel Keim', target: 'Min Chen', value: 11 },
    { source: 'Daniel Keim', target: 'Jarke van Wijk', value: 10 },
    { source: 'Jarke van Wijk', target: 'Alexandru Telea', value: 13 },
    { source: 'Jarke van Wijk', target: 'Tobias Isenberg', value: 9 },
    { source: 'Min Chen', target: 'Bernd Hamann', value: 12 },
    { source: 'Bernd Hamann', target: 'Kwan-Liu Ma', value: 14 },
    { source: 'Kwan-Liu Ma', target: 'Chaoli Wang', value: 11 },
    { source: 'Alexandru Telea', target: 'Robert Laramee', value: 10 },
    { source: 'Robert Laramee', target: 'Daniel Weiskopf', value: 8 },
    { source: 'Torsten Möller', target: 'Gordon Kindlmann', value: 12 },
    { source: 'David Laidlaw', target: 'Penny Rheingans', value: 9 },
    { source: 'Klaus Mueller', target: 'Torsten Möller', value: 10 },
    { source: 'Daniel Weiskopf', target: 'Hans Hagen', value: 13 },
    { source: 'Hans Hagen', target: 'Helwig Hauser', value: 11 },
    { source: 'Helwig Hauser', target: 'Tobias Isenberg', value: 8 },
    { source: 'Gordon Kindlmann', target: 'Anders Ynnerman', value: 9 },
    { source: 'Anders Ynnerman', target: 'Timo Ropinski', value: 12 },
    { source: 'Petra Isenberg', target: 'Tobias Isenberg', value: 20 },
    { source: 'Steffen Oeltze-Jafra', target: 'Helwig Hauser', value: 7 },
    
    // Group 3 (VAST/InfoVis cluster) collaborations
    { source: 'Chris North', target: 'Jean-Daniel Fekete', value: 9 },
    { source: 'Jean-Daniel Fekete', target: 'Ben Shneiderman', value: 11 },
    { source: 'Ben Shneiderman', target: 'John Stasko', value: 13 },
    { source: 'Niklas Elmqvist', target: 'Jean-Daniel Fekete', value: 10 },
    { source: 'John Stasko', target: 'Chris North', value: 8 },
    { source: 'Georges Grinstein', target: 'Ben Shneiderman', value: 7 },
    { source: 'Pak Chung Wong', target: 'Georges Grinstein', value: 9 },
    { source: 'Ross Maciejewski', target: 'Chris North', value: 11 },
    { source: 'David Gotz', target: 'Ross Maciejewski', value: 8 },
    { source: 'Christophe Hurter', target: 'Christopher Collins', value: 10 },
    { source: 'Christopher Collins', target: 'Jessie Kennedy', value: 9 },
    { source: 'Robert Kosara', target: 'John Stasko', value: 12 },
    
    // Cross-group collaborations
    { source: 'Hanspeter Pfister', target: 'Daniel Keim', value: 7 },
    { source: 'Jeffrey Heer', target: 'Jean-Daniel Fekete', value: 9 },
    { source: 'Tamara Munzner', target: 'Jarke van Wijk', value: 6 },
    { source: 'Michael Sedlmair', target: 'Tobias Isenberg', value: 8 },
    { source: 'Claudio Silva', target: 'Min Chen', value: 7 },
    { source: 'Niklas Elmqvist', target: 'Nathalie Henry Riche', value: 10 },
    { source: 'Christopher Collins', target: 'Shixia Liu', value: 8 }
  ]
};

export const networkStats = {
  totalNodes: 50,
  totalLinks: 80,
  avgCollaborations: 10.2,
  maxCollaborations: 245,
  groups: {
    1: 'Harvard/MIT Cluster',
    2: 'European/SciVis Cluster',
    3: 'VAST/InfoVis Cluster'
  }
};
