/**
 * research/plots/researchVisualization.js
 * ============================================================================
 * RESEARCH PAGE VISUALIZATION CONTROLLER
 * 
 * This module manages all visualizations for the research scrollytelling page.
 * It extends ScrollyVisualization and registers step configurations for each
 * visualization in the narrative.
 * 
 * Steps:
 * 0 - Institutions Map (bubble map showing global distribution)
 * 1 - Institutions-Topics Sankey (connections between institutions and topics)
 * 2 - Institutions Collaboration Chord (inter-institutional collaboration network)
 * 
 * ============================================================================
 * HOW TO ADD A NEW PLOT
 * ============================================================================
 * 
 * 1. Create a new file in research/plots/ (e.g., myNewPlot.js):
 *    
 *    import { myData } from '../../data/research/myNewPlotData.js';
 *    import { renderTitle, styleAxes } from '../../assets/js/chart-utils.js';
 *    
 *    export const myNewPlotConfig = {
 *      data: myData,
 *      margins: { top: 60, right: 40, bottom: 60, left: 80 },
 *      render: (ctx) => {
 *        const { g, d3, width, height, data, colors } = ctx;
 *        // Your D3 rendering code here
 *      }
 *    };
 * 
 * 2. Create the data file in data/research/myNewPlotData.js
 * 
 * 3. Import and add to registerSteps array below
 * 
 * 4. Add the corresponding HTML step in research.html
 * ============================================================================
 */

import { ScrollyVisualization } from '../../assets/js/visualization-base.js';

// Import step configurations from individual plot files
import { institutionsMapConfig } from './institutionsMap.js';
import { institutionsTopicsSankeyConfig } from './institutionsTopicsSankey.js';
import { institutionsCollaborationChordConfig } from './institutionsCollaborationChord.js';

/**
 * Research visualization class
 * Extends the base ScrollyVisualization to handle research-specific content
 */
export class ResearchVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId, { tooltipClass: 'research-tooltip' });
    
    // Register all step configurations
    this.registerSteps([
      institutionsMapConfig,
      institutionsTopicsSankeyConfig,
      institutionsCollaborationChordConfig
    ]);
  }
}
