/**
 * assets/js/color-palettes.js
 * ============================================================================
 * CENTRALIZED COLOR PALETTES MODULE
 * 
 * This module provides consistent categorical color scales used across all
 * visualization sections (Papers, Authors, Research). Import colors from here
 * to ensure visual consistency throughout the application.
 * ============================================================================
 */

// ============================================================================
// CONFERENCE TRACK COLORS (Papers section)
// ============================================================================

/**
 * Colors for VIS conference tracks
 */
export const trackColors = {
  infovis:  '#9FA8DA',  // Pastel Blue
  scivis: '#BCAAA4',   // Pastel Green
  vast: '#80DEEA',    // Pastel Orange
  vis: ' #64B5F6',   // Pastel Purple
};

/**
 * State-aware variants for track colors to support hover and dark-mode
 */
export const trackStateColors = {
  infovis: {
    default: '#9FA8DA',
    dark: '#283593',
    hoverLight: '#283593',
    hoverDark: '#9FA8DA',
  },
  scivis: {
    default: '#BCAAA4',
    dark: '#3E2723',
    hoverLight: '#3E2723',
    hoverDark: '#BCAAA4'
  },
  vast: {
    default: '#80DEEA',
    dark: '#006064',
    hoverLight: '#006064',
    hoverDark: '#80DEEA',
  },
  vis: {
    default: ' #64B5F6',
    dark: ' #0D47A1',
    hoverLight: '#0D47A1',
    hoverDark: ' #64B5F6',
  }
};

/**
 * Alias for track colors used in conference plots. Kept for backward
 * compatibility with modules that import `conferenceColors`.
 */
export const conferenceColors = {
  infovis: trackColors.infovis,
  scivis: trackColors.scivis,
  vast: trackColors.vast,
  vis: trackColors.vis
};



// ============================================================================
// PUBLICATION TYPE COLORS (Papers section)
// ============================================================================

/**
 * Colors for publication types
 */
// Material Design Pastel Tokens: Cyan 300 & Green 300
// Questi colori sono più morbidi ("Pastel") rispetto alla versione precedente
export const publicationColors = {
  journal: '#90CAF9',       // Cyan 300 (Pastel Blue/Cyan)
  conference: '#FFAB91'    // Green 300 (Soft Mint)
};

// Configurazione avanzata per interazioni
export const publicationStateColors = {
  journal: {
    default: '#90CAF9',    // BASE (Pastel)
    dark: '#1565C0',   // DARK MODE (Lighter: Cyan 200)
    hoverLight: '#1565C0', // HOVER LIGHT (Saturated: Cyan 500)
    hoverDark: '#90CAF9'   // HOVER DARK (Glow: Cyan 100)
  },
  conference: {
    default: '#FFAB91',     // BASE (Mint Pastel)
    dark: '#D84315',   // DARK MODE (Lighter: Green 200)
    hoverLight: '#D84315', // HOVER LIGHT (Saturated: Green 500)
    hoverDark: '#FFAB91'   // HOVER DARK (Glow: Green 100)
  }
};

// ============================================================================
// STORY COLOR (used by Papers Per Year highlight)
// ============================================================================
/**
 * Single token with state variants for the 'story' color used to highlight
 * narrative annotations and the peak bar in the timeline.
 */
export const storyColor = {
  default: '#ADECFF',    // Pink 300 (The Perfect Pink)
  dark: '#004E5D',       // Pink 200
  hoverLight: '#006064', // Pink 500
  hoverDark: '#ADECFF'   // Pink 50 (Misty Rose)
};

// ============================================================================
// AWARD TYPE COLORS (Papers section)
// ============================================================================

/**
 * Colors for award types
 */
export const awardColors = {
  'Best Paper': '#FFD700',           // Gold
  'Honorable Mention': '#C0C0C0',    // Silver
  'Best Case Study': '#CD7F32',      // Bronze
  'Test of Time': '#7c4dff'          // Purple
};

// ============================================================================
// KEYWORD CATEGORY COLORS (Papers section)
// ============================================================================

/**
 * Colors for keyword/topic categories
 */
export const categoryColors = {
  technique: '#00687A',      // Primary teal
  application: '#4285F4',    // Blue
  evaluation: '#34A853',     // Green
  theory: '#7c4dff',         // Purple
  design: '#FBBC04',         // Yellow
  perception: '#EA4335',     // Red
  interaction: '#00bfa5',    // Cyan
  data: '#ff6d00'            // Orange
};

// ============================================================================
// CAREER STAGE COLORS (Authors section)
// ============================================================================

/**
 * Colors for author career stages
 */
export const careerStageColors = [
  'var(--md-sys-color-primary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-tertiary)',
  '#7c4dff',
  '#00bfa5',
  '#ff6d00'
];

// ============================================================================
// COLLABORATION TYPE COLORS (Authors section)
// ============================================================================

/**
 * Colors for collaboration types
 */
export const collaborationColors = {
  solo: '#EA4335',           // Red
  duo: '#4285F4',            // Blue
  small: '#34A853',          // Green
  large: '#7c4dff'           // Purple
};

