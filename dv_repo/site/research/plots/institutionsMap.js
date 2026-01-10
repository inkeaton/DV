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

    // Calculate adjusted bubble size based on zoom level
    // As zoom increases, bubbles get relatively smaller to reduce overlap
    function getAdjustedRadius(papers, zoomLevel) {
      const baseRadius = sizeScale(papers);
      // Scale factor: at 1x zoom = 1.0, at 8x zoom = 0.1
      // This makes bubbles 90% smaller at maximum zoom
      const scaleFactor = 1.0 - (zoomLevel - 1) * 0.129; // (1.0 - 0.1) / (8 - 1) ≈ 0.129
      return baseRadius * scaleFactor;
    }

    // Calculate adjusted font size based on zoom level
    function getAdjustedFontSize(baseFontSize, zoomLevel) {
      // Since the tooltip is inside the zoomed g element, it gets magnified by zoom
      // We need to compensate by dividing by zoom level to keep it reasonable
      // At 1x zoom = baseFontSize, at 8x zoom = baseFontSize/8 (counteracts zoom magnification)
      return baseFontSize / zoomLevel;
    }

    // Calculate adjusted stroke width based on zoom level
    function getAdjustedStrokeWidth(baseStrokeWidth, zoomLevel) {
      // Similar to font size, compensate for zoom magnification
      return baseStrokeWidth / zoomLevel;
    }

    // Calculate adjusted padding based on zoom level
    function getAdjustedPadding(basePadding, zoomLevel) {
      return basePadding / zoomLevel;
    }

    // ========================================================================
    // CLUSTERING FUNCTIONS
    // ========================================================================
    
    // Cluster by region (zoom level 1.0 - 2.0)
    function clusterByRegion(institutions) {
      const regionMap = d3.rollup(
        institutions,
        v => ({
          papers: d3.sum(v, d => d.papers),
          institutions: v.length,
          members: v.map(d => d.name)
        }),
        d => d.region
      );
      
      return Array.from(regionMap, ([region, stats]) => {
        const members = institutions.filter(d => d.region === region);
        return {
          name: region,
          region: region,
          lat: d3.mean(members, d => d.lat),
          lon: d3.mean(members, d => d.lon),
          papers: stats.papers,
          institutions: stats.institutions,
          isCluster: true,
          clusterType: 'region',
          members: stats.members
        };
      });
    }
    
    // Cluster by country (zoom level 2.0 - 4.0)
    function clusterByCountry(institutions) {
      const countryMap = d3.rollup(
        institutions,
        v => ({
          papers: d3.sum(v, d => d.papers),
          institutions: v.length,
          members: v.map(d => d.name),
          region: v[0].region
        }),
        d => d.country
      );
      
      return Array.from(countryMap, ([country, stats]) => {
        const members = institutions.filter(d => d.country === country);
        return {
          name: country,
          country: country,
          region: stats.region,
          lat: d3.mean(members, d => d.lat),
          lon: d3.mean(members, d => d.lon),
          papers: stats.papers,
          institutions: stats.institutions,
          isCluster: true,
          clusterType: 'country',
          members: stats.members
        };
      });
    }
    
    // Get visible data based on zoom level
    function getVisibleData(zoomLevel) {
      if (zoomLevel < 2.0) {
        return clusterByRegion(data);
      } else if (zoomLevel < 4.0) {
        return clusterByCountry(data);
      } else {
        return data.map(d => ({ ...d, isCluster: false }));
      }
    }

    // Draw institution bubbles
    const bubblesGroup = g.append('g').attr('class', 'institutions');
    
    let currentZoomLevel = 1.0;
    let bubbles = bubblesGroup
      .selectAll('circle')
      .data(getVisibleData(currentZoomLevel), d => d.isCluster ? `cluster-${d.name}` : d.name)
      .join('circle')
      .attr('cx', d => projection([d.lon, d.lat])[0])
      .attr('cy', d => projection([d.lon, d.lat])[1])
      .attr('r', 0)
      .attr('fill', d => regionColors[d.region])
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel))
      .style('cursor', 'pointer');

    // Attach hover handlers to initial bubbles
    function attachHoverHandlers(bubbleSelection) {
      bubbleSelection
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', 1)
            .attr('stroke-width', getAdjustedStrokeWidth(3, currentZoomLevel));

          // Show label
          const [x, y] = projection([d.lon, d.lat]);
          const label = g.append('g').attr('class', 'hover-label');

          const text = label.append('text')
            .attr('x', x)
            .attr('y', y - getAdjustedRadius(d.papers, currentZoomLevel) - 12)
            .attr('text-anchor', 'middle')
            .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
            .attr('font-weight', 'bold')
            .attr('fill', '#333');

          text.append('tspan')
            .attr('x', x)
            .attr('dy', 0)
            .text(d.name);

          if (d.isCluster) {
            const detailSpan = text.append('tspan')
              .attr('x', x)
              .attr('dy', '1.2em')
              .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
              .attr('fill', '#666');
            
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.institutions} institutions`);
            detailSpan.append('tspan').attr('font-weight', 'normal').text(` | `);
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.papers} papers`);
          } else {
            const detailSpan = text.append('tspan')
              .attr('x', x)
              .attr('dy', '1.2em')
              .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
              .attr('fill', '#666');
            
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.papers} papers`);
          }

          const bbox = text.node().getBBox();
          const padding = getAdjustedPadding(6, currentZoomLevel);
          label.insert('rect', 'text')
            .attr('x', bbox.x - padding)
            .attr('y', bbox.y - padding / 2)
            .attr('width', bbox.width + padding * 2)
            .attr('height', bbox.height + padding)
            .attr('fill', '#fff')
            .attr('stroke', regionColors[d.region])
            .attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel))
            .attr('rx', getAdjustedPadding(4, currentZoomLevel));
        })
        .on('mouseleave', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', 0.7)
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel));

          g.selectAll('.hover-label').remove();
        })
        .on('click', function(event, d) {
          event.stopPropagation();
          
          // Remove any existing tooltips
          g.selectAll('.hover-label').remove();
          
          // Reset all bubbles
          bubbleSelection
            .attr('fill-opacity', 0.7)
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel));
          
          // Highlight clicked bubble
          d3.select(this)
            .attr('fill-opacity', 1)
            .attr('stroke-width', getAdjustedStrokeWidth(3, currentZoomLevel));

          // Show label
          const [x, y] = projection([d.lon, d.lat]);
          const label = g.append('g').attr('class', 'hover-label');

          const text = label.append('text')
            .attr('x', x)
            .attr('y', y - getAdjustedRadius(d.papers, currentZoomLevel) - 12)
            .attr('text-anchor', 'middle')
            .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
            .attr('font-weight', 'bold')
            .attr('fill', '#333');

          text.append('tspan')
            .attr('x', x)
            .attr('dy', 0)
            .text(d.name);

          if (d.isCluster) {
            const detailSpan = text.append('tspan')
              .attr('x', x)
              .attr('dy', '1.2em')
              .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
              .attr('fill', '#666');
            
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.institutions} institutions`);
            detailSpan.append('tspan').attr('font-weight', 'normal').text(` | `);
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.papers} papers`);
          } else {
            const detailSpan = text.append('tspan')
              .attr('x', x)
              .attr('dy', '1.2em')
              .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
              .attr('fill', '#666');
            
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.papers} papers`);
          }

          const bbox = text.node().getBBox();
          const padding = getAdjustedPadding(6, currentZoomLevel);
          label.insert('rect', 'text')
            .attr('x', bbox.x - padding)
            .attr('y', bbox.y - padding / 2)
            .attr('width', bbox.width + padding * 2)
            .attr('height', bbox.height + padding)
            .attr('fill', '#fff')
            .attr('stroke', regionColors[d.region])
            .attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel))
            .attr('rx', getAdjustedPadding(4, currentZoomLevel));
        });
    }

    // Attach handlers to initial bubbles
    attachHoverHandlers(bubbles);

    // Function to update bubbles based on zoom level
    function updateBubbles(zoomLevel) {
      const visibleData = getVisibleData(zoomLevel);
      
      bubbles = bubblesGroup
        .selectAll('circle')
        .data(visibleData, d => d.isCluster ? `cluster-${d.name}` : d.name)
        .join(
          enter => enter.append('circle')
            .attr('cx', d => projection([d.lon, d.lat])[0])
            .attr('cy', d => projection([d.lon, d.lat])[1])
            .attr('r', 0)
            .attr('fill', d => regionColors[d.region])
            .attr('fill-opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, zoomLevel))
            .style('cursor', 'pointer')
            .call(enter => enter.transition().duration(400)
              .attr('r', d => getAdjustedRadius(d.papers, zoomLevel))),
          update => update
            .call(update => update.transition().duration(400)
              .attr('cx', d => projection([d.lon, d.lat])[0])
              .attr('cy', d => projection([d.lon, d.lat])[1])
              .attr('r', d => getAdjustedRadius(d.papers, zoomLevel))
              .attr('fill', d => regionColors[d.region])),
          exit => exit
            .call(exit => exit.transition().duration(400)
              .attr('r', 0)
              .remove())
        );
      
      // Reattach hover handlers to updated bubbles
      attachHoverHandlers(bubbles);
    }

    // Legend - only show regions present in data
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`)
      .attr('opacity', 0);

    // Filter to only regions present in data
    const presentRegions = new Set(data.map(d => d.region));
    const legendData = Object.entries(regionColors)
      .filter(([region]) => presentRegions.has(region));

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
      .attr('r', d => getAdjustedRadius(d.papers, currentZoomLevel));

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

    // ========================================================================
    // ZOOM AND PAN FUNCTIONALITY
    // ========================================================================
    
    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
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
        
        // Update clustering based on zoom level
        const newZoomLevel = event.transform.k;
        
        // Check if we crossed a clustering threshold
        const oldClusterType = currentZoomLevel < 2.0 ? 'region' : 
                               currentZoomLevel < 4.0 ? 'country' : 'individual';
        const newClusterType = newZoomLevel < 2.0 ? 'region' : 
                               newZoomLevel < 4.0 ? 'country' : 'individual';
        
        if (oldClusterType !== newClusterType) {
          // Clustering threshold crossed - rebuild bubbles with new data
          currentZoomLevel = newZoomLevel;
          updateBubbles(newZoomLevel);
        } else {
          // No clustering change - just update bubble sizes smoothly
          currentZoomLevel = newZoomLevel;
          bubbles.transition().duration(200)
            .attr('r', d => getAdjustedRadius(d.papers, newZoomLevel))
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, newZoomLevel));
        }
      });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Click on background to close tooltips (for mobile)
    svg.on('click', function(event) {
      if (event.target === this || event.target.tagName === 'path' || event.target.tagName === 'rect') {
        g.selectAll('.hover-label').remove();
        bubbles
          .attr('fill-opacity', 0.7)
          .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel));
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
