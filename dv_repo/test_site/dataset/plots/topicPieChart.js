/**
 * dataset/plots/topicPieChart.js
 * ============================================================================
 * VISUALIZATION: Papers by Topic Pie Chart
 * 
 * This module renders a donut/pie chart showing the distribution of papers
 * across different topic categories. Uses D3.js for rendering and reads 
 * theme colors from CSS variables.
 * ============================================================================
 */

import { topicData } from './topicData.js';

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
    surface: styles.getPropertyValue('--md-sys-color-surface').trim() || '#F5FAFC'
  };
}

/**
 * Renders the topic pie chart visualization
 * @param {string} containerId - The ID of the container element
 * @param {Object} d3 - D3.js library reference
 */
export function renderTopicPieChart(containerId, d3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Clear any existing content
  container.innerHTML = '';

  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight || 350;
  const radius = Math.min(width, height) / 2 - 40;

  // Get theme colors
  const colors = getColors();

  // Create color scale
  const colorScale = d3.scaleOrdinal()
    .domain(topicData.map(d => d.category))
    .range(topicData.map(d => d.color));

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Pie chart showing distribution of papers across topic categories');

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  // Create pie layout
  const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

  // Create arc generator for slices
  const arc = d3.arc()
    .innerRadius(radius * 0.5) // Donut chart
    .outerRadius(radius);

  // Create arc generator for labels
  const labelArc = d3.arc()
    .innerRadius(radius * 0.75)
    .outerRadius(radius * 0.75);

  // Create arcs
  const arcs = g.selectAll('.arc')
    .data(pie(topicData))
    .join('g')
    .attr('class', 'arc');

  // Draw slices
  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => colorScale(d.data.category))
    .attr('stroke', colors.surface)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('transform', () => {
          const [x, y] = arc.centroid(d);
          const offset = 10;
          const angle = Math.atan2(y, x);
          return `translate(${Math.cos(angle) * offset},${Math.sin(angle) * offset})`;
        });
      showTooltip(event, d, colors);
    })
    .on('mouseleave', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('transform', 'translate(0,0)');
      hideTooltip();
    });

  // Center text
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.5em')
    .style('fill', colors.onSurface)
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .text(d3.sum(topicData, d => d.count).toLocaleString());

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '14px')
    .text('Total Papers');

  // Tooltip functions
  function showTooltip(event, d, colors) {
    const total = d3.sum(topicData, t => t.count);
    const percentage = ((d.data.count / total) * 100).toFixed(1);

    const tooltip = d3.select('body').selectAll('.pie-tooltip').data([0]);
    const tooltipEnter = tooltip.enter()
      .append('div')
      .attr('class', 'pie-tooltip')
      .style('position', 'absolute')
      .style('background', colors.surfaceContainer)
      .style('color', colors.onSurface)
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('z-index', '1000')
      .style('max-width', '200px');

    tooltipEnter.merge(tooltip)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`)
      .html(`
        <strong>${d.data.category}</strong><br>
        ${d.data.count.toLocaleString()} papers (${percentage}%)
      `);
  }

  function hideTooltip() {
    d3.select('.pie-tooltip').remove();
  }
}

/**
 * Updates the visualization (e.g., on theme change)
 * @param {string} containerId - The ID of the container element
 * @param {Object} d3 - D3.js library reference
 */
export function updateTopicPieChart(containerId, d3) {
  renderTopicPieChart(containerId, d3);
}
