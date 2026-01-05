/**
 * dataset/plots/conferenceData.js
 * ============================================================================
 * DATA LOADER + METADATA: Papers by Conference Track
 *
 * - Loads real counts from a CSV file (Conference,Count).
 * - Enriches data with colors + descriptions stored in JS.
 * ============================================================================
 */

/**
 * Metadata (colors + descriptions) kept in JS.
 * Keys MUST match the 'Conference' values in the CSV.
 */
export const conferenceMeta = {
  "Vis": {
    color: "#85D2E7",
    description: "VIS — Main IEEE VIS conference track (general visualization research)"
  },
  "InfoVis": {
    color: "#00687A",
    description: "InfoVis — Information Visualization: methods for visualizing abstract data (e.g., networks, tables, text)"
  },
  "VAST": {
    color: "#4B6269",
    description: "VAST — Visual Analytics: interactive systems that support analytical reasoning and decision-making"
  },
  "SciVis": {
    color: "#575C7E",
    description: "SciVis — Scientific Visualization: visualization of physical/scientific data (e.g., simulations, volume, flow)"
  }
};


/**
 * Conference track descriptions for tooltips (kept for compatibility with your donut code)
 */
export const conferenceDescriptions = Object.fromEntries(
  Object.entries(conferenceMeta).map(([k, v]) => [k, v.description])
);

/**
 * Loads conference counts from CSV and enriches with color.
 * @param {Object} d3 - D3.js library reference
 * @param {string} csvUrl - URL/path to the CSV (relative to the HTML page, not this JS file!)
 * @returns {Promise<Array<{conference:string,count:number,color:string}>>}
 */
export async function loadConferenceData(d3, csvUrl = "./conferenceData.csv") {
  const rows = await d3.csv(csvUrl, (d) => {
    const conference = (d.Conference ?? "").trim();
    const count = Number(d.Count);

    return {
      conference,
      count: Number.isFinite(count) ? count : 0
    };
  });

  // Enrich with color (fallback if missing in meta)
  return rows
    .filter(d => d.conference.length > 0)
    .map(d => ({
      ...d,
      color: conferenceMeta[d.conference]?.color ?? "#999999"
    }));
}
