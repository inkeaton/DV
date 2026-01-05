/**
 * assets/js/visualization-base.js
 * ============================================================================
 * BASE VISUALIZATION MODULE
 * 
 * This module provides a base class/utilities for building scrollytelling
 * visualizations. It handles:
 * - D3.js loading
 * - SVG creation and management
 * - Theme-aware color management
 * - Step-based state transitions with registered render functions
 * - Responsive resize handling
 * - Built-in tooltip management
 * 
 * Each scrollytelling page extends ScrollyVisualization and registers
 * step configurations to create a complete visualization experience.
 * 
 * ============================================================================
 * HOW TO ADD A NEW PLOT
 * ============================================================================
 * 
 * 1. Create a new file in the section's plots/ folder (e.g., papers/plots/myNewPlot.js)
 *    
 *    ```javascript
 *    // myNewPlot.js
 *    import { myNewPlotData } from '../../data/papers/myNewPlotData.js';
 *    
 *    export const myNewPlotConfig = {
 *      data: myNewPlotData,
 *      margins: { left: 60, right: 40 },  // Optional custom margins
 *      render: (ctx) => {
 *        const { g, d3, width, height, colors, tooltip, data } = ctx;
 *        // Your D3 rendering code here
 *      }
 *    };
 *    ```
 * 
 * 2. Create the data file in data/[section]/ folder
 *    
 *    ```javascript
 *    // data/papers/myNewPlotData.js
 *    export const myNewPlotData = [...];
 *    ```
 * 
 * 3. Import and register the plot in the section's visualization file
 *    
 *    ```javascript
 *    // papersVisualization.js
 *    import { myNewPlotConfig } from './plots/myNewPlot.js';
 *    
 *    // In constructor:
 *    this.registerSteps([
 *      ...existingSteps,
 *      myNewPlotConfig
 *    ]);
 *    ```
 * 
 * 4. Add the corresponding HTML step in the section's HTML file
 *    
 *    ```html
 *    <div class="scrolly-step" data-step="N">
 *      <div class="scrolly-step-content">
 *        <h2>My New Plot Title</h2>
 *        <p>Description of what this visualization shows.</p>
 *      </div>
 *      <button class="show-plot-btn" data-step="N">
 *        <md-icon>bar_chart</md-icon>
 *        Show Plot
 *      </button>
 *    </div>
 *    ```
 * 
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
   * Default margins for visualizations
   * Can be overridden per-step via step config
   */
  static DEFAULT_MARGIN = { top: 60, right: 40, bottom: 60, left: 60 };

  /**
   * @param {string|HTMLElement} containerOrId - ID of the container element or the element itself
   * @param {Object} options - Optional configuration { tooltipClass }
   */
  constructor(containerOrId, options = {}) {
    // Accept either an ID string or a DOM element
    if (typeof containerOrId === 'string') {
      this.containerId = containerOrId;
      this.container = document.getElementById(containerOrId);
    } else if (containerOrId instanceof HTMLElement) {
      this.containerId = containerOrId.id || 'visualization-container';
      this.container = containerOrId;
    } else {
      this.containerId = 'unknown';
      this.container = null;
    }
    
    this.svg = null;
    this.g = null;
    this.d3 = null;
    this.currentStep = -1;
    this.isInitialized = false;
    this.stepConfigs = [];
    this.tooltipClass = options.tooltipClass || 'vis-tooltip';
    this.tooltip = null;
    
    // Margins
    this.defaultMargin = { ...ScrollyVisualization.DEFAULT_MARGIN };
    this.margin = { ...this.defaultMargin };
    
    if (!this.container) {
      console.warn(`Visualization container '${this.containerId}' not found`);
    }
  }

  /**
   * Register step configurations for the visualization
   * Each step config defines: { render, data, margins }
   * @param {Array} stepConfigs - Array of step configuration objects
   */
  registerSteps(stepConfigs) {
    this.stepConfigs = stepConfigs;
  }

  /**
   * Initialize the visualization
   * @param {Object} d3 - D3.js library reference
   */
  async init(d3) {
    this.d3 = d3;
    this.isInitialized = true;
    
    // Create tooltip
    this.tooltip = createTooltip(d3, this.tooltipClass);
    
    // Set up resize observer for responsive updates
    this.setupResizeObserver();
    
    // Set up theme change observer
    this.setupThemeObserver();
    
    // Only create SVG and render if container is visible (has dimensions)
    // This handles cases like modal containers that are hidden on init
    const { width, height } = this.getDimensions();
    if (width > 0 && height > 0) {
      // Create SVG
      this.createSvg();
      
      // Render first step
      if (this.stepConfigs.length > 0) {
        this.transitionToStep(0, null, -1);
      }
    }
  }

  /**
   * Create or recreate the SVG element
   */
  createSvg() {
    const { width, height } = this.getDimensions();
    
    if (this.svg) {
      this.svg.remove();
    }

    this.svg = this.d3.select(this.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img');

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  /**
   * Get inner dimensions (minus margins)
   * Ensures dimensions are never negative to prevent D3 rendering errors
   * @returns {Object} { width, height } inner dimensions
   */
  getInnerDimensions() {
    const { width, height } = this.getDimensions();
    return {
      width: Math.max(0, width - this.margin.left - this.margin.right),
      height: Math.max(0, height - this.margin.top - this.margin.bottom)
    };
  }

  /**
   * Set margins for the current visualization and update group transform
   * @param {Object} customMargin - Custom margin values to merge with defaults
   */
  setMargins(customMargin) {
    this.margin = { ...this.defaultMargin, ...customMargin };
    if (this.g) {
      this.g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }
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
   * Clears the current visualization and renders the registered step
   * @param {number} stepIndex - Index of the step to transition to
   * @param {HTMLElement} stepElement - The step DOM element (optional)
   * @param {number} previousStep - Previous step index
   */
  transitionToStep(stepIndex, stepElement, previousStep) {
    this.currentStep = stepIndex;
    
    // Validate step index
    if (stepIndex < 0 || stepIndex >= this.stepConfigs.length) {
      console.warn(`Invalid step index: ${stepIndex}`);
      return;
    }
    
    // Skip rendering if SVG hasn't been created (container hidden/zero dimensions)
    if (!this.svg || !this.g) {
      return;
    }
    
    const stepConfig = this.stepConfigs[stepIndex];
    
    // Apply step-specific margins if defined
    if (stepConfig.margins) {
      this.setMargins(stepConfig.margins);
    } else {
      this.setMargins({});
    }
    
    // Clear current visualization content
    this.g.selectAll('*').remove();
    
    // Remove any existing zoom behavior from SVG to prevent it from persisting across steps
    // This ensures each step starts with a clean slate
    this.svg.on('.zoom', null);
    
    // Remove zoom control buttons (they're added to SVG, not g)
    this.svg.selectAll('.zoom-controls').remove();
    
    // Reset transform to proper margin position (not null, as that would break positioning)
    // This clears any zoom/pan transforms while maintaining the margin offset
    this.g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    
    // Build render context
    const { width, height } = this.getInnerDimensions();
    const ctx = {
      g: this.g,
      svg: this.svg,
      d3: this.d3,
      tooltip: this.tooltip,
      width,
      height,
      colors: this.getColors(),
      data: stepConfig.data
    };
    
    // Call the render function
    if (stepConfig.render && typeof stepConfig.render === 'function') {
      stepConfig.render(ctx);
    }
  }

  /**
   * Handle window resize or when container becomes visible
   * Recreates SVG and re-renders current step
   */
  resize() {
    if (!this.isInitialized) return;
    
    const { width, height } = this.getDimensions();
    if (width <= 0 || height <= 0) return;
    
    this.createSvg();
    
    if (this.currentStep >= 0 && this.currentStep < this.stepConfigs.length) {
      this.transitionToStep(this.currentStep, null, this.currentStep);
    }
  }

  /**
   * Handle theme change
   * Re-renders current step with new colors
   */
  onThemeChange() {
    if (!this.isInitialized) return;
    
    if (this.currentStep >= 0 && this.currentStep < this.stepConfigs.length) {
      this.transitionToStep(this.currentStep, null, this.currentStep);
    }
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
    if (this.tooltip) {
      this.tooltip.hide();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Get the number of registered steps
   * @returns {number} Number of steps
   */
  getStepCount() {
    return this.stepConfigs.length;
  }
}

/**
 * Creates a standard tooltip for visualizations
 * Styles are defined in chart-styles.css
 * @param {Object} d3 - D3.js library reference
 * @param {string} className - CSS class name for the tooltip
 * @returns {Object} Tooltip control object with show/hide methods
 */
export function createTooltip(d3, className = 'vis-tooltip') {
  // Always include the base tooltip class so shared styles apply; allow an optional
  // section-specific class (e.g., 'papers-tooltip') for accent borders.
  const classes = className === 'vis-tooltip'
    ? 'vis-tooltip'
    : `vis-tooltip ${className}`;
  const selector = classes.split(' ').map((c) => `.${c}`).join('');

  return {
    /**
     * Show the tooltip
     * @param {Event} event - Mouse event
     * @param {string} content - HTML content for tooltip
     */
    show(event, content) {
      const tooltip = d3.select('body').selectAll(selector).data([0]);
      const tooltipEnter = tooltip.enter()
        .append('div')
        .attr('class', classes);

      tooltipEnter.merge(tooltip)
        .style('display', 'block')
        .style('opacity', '1')
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`)
        .html(content);
    },

    /**
     * Hide the tooltip
     */
    hide() {
      d3.selectAll(selector).remove();
    }
  };
}
