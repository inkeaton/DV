/**
 * papers/plots/papersByConference.js
 * Stacked bar chart showing papers by conference type per year
 */

import { papersByConferenceData, conferenceKeys, conferenceLabels } from '../../data/papers/papersByConferenceData.js';
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
import { conferenceColors } from '../../assets/js/color-palettes.js';

export const papersByConferenceConfig = {
  data: papersByConferenceData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors, svg } = ctx;

    // Years domain
    const years = d3.range(YEAR_RANGE.min, YEAR_RANGE.max + 1);

    // Extend data to include missing years (zeros)
    const fullData = fillYearGaps(d3, data, YEAR_RANGE.min, YEAR_RANGE.max, conferenceKeys);

    // Totals for legend
    const totalsByKey = {};
    conferenceKeys.forEach(k => {
      totalsByKey[k] = d3.sum(fullData, d => +d[k] || 0);
    });

    // -------------------------
    // Title
    // -------------------------
    renderTitle(ctx, 'Papers by Conference Track');

    // -------------------------
    // Stack
    // -------------------------
    const stack = d3.stack()
      .keys(conferenceKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(fullData);

    // -------------------------
    // Scales
    // -------------------------
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(fullData, d =>
      conferenceKeys.reduce((sum, key) => sum + (+d[key] || 0), 0)
    ) || 0;

    const yTop = Math.max(yMax, 160) * 1.05;

    const yScale = d3.scaleLinear()
      .domain([0, yTop])
      .nice()
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(conferenceKeys)
      .range(conferenceKeys.map(k => conferenceColors[k]));

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

    // -------------------------
    // Grey band 2012–2020 (ONLY rectangle, no text, no arrow)
    // -------------------------
    const bandStart = 2012;
    const bandEnd = 2020;

    const bx0 = xScale(bandStart);
    const bx1 = xScale(bandEnd);
    const bandW = xScale.bandwidth();

    if (bx0 != null && bx1 != null) {
      const band = g.append('rect')
        .attr('class', 'note-band')
        .attr('x', bx0)
        .attr('y', 0)
        .attr('width', (bx1 - bx0) + bandW)
        .attr('height', height)
        .attr('fill', 'rgba(0,0,0,0.10)') // leggermente grigio
        .attr('opacity', 0);

      band.transition()
        .duration(600)
        .delay(250)
        .attr('opacity', 1);

      // keep behind everything
      band.lower();
    }

    // -------------------------
    // Layers
    // -------------------------
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

    // Animate bars
    bars.transition()
      .duration(ANIMATION_DURATION)
      .delay((d, i) => i * 10)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])));

    // Highlight FIRST APPEARANCE segments
    const highlightSpecs = [
      { year: 1995, key: 'infovis', label: 'InfoVis starts', placement: 'left' },
      { year: 2006, key: 'vast', label: 'VAST starts', placement: 'center' },
      { year: 2012, key: 'scivis', label: 'SciVis starts', placement: 'center' }
    ];

    highlightSpecs.forEach(spec => {
      const sel = g.selectAll(`.bar[data-year="${spec.year}"][data-key="${spec.key}"]`);
      if (sel.empty()) return;

      const baseColor = conferenceColors[spec.key];
      const strongColor = darkenHex(d3, baseColor, 0.30);

      // Pop the segment
      sel
        .raise()
        .transition()
        .delay(ANIMATION_DURATION + 150)
        .duration(400)
        .attr('fill', strongColor)
        .attr('stroke', 'rgba(0,0,0,0.40)')
        .attr('stroke-width', 2);

      // Add note + arrow + dot (only for InfoVis/VAST)
      sel.each(function (d) {
        const xCenter = xScale(d.data.year) + xScale.bandwidth() / 2;
        const yMid = (yScale(d[0]) + yScale(d[1])) / 2;

        const targetX = xCenter + 2;
        const targetY = yMid;

        const noteG = g.append('g')
          .attr('class', `first-appearance-note note-${spec.year}-${spec.key}`)
          .attr('opacity', 0)
          .style('pointer-events', 'none');

        // VAST higher than InfoVis
        const topY = Math.max(18, yMid - (spec.placement === 'center' ? 130 : 26));

        let tx, ty, textAnchor;
        if (spec.placement === 'left') {
          tx = Math.max(10, xScale(spec.year) - 120);
          ty = topY;
          textAnchor = 'start';
        } else {
          tx = xCenter;
          ty = topY;
          textAnchor = 'middle';
        }

        noteG.append('text')
          .attr('x', tx)
          .attr('y', ty)
          .attr('fill', 'rgba(0,0,0,0.78)')
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('text-anchor', textAnchor)
          .text(spec.label);

        const arrowStartX = (spec.placement === 'left') ? (tx + 6) : (tx);
        const arrowStartY = ty + 6;

        noteG.append('line')
          .attr('x1', arrowStartX)
          .attr('y1', arrowStartY)
          .attr('x2', targetX)
          .attr('y2', targetY)
          .attr('stroke', 'rgba(0,0,0,0.6)')
          .attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrowhead)');

        noteG.append('circle')
          .attr('cx', targetX)
          .attr('cy', targetY)
          .attr('r', 3)
          .attr('fill', 'rgba(0,0,0,0.6)');

        noteG.transition()
          .delay(ANIMATION_DURATION + 260)
          .duration(450)
          .attr('opacity', 1);

        noteG.raise();
      });
    });

    // -------------------------
    // Tooltip interactions
    // -------------------------
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8);

        const value = d.data[d.key] || 0;
        tooltip.show(event, `<strong>${d.data.year}</strong><br>${conferenceLabels[d.key]}: ${value} papers`, colors);
      })
      .on('mousemove', function (event, d) {
        const value = d.data[d.key] || 0;
        tooltip.show(event, `<strong>${d.data.year}</strong><br>${conferenceLabels[d.key]}: ${value} papers`, colors);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1);

        tooltip.hide();
      });

    // -------------------------
    // Legend (with totals)
    // -------------------------
    const legendItems = conferenceKeys.map(key => ({
      label: `${conferenceLabels[key]}: ${totalsByKey[key].toLocaleString()} papers`,
      color: conferenceColors[key]
    }));

    renderLegend(ctx, legendItems, { x: width - 110, y: 0 });
  }
};
