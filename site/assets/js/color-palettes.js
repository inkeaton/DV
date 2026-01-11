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
  infovis: '#F48FB1',  // Pastel Blue
  scivis: '#A5D6A7',   // Pastel Green
  vast: '#FFD54F',    // Pastel Orange
  vis: '#8AB4F8',   // Pastel Purple
};

/**
 * State-aware variants for track colors to support hover and dark-mode
 */
export const trackStateColors = {
  infovis: {
    default: '#F48FB1',
    dark: '#AB47BC',
    hoverLight: '#AB47BC',
    hoverDark: '#E1BEE7',
  },
  scivis: {
    default: '#A5D6A7',
    dark: '#66BB6A',
    hoverLight: '#66BB6A',
    hoverDark: '#DCE775'
  },
  vast: {
    default: '#FFD54F',
    dark: '#FFE0B2',
    hoverLight: '#FFE0B2',
    hoverDark: '#FFB74D',
  },
  vis: {
    default: '#8AB4F8',
    dark: '#64B5F6',
    hoverLight: '#64B5F6',
    hoverDark: '#AECBFA',
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
  journal: '#80DEEA',       // Cyan 300 (Pastel Blue/Cyan)
  conference: '#A5D6A7',     // Green 300 (Soft Mint)
};

// Configurazione avanzata per interazioni
export const publicationStateColors = {
  journal: {
    default: '#80DEEA',    // BASE (Pastel)
    dark: '#4DD0E1',   // DARK MODE (Lighter: Cyan 200)
    hoverLight: '#00BCD4', // HOVER LIGHT (Saturated: Cyan 500)
    hoverDark: '#B2EBF2'   // HOVER DARK (Glow: Cyan 100)
  },
  conference: {
    default: '#A5D6A7',     // BASE (Mint Pastel)
    dark: '#81C784',   // DARK MODE (Lighter: Green 200)
    hoverLight: '#4CAF50', // HOVER LIGHT (Saturated: Green 500)
    hoverDark: '#C8E6C9'   // HOVER DARK (Glow: Green 100)
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
  default: '#F48FB1',    // Pink 300 (The Perfect Pink)
  dark: '#F8BBD0',       // Pink 200
  hoverLight: '#E91E63', // Pink 500
  hoverDark: '#FCE4EC'   // Pink 50 (Misty Rose)
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
    default: '#E57373',
    dark: '#EF9A9A',
    hoverLight: '#F44336',
    hoverDark: '#FFCDD2'
  },
  graphText: {
    default: '#F06292',
    dark: '#F48FB1',
    hoverLight: '#E91E63',
    hoverDark: '#F8BBD0'
  },
  volumeImmersive: {
    default: '#BA68C8',
    dark: '#CE93D8',
    hoverLight: '#9C27B0',
    hoverDark: '#E1BEE7'
  },
  visProgML: {
    default: '#9575CD',
    dark: '#B39DDB',
    hoverLight: '#673AB7',
    hoverDark: '#D1C4E9'
  },
  socialBiomed: {
    default: '#7986CB',
    dark: '#9FA8DA',
    hoverLight: '#3F51B5',
    hoverDark: '#C5CAE9'
  },
  imagingDisplay: {
    default: '#64B5F6',
    dark: '#90CAF9',
    hoverLight: '#2196F3',
    hoverDark: '#BBDEFB'
  },
  causalityTemporal: {
    default: '#4FC3F7',
    dark: '#81D4FA',
    hoverLight: '#03A9F4',
    hoverDark: '#B3E5FC'
  },
  perceptionUncertainty: {
    default: '#4DD0E1',
    dark: '#80DEEA',
    hoverLight: '#00BCD4',
    hoverDark: '#B2EBF2'
  },
  topological: {
    default: '#4DB6AC',
    dark: '#80CBC4',
    hoverLight: '#009688',
    hoverDark: '#B2DFDB'
  },
  networkSecurity: {
    default: '#81C784',
    dark: '#A5D6A7',
    hoverLight: '#4CAF50',
    hoverDark: '#C8E6C9'
  },
  geoSeismic: {
    default: '#AED581',
    dark: '#C5E1A5',
    hoverLight: '#8BC34A',
    hoverDark: '#DCEDC8'
  },
  molecular: {
    default: '#FFF176',
    dark: '#FFF59D',
    hoverLight: '#FFEB3B',
    hoverDark: '#FFF9C4'
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
  default: '#64B5F6',    // Blue 300
  dark: '#90CAF9',       // Blue 200
  hoverLight: '#2196F3', // Blue 500
  hoverDark: '#BBDEFB'   // Blue 100
};

// 2. Esporta l'oggetto regionColors
export const regionColors = {
  // Entrambi usano la variabile 'blueRegionStyle'
  "North America": blueRegionStyle,
  "Americas": blueRegionStyle,

  "Europe": {
    default: '#81C784',    // Green 300
    dark: '#A5D6A7',       // Green 200
    hoverLight: '#4CAF50', // Green 500
    hoverDark: '#C8E6C9'   // Green 100
  },
  "Asia": {
    default: '#FFD54F',    // Amber 300
    dark: '#FFE082',       // Amber 200
    hoverLight: '#FFC107', // Amber 500
    hoverDark: '#FFECB3'   // Amber 100
  },
  "Oceania": {
    default: '#9575CD',    // Deep Purple 300
    dark: '#B39DDB',       // Deep Purple 200
    hoverLight: '#673AB7', // Deep Purple 500
    hoverDark: '#D1C4E9'   // Deep Purple 100
  },
  "South America": {
    default: '#E57373',    // Red 300
    dark: '#EF9A9A',       // Red 200
    hoverLight: '#F44336', // Red 500
    hoverDark: '#FFCDD2'   // Red 100
  },
  "Africa": {
    default: '#F06292',    // Pink 300
    dark: '#F48FB1',       // Pink 200
    hoverLight: '#E91E63', // Pink 500
    hoverDark: '#F8BBD0'   // Pink 100
  },
  "Other": {
    default: '#90A4AE',    // Blue Grey 300
    dark: '#B0BEC5',       // Blue Grey 200
    hoverLight: '#607D8B', // Blue Grey 500
    hoverDark: '#CFD8DC'   // Blue Grey 100
  }
};
// authorsPerPaper
export const cyanTheme = {
  surf: "#B2EBF2",
  prm: "#00BCD4",
  surfaceContainer: "#E0F7FA",   // Cyan 50 (Sfondo Azzurro ghiaccio)
  primary: "#26C6DA",            // Cyan 400 (Cian Vibrante)
  onSurface: "#006064",          // Cyan 900 (Testo scuro "Petrolio")
  onSurfaceVariant: "#4DD0E1"    // Cyan 300 (Testo secondario)
};

// uniqueAuthorsTimeline theme
export const purpleTheme = {
  surf: '#9575CD',
  prm: '#7E57C2'
};