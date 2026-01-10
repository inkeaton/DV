/**
 * papers/plots/citationsHistogram.js
 * Histogram (true bins) + tail zoom inset with precise styling
 */

import {
  citationsHistogramData,
  citationStats,
  histogramBins,
  topCitedPapers
} from '../../data/papers/citationsHistogramData.js';

import { renderTitle } from '../../assets/js/chart-utils.js';
import { ANIMATION_DURATION } from '../../assets/js/chart-constants.js';

export const citationsHistogramConfig = {
  data: citationsHistogramData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors: themeColors } = ctx;
    
    renderTitle(ctx, 'Citation Distribution');

    // --- 1. CONFIGURAZIONE E COLORI ---
    const CUTOFF = 500;
    const TAIL_MAX = 4000;

    // Generate 27-color gradient using Material Design 3 fixed color tokens
    // Light: tertiary-fixed-dim, Dark: on-tertiary-fixed-variant
    const lightColor = themeColors.tertiaryFixedDim;     // #BFC4EB (light mode) / #BFC4EB (dark mode)
    const darkColor = themeColors.onTertiaryFixedVariant; // #3F4565 (light mode) / #3F4565 (dark mode)
    
    const colorInterpolator = d3.interpolateRgb(lightColor, darkColor);
    
    // Generate 27 colors: 20 for main chart (0-500) + 7 for inset (500-4000)
    const mainColors = d3.range(20).map(i => colorInterpolator(i / 19));
    const tailColors = d3.range(7).map(i => colorInterpolator(i / 6));

    // --- 2. GRAFICO PRINCIPALE (0 - 500) ---
    const mainBinWidth = 25; 
    const mainGenerator = d3.bin()
      .domain([0, CUTOFF])
      .thresholds(d3.range(0, CUTOFF + mainBinWidth, mainBinWidth));

    const mainDataPoints = data.filter(d => d <= CUTOFF);
    const mainBins = mainGenerator(mainDataPoints);
    
    const maxYMain = d3.max(mainBins, d => d.length);

    const xScale = d3.scaleLinear()
      .domain([0, CUTOFF])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, maxYMain]) 
      .range([height, 0]);

    // --- ASSI GRAFICO GRANDE ---
    const xAxis = d3.axisBottom(xScale)
      // Parte da 50 per evitare lo 0 sovrapposto
      .tickValues(d3.range(50, 501, 50)) 
      .tickFormat(d => d);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5); 

    const xAxisG = g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
    
    xAxisG.select('.domain').remove(); 
    xAxisG.selectAll('.tick line').remove(); 
    xAxisG.selectAll('.tick text')
      .attr('text-anchor', 'middle')
      .attr('dy', '10px') 
      .style('font-size', '11px');

    const yAxisG = g.append('g')
      .call(yAxis);
      
    yAxisG.select('.domain').remove(); 
    yAxisG.selectAll('.tick line').remove(); 
    yAxisG.selectAll('.tick text').style('font-size', '11px');
    
    // Etichette Assi
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .text('Number of Citations');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .text('Number of Papers');

    // Barre Main
    const bars = g.selectAll('.bar-main')
      .data(mainBins)
      .enter()
      .append('rect')
      .attr('class', 'bar-main')
      .attr('x', d => xScale(d.x0) + 1) 
      .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
      .attr('y', height) 
      .attr('height', 0)
      .attr('fill', (d, i) => mainColors[i])
      .attr('rx', 2); 

    bars.transition()
      .duration(ANIMATION_DURATION)
      .delay((d, i) => i * 30)
      .attr('y', d => yScale(d.length))
      .attr('height', d => height - yScale(d.length));

    // Tooltip Main
    bars.on('mouseenter', function(event, d) {
        d3.select(this).attr('fill', themeColors.primary); 
        const pct = ((d.length / data.length) * 100).toFixed(1);
        tooltip.show(event, `<strong>${d.x0}-${d.x1} Citations</strong><br>${d.length} papers (${pct}%)`, themeColors);
      })
      .on('mouseleave', function(event, d) {
        const i = mainBins.indexOf(d);
        d3.select(this).attr('fill', mainColors[i]);
        tooltip.hide();
      });

    // --- LINEA MEDIANA (FIXED) ---
    const medianVal = citationStats && citationStats.median ? citationStats.median : 39;
    const medianX = xScale(medianVal);

    const medianLine = g.append('line')
      .attr('x1', medianX).attr('x2', medianX)
      .attr('y1', height).attr('y2', yScale(maxYMain)) 
      .attr('stroke', themeColors.accent)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Porta la linea in primo piano sopra le barre
    medianLine.raise(); 

    g.append('text')
      .attr('x', medianX + 8) 
      .attr('y', yScale(maxYMain)) 
      .attr('fill', themeColors.accent)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(`Median: ${medianVal}`);


    // =========================================================
    // --- 3. INSET (PICCOLO GRAFICO) ---
    // =========================================================
    
    const insetW = 560; 
    const insetH = 300; 
    const insetX = width - insetW; 
    const insetY = 100; 

    const insetG = g.append('g')
      .attr('transform', `translate(${insetX}, ${insetY})`);

    // Sfondo Inset
    insetG.append('rect')
      .attr('width', insetW)
      .attr('height', insetH)
      .attr('rx', 8)
      .attr('fill', 'var(--md-sys-color-surface-container-high)') 
      .attr('stroke', 'var(--md-sys-color-outline-variant)')
      .attr('stroke-width', 1);

    // Titolo Inset
    insetG.append('text')
      .attr('x', 15).attr('y', 25)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', 'var(--md-sys-color-on-surface)')
      .text('Tail Zoom (500+ Citations)');

    // Dati Tail
    const tailDataPoints = data.filter(d => d > CUTOFF);
    const tailMax = TAIL_MAX; 
    
    const iPad = { l: 40, r: 20, t: 40, b: 30 }; 
    
    const insetXScale = d3.scaleLinear()
      .domain([CUTOFF, tailMax])
      .range([iPad.l, insetW - iPad.r]);

    const tailBinWidth = 500;
    const tailGenerator = d3.bin()
      .domain([CUTOFF, tailMax])
      .thresholds(d3.range(CUTOFF, tailMax + tailBinWidth, tailBinWidth)); 

    const tailBins = tailGenerator(tailDataPoints);
    const maxYInset = d3.max(tailBins, d => d.length);

    // Scala Y Inset
    const insetYScale = d3.scaleLinear()
      .domain([0, maxYInset]) 
      .nice() 
      .range([insetH - iPad.b, iPad.t]);

    // --- ASSI INSET ---
    const axisB = d3.axisBottom(insetXScale)
      .tickValues([500, 1000, 2000, 3000, 4000])
      .tickFormat(d3.format('.1s')); 

    const axisL = d3.axisLeft(insetYScale)
      // Manualmente fermiamo a 30 per evitare il 40
      .tickValues([0, 10, 20, 30]); 

    const axisBG = insetG.append('g')
      .attr('transform', `translate(0, ${insetH - iPad.b})`)
      .call(axisB);

    axisBG.select('.domain').remove(); 
    axisBG.selectAll('.tick line').remove(); 
    axisBG.selectAll('.tick text')
      .attr('dy', '8px')
      .style('font-size', '10px');

    const axisLG = insetG.append('g')
      .attr('transform', `translate(${iPad.l}, 0)`)
      .call(axisL);

    axisLG.select('.domain').remove();
    axisLG.selectAll('.tick line').remove();
    axisLG.selectAll('text').style('font-size', '10px');

    // Helper: compact bin label (0.5k-1k, 1k-1.5k, etc.)
    function compactBinLabel(x0, x1) {
      const fmt = (v) => {
        if (v >= 1000) return (v / 1000) + 'k';
        return v;
      };
      return `${fmt(x0)}-${fmt(x1)}`;
    }

    // Barre Inset
    insetG.selectAll('.bar-tail')
      .data(tailBins)
      .enter()
      .append('rect')
      .attr('class', 'bar-tail')
      .attr('x', d => insetXScale(d.x0) + 1)
      .attr('width', d => Math.max(0, insetXScale(d.x1) - insetXScale(d.x0) - 2))
      .attr('y', d => insetYScale(d.length))
      .attr('height', d => (insetH - iPad.b) - insetYScale(d.length))
      .attr('fill', (d, i) => tailColors[i])
      .attr('rx', 1)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill', '#EAD0EE');
        const pct = ((d.length / data.length) * 100).toFixed(2);
        const binLabel = compactBinLabel(d.x0, d.x1);
        let tooltipHtml = `<strong>${binLabel} Citations</strong><br>${d.length} papers (${pct}%)`;
        
        // Show top cited papers for bins 3.5k-4k (contains max 3795) and 2k-2.5k (contains 2238)
        const showPaperDetails = (d.x0 === 3500 || d.x0 === 2000);
        if (showPaperDetails && topCitedPapers && topCitedPapers.length > 0) {
          // Filter papers that fall in this bin
          const papersInBin = topCitedPapers.filter(p => p.Citations >= d.x0 && p.Citations < d.x1);
          if (papersInBin.length > 0) {
            tooltipHtml += '<hr style="margin:6px 0;">';
            papersInBin.forEach(paper => {
              tooltipHtml += `<em>${paper.Title}</em><br>`;
              tooltipHtml += `<span style="font-weight:bold;">${paper.Year}</span><br>`;
              tooltipHtml += `<span style="color:${themeColors.accent};">${paper.Citations} citations</span>`;
            });
          }
        }
        tooltip.show(event, tooltipHtml, themeColors);
      })
      .on('mouseleave', function(event, d) {
        const i = tailBins.indexOf(d);
        d3.select(this).attr('fill', tailColors[i]);
        tooltip.hide();
      });

    // --- 4. FRECCIA ---
    const startX = xScale(CUTOFF);
    const startY = height; 

    const endX = insetX + 5; 
    const endY = insetY + insetH - 10; 

    g.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)');

    const curvePath = `M ${startX},${startY} C ${startX + 60},${startY - 40} ${endX - 40},${endY + 60} ${endX},${endY}`;

    const arrow = g.append('path')
      .attr('d', curvePath)
      .attr('fill', 'none')
      .attr('stroke', 'var(--md-sys-color-on-surface-variant)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('opacity', 0);

    arrow.transition()
      .delay(1000)
      .duration(800)
      .attr('opacity', 1);
  }
};