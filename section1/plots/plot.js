// plot.js
// ============================================================================
// D3.JS BAR CHART VISUALIZATION
// ============================================================================
// This module creates a responsive, theme-aware bar chart using D3.js
// Features:
// - Dynamic D3 import (loads on demand)
// - Responsive sizing (adapts to container width)
// - Theme awareness (colors update with light/dark mode)
// - Clean Material Design aesthetic
// ============================================================================

/**
 * Creates a D3 bar chart inside a specified container
 * 
 * @param {string} containerId - The ID of the HTML element to render into
 * @returns {object} Object with destroy() method for cleanup
 */
export async function renderDummyPlot(containerId = 'plot-1') {
    // Find the container element in the DOM
    const container = document.getElementById(containerId);
    if (!container) return;  // Early return if container doesn't exist

    // ============================================================================
    // 1. DYNAMIC D3 IMPORT
    // ============================================================================
    // Load D3 library dynamically from CDN instead of bundling it
    // This reduces initial page load and only loads when visualization is needed
    let d3;
    try {
        // Import D3 v7 as an ES module from jsDelivr CDN
        const mod = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
        
        // Handle different module export formats (default vs named exports)
        d3 = mod.default || mod;
    } catch (err) {
        console.error('Failed to load d3', err);
        return;  // Exit if D3 fails to load
    }

    // ============================================================================
    // SAMPLE DATA
    // ============================================================================
    // Simple array of numbers to visualize
    // In a real app, this would come from an API or data file
    const data = [12, 5, 6, 8, 14, 9, 11, 7, 4, 10];

    // ============================================================================
    // 2. DRAW FUNCTION
    // ============================================================================
    // This function renders (or re-renders) the chart
    // Called on initial load, window resize, and theme changes
    function draw() {
        // Clear previous chart to avoid duplicates on redraw
        container.innerHTML = '';
        
        // Get current container dimensions
        const width = container.clientWidth;
        const height = container.clientHeight || 400;  // Fallback height
        
        // Chart margins (space for axes and labels)
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        
        // Create SVG element
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);  // Makes SVG responsive

        // ========================================================================
        // THEME-AWARE COLORS
        // ========================================================================
        // Fetch current theme colors from CSS custom properties
        // getComputedStyle reads the actual applied values (not just CSS source)
        const styles = getComputedStyle(document.body);
        
        // Get Material Design color tokens, with fallbacks
        // .trim() removes whitespace that CSS variables sometimes include
        const colorPrimary = styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A';
        const colorOnSurface = styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#000';

        // ========================================================================
        // D3 SCALES
        // ========================================================================
        // Scales map data values to visual properties (position, size, color)
        
        // X Scale: Band scale for discrete categories (bars)
        // Maps data indices to horizontal positions with automatic spacing
        const x = d3.scaleBand()
            .domain(d3.range(data.length))  // [0, 1, 2, ..., 9]
            .range([margin.left, width - margin.right])  // Pixel positions
            .padding(0.2);  // Space between bars (20% of bar width)

        // Y Scale: Linear scale for continuous values (bar heights)
        // Maps data values to vertical positions
        const y = d3.scaleLinear()
            .domain([0, d3.max(data)])  // From 0 to highest data value
            .nice()  // Rounds domain to nice round numbers
            .range([height - margin.bottom, margin.top]);  // Inverted (SVG y=0 is top)

        // ========================================================================
        // DRAW BARS
        // ========================================================================
        svg.append('g')
            .attr('fill', colorPrimary)  // Use theme primary color
            .selectAll('rect')  // Select all rect elements (none exist yet)
            .data(data)  // Bind data array to selection
            .join('rect')  // Create rect for each data point
                // Position and size each bar using scales
                .attr('x', (d, i) => x(i))  // X position from index
                .attr('y', d => y(d))  // Y position from value (top of bar)
                .attr('height', d => y(0) - y(d))  // Height from value to baseline
                .attr('width', x.bandwidth())  // Width from band scale
                .attr('rx', 4);  // Rounded corners (4px radius)

        // ========================================================================
        // DRAW AXES
        // ========================================================================
        
        // X Axis: Bottom axis showing category labels
        const xAxis = g => g
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(i => `P${i + 1}`))  // Custom labels: P1, P2, ...
            .call(g => g.select('.domain').remove())  // Remove axis line for cleaner look
            .selectAll('text').attr('fill', colorOnSurface);  // Theme-aware text color

        // Y Axis: Left axis showing value scale
        const yAxis = g => g
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5))  // Show ~5 tick marks
            .call(g => g.select('.domain').remove())  // Remove axis line
            .selectAll('text').attr('fill', colorOnSurface);  // Theme-aware text color

        // Append axes to SVG
        svg.append('g').call(xAxis);
        svg.append('g').call(yAxis);
    }

    // ============================================================================
    // 3. RESIZE OBSERVER
    // ============================================================================
    // Automatically redraw chart when container size changes
    // This makes the chart responsive to window resizing or layout changes
    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(container);

    // ============================================================================
    // 4. THEME CHANGE OBSERVER
    // ============================================================================
    // Watch for changes to the body element's class attribute
    // When dark-theme class is added/removed, redraw chart with new colors
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Check if the class attribute changed
            if (mutation.attributeName === 'class') {
                draw();  // Redraw with new theme colors
            }
        });
    });
    
    // Start observing body element for attribute changes
    themeObserver.observe(document.body, { attributes: true });

    // ============================================================================
    // INITIAL RENDER
    // ============================================================================
    draw();

    // ============================================================================
    // CLEANUP FUNCTION
    // ============================================================================
    // Return an object with a destroy method for proper cleanup
    // This prevents memory leaks if the chart is removed from the page
    return {
        destroy() {
            resizeObserver.disconnect();  // Stop watching for resize
            themeObserver.disconnect();    // Stop watching for theme changes
            container.innerHTML = '';      // Remove chart from DOM
        }
    };
}