/**
 * papers/plots/papersByConference.js
 * Stacked bar chart showing papers by conference type per year
 */

import { papersByConferenceData, conferenceKeys, conferenceLabels } from '../../data/papers/papersByConferenceData.js';
import { renderTitle, renderXAxis, renderYAxis, renderLegend, styleAxes } from '../../assets/js/chart-utils.js';
import { conferenceColors } from '../../assets/js/color-palettes.js';

export const papersByConferenceConfig = {
  data: papersByConferenceData,
  margins: { top: 60, right: 30, bottom: 50, left: 60 },

  render: (ctx) => {
    const { g, d3, tooltip, width, height, data, colors } = ctx;
    const animationDuration = 800;

    // Title
    renderTitle(ctx, 'Papers by Conference Track');

    // Stack the data
    const stack = d3.stack()
      .keys(conferenceKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(data, d => conferenceKeys.reduce((sum, key) => sum + d[key], 0));
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .nice()
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(conferenceKeys)
      .range(conferenceKeys.map(k => conferenceColors[k]));

    // Axes
    renderXAxis(ctx, xScale, { label: 'Year', tickFormat: d => d, tickCount: 7 });
    renderYAxis(ctx, yScale, { label: 'Number of Papers', tickCount: 6 });
    styleAxes(g);

    // Create groups for each stack layer
    const layers = g.selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', d => colorScale(d.key));

    // Add bars
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

    // Animate bars
    bars.transition()
      .duration(animationDuration)
      .delay((d, i) => i * 10)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])));

    // Tooltip interactions
    bars
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8);
        
        const value = d.data[d.key];
        tooltip.show(event, `<strong>${d.data.year}</strong><br>${conferenceLabels[d.key]}: ${value} papers`, colors);
      })
      .on('mousemove', function(event, d) {
        const value = d.data[d.key];
        tooltip.show(event, `<strong>${d.data.year}</strong><br>${conferenceLabels[d.key]}: ${value} papers`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1);
        
        tooltip.hide();
      });

    // Legend
    const legendItems = conferenceKeys.map(key => ({
      label: conferenceLabels[key],
      color: conferenceColors[key]
    }));
    renderLegend(ctx, legendItems, { x: width - 100, y: 0 });
  }
};
