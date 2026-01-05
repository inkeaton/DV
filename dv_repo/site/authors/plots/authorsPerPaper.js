/**
 * authors/plots/authorsPerPaper.js
 * Line chart with error area showing average authors per paper over time
 */

import { authorsPerPaperData, authorsPerPaperStats } from '../../data/authors/authorsPerPaperData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes
} from '../../assets/js/chart-utils.js';

export const authorsPerPaperConfig = {
  data: authorsPerPaperData,
  margins: { top: 60, right: 40, bottom: 60, left: 80 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.max) * 1.1])
      .range([height, 0]);

    // Area generator for error bounds
    const areaGenerator = d3
      .area()
      .x((d) => xScale(d.year))
      .y0((d) => yScale(d.min))
      .y1((d) => yScale(d.max))
      .curve(d3.curveMonotoneX);

    // Line generator for average
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.avg))
      .curve(d3.curveMonotoneX);

    // Draw error area
    const errorArea = g
      .append('path')
      .datum(data)
      .attr('class', 'error-area')
      .attr('d', areaGenerator)
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0)
      .attr('stroke', 'none');

    // Draw average line
    const avgLine = g
      .append('path')
      .datum(data)
      .attr('class', 'avg-line')
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0);

    // Draw circles for data points
    const circles = g
      .selectAll('.data-point')
      .data(data.filter((d, i) => i % 5 === 0)) // Show every 5th year
    .join('circle')
    .attr('class', 'data-point')
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.avg))
    .attr('r', 0)
    .attr('fill', colors.primary)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

    // Axes
    renderTitle(ctx, 'Average Authors per Paper Over Time');
    renderXAxis(ctx, xScale, { label: 'Year', tickFormat: d3.format('d') });
    renderYAxis(ctx, yScale, { label: 'Average Number of Authors' });
    styleAxes(g);

    // Annotations
    const annotation = g
    .append('g')
    .attr('class', 'annotation')
    .attr('opacity', 0);

  annotation
    .append('line')
    .attr('x1', xScale(2024))
    .attr('x2', xScale(2024))
    .attr('y1', yScale(5.5))
    .attr('y2', yScale(5.5) - 40)
    .attr('stroke', colors.accent)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,4');

  annotation
    .append('text')
    .attr('x', xScale(2024))
    .attr('y', yScale(5.5) - 50)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .attr('fill', colors.accent)
    .text(`${authorsPerPaperStats.growthRate}% increase since 1990`);

    // Animate error area
    errorArea
      .transition()
      .duration(animationDuration)
      .attr('fill-opacity', 0.2);

    // Animate average line with stroke-dasharray
    const lineLength = avgLine.node().getTotalLength();
    avgLine
      .attr('stroke-dasharray', `${lineLength} ${lineLength}`)
      .attr('stroke-dashoffset', lineLength)
      .attr('stroke-opacity', 1)
      .transition()
      .duration(animationDuration)
      .attr('stroke-dashoffset', 0);

    // Animate circles
    circles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 50)
      .attr('r', 5);

    // Animate annotation
    annotation
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);
  }
};
