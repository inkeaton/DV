/**
 * authors/plots/collaborationNetwork.js
 * Force-directed network graph showing author collaborations
 */

import { collaborationNetworkData, networkStats } from '../../data/authors/collaborationNetworkData.js';
import {
  renderTitle,
  styleAxes
} from '../../assets/js/chart-utils.js';

export const collaborationNetworkConfig = {
  data: collaborationNetworkData,
  margins: { top: 60, right: 40, bottom: 40, left: 40 },

  render: (ctx) => {
    const { g, d3, width, height, colors } = ctx;
    const animationDuration = 800;

    // Group colors
    const groupColors = {
      1: colors.primary,
      2: colors.secondary,
      3: colors.accent
    };

    // Create force simulation
    const simulation = d3
      .forceSimulation(collaborationNetworkData.nodes)
      .force(
        'link',
        d3
          .forceLink(collaborationNetworkData.links)
          .id((d) => d.id)
          .distance((d) => 100 - d.value * 2)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

  // Draw links
  const link = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(collaborationNetworkData.links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0)
    .attr('stroke-width', (d) => Math.sqrt(d.value));

  // Draw nodes
  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(collaborationNetworkData.nodes)
    .join('circle')
    .attr('r', 0)
    .attr('fill', (d) => groupColors[d.group])
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

  // Node labels (only for highly connected authors)
  const labels = g
    .append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(collaborationNetworkData.nodes.filter((d) => d.collaborations > 150))
    .join('text')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('dy', -12)
    .attr('fill', '#333')
    .attr('opacity', 0)
    .text((d) => d.id.split(' ').pop()); // Show last name only

    // Title
    renderTitle(ctx, 'Author Collaboration Network');

    // Legend
    const legend = g.append('g').attr('class', 'legend').attr('opacity', 0);

    const legendData = [
      { group: 1, label: networkStats.groups[1] },
      { group: 2, label: networkStats.groups[2] },
      { group: 3, label: networkStats.groups[3] }
    ];

    const legendItems = legend
      .selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${width - 180}, ${30 + i * 25})`);

  legendItems
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 6)
    .attr('fill', (d) => groupColors[d.group])
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  legendItems
    .append('text')
    .attr('x', 15)
    .attr('y', 4)
    .attr('font-size', '12px')
    .attr('fill', '#333')
    .text((d) => d.label);

  // Update positions on simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

    // Animate links
    link
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 10)
      .attr('stroke-opacity', 0.6);

    // Animate nodes
    node
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 10)
      .attr('r', (d) => Math.sqrt(d.collaborations) / 2 + 3);

    // Animate labels
    labels
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

    // Animate legend
    legend
      .transition()
      .delay(1000)
      .duration(400)
      .attr('opacity', 1);
  }
};
;
