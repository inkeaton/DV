/**
 * papers/plots/papersPerYear.js
 */

import { renderTitle, renderXAxis, renderYAxis, styleAxes } from '../../assets/js/chart-utils.js';

export const papersPerYearConfig = {
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: async (ctx) => {
    const { g, d3, tooltip, width, height, colors } = ctx;
    const animationDuration = 800;

    const dataCsvUrl = "../data/papers/papersPerYearData.csv";
    const statsCsvUrl = "../data/papers/papersPerYearStats.csv";

    // ---- Load data ----
    const rawData = await d3.csv(dataCsvUrl);
    const data = rawData
      .map(d => ({
        year: Number(d.Year),
        count: Number(String(d.Count ?? "").replace(/,/g, ""))
      }))
      .filter(d => Number.isFinite(d.year))
      .sort((a, b) => a.year - b.year);

    // ---- Load stats ----
    const rawStats = await d3.csv(statsCsvUrl);
    const s0 = rawStats[0] || {};
    const stats = {
      total: Number(String(s0.total ?? "").replace(/,/g, "")) || 0,
      avgPerYear: Number(String(s0.avgPerYear ?? "").replace(/,/g, "")) || 101,
      peakYear: Number(String(s0.peakYear ?? "").replace(/,/g, "")) || null,
      peakCount: Number(String(s0.peakCount ?? "").replace(/,/g, "")) || 0,
    };

    const avgValue = stats.avgPerYear || 101;

    // Title
    renderTitle(ctx, 'Papers Published Per Year');

    // -------------------------
    // Domain years: force 1990–2024
    // -------------------------
    const yearMin = 1990;
    const yearMax = 2024;
    const years = d3.range(yearMin, yearMax + 1);

    const countByYear = new Map(data.map(d => [d.year, d.count]));
    const fullData = years.map(y => ({
      year: y,
      count: countByYear.has(y) ? countByYear.get(y) : null
    }));

    // Scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.2);

    const maxCount = d3.max(data, d => d.count) ?? 0;
    const yTop = Math.max(maxCount, 160, avgValue) * 1.1;

    const yScale = d3.scaleLinear()
      .domain([0, yTop])
      .nice()
      .range([height, 0]);

    // -------------------------
    // Ticks
    // 1990, 1995, ..., 2020, 2024 (always include last year)
    // -------------------------
    const xTickYears = years.filter(y => (y % 5 === 0) || y === yearMax);
    const yTickValues = [0, 40, 80, avgValue, 120, 160];

    // Axes
    renderXAxis(ctx, xScale, {
      label: 'Year',
      tickValues: xTickYears,
      tickFormat: d => d
    });

    renderYAxis(ctx, yScale, {
      label: 'Number of Papers',
      tickValues: yTickValues,
      tickFormat: d => d
    });

    styleAxes(g);

    // Remove axis lines (domain + tick lines) AFTER styleAxes
    g.selectAll('.x-axis .domain, .y-axis .domain').style('stroke', 'none');
    g.selectAll('.x-axis .tick line, .y-axis .tick line').style('stroke', 'none');

    // Colors
    const normalFill = 'var(--md-sys-color-primary)';
    const highlightFill = 'var(--md-sys-color-tertiary)';
    const hoverNormalFill = 'var(--md-sys-color-primary-container)';
    const hoverHighlightFill = 'var(--md-sys-color-tertiary-container)';

    // Bars
    const bars = g.selectAll('.bar')
      .data(fullData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 2)
      .attr('fill', d => {
        if (d.count == null) return 'transparent'; // years without data (if any)
        return (d.year === 2020) ? highlightFill : normalFill;
      })
      .style('pointer-events', d => (d.count == null ? 'none' : 'auto'));

    // Animate
    bars.transition()
      .duration(animationDuration)
      .delay((d, i) => i * 12)
      .attr('y', d => (d.count == null ? height : yScale(d.count)))
      .attr('height', d => (d.count == null ? 0 : Math.max(0, height - yScale(d.count))));

    // Tooltip
    bars
      .on('mouseenter', function(event, d) {
        const isHighlight = d.year === 2020;

        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', isHighlight ? hoverHighlightFill : hoverNormalFill);

        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mousemove', function(event, d) {
        tooltip.show(event, `<strong>${d.year}</strong><br>${d.count} papers`, colors);
      })
      .on('mouseleave', function(event, d) {
        const isHighlight = d.year === 2020;

        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', isHighlight ? highlightFill : normalFill);

        tooltip.hide();
      });

    // Average dashed line (RED) + label (left)
    const avgY = yScale(avgValue);

    const avgGroup = g.append('g')
      .attr('class', 'avg-line')
      .style('pointer-events', 'none');

    avgGroup.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', avgY)
      .attr('y2', avgY)
      .attr('stroke', '#d32f2f')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,6')
      .attr('opacity', 0.95);

    avgGroup.append('text')
      .attr('x', 6)
      .attr('y', avgY - 8)
      .attr('text-anchor', 'start')
      .attr('fill', '#d32f2f')
      .attr('font-size', '12px')
      .text(`Average: ${avgValue} papers per year`);

    avgGroup.raise();

    // Stats annotation
    const statsText = g.append('text')
      .attr('class', 'stats-annotation')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--md-sys-color-on-surface-variant)')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(`Total: ${stats.total.toLocaleString()} papers`);

    statsText.transition()
      .delay(animationDuration)
      .duration(400)
      .attr('opacity', 1);
  }
};
