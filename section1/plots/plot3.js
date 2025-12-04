// plot3.js
// ============================================================================
// D3.JS SCATTER PLOT
// ============================================================================

export async function renderPlot3(containerId = 'plot-3') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let d3;
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
        d3 = mod.default || mod;
    } catch (err) { return; }

    // SAMPLE DATA: Random distribution
    const data = Array.from({length: 50}, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 10 + 2
    }));

    function draw() {
        container.innerHTML = '';
        const width = container.clientWidth;
        const height = container.clientHeight || 400;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };

        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        const styles = getComputedStyle(document.body);
        const colorPrimary = styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A';
        const colorTertiary = styles.getPropertyValue('--md-sys-color-tertiary').trim() || '#575C7E';
        const colorOnSurface = styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#000';

        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height - margin.bottom, margin.top]);

        // AXES
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .select('.domain').remove();

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .select('.domain').remove();
            
        svg.selectAll('text').attr('fill', colorOnSurface);

        // DOTS
        svg.append('g')
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', d => d.r)
            .attr('fill', (d, i) => i % 2 ? colorPrimary : colorTertiary)
            .attr('opacity', 0.7)
            .attr('stroke', styles.getPropertyValue('--md-sys-color-surface').trim())
            .attr('stroke-width', 1);
    }

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(container);
    
    const themeObserver = new MutationObserver((mutations) => {
        if (mutations.some(m => m.attributeName === 'class')) draw();
    });
    themeObserver.observe(document.body, { attributes: true });

    draw();

    return { destroy() { resizeObserver.disconnect(); themeObserver.disconnect(); container.innerHTML = ''; } };
}