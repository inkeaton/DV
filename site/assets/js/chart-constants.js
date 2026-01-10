/**
 * assets/js/chart-constants.js
 * ============================================================================
 * CHART CONSTANTS MODULE
 * 
 * Centralized constants for D3 visualizations to ensure consistency
 * across all charts and simplify maintenance.
 * ============================================================================
 */

/**
 * Default animation duration in milliseconds
 * Used for transitions, bar animations, fade-ins, etc.
 */
export const ANIMATION_DURATION = 800;

/**
 * Year range for time-series visualizations
 * Most charts in this project span 1990-2024
 */
export const YEAR_RANGE = {
  min: 1990,
  max: 2024
};

/**
 * Default Y-axis tick values for paper count charts
 * Provides consistent scaling across related visualizations
 */
export const DEFAULT_Y_TICKS = [0, 40, 80, 120, 160];

/**
 * Default corner radius for bar charts
 */
export const BAR_CORNER_RADIUS = 2;

/**
 * Default margins presets for different chart types
 */
export const MARGIN_PRESETS = {
  standard: { top: 60, right: 30, bottom: 50, left: 60 },
  wide: { top: 60, right: 40, bottom: 50, left: 60 },
  compact: { top: 40, right: 20, bottom: 40, left: 50 },
  treemap: { top: 60, right: 10, bottom: 10, left: 10 }
};

/**
 * Tooltip styling defaults
 */
export const TOOLTIP_DEFAULTS = {
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  maxWidth: '250px'
};
