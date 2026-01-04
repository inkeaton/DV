/**
 * papers/plots/papersPerYear.js
 * Simple bar chart showing papers per year
 */

import { papersPerYearData, papersPerYearStats } from '../../data/papers/papersPerYearData.js';
import { renderTitle, renderXAxis, renderYAxis, styleAxes } from '../../assets/js/chart-utils.js';

export const papersPerYearConfig = {
  data: papersPerYearData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Papers Published Per Year');

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) * 1.1])
      .nice()
      .range([height, 0]);

    // Axes
    renderXAxis(ctx, xScale, { label: 'Year', tickFormat: d => d, tickCount: 7 });
    renderYAxis(ctx, yScale, { label: 'Number of Papers', tickCount: 6 });
    styleAxes(g);

    // Bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', 'var(--md-sys-color-primary)')
      .attr('rx', 2);

    // Animate bars
    bars.transition()
      .duration(animationDuration)
      .delay((d, i) => i * 15)
      .attr('y', d => yScale(d.count))
      .attr('height', d => Math.max(0, height - yScale(d.count)));

    // Tooltip interactions
    bars
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', 'var(--md-sys-color-primary-container)');
        
        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mousemove', function(event, d) {
        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', 'var(--md-sys-color-primary)');
        
        tooltip.hide();
      });

    // Add stats annotation
    const statsText = g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(`Total: ${papersPerYearStats.total.toLocaleString()} papers`);

    statsText.transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);
  }
};
