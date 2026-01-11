/**
 * authors/plots/uniqueAuthorsTimeline.js
 * Cumulative area chart showing unique authors growth over time
 *
 * Features:
 * - Gradient-filled area chart with animated border line
 * - Milestone markers at key thresholds (500, 1000, 2500, 5000)
 * - Tooltip with vertical guide line on hover/touch
 * - Stats annotation box
 * - Peak (2020) annotation with arrow + NYT-style text
 */

import { uniqueAuthorsData, uniqueAuthorsStats } from '../../data/authors/uniqueAuthorsData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes,
  cleanAxes,
  createArrowMarker
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
    const thresholds = [500, 1000, 2500, 5000];
    const milestones = thresholds
      .map((threshold) => {
        const dataPoint = data.find((d) => d.cumulative >= threshold);
        if (dataPoint) {
          let label;
          if (threshold >= 1000) {
            label = `${(threshold / 1000).toString().replace(/\.0$/, '')}k+ authors`;
          } else {
            label = `${(threshold / 1000).toFixed(1)}k+ authors`;
          }
          return {
            year: dataPoint.year,
            cumulative: dataPoint.cumulative,
            label
          };
        }
        return null;
      })
      .filter((m) => m !== null);

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
      .attr('y', (d) => yScale(d.cumulative) - 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.accent || colors.tertiary)
      .selectAll('tspan')
      .data((d) => d.label.split(' '))
      .join('tspan')
      .attr('x', (d, i, nodes) => d3.select(nodes[i].parentNode).attr('x'))
      .attr('dy', (d, i) => (i === 0 ? 0 : '1.1em'))
      .text((d) => d);

    // Axes
    renderTitle(ctx, 'Cumulative Growth of Unique Authors');

    // X ticks (every 5y + last year)
    const yearVals = data.map((d) => d.year);
    const minYear = yearVals[0];
    const maxYear = yearVals[yearVals.length - 1];
    const tickYears = [];
    for (let y = minYear; y <= maxYear; y += 5) tickYears.push(y);
    if (!tickYears.includes(maxYear)) tickYears.push(maxYear);

    renderXAxis(ctx, xScale, {
      label: 'Year',
      tickFormat: d3.format('d'),
      tickValues: tickYears
    });

    renderYAxis(ctx, yScale, {
      label: 'Cumulative Authors',
      tickFormat: (d) => (d >= 1000 ? (d / 1000).toFixed(0) + 'k' : d)
    });

    styleAxes(g);
    cleanAxes(g);

    // Arrow marker for annotations
    createArrowMarker(svg);

    // ========================================================================
    // PEAK NEW AUTHORS ANNOTATION (2020) - arrow + NYT-style text + dot
    // ========================================================================
    const peakYear = uniqueAuthorsStats.peakNewYear; // 2020
    const peakPoint = data.find((d) => d.year === peakYear);

    const avgNew = uniqueAuthorsStats.avgNewPerYear;
    const peakNew = uniqueAuthorsStats.peakNewCount;
    const pctAboveAvg = Math.round(((peakNew - avgNew) / avgNew) * 100);

    if (peakPoint) {
      const targetX = xScale(peakPoint.year);
      const targetY = yScale(peakPoint.cumulative);

      // --- DOT (same style as milestone dots) ---
      g.append('circle')
        .attr('class', 'peak-dot')
        .attr('cx', targetX)
        .attr('cy', targetY)
        .attr('r', 6)
        .attr('fill', colors.accent || colors.tertiary)
        .attr('stroke', colors.surfaceContainer)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .delay(animationDuration + 250)
        .duration(350)
        .attr('opacity', 1);

      const noteG = g
        .append('g')
        .attr('class', `peak-new-note note-${peakYear}`)
        .attr('opacity', 0)
        .style('pointer-events', 'none');

      // --- MOVE TEXT: slightly lower + slightly left ---
      // tweak these two numbers as you like:
      const X_SHIFT = 100;  // move left (increase to go more left)
      const Y_SHIFT = 100;  // move down (increase to go more down)

      let tx = targetX - X_SHIFT;
      tx = Math.min(Math.max(tx, 140), width - 140);

      const ty = 22 + Y_SHIFT;

      noteG.append('text')
        .attr('x', tx)
        .attr('y', ty)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.onSurface)
        .attr('fill-opacity', 0.78)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .selectAll('tspan')
        .data([`${pctAboveAvg}% above average.`, 'A Covid effect?'])
        .join('tspan')
        .attr('x', tx)
        .attr('dy', (d, i) => (i === 0 ? 0 : '1.2em'))
        .text(d => d);

      noteG.append('line')
        .attr('x1', tx + 50)
        .attr('y1', ty + 6)
        .attr('x2', targetX-10)
        .attr('y2', targetY-6)
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


      noteG.raise();

      noteG.transition()
        .delay(animationDuration + 250)
        .duration(450)
        .attr('opacity', 1);
    }

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
      const bisect = d3.bisector((d) => d.year).left;
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
      const y = yScale(d.cumulative);

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
        .text(`Total: ${d.cumulative.toLocaleString()}`);

      tooltipText.append('tspan')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .attr('font-size', '10px')
        .attr('fill', colors.onSurfaceVariant)
        .text(`+${d.newAuthors} new authors`);

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

    // Stats annotations (top-right)
    g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .attr('fill', colors.onSurfaceVariant)
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(`Total: ${uniqueAuthorsStats.total.toLocaleString()} authors`)
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

    g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 28)
      .attr('text-anchor', 'end')
      .attr('fill', colors.onSurfaceVariant)
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(`Average: ${uniqueAuthorsStats.avgNewPerYear} new authors per year`)
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

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
  }
};
