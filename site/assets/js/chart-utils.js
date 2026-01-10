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

// /**
//  * Render an X axis with optional label
//  * @param {Object} ctx - Render context { g, d3, height, colors }
//  * @param {Function} scale - D3 scale for the axis
//  * @param {Object} options - Optional settings { label, tickFormat, tickCount, rotate }
//  */
// export function renderXAxis(ctx, scale, options = {}) {
//   const { g, d3, height, colors } = ctx;
//   const { 
//     label = null, 
//     tickFormat = null, 
//     tickCount = null,
//     rotate = 0,
//     className = 'x-axis'
//   } = options;

//   let axis = d3.axisBottom(scale);
//   if (tickFormat) axis = axis.tickFormat(tickFormat);
//   if (tickCount) axis = axis.ticks(tickCount);

//   const axisG = g.append('g')
//     .attr('class', className)
//     .attr('transform', `translate(0, ${height})`)
//     .style('opacity', 0)
//     .call(axis);

//   axisG.transition()
//     .duration(500)
//     .style('opacity', 1);

//   if (rotate !== 0) {
//     axisG.selectAll('text')
//       .attr('transform', `rotate(${rotate})`)
//       .attr('text-anchor', rotate < 0 ? 'end' : 'start');
//   }

//   if (label) {
//     g.append('text')
//       .attr('class', 'axis-label x-axis-label')
//       .attr('x', ctx.width / 2)
//       .attr('y', height + 45)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '12px')
//       .style('fill', colors.onSurfaceVariant)
//       .text(label);
//   }

//   return axisG;
// }

// /**
//  * Render a Y axis with optional label
//  * @param {Object} ctx - Render context { g, d3, height, colors }
//  * @param {Function} scale - D3 scale for the axis
//  * @param {Object} options - Optional settings { label, tickFormat, tickCount, position }
//  */
// export function renderYAxis(ctx, scale, options = {}) {
//   const { g, d3, height, colors } = ctx;
//   const { 
//     label = null, 
//     tickFormat = null, 
//     tickCount = null,
//     position = 'left',
//     className = 'y-axis'
//   } = options;

//   let axis = position === 'left' ? d3.axisLeft(scale) : d3.axisRight(scale);
//   if (tickFormat) axis = axis.tickFormat(tickFormat);
//   if (tickCount) axis = axis.ticks(tickCount);

//   const translateX = position === 'left' ? 0 : ctx.width;
  
//   const axisG = g.append('g')
//     .attr('class', className)
//     .attr('transform', `translate(${translateX}, 0)`)
//     .style('opacity', 0)
//     .call(axis);

//   axisG.transition()
//     .duration(500)
//     .style('opacity', 1);

//   if (label) {
//     const labelX = position === 'left' ? -40 : ctx.width + 40;
//     g.append('text')
//       .attr('class', 'axis-label y-axis-label')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -height / 2)
//       .attr('y', labelX)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '12px')
//       .style('fill', colors.onSurfaceVariant)
//       .text(label);
//   }

//   return axisG;
// }

/**
 * Render an X axis with optional label
 * NOW supports: tickValues
 */
