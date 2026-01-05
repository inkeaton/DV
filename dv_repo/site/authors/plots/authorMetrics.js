/**
 * authors/plots/authorMetrics.js
 * Bubble scatter chart showing author metrics
 * X-axis: papers count, Y-axis: citations, Bubble size: awards
 */

import { authorMetricsData, authorMetricsStats } from '../../data/authors/authorMetricsData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes,
  renderLegend
} from '../../assets/js/chart-utils.js';

export const authorMetricsConfig = {
  data: authorMetricsData,
  margins: { top: 60, right: 40, bottom: 60, left: 80 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Category colors
    const categoryColors = {
      prolific: colors.primary,
      'highly-cited': colors.accent,
      steady: colors.secondary,
      emerging: '#95a5a6'
    };

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.papers) * 1.1])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.citations) * 1.1])
      .range([height, 0]);

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, authorMetricsStats.maxAwards])
    .range([3, 30]);

    // Draw bubbles
    const bubbles = g
      .selectAll('.bubble')
      .data(data)
    .join('circle')
    .attr('class', 'bubble')
    .attr('cx', (d) => xScale(d.papers))
    .attr('cy', (d) => yScale(d.citations))
    .attr('r', 0)
    .attr('fill', (d) => categoryColors[d.category])
    .attr('fill-opacity', 0.6)
    .attr('stroke', (d) => categoryColors[d.category])
    .attr('stroke-width', 2)
    .style('cursor', 'pointer');

  // Hover effects
  bubbles
    .on('mouseenter', function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill-opacity', 0.9)
        .attr('stroke-width', 3);

      // Show label
      const label = g
        .append('text')
        .attr('class', 'hover-label')
        .attr('x', xScale(d.papers))
        .attr('y', yScale(d.citations) - sizeScale(d.awards) - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(d.name);

      const labelBBox = label.node().getBBox();
      g.insert('rect', '.hover-label')
        .attr('class', 'hover-label-bg')
        .attr('x', labelBBox.x - 4)
        .attr('y', labelBBox.y - 2)
        .attr('width', labelBBox.width + 8)
        .attr('height', labelBBox.height + 4)
        .attr('fill', '#fff')
        .attr('stroke', categoryColors[d.category])
        .attr('stroke-width', 1)
        .attr('rx', 3);
    })
    .on('mouseleave', function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill-opacity', 0.6)
        .attr('stroke-width', 2);

      g.selectAll('.hover-label').remove();
      g.selectAll('.hover-label-bg').remove();
    });

    // Axes
    renderTitle(ctx, 'Author Impact Metrics');
    renderXAxis(ctx, xScale, { label: 'Number of Papers' });
    renderYAxis(ctx, yScale, { label: 'Total Citations', tickFormat: d3.format(',') });
    styleAxes(g);

    // Legend
    const legendItems = Object.entries(authorMetricsStats.categories).map(([category, description]) => ({
      color: categoryColors[category],
      label: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${description}`
    }));

    renderLegend(ctx, legendItems, {
      x: width - 200,
      y: 20,
      itemHeight: 25
    });

  // Size legend for bubble sizes
  const sizeLegend = g.append('g').attr('class', 'size-legend').attr('opacity', 0);

  const sizeLegendData = [
    { awards: 3, label: '3 awards' },
    { awards: 6, label: '6 awards' },
    { awards: 12, label: '12 awards' }
  ];

    sizeLegend
      .append('text')
      .attr('x', 10)
      .attr('y', height - 80)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Award Count:');

    const sizeLegendItems = sizeLegend
      .selectAll('.size-legend-item')
      .data(sizeLegendData)
      .join('g')
      .attr('class', 'size-legend-item')
      .attr('transform', (d, i) => `translate(${20 + i * 60}, ${height - 50})`);

    sizeLegendItems
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', (d) => sizeScale(d.awards))
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0.3)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    sizeLegendItems
      .append('text')
      .attr('x', 0)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text((d) => d.label);

    // Notable authors annotation
    const notableAuthors = data
    .filter((d) => d.category === 'highly-cited')
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 3);

  const annotations = g
    .selectAll('.annotation')
    .data(notableAuthors)
    .join('g')
    .attr('class', 'annotation')
    .attr('opacity', 0);

  annotations
    .append('line')
    .attr('x1', (d) => xScale(d.papers))
    .attr('y1', (d) => yScale(d.citations))
    .attr('x2', (d) => xScale(d.papers) + 40)
    .attr('y2', (d) => yScale(d.citations) - 40)
    .attr('stroke', colors.accent)
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '3,3');

  annotations
    .append('text')
    .attr('x', (d) => xScale(d.papers) + 45)
    .attr('y', (d) => yScale(d.citations) - 40)
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .attr('fill', colors.accent)
    .text((d) => d.name);

    // Animate bubbles
    bubbles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 20)
      .attr('r', (d) => sizeScale(d.awards));

    // Animate size legend
    sizeLegend
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

    // Animate annotations
    annotations
      .transition()
      .delay(1000)
      .duration(400)
      .attr('opacity', 1);
  }
};
