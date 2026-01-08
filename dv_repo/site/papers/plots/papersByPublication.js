/**
 * papers/plots/papersByPublication.js
 * Stacked bar chart showing papers by publication type per year
 */

import { papersByPublicationData, publicationKeys, publicationLabels } from '../../data/papers/papersByPublicationData.js';
import { renderTitle, renderXAxis, renderYAxis, renderLegend, styleAxes } from '../../assets/js/chart-utils.js';
import { publicationColors } from '../../assets/js/color-palettes.js';

export const papersByPublicationConfig = {
  data: papersByPublicationData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // -------------------------
    // Force domain: 1990–2024
    // -------------------------
    const yearMin = 1990;
    const yearMax = 2024;
    const years = d3.range(yearMin, yearMax + 1);

    // Extend/normalize data (missing years -> zeros)
    const byYear = new Map(data.map(d => [d.year, d]));
    const fullData = years.map(y => {
      const row = byYear.get(y);
      if (row) return row;

      const empty = { year: y };
      publicationKeys.forEach(k => { empty[k] = 0; });
      return empty;
    });

    // Totals per publication type (for legend)
    const totalsByKey = {};
    publicationKeys.forEach(k => {
      totalsByKey[k] = d3.sum(fullData, d => +d[k] || 0);
    });

    // Title
    renderTitle(ctx, 'Papers by Publication Type');

    // Stack
    const stack = d3.stack()
      .keys(publicationKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(fullData);

    // Scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(fullData, d =>
      publicationKeys.reduce((sum, key) => sum + (+d[key] || 0), 0)
    ) || 0;

    const yTop = Math.max(yMax, 160) * 1.05;

    const yScale = d3.scaleLinear()
      .domain([0, yTop])
      .nice()
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(publicationKeys)
      .range(publicationKeys.map(k => publicationColors[k]));

    // -------------------------
    // Axes ticks
    // -------------------------
    const xTickYears = years.filter(y => (y % 5 === 0) || y === yearMax); // 1990,1995,...,2024
    const yTickValues = [0, 40, 80, 120, 160];

    renderXAxis(ctx, xScale, {
      label: 'Year',
      tickValues: xTickYears,
      tickFormat: d => d
    });

    renderYAxis(ctx, yScale, {
      label: 'Total number of papers',
      tickValues: yTickValues,
      tickFormat: d => d
    });

    styleAxes(g);

    // Remove axis lines (domain + tick lines)
    g.selectAll('.x-axis .domain, .y-axis .domain').style('stroke', 'none');
    g.selectAll('.x-axis .tick line, .y-axis .tick line').style('stroke', 'none');

    // Layers
    const layers = g.selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', d => colorScale(d.key));

    // Bars
    const bars = layers.selectAll('.bar')
      .data(d => d.map(point => ({ ...point, key: d.key })))
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.data.year))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 2);

    // Animate
    bars.transition()
      .duration(animationDuration)
      .delay((d, i) => i * 10)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])));

    // Tooltip
    bars
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8);

        const value = d.data[d.key] || 0;
        tooltip.show(event, `<strong>${d.data.year}</strong><br>${publicationLabels[d.key]}: ${value} papers`, colors);
      })
      .on('mousemove', function(event, d) {
        const value = d.data[d.key] || 0;
        tooltip.show(event, `<strong>${d.data.year}</strong><br>${publicationLabels[d.key]}: ${value} papers`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1);

        tooltip.hide();
      });

    // Legend with totals
    const legendItems = publicationKeys.map(key => ({
      label: `${publicationLabels[key]}: ${totalsByKey[key].toLocaleString()} papers`,
      color: publicationColors[key]
    }));

    renderLegend(ctx, legendItems, { x: width - 170, y: 0 });
  }
};
