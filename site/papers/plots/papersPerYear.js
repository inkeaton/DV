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
  ,
  darkenHex
} from '../../assets/js/chart-utils.js';

import { storyColor } from '../../assets/js/color-palettes.js';

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
    // Colors: single fill for all bars driven by centralized `storyColor`.
    // Peak bar uses the story hover token and a soft grey border.
    // -------------------------
    const normalFill = storyColor.default;

    // helper to detect dark theme dynamically
    const isDark = () => (document && document.body && document.body.classList && document.body.classList.contains('dark-theme'));

    // (no separate peak fill variable — compute a darkened peak fill to match other charts)
    const peakDarkFill = darkenHex(d3, storyColor.default, 0.30);

    // -------------------------
    // Bars
    // -------------------------
    const bars = g.selectAll('.bar')
      .data(fullData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('data-year', d => d.year)
      .attr('x', d => xScale(d.year))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 2)
      .attr('fill', d => (d.count == null ? 'transparent' : normalFill))
      .attr('stroke', 'none')
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 0)
      .style('pointer-events', d => (d.count == null ? 'none' : 'auto'));

    // Animate
    bars.transition()
      .duration(ANIMATION_DURATION)
      .delay((d, i) => i * 12)
      .attr('y', d => (d.count == null ? height : yScale(d.count)))
      .attr('height', d => (d.count == null ? 0 : Math.max(0, height - yScale(d.count))));

    // After animation, pop the peak year bar (darker fill + soft grey border)
    const peakYear = stats.peakYear;
    const peakSel = g.selectAll(`.bar[data-year="${peakYear}"]`);
    if (!peakSel.empty()) {
      peakSel
        .raise()
        .transition()
        .delay(ANIMATION_DURATION + 150)
        .duration(400)
        .attr('fill', d => (d.count == null ? 'transparent' : peakDarkFill))
        .attr('stroke', colors.onSurface)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 2);
    }

    // -------------------------
    // Tooltip
    // -------------------------
    bars
      .on('mouseenter', function (event, d) {
        const isPeak = d.year === stats.peakYear;
        const el = d3.select(this);

        // store original fill so we can restore it on mouseleave
        this.__origFill = this.__origFill || el.attr('fill');

        if (isPeak) {
          // emphasize border for peak year (stronger on hover)
          el.transition()
            .duration(150)
            .attr('opacity', 1)
            .attr('stroke', colors.onSurface)
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 0.85);
        } else {
          // subtle hover for regular bars: use storyColor hover variant based on theme
          const hoverFill = isDark() ? (storyColor.hoverDark || storyColor.default) : (storyColor.hoverLight || storyColor.default);
          el.transition()
            .duration(150)
            .attr('fill', hoverFill)
            .attr('opacity', 0.95);
        }

        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mousemove', function (event, d) {
        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mouseleave', function (event, d) {
        const isPeak = d.year === stats.peakYear;
        const el = d3.select(this);

        if (isPeak) {
          // restore border to default soft border and keep peak fill (story default)
          el.transition()
            .duration(150)
            .attr('stroke', colors.onSurface)
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.4)
            .attr('fill', storyColor.default)
            .attr('opacity', 1);
        } else {
          // restore original fill (or fallback to normal fill)
          const restoreFill = this.__origFill || normalFill;
          el.transition()
            .duration(150)
            .attr('fill', restoreFill)
            .attr('opacity', 1);
        }

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

      // Positioning: place the note further left of the bar
      const ty = Math.max(18, barTopY - 55);
      const tx = Math.max(10, xCenter - 120);

      noteG.append('text')
        .attr('x', tx)
        .attr('y', ty)
        .attr('fill', colors.accent)
        .attr('fill-opacity', 0.78)
        .attr('font-size', '12px')
        .attr('text-anchor', 'start')
        .text('COVID impact? Peak publication year');

      const arrowStartX = tx + 6;
      const arrowStartY = ty + 6;

      noteG.append('line')
        .attr('x1', arrowStartX)
        .attr('y1', arrowStartY)
        .attr('x2', targetX)
        .attr('y2', targetY)
        .attr('stroke', colors.accent)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,6')
        .attr('marker-end', `url(#arrowhead-${colors.accent.replace('#', '')})`);

      // Create a dynamic arrowhead marker with the correct color (same as papersByConference)
      if (!svg.select(`#arrowhead-${colors.accent.replace('#', '')}`).node()) {
        svg.append('defs').append('marker')
          .attr('id', `arrowhead-${colors.accent.replace('#', '')}`)
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          .attr('refX', 9)
          .attr('refY', 3)
          .attr('orient', 'auto')
          .append('polygon')
          .attr('points', '0 0, 10 3, 0 6')
          .attr('fill', colors.accent);
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
