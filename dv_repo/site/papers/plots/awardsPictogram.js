/**
 * papers/plots/awardsPictogram.js
 * Pictogram bar chart showing awards by type (using rectangles)
 */

import { awardsData, awardStats, pictogramCellValue } from '../../data/papers/awardsData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';
import { awardColors } from '../../assets/js/color-palettes.js';

export const awardsPictogramConfig = {
  data: awardsData,
  margins: { top: 60, right: 30, bottom: 40, left: 150 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Awards by Type');

    // Configuration
    const cellSize = 25; // 14
    const cellPadding = 4;
    const rowHeight = height / data.length;
    const maxCells = Math.ceil(d3.max(data, d => d.count) / pictogramCellValue);

    // Create row groups
    const rows = g.selectAll('.award-row')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'award-row')
      .attr('transform', (d, i) => `translate(0, ${i * rowHeight + rowHeight / 2 - cellSize / 2})`);

    // Add row labels (award types)
    rows.append('text')
      .attr('class', 'row-label')
      .attr('x', -10)
      .attr('y', cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--md-sys-color-on-surface)')
      .attr('font-size', '13px')
      .attr('font-weight', '500')
      .text(d => d.type);

    // Add count labels
    rows.append('text')
      .attr('class', 'count-label')
      .attr('x', width + 10)
      .attr('y', cellSize / 2)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(d => d.count);

    // Add pictogram cells (rectangles)
    rows.each(function(d, rowIndex) {
      const row = d3.select(this);
      const numCells = Math.ceil(d.count / pictogramCellValue);
      const remainder = d.count % pictogramCellValue;
      const color = awardColors[d.type] || 'var(--md-sys-color-primary)';

      for (let i = 0; i < numCells; i++) {
        const isPartial = i === numCells - 1 && remainder > 0;
        const fillOpacity = isPartial ? (remainder / pictogramCellValue) : 1;

        row.append('rect')
          .attr('class', 'pictogram-cell')
          .attr('x', i * (cellSize + cellPadding))
          .attr('y', 0)
          .attr('width', cellSize)
          .attr('height', 0)
          .attr('fill', color)
          .attr('opacity', 0)
          .attr('rx', 2)
          .transition()
          .duration(animationDuration)
          .delay(rowIndex * 100 + i * 15)
          .attr('height', cellSize)
          .attr('opacity', fillOpacity * 0.9);
      }
    });

    // Animate count labels
    rows.selectAll('.count-label')
      .transition()
      .delay((d, i) => animationDuration + 200)
      .duration(400)
      .attr('opacity', 1);

    // Tooltip interactions on cells
    g.selectAll('.pictogram-cell')
      .on('mouseenter', function(event) {
        const parentData = d3.select(this.parentNode).datum();
        const content = `<strong>${parentData.type}</strong><br>${parentData.count} awards<br><small>Each cell ≈ ${pictogramCellValue} awards</small>`;
        tooltip.show(event, content, colors);
      })
      .on('mousemove', function(event) {
        const parentData = d3.select(this.parentNode).datum();
        const content = `<strong>${parentData.type}</strong><br>${parentData.count} awards<br><small>Each cell ≈ ${pictogramCellValue} awards</small>`;
        tooltip.show(event, content, colors);
      })
      .on('mouseleave', function() {
        tooltip.hide();
      });

    // Add legend for cell value
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, ${height + 15})`)
      .attr('opacity', 0);

    legend.append('rect')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', 'var(--md-sys-color-primary)')
      .attr('rx', 2);

    legend.append('text')
      .attr('x', cellSize + 8)
      .attr('y', cellSize / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '11px')
      .text(`= ${pictogramCellValue} awards`);

    legend.transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);
  }
};
