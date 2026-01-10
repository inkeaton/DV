/**
 * research/plots/institutionsTopicsSankey.js
 * Sankey diagram connecting institutions to research topics
 */

import { institutionsTopicsData, institutionsTopicsStats, topicColors, regionColors } from '../../data/research/institutionsTopicsData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';

export const institutionsTopicsSankeyConfig = {
  data: institutionsTopicsData,
  margins: { top: 100, right: 180, bottom: 100, left: 220 },

  render: async (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Research Focus by Institution');

    // Import d3-sankey
    const d3Sankey = await import('https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm');

    // Create Sankey generator
    // nodeSort(null) preserves input order (sorted by region in data)
    const sankey = d3Sankey.sankey()
      .nodeId(d => d.id)
      .nodeWidth(16)
      .nodePadding(10)
      .nodeSort(null)  // Preserve order from data (grouped by region)
      .extent([[0, 0], [width * 0.95, height * 0.9]]);

    // Generate Sankey layout
    const sankeyData = sankey({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    // Color scale for institutions by region (from data)
    const institutionColorScale = d3.scaleOrdinal()
      .domain(Object.keys(regionColors))
      .range(Object.values(regionColors))
      .unknown('#9ca3af');

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
      .on('mouseenter', function (event, d) {
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
          .attr('fill', '#333');
        
        // Calculate percentage of this link relative to source institution's total
        const sourceTotalPapers = sourceNode.totalPapers || 1;
        const linkPct = ((d.value / sourceTotalPapers) * 100).toFixed(1);
        
        text.append('tspan').text(`${sourceNode.id} → ${targetNode.id} | `);
        text.append('tspan').attr('font-weight', 'bold').text(`${d.value} papers`);
        text.append('tspan').text(` (${linkPct}%)`);

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
      .on('mouseleave', function (event, d) {
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
      .on('mouseenter', function (event, d) {
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

        // Show tooltip
        const label = g.append('g').attr('class', 'hover-label');
        
        const displayName = d.type === 'institution' ? d.fullName : d.category;
        
        // Calculate total papers for percentage
        const totalInstitutionPapers = data.nodes
          .filter(n => n.type === 'institution')
          .reduce((sum, n) => sum + n.totalPapers, 0);
        
        const text = label.append('text')
          .attr('x', width / 2)
          .attr('y', -25)
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .attr('fill', '#333');
        
        text.append('tspan').text(`${displayName} | `);
        text.append('tspan').attr('font-weight', 'bold').text(`${d.totalPapers} papers`);
        
        // Add percentage for both institutions and topics
        if (d.type === 'institution') {
          const instPct = ((d.totalPapers / totalInstitutionPapers) * 100).toFixed(1);
          text.append('tspan').text(` (${instPct}%)`);
        } else if (d.type === 'topic' && d.percentage !== undefined) {
          text.append('tspan').text(` (${d.percentage}%)`);
        }

        const bbox = text.node().getBBox();
        label.insert('rect', 'text')
          .attr('x', bbox.x - 10)
          .attr('y', bbox.y - 4)
          .attr('width', bbox.width + 20)
          .attr('height', bbox.height + 8)
          .attr('fill', '#fff')
          .attr('stroke', d.type === 'institution' ? institutionColorScale(d.region) : topicColors[d.category])
          .attr('stroke-width', 2)
          .attr('rx', 4);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.8);

        links
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.3);

        g.selectAll('.hover-label').remove();
      });

    // Helper function to split long labels into two lines
    function wrapLabel(text) {
      const words = text.split(/[\s&]+/);
      if (words.length <= 2 || text.length <= 12) {
        return [text];
      }
      // Split into two lines
      const midpoint = Math.ceil(words.length / 2);
      const line1 = words.slice(0, midpoint).join(' ');
      const line2 = words.slice(midpoint).join(' ');
      return [line1, line2];
    }

    // Node labels
    const labels = g.append('g')
      .attr('class', 'labels')
      .selectAll('g')
      .data(sankeyData.nodes)
      .join('g')
      .attr('class', 'node-label')
      .attr('transform', d => `translate(${d.type === 'institution' ? d.x0 - 8 : d.x1 + 8}, ${(d.y0 + d.y1) / 2})`)
      .attr('opacity', 0);

    labels.each(function(d) {
      const label = d3.select(this);
      const lines = d.type === 'topic' ? wrapLabel(d.id) : [d.id];
      const lineHeight = 12;
      const startY = -(lines.length - 1) * lineHeight / 2;
      
      lines.forEach((line, i) => {
        label.append('text')
          .attr('x', 0)
          .attr('y', startY + i * lineHeight)
          .attr('dy', '0.35em')
          .attr('text-anchor', d.type === 'institution' ? 'end' : 'start')
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .attr('fill', '#333')
          .text(line);
      });
    });

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

    // Legend - Part of the World (bottom left)
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(-210, ${height * 0.9 + 25})`)
      .attr('opacity', 0);

    // Filter to only regions present in data
    const presentRegions = new Set(data.nodes.filter(n => n.type === 'institution').map(n => n.region));
    const legendData = Object.entries(regionColors)
      .filter(([region]) => presentRegions.has(region));

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 24})`);

    legendItems.append('rect')
      .attr('x', 0)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', d => d[1])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('rx', 3);

    legendItems.append('text')
      .attr('x', 24)
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text(d => d[0]);

    // Stats box - Info (top left)
    const statsBox = g.append('g')
      .attr('class', 'stats-box')
      .attr('transform', `translate(-210, -90)`)
      .attr('opacity', 0);

    statsBox.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 350)
      .attr('height', 165)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('rx', 5);

    const statsText = statsBox.append('text')
      .attr('x', 12)
      .attr('y', 22)
      .attr('font-size', '11px')
      .attr('fill', '#333');

    // Total Institutions
    statsText.append('tspan')
      .attr('x', 12)
      .attr('dy', 0)
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text(`${institutionsTopicsStats.topInstitutions} institutions`);

    // Total Topics
    statsText.append('tspan')
      .attr('x', 12)
      .attr('dy', '1.5em')
      .attr('font-size', '11px')
      .text(`${institutionsTopicsStats.topTopics} topics`);

    // Total Connections
    statsText.append('tspan')
      .attr('x', 12)
      .attr('dy', '1.3em')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(`${institutionsTopicsStats.totalConnections} connections`);

    // Topics per institution (average)
    const topicsPerInst = (institutionsTopicsStats.totalConnections / institutionsTopicsStats.topInstitutions).toFixed(1);
    statsText.append('tspan')
      .attr('x', 12)
      .attr('dy', '1.3em')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(`~${topicsPerInst} topics per inst.`);

    // Divider line
    statsBox.append('line')
      .attr('x1', 12)
      .attr('y1', 95)
      .attr('x2', 163)
      .attr('y2', 95)
      .attr('stroke', '#e5e5e5')
      .attr('stroke-width', 1);

    // Strongest Connection label
    statsBox.append('text')
      .attr('x', 12)
      .attr('y', 112)
      .attr('font-size', '9px')
      .attr('fill', '#666')
      .text('Strongest Connection');

    // Get region color for the strongest connection institution
    const strongestInst = data.nodes.find(n => n.id === institutionsTopicsStats.strongestConnection.institution);
    const strongestRegionColor = strongestInst ? regionColors[strongestInst.region] : '#3b82f6';
    
    // Get full institution name
    const strongestFullName = strongestInst ? strongestInst.fullName : institutionsTopicsStats.strongestConnection.institution;

    // Strongest Connection value - highlighted (same style as map top institution)
    const strongestText = statsBox.append('text')
      .attr('x', 12)
      .attr('y', 130)
      .attr('font-size', '10px');

    strongestText.append('tspan')
      .attr('font-weight', 'bold')
      .attr('fill', strongestRegionColor)
      .text(`${strongestFullName}`);

    strongestText.append('tspan')
      .attr('fill', '#333')
      .text(' | ');

    strongestText.append('tspan')
      .attr('font-weight', 'bold')
      .attr('fill', strongestRegionColor)
      .text(`${institutionsTopicsStats.strongestConnection.papers} ${institutionsTopicsStats.strongestConnection.topic}`);

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

    // Also animate the parent labels container
    g.select('.labels')
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

    // Animate legend
    legend
      .transition()
      .delay(animationDuration + 200)
      .duration(400)
      .attr('opacity', 1);

    // Animate stats box
    statsBox
      .transition()
      .delay(animationDuration + 300)
      .duration(400)
      .attr('opacity', 1);
  }
};