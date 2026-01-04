/**
 * papers/plots/topicsTreemap.js
 * Treemap showing most discussed topics
 */

import { topicsTreemapData, topicColors } from '../../data/papers/topicsTreemapData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';

export const topicsTreemapConfig = {
  data: topicsTreemapData,
  margins: { top: 60, right: 10, bottom: 10, left: 10 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Most Discussed Topics');

    // Offset for title
    const chartOffsetY = 20;

    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Create treemap layout
    const treemap = d3.treemap()
      .size([width, height - chartOffsetY])
      .paddingOuter(4)
      .paddingTop(22)
      .paddingInner(2)
      .round(true);

    treemap(root);

    // Get all nodes (both groups and leaves)
    const groups = root.children || [];
    const leaves = root.leaves();

    // Draw parent rectangles (category groups)
    const groupRects = g.selectAll('.group-rect')
      .data(groups)
      .enter()
      .append('rect')
      .attr('class', 'group-rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0 + chartOffsetY)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', 'var(--md-sys-color-surface-container)')
      .attr('stroke', 'var(--md-sys-color-outline-variant)')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('opacity', 0);

    groupRects.transition()
      .duration(animationDuration / 2)
      .attr('opacity', 1);

    // Draw group labels
    const groupLabels = g.selectAll('.group-label')
      .data(groups)
      .enter()
      .append('text')
      .attr('class', 'group-label')
      .attr('x', d => d.x0 + 6)
      .attr('y', d => d.y0 + chartOffsetY + 16)
      .attr('fill', 'var(--md-sys-color-on-surface)')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text(d => d.data.name)
      .attr('opacity', 0)
      .each(function(d) {
        // Clip text if too long
        const textWidth = d.x1 - d.x0 - 12;
        const text = d3.select(this);
        let textContent = d.data.name;
        while (text.node().getComputedTextLength() > textWidth && textContent.length > 0) {
          textContent = textContent.slice(0, -1);
          text.text(textContent + '…');
        }
      });

    groupLabels.transition()
      .delay(animationDuration / 2)
      .duration(animationDuration / 2)
      .attr('opacity', 1);

    // Draw leaf rectangles
    const leafRects = g.selectAll('.leaf-rect')
      .data(leaves)
      .enter()
      .append('rect')
      .attr('class', 'leaf-rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0 + chartOffsetY)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', 0)
      .attr('fill', d => {
        const parentName = d.parent.data.name;
        return topicColors[parentName] || 'var(--md-sys-color-primary)';
      })
      .attr('opacity', 0.8)
      .attr('rx', 3);

    leafRects.transition()
      .duration(animationDuration)
      .delay((d, i) => 200 + i * 20)
      .attr('height', d => Math.max(0, d.y1 - d.y0));

    // Tooltip interactions for leaves
    leafRects
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('stroke', 'var(--md-sys-color-on-surface)')
          .attr('stroke-width', 2);
        
        const content = `<strong>${d.data.name}</strong><br>Category: ${d.parent.data.name}<br>${d.data.value} papers`;
        tooltip.show(event, content, colors);
      })
      .on('mousemove', function(event, d) {
        const content = `<strong>${d.data.name}</strong><br>Category: ${d.parent.data.name}<br>${d.data.value} papers`;
        tooltip.show(event, content, colors);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8)
          .attr('stroke', 'none');
        
        tooltip.hide();
      });

    // Draw leaf labels (only if space permits)
    const leafLabels = g.selectAll('.leaf-label')
      .data(leaves.filter(d => (d.x1 - d.x0) > 50 && (d.y1 - d.y0) > 25))
      .enter()
      .append('text')
      .attr('class', 'leaf-label')
      .attr('x', d => d.x0 + (d.x1 - d.x0) / 2)
      .attr('y', d => d.y0 + chartOffsetY + (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', d => {
        const rectWidth = d.x1 - d.x0;
        return rectWidth > 100 ? '11px' : '9px';
      })
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text(d => d.data.name)
      .attr('opacity', 0)
      .each(function(d) {
        // Clip text if too long
        const maxWidth = d.x1 - d.x0 - 8;
        const text = d3.select(this);
        let textContent = d.data.name;
        while (text.node().getComputedTextLength() > maxWidth && textContent.length > 0) {
          textContent = textContent.slice(0, -1);
          text.text(textContent + '…');
        }
      });

    leafLabels.transition()
      .delay(animationDuration + 200)
      .duration(400)
      .attr('opacity', 1);
  }
};
