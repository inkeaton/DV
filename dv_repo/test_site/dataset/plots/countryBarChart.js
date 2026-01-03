/**
 * dataset/plots/countryBarChart.js
 * ============================================================================
 * VISUALIZATION: Papers by Country Horizontal Bar Chart
 * ============================================================================
 */

import { loadCountryData } from "./countryData.js";

function getColors() {
  const styles = getComputedStyle(document.body);
  return {
    primary: styles.getPropertyValue('--md-sys-color-primary').trim() || '#00687A',
    onSurface: styles.getPropertyValue('--md-sys-color-on-surface').trim() || '#171C1E',
    onSurfaceVariant: styles.getPropertyValue('--md-sys-color-on-surface-variant').trim() || '#3F484B',
    surfaceContainer: styles.getPropertyValue('--md-sys-color-surface-container').trim() || '#E9EFF1',
    outline: styles.getPropertyValue('--md-sys-color-outline').trim() || '#70797C',
    primaryContainer: styles.getPropertyValue('--md-sys-color-primary-container').trim() || '#ADECFF'
  };
}

export async function renderCountryBarChart(containerId, d3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  container.innerHTML = '';

  // Load real data from CSV
  const countryData = await loadCountryData(d3, "./countryData.csv");

  // Take top 10
  const topN = 10;
  const sortedData = countryData.slice(0, topN);

  const width = container.clientWidth;
  const height = container.clientHeight || 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 160 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const colors = getColors();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Horizontal bar chart showing top countries by number of papers');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const yScale = d3.scaleBand()
    .domain(sortedData.map(d => d.country))
    .range([0, innerHeight])
    .padding(0.2);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.count) || 0])
    .nice()
    .range([0, innerWidth]);

  // Make gradient id unique per chart to avoid collisions
  const gradientId = `bar-gradient-${containerId}`;

  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient')
    .attr('id', gradientId)
    .attr('x1', '0%')
    .attr('x2', '100%');

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', colors.primary);

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', colors.primaryContainer);

  // Y axis
  const yAxis = g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  yAxis.selectAll('text')
    .style('fill', colors.onSurface)
    .style('font-size', '13px');

  yAxis.selectAll('line, path').style('stroke', 'transparent');

  // X axis
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

  // Bars
  g.selectAll('.bar')
    .data(sortedData)
    .join('rect')
    .attr('class', 'bar')
    .attr('y', d => yScale(d.country))
    .attr('x', 0)
    .attr('height', yScale.bandwidth())
    .attr('width', d => xScale(d.count))
    .attr('fill', `url(#${gradientId})`)
    .attr('rx', 4)
    .style('cursor', 'pointer')
    .on('mouseenter', function (event, d) {
      d3.select(this).attr('opacity', 0.85);
      showTooltip(event, d, colors, countryData);
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 1);
      hideTooltip();
    });

  // Value labels
  // Add value labels with smart positioning (inside if bar is too long)
  g.selectAll('.bar-label')
    .data(sortedData)
    .join('text')
    .attr('class', 'bar-label')
    .attr('y', d => yScale(d.country) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('x', d => {
      const barEnd = xScale(d.count);
      const padding = 8;
      // If the label would overflow, move it inside the bar
      return (barEnd > innerWidth - 40) ? (barEnd - padding) : (barEnd + padding);
    })
    .attr('text-anchor', d => (xScale(d.count) > innerWidth - 40) ? 'end' : 'start')
    .style('fill', colors.onSurfaceVariant)  
    .style('font-size', '12px')
    .text(d => d.count.toLocaleString());


  function showTooltip(event, d, colors, allData) {
    const total = d3.sum(allData, t => t.count);
    const percentage = total > 0 ? ((d.count / total) * 100).toFixed(1) : "0.0";

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
        <strong>${d.country}</strong><br>
        ${d.count.toLocaleString()} papers (${percentage}% of total)
      `);
  }

  function hideTooltip() {
    d3.select('.country-tooltip').remove();
  }
}

export async function updateCountryBarChart(containerId, d3) {
  await renderCountryBarChart(containerId, d3);
}
