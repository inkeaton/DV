/**
 * dataset/plots/conferenceDonut.js
 * ============================================================================
 * VISUALIZATION: Papers by Conference Track Donut Chart
 * ============================================================================
 */

import { loadConferenceData, conferenceDescriptions } from './conferenceData.js';

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
 * Renders the conference donut chart visualization
 * @param {string} containerId
 * @param {Object} d3
 */
export async function renderConferenceDonut(containerId, d3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  container.innerHTML = '';

  // Load real data from CSV (Conference,Count) and enrich with colors
  const conferenceData = await loadConferenceData(d3);

  const width = container.clientWidth;
  const height = container.clientHeight || 300;
  const radius = Math.min(width * 0.5, height) / 2 - 20;

  const colors = getColors();

  const colorScale = d3.scaleOrdinal()
    .domain(conferenceData.map(d => d.conference))
    .range(conferenceData.map(d => d.color));

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Donut chart showing distribution of papers across conference tracks');

  const chartG = svg.append('g')
    .attr('transform', `translate(${width * 0.35},${height / 2})`);

  const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

  const arc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius);

  const arcs = chartG.selectAll('.arc')
    .data(pie(conferenceData))
    .join('g')
    .attr('class', 'arc');

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => colorScale(d.data.conference))
    .attr('stroke', colors.surface)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('transform', () => {
          const [x, y] = arc.centroid(d);
          const offset = 8;
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

  chartG.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('fill', colors.onSurface)
    .style('font-size', '14px')
    .style('font-weight', '500')
    .text('Conference');

  const legendG = svg.append('g')
    .attr('transform', `translate(${width * 0.6}, ${height / 2 - (conferenceData.length * 25) / 2})`);

  const legendItems = legendG.selectAll('.legend-item')
    .data(conferenceData)
    .join('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 30})`);

  legendItems.append('rect')
    .attr('width', 16)
    .attr('height', 16)
    .attr('rx', 4)
    .attr('fill', d => colorScale(d.conference));

  legendItems.append('text')
    .attr('x', 24)
    .attr('y', 8)
    .attr('dy', '0.35em')
    .style('fill', colors.onSurface)
    .style('font-size', '14px')
    .text(d => d.conference);

  legendItems.append('text')
    .attr('x', 24)
    .attr('y', 8)
    .attr('dx', '6em')
    .attr('dy', '0.35em')
    .style('fill', colors.onSurfaceVariant)
    .style('font-size', '12px')
    .text(d => `(${d.count.toLocaleString()})`);

  function showTooltip(event, d, colors) {
    const total = d3.sum(conferenceData, t => t.count);
    const percentage = total > 0 ? ((d.data.count / total) * 100).toFixed(1) : "0.0";
    const description = conferenceDescriptions[d.data.conference] || '';

    const tooltip = d3.select('body').selectAll('.conference-tooltip').data([0]);
    const tooltipEnter = tooltip.enter()
      .append('div')
      .attr('class', 'conference-tooltip')
      .style('position', 'absolute')
      .style('background', colors.surfaceContainer)
      .style('color', colors.onSurface)
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('z-index', '1000')
      .style('max-width', '280px');

    tooltipEnter.merge(tooltip)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`)
      .html(`
        <strong>${d.data.conference}</strong><br>
        ${d.data.count.toLocaleString()} papers (${percentage}%)<br>
        <small style="color: ${colors.onSurfaceVariant}">${description}</small>
      `);
  }

  function hideTooltip() {
    d3.select('.conference-tooltip').remove();
  }
}

export async function updateConferenceDonut(containerId, d3) {
  await renderConferenceDonut(containerId, d3);
}
