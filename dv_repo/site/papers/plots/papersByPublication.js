/**
 * papers/plots/papersByPublication.js
 * Stacked bar chart showing papers by publication type per year
 */

import {
  papersByPublicationData,
  publicationKeys,
  publicationLabels
} from '../../data/papers/papersByPublicationData.js';

import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  renderLegend,
  styleAxes,
  cleanAxes,
  fillYearGaps,
  getTickYears,
  createArrowMarker,
  darkenHex
} from '../../assets/js/chart-utils.js';

import { ANIMATION_DURATION, YEAR_RANGE, DEFAULT_Y_TICKS } from '../../assets/js/chart-constants.js';
import { publicationColors } from '../../assets/js/color-palettes.js';

export const papersByPublicationConfig = {
  data: papersByPublicationData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors, svg } = ctx;

    // Years domain
    const years = d3.range(YEAR_RANGE.min, YEAR_RANGE.max + 1);

    // Fill missing years with zeros
    const fullData = fillYearGaps(d3, data, YEAR_RANGE.min, YEAR_RANGE.max, publicationKeys);

    // Totals for legend
    const totalsByKey = {};
    publicationKeys.forEach(k => {
      totalsByKey[k] = d3.sum(fullData, d => +d[k] || 0);
    });

    // Title
    renderTitle(ctx, 'Papers by Publication Type');

    // Stack
    const stack = d3.stack()
      .keys(publicationKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(fullData);

    // Scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(fullData, d =>
      publicationKeys.reduce((sum, key) => sum + (+d[key] || 0), 0)
    ) || 0;

    const yTop = Math.max(yMax, 160) * 1.05;

    const yScale = d3.scaleLinear()
      .domain([0, yTop])
      .nice()
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(publicationKeys)
      .range(publicationKeys.map(k => publicationColors[k]));

    // Axes
    const xTickYears = getTickYears(years, 5, YEAR_RANGE.max);

    renderXAxis(ctx, xScale, {
      label: 'Year',
      tickValues: xTickYears,
      tickFormat: d => d
    });

    renderYAxis(ctx, yScale, {
      label: 'Total number of papers',
      tickValues: DEFAULT_Y_TICKS,
      tickFormat: d => d
    });

    styleAxes(g);
    cleanAxes(g);

    // Arrow marker for annotations
    createArrowMarker(svg);

    // Layers
    const layers = g.selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', d => colorScale(d.key));

    // Bars
    const bars = layers.selectAll('.bar')
      .data(d => d.map(point => ({ ...point, key: d.key })))
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('data-year', d => d.data.year)
      .attr('data-key', d => d.key)
      .attr('x', d => xScale(d.data.year))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 2);

    // Animate
    bars.transition()
      .duration(ANIMATION_DURATION)
      .delay((d, i) => i * 10)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])));

    // Highlight full bar (2006) + annotation
    const highlightBarSpec = { year: 2006, label: 'VAST starts', placement: 'center' };

    const yearToHighlight = highlightBarSpec.year;
    const segs = g.selectAll(`.bar[data-year="${yearToHighlight}"]`);

    if (!segs.empty()) {
      // Pop all segments for that year
      segs
        .raise()
        .transition()
        .delay(ANIMATION_DURATION + 150)
        .duration(400)
        .attr('fill', function (d) {
          const base = publicationColors[d.key];
          return darkenHex(d3, base, 0.30);
        })
        .attr('stroke', colors.onSurface)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 2);

      // Arrow target = top of the full stacked bar
      const row = fullData.find(d => d.year === yearToHighlight);
      const total = row
        ? publicationKeys.reduce((s, k) => s + (+row[k] || 0), 0)
        : 0;

      const xCenter = xScale(yearToHighlight) + xScale.bandwidth() / 2;
      const targetX = xCenter + 2;
      const targetY = yScale(total);

      const noteG = g.append('g')
        .attr('class', `full-bar-note note-${yearToHighlight}`)
        .attr('opacity', 0)
        .style('pointer-events', 'none');

      const topY = Math.max(18, targetY - 60);
      const tx = xCenter;
      const ty = topY;

      noteG.append('text')
        .attr('x', tx)
        .attr('y', ty)
        .attr('fill', colors.onSurface)
        .attr('fill-opacity', 0.78)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('text-anchor', 'middle')
        .text(highlightBarSpec.label);

      noteG.append('line')
        .attr('x1', tx)
        .attr('y1', ty + 6)
        .attr('x2', targetX)
        .attr('y2', targetY)
        .attr('stroke', colors.onSurface)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
        .attr('marker-end', `url(#arrowhead-${colors.onSurface.replace('#', '')})`);

        // Create a dynamic arrowhead marker with the correct color
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

    // Tooltip
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8);

        const value = d.data[d.key] || 0;
        tooltip.show(
          event,
          `<strong>${d.data.year}</strong><br>${publicationLabels[d.key]}: ${value} papers`,
          colors
        );
      })
      .on('mousemove', function (event, d) {
        const value = d.data[d.key] || 0;
        tooltip.show(
          event,
          `<strong>${d.data.year}</strong><br>${publicationLabels[d.key]}: ${value} papers`,
          colors
        );
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1);

        tooltip.hide();
      });

    // Legend
    const grandTotal = publicationKeys.reduce((sum, k) => sum + totalsByKey[k], 0);

    const legendItems = publicationKeys.map(key => {
      const count = totalsByKey[key];
      const pct = ((count / grandTotal) * 100).toFixed(1);
      return {
        label: `${publicationLabels[key]}: ${count.toLocaleString()} (${pct}%)`,
        color: publicationColors[key]
      };
    });

    renderLegend(ctx, legendItems, { x: width - 180, y: 0 });
  }
};
