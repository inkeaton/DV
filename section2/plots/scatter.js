// plots/scatter.js

export function renderScatter(ctx, { animate = true, stagger = true } = {}) {
    const {
        d3,
        axisGroup,
        dataGroup,
        innerWidth,
        innerHeight,
        mockData,
        clearLayers,
        getColors,
    } = ctx;

    const colors = getColors();
    clearLayers();

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(mockData, d => d.consumption) * 1.1])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(mockData, d => d.population)])
        .range([innerHeight, 0]);

    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(mockData, d => d.population)])
        .range([4, 40]);

    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d} kg`);
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d => `${d}M`);

    axisGroup.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    axisGroup.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    axisGroup.append('text')
        .attr('class', 'axis-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 45)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-size', '14px')
        .text('Coffee Consumption (kg per capita)');

    axisGroup.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-size', '14px')
        .text('Population (millions)');

    const circles = dataGroup.selectAll('circle')
        .data(mockData)
        .join('circle')
        .attr('cx', d => xScale(d.consumption))
        .attr('cy', d => yScale(d.population))
        .attr('r', animate ? 0 : d => rScale(d.population))
        .attr('fill', colors.primary)
        .attr('fill-opacity', 0.6)
        .attr('stroke', colors.primary)
        .attr('stroke-width', 2);

    if (animate) {
        circles.transition()
            .duration(650)
            .delay((d, i) => (stagger ? i * 20 : 0))
            .attr('r', d => rScale(d.population));
    }
}
