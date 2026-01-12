/**
 * authors/plots/authorMetrics.js
 * Bubble scatter chart showing author metrics
 * X-axis: papers count, Y-axis: citations (symlog scale), Bubble size: awards
 *
 * Features:
 * - Symlog scale for Y-axis to handle wide range of citation counts
 * - Scaled bubble sizes based on awards
 * - Hover tooltip with full metrics + nominations (top3 by awards/citations/papers)
 * - Labels under selected circles + subtle darker stroke for notable names
 */

// Put images here:
// ../assets/img/authors/jeffrey-heer.jpg
// ../assets/img/authors/hanspeter-pfister.jpg
// ../assets/img/authors/john-stasko.jpg

import { authorMetricsData, authorMetricsStats } from '../../data/authors/authorMetricsData.js';
import {
  renderTitle,
  renderXAxis,
  renderYAxis,
  styleAxes,
  cleanAxes,
  renderLegend
} from '../../assets/js/chart-utils.js';
import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';

export const authorMetricsConfig = {
  data: authorMetricsData,
  margins: { top: 60, right: 40, bottom: 60, left: 80 },

  render: (ctx) => {
    const { g, d3, width, height, data, colors } = ctx;
    const animationDuration = ANIMATION_DURATION;

    // Category colors
    // darkmode friendly palette
    const categoryColors = {
      prolific: '#64B5F6',// #0D47A1
      'highly-cited': '#80DEEA',// #006064
      steady: '#C5CAE9',//#1A237E
      emerging: '#BCAAA4'//#3E2723
    };

    // ---- Notable (manual) ----
    const notableNames = [
      'Ben Shneiderman',
      'M. G. Bostock',
      'Martin Wattenberg',
      'Fernanda Viégas',
      'Jessica Hullman',
      'Daniel A. Keim',
      'Thomas Ertl',
      'Valerio Pascucci',
      'Claudio Silva'
    ];
    const notableSet = new Set(notableNames);

    // ---- Top 3 by: awards, citations, papers ----
    const top3 = (arr, key) =>
      [...arr].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0)).slice(0, 3);

    const topAwards = top3(data, 'awards');
    const topCitations = top3(data, 'citations');
    const topPapers = top3(data, 'papers');

    // Map: name -> nominations [{ metric, rank }]
    const nominationsByName = new Map();
    const addNomination = (d, metric, rank) => {
      if (!d?.name) return;
      if (!nominationsByName.has(d.name)) nominationsByName.set(d.name, []);
      const list = nominationsByName.get(d.name);
      if (!list.some((x) => x.metric === metric && x.rank === rank)) {
        list.push({ metric, rank });
      }
    };

    topAwards.forEach((d, i) => addNomination(d, 'awards', i + 1));
    topCitations.forEach((d, i) => addNomination(d, 'citations', i + 1));
    topPapers.forEach((d, i) => addNomination(d, 'papers', i + 1));

    const nominatedSet = new Set([...nominationsByName.keys()]);

    const rankLabel = (rank) => (rank === 1 ? 'Most' : rank === 2 ? '2nd Most' : '3rd Most');
    const medalIcon = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉');

    // Medal colors (fixed for clarity)
    const medalColors = {
      1: '#DAA520', // gold
      2: '#696969', // silver
      3: '#B87333'  // bronze
    };

    const metricLabel = (metric) => {
      if (metric === 'awards') return 'Awards';
      if (metric === 'citations') return 'Citations';
      return 'Papers';
    };

    // ---- Scales ----
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.papers) * 1.1])
      .range([0, width]);

    const yScale = d3
      .scaleSymlog()
      .constant(1000)
      .domain([0, d3.max(data, (d) => d.citations) * 1.1])
      .range([height, 0]);

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, authorMetricsStats.maxAwards])
      .range([2, 18]);

    const fmtInt = d3.format(',');
    const fmtCompact = d3.format('~s');

    // Stroke helper: darker for notable names
    const strokeFor = (d) => {
      const base = categoryColors[d.category];
      if (!notableSet.has(d.name)) return base;
      const c = d3.color(base);
      return c ? c.darker(0.8).formatHex() : base;
    };

    // ---- Draw bubbles ----
    const bubbles = g
      .selectAll('.bubble')
      .data(data)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', (d) => xScale(d.papers))
      .attr('cy', (d) => yScale(d.citations))
      .attr('r', 0)
      .attr('fill', (d) => categoryColors[d.category])
      .attr('fill-opacity', 0.6)
      .attr('stroke', (d) => strokeFor(d))
      .attr('stroke-width', (d) => (notableSet.has(d.name) ? 2.8 : 2))
      .style('cursor', 'pointer');

    // ---- Labels under selected circles (nominated + notable) ----
    const labelSet = new Set([...nominatedSet, ...notableSet]);
    const labeledData = data.filter((d) => labelSet.has(d.name));

    const labelsG = g.append('g').attr('class', 'bubble-labels');

    labelsG
      .selectAll('.bubble-name')
      .data(labeledData)
      .join('text')
      .attr('class', 'bubble-name')
      .attr('x', (d) => xScale(d.papers))
      .attr('y', (d) => yScale(d.citations) + sizeScale(d.awards) + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10.5px')
      .attr('font-weight', (d) => (notableSet.has(d.name) ? '700' : '600'))
      .attr('fill', colors.accent)
      .attr('paint-order', 'stroke')
      .attr('stroke', colors.surface)
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .style('pointer-events', 'none')
      .text((d) => d.name);

    // ---- Hover tooltip ----
    const removeTooltip = () => {
      g.selectAll('.hover-tooltip').remove();
    };

    bubbles
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', notableSet.has(d.name) ? 3.3 : 3);

        removeTooltip();

        const tooltip = g.append('g')
          .attr('class', 'hover-tooltip')
          .style('pointer-events', 'none');

        const lines = [];
        lines.push({ text: d.name, type: 'title' });
        lines.push({ text: `Total papers: ${fmtInt(d.papers)}`, type: 'body' });
        lines.push({ text: `Total citations: ${fmtInt(Math.round(d.citations))}`, type: 'body' });
        if ((d.awards ?? 0) > 0) lines.push({ text: `Total awards: ${fmtInt(d.awards)}`, type: 'body' });

        const nominations = nominationsByName.get(d.name);
        if (nominations && nominations.length) {
          const sorted = [...nominations].sort((a, b) => a.rank - b.rank || a.metric.localeCompare(b.metric));
          lines.push({ text: '', type: 'gap' });
          sorted.forEach((n) => {
            lines.push({
              text: `${medalIcon(n.rank)} ${rankLabel(n.rank)} ${metricLabel(n.metric)}`,
              type: 'nomination',
              rank: n.rank
            });
          });
        }

        const cx = xScale(d.papers);
        const cy = yScale(d.citations);
        const r = sizeScale(d.awards);

        // Build text in local coords (0,0)
        const text = tooltip
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px');

        lines.forEach((line, i) => {
          const tspan = text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? '0em' : '1.25em')
            .attr('font-weight', line.type === 'title' ? '800' : '500')
            .attr('fill', line.type === 'nomination' ? medalColors[line.rank] : colors.onSurface);

          if (line.type === 'gap') {
            tspan.attr('font-size', '9px').attr('fill', colors.onSurfaceVariant).text(' ');
          } else {
            tspan.text(line.text);
          }
        });

        const padding = 8;
        const bbox = text.node().getBBox();

        // Background rect (local coords)
        tooltip
          .insert('rect', 'text')
          .attr('x', bbox.x - padding)
          .attr('y', bbox.y - padding)
          .attr('width', bbox.width + padding * 2)
          .attr('height', bbox.height + padding * 2)
          .attr('rx', 8)
          .attr('fill', colors.surfaceContainer)
          .attr('stroke', strokeFor(d))
          .attr('stroke-width', 1.2)
          .attr('opacity', 0.98);

        // Position (above bubble) + clamp
        let tx = cx;
        let ty = cy - r - 12;

        const left = tx + (bbox.x - padding);
        const right = tx + (bbox.x + bbox.width + padding);
        const top = ty + (bbox.y - padding);
        const bottom = ty + (bbox.y + bbox.height + padding);

        if (left < 0) tx += -left + 2;
        if (right > width) tx -= (right - width) + 2;
        if (top < 0) ty += -top + 2;
        if (bottom > height) ty -= (bottom - height) + 2;

        tooltip.attr('transform', `translate(${tx}, ${ty})`);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.6)
          .attr('stroke-width', notableSet.has(d.name) ? 2.8 : 2);

        removeTooltip();
      });

    // ---- Axes ----
    renderTitle(ctx, 'Author Impact Metrics');
    renderXAxis(ctx, xScale, { label: 'Number of Papers' });

    // Y axis: remove "0" tick; format like 1k, 2k, ...
    // Y axis: 1k, 2k, 3k, ...
    // Y axis: 1k, 2k, 3k, ... (NASCONDI l’ultimo tick)
    const maxY = yScale.domain()[1];
    const maxK = Math.floor(maxY / 1000);

    const yTicks = d3.range(1, maxK + 1).map((k) => k * 1000).slice(0, -1);

    renderYAxis(ctx, yScale, {
      label: 'Total Citations',
      tickValues: yTicks,
      tickFormat: (t) => `${Math.round(t / 1000)}k`
    });

    styleAxes(g);
    cleanAxes(g);
    
    // ---- Legend (Custom with Circles) ----
    const legendItems = Object.entries(authorMetricsStats.categories).map(([category, description]) => ({
      color: categoryColors[category],
      label: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${description}`
    }));

    // 1. Crea un gruppo per la legenda posizionato dove vuoi (es. in alto a destra)
    const legendGroup = g.append('g')
      .attr('class', 'chart-legend')
      .attr('transform', `translate(${width - 250}, 0)`); // Regola 250 per spostare destra/sinistra

    // 2. Crea le righe per ogni elemento
    const legendRows = legendGroup.selectAll('.legend-row')
      .data(legendItems)
      .join('g')
      .attr('class', 'legend-row')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`); // 25px è lo spazio verticale tra le righe

    // 3. DISEGNA IL CERCHIO (invece del quadrato)
    legendRows.append('circle')
      .attr('cx', 6)      // Centro X
      .attr('cy', 6)      // Centro Y (per allinearlo al testo)
      .attr('r', 6)       // Raggio del cerchio (dimensione)
      .attr('fill', d => d.color)
      .attr('stroke', 'none'); // O aggiungi un bordo se serve

    // 4. Aggiungi il testo accanto
    legendRows.append('text')
      .attr('x', 20)      // Spazio tra cerchio e testo
      .attr('y', 10)      // Allineamento verticale visivo (circa metà altezza riga)
      .attr('font-size', '12px')
      .attr('fill', colors.onSurfaceVariant) // Usa il colore del testo corretto
      .text(d => d.label);

    // ---------------------------------------------------------
    // SE NON TI SERVE LA "SIZE LEGEND" (Award Bubble), 
    // CANCELLA TUTTO IL CODICE SOTTO QUESTA RIGA FINO A "ANIMATE"
    // ---------------------------------------------------------

    // (Qui c'era il codice const sizeLegend = ... che devi rimuovere se non vuoi la legenda delle bolle)

    // ---- Animate (Resta uguale) ----
    bubbles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 20)
      .attr('r', (d) => sizeScale(d.awards));

    // ---- Size legend ----
    const sizeLegend = g.append('g').attr('class', 'size-legend').attr('opacity', 0);

    const sizeLegendData = [
      { awards: 1, label: '1' },
      { awards: 3, label: '3' },
      { awards: 5, label: '5' },
      { awards: 8, label: '8' },
      { awards: 10, label: '10' }
    ];

    sizeLegend
      .append('text')
      .attr('x', width - 320)
      .attr('y', height - 75)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', colors.onSurface)
      .text('Award Count:');

    const sizeLegendItems = sizeLegend
      .selectAll('.size-legend-item')
      .data(sizeLegendData)
      .join('g')
      .attr('class', 'size-legend-item')
      .attr('transform', (d, i) => `translate(${width - 310 + i * 60}, ${height - 50})`);

    sizeLegendItems
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', (d) => sizeScale(d.awards))
      .attr('fill', colors.accent)
      .attr('fill-opacity', 0.3)
      .attr('stroke', colors.accent)
      .attr('stroke-width', 2);

    sizeLegendItems
      .append('text')
      .attr('x', 0)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', colors.onSurfaceVariant)
      .text((d) => d.label);

    // ---- Animate ----
    bubbles
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 20)
      .attr('r', (d) => sizeScale(d.awards));

    sizeLegend
      .transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);
  }
};
