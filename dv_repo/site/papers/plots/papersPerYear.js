/**
 * papers/plots/papersPerYear.js
 * Bar chart showing total papers published per year
 */

import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes,
  cleanAxes,
  getTickYears,
  createArrowMarker
} from '../../assets/js/chart-utils.js';

import {
  ANIMATION_DURATION,
  YEAR_RANGE,
  DEFAULT_Y_TICKS
} from '../../assets/js/chart-constants.js';

import {
  papersPerYearData,
  papersPerYearStats
} from '../../data/papers/papersPerYearDataModule.js';

export const papersPerYearConfig = {
  data: papersPerYearData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors, svg } = ctx;

    const stats = papersPerYearStats;
    const avgValue = stats.avgPerYear;

    // -------------------------
    // Title
    // -------------------------
    renderTitle(ctx, 'Papers Published Per Year');

    // -------------------------
    // Years domain + fill gaps (null = missing year)
    // -------------------------
    const years = d3.range(YEAR_RANGE.min, YEAR_RANGE.max + 1);

    const countByYear = new Map(data.map(d => [d.year, d.count]));
    const fullData = years.map(y => ({
      year: y,
      count: countByYear.has(y) ? countByYear.get(y) : null
    }));

    // -------------------------
    // Scales
    // -------------------------
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.2);

    const maxCount = d3.max(data, d => d.count) ?? 0;
    const yTop = Math.max(maxCount, 160, avgValue) * 1.1;

    const yScale = d3.scaleLinear()
      .domain([0, yTop])
      .nice()
      .range([height, 0]);

    // -------------------------
    // Axes
    // -------------------------
    const xTickYears = getTickYears(years, 5, YEAR_RANGE.max);
    const yTickValues = [...DEFAULT_Y_TICKS, avgValue].sort((a, b) => a - b);

    renderXAxis(ctx, xScale, {
      label: 'Year',
      tickValues: xTickYears,
      tickFormat: d => d
    });

    renderYAxis(ctx, yScale, {
      label: 'Number of Papers',
      tickValues: yTickValues,
      tickFormat: d => d
    });

    styleAxes(g);
    cleanAxes(g);

    // Arrow marker for annotations (same approach as papersByConference)
    createArrowMarker(svg);

    // -------------------------
    // Colors
    // -------------------------
    const normalFill = 'var(--md-sys-color-primary)';
    const highlightFill = 'var(--md-sys-color-tertiary)';
    const hoverNormalFill = 'var(--md-sys-color-primary-container)';
    const hoverHighlightFill = 'var(--md-sys-color-tertiary-container)';

    // -------------------------
    // Bars
    // -------------------------
    const bars = g.selectAll('.bar')
      .data(fullData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 2)
      .attr('fill', d => {
        if (d.count == null) return 'transparent';
        return (d.year === stats.peakYear) ? highlightFill : normalFill;
      })
      .style('pointer-events', d => (d.count == null ? 'none' : 'auto'));

    // Animate
    bars.transition()
      .duration(ANIMATION_DURATION)
      .delay((d, i) => i * 12)
      .attr('y', d => (d.count == null ? height : yScale(d.count)))
      .attr('height', d => (d.count == null ? 0 : Math.max(0, height - yScale(d.count))));

    // -------------------------
    // Tooltip
    // -------------------------
    bars
      .on('mouseenter', function (event, d) {
        const isHighlight = d.year === stats.peakYear;

        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', isHighlight ? hoverHighlightFill : hoverNormalFill);

        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mousemove', function (event, d) {
        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mouseleave', function (event, d) {
        const isHighlight = d.year === stats.peakYear;

        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', isHighlight ? highlightFill : normalFill);

        tooltip.hide();
      });

    // -------------------------
    // Average dashed line + label (left)
    // -------------------------
    const avgY = yScale(avgValue);

    const avgGroup = g.append('g')
      .attr('class', 'avg-line')
      .style('pointer-events', 'none');

    avgGroup.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', avgY)
      .attr('y2', avgY)
      .attr('stroke', colors.accent)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,6')
      .attr('opacity', 0.95);

    avgGroup.append('text')
      .attr('x', 6)
      .attr('y', avgY - 8)
      .attr('text-anchor', 'start')
      .attr('fill', colors.accent)
      .attr('font-size', '12px')
      .text(`Average: ${avgValue} papers per year`);

    avgGroup.raise();

    // -------------------------
    // Peak-year annotation (arrow + text) like papersByConference
    // -------------------------
    const peakYear = stats.peakYear;
    const peakCount = stats.peakValue ?? countByYear.get(peakYear);

    const peakX0 = xScale(peakYear);
    if (peakX0 != null && peakCount != null) {
      const xCenter = peakX0 + xScale.bandwidth() / 2;
      const barTopY = yScale(peakCount);

      // Target point: a bit above the bar
      const targetX = xCenter;
      const targetY = Math.max(6, barTopY - 6);

      const noteG = g.append('g')
        .attr('class', `peak-year-note note-${peakYear}`)
        .attr('opacity', 0)
        .style('pointer-events', 'none');

      // Positioning: similar logic (slightly above, centered)
      const ty = Math.max(18, barTopY - 55);
      const tx = xCenter;

      noteG.append('text')
        .attr('x', tx)
        .attr('y', ty)
        .attr('fill', colors.onSurface)
        .attr('fill-opacity', 0.78)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('text-anchor', 'middle')
        .text('COVID impact? Peak publication year');

      const arrowStartX = tx;
      const arrowStartY = ty + 6;

      noteG.append('line')
        .attr('x1', arrowStartX)
        .attr('y1', arrowStartY)
        .attr('x2', targetX)
        .attr('y2', targetY)
        .attr('stroke', colors.onSurface)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
        .attr('marker-end', `url(#arrowhead-${colors.onSurface.replace('#', '')})`);

      // Create a dynamic arrowhead marker with the correct color (same as papersByConference)
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

      noteG.transition()
        .delay(ANIMATION_DURATION + 260)
        .duration(450)
        .attr('opacity', 1);

      noteG.raise();
    }

    // -------------------------
    // Stats annotation (top-right)
    // -------------------------
    const statsText = g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(`Total: ${stats.total.toLocaleString()} papers`);

    statsText.transition()
      .delay(ANIMATION_DURATION)
      .duration(400)
      .attr('opacity', 1);
  }
};
