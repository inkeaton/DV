/**
 * papers/plots/topicsTreemap.js
 * Treemap showing most discussed topics
 *
 * Changes:
 * - Macro categories: tooltip shows TOTAL + PERCENTAGE next to name.
 * - Leaf topics: tooltip shows Count + Percentage vs Total.
 * - Leaf labels: text wrap to 2–3 lines.
 */

import { renderTitle, wrapText } from '../../assets/js/chart-utils.js';
import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';
import { topicsTreemapData, topicColors } from '../../data/papers/topicsTreemapData.js';


/** -----------------------------
 * Chart config
 * ----------------------------- */
export const topicsTreemapConfig = {
  data: topicsTreemapData,
  margins: { top: 60, right: 10, bottom: 10, left: 10 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;

    const chartOffsetY = 20;

    // Title
    renderTitle(ctx, 'Most Discussed Topics');

    // Hierarchy
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    // --- CALCOLO TOTALI PER PERCENTUALE ---
    const totalAllPapers = root.value || 1;
    const fmtPct = d3.format('.1f');
    // --------------------------------------

    // Treemap Layout
    const treemap = d3
      .treemap()
      .size([width, height - chartOffsetY])
      .paddingOuter(4)
      .paddingTop(22)
      .paddingInner(2)
      .round(true);

    treemap(root);

    const groups = root.children || [];
    const leaves = root.leaves();

    // Precompute totals for macro categories (parents)
    groups.forEach((grp) => {
      grp.total = d3.sum(grp.children || [], (c) => c.value || 0);
    });

    /** -----------------------------
     * Macro group rectangles
     * ----------------------------- */
    const groupRects = g
      .selectAll('.group-rect')
      .data(groups)
      .enter()
      .append('rect')
      .attr('class', 'group-rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0 + chartOffsetY)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('fill', 'var(--md-sys-color-surface-container)')
      .attr('stroke', 'var(--md-sys-color-outline-variant)')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('opacity', 0)
      .style('cursor', 'default')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', 'var(--md-sys-color-on-surface)')
          .attr('stroke-width', 2);

        // --- Calcolo Percentuale Gruppo ---
        const pct = fmtPct((d.total / totalAllPapers) * 100);

        const content =
          `<strong>${d.data.name}</strong><br><span style="opacity:.85">${d.total} papers  (${pct}%)</span>` +
          `<br>${(d.children || []).length} topics`;

        tooltip.show(event, content, colors);
      })
      .on('mousemove', function (event, d) {
        const pct = fmtPct((d.total / totalAllPapers) * 100);

        const content =
          `<strong>${d.data.name}</strong><br> <span style="opacity:.85"> ${d.total} papers  (${pct}%)</span>` +
          `<br>${(d.children || []).length} topics`;

        tooltip.show(event, content, colors);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', 'var(--md-sys-color-outline-variant)')
          .attr('stroke-width', 1);

        tooltip.hide();
      });

    groupRects
      .transition()
      .duration(ANIMATION_DURATION / 2)
      .attr('opacity', 1);

    /** -----------------------------
     * Group labels
     * ----------------------------- */
    const groupLabels = g
      .selectAll('.group-label')
      .data(groups)
      .enter()
      .append('text')
      .attr('class', 'group-label')
      .attr('x', (d) => d.x0 + 6)
      .attr('y', (d) => d.y0 + chartOffsetY + 16)
      .attr('fill', 'var(--md-sys-color-on-surface)')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text((d) => d.data.name)
      .attr('opacity', 0)
      .style('cursor', 'default')
      .each(function (d) {
        // Clip text if too long (single line)
        const textWidth = d.x1 - d.x0 - 12;
        const text = d3.select(this);
        let textContent = d.data.name;
        while (text.node().getComputedTextLength() > textWidth && textContent.length > 0) {
          textContent = textContent.slice(0, -1);
          text.text(textContent + '…');
        }
      })
      .on('mouseenter', function (event, d) {
        // --- Calcolo Percentuale Gruppo (anche su label) ---
        const pct = fmtPct((d.total / totalAllPapers) * 100);

        const content =
          `<strong>${d.data.name}</strong><br> <span style="opacity:.85">${d.total} papers (${pct}%)</span>` +
          `<br>${(d.children || []).length} topics`;

        tooltip.show(event, content, colors);
      })
      .on('mousemove', function (event, d) {
        const pct = fmtPct((d.total / totalAllPapers) * 100);

        const content =
          `<strong>${d.data.name}</strong><br> <span style="opacity:.85">${d.total} papers (${pct}%)</span>` +
          `<br>${(d.children || []).length} topics`;

      })
      .on('mouseleave', function () {
        tooltip.hide();
      });

    groupLabels
      .transition()
      .delay(ANIMATION_DURATION / 2)
      .duration(ANIMATION_DURATION / 2)
      .attr('opacity', 1);

    /** -----------------------------
     * Leaf rectangles + hover (WITH Percentage)
     * ----------------------------- */
    const leafRects = g
      .selectAll('.leaf-rect')
      .data(leaves)
      .enter()
      .append('rect')
      .attr('class', 'leaf-rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0 + chartOffsetY)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', 0)
      .attr('fill', (d) => {
        const parentName = d.parent.data.name;
        return topicColors[parentName] || 'var(--md-sys-color-primary)';
      })
      .attr('opacity', 0.8)
      .attr('rx', 3);

    leafRects
      .transition()
      .duration(ANIMATION_DURATION)
      .delay((d, i) => 200 + i * 20)
      .attr('height', (d) => Math.max(0, d.y1 - d.y0));

    leafRects
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('stroke', 'var(--md-sys-color-on-surface)')
          .attr('stroke-width', 2);

        // Calcolo Percentuale Topic
        const pct = fmtPct((d.data.value / totalAllPapers) * 100);

        const content =
          `<strong>${d.data.name}</strong><br>` +
          `${d.data.value} papers <span style="opacity:.85">(${pct}%)</span>`;

        tooltip.show(event, content, colors);
      })
      .on('mousemove', function (event, d) {
        const pct = fmtPct((d.data.value / totalAllPapers) * 100);

        const content =
          `<strong>${d.data.name}</strong><br>` +
          `${d.data.value} papers <span style="opacity:.85">(${pct}%)</span>`;

        tooltip.show(event, content, colors);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8)
          .attr('stroke', 'none');

        tooltip.hide();
      });

    /** -----------------------------
     * Leaf labels (wrapped)
     * ----------------------------- */
    const minW = 60;
    const minH = 34;

    const leafLabels = g
      .selectAll('.leaf-label')
      .data(leaves.filter((d) => (d.x1 - d.x0) > minW && (d.y1 - d.y0) > minH))
      .enter()
      .append('text')
      .attr('class', 'leaf-label')
      .attr('x', (d) => d.x0 + (d.x1 - d.x0) / 2)
      .attr('y', (d) => d.y0 + chartOffsetY + (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', (d) => {
        const w = d.x1 - d.x0;
        return w > 140 ? '11px' : '9px';
      })
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text((d) => d.data.name)
      .attr('opacity', 0)
      .each(function (d) {
        const text = d3.select(this);
        const maxWidth = (d.x1 - d.x0) - 10;

        // Wrap to max 3 lines
        wrapText({ d3, textSel: text, maxWidth, maxLines: 3, lineHeightEm: 1.1 });

        // Adjustment for vertical centering
        const tspans = text.selectAll('tspan').nodes();
        if (tspans.length > 1) {
          const shiftEm = ((tspans.length - 1) * 1.1) / 2;
          d3.select(tspans[0]).attr('dy', `${-shiftEm}em`);
        }
      });

    leafLabels
      .transition()
      .delay(ANIMATION_DURATION + 200)
      .duration(400)
      .attr('opacity', 1);
  }
};