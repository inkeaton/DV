/**
 * assets/js/visualization-base.js
 * ============================================================================
 * BASE VISUALIZATION MODULE
 * 
 * This module provides a base class/utilities for building scrollytelling
 * visualizations. It handles:
 * - D3.js loading
 * - Theme-aware color management
 * - Step-based state transitions
 * - Responsive resize handling
 * 
 * Each scrollytelling page (student, researcher) will import this module
 * and use it as the foundation for their visualizations.
 * ============================================================================
 */

/**
 * Dynamically loads D3.js from CDN
 * @returns {Promise<Object>} D3.js library object
 */
export async function loadD3() {
  const d3Module = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  return d3Module.default || d3Module;
}

/**
 * Get theme-aware colors from CSS custom properties
 * Call this function whenever you need colors to ensure theme consistency
 * @returns {Object} Object containing color values for visualizations
 */
export function getThemeColors() {
  const styles = getComputedStyle(document.body);
  
  return {
    // Primary colors
    primary: styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A',
    onPrimary: styles.getPropertyValue('--md-sys-color-on-primary').trim() || '#FFFFFF',
    primaryContainer: styles.getPropertyValue('--md-sys-color-primary-container').trim() || '#ADECFF',
    onPrimaryContainer: styles.getPropertyValue('--md-sys-color-on-primary-container').trim() || '#001F26',
    
    // Secondary colors
    secondary: styles.getPropertyValue('--md-sys-color-secondary').trim() || '#4B6269',
    secondaryContainer: styles.getPropertyValue('--md-sys-color-secondary-container').trim() || '#CEE7EF',
    
    // Tertiary colors
    tertiary: styles.getPropertyValue('--md-sys-color-tertiary').trim() || '#575C7E',
    tertiaryContainer: styles.getPropertyValue('--md-sys-color-tertiary-container').trim() || '#DEE1FF',
    
    // Surface colors
    surface: styles.getPropertyValue('--md-sys-color-surface').trim() || '#F5FAFC',
    surfaceContainer: styles.getPropertyValue('--md-sys-color-surface-container').trim() || '#E9EFF1',
    surfaceContainerHigh: styles.getPropertyValue('--md-sys-color-surface-container-high').trim() || '#E4E9EB',
    
    // On-surface colors
    onSurface: styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#171C1E',
    onSurfaceVariant: styles.getPropertyValue('--md-sys-color-on-surface-variant').trim() || '#3F484B',
    
    // Outline colors
    outline: styles.getPropertyValue('--md-sys-color-outline').trim() || '#70797C',
    outlineVariant: styles.getPropertyValue('--md-sys-color-outline-variant').trim() || '#BFC8CB'
  };
}

/**
 * Base visualization class for scrollytelling
 * Extend this class to create step-based visualizations
 */
export class ScrollyVisualization {
  /**
   * @param {string} containerId - ID of the container element for the visualization
   */
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.svg = null;
    this.d3 = null;
    this.currentStep = -1;
    this.isInitialized = false;
    
    if (!this.container) {
      console.error(`Visualization container '${containerId}' not found`);
    }
  }

  /**
   * Initialize the visualization
   * Override this method in subclasses to set up the visualization
   * @param {Object} d3 - D3.js library reference
   */
  async init(d3) {
    this.d3 = d3;
    this.isInitialized = true;
    
    // Set up resize observer for responsive updates
    this.setupResizeObserver();
    
    // Set up theme change observer
    this.setupThemeObserver();
  }

  /**
   * Set up resize observer for responsive visualization
   */
  setupResizeObserver() {
    if (!this.container) return;
    
    let resizeTimeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.isInitialized) {
          this.resize();
        }
      }, 250);
    });
    
    resizeObserver.observe(this.container);
    this.resizeObserver = resizeObserver;
  }

  /**
   * Set up mutation observer to detect theme changes
   */
  setupThemeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTimeout(() => {
            if (this.isInitialized) {
              this.onThemeChange();
            }
          }, 50);
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    this.themeObserver = observer;
  }

  /**
   * Get container dimensions
   * @returns {Object} { width, height } of container
   */
  getDimensions() {
    if (!this.container) return { width: 0, height: 0 };
    
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
  }

  /**
   * Get current theme colors
   * @returns {Object} Theme color values
   */
  getColors() {
    return getThemeColors();
  }

  /**
   * Transition to a specific step
   * Override this method in subclasses to handle step transitions
   * @param {number} stepIndex - Index of the step to transition to
   * @param {HTMLElement} stepElement - The step DOM element
   * @param {number} previousStep - Previous step index
   */
  transitionToStep(stepIndex, stepElement, previousStep) {
    this.currentStep = stepIndex;
    // Override in subclass to implement step-specific transitions
  }

  /**
   * Handle window resize
   * Override this method in subclasses to handle resize
   */
  resize() {
    // Override in subclass
  }

  /**
   * Handle theme change
   * Override this method in subclasses to update colors
   */
  onThemeChange() {
    // Override in subclass
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

/**
 * Creates a standard tooltip for visualizations
 * @param {Object} d3 - D3.js library reference
 * @param {string} className - CSS class name for the tooltip
 * @returns {Object} Tooltip control object with show/hide methods
 */
export function createTooltip(d3, className = 'vis-tooltip') {
  return {
    /**
     * Show the tooltip
     * @param {Event} event - Mouse event
     * @param {string} content - HTML content for tooltip
     * @param {Object} colors - Theme colors object
     */
    show(event, content, colors) {
      const tooltip = d3.select('body').selectAll(`.${className}`).data([0]);
      const tooltipEnter = tooltip.enter()
        .append('div')
        .attr('class', className)
        .style('position', 'absolute')
        .style('background', colors.surfaceContainer)
        .style('color', colors.onSurface)
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('z-index', '1000')
        .style('max-width', '250px');

      tooltipEnter.merge(tooltip)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`)
        .html(content);
    },

    /**
     * Hide the tooltip
     */
    hide() {
      d3.select(`.${className}`).remove();
    }
  };
}
