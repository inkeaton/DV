// ============================================================================
// RESEARCH VISUALIZATION
// Scrollytelling visualization for the Research page
// ============================================================================

import { ScrollyVisualization, getThemeColors, createTooltip } from '../../assets/js/visualization-base.js';
import { topicsData } from './topicsData.js';
import { methodologyData } from './methodologyData.js';
import { domainsData } from './domainsData.js';
import { dataTypesData } from './dataTypesData.js';
import { reproducibilityData } from './reproducibilityData.js';

export class ResearchVisualization extends ScrollyVisualization {
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
    this.tooltip = createTooltip(d3, 'research-tooltip');
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
          this.renderTopicsDistribution();
          break;
        case 1:
          this.renderMethodologyTrends();
          break;
        case 2:
          this.renderDomainApplications();
          break;
        case 3:
          this.renderDataTypes();
          break;
        case 4:
          this.renderReproducibilityTrends();
          break;
        default:
          this.renderTopicsDistribution();
      }
    }, 250);
  }

  // ============================================================================
  // STEP 0: RESEARCH TOPICS (Donut Chart)
  // ============================================================================
  renderTopicsDistribution() {
    this.setMargins({ left: 50, right: 50 });
    
    const data = topicsData.mainAreas;
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
      .text('Research Areas Distribution')
      .transition()
      .duration(500)
      .style('opacity', 1);

    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.5;

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.topic))
      .range([
        'var(--md-sys-color-primary)',
        'var(--md-sys-color-secondary)',
        'var(--md-sys-color-tertiary)',
        '#7c4dff',
        '#00bfa5',
        '#ff6d00'
      ]);

    const pie = d3.pie()
      .value(d => d.papers)
      .sort(null)
      .padAngle(0.02);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius + 15)
      .outerRadius(radius + 15);

    // Center the donut
    const donutG = this.g.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Draw arcs
    const arcs = donutG.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.topic))
      .attr('stroke', 'var(--md-sys-color-surface)')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style('opacity', 1)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Labels
    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', d => {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style('font-size', '11px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .style('opacity', 0)
      .text(d => d.data.topic.length > 15 ? d.data.topic.substring(0, 15) + '...' : d.data.topic)
      .transition()
      .duration(500)
      .delay((d, i) => 800 + i * 100)
      .style('opacity', 1);

    // Center text
    donutG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '28px')
      .style('font-weight', '700')
      .style('fill', 'var(--md-sys-color-on-surface)')
      .style('opacity', 0)
      .text('3,500+')
      .transition()
      .duration(500)
      .delay(1000)
      .style('opacity', 1);

    donutG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '14px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .style('opacity', 0)
      .text('Papers')
      .transition()
      .duration(500)
      .delay(1100)
      .style('opacity', 1);
  }

  // ============================================================================
  // STEP 1: METHODOLOGY TRENDS (Stacked Area Chart)
  // ============================================================================
  renderMethodologyTrends() {
    this.setMargins({ left: 60 });
    
    const data = methodologyData.evaluationTrends;
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
      .text('Evaluation Methods Over Time')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Stack the data
    const keys = ['userStudy', 'caseStudy', 'noEval'];
    const stack = d3.stack().keys(keys).order(d3.stackOrderReverse);
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
      .range(['var(--md-sys-color-primary)', 'var(--md-sys-color-tertiary)', 'var(--md-sys-color-outline)']);

    const labels = {
      'userStudy': 'User Study',
      'caseStudy': 'Case Study',
      'noEval': 'No Evaluation'
    };

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

    // Legend
    const legend = this.g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 130}, 10)`)
      .style('opacity', 0);

    keys.forEach((key, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);

      legendRow.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', color(key))
        .attr('rx', 2);

      legendRow.append('text')
        .attr('x', 22)
        .attr('y', 13)
        .style('font-size', '11px')
        .style('fill', 'var(--md-sys-color-on-surface)')
        .text(labels[key]);
    });

    legend.transition()
      .duration(500)
      .delay(1000)
      .style('opacity', 1);

    this.styleAxes();
  }

  // ============================================================================
  // STEP 2: DOMAIN APPLICATIONS (Lollipop Chart)
  // ============================================================================
  renderDomainApplications() {
    this.setMargins({ left: 150 });
    
    const data = domainsData.domains.slice(0, 8);
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
      .text('Application Domains')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.papers) * 1.15])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.domain))
      .range([0, height])
      .padding(0.4);

    // X axis
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)
      .call(d3.axisBottom(x).ticks(5))
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

    // Lollipop stems
    this.g.selectAll('.stem')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'stem')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', d => y(d.domain) + y.bandwidth() / 2)
      .attr('y2', d => y(d.domain) + y.bandwidth() / 2)
      .attr('stroke', 'var(--md-sys-color-outline)')
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('x2', d => x(d.papers));

    // Lollipop circles
    this.g.selectAll('.lollipop')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'lollipop')
      .attr('cx', 0)
      .attr('cy', d => y(d.domain) + y.bandwidth() / 2)
      .attr('r', 0)
      .attr('fill', d => d.growth > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)')
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('cx', d => x(d.papers))
      .attr('r', 10);

    // Growth indicators
    this.g.selectAll('.growth-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'growth-label')
      .attr('x', d => x(d.papers) + 18)
      .attr('y', d => y(d.domain) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('fill', d => d.growth > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)')
      .style('opacity', 0)
      .text(d => (d.growth > 0 ? '+' : '') + d.growth + '%')
      .transition()
      .duration(500)
      .delay((d, i) => 800 + i * 80)
      .style('opacity', 1);

    // X axis label
    this.g.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .text('Number of Papers');

    this.styleAxes();
  }

  // ============================================================================
  // STEP 3: DATA TYPES (Horizontal Bar Chart with Icons)
  // ============================================================================
  renderDataTypes() {
    this.setMargins({ left: 160 });
    
    const data = dataTypesData.types;
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
      .text('Data Types Visualized')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) * 1.1])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.type))
      .range([0, height])
      .padding(0.3);

    // Color based on position
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.type))
      .range([
        'var(--md-sys-color-primary)',
        'var(--md-sys-color-secondary)',
        'var(--md-sys-color-tertiary)',
        '#7c4dff',
        '#00bfa5',
        '#ff6d00',
        '#e91e63',
        '#9c27b0'
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
    this.g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.type))
      .attr('height', y.bandwidth())
      .attr('width', 0)
      .attr('fill', d => color(d.type))
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr('width', d => x(d.count));

    // Value labels
    this.g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.count) + 8)
      .attr('y', d => y(d.type) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('fill', 'var(--md-sys-color-on-surface-variant)')
      .style('opacity', 0)
      .text(d => d.count.toLocaleString())
      .transition()
      .duration(500)
      .delay((d, i) => 800 + i * 80)
      .style('opacity', 1);

    this.styleAxes();
  }

  // ============================================================================
  // STEP 4: REPRODUCIBILITY (Multi-Line Chart)
  // ============================================================================
  renderReproducibilityTrends() {
    this.setMargins({ left: 60 });
    
    const data = reproducibilityData.availability;
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
      .text('Open Science Adoption')
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const color = {
      code: 'var(--md-sys-color-primary)',
      data: 'var(--md-sys-color-tertiary)',
      both: 'var(--md-sys-color-secondary)'
    };

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
      .text('Percentage of Papers');

    // Line generators
    const lineCode = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.code))
      .curve(d3.curveMonotoneX);

    const lineData = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.data))
      .curve(d3.curveMonotoneX);

    const lineBoth = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.both))
      .curve(d3.curveMonotoneX);

    // Draw lines with animation
    const lines = [
      { data: data, line: lineCode, color: color.code, key: 'code', label: 'Open Code' },
      { data: data, line: lineData, color: color.data, key: 'data', label: 'Open Data' },
      { data: data, line: lineBoth, color: color.both, key: 'both', label: 'Both' }
    ];

    lines.forEach((lineConfig, i) => {
      const path = this.g.append('path')
        .datum(lineConfig.data)
        .attr('fill', 'none')
        .attr('stroke', lineConfig.color)
        .attr('stroke-width', 3)
        .attr('d', lineConfig.line);

      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .delay(i * 300)
        .attr('stroke-dashoffset', 0);

      // End point dots
      const lastPoint = lineConfig.data[lineConfig.data.length - 1];
      this.g.append('circle')
        .attr('cx', x(lastPoint.year))
        .attr('cy', y(lastPoint[lineConfig.key]))
        .attr('r', 0)
        .attr('fill', lineConfig.color)
        .transition()
        .duration(300)
        .delay(1500 + i * 300)
        .attr('r', 6);

      // End labels
      this.g.append('text')
        .attr('x', x(lastPoint.year) + 10)
        .attr('y', y(lastPoint[lineConfig.key]))
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', lineConfig.color)
        .style('opacity', 0)
        .text(`${lastPoint[lineConfig.key]}%`)
        .transition()
        .duration(300)
        .delay(1500 + i * 300)
        .style('opacity', 1);
    });

    // Legend
    const legend = this.g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 10)`)
      .style('opacity', 0);

    lines.forEach((lineConfig, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);

      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 8)
        .attr('y2', 8)
        .attr('stroke', lineConfig.color)
        .attr('stroke-width', 3);

      legendRow.append('text')
        .attr('x', 28)
        .attr('y', 12)
        .style('font-size', '11px')
        .style('fill', 'var(--md-sys-color-on-surface)')
        .text(lineConfig.label);
    });

    legend.transition()
      .duration(500)
      .delay(2000)
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
