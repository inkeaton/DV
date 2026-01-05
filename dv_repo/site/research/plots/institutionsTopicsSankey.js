/**
 * research/plots/institutionsTopicsSankey.js
 * Sankey diagram connecting institutions to research topics
 */

import { institutionsTopicsData, institutionsTopicsStats, topicColors } from '../../data/research/institutionsTopicsData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';

export const institutionsTopicsSankeyConfig = {
  data: institutionsTopicsData,
  margins: { top: 60, right: 120, bottom: 60, left: 120 },

  render: async (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Research Focus by Institution');

    // Import d3-sankey
    const d3Sankey = await import('https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm');

    // Create Sankey generator
    const sankey = d3Sankey.sankey()
      .nodeId(d => d.id)
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[0, 0], [width, height]]);

    // Generate Sankey layout
    const sankeyData = sankey({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    // Color scale for institutions by region
    const institutionColorScale = d3.scaleOrdinal()
      .domain(['North America', 'Europe', 'Asia'])
      .range([colors.primary, colors.secondary, colors.accent]);

    // Draw links
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', d3Sankey.sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', d => {
        const sourceNode = sankeyData.nodes.find(n => n.id === d.source.id);
        return sourceNode.type === 'institution' 
          ? institutionColorScale(sourceNode.region)
          : topicColors[d.target.category];
      })
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 0.3)
      .style('cursor', 'pointer');

    // Link hover effects
    links
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.7)
          .attr('stroke-width', d.width);

        // Show tooltip
        const sourceNode = sankeyData.nodes.find(n => n.id === d.source.id);
        const targetNode = sankeyData.nodes.find(n => n.id === d.target.id);
        
        const label = g.append('g').attr('class', 'hover-label');
        const text = label.append('text')
          .attr('x', width / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(`${sourceNode.id} → ${targetNode.id}: ${d.value} papers`);

        const bbox = text.node().getBBox();
        label.insert('rect', 'text')
          .attr('x', bbox.x - 8)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 16)
          .attr('height', bbox.height + 6)
          .attr('fill', '#fff')
          .attr('stroke', colors.primary)
          .attr('stroke-width', 2)
          .attr('rx', 4);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', d.width);

        g.selectAll('.hover-label').remove();
      });

    // Draw nodes
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('rect')
      .data(sankeyData.nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', 0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        if (d.type === 'institution') {
          return institutionColorScale(d.region);
        } else {
          return topicColors[d.category];
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Node hover effects
    nodes
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 1);

        // Highlight connected links
        links
          .transition()
          .duration(200)
          .attr('stroke-opacity', link => 
            link.source.id === d.id || link.target.id === d.id ? 0.7 : 0.1
          );
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.8);

        links
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.3);
      });

    // Node labels
    const labels = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(sankeyData.nodes)
      .join('text')
      .attr('x', d => d.type === 'institution' ? d.x0 - 8 : d.x1 + 8)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.type === 'institution' ? 'end' : 'start')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#333')
      .attr('opacity', 0)
      .text(d => d.id);

    // Section labels
    const sectionLabels = g.append('g').attr('class', 'section-labels').attr('opacity', 0);

    sectionLabels.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#666')
      .text('Institutions');

    sectionLabels.append('text')
      .attr('x', width)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#666')
      .text('Research Topics');

    // Animate links
    links
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 30)
      .attr('stroke-width', d => d.width);

    // Animate nodes
    nodes
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 50)
      .attr('width', sankey.nodeWidth())
      .attr('fill-opacity', 0.8);

    // Animate labels
    labels
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

    // Animate section labels
    sectionLabels
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);
  }
};
