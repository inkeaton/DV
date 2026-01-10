/**
 * papers/plots/papersVisualization.js
 * ============================================================================
 * PAPERS PAGE VISUALIZATION CONTROLLER
 * 
 * This module manages all visualizations for the papers scrollytelling page.
 * It extends ScrollyVisualization and registers step configurations for each
 * visualization in the narrative.
 * 
 * Steps:
 * 0 - Papers Per Year (bar chart)
 * 1 - Papers by Conference Track (stacked bar chart)
 * 2 - Papers by Publication Type (stacked bar chart)
 * 3 - Topics Treemap (treemap)
 * 4 - Awards Pictogram (pictogram bar chart)
 * 5 - Citation Distribution (histogram)
 * 
 * ============================================================================
 * HOW TO ADD A NEW PLOT
 * ============================================================================
 * 
 * 1. Create a new file in papers/plots/ (e.g., myNewPlot.js):
 *    
 *    import { myData } from '../../data/papers/myNewPlotData.js';
 *    import { renderTitle, styleAxes } from '../../assets/js/chart-utils.js';
 *    
 *    export function render(ctx) {
 *      const { g, svg, d3, tooltip, width, height, colors } = ctx;
 *      // Your D3 rendering code here
 *    }
 *    
 *    export const myNewPlotConfig = {
 *      data: myData,
 *      margins: { left: 60, right: 40 },
 *      render
 *    };
 * 
 * 2. Create the data file in data/papers/myNewPlotData.js
 * 
 * 3. Import and add to stepConfigs array below
 * 
 * 4. Add the corresponding HTML step in papers.html
 * ============================================================================
 */

import { ScrollyVisualization } from '../../assets/js/visualization-base.js';

// Import step configurations from individual plot files
import { papersPerYearConfig } from './papersPerYear.js';
import { papersByConferenceConfig } from './papersByConference.js';
import { papersByPublicationConfig } from './papersByPublication.js';
import { topicsTreemapConfig } from './topicsTreemap.js';
import { awardsWaffleIconsConfig} from './awardsWaffleIcons.js';
import { citationsHistogramConfig } from './citationsHistogram.js';

/**
 * Papers visualization class
 * Extends the base ScrollyVisualization to handle papers-specific content
 */
export class PapersVisualization extends ScrollyVisualization {
  constructor(containerId) {
    super(containerId, { tooltipClass: 'papers-tooltip' });
    
    // Register all step configurations
    this.registerSteps([
      papersPerYearConfig,
      papersByConferenceConfig,
      papersByPublicationConfig,
      topicsTreemapConfig,
      awardsWaffleIconsConfig,
      citationsHistogramConfig
    ]);
  }
}
