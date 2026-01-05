/**
 * assets/js/scrolly-initializer.js
 * ============================================================================
 * SCROLLYTELLING PAGE INITIALIZER
 * 
 * This module provides a unified initialization function for scrollytelling
 * pages. It handles:
 * - D3.js loading
 * - Visualization initialization
 * - Progress dots creation
 * - Scroll controller setup
 * - Mobile modal integration (via <plot-modal> web component)
 * 
 * Each scrollytelling HTML page imports this module and calls initScrollyPage()
 * with the appropriate visualization class.
 * ============================================================================
 */

import { loadD3 } from './visualization-base.js';
import { initScrollController, createProgressDots } from './scrolly-observer.js';

/**
 * Initialize a scrollytelling page with visualization and scroll handling
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.VisualizationClass - The visualization class constructor
 * @param {string} config.containerId - ID of the main visualization container (default: 'scrolly-vis')
 * @param {string} config.modalId - ID of the plot-modal element (default: 'plot-modal')
 * @returns {Promise<Object>} Object with { visualization, modalVisualization, d3, controller }
 * 
 * @example
 * import { initScrollyPage } from '../assets/js/scrolly-initializer.js';
 * import { PapersVisualization } from './plots/papersVisualization.js';
 * 
 * document.addEventListener('DOMContentLoaded', async () => {
 *   await initScrollyPage({
 *     VisualizationClass: PapersVisualization
 *   });
 * });
 */
export async function initScrollyPage(config) {
  const {
    VisualizationClass,
    containerId = 'scrolly-vis',
    modalId = 'plot-modal'
  } = config;

  // Load D3.js
  const d3 = await loadD3();

  // Initialize main visualization
  const visualization = new VisualizationClass(containerId);
  await visualization.init(d3);

  // Count steps and create progress dots
  const steps = document.querySelectorAll('.scrolly-step');
  createProgressDots(steps.length);

  // Initialize scroll controller
  const controller = initScrollController({
    onStepChange: (stepIndex, stepElement, previousStep) => {
      visualization.transitionToStep(stepIndex, stepElement, previousStep);
    }
  });

  // Initialize modal integration (using <plot-modal> web component)
  const modal = document.querySelector(modalId.startsWith('#') ? modalId : `#${modalId}`);
  let modalVisualization = null;

  if (modal && modal.setVisualization && modal.getContainer) {
    const modalContainer = modal.getContainer();
    if (modalContainer) {
      modalVisualization = new VisualizationClass(modalContainer);
      await modalVisualization.init(d3);
      modal.setVisualization(modalVisualization);
    }
  }

  // Bind show-plot buttons to modal
  document.querySelectorAll('.show-plot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIndex = parseInt(btn.dataset.step, 10);
      if (modal && modal.open) {
        modal.open(stepIndex);
      }
    });
  });

  return {
    visualization,
    modalVisualization,
    d3,
    controller
  };
}
