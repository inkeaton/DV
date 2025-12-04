// plot2.js
// ============================================================================
// D3.JS LINE CHART (TIME SERIES)
// ============================================================================

export async function renderPlot2(containerId = 'plot-2') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let d3;
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
        d3 = mod.default || mod;
    } catch (err) {
        console.error('Failed to load d3', err);
        return;
    }

    // SAMPLE DATA: Simple time series
    const data = Array.from({length: 20}, (_, i) => ({
        date: new Date(2023, 0, i + 1),
        value: Math.sin(i * 0.5) * 10 + i + Math.random() * 5
    }));

    function draw() {
        container.innerHTML = '';
        const width = container.clientWidth;
        const height = container.clientHeight || 400;
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };

        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        // THEME COLORS
        const styles = getComputedStyle(document.body);
        const colorPrimary = styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A';
        const colorOnSurface = styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#000';
        const colorSecondary = styles.getPropertyValue('--md-sys-color-secondary').trim() || '#4B6269';

        // SCALES
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);

        // LINE GENERATOR
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX); // Smooth curve

        // DRAW AXES
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .selectAll('text').attr('fill', colorOnSurface);
        
        svg.select('.domain').remove(); // Clean look

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').clone()
                .attr('x2', width - margin.left - margin.right)
                .attr('stroke-opacity', 0.1)) // Grid lines
            .selectAll('text').attr('fill', colorOnSurface);

        // DRAW LINE
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', colorPrimary)
            .attr('stroke-width', 3)
            .attr('d', line);

        // DRAW POINTS
        svg.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
            .attr('r', 4)
            .attr('fill', colorSecondary);
    }

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver((mutations) => {
        if (mutations.some(m => m.attributeName === 'class')) draw();
    });
    themeObserver.observe(document.body, { attributes: true });

    draw();

    return {
        destroy() {
            resizeObserver.disconnect();
            themeObserver.disconnect();
            container.innerHTML = '';
        }
    };
}