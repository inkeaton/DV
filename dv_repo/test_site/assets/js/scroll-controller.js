/**
 * assets/js/scroll-controller.js
 * ============================================================================
 * SCROLLYTELLING CONTROLLER
 * 
 * This module handles scroll-based step detection for scrollytelling pages.
 * It tracks which narrative step is currently in view and triggers 
 * visualization updates accordingly.
 * 
 * Features:
 * - Viewport-based step detection
 * - Debounced scroll handling for performance
 * - Custom event dispatching for step changes
 * - Progress dot indicator support
 * 
 * Usage:
 *   import { initScrollController } from './scroll-controller.js';
 *   
 *   const controller = initScrollController({
 *     onStepChange: (stepNum, stepElement) => {
 *       // Update visualization based on step
 *     }
 *   });
 * ============================================================================
 */

/**
 * Initialize the scroll controller for a scrollytelling section
 * @param {Object} options - Configuration options
 * @param {Function} options.onStepChange - Callback when active step changes
 * @param {string} options.stepSelector - CSS selector for step elements (default: '.scrolly-step')
 * @param {number} options.viewportOffset - Fraction of viewport for trigger point (default: 0.5)
 * @returns {Object} Controller object with methods for cleanup
 */
export function initScrollController(options = {}) {
  const {
    onStepChange = () => {},
    stepSelector = '.scrolly-step',
    viewportOffset = 0.5
  } = options;

  // Get all step elements
  const steps = document.querySelectorAll(stepSelector);
  if (steps.length === 0) {
    console.warn('ScrollController: No steps found with selector', stepSelector);
    return { destroy: () => {} };
  }

  // Track current active step
  let currentStep = -1;

  /**
   * Determines which step is currently active based on scroll position
   * Uses the viewport middle as the trigger point
   * @returns {number} Index of the active step, or -1 if none
   */
  function pickActiveStep() {
    const viewportMiddle = window.innerHeight * viewportOffset;
    
    for (let i = steps.length - 1; i >= 0; i--) {
      const rect = steps[i].getBoundingClientRect();
      // Check if step's top is above viewport middle
      if (rect.top <= viewportMiddle) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Updates the active step styling and triggers callback
   * @param {number} stepNum - Index of the newly active step
   */
  function updateStep(stepNum) {
    if (stepNum === currentStep) return;

    // Remove active class from all steps
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === stepNum);
    });

    // Update progress dots if present
    const dots = document.querySelectorAll('.scrolly-progress-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === stepNum);
    });

    // Update current step tracker
    const previousStep = currentStep;
    currentStep = stepNum;

    // Trigger callback with step info
    if (stepNum >= 0 && stepNum < steps.length) {
      onStepChange(stepNum, steps[stepNum], previousStep);
    }

    // Dispatch custom event for other components to listen
    document.dispatchEvent(new CustomEvent('scrolly-step-change', {
      detail: {
        stepIndex: stepNum,
        stepElement: steps[stepNum],
        previousStep: previousStep,
        totalSteps: steps.length
      }
    }));
  }

  /**
   * Scroll and resize event handler (debounced)
   */
  let ticking = false;
  function onScrollOrResize() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const activeStep = pickActiveStep();
        updateStep(activeStep);
        ticking = false;
      });
      ticking = true;
    }
  }

  // Attach event listeners
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  // Initial check
  onScrollOrResize();

  // Return controller object with cleanup method
  return {
    /**
     * Get the current active step index
     * @returns {number} Current step index
     */
    getCurrentStep: () => currentStep,

    /**
     * Get total number of steps
     * @returns {number} Total steps
     */
    getTotalSteps: () => steps.length,

    /**
     * Manually trigger a step update check
     */
    update: () => onScrollOrResize(),

    /**
     * Clean up event listeners
     */
    destroy: () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    }
  };
}

/**
 * Creates progress indicator dots for scrollytelling
 * @param {number} totalSteps - Number of steps to create dots for
 * @param {string} containerId - ID of the container to append dots to (optional)
 */
export function createProgressDots(totalSteps, containerId = null) {
  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'scrolly-progress';
  progressContainer.setAttribute('role', 'navigation');
  progressContainer.setAttribute('aria-label', 'Story progress');

  // Get all step elements for click navigation
  const steps = document.querySelectorAll('.scrolly-step');

  // Create dots
  for (let i = 0; i < totalSteps; i++) {
    const dot = document.createElement('div');
    dot.className = 'scrolly-progress-dot';
    dot.setAttribute('aria-label', `Step ${i + 1} of ${totalSteps}`);
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.style.cursor = 'pointer';
    if (i === 0) dot.classList.add('is-active');
    
    // Add click handler to scroll to corresponding step
    dot.addEventListener('click', () => {
      if (steps[i]) {
        steps[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    // Add keyboard support
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (steps[i]) {
          steps[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
    
    progressContainer.appendChild(dot);
  }

  // Append to container or body
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(progressContainer);
    }
  } else {
    document.body.appendChild(progressContainer);
  }

  return progressContainer;
}
