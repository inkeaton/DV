/**
 * papers/plots/awardsWaffleIcons.js
 * Waffle chart (single grid) using different emoji icons per award type.
 *
 * Update:
 * - Legend TOP-RIGHT, minimal style.
 * - Highlights dual-award papers (Test of Time + Best Paper) in BLACK.
 * - Highlights Replicability Stamp papers in GREEN.
 * - Shows title and year on hover
 * - Uses REAL data from awardsDetailByType
 */

import { awardsData, pictogramCellValue } from '../../data/papers/awardsData.js';
import { awardsDetailByType } from '../../data/papers/awardsDetailData.js';
import { renderTitle } from '../../assets/js/chart-utils.js';
import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';
import { awardColors } from '../../assets/js/color-palettes.js';

// Waffle uses slightly longer animation (900ms vs standard 800ms)
const WAFFLE_ANIMATION_DURATION = ANIMATION_DURATION + 100;

export const awardsWaffleIconsConfig = {
  data: awardsData,
  margins: { top: 60, right: 30, bottom: 70, left: 30 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;

    renderTitle(ctx, 'Awards by Type');

    const COLS = 23;
    const cellSize = 34;
    const cellPadding = 8;
    const iconFontSize = 28;

    const total = d3.sum(data, d => d.count);
    const pct = (count) => (count / total) * 100;
    const fmtPct = d3.format('.1f');

    const totalCells = Math.max(1, Math.ceil(total / pictogramCellValue));

    const maxColsFit = Math.max(1, Math.floor((width + cellPadding) / (cellSize + cellPadding)));
    const cols = Math.min(COLS, maxColsFit);
    const rows = Math.ceil(totalCells / cols);

    const gridW = cols * cellSize + (cols - 1) * cellPadding;
    const gridH = rows * cellSize + (rows - 1) * cellPadding;
    const offsetX = Math.max(0, (width - gridW) / 2);

    // --- POSIZIONAMENTO ---
    const shiftDown = 100; 
    const offsetY = Math.max(0, (height - gridH) / 2) + shiftDown;

    const cats = [...data]
      .map(d => ({
        ...d,
        color: awardColors[d.type] || 'var(--md-sys-color-primary)',
        exactCells: d.count / pictogramCellValue,
      }))
      .sort((a, b) => d3.descending(a.count, b.count));

    const base = cats.map(d => ({
      ...d,
      whole: Math.floor(d.exactCells),
      frac: d.exactCells - Math.floor(d.exactCells),
    }));

    const wholeSum = d3.sum(base, d => d.whole);
    const remaining = Math.max(0, totalCells - wholeSum);

    const fracSorted = [...base].sort((a, b) => d3.descending(a.frac, b.frac));
    const allocated = base.map(d => ({ ...d, cells: d.whole }));

    for (let i = 0; i < remaining; i++) {
      const pick = fracSorted[i % fracSorted.length];
      const idx = allocated.findIndex(x => x.type === pick.type);
      if (idx >= 0) allocated[idx].cells += 1;
    }

    // --- MAP CODE TO TYPE ---
    const codeToType = {
      'BP': 'Best Paper',
      'HM': 'Honorable Mention',
      'TT': 'Test of Time',
      'BA': 'Best Application Paper',
      'BCS': 'Best Case Study'
    };
    const typeToCode = Object.fromEntries(Object.entries(codeToType).map(([k,v]) => [v,k]));

    // --- GENERAZIONE CELLE CON DATI REALI ---
    const cells = [];
    let cursor = 0;

    for (const cat of allocated) {
      const code = typeToCode[cat.type] || cat.code;
      const detailData = awardsDetailByType[code];
      const papers = detailData ? detailData.papers : [];
      
      // Ordina per anno (dal più vecchio - così partiamo dal basso a sinistra con i più vecchi)
      const sortedPapers = [...papers].sort((a, b) => (a.year || 0) - (b.year || 0));

      for (let k = 0; k < cat.cells; k++) {
        if (cursor >= totalCells) break;

        const paper = sortedPapers[k] || null;
        
        let isDual = false;
        let isReplica = false;
        let specialMsg = '';
        let title = paper ? paper.title : '';
        let year = paper ? paper.year : null;

        // --- 1. LOGICA DUAL AWARDS (da dati reali) ---
        if (paper && paper.otherAwards && paper.otherAwards.length > 0) {
          isDual = true;
          const otherLabels = paper.otherAwardsLabels || paper.otherAwards.map(c => codeToType[c] || c);
          specialMsg = `★ Also received ${otherLabels.join(', ')}`;
        }

        // --- 2. LOGICA REPLICABILITY STAMP (da dati reali) ---
        if (paper && paper.hasGraphicsReplicabilityStamp) {
          isReplica = true;
          if (specialMsg) {
            specialMsg += ' | ✔ Graphics Replicability Stamp';
          } else {
            specialMsg = '✔ Graphics Replicability Stamp';
          }
        }

        cells.push({
          idx: cursor,
          type: cat.type,
          code: code,
          icon: cat.icon,
          count: cat.count,
          color: cat.color,
          isDual: isDual,
          isReplica: isReplica,
          specialMsg: specialMsg,
          title: title,
          year: year,
        });
        cursor++;
      }
      if (cursor >= totalCells) break;
    }

    const xOf = (i) => offsetX + (i % cols) * (cellSize + cellPadding);
    const yOf = (i) => {
      const r = Math.floor(i / cols);
      const inv = (rows - 1) - r;
      return offsetY + inv * (cellSize + cellPadding);
    };

    const grid = g.append('g').attr('class', 'waffle-grid');

    // background tiles
    grid.selectAll('rect.waffle-tile')
      .data(cells, d => d.idx)
      .enter()
      .append('rect')
      .attr('class', 'waffle-tile')
      .attr('x', d => xOf(d.idx))
      .attr('y', d => yOf(d.idx))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 5)
      .attr('fill', d => d.color)
      
      // --- STILE BORDI DIFFERENZIATO ---
      .attr('stroke', d => {
        if (d.isDual) return colors.onSurface;      // Theme-aware for Dual Awards
        if (d.isReplica) return '#00C853';   // Keep semantic green for Replicability
        return 'none';
      }) 
      .attr('stroke-width', d => (d.isDual || d.isReplica) ? 5 : 0) // Spessore 5 per entrambi
      // ----------------------------------

      .attr('opacity', 0)
      .transition()
      .duration(WAFFLE_ANIMATION_DURATION)
      .delay(d => d.idx * 8)
      .attr('opacity', 0.18);

    // emoji icons
    const icons = grid.selectAll('text.waffle-icon')
      .data(cells, d => d.idx)
      .enter()
      .append('text')
      .attr('class', 'waffle-icon')
      .attr('x', d => xOf(d.idx) + cellSize / 2)
      .attr('y', d => yOf(d.idx) + cellSize / 2 + 1)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${iconFontSize}px`)
      .attr('opacity', 0)
      .text(d => d.icon || '🎖️');

    icons.transition()
      .duration(WAFFLE_ANIMATION_DURATION)
      .delay(d => d.idx * 8 + 80)
      .attr('opacity', 1);

    // Tooltip Aggiornato - formato pulito
    const showTooltip = (event, d) => {
      let lines = [];
      
      // Codice award
      lines.push(`<strong>${d.code}</strong>`);
      
      // Titolo
      if (d.title) {
        lines.push(`<em>${d.title}</em>`);
      }
      
      // Anno
      if (d.year) {
        lines.push(`<span style="font-weight:bold;">${d.year}</span>`);
      }
      
      // Info speciali (dual award, stamp)
      if (d.specialMsg) {
        const noteColor = d.isReplica ? '#00C853' : (d.isDual ? colors.onSurface : 'inherit');
        lines.push(`<span style="color:${noteColor}; font-weight:bold;">${d.specialMsg}</span>`);
      }

      const content = lines.join('<br>');
      tooltip.show(event, content, colors);
    };

    // --- HIGHLIGHT CATEGORIA ON HOVER ---
    const highlightCategory = (event, d) => {
      const hoveredType = d.type;
      
      // Sfuma le tile di altre categorie
      grid.selectAll('rect.waffle-tile')
        .transition()
        .duration(150)
        .attr('opacity', t => t.type === hoveredType ? 0.35 : 0.08);
      
      // Sfuma le icone di altre categorie
      grid.selectAll('text.waffle-icon')
        .transition()
        .duration(150)
        .attr('opacity', t => t.type === hoveredType ? 1 : 0.25);
    };

    const resetHighlight = () => {
      // Ripristina opacità originale
      grid.selectAll('rect.waffle-tile')
        .transition()
        .duration(150)
        .attr('opacity', 0.18);
      
      grid.selectAll('text.waffle-icon')
        .transition()
        .duration(150)
        .attr('opacity', 1);
      
      tooltip.hide();
    };

    grid.selectAll('.waffle-tile, .waffle-icon')
      .on('mouseenter', (event, d) => {
        highlightCategory(event, d);
        showTooltip(event, d);
      })
      .on('mousemove', showTooltip)
      .on('mouseleave', resetHighlight);

    // -------------------------------------------------------
    // Legend (TOP-RIGHT, ordinata per percentuale decrescente)
    // -------------------------------------------------------
    const legendItems = cats.map(cat => {
      const code = typeToCode[cat.type] || cat.code;
      return {
        code: code,
        label: codeToType[code] || cat.type,
        icon: cat.icon || '🎖️',
        count: cat.count,
        pct: pct(cat.count),
        pctFmt: fmtPct(pct(cat.count))
      };
    }).sort((a, b) => b.pct - a.pct); // Ordina per percentuale decrescente

    const legendX = width - 220; 
    const legendY = 50; 
    const rowH = 20;

    const legend = g.append('g')
      .attr('class', 'legend legend-awards-topright')
      .attr('transform', `translate(${legendX}, ${legendY})`)
      .attr('opacity', 0);

    legend.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('dominant-baseline', 'hanging')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .text(`Total Awards: ${total}`);

  const rowsG = legend.selectAll('g.legend-item')
    .data(legendItems)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${16 + i * rowH})`);

  rowsG.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '14px')
    .text(d => d.icon);

  rowsG.append('text')
    .attr('x', 24)
    .attr('y', 0)
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'var(--md-sys-color-on-surface-variant)')
    .attr('font-size', '12px')
    .text(d => `${d.code}: ${d.label} (${d.count} - ${d.pctFmt}%)`);

  // --- LEGENDA SPECIALE (Replicability Stamp + Dual Award) ---
  const specialLegendY = 16 + legendItems.length * rowH + 15;
  
  // Graphics Replicability Stamp (bordo verde)
  const stampG = legend.append('g')
    .attr('transform', `translate(0, ${specialLegendY})`);
  
  stampG.append('rect')
    .attr('x', 0)
    .attr('y', -6)
    .attr('width', 12)
    .attr('height', 12)
    .attr('rx', 2)
    .attr('fill', 'var(--md-sys-color-surface)')
    .attr('stroke', '#00C853')
    .attr('stroke-width', 2);
  
  stampG.append('text')
    .attr('x', 24)
    .attr('y', 0)
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'var(--md-sys-color-on-surface-variant)')
    .attr('font-size', '11px')
    .text('Graphics Replicability Stamp');

  // Dual Award (bordo nero/grigio)
  const dualG = legend.append('g')
    .attr('transform', `translate(0, ${specialLegendY + rowH})`);
  
  dualG.append('rect')
    .attr('x', 0)
    .attr('y', -6)
    .attr('width', 12)
    .attr('height', 12)
    .attr('rx', 2)
    .attr('fill', 'var(--md-sys-color-surface)')
    .attr('stroke', colors.onSurfaceVariant)
    .attr('stroke-width', 2);
  
  dualG.append('text')
    .attr('x', 24)
    .attr('y', 0)
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'var(--md-sys-color-on-surface-variant)')
    .attr('font-size', '11px')
    .text('Dual Award');

  legend.transition()
    .delay(WAFFLE_ANIMATION_DURATION)
    .duration(350)
    .attr('opacity', 1);

  legend.raise();
},
};