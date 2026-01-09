/**
 * papers/plots/awardsWaffleIcons.js
 * Waffle chart (single grid) using different emoji icons per award type.
 *
 * Update:
 * - Legend TOP-RIGHT, minimal style.
 * - Highlights dual-award papers (Test of Time + Best Paper) in BLACK.
 * - Highlights Replicability Stamp papers (1 BP, 3 HM) in GREEN.
 */

import { awardsData, pictogramCellValue } from '../../data/papers/awardsData.js';
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

    // --- GENERAZIONE CELLE CON LOGICA TAG & STAMP ---
    const cells = [];
    let cursor = 0;

    for (const cat of allocated) {
      for (let k = 0; k < cat.cells; k++) {
        if (cursor >= totalCells) break;

        let isDual = false;
        let isReplica = false; // Nuovo flag
        let specialMsg = '';

        // --- 1. LOGICA DUAL AWARDS (Bordo Nero) ---
        // 'Test of Time' -> i primi 5 hanno anche Best Paper
        if (cat.type === 'Test of Time' && k < 5) {
          isDual = true;
          specialMsg = '★ Also received Best Paper';
        }
        // 'Best Paper' -> i primi 5 hanno anche Test of Time
        else if (cat.type === 'Best Paper' && k < 5) {
          isDual = true;
          specialMsg = '★ Also received Test of Time';
        }

        // --- 2. LOGICA REPLICABILITY STAMP (Bordo Verde) ---
        // Aggiungo 1 su BP (uso l'indice 5, cioè il sesto, per non coprire i duali)
        if (cat.type === 'Best Paper' && k === 5) {
          isReplica = true;
          specialMsg = '✔ Graphics Replicability Stamp';
        }
        // Aggiungo 3 su HM (Honorable Mention) (indici 0, 1, 2)
        else if (cat.type === 'Honorable Mention' && k < 3) {
          isReplica = true;
          specialMsg = '✔ Graphics Replicability Stamp';
        }

        cells.push({
          idx: cursor,
          type: cat.type,
          code: cat.code,
          icon: cat.icon,
          count: cat.count,
          color: cat.color,
          isDual: isDual,
          isReplica: isReplica,
          specialMsg: specialMsg,
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
        if (d.isDual) return '#000000';      // Nero per Dual Awards
        if (d.isReplica) return '#00C853';   // Verde brillante per Replicability
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

    // Tooltip Aggiornato
    const showTooltip = (event, d) => {
      const percent = fmtPct(pct(d.count));
      
      let noteHtml = '';
      if (d.specialMsg) {
        // Colore del testo tooltip: Nero per Dual, Verde per Replica
        const noteColor = d.isReplica ? '#00C853' : '#000000';
        noteHtml = `<br><br><span style="color:${noteColor}; font-weight:bold;">${d.specialMsg}</span>`;
      }

      const content =
        `<strong>${d.code} — ${d.type}</strong><br>` +
        `${d.count} awards <span style="color:var(--md-sys-color-on-surface-variant)">(${percent}%)</span>` +
        noteHtml;
        
      tooltip.show(event, content, colors);
    };

    grid.selectAll('.waffle-tile, .waffle-icon')
      .on('mouseenter', showTooltip)
      .on('mousemove', showTooltip)
      .on('mouseleave', () => tooltip.hide());

    // -------------------------------------------------------
    // Legend (TOP-RIGHT, minimal: ICON + label)
    // -------------------------------------------------------
    const legendItems = cats.map(d => ({
      label: d.type,
      icon: d.icon || '🎖️',
    }));

    const legendX = width - 170; 
    const legendY = 50; 
    const rowH = 18;

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
      .text(`Total Awards: ${total} Papers`);

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
    .text(d => d.label);

  legend.transition()
    .delay(WAFFLE_ANIMATION_DURATION)
    .duration(350)
    .attr('opacity', 1);

  legend.raise();
},
};