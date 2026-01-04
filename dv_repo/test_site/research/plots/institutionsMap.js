/**
 * research/plots/institutionsMap.js
 * Bubble map showing research institutions globally
 */

import { institutionsMapData, institutionsMapStats, regionColors } from '../../data/research/institutionsMapData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';

export const institutionsMapConfig = {
  data: institutionsMapData,
  margins: { top: 40, right: 40, bottom: 40, left: 40 },

  render: async (ctx) => {
    const { g, d3, width, height, data, colors, svg } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Global Distribution of Visualization Research Institutions');

    // Load world GeoJSON
    const worldData = await d3.json('../data/world.geojson');

    // Create projection
    const projection = d3.geoNaturalEarth1()
      .fitSize([width, height * 0.95], worldData);

    const path = d3.geoPath().projection(projection);

    // Draw world map
    const mapGroup = g.append('g').attr('class', 'world-map');

    mapGroup.selectAll('path')
      .data(worldData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0)
      .transition()
      .duration(animationDuration)
      .attr('opacity', 1);

    // Size scale for bubbles
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.papers)])
      .range([3, 25]);

    // Draw institution bubbles
    const bubbles = g.append('g')
      .attr('class', 'institutions')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => projection([d.lon, d.lat])[0])
      .attr('cy', d => projection([d.lon, d.lat])[1])
      .attr('r', 0)
      .attr('fill', d => regionColors[d.region])
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Hover interactions
    bubbles
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 1)
          .attr('stroke-width', 3);

        // Show label
        const [x, y] = projection([d.lon, d.lat]);
        const label = g.append('g').attr('class', 'hover-label');

        const text = label.append('text')
          .attr('x', x)
          .attr('y', y - sizeScale(d.papers) - 12)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333');

        text.append('tspan')
          .attr('x', x)
          .attr('dy', 0)
          .text(d.name);

        text.append('tspan')
          .attr('x', x)
          .attr('dy', '1.2em')
          .attr('font-size', '11px')
          .attr('font-weight', 'normal')
          .attr('fill', '#666')
          .text(`${d.papers} papers`);

        const bbox = text.node().getBBox();
        label.insert('rect', 'text')
          .attr('x', bbox.x - 6)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 12)
          .attr('height', bbox.height + 6)
          .attr('fill', '#fff')
          .attr('stroke', regionColors[d.region])
          .attr('stroke-width', 2)
          .attr('rx', 4);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.7)
          .attr('stroke-width', 1.5);

        g.selectAll('.hover-label').remove();
      });

    // Legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`)
      .attr('opacity', 0);

    const legendData = Object.entries(regionColors);

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 22})`);

    legendItems.append('circle')
      .attr('cx', 6)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', d => d[1])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(d => d[0]);

    // Size reference
    const sizeRef = legend.append('g')
      .attr('transform', `translate(0, ${legendData.length * 22 + 15})`);

    sizeRef.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#666')
      .text('Paper Count:');

    const sizeRefData = [50, 100, 150];
    sizeRefData.forEach((papers, i) => {
      const refGroup = sizeRef.append('g')
        .attr('transform', `translate(${i * 45}, 15)`);

      refGroup.append('circle')
        .attr('cx', 15)
        .attr('cy', 0)
        .attr('r', sizeScale(papers))
        .attr('fill', colors.primary)
        .attr('fill-opacity', 0.3)
        .attr('stroke', colors.primary)
        .attr('stroke-width', 1.5);

      refGroup.append('text')
        .attr('x', 15)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#666')
        .text(papers);
    });

    // Stats box
    const statsBox = g.append('g')
      .attr('class', 'stats-box')
      .attr('transform', 'translate(10, 20)')
      .attr('opacity', 0);

    statsBox.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 180)
      .attr('height', 85)
      .attr('fill', '#fff')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('rx', 5);

    const statsText = statsBox.append('text')
      .attr('x', 10)
      .attr('y', 22)
      .attr('font-size', '11px')
      .attr('fill', '#333');

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', 0)
      .attr('font-weight', 'bold')
      .text(`${institutionsMapStats.totalInstitutions} Institutions`);

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', '1.4em')
      .text(`${institutionsMapStats.totalPapers.toLocaleString()} Total Papers`);

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', '1.4em')
      .attr('fill', '#666')
      .text(`Top: ${institutionsMapStats.topInstitution}`);

    statsText.append('tspan')
      .attr('x', 10)
      .attr('dy', '1.4em')
      .attr('fill', '#666')
      .text(`(${institutionsMapStats.topInstitutionPapers} papers)`);

    // Animate bubbles
    bubbles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 30)
      .attr('r', d => sizeScale(d.papers));

    // Animate legend
    legend
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);

    // Animate stats box
    statsBox
      .transition()
      .delay(animationDuration + 200)
      .duration(400)
      .attr('opacity', 1);
  }
};