export function renderXAxis(ctx, scale, options = {}) {
  const { g, d3, height, colors } = ctx;
  const {
    label = null,
    tickFormat = null,
    tickCount = null,
    tickValues = null,      // <-- NEW
    rotate = 0,
    className = 'x-axis'
  } = options;

  let axis = d3.axisBottom(scale);

  if (tickValues) axis = axis.tickValues(tickValues); // <-- NEW
  if (tickFormat) axis = axis.tickFormat(tickFormat);
  if (tickCount && !tickValues) axis = axis.ticks(tickCount);

  const axisG = g.append('g')
    .attr('class', className)
    .attr('transform', `translate(0, ${height})`)
    .style('opacity', 0)
    .call(axis);

  axisG.transition().duration(500).style('opacity', 1);

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
 * NOW supports: tickValues
 */
export function renderYAxis(ctx, scale, options = {}) {
  const { g, d3, height, colors } = ctx;
  const {
    label = null,
    tickFormat = null,
    tickCount = null,
    tickValues = null,      // <-- NEW
    position = 'left',
    className = 'y-axis'
  } = options;

  let axis = position === 'left' ? d3.axisLeft(scale) : d3.axisRight(scale);

  if (tickValues) axis = axis.tickValues(tickValues); // <-- NEW
  if (tickFormat) axis = axis.tickFormat(tickFormat);
  if (tickCount && !tickValues) axis = axis.ticks(tickCount);

  const translateX = position === 'left' ? 0 : ctx.width;

  const axisG = g.append('g')
    .attr('class', className)
    .attr('transform', `translate(${translateX}, 0)`)
    .style('opacity', 0)
    .call(axis);

  axisG.transition().duration(500).style('opacity', 1);

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

// ============================================================================
// NEW UTILITIES - Extracted from plot files for reuse
// ============================================================================

/**
 * Fill gaps in year-based data with empty/zero values
 * @param {Object} d3 - D3.js library reference
 * @param {Array} data - Array of data objects with a 'year' property
 * @param {number} yearMin - Start year (inclusive)
 * @param {number} yearMax - End year (inclusive)
 * @param {Array} keys - Array of keys to initialize to 0 for missing years
 * @returns {Array} Complete data array with all years filled
 */
export function fillYearGaps(d3, data, yearMin, yearMax, keys = []) {
  const years = d3.range(yearMin, yearMax + 1);
  const byYear = new Map(data.map(d => [d.year, d]));
  
  return years.map(y => {
    const row = byYear.get(y);
    if (row) return row;
    
    const empty = { year: y };
    keys.forEach(k => { empty[k] = 0; });
    return empty;
  });
}

/**
 * Generate tick years for axis (every N years + include max year)
 * @param {Array} years - Array of all years
 * @param {number} interval - Interval between ticks (e.g., 5 for every 5 years)
 * @param {number} maxYear - The maximum year to always include
 * @returns {Array} Array of years to show as ticks
 */
export function getTickYears(years, interval = 5, maxYear = null) {
  const max = maxYear ?? years[years.length - 1];
  return years.filter(y => (y % interval === 0) || y === max);
}

/**
 * Create an arrowhead marker definition for annotations
 * @param {Object} svg - D3 SVG selection
 * @param {string} id - Unique ID for the marker (default: 'arrowhead')
 * @param {Object} options - Optional settings { fill, size }
 * @returns {Object} The defs selection
 */
export function createArrowMarker(svg, id = 'arrowhead', options = {}) {
  const { fill = 'rgba(0,0,0,0.6)', size = 8 } = options;
  
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  
  if (defs.select(`#${id}`).empty()) {
    defs.append('marker')
      .attr('id', id)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', size)
      .attr('markerHeight', size)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', fill);
  }
  
  return defs;
}

/**
 * Darken a hex color by a factor
 * @param {Object} d3 - D3.js library reference
 * @param {string} hex - Hex color string
 * @param {number} factor - Darkening factor (0-1, default 0.28)
 * @returns {string} Darkened hex color
 */
export function darkenHex(d3, hex, factor = 0.28) {
  const c = d3.color(hex);
  if (!c) return hex;
  const r = Math.round(c.r * (1 - factor));
  const g = Math.round(c.g * (1 - factor));
  const b = Math.round(c.b * (1 - factor));
  return d3.rgb(r, g, b).formatHex();
}

/**
 * Remove axis domain lines and tick lines (keep tick labels)
 * Call this after styleAxes() to clean up axis appearance
 * @param {Object} g - D3 selection of the chart group
 */
export function cleanAxes(g) {
  g.selectAll('.x-axis .domain, .y-axis .domain').style('stroke', 'none');
  g.selectAll('.x-axis .tick line, .y-axis .tick line').style('stroke', 'none');
}

/**
 * Wrap text in SVG <text> element using <tspan> elements
 * Useful for treemaps and other charts with constrained label space
 * @param {Object} options - Configuration object
 * @param {Object} options.d3 - D3.js library reference
 * @param {Object} options.textSel - D3 selection of the text element
 * @param {number} options.maxWidth - Maximum width before wrapping
 * @param {number} options.maxLines - Maximum number of lines (default: 3)
 * @param {number} options.lineHeightEm - Line height in em units (default: 1.1)
 */
export function wrapText({ d3, textSel, maxWidth, maxLines = 3, lineHeightEm = 1.1 }) {
  const text = textSel;
  const raw = (text.text() || '').trim();
  if (!raw) return;

  const words = raw.split(/\s+/);
  text.text(null);

  let line = [];
  let lineNumber = 0;
  let tspan = text.append('tspan').attr('x', text.attr('x')).attr('dy', '0em');

  for (let i = 0; i < words.length; i++) {
    line.push(words[i]);
    tspan.text(line.join(' '));

    if (tspan.node().getComputedTextLength() > maxWidth) {
      line.pop();

      // commit previous line
      tspan.text(line.join(' '));

      lineNumber += 1;
      if (lineNumber >= maxLines) {
        // ellipsis on last allowed line
        let clipped = tspan.text();
        while (tspan.node().getComputedTextLength() > maxWidth && clipped.length > 0) {
          clipped = clipped.slice(0, -1);
          tspan.text(clipped + '…');
        }
        return;
      }

      // start new line with current word
      line = [words[i]];
      tspan = text
        .append('tspan')
        .attr('x', text.attr('x'))
        .attr('dy', `${lineHeightEm}em`)
        .text(words[i]);
    }
  }

  // final safety clip
  let final = tspan.text();
  while (tspan.node().getComputedTextLength() > maxWidth && final.length > 0) {
    final = final.slice(0, -1);
    tspan.text(final + '…');
  }
}
