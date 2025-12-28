// plots/histogram.js

export function renderHistogram(ctx) {
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

    const histogram = d3.histogram()
        .value(d => d.consumption)
        .domain([0, 13])
        .thresholds(10);

    const bins = histogram(mockData);

    const xScale = d3.scaleLinear()
        .domain([0, 13])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([innerHeight, 0]);

    axisGroup.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `${d} kg`))
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    axisGroup.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    axisGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 45)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-size', '14px')
        .text('Coffee Consumption (kg per capita)');

    axisGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-size', '14px')
        .text('Number of Countries');

    dataGroup.selectAll('rect.hist-bar')
        .data(bins)
        .join('rect')
        .attr('class', 'hist-bar')
        .attr('x', d => xScale(d.x0) + 1)
        .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', colors.primary)
        .attr('fill-opacity', 0.7)
        .attr('rx', 4)
        .transition()
        .duration(600)
        .delay((d, i) => i * 50)
        .attr('y', d => yScale(d.length))
        .attr('height', d => innerHeight - yScale(d.length));
}
