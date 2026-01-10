/**
 * authors/plots/authorsPerPaper.js
 * Line chart with error area showing average authors per paper over time
 *
 * Features:
 * - Error area showing min/max range
 * - Average line with animation
 * - Tooltip with vertical guide line on hover/touch
 * - Growth annotation positioned within chart bounds
 * - Grey band highlighting 2020–2021 (COVID period)
 * - COVID plateau annotation (arrow + text)
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

    // -------------------------
    // Title + Axes
    // -------------------------
    renderTitle(ctx, 'Average Authors per Paper Over Time');

    // X ticks (every 5y + last year)
    const years = data.map(d => d.year);
    const minYear = years[0];
    const maxYear = years[years.length - 1];
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
    cleanAxes(g);

    // Arrow marker for annotations
    createArrowMarker(svg);

    // -------------------------
    // Grey band 2020–2021 (behind everything)
    // -------------------------
    const bandStart = 2020;
    const bandEnd = 2021;

    const bx0 = xScale(bandStart);
    const bx1 = xScale(bandEnd);

    if (bx0 != null && bx1 != null) {
      const band = g.append('rect')
        .attr('class', 'note-band')
        .attr('x', bx0)
        .attr('y', 0)
        .attr('width', (bx1 - bx0))
        .attr('height', height)
        .attr('fill', colors.onSurface)
        .attr('fill-opacity', 0.10)
        .attr('opacity', 0);

      band.transition()
        .duration(600)
        .delay(250)
        .attr('opacity', 1);

      band.lower();
    }

    // -------------------------
    // Draw error area
    // -------------------------
    const errorArea = g
      .append('path')
      .datum(data)
      .attr('class', 'error-area')
      .attr('d', areaGenerator)
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0)
      .attr('stroke', 'none');

    // -------------------------
    // Draw average line
    // -------------------------
    const avgLine = g
      .append('path')
      .datum(data)
      .attr('class', 'avg-line')
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0);

    // -------------------------
    // Draw circles for data points (every 5th year)
    // -------------------------
    const circles = g
      .selectAll('.data-point')
      .data(data.filter((d, i) => i % 5 === 0))
      .join('circle')
      .attr('class', 'data-point')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.avg))
      .attr('r', 0)
      .attr('fill', colors.primary)
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2);

    // ========================================================================
    // TOOLTIP WITH VERTICAL GUIDE LINE
    // ========================================================================
    const tooltipGroup = g.append('g')
      .attr('class', 'tooltip-group')
      .style('display', 'none');

    const guideLine = tooltipGroup.append('line')
      .attr('class', 'guide-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.7);

    const tooltipCircle = tooltipGroup.append('circle')
      .attr('r', 6)
      .attr('fill', colors.primary)
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2);

    const tooltipBg = tooltipGroup.append('rect')
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 1.5)
      .attr('rx', 4);

    const tooltipText = tooltipGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', colors.onSurface);

    const overlay = g.append('rect')
      .attr('class', 'tooltip-overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

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

    function showTooltip(d) {
      const x = xScale(d.year);
      const y = yScale(d.avg);

      tooltipGroup.style('visibility', 'hidden').style('display', null).raise();
      guideLine.attr('x1', x).attr('x2', x);
      tooltipCircle.attr('cx', x).attr('cy', y);

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

      tooltipText.attr('transform', 'translate(0,0)');

      const bbox = tooltipText.node().getBBox();
      const padding = 8;
      const tooltipWidth = bbox.width + padding * 2;
      const tooltipHeight = bbox.height + padding * 2;

      let tooltipX = x;
      let tooltipY = y - 20 - tooltipHeight;

      if (tooltipY < 0) tooltipY = y + 20;
      if (tooltipX - tooltipWidth / 2 < 0) tooltipX = tooltipWidth / 2 + 5;
      if (tooltipX + tooltipWidth / 2 > width) tooltipX = width - tooltipWidth / 2 - 5;

      tooltipBg
        .attr('x', tooltipX - tooltipWidth / 2)
        .attr('y', tooltipY)
        .attr('width', tooltipWidth)
        .attr('height', tooltipHeight);

      tooltipText.attr('transform', `translate(${tooltipX}, ${tooltipY + padding + 10})`);
      tooltipGroup.style('visibility', 'visible');
    }

    function hideTooltip() {
      tooltipGroup.style('display', 'none');
    }

    overlay
      .on('mouseenter', function () {
        tooltipGroup.style('display', null);
      })
      .on('mousemove', function (event) {
        const [mouseX] = d3.pointer(event);
        const d = findClosestDataPoint(mouseX);
        if (d) showTooltip(d);
      })
      .on('mouseleave', hideTooltip);

    overlay
      .on('touchstart', function (event) {
        event.preventDefault();
        const touch = event.touches[0];
        const [touchX] = d3.pointer(touch, this);
        const d = findClosestDataPoint(touchX);
        if (d) showTooltip(d);
      })
      .on('touchmove', function (event) {
        event.preventDefault();
        const touch = event.touches[0];
        const [touchX] = d3.pointer(touch, this);
        const d = findClosestDataPoint(touchX);
        if (d) showTooltip(d);
      })
      .on('touchend', hideTooltip);

    // ========================================================================
    // GROWTH ANNOTATION
    // ========================================================================
    const firstYear = data[0];
    const peakYear = data.reduce((max, d) => d.avg > max.avg ? d : max, data[0]);
    const growthPercent = Math.round(((peakYear.avg - firstYear.avg) / firstYear.avg) * 100);

    const annotation = g
      .append('g')
      .attr('class', 'annotation')
      .attr('opacity', 0);

    const annotationX = xScale(peakYear.year);
    const annotationY = yScale(peakYear.avg);

    const textY = Math.max(annotationY - 70, 20);
    const textX = Math.min(Math.max(annotationX, 80), width - 80);

    annotation
      .append('text')
      .attr('x', textX)
      .attr('y', textY)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(0,0,0,0.78)')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .text(`Peak: +${growthPercent}% since ${firstYear.year}`);

    annotation
      .append('line')
      .attr('x1', textX)
      .attr('y1', textY + 6)
      .attr('x2', annotationX)
      .attr('y2', annotationY - 8)
      .attr('stroke', 'rgba(0,0,0,0.6)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    annotation
      .append('circle')
      .attr('cx', annotationX)
      .attr('cy', annotationY)
      .attr('r', 3)
      .attr('fill', 'rgba(0,0,0,0.6)');

    // ========================================================================
    // COVID PLATEAU ANNOTATION (text + arrow, no box)
    // Context: avg authors per paper did not change much in 2020–2021
    // ========================================================================
    const covidNote = g.append('g')
      .attr('class', 'covid-plateau-note')
      .attr('opacity', 0)
      .style('pointer-events', 'none');

    // Target: mid of the band at year 2020.5, using interpolated y from nearby point
    const targetYear = 2020.5;
    const targetX = xScale(targetYear);

    // Find closest datapoint to 2020 (or 2021) for y positioning
    const d2020 = data.find(d => d.year === 2020);
    const d2021 = data.find(d => d.year === 2021);
    const yRef = d2020?.avg ?? d2021?.avg ?? peakYear.avg;
    const targetY = yScale(yRef) - 6;

    // Place text near top of band, but always inside bounds
    const noteY = 22; // top area
    let noteX = targetX;
    noteX = Math.min(Math.max(noteX, 110), width - 110);

    covidNote.append('text')
      .attr('x', noteX)
      .attr('y', noteY)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.onSurface)
      .attr('fill-opacity', 0.78)
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .text('First COVID year: a plateau as work shifts online');

    covidNote.append('line')
      .attr('x1', noteX)
      .attr('y1', noteY + 6)
      .attr('x2', targetX)
      .attr('y2', Math.max(8, targetY))
      .attr('stroke', colors.onSurface)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', `url(#arrowhead-${colors.onSurface.replace('#', '')})`);

    // Ensure colored arrowhead exists (same pattern as other charts)
    if (!svg.select(`#arrowhead-${colors.onSurface.replace('#', '')}`).node()) {
      svg.append('defs').append('marker')
        .attr('id', `arrowhead-${colors.onSurface.replace('#', '')}`)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', colors.onSurface);
    }

    covidNote.raise();

    // Evidenzia il valore massimo assoluto (max)
    const maxValuePoint = data.reduce((max, d) => d.max > max.max ? d : max, data[0]);
    const maxX = xScale(maxValuePoint.year);
    const maxY = yScale(maxValuePoint.max);

    g.append('circle')
      .attr('cx', maxX)
      .attr('cy', maxY)
      .attr('r', 6)
      .attr('fill', 'red')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.95);

    g.append('text')
      .attr('x', maxX)
      .attr('y', maxY - 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'red')
      .text(`Max value: ${maxValuePoint.max.toFixed(2)}`);

    // -------------------------
    // Animations
    // -------------------------
    errorArea
      .transition()
      .duration(animationDuration)
      .attr('fill-opacity', 0.2);

    const lineLength = avgLine.node().getTotalLength();
    avgLine
      .attr('stroke-dasharray', `${lineLength} ${lineLength}`)
      .attr('stroke-dashoffset', lineLength)
      .attr('stroke-opacity', 1)
      .transition()
      .duration(animationDuration)
      .attr('stroke-dashoffset', 0);

    circles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 50)
      .attr('r', 5);

    annotation
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

    // Show COVID note after main animation (like other annotations)
    covidNote
      .transition()
      .delay(animationDuration + 200)
      .duration(450)
      .attr('opacity', 1);
  }
};
