/**
 * authors/plots/collaborationNetwork.js
 * Force-directed network graph showing author collaborations
 *
 * Features:
 * - Force-directed layout with drag interaction
 * - Zoom and pan with buttons (wheel disabled to avoid scroll conflicts)
 * - Fixed title and legend that don't transform with zoom
 * - Node sizes scale inversely with zoom to reduce clutter
 * - Interactive tooltips with richer author info
 *
 * Additions:
 * - Full-name labels for TOP 10 most collaborative authors (by d.collaborations)
 * - Tooltip nomination for TOP 3 with medal icons + highlighted text
 * - TOP 3 nodes have slightly darker stroke (and slightly thicker stroke)
 */

import { collaborationNetworkData, networkStats } from '../../data/authors/collaborationNetworkData.js';
import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';

export const collaborationNetworkConfig = {
  data: collaborationNetworkData,
  margins: { top: 60, right: 40, bottom: 40, left: 40 },

  render: (ctx) => {
    const { g, d3, width, height, colors, svg } = ctx;
    const animationDuration = ANIMATION_DURATION;

    // -----------------------------
    // Helpers
    // -----------------------------
    let currentZoomLevel = 1.0;

    function getAdjustedRadius(collaborations, zoomLevel) {
      const c = Number.isFinite(Number(collaborations)) ? Number(collaborations) : 0;
      const baseRadius = Math.sqrt(Math.max(c, 0)) / 2 + 3;
      const scaleFactor = 1.0 - (zoomLevel - 1) * 0.2125; // 1.0 -> 0.15 from 1x to 5x
      return baseRadius * Math.max(scaleFactor, 0.15);
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

    function fmtNum(x) {
      const n = Number(x);
      return Number.isFinite(n) ? n.toLocaleString() : 'N/A';
    }

    function safeText(x, fallback = 'N/A') {
      if (x === null || x === undefined) return fallback;
      const s = String(x).trim();
      return s.length ? s : fallback;
    }

    function darken(colorStr, k = 0.35) {
      const c = d3.color(colorStr);
      if (!c) return colorStr;
      return c.darker(k).formatHex();
    }

    // -----------------------------
    // Group colors (dynamic)
    // -----------------------------
    const groupIds = Array.from(
      new Set(collaborationNetworkData.nodes.map((n) => n.group))
    ).sort((a, b) => Number(a) - Number(b));

    const palette = d3.schemeTableau10 || d3.schemeCategory10 || null;

    const groupColorScale = d3.scaleOrdinal()
      .domain(groupIds)
      .range(
        palette
          ? groupIds.map((_, i) => palette[i % palette.length])
          : groupIds.map((_, i) => d3.interpolateRainbow(i / Math.max(groupIds.length, 1)))
      );

    // -----------------------------
    // Ranking: TOP 10 labels + TOP 3 nominations (by collaborations)
    // -----------------------------
    const rankedByCollab = [...collaborationNetworkData.nodes]
      .sort((a, b) => (Number(b.collaborations) || 0) - (Number(a.collaborations) || 0));

    const top10Ids = new Set(rankedByCollab.slice(0, 10).map((d) => d.id));
    const top3Map = new Map();
    rankedByCollab.slice(0, 3).forEach((d, i) => top3Map.set(d.id, i + 1)); // 1,2,3

    function getNomination(d) {
      const rank = top3Map.get(d.id);
      if (!rank) return null;

      if (rank === 1) return { medal: '🥇', label: 'Most collaborative author', fill: colors.primary };
      if (rank === 2) return { medal: '🥈', label: '2nd Most collaborative author', fill: colors.secondary };
      return { medal: '🥉', label: '3rd Most collaborative author', fill: colors.accent };
    }

    // -----------------------------
    // Top collaborator fallback (max weight edge)
    // -----------------------------
    const getNodeId = (x) => (typeof x === 'string' ? x : x?.id);

    const topByName = new Map(); // name -> { name, weight }
    {
      const best = new Map(); // name -> { other, w }
      for (const l of collaborationNetworkData.links) {
        const a = getNodeId(l.source);
        const b = getNodeId(l.target);
        const w = Number(l.value) || 1;
        if (!a || !b) continue;

        const curA = best.get(a);
        if (!curA || w > curA.w) best.set(a, { other: b, w });

        const curB = best.get(b);
        if (!curB || w > curB.w) best.set(b, { other: a, w });
      }
      for (const [k, v] of best.entries()) topByName.set(k, { name: v.other, weight: v.w });
    }

    function getTopCollaboratorLabel(d) {
      const name = d.top_collaborator || topByName.get(d.id)?.name;
      const weight = d.top_collaborator_weight ?? topByName.get(d.id)?.weight;
      if (!name) return 'N/A';
      const w = Number(weight);
      return Number.isFinite(w) ? `${name} (${w})` : String(name);
    }

    // -----------------------------
    // Force simulation
    // -----------------------------
    const simulation = d3
      .forceSimulation(collaborationNetworkData.nodes)
      .force(
        'link',
        d3.forceLink(collaborationNetworkData.links)
          .id((d) => d.id)
          .distance((d) => 100 - (Number(d.value) || 0) * 2)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    // -----------------------------
    // Links
    // -----------------------------
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(collaborationNetworkData.links)
      .join('line')
      .attr('stroke', colors.outline)
      .attr('stroke-opacity', 0)
      .attr('stroke-width', (d) => Math.sqrt(Number(d.value) || 1));

    // -----------------------------
    // Tooltip
    // -----------------------------
    function removeTooltip() {
      g.selectAll('.node-tooltip').remove();
    }

    function showTooltip(d) {
      removeTooltip();

      const tooltip = g.append('g')
        .attr('class', 'node-tooltip')
        .style('pointer-events', 'none');
      const r = getAdjustedRadius(d.collaborations, currentZoomLevel);
      const baseY = d.y - r - getAdjustedPadding(14, currentZoomLevel);

      const text = tooltip.append('text')
        .attr('x', d.x)
        .attr('y', baseY)
        .attr('text-anchor', 'middle')
        .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
        .attr('font-weight', 'bold')
        .attr('fill', colors.onSurface);

      const nomination = getNomination(d);
      if (nomination) {
        text.append('tspan')
          .attr('x', d.x)
          .attr('dy', 0)
          .attr('font-size', `${getAdjustedFontSize(12, currentZoomLevel)}px`)
          .attr('font-weight', 'bold')
          .attr('fill', nomination.fill)
          .text(`${nomination.medal} ${nomination.label}`);

        text.append('tspan')
          .attr('x', d.x)
          .attr('dy', '1.35em')
          .attr('fill', colors.onSurface)
          .text(safeText(d.id));
      } else {
        text.append('tspan')
          .attr('x', d.x)
          .attr('dy', 0)
          .text(safeText(d.id));
      }

      // Institution + Country
      {
        const inst = safeText(d.institution, 'Unknown institution');
        const country = safeText(d.country, 'Unknown country');
        text.append('tspan')
          .attr('x', d.x)
          .attr('dy', '1.25em')
          .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
          .attr('font-weight', 'normal')
          .attr('fill', colors.onSurfaceVariant)
          .text(`${inst} • ${country}`);
      }

      // Papers / Citations / Awards
      {
        const line = text.append('tspan')
          .attr('x', d.x)
          .attr('dy', '1.2em')
          .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
          .attr('font-weight', 'normal')
          .attr('fill', colors.onSurfaceVariant);

        line.append('tspan').attr('font-weight', 'bold').text(fmtNum(d.papers));
        line.append('tspan').attr('font-weight', 'normal').text(' papers');

        line.append('tspan').text(' • ');
        line.append('tspan').attr('font-weight', 'bold').text(fmtNum(d.citations));
        line.append('tspan').attr('font-weight', 'normal').text(' citations');

        line.append('tspan').text(' • ');
        line.append('tspan').attr('font-weight', 'bold').text(fmtNum(d.awards));
        line.append('tspan').attr('font-weight', 'normal').text(' awards');
      }

      // Collaborations
      {
        const line = text.append('tspan')
          .attr('x', d.x)
          .attr('dy', '1.2em')
          .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
          .attr('font-weight', 'normal')
          .attr('fill', colors.onSurfaceVariant);

        line.append('tspan').attr('font-weight', 'bold').text(fmtNum(d.collaborations));
        line.append('tspan').attr('font-weight', 'normal').text(' collaborations');
      }

      // Top collaborator
      {
        text.append('tspan')
          .attr('x', d.x)
          .attr('dy', '1.2em')
          .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
          .attr('font-weight', 'normal')
          .attr('fill', colors.onSurfaceVariant)
          .text(`Top collaborator: ${getTopCollaboratorLabel(d)}`);
      }

      // Background
      const bbox = text.node().getBBox();
      const padding = getAdjustedPadding(7, currentZoomLevel);

      tooltip.insert('rect', 'text')
        .attr('x', bbox.x - padding)
        .attr('y', bbox.y - padding / 2)
        .attr('width', bbox.width + padding * 2)
        .attr('height', bbox.height + padding)
        .attr('fill', colors.surfaceContainer)
        .attr('stroke', groupColorScale(d.group))
        .attr('stroke-width', getAdjustedStrokeWidth(2, currentZoomLevel))
        .attr('rx', getAdjustedPadding(4, currentZoomLevel));
    }

    // -----------------------------
    // Nodes (TOP 3 have darker border)
    // -----------------------------
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(collaborationNetworkData.nodes)
      .join('circle')
      .attr('r', 0)
      .attr('fill', (d) => groupColorScale(d.group))
      .attr('stroke', (d) => {
        const isTop3 = top3Map.has(d.id);
        if (!isTop3) return colors.surfaceContainer;
        return darken(groupColorScale(d.group), 0.35);
      })
      .attr('stroke-width', (d) => (top3Map.has(d.id) ? 2.5 : 2))
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', getAdjustedStrokeWidth(top3Map.has(d.id) ? 4.5 : 4, currentZoomLevel));

        showTooltip(d);
      })
      .on('mouseleave', function () {
        const d = this.__data__;
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', getAdjustedStrokeWidth(top3Map.has(d?.id) ? 2.5 : 2, currentZoomLevel));

        removeTooltip();
      })
      .on('click', function (event, d) {
        event.stopPropagation();
        removeTooltip();

        node.attr('stroke-width', (nd) =>
          getAdjustedStrokeWidth(top3Map.has(nd.id) ? 2.5 : 2, currentZoomLevel)
        );

        d3.select(this)
          .attr('stroke-width', getAdjustedStrokeWidth(top3Map.has(d.id) ? 4.5 : 4, currentZoomLevel));

        showTooltip(d);
      })
      .call(
        d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // -----------------------------
    // Labels: full name for TOP 10
    // -----------------------------
    const labels = g
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(collaborationNetworkData.nodes.filter((d) => top10Ids.has(d.id)))
      .join('text')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .attr('fill', colors.onSurface)
      .attr('opacity', 0)
      .text((d) => safeText(d.id));

    // -----------------------------
    // Fixed overlay
    // -----------------------------
    const margins = ctx.margins || { top: 60, right: 40, bottom: 40, left: 40 };
    const fixedGroup = svg.append('g')
      .attr('class', 'fixed-overlay')
      .attr('transform', `translate(${margins.left}, ${margins.top})`);

    fixedGroup.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurface)
      .text('Author Collaboration Network');

    // Legend (dynamic groups)
    const legend = fixedGroup.append('g')
      .attr('class', 'legend')
      .attr('opacity', 0);

    const groupsObj = networkStats?.groups || {};
    const legendData = Object.keys(groupsObj)
      .map((k) => ({ group: Number(k), label: groupsObj[k] }))
      .sort((a, b) => a.group - b.group);

    const legendItems = legend
      .selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${width - 260}, ${30 + i * 22})`);

    legendItems.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', (d) => groupColorScale(d.group))
      .attr('stroke', colors.surfaceContainer)
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('fill', colors.onSurface)
      .text((d) => d.label);

    // -----------------------------
    // Tick update
    // -----------------------------
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      labels
        .attr('x', (d) => d.x + getAdjustedRadius(d.collaborations, currentZoomLevel) + 6 / currentZoomLevel)
        .attr('y', (d) => d.y + 4 / currentZoomLevel)
        .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`);
    });

    // Drag
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

    // Animate in
    link
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 10)
      .attr('stroke-opacity', 0.6);

    node
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 10)
      .attr('r', (d) => getAdjustedRadius(d.collaborations, currentZoomLevel));

    labels
      .transition()
      .delay(animationDuration + 200)
      .duration(400)
      .attr('opacity', 1);

    legend
      .transition()
      .delay(1000)
      .duration(400)
      .attr('opacity', 1);

    // Zoom & pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .filter((event) => {
        if (event.type === 'wheel') return false;
        if (event.type === 'dblclick') return false;
        return !event.button;
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        currentZoomLevel = event.transform.k;

        node
          .attr('r', (d) => getAdjustedRadius(d.collaborations, currentZoomLevel))
          .attr('stroke-width', (d) =>
            getAdjustedStrokeWidth(top3Map.has(d.id) ? 2.5 : 2, currentZoomLevel)
          );

        link.attr('stroke-width', (d) =>
          getAdjustedStrokeWidth(Math.sqrt(Number(d.value) || 1), currentZoomLevel)
        );

        labels
          .attr('font-size', `${getAdjustedFontSize(11, currentZoomLevel)}px`)
          .attr('x', (d) => d.x + getAdjustedRadius(d.collaborations, currentZoomLevel) + 6 / currentZoomLevel)
          .attr('y', (d) => d.y + 4 / currentZoomLevel);
      });

    svg.call(zoom);

    svg.on('click', function (event) {
      if (event.target === this || event.target.tagName === 'rect') {
        removeTooltip();
        node.attr('stroke-width', (d) =>
          getAdjustedStrokeWidth(top3Map.has(d.id) ? 2.5 : 2, currentZoomLevel)
        );
      }
    });

    // Zoom controls
    const zoomControls = fixedGroup.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${width - 10}, 80)`);

    const zoomInBtn = zoomControls.append('g')
      .attr('class', 'zoom-btn')
      .style('cursor', 'pointer')
      .on('click', () => svg.transition().duration(300).call(zoom.scaleBy, 1.3));

    zoomInBtn.append('circle')
      .attr('r', 18)
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    zoomInBtn.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text('+');

    const zoomOutBtn = zoomControls.append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 45)')
      .style('cursor', 'pointer')
      .on('click', () => svg.transition().duration(300).call(zoom.scaleBy, 0.77));

    zoomOutBtn.append('circle')
      .attr('r', 18)
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    zoomOutBtn.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.primary)
      .text('−');

    const resetBtn = zoomControls.append('g')
      .attr('class', 'zoom-btn')
      .attr('transform', 'translate(0, 90)')
      .style('cursor', 'pointer')
      .on('click', () => svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity));

    resetBtn.append('circle')
      .attr('r', 18)
      .attr('fill', colors.surfaceContainer)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2);

    resetBtn.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '14px')
      .attr('fill', colors.primary)
      .text('⟲');

    zoomControls.append('text')
      .attr('x', -10)
      .attr('y', 130)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', colors.onSurfaceVariant)
      .attr('opacity', 0)
      .text('Use buttons to zoom')
      .transition()
      .delay(1500)
      .duration(400)
      .attr('opacity', 1);
  }
};
