// scroll-controller.js
// ============================================================================
// SCROLL CONTROLLER FOR SCROLLYTELLING
// ============================================================================
// Uses the Intersection Observer API to track which narrative step is
// currently in the viewport and triggers corresponding visualization states.
//
// Inspired by R2D3 and similar scrollytelling implementations.
// ============================================================================

/**
 * Initialize the scroll controller
 * 
 * @param {object} visualization - The visualization object with state methods
 * @returns {object} Controller API for cleanup and debugging
 */
export function initScrollController(visualization) {
    // Get all scrolly steps
    const steps = Array.from(document.querySelectorAll('.scrolly-step'));
    const legend = document.getElementById('scrolly-legend');
    
    // Track current active step
    let currentStep = 0;
    
    // ========================================================================
    // ACTIVE STEP SELECTION (SCROLL-POSITION BASED)
    // ========================================================================
    // IntersectionObserver can fire multiple entries out-of-order when
    // scrolling quickly, especially upward. For deterministic behavior in both
    // directions, we derive the active step from the viewport center.
    let ticking = false;

    function pickActiveStep() {
        if (steps.length === 0) return 0;

        const viewportMiddle = window.innerHeight * 0.5;

        // Prefer steps that contain the viewport middle; fallback to the closest.
        let bestStep = 0;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const stepEl of steps) {
            const stepNum = parseInt(stepEl.dataset.step, 10);
            if (!Number.isFinite(stepNum)) continue;

            const rect = stepEl.getBoundingClientRect();
            const containsMiddle = rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;

            let distance;
            if (containsMiddle) {
                const rectMiddle = (rect.top + rect.bottom) / 2;
                distance = Math.abs(rectMiddle - viewportMiddle);
            } else if (rect.bottom < viewportMiddle) {
                distance = viewportMiddle - rect.bottom;
            } else {
                distance = rect.top - viewportMiddle;
            }

            // Give strong preference to containing-middle candidates.
            const weightedDistance = containsMiddle ? distance : distance + 10_000;
            if (weightedDistance < bestDistance) {
                bestDistance = weightedDistance;
                bestStep = stepNum;
            }
        }

        return bestStep;
    }

    function updateOnScroll() {
        const stepNum = pickActiveStep();
        if (stepNum && stepNum !== currentStep) updateStep(stepNum);
        ticking = false;
    }

    function onScrollOrResize() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateOnScroll);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    
    // ========================================================================
    // STEP UPDATE FUNCTION
    // ========================================================================
    function updateStep(stepNum) {
        const previousStep = currentStep;
        console.log(`[ScrollController] Transitioning to step ${stepNum}`);
        currentStep = stepNum;
        
        // Update CSS classes for active step
        steps.forEach(step => {
            const isActive = parseInt(step.dataset.step, 10) === stepNum;
            step.classList.toggle('is-active', isActive);
        });
        
        // Show/hide legend based on step
        if (legend) {
            const showLegend = stepNum >= 2 && stepNum <= 5;
            legend.classList.toggle('is-visible', showLegend);
        }
        
        // Trigger visualization state change
        if (visualization && typeof visualization.transitionToStep === 'function') {
            visualization.transitionToStep(stepNum);
        }
        
        // Dispatch custom event for other listeners
        document.dispatchEvent(new CustomEvent('scrolly-step-change', {
            detail: { step: stepNum, previousStep }
        }));
    }
    
    // ========================================================================
    // INITIAL STATE
    // ========================================================================
    // Set initial state based on current scroll position
    onScrollOrResize();
    
    // ========================================================================
    // CLEANUP FUNCTION
    // ========================================================================
    function destroy() {
        window.removeEventListener('scroll', onScrollOrResize);
        window.removeEventListener('resize', onScrollOrResize);
        console.log('[ScrollController] Destroyed');
    }
    
    // ========================================================================
    // DEBUG HELPERS
    // ========================================================================
    function getState() {
        return {
            currentStep,
            totalSteps: steps.length
        };
    }
    
    // Return controller API
    return {
        destroy,
        getState,
        goToStep: updateStep
    };
}

// ============================================================================
// ALTERNATIVE: SCROLL POSITION BASED CONTROLLER
// ============================================================================
// This is an alternative approach that uses scroll position directly
// rather than Intersection Observer. Useful for more fine-grained control.

/**
 * Create a scroll-position based controller (alternative implementation)
 * 
 * @param {object} visualization - The visualization object with state methods
 * @returns {object} Controller API
 */
export function initScrollPositionController(visualization) {
    const steps = document.querySelectorAll('.scrolly-step');
    const stepPositions = [];
    
    let currentStep = 0;
    let ticking = false;
    
    // Calculate step positions
    function calculatePositions() {
        stepPositions.length = 0;
        steps.forEach(step => {
            const rect = step.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            stepPositions.push({
                top: rect.top + scrollTop,
                bottom: rect.bottom + scrollTop,
                step: parseInt(step.dataset.step, 10)
            });
        });
    }
    
    // Determine which step is active based on scroll position
    function updateOnScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportMiddle = scrollY + window.innerHeight / 2;
        
        let activeStep = 0;
        
        for (let i = 0; i < stepPositions.length; i++) {
            const pos = stepPositions[i];
            if (viewportMiddle >= pos.top && viewportMiddle <= pos.bottom) {
                activeStep = pos.step;
                break;
            }
        }
        
        if (activeStep !== currentStep && activeStep !== 0) {
            currentStep = activeStep;
            
            // Update CSS classes
            steps.forEach(step => {
                const isActive = parseInt(step.dataset.step, 10) === currentStep;
                step.classList.toggle('is-active', isActive);
            });
            
            // Trigger visualization
            if (visualization && typeof visualization.transitionToStep === 'function') {
                visualization.transitionToStep(currentStep);
            }
        }
        
        ticking = false;
    }
    
    // Throttled scroll handler using requestAnimationFrame
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }
    
    // Initialize
    calculatePositions();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calculatePositions);
    
    return {
        destroy() {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', calculatePositions);
        },
        recalculate: calculatePositions,
        getState() {
            return { currentStep, totalSteps: steps.length };
        }
    };
}
