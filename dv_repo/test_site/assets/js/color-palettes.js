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
  infovis: '#4285F4',  // Blue
  scivis: '#34A853',   // Green
  vast: '#FBBC04'      // Yellow/Gold
};

/**
 * Labels for VIS conference tracks
 */
export const trackLabels = {
  infovis: 'InfoVis',
  scivis: 'SciVis',
  vast: 'VAST'
};

/**
 * Conference colors (alias for trackColors for clarity)
 */
export const conferenceColors = {
  infovis: '#4285F4',  // Blue
  scivis: '#34A853',   // Green
  vast: '#FBBC04'      // Yellow/Gold
};

// ============================================================================
// PUBLICATION TYPE COLORS (Papers section)
// ============================================================================

/**
 * Colors for publication types
 */
export const publicationColors = {
  journal: '#6750a4',      // Primary purple
  conference: '#4285F4',   // Blue
  workshop: '#7c4dff'      // Light purple
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
