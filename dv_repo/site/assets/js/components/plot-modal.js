/**
 * assets/js/components/plot-modal.js
 * ============================================================================
 * PLOT MODAL WEB COMPONENT
 * 
 * A reusable web component that provides a fullscreen modal for displaying
 * visualizations on mobile devices. Features:
 * - Fullscreen overlay with animation
 * - Close button (X)
 * - Backdrop click to close
 * - Keyboard (Escape) to close
 * - Landscape orientation suggestion toast
 * - Integration with ScrollyVisualization via setVisualization()
 * 
 * Usage:
 *   <plot-modal id="plot-modal"></plot-modal>
 * 
 *   // In JavaScript:
 *   const modal = document.getElementById('plot-modal');
 *   modal.setVisualization(myVisualization);
 *   modal.open(stepIndex);
 * ============================================================================
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: none;
    }
    
    :host(.is-open) {
      display: block;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--md-sys-color-surface, #fff);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    :host(.is-open) .modal-backdrop {
      opacity: 1;
      transform: scale(1);
    }
    
    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 48px;
      height: 48px;
      background-color: var(--md-sys-color-surface-container-high, #e4e9eb);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      transition: background-color 0.2s;
    }
    
    .close-button:hover {
      background-color: var(--md-sys-color-surface-container-highest, #dfe4e6);
    }
    
    .close-button svg {
      width: 24px;
      height: 24px;
      fill: var(--md-sys-color-on-surface, #171c1e);
    }
    
    .vis-container {
      width: 100%;
      height: 100%;
      max-width: calc(100% - 2rem);
      max-height: calc(100% - 4rem);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .vis-container .scrolly-vis {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }
    
    .landscape-toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100%);
      background-color: var(--md-sys-color-inverse-surface, #2e3132);
      color: var(--md-sys-color-inverse-on-surface, #eff1f1);
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      z-index: 1002;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      text-align: center;
      max-width: 80%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .landscape-toast.is-visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    
    .landscape-toast.is-hiding {
      opacity: 0;
      transform: translateX(-50%) translateY(100%);
    }
    
    .landscape-toast svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      flex-shrink: 0;
    }
  </style>
  
  <div class="modal-backdrop" part="backdrop">
    <button class="close-button" part="close-button" aria-label="Close modal">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
    
    <div class="vis-container" part="container">
      <div id="plot-modal-vis" class="scrolly-vis"></div>
    </div>
    
    <div class="landscape-toast" part="toast">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.38zm-7.31.29l-1.33 1.33.66.03c6.29 0 11.44-4.84 11.94-11H16.5c-.36 3.76-2.7 6.93-5.97 8.48l-.01-.04z"/>
      </svg>
      <span>Rotate to landscape for a better view</span>
    </div>
  </div>
`;

class PlotModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    this._visualization = null;
    this._currentStep = -1;
    
    // Bind methods
    this._handleClose = this._handleClose.bind(this);
    this._handleBackdropClick = this._handleBackdropClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
  }
  
  connectedCallback() {
    // Set up event listeners
    const closeBtn = this.shadowRoot.querySelector('.close-button');
    const backdrop = this.shadowRoot.querySelector('.modal-backdrop');
    
    closeBtn.addEventListener('click', this._handleClose);
    backdrop.addEventListener('click', this._handleBackdropClick);
    document.addEventListener('keydown', this._handleKeydown);
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    document.removeEventListener('keydown', this._handleKeydown);
  }
  
  /**
   * Get the internal visualization container element
   * Used by scrolly-page-controller to pass to the visualization constructor
   * @returns {HTMLElement} The container element inside the shadow DOM
   */
  getContainer() {
    return this.shadowRoot.querySelector('#plot-modal-vis');
  }
  
  /**
   * Set the visualization instance to render inside the modal
   * @param {ScrollyVisualization} visualization - The visualization instance
   */
  setVisualization(visualization) {
    this._visualization = visualization;
  }
  
  /**
   * Open the modal and render the specified step
   * @param {number} stepIndex - The step index to render
   */
  open(stepIndex) {
    this._currentStep = stepIndex;
    
    // Show modal first so container has dimensions
    this.classList.add('is-open');
    document.body.classList.add('modal-open');
    
    // Wait for next frame so dimensions are available, then render
    requestAnimationFrame(() => {
      if (this._visualization) {
        // Recreate SVG with correct dimensions now that modal is visible
        this._visualization.resize();
        this._visualization.transitionToStep(stepIndex, null, -1);
      }
    });
    
    // Show landscape toast if in portrait
    this._showLandscapeToast();
  }
  
  /**
   * Close the modal
   */
  close() {
    this.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }
  
  /**
   * Check if modal is currently open
   * @returns {boolean}
   */
  get isOpen() {
    return this.classList.contains('is-open');
  }
  
  /**
   * Get the current step index
   * @returns {number}
   */
  get currentStep() {
    return this._currentStep;
  }
  
  _handleClose() {
    this.close();
  }
  
  _handleBackdropClick(e) {
    // Only close if clicking directly on backdrop, not on children
    if (e.target === e.currentTarget) {
      this.close();
    }
  }
  
  _handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }
  
  _showLandscapeToast() {
    // Only show in portrait mode
    if (window.innerHeight > window.innerWidth) {
      const toast = this.shadowRoot.querySelector('.landscape-toast');
      toast.classList.add('is-visible');
      
      setTimeout(() => {
        toast.classList.add('is-hiding');
        setTimeout(() => {
          toast.classList.remove('is-visible', 'is-hiding');
        }, 300);
      }, 3000);
    }
  }
}

// Register the custom element
customElements.define('plot-modal', PlotModal);

export { PlotModal };
