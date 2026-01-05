/**
 * authors/plots/authorsVisualization.js
 * ============================================================================
 * AUTHORS PAGE VISUALIZATION CONTROLLER
 * 
 * This module manages all visualizations for the authors scrollytelling page.
 * It extends ScrollyVisualization and registers step configurations for each
 * visualization in the narrative.
 * 
 * Steps:
 * 0 - Authors per Paper (line chart with error area)
 * 1 - Unique Authors Timeline (cumulative area chart)
 * 2 - Collaboration Network (force-directed graph)
 * 3 - Author Metrics (bubble scatter chart)
 * 
 * ============================================================================
 * HOW TO ADD A NEW PLOT
 * ============================================================================
 * 
 * 1. Create a new file in authors/plots/ (e.g., myNewPlot.js):
 *    
 *    import { myData } from '../../data/authors/myNewPlotData.js';
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
 * 2. Create the data file in data/authors/myNewPlotData.js
 * 
 * 3. Import and add to registerSteps array below
 * 
 * 4. Add the corresponding HTML step in authors.html
 * ============================================================================
 */

import { ScrollyVisualization } from '../../assets/js/visualization-base.js';

// Import step configurations from individual plot files
import { authorsPerPaperConfig } from './authorsPerPaper.js';
import { uniqueAuthorsTimelineConfig } from './uniqueAuthorsTimeline.js';
import { collaborationNetworkConfig } from './collaborationNetwork.js';
import { authorMetricsConfig } from './authorMetrics.js';

/**
 * Authors visualization class
 * Extends the base ScrollyVisualization to handle authors-specific content
 */
export class AuthorsVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId, { tooltipClass: 'authors-tooltip' });
    
    // Register all step configurations
    this.registerSteps([
      authorsPerPaperConfig,
      uniqueAuthorsTimelineConfig,
      collaborationNetworkConfig,
      authorMetricsConfig
    ]);
  }
}