// ============================================================================
// METHODOLOGY COLORS (Research section)
// ============================================================================

/**
 * Colors for research methodology types
 */
export const methodologyColors = {
  userStudy: 'var(--md-sys-color-primary)',
  caseStudy: 'var(--md-sys-color-tertiary)',
  noEval: 'var(--md-sys-color-outline)',
  quantitative: '#4285F4',
  qualitative: '#34A853',
  mixed: '#7c4dff'
};

/**
 * Labels for methodology types
 */
export const methodologyLabels = {
  userStudy: 'User Study',
  caseStudy: 'Case Study',
  noEval: 'No Evaluation',
  quantitative: 'Quantitative',
  qualitative: 'Qualitative',
  mixed: 'Mixed Methods'
};

// ============================================================================
// DOMAIN COLORS (Research section)
// ============================================================================

/**
 * Colors for application domains
 */
export const domainColors = {
  science: '#4285F4',        // Blue
  health: '#EA4335',         // Red
  business: '#34A853',       // Green
  social: '#FBBC04',         // Yellow
  engineering: '#7c4dff',    // Purple
  arts: '#ff6d00',           // Orange
  education: '#00bfa5'       // Cyan
};

// ============================================================================
// DATA TYPE COLORS (Research section)
// ============================================================================

/**
 * Colors for data types
 */
export const dataTypeColors = {
  tabular: '#4285F4',
  network: '#34A853',
  spatial: '#FBBC04',
  temporal: '#7c4dff',
  text: '#EA4335',
  hierarchical: '#00bfa5',
  multivariate: '#ff6d00'
};

// ============================================================================
// GENERAL PURPOSE PALETTES
// ============================================================================

/**
 * Sequential color palette (light to dark)
 */
export const sequentialPalette = [
  '#e3f2fd',
  '#90caf9',
  '#42a5f5',
  '#1e88e5',
  '#1565c0',
  '#0d47a1'
];

/**
 * Diverging color palette (negative to positive)
 */
export const divergingPalette = [
  '#d32f2f',
  '#e57373',
  '#ffcdd2',
  '#e0e0e0',
  '#c8e6c9',
  '#81c784',
  '#388e3c'
];

/**
 * Categorical color palette for general use (6 colors)
 */
export const categoricalPalette6 = [
  'var(--md-sys-color-primary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-tertiary)',
  '#7c4dff',
  '#00bfa5',
  '#ff6d00'
];

/**
 * Extended categorical color palette (12 colors)
 */
