/**
 * researcher/plots/researcherVisualization.js
 * ============================================================================
 * RESEARCHER PAGE VISUALIZATION CONTROLLER
 * 
 * This module manages all visualizations for the researcher scrollytelling page.
 * It handles step transitions and renders appropriate visualizations for each
 * narrative section.
 * 
 * Steps:
 * 0 - Citation Trends Line Chart
 * 1 - Collaboration Network Force Graph
 * 2 - Topic Evolution Stream/Area Chart
 * 3 - Institutional Analysis Scatter Plot
 * 4 - Emerging Research Fronts Bubble Chart
 * ============================================================================
 */

import { ScrollyVisualization, getThemeColors, createTooltip } from '../../assets/js/visualization-base.js';
import { citationTrendData } from './citationTrendData.js';
import { collaborationNetworkData, countryColors } from './collaborationNetworkData.js';
import { topicEvolutionData, topicColors } from './topicEvolutionData.js';
import { institutionalData } from './institutionalData.js';
import { emergingFrontsData, lifecycleStages } from './emergingFrontsData.js';

/**
 * Researcher visualization class
 * Extends the base ScrollyVisualization to handle researcher-specific content
 */
export class ResearcherVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId);
    this.tooltip = null;
    this.defaultMargin = { top: 50, right: 60, bottom: 70, left: 60 };
    this.margin = { ...this.defaultMargin };
  }

  /**
   * Set margins for specific visualization type and update group transform
   * @param {Object} customMargin - Custom margin object (partial or full)
   */
  setMargins(customMargin) {
    this.margin = { ...this.defaultMargin, ...customMargin };
    this.g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  /**
   * Initialize the visualization
   * @param {Object} d3 - D3.js library reference
   */
  async init(d3) {
    await super.init(d3);
    this.tooltip = createTooltip(d3, 'researcher-tooltip');
    
    // Create initial SVG
    this.createSvg();
    
    // Render initial state (step 0)
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
   * @param {number} stepIndex - Index of the step
   * @param {HTMLElement} stepElement - The step DOM element
   * @param {number} previousStep - Previous step index
   */
  transitionToStep(stepIndex, stepElement, previousStep) {
    super.transitionToStep(stepIndex, stepElement, previousStep);

    // Clear current visualization
    this.g.selectAll('*').remove();

    // Render appropriate visualization for step
    switch (stepIndex) {
      case 0:
        this.renderCitationTrends();
        break;
      case 1:
        this.renderCollaborationNetwork();
        break;
      case 2:
        this.renderTopicEvolution();
        break;
      case 3:
        this.renderInstitutionalAnalysis();
        break;
      case 4:
        this.renderEmergingFronts();
        break;
      default:
        this.renderCitationTrends();
    }
  }

  /**
   * Step 0: Render citation trends line chart
   */
  renderCitationTrends() {
    // Use balanced margins for line chart with dual y-axes and rotated labels
    this.setMargins({ left: 80, right: 80 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = citationTrendData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Line chart showing citation trends over time');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Citation Trends Over Time');

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avgCitations)])
      .nice()
      .range([height, 0]);

    const yScale2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.topPaperCitations)])
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

    // Right Y axis
    this.g.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yScale2))
      .selectAll('text')
      .style('fill', colors.tertiary);

    // Y axis labels
    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.primary)
      .style('font-size', '12px')
      .text('Average Citations');

    this.g.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -width - 45)
      .attr('x', height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.tertiary)
      .style('font-size', '12px')
      .text('Top Paper Citations');

    // Line generators
    const lineAvg = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.avgCitations))
      .curve(d3.curveMonotoneX);

    const lineTop = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale2(d.topPaperCitations))
      .curve(d3.curveMonotoneX);

    // Draw lines with animation
    const pathAvg = this.g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('d', lineAvg);

    const pathLength = pathAvg.node().getTotalLength();
    pathAvg
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0);

    const pathTop = this.g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.tertiary)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', lineTop);

    const pathLength2 = pathTop.node().getTotalLength();
    pathTop
      .attr('stroke-dasharray', pathLength2)
      .attr('stroke-dashoffset', pathLength2)
      .transition()
      .duration(1500)
      .delay(500)
      .attr('stroke-dashoffset', 0)
      .on('end', function() {
        d3.select(this).attr('stroke-dasharray', '5,5');
      });

    // Data points
    this.g.selectAll('.dot-avg')
      .data(data)
      .join('circle')
      .attr('class', 'dot-avg')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.avgCitations))
      .attr('r', 5)
      .attr('fill', colors.primary)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('r', 7);
        tooltip.show(event, `
          <strong>${d.year}</strong><br>
          Avg Citations: ${d.avgCitations}<br>
          Top Paper: ${d.topPaperCitations}
        `, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('r', 5);
        tooltip.hide();
      });

    // Legend
    const legend = this.g.append('g')
      .attr('transform', `translate(${width - 150}, 10)`);

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

    legend.append('line')
      .attr('x1', 0).attr('x2', 20)
      .attr('y1', 20).attr('y2', 20)
      .attr('stroke', colors.tertiary)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
    legend.append('text')
      .attr('x', 25).attr('y', 24)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('Top Paper');
  }

  /**
   * Step 1: Render collaboration network
   */
  renderCollaborationNetwork() {
    // Use balanced margins for force-directed graph (centered)
    this.setMargins({ left: 50, right: 50 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Network graph showing researcher collaborations');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Research Collaboration Network');

    // Create simulation data copies
    const nodes = collaborationNetworkData.nodes.map(d => ({...d}));
    const links = collaborationNetworkData.links.map(d => ({...d}));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Draw links
    const link = this.g.selectAll('.link')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', colors.outlineVariant)
      .attr('stroke-width', d => Math.sqrt(d.weight))
      .attr('stroke-opacity', 0.6);

    // Draw nodes
    const node = this.g.selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    node.append('circle')
      .attr('r', d => Math.sqrt(d.papers) * 3 + 10)
      .attr('fill', d => countryColors[d.country] || colors.primary)
      .attr('stroke', colors.surface)
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => d.id.split(' ')[1]);

    // Tooltip
    node.on('mouseenter', function(event, d) {
      tooltip.show(event, `
        <strong>${d.id}</strong><br>
        Institution: ${d.institution}<br>
        Country: ${d.country}<br>
        Papers: ${d.papers}
      `, colors);
    })
    .on('mouseleave', () => tooltip.hide());

    // Update on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legendData = Object.entries(countryColors).slice(0, 5);
    const legend = this.g.append('g')
      .attr('transform', `translate(${width - 80}, ${height - 100})`);

    legend.append('text')
      .attr('y', -10)
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('fill', colors.onSurfaceVariant)
      .text('Country');

    legendData.forEach(([country, color], i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(0, ${i * 18})`);
      
      lg.append('circle')
        .attr('r', 6)
        .attr('fill', color);
      
      lg.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .style('font-size', '10px')
        .style('fill', colors.onSurfaceVariant)
        .text(country);
    });
  }

  /**
   * Step 2: Render topic evolution stacked area chart
   */
  renderTopicEvolution() {
    // Use margins for stacked area chart with rotated y-axis label
    this.setMargins({ left: 70, right: 140 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = topicEvolutionData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Stacked area chart showing topic evolution over time');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Topic Evolution Over 35 Years');

    // Get topic keys
    const topics = Object.keys(topicColors);

    // Stack generator
    const stack = d3.stack()
      .keys(topics)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

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

    // Y axis label
    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Number of Papers');

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
      .attr('fill', d => topicColors[d.key])
      .attr('fill-opacity', 0.8)
      .attr('d', area)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 1);
        tooltip.show(event, `<strong>${d.key}</strong>`, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 0.8);
        tooltip.hide();
      });

    // Legend
    const legend = this.g.append('g')
      .attr('transform', `translate(${width - 130}, 10)`);

    topics.forEach((topic, i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(0, ${i * 18})`);
      
      lg.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('rx', 2)
        .attr('fill', topicColors[topic]);
      
      lg.append('text')
        .attr('x', 18)
        .attr('y', 11)
        .style('font-size', '10px')
        .style('fill', colors.onSurfaceVariant)
        .text(topic);
    });
  }

  /**
   * Step 3: Render institutional analysis scatter plot
   */
  renderInstitutionalAnalysis() {
    // Use margins for scatter plot with rotated y-axis label
    this.setMargins({ left: 70, right: 70 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = institutionalData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Scatter plot showing institutional research output');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Institutional Research Output');

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.papers) * 1.1])
      .nice()
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.citations) * 1.1])
      .nice()
      .range([height, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.papers)])
      .range([8, 30]);

    // Axes
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    this.g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d / 1000 + 'k'))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Axis labels
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Number of Papers');

    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Total Citations');

    // Draw bubbles with animation
    this.g.selectAll('.bubble')
      .data(data)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', d => xScale(d.papers))
      .attr('cy', d => yScale(d.citations))
      .attr('r', 0)
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0.6)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('r', d => sizeScale(d.papers));

    // Labels for top institutions
    this.g.selectAll('.label')
      .data(data.slice(0, 5))
      .join('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.papers) + sizeScale(d.papers) + 5)
      .attr('y', d => yScale(d.citations))
      .attr('dy', 4)
      .style('font-size', '10px')
      .style('fill', colors.onSurfaceVariant)
      .text(d => d.institution.split(' ').slice(-1)[0]);

    // Tooltip
    this.g.selectAll('.bubble')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('fill-opacity', 0.9);
        tooltip.show(event, `
          <strong>${d.institution}</strong><br>
          Country: ${d.country}<br>
          Papers: ${d.papers}<br>
          Citations: ${d.citations.toLocaleString()}<br>
          Focus: ${d.focus.join(', ')}
        `, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 0.6);
        tooltip.hide();
      });
  }

  /**
   * Step 4: Render emerging research fronts
   */
  renderEmergingFronts() {
    // Use balanced margins for bubble chart
    this.setMargins({ left: 60, right: 60 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = emergingFrontsData;
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Bubble chart showing emerging research fronts');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Emerging Research Fronts');

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.growth) * 1.1])
      .nice()
      .range([height, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.papers2024)])
      .range([10, 40]);

    // Maturity zones
    Object.values(lifecycleStages).forEach(stage => {
      this.g.append('rect')
        .attr('x', xScale(stage.min))
        .attr('y', 0)
        .attr('width', xScale(stage.max) - xScale(stage.min))
        .attr('height', height)
        .attr('fill', stage.color)
        .attr('fill-opacity', 0.1);

      this.g.append('text')
        .attr('x', xScale((stage.min + stage.max) / 2))
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', stage.color)
        .text(stage.label);
    });

    // Axes
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('.0%')))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    this.g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d + '%'))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Axis labels
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Maturity Level');

    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text('Growth Rate (%)');

    // Get color based on maturity
    const getStageColor = (maturity) => {
      for (const stage of Object.values(lifecycleStages)) {
        if (maturity >= stage.min && maturity < stage.max) {
          return stage.color;
        }
      }
      return lifecycleStages.mature.color;
    };

    // Draw bubbles
    this.g.selectAll('.bubble')
      .data(data)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', d => xScale(d.maturity))
      .attr('cy', d => yScale(d.growth))
      .attr('r', 0)
      .attr('fill', d => getStageColor(d.maturity))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => getStageColor(d.maturity))
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('r', d => sizeScale(d.papers2024));

    // Labels
    this.g.selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.maturity))
      .attr('y', d => yScale(d.growth) - sizeScale(d.papers2024) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', colors.onSurface)
      .text(d => d.topic.length > 15 ? d.topic.slice(0, 12) + '...' : d.topic);

    // Tooltip
    this.g.selectAll('.bubble')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 1);
        tooltip.show(event, `
          <strong>${d.topic}</strong><br>
          Growth Rate: ${d.growth}%<br>
          Papers in 2024: ${d.papers2024}<br>
          Maturity: ${(d.maturity * 100).toFixed(0)}%
        `, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 0.7);
        tooltip.hide();
      });
  }

  /**
   * Handle resize
   */
  resize() {
    this.createSvg();
    this.transitionToStep(this.currentStep, null, this.currentStep);
  }

  /**
   * Handle theme change
   */
  onThemeChange() {
    this.transitionToStep(this.currentStep, null, this.currentStep);
  }
}
