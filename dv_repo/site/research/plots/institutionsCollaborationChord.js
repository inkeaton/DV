/**
 * research/plots/institutionsCollaborationChord.js
 * Chord diagram showing inter-institutional collaborations
 */

import { institutionsCollaborationData, institutionsCollaborationStats, regionColorsChord } from '../../data/research/institutionsCollaborationData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';

export const institutionsCollaborationChordConfig = {
  data: institutionsCollaborationData,
  margins: { top: 60, right: 60, bottom: 60, left: 60 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Inter-Institutional Collaboration Network');

    // Calculate center and radius with minimum size check
    const centerX = width / 2;
    const centerY = height / 2;
    const minDimension = Math.min(width, height);
    
    // Ensure we have enough space for the chord diagram
    if (minDimension < 200) {
      console.warn('Chord diagram too small to render');
      return;
    }
    
    const outerRadius = Math.max(minDimension / 2 - 80, 60);
    const innerRadius = Math.max(outerRadius - 20, 50);

    // Create chord layout
    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const chords = chord(data.matrix);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Create ribbon generator
    const ribbon = d3.ribbon()
      .radius(innerRadius);

    // Translate to center
    const centerGroup = g.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Color scale by region
    const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(regionColorsChord))
      .range(Object.values(regionColorsChord));

    // Draw chords (ribbons)
    const ribbons = centerGroup.append('g')
      .attr('class', 'ribbons')
      .selectAll('path')
      .data(chords)
      .join('path')
      .attr('d', ribbon)
      .attr('fill', d => colorScale(data.institutionRegions[d.source.index]))
      .attr('fill-opacity', 0)
      .attr('stroke', 'none')
      .style('cursor', 'pointer');

    // Ribbon hover effects - show full names and collaboration count
    ribbons
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.8);

        // Dim other ribbons
        ribbons
          .filter(r => r !== d)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.05);

        // Show label with full names
        const fullName1 = data.institutionsFull ? data.institutionsFull[d.source.index] : data.institutions[d.source.index];
        const fullName2 = data.institutionsFull ? data.institutionsFull[d.target.index] : data.institutions[d.target.index];
        
        const label = g.append('g').attr('class', 'hover-label');
        const text = label.append('text')
          .attr('x', width / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .attr('fill', '#333');
        
        text.append('tspan').text(`${fullName1} ↔ ${fullName2} | `);
        text.append('tspan').attr('font-weight', 'bold').text(`${d.source.value} papers`);

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
        ribbons
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.5);

        g.selectAll('.hover-label').remove();
      });

    // Draw arcs (institution groups)
    const groups = centerGroup.append('g')
      .attr('class', 'groups')
      .selectAll('g')
      .data(chords.groups)
      .join('g');

    const arcs = groups.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(data.institutionRegions[d.index]))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .style('cursor', 'pointer');

    // Arc hover effects - show full name and total papers for institution
    arcs
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 1);

        // Highlight related ribbons
        ribbons
          .transition()
          .duration(200)
          .attr('fill-opacity', r => 
            r.source.index === d.index || r.target.index === d.index ? 0.8 : 0.1
          );

        // Show institution info with full name and total papers
        const fullName = data.institutionsFull ? data.institutionsFull[d.index] : data.institutions[d.index];
        const totalPapers = data.institutionPapers ? data.institutionPapers[d.index] : null;
        const region = data.institutionRegions[d.index];
        
        // Calculate total collaborations for this institution
        const totalCollabs = data.matrix[d.index].reduce((sum, val) => sum + val, 0);
        
        const label = g.append('g').attr('class', 'hover-label');
        
        const text = label.append('text')
          .attr('x', width / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .attr('fill', '#333');
        
        text.append('tspan').text(`${fullName} | `);
        if (totalPapers !== null) {
          text.append('tspan').attr('font-weight', 'bold').text(`${totalPapers} papers`);
          text.append('tspan').text(` | `);
          text.append('tspan').attr('font-weight', 'bold').text(`${totalCollabs} collaborations`);
        } else {
          text.append('tspan').attr('font-weight', 'bold').text(`${totalCollabs} collaborations`);
        }

        const bbox = text.node().getBBox();
        label.insert('rect', 'text')
          .attr('x', bbox.x - 8)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 16)
          .attr('height', bbox.height + 6)
          .attr('fill', '#fff')
          .attr('stroke', colorScale(region))
          .attr('stroke-width', 2)
          .attr('rx', 4);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.9);

        ribbons
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.5);

        g.selectAll('.hover-label').remove();
      });

    // Institution labels (short names by default)
    const labels = groups.append('text')
      .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '0.35em')
      .attr('transform', d => `
        rotate(${d.angle * 180 / Math.PI - 90})
        translate(${outerRadius + 12})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : 'start')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#333')
      .attr('opacity', 0)
      .text(d => data.institutions[d.index]);  // short names

    // Legend - only show regions that exist in data
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(10, ${height - 100})`)
      .attr('opacity', 0);

    // Filter to only regions present in data
    const presentRegions = new Set(data.institutionRegions);
    const legendData = Object.entries(regionColorsChord)
      .filter(([region]) => presentRegions.has(region));

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 22})`);

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
      .attr('x', 22)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(d => d[0]);

    // Stats annotation
    const stats = g.append('g')
      .attr('class', 'stats')
      .attr('transform', `translate(${width - 160}, ${height - 80})`)
      .attr('opacity', 0);

    stats.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 150)
      .attr('height', 70)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('rx', 5);

    const statsText = stats.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '11px')
      .attr('fill', '#333');

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', 0)
      .attr('font-weight', 'bold')
      .text(`${institutionsCollaborationStats.totalCollaborations} Total`);

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', '1.4em')
      .text(`Avg: ${institutionsCollaborationStats.avgCollaborationsPerInstitution.toFixed(1)}/institution`);

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', '1.4em')
      .attr('fill', '#666')
      .text(`${(institutionsCollaborationStats.crossRegionalRate * 100).toFixed(0)}% cross-regional`);

    // Animate arcs
    arcs
      .transition()
      .duration(animationDuration)
      .attr('opacity', 0.9);

    // Animate ribbons
    ribbons
      .transition()
      .duration(animationDuration)
      .delay(400)
      .attr('fill-opacity', 0.5);

    // Animate labels
    labels
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

    // Animate stats
    stats
      .transition()
      .delay(animationDuration + 400)
      .duration(400)
      .attr('opacity', 1);
  }
};
