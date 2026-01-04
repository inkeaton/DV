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
    const { g, d3, width, height, colors, svg } = ctx;
    const animationDuration = 800;

    // Group colors
    const groupColors = {
      1: colors.primary,
      2: colors.secondary,
      3: colors.accent
    };

    // Track current zoom level for tooltip scaling
    let currentZoomLevel = 1.0;

    // Calculate adjusted font size based on zoom level
    function getAdjustedFontSize(baseFontSize, zoomLevel) {
      return baseFontSize / zoomLevel;
    }

    // Calculate adjusted stroke width based on zoom level
    function getAdjustedStrokeWidth(baseStrokeWidth, zoomLevel) {
      return baseStrokeWidth / zoomLevel;
    }

    // Calculate adjusted padding based on zoom level
    function getAdjustedPadding(basePadding, zoomLevel) {
      return basePadding / zoomLevel;
    }

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
    .on('mouseenter', function(event, d) {
      // Highlight node
      d3.select(this)
        .transition()
        .duration(200)
        .attr('stroke-width', getAdjustedStrokeWidth(4, currentZoomLevel));

      // Show tooltip
      const tooltip = g.append('g').attr('class', 'node-tooltip');

      const text = tooltip.append('text')
        .attr('x', d.x)
        .attr('y', d.y - (Math.sqrt(d.collaborations) / 2 + 3) - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
        .attr('font-weight', 'bold')
        .attr('fill', '#333');

      text.append('tspan')
        .attr('x', d.x)
        .attr('dy', 0)
        .text(d.id);

      text.append('tspan')
        .attr('x', d.x)
        .attr('dy', '1.2em')
        .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
        .attr('font-weight', 'normal')
        .attr('fill', '#666')
        .text(`Group ${d.group} • ${d.collaborations} collaborations`);

      const bbox = text.node().getBBox();
      const padding = getAdjustedPadding(6, currentZoomLevel);
      tooltip.insert('rect', 'text')
        .attr('x', bbox.x - padding)
        .attr('y', bbox.y - padding / 2)
        .attr('width', bbox.width + padding * 2)
        .attr('height', bbox.height + padding)
        .attr('fill', '#fff')
        .attr('stroke', groupColors[d.group])
        .attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel))
        .attr('rx', getAdjustedPadding(4, currentZoomLevel));
    })
    .on('mouseleave', function(event, d) {
      // Reset node
      d3.select(this)
        .transition()
        .duration(200)
        .attr('stroke-width', 2);

      // Remove tooltip
      g.selectAll('.node-tooltip').remove();
    })
    .on('click', function(event, d) {
      event.stopPropagation();
      
      // Remove any existing tooltips
      g.selectAll('.node-tooltip').remove();
      
      // Reset all nodes
      node.attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel));
      
      // Highlight clicked node
      d3.select(this)
        .attr('stroke-width', getAdjustedStrokeWidth(4, currentZoomLevel));

      // Show tooltip
      const tooltip = g.append('g').attr('class', 'node-tooltip');

      const text = tooltip.append('text')
        .attr('x', d.x)
        .attr('y', d.y - (Math.sqrt(d.collaborations) / 2 + 3) - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
        .attr('font-weight', 'bold')
        .attr('fill', '#333');

      text.append('tspan')
        .attr('x', d.x)
        .attr('dy', 0)
        .text(d.id);

      text.append('tspan')
        .attr('x', d.x)
        .attr('dy', '1.2em')
        .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
        .attr('font-weight', 'normal')
        .attr('fill', '#666')
        .text(`Group ${d.group} • ${d.collaborations} collaborations`);

      const bbox = text.node().getBBox();
      const padding = getAdjustedPadding(6, currentZoomLevel);
      tooltip.insert('rect', 'text')
        .attr('x', bbox.x - padding)
        .attr('y', bbox.y - padding / 2)
        .attr('width', bbox.width + padding * 2)
        .attr('height', bbox.height + padding)
        .attr('fill', '#fff')
        .attr('stroke', groupColors[d.group])
        .attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel))
        .attr('rx', getAdjustedPadding(4, currentZoomLevel));
    })
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

    // ========================================================================
    // ZOOM AND PAN FUNCTIONALITY
    // ========================================================================
    
    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .filter((event) => {
        // Disable wheel zoom to avoid scroll conflicts
        if (event.type === 'wheel') {
          return false;
        }
        // Disable double-click zoom
        if (event.type === 'dblclick') {
          return false;
        }
        // Allow pan (drag) only
        return !event.button;
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        
        // Update zoom level for tooltip scaling
        currentZoomLevel = event.transform.k;
        
        // Update node stroke widths to compensate for zoom
        node.attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel));
      });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Click on background to close tooltips (for mobile)
    svg.on('click', function(event) {
      if (event.target === this || event.target.tagName === 'rect') {
        g.selectAll('.node-tooltip').remove();
        node.attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel));
      }
    });

    // Add zoom control buttons
    const zoomControls = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${width - 50}, 80)`);

    // Zoom in button
    const zoomInBtn = zoomControls.append('g')
      .attr('class', 'zoom-btn')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      });

    zoomInBtn.append('circle')
      .attr('r', 18)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    zoomInBtn.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text('+');

    // Zoom out button
    const zoomOutBtn = zoomControls.append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 45)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.77);
      });

    zoomOutBtn.append('circle')
      .attr('r', 18)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    zoomOutBtn.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text('−');

    // Reset zoom button
    const resetBtn = zoomControls.append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 90)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
      });

    resetBtn.append('circle')
      .attr('r', 18)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    resetBtn.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '14px')
      .attr('fill', colors.primary)
      .text('⟲');

    // Instruction hint
    zoomControls.append('text')
      .attr('x', -10)
      .attr('y', 130)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .attr('opacity', 0)
      .text('Use buttons to zoom')
      .transition()
      .delay(1500)
      .duration(400)
      .attr('opacity', 1);
  }
};
;
