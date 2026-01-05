/**
 * data/research/institutionsMapData.js
 * Geographic data for institutions bubble map
 */

export const institutionsMapData = [
  // North America
  { name: 'Harvard University', country: 'USA', lat: 42.3770, lon: -71.1167, papers: 156, region: 'North America', city: 'Cambridge, MA' },
  { name: 'MIT', country: 'USA', lat: 42.3601, lon: -71.0942, papers: 148, region: 'North America', city: 'Cambridge, MA' },
  { name: 'Stanford University', country: 'USA', lat: 37.4275, lon: -122.1697, papers: 142, region: 'North America', city: 'Stanford, CA' },
  { name: 'University of Washington', country: 'USA', lat: 47.6553, lon: -122.3035, papers: 135, region: 'North America', city: 'Seattle, WA' },
  { name: 'University of British Columbia', country: 'Canada', lat: 49.2606, lon: -123.2460, papers: 125, region: 'North America', city: 'Vancouver, BC' },
  { name: 'NYU', country: 'USA', lat: 40.7295, lon: -73.9965, papers: 118, region: 'North America', city: 'New York, NY' },
  { name: 'University of Maryland', country: 'USA', lat: 38.9869, lon: -76.9426, papers: 112, region: 'North America', city: 'College Park, MD' },
  { name: 'Georgia Tech', country: 'USA', lat: 33.7756, lon: -84.3963, papers: 108, region: 'North America', city: 'Atlanta, GA' },
  { name: 'UC Berkeley', country: 'USA', lat: 37.8719, lon: -122.2585, papers: 102, region: 'North America', city: 'Berkeley, CA' },
  { name: 'University of Utah', country: 'USA', lat: 40.7649, lon: -111.8421, papers: 95, region: 'North America', city: 'Salt Lake City, UT' },
  { name: 'Brown University', country: 'USA', lat: 41.8268, lon: -71.4025, papers: 88, region: 'North America', city: 'Providence, RI' },
  { name: 'University of Toronto', country: 'Canada', lat: 43.6629, lon: -79.3957, papers: 82, region: 'North America', city: 'Toronto, ON' },
  { name: 'Carnegie Mellon University', country: 'USA', lat: 40.4433, lon: -79.9436, papers: 78, region: 'North America', city: 'Pittsburgh, PA' },
  { name: 'University of Illinois', country: 'USA', lat: 40.1020, lon: -88.2272, papers: 72, region: 'North America', city: 'Urbana-Champaign, IL' },
  { name: 'Purdue University', country: 'USA', lat: 40.4237, lon: -86.9212, papers: 65, region: 'North America', city: 'West Lafayette, IN' },

  // Europe
  { name: 'ETH Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, papers: 138, region: 'Europe', city: 'Zurich' },
  { name: 'TU Wien', country: 'Austria', lat: 48.1987, lon: 16.3694, papers: 128, region: 'Europe', city: 'Vienna' },
  { name: 'University of Groningen', country: 'Netherlands', lat: 53.2194, lon: 6.5665, papers: 115, region: 'Europe', city: 'Groningen' },
  { name: 'TU Delft', country: 'Netherlands', lat: 51.9988, lon: 4.3732, papers: 105, region: 'Europe', city: 'Delft' },
  { name: 'KU Leuven', country: 'Belgium', lat: 50.8798, lon: 4.7005, papers: 98, region: 'Europe', city: 'Leuven' },
  { name: 'University of Oxford', country: 'UK', lat: 51.7548, lon: -1.2544, papers: 92, region: 'Europe', city: 'Oxford' },
  { name: 'University College London', country: 'UK', lat: 51.5246, lon: -0.1340, papers: 85, region: 'Europe', city: 'London' },
  { name: 'University of Edinburgh', country: 'UK', lat: 55.9445, lon: -3.1892, papers: 78, region: 'Europe', city: 'Edinburgh' },
  { name: 'Technical University Munich', country: 'Germany', lat: 48.1497, lon: 11.5676, papers: 75, region: 'Europe', city: 'Munich' },
  { name: 'University of Stuttgart', country: 'Germany', lat: 48.7454, lon: 9.1065, papers: 68, region: 'Europe', city: 'Stuttgart' },
  { name: 'Linköping University', country: 'Sweden', lat: 58.3980, lon: 15.5753, papers: 62, region: 'Europe', city: 'Linköping' },
  { name: 'Sorbonne Université', country: 'France', lat: 48.8480, lon: 2.3560, papers: 58, region: 'Europe', city: 'Paris' },
  { name: 'University of Bergen', country: 'Norway', lat: 60.3889, lon: 5.3322, papers: 52, region: 'Europe', city: 'Bergen' },
  { name: 'Utrecht University', country: 'Netherlands', lat: 52.0893, lon: 5.1132, papers: 48, region: 'Europe', city: 'Utrecht' },
  { name: 'Università di Roma', country: 'Italy', lat: 41.9028, lon: 12.4964, papers: 42, region: 'Europe', city: 'Rome' },

  // Asia
  { name: 'Tsinghua University', country: 'China', lat: 40.0037, lon: 116.3260, papers: 125, region: 'Asia', city: 'Beijing' },
  { name: 'Zhejiang University', country: 'China', lat: 30.2636, lon: 120.1216, papers: 118, region: 'Asia', city: 'Hangzhou' },
  { name: 'Hong Kong University of Science and Technology', country: 'Hong Kong', lat: 22.3364, lon: 114.2655, papers: 108, region: 'Asia', city: 'Hong Kong' },
  { name: 'Peking University', country: 'China', lat: 39.9925, lon: 116.3056, papers: 95, region: 'Asia', city: 'Beijing' },
  { name: 'Seoul National University', country: 'South Korea', lat: 37.4601, lon: 126.9520, papers: 88, region: 'Asia', city: 'Seoul' },
  { name: 'National University of Singapore', country: 'Singapore', lat: 1.2966, lon: 103.7764, papers: 82, region: 'Asia', city: 'Singapore' },
  { name: 'University of Tokyo', country: 'Japan', lat: 35.7128, lon: 139.7628, papers: 75, region: 'Asia', city: 'Tokyo' },
  { name: 'KAIST', country: 'South Korea', lat: 36.3689, lon: 127.3648, papers: 68, region: 'Asia', city: 'Daejeon' },
  { name: 'Shanghai Jiao Tong University', country: 'China', lat: 31.0282, lon: 121.4379, papers: 62, region: 'Asia', city: 'Shanghai' },
  { name: 'Indian Institute of Technology Bombay', country: 'India', lat: 19.1334, lon: 72.9133, papers: 55, region: 'Asia', city: 'Mumbai' },
  { name: 'Nanyang Technological University', country: 'Singapore', lat: 1.3483, lon: 103.6831, papers: 48, region: 'Asia', city: 'Singapore' },
  { name: 'Fudan University', country: 'China', lat: 31.3002, lon: 121.5025, papers: 42, region: 'Asia', city: 'Shanghai' },
  { name: 'Kyoto University', country: 'Japan', lat: 35.0262, lon: 135.7817, papers: 38, region: 'Asia', city: 'Kyoto' },

  // Australia/Oceania
  { name: 'University of Sydney', country: 'Australia', lat: -33.8886, lon: 151.1873, papers: 72, region: 'Oceania', city: 'Sydney' },
  { name: 'Monash University', country: 'Australia', lat: -37.9105, lon: 145.1362, papers: 65, region: 'Oceania', city: 'Melbourne' },
  { name: 'University of Melbourne', country: 'Australia', lat: -37.7964, lon: 144.9612, papers: 58, region: 'Oceania', city: 'Melbourne' },
  { name: 'Australian National University', country: 'Australia', lat: -35.2777, lon: 149.1185, papers: 52, region: 'Oceania', city: 'Canberra' },

  // South America
  { name: 'Universidade de São Paulo', country: 'Brazil', lat: -23.5558, lon: -46.7319, papers: 45, region: 'South America', city: 'São Paulo' },
  { name: 'Universidade Federal do Rio de Janeiro', country: 'Brazil', lat: -22.8614, lon: -43.2246, papers: 38, region: 'South America', city: 'Rio de Janeiro' },
  { name: 'Universidad de Chile', country: 'Chile', lat: -33.4569, lon: -70.6631, papers: 32, region: 'South America', city: 'Santiago' },

  // Africa
  { name: 'University of Cape Town', country: 'South Africa', lat: -33.9577, lon: 18.4612, papers: 28, region: 'Africa', city: 'Cape Town' },
  { name: 'Cairo University', country: 'Egypt', lat: 30.0253, lon: 31.2089, papers: 22, region: 'Africa', city: 'Cairo' }
];

export const institutionsMapStats = {
  totalInstitutions: 55,
  totalPapers: 4820,
  regions: {
    'North America': 15,
    'Europe': 15,
    'Asia': 13,
    'Oceania': 4,
    'South America': 3,
    'Africa': 2
  },
  topInstitution: 'Harvard University',
  topInstitutionPapers: 156
};

export const regionColors = {
  'North America': '#3b82f6',
  'Europe': '#10b981',
  'Asia': '#f59e0b',
  'Oceania': '#8b5cf6',
  'South America': '#ef4444',
  'Africa': '#ec4899'
};
