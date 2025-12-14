// plots/trend.js

export function renderTrendLine(ctx) {
    const {
        d3,
        axisGroup,
        dataGroup,
        annotationGroup,
        innerWidth,
        innerHeight,
        trendData,
        clearLayers,
        getColors,
    } = ctx;

    const colors = getColors();
    clearLayers();

    const xScale = d3.scaleLinear()
        .domain(d3.extent(trendData, d => d.year))
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([7, 11])
        .range([innerHeight, 0]);

    axisGroup.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    axisGroup.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}B kg`))
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    axisGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 45)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-size', '14px')
        .text('Year');

    axisGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -50)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-size', '14px')
        .text('Global Consumption (Billion kg)');

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.consumption))
        .curve(d3.curveMonotoneX);

    const area = d3.area()
        .x(d => xScale(d.year))
        .y0(innerHeight)
        .y1(d => yScale(d.consumption))
        .curve(d3.curveMonotoneX);

    dataGroup.append('path')
        .datum(trendData)
        .attr('class', 'trend-area')
        .attr('d', area)
        .attr('fill', colors.primaryContainer)
        .attr('fill-opacity', 0)
        .transition()
        .duration(800)
        .attr('fill-opacity', 0.4);

    const path = dataGroup.append('path')
        .datum(trendData)
        .attr('class', 'trend-line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 3);

    const pathLength = path.node().getTotalLength();
    path.attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadOut)
        .attr('stroke-dashoffset', 0);

    dataGroup.selectAll('circle.trend-point')
        .data(trendData)
        .join('circle')
        .attr('class', 'trend-point')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.consumption))
        .attr('r', 0)
        .attr('fill', colors.primary)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .transition()
        .delay(1500)
        .duration(300)
        .attr('r', 5);

    const covidPoint = trendData.find(d => d.year === 2020);
    if (covidPoint) {
        annotationGroup.append('text')
            .attr('x', xScale(2020))
            .attr('y', yScale(covidPoint.consumption) - 20)
            .attr('text-anchor', 'middle')
            .style('fill', colors.tertiary)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('opacity', 0)
            .text('COVID-19 Impact')
            .transition()
            .delay(1800)
            .duration(300)
            .style('opacity', 1);
    }
}
