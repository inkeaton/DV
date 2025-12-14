// visualization.js
// ============================================================================
// D3.JS SCROLLYTELLING VISUALIZATION
// ============================================================================
// A multi-state D3 visualization that transitions between different views
// based on the current scroll position. Inspired by R2D3.
//
// Features:
// - Mock data representing "coffee consumption by country"
// - Multiple visualization states (scatter, highlight, histogram, comparison, line)
// - Smooth D3 transitions between states
// - Theme-aware colors from Material Design CSS variables
// ============================================================================

import { renderScatter } from './plots/scatter.js';
import { highlightEurope } from './plots/highlight-europe.js';
import { renderHistogram } from './plots/histogram.js';
import { renderComparison } from './plots/comparison.js';
import { renderTrendLine } from './plots/trend.js';
import { renderSummary } from './plots/summary.js';

import { mockData } from './data/mockData.js';
import { trendData } from './data/trendData.js';

/**
 * Initialize the scrollytelling visualization
 * 
 * @param {string} containerId - The ID of the container element
 * @returns {object} Visualization API with transition methods
 */
export async function initVisualization(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[Visualization] Container #${containerId} not found`);
        return null;
    }

    // ========================================================================
    // DYNAMIC D3 IMPORT
    // ========================================================================
    let d3;
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
        d3 = mod.default || mod;
    } catch (err) {
        console.error('[Visualization] Failed to load D3:', err);
        return null;
    }

    // Data is imported from ./data/* to keep plots focused on rendering.

    // ========================================================================
    // SVG SETUP
    // ========================================================================
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    let width, height, innerWidth, innerHeight;

    const svg = d3.select(container)
        .append('svg')
        .attr('class', 'scrolly-svg');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create groups for different visualization layers
    const axisGroup = g.append('g').attr('class', 'axis-group');
    const dataGroup = g.append('g').attr('class', 'data-group');
    const annotationGroup = g.append('g').attr('class', 'annotation-group');

    // ========================================================================
    // THEME-AWARE COLORS
    // ========================================================================
    function getColors() {
        const styles = getComputedStyle(document.body);
        return {
            primary: styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A',
            tertiary: styles.getPropertyValue('--md-sys-color-tertiary').trim() || '#575C7E',
            onSurface: styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#171C1E',
            onSurfaceVariant: styles.getPropertyValue('--md-sys-color-on-surface-variant').trim() || '#3F484B',
            outline: styles.getPropertyValue('--md-sys-color-outline').trim() || '#70797C',
            primaryContainer: styles.getPropertyValue('--md-sys-color-primary-container').trim() || '#ADECFF',
            tertiaryContainer: styles.getPropertyValue('--md-sys-color-tertiary-container').trim() || '#DEE1FF',
        };
    }

    // ========================================================================
    // RESIZE HANDLER
    // ========================================================================
    let resizeRaf = 0;
    function resize() {
        const rect = container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        innerWidth = width - margin.left - margin.right;
        innerHeight = height - margin.top - margin.bottom;

        svg.attr('width', width).attr('height', height);

        // Re-render current step after resize so axes/scales stay correct.
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            if (currentStep) transitionToStep(currentStep);
        });
    }

    resize();
    window.addEventListener('resize', resize);

    // ========================================================================
    // CURRENT STATE
    // ========================================================================
    let currentStep = 0;

    // Prevent late async work (timeouts / transitions) from applying after a
    // new step is selected (common when scrolling back upward quickly).
    let transitionToken = 0;
    const pendingTimeouts = new Set();

    function clearLayers() {
        axisGroup.selectAll('*').remove();
        dataGroup.selectAll('*').remove();
        annotationGroup.selectAll('*').remove();
    }

    function cancelPendingWork() {
        for (const id of pendingTimeouts) window.clearTimeout(id);
        pendingTimeouts.clear();

        // Stop any in-flight D3 transitions so they can't finish later.
        svg.selectAll('*').interrupt();
    }

    function schedule(fn, ms, tokenAtSchedule) {
        const id = window.setTimeout(() => {
            pendingTimeouts.delete(id);
            if (tokenAtSchedule !== transitionToken) return;
            fn();
        }, ms);
        pendingTimeouts.add(id);
        return id;
    }

    function makePlotContext() {
        return {
            d3,
            axisGroup,
            dataGroup,
            annotationGroup,
            innerWidth,
            innerHeight,
            mockData,
            trendData,
            clearLayers,
            getColors,
        };
    }

    // ========================================================================
    // STEP TRANSITION HANDLER
    // ========================================================================
    function transitionToStep(step) {
        transitionToken += 1;
        const token = transitionToken;
        cancelPendingWork();

        console.log(`[Visualization] Transitioning to step ${step}`);
        currentStep = step;

        const ctx = makePlotContext();

        switch (step) {
            case 1:
                renderScatter(ctx, { animate: true, stagger: true });
                break;
            case 2:
                // Always rebuild the scatter view first, then highlight.
                // Avoid delayed timeouts that can fire after the user scrolls away.
                renderScatter(ctx, { animate: false });
                highlightEurope(ctx);
                break;
            case 3:
                renderHistogram(ctx);
                break;
            case 4:
                renderComparison(ctx);
                break;
            case 5:
                renderTrendLine(ctx);
                break;
            case 6:
                // Next-tick so layout values are settled; guarded by token.
                schedule(() => renderSummary(makePlotContext()), 0, token);
                break;
            default:
                renderScatter(ctx, { animate: true, stagger: true });
        }
    }

    // ========================================================================
    // INITIAL RENDER
    // ========================================================================
    renderScatter(makePlotContext());

    // ========================================================================
    // PUBLIC API
    // ========================================================================
    return {
        transitionToStep,
        getCurrentStep: () => currentStep,
        resize,
        destroy() {
            window.removeEventListener('resize', resize);
            cancelPendingWork();
            svg.remove();
        }
    };
}
