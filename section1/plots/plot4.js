// plot4.js
// ============================================================================
// D3.JS DONUT CHART
// ============================================================================

export async function renderPlot4(containerId = 'plot-4') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let d3;
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
        d3 = mod.default || mod;
    } catch (err) { return; }

    const data = [
        {name: "A", value: 30},
        {name: "B", value: 20},
        {name: "C", value: 50},
        {name: "D", value: 15}
    ];

    function draw() {
        container.innerHTML = '';
        const width = container.clientWidth;
        const height = container.clientHeight || 400;
        const radius = Math.min(width, height) / 2 - 20;

        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const styles = getComputedStyle(document.body);
        const colors = [
            styles.getPropertyValue('--md-sys-color-primary').trim(),
            styles.getPropertyValue('--md-sys-color-secondary').trim(),
            styles.getPropertyValue('--md-sys-color-tertiary').trim(),
            styles.getPropertyValue('--md-sys-color-error') || '#BA1A1A'
        ];
        const colorScale = d3.scaleOrdinal().range(colors);

        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

        svg.selectAll('path')
            .data(pie(data))
            .join('path')
            .attr('d', arc)
            .attr('fill', (d, i) => colorScale(i))
            .attr('stroke', styles.getPropertyValue('--md-sys-color-surface').trim())
            .attr("stroke-width", "2px")
            .style("opacity", 0.9);

        // Labels
        svg.selectAll('text')
            .data(pie(data))
            .join('text')
            .text(d => d.data.name)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", styles.getPropertyValue('--md-sys-color-on-primary').trim());
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