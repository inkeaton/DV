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

    // Title
    renderTitle(ctx, 'Citation Distribution');

    // Create histogram bins
    const histogram = d3.bin()
      .domain([0, d3.max(data)])
      .thresholds(histogramBins.thresholds);

    const bins = histogram(data);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, histogramBins.thresholds[histogramBins.thresholds.length - 1]])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) * 1.1])
      .nice()
      .range([height, 0]);

    // Axes
    renderXAxis(ctx, xScale, { label: 'Number of Citations' });
    renderYAxis(ctx, yScale, { label: 'Number of Papers', tickCount: 6 });
    styleAxes(g);

    // Color scale for bins (gradient from primary to tertiary)
    const colorScale = d3.scaleSequential()
      .domain([0, bins.length - 1])
      .interpolator(d3.interpolateRgb(
        'var(--md-sys-color-primary)',
        'var(--md-sys-color-tertiary)'
      ));

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
      .attr('fill', (d, i) => {
        // Use fixed colors instead of CSS variables in interpolation
        const colors = ['#6750a4', '#625b71', '#7d5260', '#b58392', '#d0bcff'];
        return colors[Math.min(i, colors.length - 1)];
      })
      .attr('rx', 2);

    // Animate bars
    bars.transition()
      .duration(animationDuration)
      .delay((d, i) => i * 80)
      .attr('y', d => yScale(d.length))
      .attr('height', d => Math.max(0, height - yScale(d.length)));

    // Tooltip interactions
    bars
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8);
        
        const rangeLabel = d.x1 >= histogramBins.thresholds[histogramBins.thresholds.length - 1] 
          ? `${d.x0}+ citations`
          : `${d.x0}-${d.x1} citations`;
        
        tooltip.show(event, `<strong>${rangeLabel}</strong><br>${d.length} papers`, themeColors);
      })
      .on('mousemove', function(event, d) {
        const rangeLabel = d.x1 >= histogramBins.thresholds[histogramBins.thresholds.length - 1] 
          ? `${d.x0}+ citations`
          : `${d.x0}-${d.x1} citations`;
        tooltip.show(event, `<strong>${rangeLabel}</strong><br>${d.length} papers`, themeColors);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1);
        
        tooltip.hide();
      });

    // Add median line
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

    // Median label
    const medianLabel = g.append('text')
      .attr('class', 'median-label')
      .attr('x', medianX + 8)
      .attr('y', 20)
      .attr('fill', 'var(--md-sys-color-error)')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('opacity', 0)
      .text(`Median: ${citationStats.median}`);

    medianLabel.transition()
      .delay(animationDuration + 400)
      .duration(300)
      .attr('opacity', 1);

    // Stats annotation
    const statsText = g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(`Mean: ${citationStats.mean} citations`);

    statsText.transition()
      .delay(animationDuration + 400)
      .duration(300)
      .attr('opacity', 1);
  }
};
