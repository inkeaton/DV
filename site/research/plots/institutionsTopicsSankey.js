/**
 * research/plots/institutionsTopicsSankey.js
 * Sankey diagram connecting institutions to research topics
 */

import { institutionsTopicsData, institutionsTopicsStats } from '../../data/research/institutionsTopicsData.js';
import { topicColors, topicNameKeyMap, regionColors } from '../../assets/js/color-palettes.js';
import { renderTitle } from '../../assets/js/chart-utils.js';

export const institutionsTopicsSankeyConfig = {
  data: institutionsTopicsData,
  margins: { top: 100, right: 180, bottom: 100, left: 220 },

  render: async (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Block interactions during animation
    g.style('pointer-events', 'none');

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
      .extent([[0, 60], [width * 0.95, height* 1.1]]);

    // Generate Sankey layout
    const sankeyData = sankey({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    // Color scale for institutions by region (from data)
    const institutionColorScale = d3.scaleOrdinal()
      .domain(Object.keys(regionColors))
      .range(Object.values(regionColors).map(rc => rc.default))
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
        if (sourceNode.type === 'institution') return institutionColorScale(sourceNode.region);
        const topicKey = topicNameKeyMap[d.target.category] || d.target.category;
        return (topicColors[topicKey] && topicColors[topicKey].default) ? topicColors[topicKey].default : '#9ca3af';
      })
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 0.3)
      .style('cursor', 'pointer')
      .style('pointer-events', 'none');

    // Link hover effects
    links
      .on('mouseenter', function (event, d) {
        const el = d3.select(this);
        if (!this.__origStroke) this.__origStroke = el.attr('stroke');

        const sourceNode = sankeyData.nodes.find(n => n.id === d.source.id);
        const targetNode = sankeyData.nodes.find(n => n.id === d.target.id);

        if (sourceNode && sourceNode.type === 'institution') {
          const isDark = document.body.classList.contains('dark-theme');
          const hoverStroke = (regionColors[sourceNode.region] ? (isDark ? regionColors[sourceNode.region].hoverDark : regionColors[sourceNode.region].hoverLight) : (this.__origStroke || '#9ca3af'));
          el.transition()
            .duration(200)
            .attr('stroke-opacity', 0.7)
            .attr('stroke-width', d.width)
            .attr('stroke', hoverStroke);
        } else {
          el.transition()
            .duration(200)
            .attr('stroke-opacity', 0.7)
            .attr('stroke-width', d.width);
        }

        // Show tooltip
        const label = g.append('g').attr('class', 'hover-label');
        const text = label.append('text')
          .attr('x', width / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .attr('fill', colors.onSurface);
        
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
          .attr('fill', colors.surfaceContainer)
          .attr('stroke', colors.primary)
          .attr('stroke-width', 2)
          .attr('rx', 4);
      })
      .on('mouseleave', function (event, d) {
        const el = d3.select(this);
        el.transition()
          .duration(200)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', d.width)
          .attr('stroke', this.__origStroke || el.attr('stroke'));

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
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', d => {
        if (d.type === 'institution') {
          return institutionColorScale(d.region);
        } else {
          const topicKey = topicNameKeyMap[d.category] || d.category;
          return (topicColors[topicKey] && topicColors[topicKey].default) ? topicColors[topicKey].default : '#9ca3af';
        }
      })
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('pointer-events', 'none');

    // Node hover effects
    nodes
      .on('mouseenter', function (event, d) {
        const el = d3.select(this);
        if (!this.__origFill) this.__origFill = el.attr('fill');

        if (d.type === 'institution') {
          const isDark = document.body.classList.contains('dark-theme');
          const hoverFill = (regionColors[d.region] ? (isDark ? regionColors[d.region].hoverDark : regionColors[d.region].hoverLight) : institutionColorScale(d.region));
          el.transition()
            .duration(200)
            .attr('fill-opacity', 1)
            .attr('fill', hoverFill);
        } else {
          el.transition()
            .duration(200)
            .attr('fill-opacity', 1);
        }

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
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .attr('fill', colors.onSurface);
        
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
          .attr('fill', colors.surfaceContainer)
          .attr('stroke', d.type === 'institution' ? (regionColors[d.region] ? regionColors[d.region].default : institutionColorScale(d.region)) : ( (topicColors[topicNameKeyMap[d.category] || d.category] && topicColors[topicNameKeyMap[d.category] || d.category].default) ? topicColors[topicNameKeyMap[d.category] || d.category].default : '#9ca3af' ))
          .attr('stroke-width', 2)
          .attr('rx', 4);
      })
      .on('mouseleave', function (event, d) {
        const el = d3.select(this);
        el.transition()
          .duration(200)
          .attr('fill-opacity', 0.8)
          .attr('fill', this.__origFill || el.attr('fill'));

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
          .attr('fill', colors.onSurface)
          .text(line);
      });
    });

    // Section labels
    const sectionLabels = g.append('g').attr('class', 'section-labels').attr('opacity', 0);

    sectionLabels.append('text')
      .attr('x', 0)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurfaceVariant)
      .text('Institutions');

    sectionLabels.append('text')
      .attr('x', width - 50)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurfaceVariant)
      .text('Research Topics');

    // Legend - Part of the World (bottom left)
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(-190, ${height * 0.9 + 25})`)
      .attr('opacity', 0);

    // Filter to only regions present in data
    const presentRegions = new Set(data.nodes.filter(n => n.type === 'institution').map(n => n.region));
    
    // Calculate number of connections (links) per region
    const regionConnectionCounts = {};
    data.links.forEach(link => {
      const sourceNode = data.nodes.find(n => n.id === link.source);
      if (sourceNode && sourceNode.region) {
        if (!regionConnectionCounts[sourceNode.region]) {
          regionConnectionCounts[sourceNode.region] = 0;
        }
        regionConnectionCounts[sourceNode.region]++;
      }
    });
    
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
      .attr('fill', d => (d[1] && d[1].default) ? d[1].default : '#9ca3af')
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 1.5)
      .attr('rx', 3);

    legendItems.append('text')
      .attr('x', 24)
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('fill', colors.onSurface)
      .text(d => `${d[0]}: ${regionConnectionCounts[d[0]] || 0}`);

    // Legend title
    legend.append('text')
      .attr('x', 0)
      .attr('y', -15)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurfaceVariant)
      .text('Connections per Region');

    // Stats text (top-right corner, no background)
    const statsText = g.append('g')
      .attr('class', 'stats-text')
      .attr('transform', `translate(${width +140}, -50)`)
      .attr('opacity', 0);

    statsText.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurface)
      .text(`${institutionsTopicsStats.topInstitutions} institutions`);

    statsText.append('text')
      .attr('x', 0)
      .attr('y', 18)
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('fill', colors.onSurfaceVariant)
      .text(`${institutionsTopicsStats.topTopics} topics`);

    statsText.append('text')
      .attr('x', 0)
      .attr('y', 36)
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('fill', colors.onSurfaceVariant)
      .text(`${institutionsTopicsStats.totalConnections} connections`);

    // Calculate the actual max animation time based on data size
    const numLinks = sankeyData.links.length;
    const numNodes = sankeyData.nodes.length;
    const maxLinkDelay = (numLinks - 1) * 30 + animationDuration;
    const maxNodeDelay = (numNodes - 1) * 50 + animationDuration;
    const maxAnimationTime = Math.max(maxLinkDelay, maxNodeDelay, animationDuration + 700);

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

    // Animate stats text
    statsText
      .transition()
      .delay(animationDuration + 300)
      .duration(400)
      .attr('opacity', 1);

    // Re-enable interactions after all animations complete (use timeout for accuracy)
    setTimeout(() => {
      g.style('pointer-events', 'auto');
      links.style('pointer-events', 'auto');
      nodes.style('pointer-events', 'auto');
    }, maxAnimationTime + 100); // Add small buffer
  }
};