// plots/comparison.js

export function renderComparison(ctx) {
    const {
        d3,
        axisGroup,
        dataGroup,
        annotationGroup,
        innerWidth,
        innerHeight,
        mockData,
        clearLayers,
        getColors,
    } = ctx;

    const colors = getColors();
    clearLayers();

    const developed = mockData.filter(d => d.category === 'developed');
    const developing = mockData.filter(d => d.category === 'developing');

    const avgDeveloped = d3.mean(developed, d => d.consumption);
    const avgDeveloping = d3.mean(developing, d => d.consumption);

    const comparisonData = [
        { category: 'Developed', avg: avgDeveloped, count: developed.length },
        { category: 'Developing', avg: avgDeveloping, count: developing.length },
    ];

    const xScale = d3.scaleBand()
        .domain(comparisonData.map(d => d.category))
        .range([0, innerWidth])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, 8])
        .range([innerHeight, 0]);

    axisGroup.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', colors.onSurface)
        .style('font-size', '14px');

    axisGroup.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d} kg`))
        .selectAll('text')
        .style('fill', colors.onSurfaceVariant);

    dataGroup.selectAll('rect.comp-bar')
        .data(comparisonData)
        .join('rect')
        .attr('class', 'comp-bar')
        .attr('x', d => xScale(d.category))
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', (d, i) => (i === 0 ? colors.primary : colors.tertiary))
        .attr('fill-opacity', 0.8)
        .attr('rx', 8)
        .transition()
        .duration(600)
        .attr('y', d => yScale(d.avg))
        .attr('height', d => innerHeight - yScale(d.avg));

    annotationGroup.selectAll('text.bar-label')
        .data(comparisonData)
        .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.avg) - 10)
        .attr('text-anchor', 'middle')
        .style('fill', colors.onSurface)
        .style('font-weight', '500')
        .style('font-size', '16px')
        .style('opacity', 0)
        .text(d => `${d.avg.toFixed(1)} kg`)
        .transition()
        .delay(600)
        .duration(300)
        .style('opacity', 1);
}
