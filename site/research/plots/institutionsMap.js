/**
 * research/plots/institutionsMap.js
 * Bubble map showing research institutions globally
 */

import { institutionsMapData, institutionsMapStats } from '../../data/research/institutionsMapData.js';
import { regionColors } from '../../assets/js/color-palettes.js';

export const institutionsMapConfig = {
  data: institutionsMapData,
  margins: { top: 40, right: 40, bottom: 40, left: 40 },

  render: async (ctx) => {
    const { g, d3, width, height, data, colors, svg } = ctx;
    const animationDuration = 800;

    // Load world GeoJSON
    const worldData = await d3.json('../data/world.geojson');

    // Create projection
    const projection = d3.geoNaturalEarth1().fitSize([width, height * 0.95], worldData);
    const path = d3.geoPath().projection(projection);

    // Draw world map
    const mapGroup = g.append('g').attr('class', 'world-map');

    mapGroup
      .selectAll('path')
      .data(worldData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', colors.onSurfaceVariant)
      .attr('stroke', colors.outlineVariant)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0)
      .transition()
      .duration(animationDuration)
      .attr('opacity', 1);

    // Size scale for bubbles
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.papers) || 0])
      .range([3, 25]);

    function getAdjustedRadius(papers, zoomLevel) {
      const baseRadius = sizeScale(papers);
      const scaleFactor = 1.0 - (zoomLevel - 1) * 0.18;
      return baseRadius * Math.max(scaleFactor, 0.1);
    }

    function getAdjustedFontSize(baseFontSize, zoomLevel) {
      return baseFontSize / zoomLevel;
    }

    function getAdjustedStrokeWidth(baseStrokeWidth, zoomLevel) {
      return baseStrokeWidth / zoomLevel;
    }

    function getAdjustedPadding(basePadding, zoomLevel) {
      return basePadding / zoomLevel;
    }

    // ========================================================================
    // CLUSTERING FUNCTIONS
    // ========================================================================

    // Deterministic jitter function - generates consistent offset based on name
    function getJitter(name, axis) {
      let hash = 0;
      const salt = axis === 'x' ? 17 : 31;
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash + name.charCodeAt(i) * salt) | 0;
      }
      // normalize remainder to [0,199] then map to [-1,1]
      const m = ((hash % 200) + 200) % 200;
      return m / 100 - 1;
    }

    function clusterByRegion(institutions) {
      const regionMap = d3.rollup(
        institutions,
        (v) => ({
          papers: d3.sum(v, (d) => d.papers),
          institutions: v.length,
          members: v.map((d) => d.name),
        }),
        (d) => d.region
      );

      return Array.from(regionMap, ([region, stats]) => {
        const members = institutions.filter((d) => d.region === region);
        return {
          name: region,
          region,
          lat: d3.mean(members, (d) => d.lat),
          lon: d3.mean(members, (d) => d.lon),
          papers: stats.papers,
          institutions: stats.institutions,
          isCluster: true,
          clusterType: 'region',
          members: stats.members,
        };
      });
    }

    function clusterByCountry(institutions) {
      const countryMap = d3.rollup(
        institutions,
        (v) => ({
          papers: d3.sum(v, (d) => d.papers),
          institutions: v.length,
          members: v.map((d) => d.name),
          region: v[0]?.region,
        }),
        (d) => d.country
      );

      return Array.from(countryMap, ([country, stats]) => {
        const members = institutions.filter((d) => d.country === country);
        return {
          name: country,
          country,
          region: stats.region,
          lat: d3.mean(members, (d) => d.lat),
          lon: d3.mean(members, (d) => d.lon),
          papers: stats.papers,
          institutions: stats.institutions,
          isCluster: true,
          clusterType: 'country',
          members: stats.members,
        };
      });
    }

    function getVisibleData(zoomLevel) {
      if (zoomLevel < 2.0) return clusterByRegion(data);
      if (zoomLevel < 4.0) return clusterByCountry(data);
      return data.map((d) => ({ ...d, isCluster: false }));
    }

    // Draw institution bubbles
    const bubblesGroup = g.append('g').attr('class', 'institutions');

    let currentZoomLevel = 1.0;

    let bubbles = bubblesGroup
      .selectAll('circle')
      .data(getVisibleData(currentZoomLevel), (d) => (d.isCluster ? `cluster-${d.name}` : d.name))
      .join('circle')
      .attr('cx', (d) => projection([d.lon, d.lat])[0] + (d.isCluster ? 0 : getJitter(d.name, 'x')))
      .attr('cy', (d) => projection([d.lon, d.lat])[1] + (d.isCluster ? 0 : getJitter(d.name, 'y')))
      .attr('r', 0)
      .attr('fill', (d) => (regionColors[d.region]?.default ?? '#9ca3af'))
      .attr('fill-opacity', 0.7)
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel))
      .style('cursor', 'pointer');

    function attachHoverHandlers(bubbleSelection) {
      bubbleSelection
        .on('mouseenter', function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', 1)
            .attr('stroke', colors.surfaceContainer)
            .attr('stroke-width', getAdjustedStrokeWidth(3, currentZoomLevel));

          const [x, y] = projection([d.lon, d.lat]);
          const label = g.append('g').attr('class', 'hover-label');

          const text = label
            .append('text')
            .attr('x', x)
            .attr('y', y - getAdjustedRadius(d.papers, currentZoomLevel) - 12)
            .attr('text-anchor', 'middle')
            .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
            .attr('font-weight', 'bold')
            .attr('fill', colors.onSurface);

          text.append('tspan').attr('x', x).attr('dy', 0).text(d.name);

          const pct = ((d.papers / institutionsMapStats.totalPapers) * 100).toFixed(1);

          const detailSpan = text
            .append('tspan')
            .attr('x', x)
            .attr('dy', '1.2em')
            .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
            .attr('fill', colors.onSurfaceVariant);

          if (d.isCluster) {
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.institutions} institutions`);
            detailSpan.append('tspan').attr('font-weight', 'normal').text(' | ');
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.papers} papers`);
            detailSpan.append('tspan').attr('font-weight', 'normal').text(` (${pct}%)`);
          } else {
            detailSpan.append('tspan').attr('font-weight', 'bold').text(`${d.papers} papers`);
            detailSpan.append('tspan').attr('font-weight', 'normal').text(` (${pct}%)`);
          }

          const bbox = text.node().getBBox();
          const padding = getAdjustedPadding(6, currentZoomLevel);

          label
            .insert('rect', 'text')
            .attr('x', bbox.x - padding)
            .attr('y', bbox.y - padding / 2)
            .attr('width', bbox.width + padding * 2)
            .attr('height', bbox.height + padding)
            .attr('fill', colors.surfaceContainer)
            .attr('stroke', regionColors[d.region]?.default ?? '#9ca3af')
            .attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel))
            .attr('rx', getAdjustedPadding(4, currentZoomLevel));
        })
        .on('mouseleave', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', 0.7)
            .attr('stroke', colors.surfaceContainer)
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel));

          g.selectAll('.hover-label').remove();
        })
        .on('click', function (event) {
          event.stopPropagation();

          g.selectAll('.hover-label').remove();

          bubbleSelection
            .attr('fill-opacity', 0.7)
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel));

          d3.select(this).attr('fill-opacity', 1).attr('stroke-width', getAdjustedStrokeWidth(3, currentZoomLevel));
        });
    }

    attachHoverHandlers(bubbles);

    function updateBubbles(zoomLevel) {
      const visibleData = getVisibleData(zoomLevel);

      bubbles = bubblesGroup
        .selectAll('circle')
        .data(visibleData, (d) => (d.isCluster ? `cluster-${d.name}` : d.name))
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr('cx', (d) => projection([d.lon, d.lat])[0] + (d.isCluster ? 0 : getJitter(d.name, 'x')))
              .attr('cy', (d) => projection([d.lon, d.lat])[1] + (d.isCluster ? 0 : getJitter(d.name, 'y')))
              .attr('r', 0)
              .attr('fill', (d) => (regionColors[d.region]?.default ?? '#9ca3af'))
              .attr('fill-opacity', 0.7)
              .attr('stroke', colors.surfaceContainer)
              .attr('stroke-width', getAdjustedStrokeWidth(1.5, zoomLevel))
              .style('cursor', 'pointer')
              .call((sel) =>
                sel
                  .transition()
                  .duration(400)
                  .attr('r', (d) => getAdjustedRadius(d.papers, zoomLevel))
              ),
          (update) =>
            update.call((sel) =>
              sel
                .transition()
                .duration(400)
                .attr('cx', (d) => projection([d.lon, d.lat])[0] + (d.isCluster ? 0 : getJitter(d.name, 'x')))
                .attr('cy', (d) => projection([d.lon, d.lat])[1] + (d.isCluster ? 0 : getJitter(d.name, 'y')))
                .attr('r', (d) => getAdjustedRadius(d.papers, zoomLevel))
                .attr('fill', (d) => (regionColors[d.region]?.default ?? '#9ca3af'))
                .attr('stroke-width', getAdjustedStrokeWidth(1.5, zoomLevel))
            ),
          (exit) =>
            exit.call((sel) =>
              sel
                .transition()
                .duration(400)
                .attr('r', 0)
                .remove()
            )
        );

      attachHoverHandlers(bubbles);
    }

    // Fixed overlay (not zoomed)
    const margins = ctx.margins || { top: 40, right: 40, bottom: 40, left: 40 };
    const fixedGroup = svg
      .append('g')
      .attr('class', 'fixed-overlay')
      .attr('transform', `translate(${margins.left}, ${margins.top})`);

    fixedGroup
      .append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurface)
      .text('Global Distribution of Visualization Research Institutions');

    // Legend
    const legend = fixedGroup
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(10, ${height - 200})`)
      .attr('opacity', 0);

    const presentRegions = new Set(data.map((d) => d.region));
    const legendData = Object.entries(regionColors).filter(([region]) => presentRegions.has(region));

    const legendItems = legend
      .selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 22})`);

    legendItems
      .append('rect')
      .attr('x', 0)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', (d) => (d[1]?.default ?? '#9ca3af'))
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 1.5)
      .attr('rx', 3);

    legendItems
      .append('text')
      .attr('x', 22)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', colors.onSurface)
      .text((d) => `${d[0]}: ${institutionsMapStats.regions[d[0]] || 0}`);

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', -15)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurfaceVariant)
      .text('Institutions per Region');

    const statsText = fixedGroup
      .append('g')
      .attr('class', 'stats-text')
      .attr('transform', `translate(${width - 90}, 30)`)
      .attr('opacity', 0);

    statsText
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurface)
      .text(`${institutionsMapStats.totalInstitutions} institutions`);

    statsText
      .append('text')
      .attr('x', 0)
      .attr('y', 18)
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('fill', colors.onSurfaceVariant)
      .text(`${institutionsMapStats.totalPapers.toLocaleString()} papers`);

    // Animate bubbles + UI
    bubbles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 30)
      .attr('r', (d) => getAdjustedRadius(d.papers, currentZoomLevel));

    legend.transition().delay(animationDuration).duration(400).attr('opacity', 1);
    statsText.transition().delay(animationDuration + 200).duration(400).attr('opacity', 1);

    // ========================================================================
    // ZOOM AND PAN FUNCTIONALITY
    // ========================================================================

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .filter((event) => {
        if (event.type === 'wheel') return false;
        if (event.type === 'dblclick') return false;
        return !event.button; // pan only with left-click drag
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);

        const newZoomLevel = event.transform.k;

        const oldClusterType =
          currentZoomLevel < 2.0 ? 'region' : currentZoomLevel < 4.0 ? 'country' : 'individual';
        const newClusterType = newZoomLevel < 2.0 ? 'region' : newZoomLevel < 4.0 ? 'country' : 'individual';

        currentZoomLevel = newZoomLevel;

        if (oldClusterType !== newClusterType) {
          updateBubbles(newZoomLevel);
        } else {
          bubbles
            .transition()
            .duration(200)
            .attr('r', (d) => getAdjustedRadius(d.papers, newZoomLevel))
            .attr('stroke-width', getAdjustedStrokeWidth(1.5, newZoomLevel));
        }
      });

    svg.call(zoom);

    // Click on background to close tooltips (for mobile)
    svg.on('click', function (event) {
      const tag = event.target?.tagName ? event.target.tagName.toLowerCase() : '';
      if (event.target === this || tag === 'path' || tag === 'rect') {
        g.selectAll('.hover-label').remove();
        bubbles
          .attr('fill-opacity', 0.7)
          .attr('fill', (d) => (regionColors[d.region]?.default ?? '#9ca3af'))
          .attr('stroke', colors.surfaceContainer)
          .attr('stroke-width', getAdjustedStrokeWidth(1.5, currentZoomLevel));
      }
    });

    // ========================================================================
    // ZOOM CONTROL BUTTONS (FIXED OVERLAY)
    // ========================================================================

    const zoomControls = fixedGroup
      .append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${width - 50}, 40)`);

    const zoomInBtn = zoomControls
      .append('g')
      .attr('class', 'zoom-btn')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      });

    zoomInBtn
      .append('circle')
      .attr('r', 18)
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    zoomInBtn
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text('+');

    const zoomOutBtn = zoomControls
      .append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 45)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.77);
      });

    zoomOutBtn
      .append('circle')
      .attr('r', 18)
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    zoomOutBtn
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text('−');

    const resetBtn = zoomControls
      .append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 90)')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
      });

    resetBtn
      .append('circle')
      .attr('r', 18)
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    resetBtn
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '14px')
      .attr('fill', colors.primary)
      .text('⟲');
  },
};
