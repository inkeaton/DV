// plots/summary.js

import { renderTrendLine } from './trend.js';

export function renderSummary(ctx) {
    const { annotationGroup, innerWidth, getColors } = ctx;
    const colors = getColors();

    // Summary = trend view + headline.
    renderTrendLine(ctx);

    annotationGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .style('fill', colors.primary)
        .style('font-size', '18px')
        .style('font-weight', '500')
        .text('Global coffee consumption continues to grow');
}
