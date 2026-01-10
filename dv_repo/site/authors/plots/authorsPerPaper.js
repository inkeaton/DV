/**
 * authors/plots/authorsPerPaper.js
 * Line chart with error area showing average authors per paper over time
 * 
 * Features:
 * - Error area showing min/max range
 * - Average line with animation
 * - Tooltip with vertical guide line on hover/touch
 * - Growth annotation positioned within chart bounds
 */

import { authorsPerPaperData, authorsPerPaperStats } from '../../data/authors/authorsPerPaperData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes,
  cleanAxes,
  createArrowMarker
} from '../../assets/js/chart-utils.js';

import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';

export const authorsPerPaperConfig = {
  data: authorsPerPaperData,
  margins: { top: 60, right: 60, bottom: 60, left: 80 },

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
    .attr('stroke', colors.surfaceContainer)
    .attr('stroke-width', 2);

    // Axes
    renderTitle(ctx, 'Average Authors per Paper Over Time');

    // Calcola i tick dell'asse X includendo sempre l'ultimo anno
    const years = data.map(d => d.year);
    const minYear = years[0];
    const maxYear = years[years.length - 1];
    // Tick ogni 5 anni + sempre l'ultimo anno
    const tickYears = [];
    for (let y = minYear; y <= maxYear; y += 5) tickYears.push(y);
    if (!tickYears.includes(maxYear)) tickYears.push(maxYear);

    renderXAxis(ctx, xScale, {
      label: 'Year',
      tickFormat: d3.format('d'),
      tickValues: tickYears
    });
    renderYAxis(ctx, yScale, { label: 'Average Number of Authors' });
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
      const y = yScale(d.avg);

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
        .text(`Avg: ${d.avg.toFixed(2)} authors`);
      tooltipText.append('tspan')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .attr('font-size', '10px')
        .attr('fill', colors.onSurfaceVariant)
        .text(`Range: ${d.min.toFixed(1)} - ${d.max.toFixed(1)}`);

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

    // ========================================================================
    // GROWTH ANNOTATION (Fixed positioning within chart bounds)
    // ========================================================================
    
    // Create arrow marker for annotation
    createArrowMarker(svg);
    
    // Find peak year (maximum average)
    const firstYear = data[0];
    const peakYear = data.reduce((max, d) => d.avg > max.avg ? d : max, data[0]);
    const growthPercent = Math.round(((peakYear.avg - firstYear.avg) / firstYear.avg) * 100);

    const annotation = g
      .append('g')
      .attr('class', 'annotation')
      .attr('opacity', 0);

    // Position annotation at the peak year
    const annotationX = xScale(peakYear.year);
    const annotationY = yScale(peakYear.avg);

    // Text position above the point
    const textY = Math.max(annotationY - 70, 20);
    const textX = Math.min(Math.max(annotationX, 80), width - 80);

    // Annotation text (simple, no borders)
    annotation
      .append('text')
      .attr('x', textX)
      .attr('y', textY)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(0,0,0,0.78)')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .text(`Peak: +${growthPercent}% since ${firstYear.year}`);

    // Arrow from text to point
    annotation
      .append('line')
      .attr('x1', textX)
      .attr('y1', textY + 6)
      .attr('x2', annotationX)
      .attr('y2', annotationY - 8)
      .attr('stroke', 'rgba(0,0,0,0.6)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Small dot at the target point
    annotation
      .append('circle')
      .attr('cx', annotationX)
      .attr('cy', annotationY)
      .attr('r', 3)
      .attr('fill', 'rgba(0,0,0,0.6)');

    // Evidenzia il valore massimo assoluto (max)
    const maxValuePoint = data.reduce((max, d) => d.max > max.max ? d : max, data[0]);
    const maxX = xScale(maxValuePoint.year);
    const maxY = yScale(maxValuePoint.max);

    // Pallino rosso
    g.append('circle')
      .attr('cx', maxX)
      .attr('cy', maxY)
      .attr('r', 6)
      .attr('fill', 'red')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.95);

    // Label semplice sopra il punto
    g.append('text')
      .attr('x', maxX)
      .attr('y', maxY - 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'red')
      .text(`Max value: ${maxValuePoint.max.toFixed(2)}`);

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
