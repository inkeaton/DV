/**
 * student/plots/studentVisualization.js
 * ============================================================================
 * STUDENT PAGE VISUALIZATION CONTROLLER
 * 
 * This module manages all visualizations for the student scrollytelling page.
 * It handles step transitions and renders appropriate visualizations for each
 * narrative section.
 * 
 * Steps:
 * 0 - Introduction / Topic Popularity Bar Chart
 * 1 - Beginner-Friendly Areas Treemap
 * 2 - Geographic Opportunities Bar Chart
 * 3 - Collaboration Network Force Graph
 * 4 - Awards Overview Bar Chart
 * ============================================================================
 */

import { ScrollyVisualization, getThemeColors, createTooltip } from '../../assets/js/visualization-base.js';
import { topicPopularityData, difficultyColors } from './topicPopularityData.js';
import { beginnerAreasData } from './beginnerAreasData.js';
import { geographicData, topUniversities } from './geographicData.js';
import { collaborationData, nodeColors, authorshipStats } from './collaborationData.js';
import { awardsData, studentAwardTimeline } from './awardsData.js';

/**
 * Student visualization class
 * Extends the base ScrollyVisualization to handle student-specific content
 */
export class StudentVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId);
    this.tooltip = null;
    this.defaultMargin = { top: 50, right: 50, bottom: 70, left: 50 };
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
    this.tooltip = createTooltip(d3, 'student-tooltip');
    
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
        this.renderTopicPopularity();
        break;
      case 1:
        this.renderBeginnerAreas();
        break;
      case 2:
        this.renderGeographic();
        break;
      case 3:
        this.renderCollaboration();
        break;
      case 4:
        this.renderAwards();
        break;
      default:
        this.renderTopicPopularity();
    }
  }

  /**
   * Step 0: Render topic popularity bar chart
   */
  renderTopicPopularity() {
    // Use larger left margin for horizontal bar chart labels
    this.setMargins({ left: 180 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = [...topicPopularityData].sort((a, b) => b.growth - a.growth);

    this.svg.attr('aria-label', 'Bar chart showing trending research topics by growth rate');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Trending Topics by Growth Rate');

    // Scales
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.topic))
      .range([0, height])
      .padding(0.2);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.growth)])
      .nice()
      .range([0, width]);

    // X Axis
    this.g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '%'))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant);

    // Y Axis
    this.g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurface)
      .style('font-size', '12px');

    // Bars
    this.g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.topic))
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', 0)
      .attr('fill', d => difficultyColors[d.difficulty])
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('width', d => xScale(d.growth));

    // X axis label
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '14px')
      .text('Growth Rate (%)');

    // Legend
    const legendData = [
      { label: 'Beginner', color: difficultyColors.beginner },
      { label: 'Intermediate', color: difficultyColors.intermediate },
      { label: 'Advanced', color: difficultyColors.advanced }
    ];

    const legend = this.g.append('g')
      .attr('transform', `translate(${width - 120}, -30)`);

    legendData.forEach((item, i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(${i * 90}, 0)`);
      
      lg.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', item.color);
      
      lg.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .style('font-size', '11px')
        .style('fill', colors.onSurfaceVariant)
        .text(item.label);
    });
  }

  /**
   * Step 1: Render beginner areas treemap
   */
  renderBeginnerAreas() {
    // Use balanced margins for treemap (centered)
    this.setMargins({ left: 50, right: 50 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Treemap showing beginner-friendly research areas');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Beginner-Friendly Research Areas');

    // Create hierarchy
    const root = d3.hierarchy(beginnerAreasData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Create treemap layout
    d3.treemap()
      .size([width, height])
      .padding(3)
      .round(true)(root);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(beginnerAreasData.children.map(d => d.name))
      .range(d3.schemeTableau10);

    // Render leaves
    const leaf = this.g.selectAll('.leaf')
      .data(root.leaves())
      .join('g')
      .attr('class', 'leaf')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    leaf.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.name))
      .attr('fill-opacity', 0.8)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('fill-opacity', 1);
        tooltip.show(event, `
          <strong>${d.data.name}</strong><br>
          ${d.data.value} papers<br>
          <small>${d.data.description}</small>
        `, colors);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill-opacity', 0.8);
        tooltip.hide();
      });

    // Labels (only for larger boxes)
    leaf.append('text')
      .attr('x', 6)
      .attr('y', 20)
      .style('font-size', d => {
        const boxWidth = d.x1 - d.x0;
        return boxWidth > 80 ? '12px' : '10px';
      })
      .style('font-weight', '500')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => {
        const boxWidth = d.x1 - d.x0;
        return boxWidth > 60 ? d.data.name : '';
      });

    leaf.append('text')
      .attr('x', 6)
      .attr('y', 36)
      .style('font-size', '11px')
      .style('fill', 'rgba(255,255,255,0.8)')
      .style('pointer-events', 'none')
      .text(d => {
        const boxWidth = d.x1 - d.x0;
        return boxWidth > 80 ? `${d.data.value} papers` : '';
      });
  }

  /**
   * Step 2: Render geographic opportunities
   */
  renderGeographic() {
    // Use larger left margin for country name labels
    this.setMargins({ left: 120 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const data = geographicData.slice(0, 8);

    this.svg.attr('aria-label', 'Bar chart showing research opportunities by country');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Research Opportunities by Country');

    // Scales
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, height])
      .padding(0.15);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.programs)])
      .nice()
      .range([0, width * 0.4]);

    const xScale2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.universities)])
      .nice()
      .range([0, width * 0.4]);

    // Y Axis
    this.g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurface)
      .style('font-size', '12px');

    // Programs bars
    this.g.selectAll('.bar-programs')
      .data(data)
      .join('rect')
      .attr('class', 'bar-programs')
      .attr('y', d => yScale(d.country))
      .attr('x', 0)
      .attr('height', yScale.bandwidth() / 2 - 2)
      .attr('width', 0)
      .attr('fill', colors.primary)
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('width', d => xScale(d.programs));

    // Universities bars
    this.g.selectAll('.bar-unis')
      .data(data)
      .join('rect')
      .attr('class', 'bar-unis')
      .attr('y', d => yScale(d.country) + yScale.bandwidth() / 2 + 2)
      .attr('x', 0)
      .attr('height', yScale.bandwidth() / 2 - 2)
      .attr('width', 0)
      .attr('fill', colors.tertiary)
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('width', d => xScale2(d.universities));

    // Legend
    const legend = this.g.append('g')
      .attr('transform', `translate(${width - 150}, -25)`);

    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('fill', colors.primary);

    legend.append('text')
      .attr('x', 16)
      .attr('y', 10)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('PhD Programs');

    legend.append('rect')
      .attr('x', 90)
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('fill', colors.tertiary);

    legend.append('text')
      .attr('x', 106)
      .attr('y', 10)
      .style('font-size', '11px')
      .style('fill', colors.onSurfaceVariant)
      .text('Universities');
  }

  /**
   * Step 3: Render collaboration network
   */
  renderCollaboration() {
    // Use balanced margins for force-directed graph (centered)
    this.setMargins({ left: 50, right: 50 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();
    const tooltip = this.tooltip;

    this.svg.attr('aria-label', 'Network graph showing typical collaboration patterns');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Typical Collaboration Patterns');

    // Create force simulation
    const nodes = collaborationData.nodes.map(d => ({...d}));
    const links = collaborationData.links.map(d => ({...d}));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

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
      .attr('r', d => Math.sqrt(d.papers) * 4 + 8)
      .attr('fill', d => nodeColors[d.type])
      .attr('stroke', colors.surface)
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text(d => d.id.split(' ')[0]);

    // Tooltip interactions
    node.on('mouseenter', function(event, d) {
      tooltip.show(event, `
        <strong>${d.id}</strong><br>
        Type: ${d.type}<br>
        Papers: ${d.papers}
      `, colors);
    })
    .on('mouseleave', () => tooltip.hide());

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legendData = Object.entries(nodeColors);
    const legend = this.g.append('g')
      .attr('transform', `translate(${width - 100}, ${height - 80})`);

    legendData.forEach(([type, color], i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(0, ${i * 18})`);
      
      lg.append('circle')
        .attr('r', 6)
        .attr('fill', color);
      
      lg.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .style('font-size', '11px')
        .style('fill', colors.onSurfaceVariant)
        .style('text-transform', 'capitalize')
        .text(type);
    });
  }

  /**
   * Step 4: Render awards overview
   */
  renderAwards() {
    // Use larger left margin for award type labels in horizontal bar chart
    this.setMargins({ left: 130, right: 50 });
    
    const d3 = this.d3;
    const colors = this.getColors();
    const { width, height } = this.getInnerDimensions();

    this.svg.attr('aria-label', 'Bar chart showing IEEE VIS award types and student award timeline');

    // Title
    this.g.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('fill', colors.onSurface)
      .text('Awards & Recognition');

    // Split visualization: awards (left) + timeline (right)
    const leftWidth = width * 0.45;
    const rightWidth = width * 0.45;
    const gap = width * 0.1;

    // Left: Award types bar chart
    const leftG = this.g.append('g');

    const yScale = d3.scaleBand()
      .domain(awardsData.map(d => d.type))
      .range([0, height])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(awardsData, d => d.count)])
      .nice()
      .range([0, leftWidth]);

    leftG.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.onSurface)
      .style('font-size', '11px');

    leftG.selectAll('.bar')
      .data(awardsData)
      .join('rect')
      .attr('y', d => yScale(d.type))
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', 0)
      .attr('fill', colors.primary)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('width', d => xScale(d.count));

    leftG.selectAll('.label')
      .data(awardsData)
      .join('text')
      .attr('y', d => yScale(d.type) + yScale.bandwidth() / 2)
      .attr('x', d => xScale(d.count) + 8)
      .attr('dy', '0.35em')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '12px')
      .text(d => d.count);

    // Right: Student awards timeline
    const rightG = this.g.append('g')
      .attr('transform', `translate(${leftWidth + gap}, 0)`);

    rightG.append('text')
      .attr('x', rightWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', colors.onSurfaceVariant)
      .text('Student Best Paper Awards Over Time');

    const xScale2 = d3.scaleBand()
      .domain(studentAwardTimeline.map(d => d.year))
      .range([0, rightWidth])
      .padding(0.2);

    const yScale2 = d3.scaleLinear()
      .domain([0, d3.max(studentAwardTimeline, d => d.count)])
      .nice()
      .range([height, 20]);

    rightG.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale2).tickFormat(d => "'" + String(d).slice(2)))
      .selectAll('text')
      .style('fill', colors.onSurfaceVariant)
      .style('font-size', '10px');

    rightG.selectAll('.bar2')
      .data(studentAwardTimeline)
      .join('rect')
      .attr('x', d => xScale2(d.year))
      .attr('y', height)
      .attr('width', xScale2.bandwidth())
      .attr('height', 0)
      .attr('fill', colors.tertiary)
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay((d, i) => i * 60)
      .attr('y', d => yScale2(d.count))
      .attr('height', d => height - yScale2(d.count));
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
