/**
 * dataset/plots/yearHistogram.js
 * ============================================================================
 * VISUALIZATION: Papers by Year Histogram
 * 
 * This module renders a bar chart showing the number of papers published
 * each year from 1990 to 2024. Uses D3.js for rendering and reads theme
 * colors from CSS variables.
 * ============================================================================
 */

import { yearData } from './yearData.js';

/**
 * Get theme-aware colors from CSS custom properties
 * @returns {Object} Object containing color values
 */
function getColors() {
  const styles = getComputedStyle(document.body);
  return {
    primary: styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A',
    onSurface: styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#171C1E',
    onSurfaceVariant: styles.getPropertyValue('--md-sys-color-on-surface-variant').trim() || '#3F484B',
    surfaceContainer: styles.getPropertyValue('--md-sys-color-surface-container').trim() || '#E9EFF1',
    outline: styles.getPropertyValue('--md-sys-color-outline').trim() || '#70797C'
  };
}

/**
 * Renders the year histogram visualization
 * @param {string} containerId - The ID of the container element
 * @param {Object} d3 - D3.js library reference
 */
export function renderYearHistogram(containerId, d3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Clear any existing content
  container.innerHTML = '';

  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight || 300;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get theme colors
  const colors = getColors();

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Bar chart showing number of papers published per year from 1990 to 2024');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create scales
  const xScale = d3.scaleBand()
    .domain(yearData.map(d => d.year))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(yearData, d => d.count)])
    .nice()
    .range([innerHeight, 0]);

  // Create and append X axis
  const xAxis = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter((d, i) => i % 5 === 0)) // Show every 5th year
    );

  xAxis.selectAll('text')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '12px');

  xAxis.selectAll('line, path')
    .style('stroke', colors.outline);

  // Create and append Y axis
  const yAxis = g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  yAxis.selectAll('text')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '12px');

  yAxis.selectAll('line, path')
    .style('stroke', colors.outline);

  // Y axis label
  g.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -45)
    .attr('x', -innerHeight / 2)
    .attr('text-anchor', 'middle')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '14px')
    .text('Number of Papers');

  // X axis label
  g.append('text')
    .attr('class', 'x-axis-label')
    .attr('y', innerHeight + 40)
    .attr('x', innerWidth / 2)
    .attr('text-anchor', 'middle')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '14px')
    .text('Year');

  // Create bars
  g.selectAll('.bar')
    .data(yearData)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.year))
    .attr('y', d => yScale(d.count))
    .attr('width', xScale.bandwidth())
    .attr('height', d => innerHeight - yScale(d.count))
    .attr('fill', colors.primary)
    .attr('rx', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('opacity', 0.8);
      showTooltip(event, d, colors);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('opacity', 1);
      hideTooltip();
    });

  // Tooltip functions
  function showTooltip(event, d, colors) {
    const tooltip = d3.select('body').selectAll('.histogram-tooltip').data([0]);
    const tooltipEnter = tooltip.enter()
      .append('div')
      .attr('class', 'histogram-tooltip')
      .style('position', 'absolute')
      .style('background', colors.surfaceContainer)
      .style('color', colors.onSurface)
      .style('padding', '8px 12px')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('z-index', '1000');

    tooltipEnter.merge(tooltip)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`)
      .html(`<strong>${d.year}</strong>: ${d.count} papers`);
  }

  function hideTooltip() {
    d3.select('.histogram-tooltip').remove();
  }
}

/**
 * Updates the visualization (e.g., on theme change)
 * @param {string} containerId - The ID of the container element
 * @param {Object} d3 - D3.js library reference
 */
export function updateYearHistogram(containerId, d3) {
  renderYearHistogram(containerId, d3);
}
