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
 * - COVID plateau annotation (dashed arrow + text)
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
import { cyanTheme } from '../../assets/js/color-palettes.js';

export const authorsPerPaperConfig = {
  data: authorsPerPaperData,
  margins: { top: 60, right: 60, bottom: 60, left: 80 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors, svg } = ctx;
    const animationDuration = ANIMATION_DURATION;

    // -------------------------
    // Helpers
    // -------------------------
    const ensureArrowheadMarker = (svgSel, color) => {
      const safe = String(color).replace(/[^a-zA-Z0-9_-]/g, '');
      const id = `arrowhead-${safe}`;

      let defs = svgSel.select('defs');
      if (defs.empty()) defs = svgSel.append('defs');

      let marker = defs.select(`#${id}`);
      if (marker.empty()) {
        marker = defs.append('marker')
          .attr('id', id)
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          .attr('refX', 9)
          .attr('refY', 3)
          .attr('orient', 'auto');

        marker.append('polygon')
          .attr('points', '0 0, 10 3, 0 6')
          .attr('fill', color);
      }

      return id;
    };

    // -------------------------
    // Scales
    // -------------------------
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

    // Arrow marker defs (base)
    createArrowMarker(svg);

    // -------------------------
    // Draw error area  (SFUMATURA = cyanTheme.surf)
    // -------------------------
    const errorArea = g
      .append('path')
      .datum(data)
      .attr('class', 'error-area')
      .attr('d', areaGenerator)
      .attr('fill', cyanTheme.surf) // Assicurati che cyanTheme.surf esista o usa colors.surfaceContainer
      .attr('fill-opacity', 0)
      .attr('stroke', 'none');

    // -------------------------
    // Draw average line (LINEA = cyanTheme.prm)
    // -------------------------
    const avgLine = g
      .append('path')
      .datum(data)
      .attr('class', 'avg-line')
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', cyanTheme.prm) // Assicurati che cyanTheme.prm esista o usa colors.primary
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0);

    // -------------------------
    // Draw linear trend line (first to last data point)
    // -------------------------
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];

    const trendLine = g
      .append('line')
      .attr('class', 'trend-line')
      .attr('x1', xScale(firstPoint.year))
      .attr('y1', yScale(firstPoint.avg))
      .attr('x2', xScale(lastPoint.year))
      .attr('y2', yScale(lastPoint.avg))
      .attr('stroke', colors.onSurfaceVariant)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0);

    trendLine.lower();

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
      .attr('fill', cyanTheme.prm)
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2);

    // ========================================================================
    // TOOLTIP WITH VERTICAL GUIDE LINE
    // ========================================================================
    const tooltipGroup = g.append('g')
      .attr('class', 'tooltip-group')
      .style('display', 'none')
      .style('pointer-events', 'none');

    const guideLine = tooltipGroup.append('line')
      .attr('class', 'guide-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', cyanTheme.prm)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.7);

    const tooltipCircle = tooltipGroup.append('circle')
      .attr('r', 6)
      .attr('fill', cyanTheme.prm)
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2);

    const tooltipBg = tooltipGroup.append('rect')
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', cyanTheme.prm)
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
    // GROWTH ANNOTATION (kept)
    // ========================================================================
    const firstYear = data[0];
    const peakYear = data.reduce((max, d) => d.avg > max.avg ? d : max, data[0]);

    // ========================================================================
    // COVID PLATEAU ANNOTATION (DASHED ARROW + text)
    // ========================================================================
    const covidNote = g.append('g')
      .attr('class', 'covid-plateau-note')
      .attr('opacity', 0)
      .style('pointer-events', 'none');

    const targetYear = 2020.5;
    const targetX = xScale(targetYear);

    const d2020 = data.find(d => d.year === 2020);
    const d2021 = data.find(d => d.year === 2021);
    const yRef = d2020?.avg ?? d2021?.avg ?? peakYear.avg;
    const targetY = yScale(yRef) - 6;

    const noteY = 200;
    const NOTE_X_SHIFT = -200; // negativo = va a sinistra (prova -10 / -20 / -30)
    let noteX = targetX + NOTE_X_SHIFT;
    noteX = Math.min(Math.max(noteX, 110), width - 110);

    covidNote.append('text')
      .attr('x', noteX)
      .attr('y', noteY)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.accent)
      .attr('fill-opacity', 0.78)
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .append('tspan')
      .attr('x', noteX)
      .attr('dy', 0)
      .text('Plateau')
      .insert('tspan', ':first-child')
      .attr('x', noteX)
      .attr('dy', '-1.2em')
      .text('Covid 19');

    // Create marker with accent color
    const covidMarkerId = ensureArrowheadMarker(svg, colors.accent);

    // Draw the DASHED arrow line matching the marker color
    covidNote.append('line')
      .attr('x1', noteX)
      .attr('y1', noteY + 6)
      .attr('x2', targetX)
      .attr('y2', Math.max(8, targetY))
      .attr('stroke', colors.accent)      // Color matches marker-end
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,6')    // DASHED STYLE APPLIED HERE
      .attr('marker-end', `url(#${covidMarkerId})`);

    covidNote.raise();

    // Evidenzia il valore massimo assoluto (max)
    const maxValuePoint = data.reduce((max, d) => d.max > max.max ? d : max, data[0]);
    const maxX = xScale(maxValuePoint.year);
    const maxY = yScale(maxValuePoint.max);

    g.append('circle')
      .attr('cx', maxX)
      .attr('cy', maxY -5)
      .attr('r', 6)
      .attr('fill', colors.accent)
      .attr('stroke', colors.accent)
      .attr('stroke-width', 2)
      .attr('opacity', 0.95);

    g.append('text')
      .attr('x', maxX)
      .attr('y', maxY - 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', colors.accent)
      .text(`Max value: ${maxValuePoint.max.toFixed(2)}`);

    // -------------------------
    // Animations
    // -------------------------
    errorArea
      .transition()
      .duration(animationDuration)
      .attr('fill-opacity', 0.75);

    trendLine
      .transition()
      .duration(animationDuration)
      .attr('opacity', 0.4);

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

    // annotation.transition()... (removed/not used)

    covidNote
      .transition()
      .delay(animationDuration + 200)
      .duration(450)
      .attr('opacity', 1);
  }
};