// ============================================================================
// AUTHORS VISUALIZATION
// Scrollytelling visualization for the Authors page
// ============================================================================

import { ScrollyVisualization, getThemeColors, createTooltip } from '../../assets/js/visualization-base.js';
import { demographicsData } from './demographicsData.js';
import { collaborationData } from './collaborationData.js';
import { prolificAuthorsData } from './prolificAuthorsData.js';
import { careerTrajectoryData } from './careerTrajectoryData.js';
import { diversityData } from './diversityData.js';

export class AuthorsVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId);
    this.currentStep = -1;
    this.tooltip = null;
    
    // Default margin
    this.defaultMargin = { top: 60, right: 40, bottom: 60, left: 60 };
    this.margin = { ...this.defaultMargin };
  }

  /**
   * Initialize the visualization
   */
  async init(d3) {
    await super.init(d3);
    this.tooltip = createTooltip(d3, 'authors-tooltip');
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
   * Set custom margins for specific visualizations
   */
  setMargins(margins) {
    this.margin = { ...this.defaultMargin, ...margins };
    this.g.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  /**
   * Transition to a specific step in the scrollytelling sequence
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
          this.renderDemographics();
          break;
        case 1:
          this.renderCollaborationNetwork();
          break;
        case 2:
          this.renderProlificAuthors();
          break;
        case 3:
          this.renderCareerTrajectory();
          break;
        case 4:
          this.renderDiversityTrends();
          break;
        default:
          this.renderDemographics();
      }
    }, 250);
  }

  // ============================================================================
  // STEP 0: AUTHOR DEMOGRAPHICS (Horizontal Bar Chart)
  // ============================================================================
  renderDemographics() {
    // Set larger left margin for horizontal bar labels
    this.setMargins({ left: 140 });
    
    const data = demographicsData.byCareerStage;
    const d3 = this.d3;
    const { width, height } = this.getInnerDimensions();

    // Title
    this.g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text('Authors by Career Stage')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) * 1.1])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.stage))
      .range([0, height])
      .padding(0.3);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.stage))
      .range([
        'var(--md-sys-color-primary)',
        'var(--md-sys-color-secondary)',
        'var(--md-sys-color-tertiary)',
        '#7c4dff',
        '#00bfa5',
        '#ff6d00'
      ]);

    // X axis
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d >= 1000 ? (d/1000) + 'k' : d))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Y axis
    this.g.append('g')
      .attr('class', 'y-axis')
      .style('opacity', 0)
      .call(d3.axisLeft(y))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Bars
    const bars = this.g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.stage))
      .attr('height', y.bandwidth())
      .attr('width', 0)
      .attr('fill', d => color(d.stage))
      .attr('rx', 4);

    bars.transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('width', d => x(d.count));

    // Percentage labels
    this.g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.count) + 8)
      .attr('y', d => y(d.stage) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .style('opacity', 0)
      .text(d => `${d.percentage}%`)
      .transition()
      .duration(500)
      .delay((d, i) => 800 + i * 100)
      .style('opacity', 1);

    this.styleAxes();
  }

  // ============================================================================
  // STEP 1: COLLABORATION NETWORK GROWTH (Line + Area Chart)
  // ============================================================================
  renderCollaborationNetwork() {
    this.setMargins({ left: 70 });
    
    const data = collaborationData.networkGrowth;
    const d3 = this.d3;
    const { width, height } = this.getInnerDimensions();

    // Title
    this.g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text('Collaboration Network Growth')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const yAuthors = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.authors) * 1.1])
      .range([height, 0]);

    const yDegree = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avgDegree) * 1.2])
      .range([height, 0]);

    // X axis
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Left Y axis (Authors)
    this.g.append('g')
      .attr('class', 'y-axis-left')
      .style('opacity', 0)
      .call(d3.axisLeft(yAuthors).ticks(5).tickFormat(d => d >= 1000 ? (d/1000) + 'k' : d))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Left Y axis label
    this.g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-primary)')
      .text('Unique Authors');

    // Area for authors
    const areaAuthors = d3.area()
      .x(d => x(d.year))
      .y0(height)
      .y1(d => yAuthors(d.authors))
      .curve(d3.curveMonotoneX);

    this.g.append('path')
      .datum(data)
      .attr('class', 'area-authors')
      .attr('fill', 'var(--md-sys-color-primary)')
      .attr('fill-opacity', 0.2)
      .attr('d', areaAuthors)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);

    // Line for authors
    const lineAuthors = d3.line()
      .x(d => x(d.year))
      .y(d => yAuthors(d.authors))
      .curve(d3.curveMonotoneX);

    const pathAuthors = this.g.append('path')
      .datum(data)
      .attr('class', 'line-authors')
      .attr('fill', 'none')
      .attr('stroke', 'var(--md-sys-color-primary)')
      .attr('stroke-width', 3)
      .attr('d', lineAuthors);

    // Animate line
    const totalLengthAuthors = pathAuthors.node().getTotalLength();
    pathAuthors
      .attr('stroke-dasharray', totalLengthAuthors)
      .attr('stroke-dashoffset', totalLengthAuthors)
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0);

    // Line for avg degree
    const lineDegree = d3.line()
      .x(d => x(d.year))
      .y(d => yDegree(d.avgDegree))
      .curve(d3.curveMonotoneX);

    const pathDegree = this.g.append('path')
      .datum(data)
      .attr('class', 'line-degree')
      .attr('fill', 'none')
      .attr('stroke', 'var(--md-sys-color-tertiary)')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '8,4')
      .attr('d', lineDegree);

    const totalLengthDegree = pathDegree.node().getTotalLength();
    pathDegree
      .attr('stroke-dasharray', totalLengthDegree)
      .attr('stroke-dashoffset', totalLengthDegree)
      .transition()
      .duration(1500)
      .delay(500)
      .attr('stroke-dashoffset', 0)
      .on('end', function() {
        d3.select(this).attr('stroke-dasharray', '8,4');
      });

    // Legend
    const legend = this.g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 160}, 20)`)
      .style('opacity', 0);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 3)
      .attr('fill', 'var(--md-sys-color-primary)');

    legend.append('text')
      .attr('x', 28)
      .attr('y', 4)
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .text('Unique Authors');

    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 20)
      .attr('x2', 20)
      .attr('y2', 20)
      .attr('stroke', 'var(--md-sys-color-tertiary)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2');

    legend.append('text')
      .attr('x', 28)
      .attr('y', 24)
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .text('Avg. Collaborators');

    legend.transition()
      .duration(500)
      .delay(1200)
      .style('opacity', 1);

    this.styleAxes();
  }

  // ============================================================================
  // STEP 2: PROLIFIC AUTHORS (Bubble/Scatter Chart)
  // ============================================================================
  renderProlificAuthors() {
    this.setMargins({ left: 70, right: 60 });
    
    const data = prolificAuthorsData.topByPapers;
    const d3 = this.d3;
    const { width, height } = this.getInnerDimensions();

    // Title
    this.g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text('Top Authors: Papers vs Citations')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.papers) * 1.1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.citations) * 1.1])
      .range([height, 0]);

    const radius = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.hIndex)])
      .range([8, 35]);

    // X axis
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)
      .call(d3.axisBottom(x).ticks(6))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Y axis
    this.g.append('g')
      .attr('class', 'y-axis')
      .style('opacity', 0)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d/1000) + 'k' : d))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Axis labels
    this.g.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('Number of Papers');

    this.g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('Total Citations');

    // Bubbles
    const bubbles = this.g.selectAll('.bubble')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bubble-group');

    bubbles.append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => x(d.papers))
      .attr('cy', d => y(d.citations))
      .attr('r', 0)
      .attr('fill', 'var(--md-sys-color-primary)')
      .attr('fill-opacity', 0.6)
      .attr('stroke', 'var(--md-sys-color-primary)')
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('r', d => radius(d.hIndex));

    // Author labels (for top authors)
    bubbles.filter((d, i) => i < 5)
      .append('text')
      .attr('class', 'bubble-label')
      .attr('x', d => x(d.papers))
      .attr('y', d => y(d.citations) - radius(d.hIndex) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text(d => d.name.split(' ').slice(-1)[0])  // Last name only
      .transition()
      .duration(500)
      .delay((d, i) => 800 + i * 80)
      .style('opacity', 1);

    // Size legend
    const legendData = [30, 40, 50];
    const legendX = width - 80;
    const legendY = 30;

    const sizeLegend = this.g.append('g')
      .attr('class', 'size-legend')
      .attr('transform', `translate(${legendX}, ${legendY})`)
      .style('opacity', 0);

    sizeLegend.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .style('font-size', '11px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('h-index');

    sizeLegend.selectAll('.legend-circle')
      .data(legendData)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => i * 30)
      .attr('cy', 20)
      .attr('r', d => radius(d) / 2)
      .attr('fill', 'none')
      .attr('stroke', 'var(--md-sys-color-outline)')
      .attr('stroke-width', 1);

    sizeLegend.selectAll('.legend-text')
      .data(legendData)
      .enter()
      .append('text')
      .attr('x', (d, i) => i * 30)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text(d => d);

    sizeLegend.transition()
      .duration(500)
      .delay(1000)
      .style('opacity', 1);

    this.styleAxes();
  }

  // ============================================================================
  // STEP 3: CAREER TRAJECTORY (Grouped Bar Chart)
  // ============================================================================
  renderCareerTrajectory() {
    this.setMargins({ left: 60, bottom: 80 });
    
    const data = careerTrajectoryData.papersByStage;
    const d3 = this.d3;
    const { width, height } = this.getInnerDimensions();

    // Title
    this.g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text('Publication Rate by Career Stage')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.stage))
      .range([0, width])
      .padding(0.3);

    const x1 = d3.scaleBand()
      .domain(['avgPapers', 'medianPapers'])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.avgPapers, d.medianPapers)) * 1.2])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(['avgPapers', 'medianPapers'])
      .range(['var(--md-sys-color-primary)', 'var(--md-sys-color-tertiary)']);

    // X axis
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em')
      .attr('transform', 'rotate(-25)');

    this.g.select('.x-axis')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Y axis
    this.g.append('g')
      .attr('class', 'y-axis')
      .style('opacity', 0)
      .call(d3.axisLeft(y).ticks(5))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Y axis label
    this.g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('Papers per Year');

    // Grouped bars
    const groups = this.g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${x0(d.stage)}, 0)`);

    // Average bars
    groups.append('rect')
      .attr('class', 'bar-avg')
      .attr('x', x1('avgPapers'))
      .attr('y', height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', color('avgPapers'))
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => y(d.avgPapers))
      .attr('height', d => height - y(d.avgPapers));

    // Median bars
    groups.append('rect')
      .attr('class', 'bar-median')
      .attr('x', x1('medianPapers'))
      .attr('y', height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', color('medianPapers'))
      .attr('rx', 3)
      .transition()
      .duration(800)
      .delay((d, i) => 100 + i * 100)
      .attr('y', d => y(d.medianPapers))
      .attr('height', d => height - y(d.medianPapers));

    // Legend
    const legend = this.g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 120}, 10)`)
      .style('opacity', 0);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', color('avgPapers'))
      .attr('rx', 2);

    legend.append('text')
      .attr('x', 22)
      .attr('y', 13)
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .text('Average');

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 24)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', color('medianPapers'))
      .attr('rx', 2);

    legend.append('text')
      .attr('x', 22)
      .attr('y', 37)
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .text('Median');

    legend.transition()
      .duration(500)
      .delay(1000)
      .style('opacity', 1);

    this.styleAxes();
  }

  // ============================================================================
  // STEP 4: DIVERSITY TRENDS (Stacked Area Chart)
  // ============================================================================
  renderDiversityTrends() {
    this.setMargins({ left: 60 });
    
    const data = diversityData.genderTrends;
    const d3 = this.d3;
    const { width, height } = this.getInnerDimensions();

    // Title
    this.g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text('Gender Diversity Trends')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Stack the data
    const keys = ['female', 'male'];
    const stack = d3.stack().keys(keys);
    const stackedData = stack(data);

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(['var(--md-sys-color-tertiary)', 'var(--md-sys-color-primary)']);

    // X axis
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Y axis
    this.g.append('g')
      .attr('class', 'y-axis')
      .style('opacity', 0)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Y axis label
    this.g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('Percentage of Authors');

    // Area generator
    const area = d3.area()
      .x(d => x(d.data.year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw stacked areas
    this.g.selectAll('.area-layer')
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', 'area-layer')
      .attr('fill', d => color(d.key))
      .attr('fill-opacity', 0.8)
      .attr('d', area)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);

    // Annotation line for target
    const targetY = y(50);
    this.g.append('line')
      .attr('class', 'target-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', targetY)
      .attr('y2', targetY)
      .attr('stroke', 'var(--md-sys-color-outline)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0)
      .transition()
      .duration(500)
      .delay(800)
      .style('opacity', 0.6);

    // Latest data point annotation
    const latestData = data[data.length - 1];
    const annotationG = this.g.append('g')
      .attr('class', 'annotation')
      .attr('transform', `translate(${x(latestData.year) + 10}, ${y(latestData.female / 2)})`)
      .style('opacity', 0);

    annotationG.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', 'var(--md-sys-color-tertiary)')
      .text(`${latestData.female}%`);

    annotationG.append('text')
      .attr('x', 0)
      .attr('y', 16)
      .style('font-size', '11px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('women');

    annotationG.transition()
      .duration(500)
      .delay(1200)
      .style('opacity', 1);

    // Legend
    const legend = this.g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 10)`)
      .style('opacity', 0);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', color('female'))
      .attr('rx', 2);

    legend.append('text')
      .attr('x', 22)
      .attr('y', 13)
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .text('Women');

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 24)
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', color('male'))
      .attr('rx', 2);

    legend.append('text')
      .attr('x', 22)
      .attr('y', 37)
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .text('Men');

    legend.transition()
      .duration(500)
      .delay(1000)
      .style('opacity', 1);

    this.styleAxes();
  }

  /**
   * Apply consistent styling to axes
   */
  styleAxes() {
    this.g.selectAll('.domain')
      .style('stroke', 'var(--md-sys-color-outline)');
    
    this.g.selectAll('.tick line')
      .style('stroke', 'var(--md-sys-color-outline-variant)');
    
    this.g.selectAll('.tick text')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .style('font-size', '11px');
  }
}