export const categoricalPalette12 = [
  '#4285F4',
  '#34A853',
  '#FBBC04',
  '#EA4335',
  '#7c4dff',
  '#00bfa5',
  '#ff6d00',
  '#00687A',
  '#9c27b0',
  '#795548',
  '#607d8b',
  '#e91e63'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a D3 ordinal scale with a predefined palette
 * @param {Object} d3 - D3 library reference
 * @param {Array} domain - Domain values
 * @param {string} paletteName - Name of palette: 'categorical6', 'categorical12', 'sequential', 'diverging'
 * @returns {Function} D3 ordinal scale
 */
export function getColorScale(d3, domain, paletteName = 'categorical6') {
  const palettes = {
    categorical6: categoricalPalette6,
    categorical12: categoricalPalette12,
    sequential: sequentialPalette,
    diverging: divergingPalette
  };

  const palette = palettes[paletteName] || categoricalPalette6;

  return d3.scaleOrdinal()
    .domain(domain)
    .range(palette);
}

// ============================================================================
// LAVENDER SEQUENTIAL PALETTES (used by citationsHistogram)
// ============================================================================

/**
 * Generate lavender-themed palettes for main and tail bins.
 * Returns arrays: { mainColors (20), tailColors (7) }
 * @param {Object} d3 - D3 reference (for interpolators)
 */
export function generateLavenderPalettes(d3) {
  const COLOR_START = '#EDE7F6'; // Light Lavender
  const COLOR_MID = '#9575CD';
  const COLOR_END = '#311B92';

  const scaleHead = d3.scaleLinear()
    .domain([0, 19])
    .range([COLOR_START, COLOR_MID])
    .interpolate(d3.interpolateRgb);

  const scaleTail = d3.scaleLinear()
    .domain([0, 6])
    .range([COLOR_MID, COLOR_END])
    .interpolate(d3.interpolateRgb);

  const mainColors = d3.range(20).map(i => scaleHead(i));
  const tailColors = d3.range(7).map(i => scaleTail(i));

  return { mainColors, tailColors, COLOR_MID, COLOR_END };
}

// ============================================================================
// TOPIC COLOR PALETTE (12 categories)
// ============================================================================
/**
 * Topic color tokens with state variants for hover and dark mode.
 * Keys are short identifiers; mapping from full macro names is provided
 * by `topicNameKeyMap`.
 */
export const topicColors = {
  highDimensional: {
    default: '#DEE1FF',
    dark: '#3F4565',
    hoverLight: '#3F4565',
    hoverDark: '#DEE1FF'
  },
  graphText: {
    default: '#E1BEE7',
    dark: '#4A148C',
    hoverLight: '#4A148C',
    hoverDark: '#E1BEE7'
  },
  volumeImmersive: {
    default: '#F8BBD0',
    dark: '#880E4F',
    hoverLight: '#880E4F',
    hoverDark: '#F8BBD0'
  },
  visProgML: {
    default: '#FFCDD2',
    dark: '#B71C1C',
    hoverLight: '#B71C1C',
    hoverDark: '#FFCDD2'
  },
  socialBiomed: {
    default: '#FFCCBC',
    dark: '#BF360C',
    hoverLight: '#BF360C',
    hoverDark: '#FFCCBC'
  },
  imagingDisplay: {
    default: '#FFAB91',
    dark: '#D84315',
    hoverLight: '#D84315',
    hoverDark: '#FFAB91'
  },
  causalityTemporal: {
    default: '#D1C4E9',
    dark: '#4527A0',
    hoverLight: '#4527A0',
    hoverDark: '#D1C4E9'
  },
  perceptionUncertainty: {
    default: '#9FA8DA',
    dark: '#283593',
    hoverLight: '#283593',
    hoverDark: '#9FA8DA'
  },
  topological: {
    default: '#F48FB1',
    dark: '#AD1457',
    hoverLight: '#AD1457',
    hoverDark: '#F48FB1'
  },
  networkSecurity: {
    default: '#CE93D8',
    dark: '#6A1B9A',
    hoverLight: '#6A1B9A',
    hoverDark: '#CE93D8'
  },
  geoSeismic: {
    default: '#FFAB40',
    dark: '#E65100',
    hoverLight: '#E65100',
    hoverDark: '#FFAB40'
  },
  molecular: {
    default: '#D7CCC8',
    dark: '#5D4037',
    hoverLight: '#5D4037',
    hoverDark: '#D7CCC8'
  }
};

/**
 * Mapping from full macro category names (as used in data) to the short keys
 * used in `topicColors` above.
 */
export const topicNameKeyMap = {
  'High-Dimensional Data Analysis': 'highDimensional',
  'Graph Visualization & Text Mining': 'graphText',
  'Volume Rendering & Immersive Tech': 'volumeImmersive',
  'Visual Programming & ML': 'visProgML',
  'Social & Biomedical Analytics': 'socialBiomed',
  'Imaging & Display Technology': 'imagingDisplay',
  'Causality & Temporal Analysis': 'causalityTemporal',
  'Perception & Uncertainty Vis': 'perceptionUncertainty',
  'Topological Data Analysis': 'topological',
  'Network Security & Anomaltic': 'networkSecurity',
  'Geospatial & Seismic Vis': 'geoSeismic',
  'Molecular Simulation': 'molecular'
};

// ============================================================================
// REGION COLORS (7 Continents/Areas)
// Logic: Base (300) -> Dark Mode (200) -> Hover Light (500) -> Hover Dark (100)
// ============================================================================
// 1. Definisci il tema Blu una volta sola (Single Source of Truth)
const blueRegionStyle = {
  default: '#4DD0E1',    // Blue 300
  dark: '#006064',       // Blue 200
  hoverLight: '#006064', // Blue 500
  hoverDark: '#4DD0E1'   // Blue 100
};

// 2. Esporta l'oggetto regionColors
export const regionColors = {
  // Entrambi usano la variabile 'blueRegionStyle'
  "North America": blueRegionStyle,
  "Americas": blueRegionStyle,

  "Europe": {
    default: ' #64B5F9',    // Green 300
    dark: '#0D47A1',       // Green 200
    hoverLight: '#0D47A1', // Green 500
    hoverDark: ' #64B5F9'   // Green 100
  },
  "Asia": {
    default: '#69F0AE',    // Amber 300
    dark: '#1B5E20',       // Amber 200
    hoverLight: '#1B5E20', // Amber 500
    hoverDark: '#69F0AE'   // Amber 100
  },
  "Oceania": {
    default: '#FFAB40',    // Deep Purple 300
    dark: '#E65100',       // Deep Purple 200
    hoverLight: '#E65100', // Deep Purple 500
    hoverDark: '#FFAB40'   // Deep Purple 100
  },
  "South America": {
    default: '#DEE1FF',    // Red 300
    dark: '#3F4565',       // Red 200
    hoverLight: '#3F4565', // Red 500
    hoverDark: '#DEE1FF'   // Red 100
  },
  "Africa": {
    default: '#FFCDD2',    // Pink 300
    dark: '#B71C1C',       // Pink 200
    hoverLight: '#B71C1C', // Pink 500
    hoverDark: '#FFCDD2'   // Pink 100
  },
  "Other": {
    default: '#D7CCC8',    // Blue Grey 300
    dark: '#5D4037',       // Blue Grey 200
    hoverLight: '#5D4037', // Blue Grey 500
    hoverDark: '#D7CCC8'   // Blue Grey 100
  }
};
// authorsPerPaper
export const cyanTheme = {
  surf: "#DEE1FF",
  prm: "#3F4565",   // Cyan 300 (Testo secondario)
};

// uniqueAuthorsTimeline theme
export const purpleTheme = {
  surf: '#B9F6CA',
  prm: '#005035'
};