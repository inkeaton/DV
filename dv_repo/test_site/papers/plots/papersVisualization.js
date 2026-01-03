/**
 * papers/plots/papersVisualization.js
 * ============================================================================
 * PAPERS PAGE VISUALIZATION CONTROLLER
 * 
 * This module manages all visualizations for the papers scrollytelling page.
 * It handles step transitions and renders appropriate visualizations for each
 * narrative section focused on paper characteristics.
 * 
 * Steps:
 * 0 - Publication Timeline (stacked area chart by track)
 * 1 - Citation Distribution (histogram)
 * 2 - Keyword Trends (treemap)
 * 3 - Paper Length Evolution (line chart with range)
 * 4 - Authorship Patterns (bar chart + donut)
 * ============================================================================
 */

import { ScrollyVisualization, getThemeColors, createTooltip } from '../../assets/js/visualization-base.js';
import { publicationTimelineData, trackColors, trackLabels } from './publicationTimelineData.js';
import { citationDistributionData, citationStats, topCitedPapers } from './citationDistributionData.js';
import { keywordTrendsData, categoryColors } from './keywordTrendsData.js';
import { paperLengthData, paperTypeDistribution } from './paperLengthData.js';
import { authorshipData, authorshipTrends, collaborationTypes } from './authorshipData.js';

/**
 * Papers visualization class
 * Extends the base ScrollyVisualization to handle papers-specific content
 */
