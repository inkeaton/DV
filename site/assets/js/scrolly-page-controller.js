/**
 * assets/js/scrolly-page-controller.js
 * ============================================================================
 * SCROLLYTELLING PAGE CONTROLLER
 * 
 * This module provides a unified initialization function for scrollytelling
 * pages. It handles:
 * - D3.js loading
 * - Visualization initialization
 * - Progress dots creation
 * - Scroll controller setup
 * - Mobile modal integration
 * 
 * Each scrollytelling HTML page imports this module and calls initScrollyPage()
 * with the appropriate visualization class.
 * ============================================================================
 */

import { loadD3 } from './visualization-base.js';
import { initScrollController, createProgressDots } from './scroll-controller.js';

/**
 * Initialize a scrollytelling page with visualization and scroll handling
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.VisualizationClass - The visualization class constructor
 * @param {string} config.containerId - ID of the main visualization container (default: 'scrolly-vis')
 * @param {string} config.modalId - ID of the plot-modal element (default: 'plot-modal')
 * @param {string} config.modalContainerId - ID of the modal's visualization container (default: 'plot-modal-vis')
 * @returns {Promise<Object>} Object with { visualization, modalVisualization, d3 }
 * 
 * @example
 * import { initScrollyPage } from '../assets/js/scrolly-page-controller.js';
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
    modalId = 'plot-modal',
    modalContainerId = 'plot-modal-vis'
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

  // Initialize modal integration
  const modal = document.querySelector(modalId.startsWith('#') ? modalId : `#${modalId}`);
  let modalVisualization = null;

  if (modal && modal.setVisualization && modal.getContainer) {
    // If using the plot-modal web component
    // Get the actual container element from the shadow DOM
    const modalContainer = modal.getContainer();
    if (modalContainer) {
      modalVisualization = new VisualizationClass(modalContainer);
      await modalVisualization.init(d3);
      modal.setVisualization(modalVisualization);
    }
  } else if (modal) {
    // Fallback for non-component modal (legacy support)
    modalVisualization = await setupLegacyModal(modal, VisualizationClass, modalContainerId, d3);
  }

  // Bind show-plot buttons to modal
  document.querySelectorAll('.show-plot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIndex = parseInt(btn.dataset.step, 10);
      if (modal && modal.open) {
        modal.open(stepIndex);
      } else if (modal) {
        // Legacy modal handling
        openLegacyModal(modal, modalVisualization, stepIndex);
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

/**
 * Setup legacy modal (for pages not yet using plot-modal component)
 * @private
 */
async function setupLegacyModal(modal, VisualizationClass, containerId, d3) {
  const modalVis = new VisualizationClass(containerId);
  await modalVis.init(d3);

  const modalClose = modal.querySelector('.plot-modal-close, #plot-modal-close');
  const landscapeToast = document.getElementById('landscape-toast');

  // Close button
  if (modalClose) {
    modalClose.addEventListener('click', () => closeLegacyModal(modal));
  }

  // Backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLegacyModal(modal);
    }
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeLegacyModal(modal);
    }
  });

  // Store toast reference for showing
  modal._landscapeToast = landscapeToast;

  return modalVis;
}

/**
 * Open legacy modal
 * @private
 */
function openLegacyModal(modal, visualization, stepIndex) {
  if (visualization) {
    visualization.transitionToStep(stepIndex, null, -1);
  }

  modal.classList.add('is-open');
  document.body.classList.add('modal-open');

  // Show landscape toast in portrait mode
  const toast = modal._landscapeToast;
  if (toast && window.innerHeight > window.innerWidth) {
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.add('is-hiding');
      setTimeout(() => {
        toast.classList.remove('is-visible', 'is-hiding');
      }, 300);
    }, 3000);
  }
}

/**
 * Close legacy modal
 * @private
 */
function closeLegacyModal(modal) {
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}
