/**
 * authors/plots/uniqueAuthorsTimeline.js
 * Cumulative area chart showing unique authors growth over time
 */

import { uniqueAuthorsData, uniqueAuthorsStats } from '../../data/authors/uniqueAuthorsData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes
} from '../../assets/js/chart-utils.js';

export const uniqueAuthorsTimelineConfig = {
  data: uniqueAuthorsData,
  margins: { top: 60, right: 40, bottom: 60, left: 80 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors, svg } = ctx;
    const animationDuration = 800;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, uniqueAuthorsStats.total * 1.05])
      .range([height, 0]);

    // Area generator for cumulative count
    const areaGenerator = d3
      .area()
      .x((d) => xScale(d.year))
      .y0(height)
      .y1((d) => yScale(d.cumulative))
      .curve(d3.curveMonotoneX);

  // Line generator for top border
  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.cumulative))
    .curve(d3.curveMonotoneX);

  // Draw cumulative area with gradient
  const gradient = svg
    .append('defs')
    .append('linearGradient')
    .attr('id', 'area-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', colors.primary)
    .attr('stop-opacity', 0.8);

  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', colors.primary)
    .attr('stop-opacity', 0.2);

    const cumulativeArea = g
      .append('path')
      .datum(data)
      .attr('class', 'cumulative-area')
      .attr('d', areaGenerator)
      .attr('fill', 'url(#area-gradient)')
      .attr('opacity', 0);

    // Draw top border line
    const borderLine = g
      .append('path')
      .datum(data)
    .attr('class', 'border-line')
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    .attr('stroke', colors.primary)
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0);

  // Milestone markers
  const milestones = [
    { year: 1999, cumulative: 1392, label: '1,000+ authors' },
    { year: 2010, cumulative: 5408, label: '5,000+ authors' },
    { year: 2017, cumulative: 10728, label: '10,000+ authors' }
  ];

  const milestoneGroup = g
    .selectAll('.milestone')
    .data(milestones)
    .join('g')
    .attr('class', 'milestone')
    .attr('opacity', 0);

  milestoneGroup
    .append('circle')
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.cumulative))
    .attr('r', 6)
    .attr('fill', colors.accent)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  milestoneGroup
    .append('text')
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.cumulative) - 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('fill', colors.accent)
    .text((d) => d.label);

    // Axes
    renderTitle(ctx, 'Cumulative Growth of Unique Authors');
    renderXAxis(ctx, xScale, { label: 'Year', tickFormat: d3.format('d') });
    renderYAxis(ctx, yScale, { label: 'Cumulative Authors', tickFormat: d3.format(',') });
    styleAxes(g);

    // Stats annotation
    const statsAnnotation = g
    .append('g')
    .attr('class', 'stats-annotation')
    .attr('opacity', 0);

    statsAnnotation
      .append('rect')
      .attr('x', width - 180)
      .attr('y', 10)
      .attr('width', 170)
      .attr('height', 60)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('rx', 5);

    statsAnnotation
      .append('text')
      .attr('x', width - 95)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text(`Total: ${uniqueAuthorsStats.total.toLocaleString()}`);

    statsAnnotation
      .append('text')
      .attr('x', width - 95)
    .attr('y', 55)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#666')
    .text(`Avg/year: ${uniqueAuthorsStats.avgNewPerYear}`);

    // Animate area
    cumulativeArea
      .transition()
      .duration(animationDuration)
      .attr('opacity', 1);

    // Animate border line
    const lineLength = borderLine.node().getTotalLength();
    borderLine
      .attr('stroke-dasharray', `${lineLength} ${lineLength}`)
      .attr('stroke-dashoffset', lineLength)
      .attr('stroke-opacity', 1)
      .transition()
      .duration(animationDuration)
      .attr('stroke-dashoffset', 0);

    // Animate milestones
    milestoneGroup
      .transition()
      .duration(400)
      .delay((d, i) => animationDuration + i * 200)
      .attr('opacity', 1);

    // Animate stats
    statsAnnotation
      .transition()
      .delay(1200)
      .duration(400)
      .attr('opacity', 1);
  }
};