export class PapersVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId);
    this.currentStep = -1;
    this.tooltip = null;
    this.defaultMargin = { top: 50, right: 60, bottom: 70, left: 60 };
    this.margin = { ...this.defaultMargin };
  }

  /**
   * Set margins for specific visualization type and update group transform
   */
  setMargins(customMargin) {
    this.margin = { ...this.defaultMargin, ...customMargin };
    this.g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  /**
   * Initialize the visualization
   */
  async init(d3) {
    await super.init(d3);
    this.tooltip = createTooltip(d3, 'papers-tooltip');
    this.createSvg();
    this.transitionToStep(0, null, -1);
  }

  /**
   * Create/recreate the SVG element
   */
  createSvg() {
    const { width, height } = this.getDimensions();
    
    if (this.svg) {
      this.svg.remove();
    }

    this.svg = this.d3.select(this.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img');

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  /**
   * Get inner dimensions (minus margins)
   */
  getInnerDimensions() {
    const { width, height } = this.getDimensions();
    return {
      width: width - this.margin.left - this.margin.right,
      height: height - this.margin.top - this.margin.bottom
    };
  }

  /**
   * Transition to a specific step
   */
  transitionToStep(stepIndex, stepElement, previousStep) {
    if (stepIndex === this.currentStep) return;
    
    // Clear previous content with fade out
    this.g.selectAll('*')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();

    this.currentStep = stepIndex;

    // Render appropriate visualization
    setTimeout(() => {
      switch (stepIndex) {
        case 0:
          this.renderPublicationTimeline();
          break;
        case 1:
          this.renderCitationDistribution();
          break;
        case 2:
          this.renderKeywordTrends();
          break;
        case 3:
          this.renderPaperLength();
          break;
        case 4:
          this.renderAuthorshipPatterns();
          break;
        default:
          this.renderPublicationTimeline();
      }
    }, 250);
  }

  /**
   * Step 0: Publication timeline stacked area chart
   */
  renderPublicationTimeline() {
    this.setMargins({ left: 60, right: 120 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = publicationTimelineData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Stacked area chart showing publications by conference track over time');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Publications by Conference Track');

    // Stack the data
    const keys = ['infovis', 'scivis', 'vast'];
    const stack = d3.stack().keys(keys);
    const series = stack(data);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
      .nice()
      .range([height, 0]);

    // Axes
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    this.g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Area generator
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw areas
    this.g.selectAll('.area')
      .data(series)
      .join('path')
      .attr('class', 'area')
      .attr('fill', d => trackColors[d.key])
      .attr('fill-opacity', 0.8)
      .attr('d', area)
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 1);
        tooltip.show(event, `<strong>${trackLabels[d.key]}</strong>`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 0.8);
        tooltip.hide();
      });

    // Legend
    const legend = this.g.append('g')
      .attr('transform', `translate(${width + 10}, 20)`);

    keys.forEach((key, i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);
      
      lg.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('rx', 2)
        .attr('fill', trackColors[key]);
      
      lg.append('text')
        .attr('x', 20)
        .attr('y', 11)
        .style('font-size', '12px')
        .style('fill', colors.onSurfaceVariant)
        .text(trackLabels[key]);
    });
  }

  /**
   * Step 1: Citation distribution histogram
   */
  renderCitationDistribution() {
    this.setMargins({ left: 70, right: 50 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = citationDistributionData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Histogram showing citation count distribution');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Citation Distribution');

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.range))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height, 0]);

    // Axes
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '11px')
      .attr('transform', 'rotate(-25)')
      .attr('text-anchor', 'end');

    this.g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Y axis label
    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Number of Papers');

    // Bars
    this.g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.range))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', colors.primary)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('y', d => yScale(d.count))
      .attr('height', d => height - yScale(d.count));

    // Tooltip
    this.g.selectAll('.bar')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 0.8);
        tooltip.show(event, `<strong>${d.label}</strong><br>${d.count} papers`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 1);
        tooltip.hide();
      });

    // Stats annotation
    const stats = this.g.append('g')
      .attr('transform', `translate(${width - 120}, 20)`);
    
    stats.append('text')
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text(`Median: ${citationStats.median}`);
    
    stats.append('text')
      .attr('y', 16)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text(`Mean: ${citationStats.mean}`);
  }

  /**
   * Step 2: Keyword trends treemap
   */
  renderKeywordTrends() {
    this.setMargins({ left: 40, right: 40 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Treemap showing keyword popularity');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Popular Keywords by Frequency');

    // Create hierarchy
    const root = d3.hierarchy(keywordTrendsData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Treemap layout
    d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true)(root);

    // Draw leaves
    const leaf = this.g.selectAll('.leaf')
      .data(root.leaves())
      .join('g')
      .attr('class', 'leaf')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    leaf.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => categoryColors[d.data.category])
      .attr('fill-opacity', 0.85)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 1);
        const growthLabel = d.data.growth > 0 ? `+${d.data.growth}%` : `${d.data.growth}%`;
        tooltip.show(event, `
          <strong>${d.data.name}</strong><br>
          ${d.data.value} papers<br>
          Growth: ${growthLabel}
        `, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 0.85);
        tooltip.hide();
      });

    // Labels
    leaf.append('text')
      .attr('x', 4)
      .attr('y', 14)
      .style('font-size', d => (d.x1 - d.x0) > 80 ? '11px' : '9px')
      .style('font-weight', '500')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => (d.x1 - d.x0) > 50 ? d.data.name : '');
  }

  /**
   * Step 3: Paper length evolution
   */
  renderPaperLength() {
    this.setMargins({ left: 60, right: 140 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = paperLengthData;

    this.svg.attr('aria-label', 'Line chart showing paper length trends over time');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Paper Length Evolution');

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.maxPages)])
      .nice()
      .range([height, 0]);

    // Axes
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    this.g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Y axis label
    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Pages');

    // Area for range
    const area = d3.area()
      .x(d => xScale(d.year))
      .y0(d => yScale(d.minPages))
      .y1(d => yScale(d.maxPages))
      .curve(d3.curveMonotoneX);

    this.g.append('path')
      .datum(data)
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0.2)
      .attr('d', area);

    // Average line
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.avgPages))
      .curve(d3.curveMonotoneX);

    this.g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('d', line);

    // Points
    this.g.selectAll('.point')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.avgPages))
      .attr('r', 5)
      .attr('fill', colors.primary);

    // Legend
    const legend = this.g.append('g')
      .attr('transform', `translate(${width + 15}, 20)`);

    legend.append('line')
      .attr('x1', 0).attr('x2', 20)
      .attr('y1', 0).attr('y2', 0)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3);
    
    legend.append('text')
      .attr('x', 25).attr('y', 4)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('Average');

    legend.append('rect')
      .attr('y', 16)
      .attr('width', 20).attr('height', 12)
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0.2);
    
    legend.append('text')
      .attr('x', 25).attr('y', 26)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('Min-Max Range');
  }

  /**
   * Step 4: Authorship patterns
   */
  renderAuthorshipPatterns() {
    this.setMargins({ left: 60, right: 50 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = authorshipData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Bar chart showing authors per paper distribution');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Authors per Paper');

    // Use left half for bar chart
    const chartWidth = width * 0.55;

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.authors))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height, 0]);

    // Axes
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    this.g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Bars
    this.g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.authors))
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', colors.tertiary)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('y', d => yScale(d.count))
      .attr('height', d => height - yScale(d.count));

    // Tooltip
    this.g.selectAll('.bar')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 0.8);
        tooltip.show(event, `<strong>${d.authors} author(s)</strong><br>${d.count} papers (${d.percentage}%)`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 1);
        tooltip.hide();
      });

    // Donut chart for collaboration types
    const donutG = this.g.append('g')
      .attr('transform', `translate(${chartWidth + (width - chartWidth) / 2}, ${height / 2})`);

    const radius = Math.min(width - chartWidth, height) / 2 - 30;
    const pie = d3.pie().value(d => d.percentage);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    donutG.selectAll('.arc')
      .data(pie(collaborationTypes))
      .join('path')
      .attr('class', 'arc')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', colors.surface)
      .attr('stroke-width', 2)
      .on('mouseenter', function(event, d) {
        tooltip.show(event, `<strong>${d.data.type}</strong><br>${d.data.percentage}%`, colors);
      })
      .on('mouseleave', () => tooltip.hide());

    // Donut label
    donutG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('Collaboration');
    
    donutG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 10)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('Types');
  }
}
