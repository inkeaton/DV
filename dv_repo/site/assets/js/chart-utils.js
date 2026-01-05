/**
 * assets/js/chart-utils.js
 * ============================================================================
 * CHART UTILITIES MODULE
 * 
 * Provides low-level reusable helper functions for building D3 visualizations.
 * All plot render functions can import these utilities to maintain consistency
 * and reduce code duplication.
 * ============================================================================
 */

/**
 * Render a chart title centered at the top
 * @param {Object} ctx - Render context { g, width, colors }
 * @param {string} text - Title text
 * @param {Object} options - Optional settings { y, fontSize, fontWeight }
 */
export function renderTitle(ctx, text, options = {}) {
  const { g, width, colors } = ctx;
  const { y = -25, fontSize = '18px', fontWeight = '600' } = options;

  g.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', y)
    .attr('text-anchor', 'middle')
    .style('font-size', fontSize)
    .style('font-weight', fontWeight)
    .style('fill', colors.onSurface)
    .style('opacity', 0)
    .text(text)
    .transition()
    .duration(500)
    .style('opacity', 1);
}

/**
 * Render an X axis with optional label
 * @param {Object} ctx - Render context { g, d3, height, colors }
 * @param {Function} scale - D3 scale for the axis
 * @param {Object} options - Optional settings { label, tickFormat, tickCount, rotate }
 */
export function renderXAxis(ctx, scale, options = {}) {
  const { g, d3, height, colors } = ctx;
  const { 
    label = null, 
    tickFormat = null, 
    tickCount = null,
    rotate = 0,
    className = 'x-axis'
  } = options;

  let axis = d3.axisBottom(scale);
  if (tickFormat) axis = axis.tickFormat(tickFormat);
  if (tickCount) axis = axis.ticks(tickCount);

  const axisG = g.append('g')
    .attr('class', className)
    .attr('transform', `translate(0, ${height})`)
    .style('opacity', 0)
    .call(axis);

  axisG.transition()
    .duration(500)
    .style('opacity', 1);

  if (rotate !== 0) {
    axisG.selectAll('text')
      .attr('transform', `rotate(${rotate})`)
      .attr('text-anchor', rotate < 0 ? 'end' : 'start');
  }

  if (label) {
    g.append('text')
      .attr('class', 'axis-label x-axis-label')
      .attr('x', ctx.width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.onSurfaceVariant)
      .text(label);
  }

  return axisG;
}

/**
 * Render a Y axis with optional label
 * @param {Object} ctx - Render context { g, d3, height, colors }
 * @param {Function} scale - D3 scale for the axis
 * @param {Object} options - Optional settings { label, tickFormat, tickCount, position }
 */
export function renderYAxis(ctx, scale, options = {}) {
  const { g, d3, height, colors } = ctx;
  const { 
    label = null, 
    tickFormat = null, 
    tickCount = null,
    position = 'left',
    className = 'y-axis'
  } = options;

  let axis = position === 'left' ? d3.axisLeft(scale) : d3.axisRight(scale);
  if (tickFormat) axis = axis.tickFormat(tickFormat);
  if (tickCount) axis = axis.ticks(tickCount);

  const translateX = position === 'left' ? 0 : ctx.width;
  
  const axisG = g.append('g')
    .attr('class', className)
    .attr('transform', `translate(${translateX}, 0)`)
    .style('opacity', 0)
    .call(axis);

  axisG.transition()
    .duration(500)
    .style('opacity', 1);

  if (label) {
    const labelX = position === 'left' ? -40 : ctx.width + 40;
    g.append('text')
      .attr('class', 'axis-label y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', labelX)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.onSurfaceVariant)
      .text(label);
  }

  return axisG;
}

/**
 * Render a legend with colored items
 * @param {Object} ctx - Render context { g, colors }
 * @param {Array} items - Array of { label, color } objects
 * @param {Object} options - Optional settings { x, y, direction, itemSpacing }
 */
export function renderLegend(ctx, items, options = {}) {
  const { g, colors } = ctx;
  const { 
    x = 0, 
    y = 0, 
    direction = 'vertical', 
    itemSpacing = 22,
    rectSize = 14,
    fontSize = '12px'
  } = options;

  const legend = g.append('g')
    .attr('class', 'chart-legend')
    .attr('transform', `translate(${x}, ${y})`);

  items.forEach((item, i) => {
    const offset = direction === 'vertical' ? { x: 0, y: i * itemSpacing } : { x: i * 100, y: 0 };
    
    const lg = legend.append('g')
      .attr('transform', `translate(${offset.x}, ${offset.y})`);
    
    lg.append('rect')
      .attr('width', rectSize)
      .attr('height', rectSize)
      .attr('rx', 2)
      .attr('fill', item.color);
    
    lg.append('text')
      .attr('x', rectSize + 6)
      .attr('y', rectSize - 3)
      .style('font-size', fontSize)
      .style('fill', colors.onSurfaceVariant)
      .text(item.label);
  });

  return legend;
}

/**
 * Apply consistent styling to axes (domain, tick lines, tick text)
 * @param {Object} g - D3 selection of the chart group
 */
export function styleAxes(g) {
  g.selectAll('.domain')
    .style('stroke', 'var(--md-sys-color-outline)');
  
  g.selectAll('.tick line')
    .style('stroke', 'var(--md-sys-color-outline-variant)');
  
  g.selectAll('.tick text')
    .style('fill', 'var(--md-sys-color-on-surface-variant)')
    .style('font-size', '11px');
}

/**
 * Create a gradient definition for area charts
 * @param {Object} ctx - Render context { svg, d3 }
 * @param {string} id - Unique ID for the gradient
 * @param {string} color - Base color for the gradient
 * @param {Object} options - Optional settings { startOpacity, endOpacity }
 * @returns {string} URL reference to use as fill
 */
export function createVerticalGradient(ctx, id, color, options = {}) {
  const { svg, d3 } = ctx;
  const { startOpacity = 0.3, endOpacity = 0.05 } = options;

  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient')
    .attr('id', id)
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
  
  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', startOpacity);
  
  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color)
    .attr('stop-opacity', endOpacity);

  return `url(#${id})`;
}
