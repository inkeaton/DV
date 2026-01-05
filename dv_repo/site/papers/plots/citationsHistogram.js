/**
 * papers/plots/citationsHistogram.js
 * Histogram showing citation distribution
 */

import { citationsHistogramData, citationStats, histogramBins } from '../../data/papers/citationsHistogramData.js';
import { renderTitle, renderXAxis, renderYAxis, styleAxes } from '../../assets/js/chart-utils.js';

export const citationsHistogramConfig = {
  data: citationsHistogramData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors: themeColors } = ctx;
    const animationDuration = 800;

    renderTitle(ctx, 'Citation Distribution');

    // Helper CSS (solo per surface/outline)
    const css = (v) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    // ----- FORCE MAX -----
    const xMax = 4000;

    // Filter thresholds to xMax + ensure xMax is included
    const thresholds = histogramBins.thresholds
      .filter(t => t <= xMax)
      .concat([xMax]);

    const lastThr = thresholds[thresholds.length - 1];

    // Histogram
    const histogram = d3.bin()
      .domain([0, xMax])
      .thresholds(thresholds);

    const bins = histogram(data);

    // Scales
    const xScale = d3.scaleSymlog()
      .constant(10)
      .domain([0, xMax])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) * 1.1])
      .nice()
      .range([height, 0]);

    // Axes (ticks = thresholds filtrati)
    renderXAxis(ctx, xScale, {
      label: 'Number of Citations',
      tickValues: thresholds,
      tickFormat: d3.format('~s')
    });
    renderYAxis(ctx, yScale, { label: 'Number of Papers', tickCount: 6 });
    styleAxes(g);

    // ----- COLORS: LILAC -> PURPLE (FIXED, non dipende dal tema) -----
    // (lilac = blu/viola chiaro, purple = viola, deepPurple = coda più scura)
    const lilac = '#d0bcff';
    const purple = '#6750a4';
    const deepPurple = '#4a148c';

    // Separatore bar
    const surface = css('--md-sys-color-surface') || '#ffffff';
    const outline = css('--md-sys-color-outline') || '#2b2b2b';

    // Base scale su tutto range
    const baseScale = d3.scaleSequential()
      .domain([0, xMax])
      .interpolator(d3.interpolateLab(lilac, purple));

    // Tail emphasis (da 200 in su, diventa più scuro verso deepPurple)
    const tailStart = 200;
    const tailScale = d3.scaleSequential()
      .domain([tailStart, xMax])
      .interpolator(d3.interpolateLab(purple, deepPurple));

    const fillForBin = (d) => {
      const mid = (d.x0 + d.x1) / 2;
      if (mid >= tailStart) return tailScale(mid);
      return baseScale(mid);
    };

    // Draw bars
    const bars = g.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0) + 1)
      .attr('y', height)
      .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
      .attr('height', 0)
      .attr('fill', d => fillForBin(d))
      .attr('opacity', 0.92)
      .attr('stroke', surface)
      .attr('stroke-width', 1)
      .attr('rx', 2);

    // Animate
    bars.transition()
      .duration(animationDuration)
      .delay((d, i) => i * 60)
      .attr('y', d => yScale(d.length))
      .attr('height', d => Math.max(0, height - yScale(d.length)));

    // Tooltip label
    const labelForBin = (d) => {
      if (d.x1 >= lastThr) return `${d.x0}+ citations`;
      return `${d.x0}-${d.x1} citations`;
    };

    // Hover
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .raise()
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('stroke', outline)
          .attr('stroke-width', 2);

        const pct = ((d.length / data.length) * 100).toFixed(1);
        tooltip.show(
          event,
          `<strong>${labelForBin(d)}</strong><br>${d.length} papers (${pct}%)`,
          themeColors
        );
      })
      .on('mousemove', function (event, d) {
        const pct = ((d.length / data.length) * 100).toFixed(1);
        tooltip.show(
          event,
          `<strong>${labelForBin(d)}</strong><br>${d.length} papers (${pct}%)`,
          themeColors
        );
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.92)
          .attr('stroke', surface)
          .attr('stroke-width', 1);

        tooltip.hide();
      });

    // Median line
    const medianX = xScale(citationStats.median);

    const medianLine = g.append('line')
      .attr('class', 'median-line')
      .attr('x1', medianX)
      .attr('x2', medianX)
      .attr('y1', height)
      .attr('y2', height)
      .attr('stroke', 'var(--md-sys-color-error)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3');

    medianLine.transition()
      .delay(animationDuration)
      .duration(400)
      .attr('y2', 0);

    g.append('text')
      .attr('class', 'median-label')
      .attr('x', medianX + 8)
      .attr('y', 20)
      .attr('fill', 'var(--md-sys-color-error)')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text(`Median: ${citationStats.median}`);

    // Mean line (usiamo purple per coerenza palette)
    const meanX = xScale(citationStats.mean);

    const meanLine = g.append('line')
      .attr('class', 'mean-line')
      .attr('x1', meanX)
      .attr('x2', meanX)
      .attr('y1', height)
      .attr('y2', height)
      .attr('stroke', purple)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2,3');

    meanLine.transition()
      .delay(animationDuration)
      .duration(400)
      .attr('y2', 0);

    // Stats annotation
    g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .text(`Mean: ${citationStats.mean} citations`);
  }
};
