// plots/highlight-europe.js

export function highlightEurope(ctx) {
    const {
        d3,
        dataGroup,
        annotationGroup,
        innerWidth,
        innerHeight,
        mockData,
        getColors,
    } = ctx;

    const colors = getColors();

    dataGroup.selectAll('circle')
        .transition()
        .duration(500)
        .attr('fill', d => d.region === 'Europe' ? colors.primary : colors.outline)
        .attr('fill-opacity', d => d.region === 'Europe' ? 0.8 : 0.2)
        .attr('stroke', d => d.region === 'Europe' ? colors.primary : colors.outline)
        .attr('stroke-width', d => d.region === 'Europe' ? 3 : 1);

    annotationGroup.selectAll('text.country-label').remove();

    const europeanCountries = mockData.filter(d => d.region === 'Europe');

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(mockData, d => d.consumption) * 1.1])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(mockData, d => d.population)])
        .range([innerHeight, 0]);

    annotationGroup.selectAll('text.country-label')
        .data(europeanCountries.filter(d => d.consumption > 7))
        .join('text')
        .attr('class', 'country-label')
        .attr('x', d => xScale(d.consumption) + 15)
        .attr('y', d => yScale(d.population) + 4)
        .style('fill', colors.primary)
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(d => d.country)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .style('opacity', 1);
}
