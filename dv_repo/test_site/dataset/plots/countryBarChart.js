/**
 * dataset/plots/countryBarChart.js
 * ============================================================================
 * VISUALIZATION: Papers by Country Horizontal Bar Chart
 * 
 * This module renders a horizontal bar chart showing the top countries
 * by number of papers. Uses D3.js for rendering and reads theme colors 
 * from CSS variables.
 * ============================================================================
 */

import { countryData } from './countryData.js';

/**
 * Get theme-aware colors from CSS custom properties
 * @returns {Object} Object containing color values
 */
function getColors() {
  const styles = getComputedStyle(document.body);
  return {
    primary: styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A',
    secondary: styles.getPropertyValue('--md-sys-color-secondary').trim() || '#4B6269',
    onSurface: styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#171C1E',
    onSurfaceVariant: styles.getPropertyValue('--md-sys-color-on-surface-variant').trim() || '#3F484B',
    surfaceContainer: styles.getPropertyValue('--md-sys-color-surface-container').trim() || '#E9EFF1',
    outline: styles.getPropertyValue('--md-sys-color-outline').trim() || '#70797C',
    primaryContainer: styles.getPropertyValue('--md-sys-color-primary-container').trim() || '#ADECFF'
  };
}

/**
 * Renders the country bar chart visualization
 * @param {string} containerId - The ID of the container element
 * @param {Object} d3 - D3.js library reference
 */
export function renderCountryBarChart(containerId, d3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Clear any existing content
  container.innerHTML = '';

  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight || 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 120 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get theme colors
  const colors = getColors();

  // Sort data and take top 10
  const sortedData = [...countryData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Horizontal bar chart showing top countries by number of papers');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create scales
  const yScale = d3.scaleBand()
    .domain(sortedData.map(d => d.country))
    .range([0, innerHeight])
    .padding(0.2);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.count)])
    .nice()
    .range([0, innerWidth]);

  // Create gradient
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'bar-gradient')
    .attr('x1', '0%')
    .attr('x2', '100%');

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', colors.primary);

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', colors.primaryContainer);

  // Create and append Y axis
  const yAxis = g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  yAxis.selectAll('text')
    .style('fill', colors.onSurface)
    .style('font-size', '13px');

  yAxis.selectAll('line, path')
    .style('stroke', 'transparent');

  // Create and append X axis
  const xAxis = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(5));

  xAxis.selectAll('text')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '12px');

  xAxis.selectAll('line, path')
    .style('stroke', colors.outline);

  // X axis label
  g.append('text')
    .attr('class', 'x-axis-label')
    .attr('y', innerHeight + 35)
    .attr('x', innerWidth / 2)
    .attr('text-anchor', 'middle')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '14px')
    .text('Number of Papers');

  // Create bars
  g.selectAll('.bar')
    .data(sortedData)
    .join('rect')
    .attr('class', 'bar')
    .attr('y', d => yScale(d.country))
    .attr('x', 0)
    .attr('height', yScale.bandwidth())
    .attr('width', d => xScale(d.count))
    .attr('fill', 'url(#bar-gradient)')
    .attr('rx', 4)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('opacity', 0.8);
      showTooltip(event, d, colors);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('opacity', 1);
      hideTooltip();
    });

  // Add value labels at end of bars
  g.selectAll('.bar-label')
    .data(sortedData)
    .join('text')
    .attr('class', 'bar-label')
    .attr('y', d => yScale(d.country) + yScale.bandwidth() / 2)
    .attr('x', d => xScale(d.count) + 8)
    .attr('dy', '0.35em')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '12px')
    .text(d => d.count.toLocaleString());

  // Tooltip functions
  function showTooltip(event, d, colors) {
    const total = d3.sum(countryData, t => t.count);
    const percentage = ((d.count / total) * 100).toFixed(1);

    const tooltip = d3.select('body').selectAll('.country-tooltip').data([0]);
    const tooltipEnter = tooltip.enter()
      .append('div')
      .attr('class', 'country-tooltip')
      .style('position', 'absolute')
      .style('background', colors.surfaceContainer)
      .style('color', colors.onSurface)
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('z-index', '1000');

    tooltipEnter.merge(tooltip)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`)
      .html(`
        <strong>${d.country}</strong> (${d.code})<br>
        ${d.count.toLocaleString()} papers (${percentage}% of total)
      `);
  }

  function hideTooltip() {
    d3.select('.country-tooltip').remove();
  }
}

/**
 * Updates the visualization (e.g., on theme change)
 * @param {string} containerId - The ID of the container element
 * @param {Object} d3 - D3.js library reference
 */
export function updateCountryBarChart(containerId, d3) {
  renderCountryBarChart(containerId, d3);
}
