/**
 * authors/plots/uniqueAuthorsTimeline.js
 * Cumulative area chart showing unique authors growth over time
 * 
 * Features:
 * - Gradient-filled area chart with animated border line
 * - Milestone markers at key thresholds (500, 1000, 2500, 5000)
 * - Tooltip with vertical guide line on hover/touch
 * - Stats annotation box
 */

import { uniqueAuthorsData, uniqueAuthorsStats } from '../../data/authors/uniqueAuthorsData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes,
  cleanAxes
} from '../../assets/js/chart-utils.js';

import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';

export const uniqueAuthorsTimelineConfig = {
  data: uniqueAuthorsData,
  margins: { top: 60, right: 40, bottom: 60, left: 80 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors, svg } = ctx;
    const animationDuration = ANIMATION_DURATION;

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

  // Milestone markers - find years when thresholds were crossed
  // Thresholds: 500, 1000, 2500, 5000 cumulative authors
  const thresholds = [500, 1000, 2500, 5000];
  const milestones = thresholds.map(threshold => {
    // Find the first year where cumulative >= threshold
    const dataPoint = data.find(d => d.cumulative >= threshold);
    if (dataPoint) {
      return {
        year: dataPoint.year,
        cumulative: dataPoint.cumulative,
        label: `${threshold.toLocaleString()}+ authors`
      };
    }
    return null;
  }).filter(m => m !== null);

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
    .attr('fill', colors.accent || colors.tertiary)
    .attr('stroke', colors.surfaceContainer)
    .attr('stroke-width', 2);

  milestoneGroup
    .append('text')
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.cumulative) - 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .attr('fill', colors.accent || colors.tertiary)
    .text((d) => d.label);

    // Axes
    renderTitle(ctx, 'Cumulative Growth of Unique Authors');
    renderXAxis(ctx, xScale, { label: 'Year', tickFormat: d3.format('d') });
    renderYAxis(ctx, yScale, { label: 'Cumulative Authors', tickFormat: d3.format(',') });
    styleAxes(g);
    cleanAxes(g);  // Remove axis lines, keep only tick labels

    // ========================================================================
    // TOOLTIP WITH VERTICAL GUIDE LINE
    // ========================================================================
    
    // Create tooltip elements (hidden initially)
    const tooltipGroup = g.append('g')
      .attr('class', 'tooltip-group')
      .style('display', 'none');

    // Vertical guide line
    const guideLine = tooltipGroup.append('line')
      .attr('class', 'guide-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.7);

    // Tooltip circle on the line
    const tooltipCircle = tooltipGroup.append('circle')
      .attr('r', 6)
      .attr('fill', colors.primary)
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2);

    // Tooltip background and text
    const tooltipBg = tooltipGroup.append('rect')
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 1.5)
      .attr('rx', 4);

    const tooltipText = tooltipGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', colors.onSurface);

    // Invisible overlay for mouse/touch tracking
    const overlay = g.append('rect')
      .attr('class', 'tooltip-overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    /**
     * Find the closest data point to the mouse/touch position
     * @param {number} mouseX - X coordinate relative to chart
     * @returns {Object} Closest data point
     */
    function findClosestDataPoint(mouseX) {
      const bisect = d3.bisector(d => d.year).left;
      const x0 = xScale.invert(mouseX);
      const i = bisect(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      if (!d1) return d0;
      if (!d0) return d1;
      return (x0 - d0.year > d1.year - x0) ? d1 : d0;
    }

    /**
     * Show tooltip at the given data point
     * @param {Object} d - Data point
     */
    function showTooltip(d) {
      const x = xScale(d.year);
      const y = yScale(d.cumulative);

      // Hide tooltip during updates to prevent flicker/lag
      tooltipGroup.style('visibility', 'hidden').style('display', null).raise();

      // Position guide line
      guideLine.attr('x1', x).attr('x2', x);

      // Position circle on line
      tooltipCircle.attr('cx', x).attr('cy', y);

      // Create tooltip content
      tooltipText.selectAll('*').remove();
      tooltipText.append('tspan')
        .attr('x', 0)
        .attr('dy', 0)
        .attr('font-weight', 'bold')
        .text(d.year);
      tooltipText.append('tspan')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text(`Total: ${d.cumulative.toLocaleString()}`);
      tooltipText.append('tspan')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .attr('font-size', '10px')
        .attr('fill', colors.onSurfaceVariant)
        .text(`+${d.newAuthors} new authors`);

      // Set a temporary position for text to measure it
      tooltipText.attr('transform', 'translate(0,0)');
      
      // Get bbox synchronously after text is set
      const bbox = tooltipText.node().getBBox();
      const padding = 8;
      const tooltipWidth = bbox.width + padding * 2;
      const tooltipHeight = bbox.height + padding * 2;

      // Determine tooltip position (above or below, left or right of point)
      let tooltipX = x;
      let tooltipY = y - 20 - tooltipHeight;

      // Keep tooltip within chart bounds
      if (tooltipY < 0) {
        tooltipY = y + 20;  // Show below if too high
      }
      if (tooltipX - tooltipWidth / 2 < 0) {
        tooltipX = tooltipWidth / 2 + 5;
      }
      if (tooltipX + tooltipWidth / 2 > width) {
        tooltipX = width - tooltipWidth / 2 - 5;
      }

      // Update both background and text position together
      tooltipBg
        .attr('x', tooltipX - tooltipWidth / 2)
        .attr('y', tooltipY)
        .attr('width', tooltipWidth)
        .attr('height', tooltipHeight);

      tooltipText.attr('transform', `translate(${tooltipX}, ${tooltipY + padding + 10})`);
      
      // Show tooltip after everything is positioned
      tooltipGroup.style('visibility', 'visible');
    }

    /**
     * Hide the tooltip
     */
    function hideTooltip() {
      tooltipGroup.style('display', 'none');
    }

    // Mouse events
    overlay
      .on('mouseenter', function() {
        tooltipGroup.style('display', null);
      })
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const d = findClosestDataPoint(mouseX);
        if (d) showTooltip(d);
      })
      .on('mouseleave', hideTooltip);

    // Touch events for mobile support
    overlay
      .on('touchstart', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const [touchX] = d3.pointer(touch, this);
        const d = findClosestDataPoint(touchX);
        if (d) showTooltip(d);
      })
      .on('touchmove', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const [touchX] = d3.pointer(touch, this);
        const d = findClosestDataPoint(touchX);
        if (d) showTooltip(d);
      })
      .on('touchend', hideTooltip);

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
      .attr('fill', colors.surfaceContainer)
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
    .attr('fill', colors.onSurfaceVariant)
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
