/**
 * dataset/plots/topicData.js
 * ============================================================================
 * DATA LOADER + METADATA: Papers by Topic Category
 *
 * - Loads real counts from CSV (MacroCategory,Count).
 * - Enriches each category with a fixed color stored in JS.
 * ============================================================================
 */

/**
 * Fixed colors per category (UI metadata).
 * IMPORTANT: The 'category' strings must match the CSV values (after normalization).
 */
export const topicColors = [
  { category: "Meshes & Volume Rendering", color: "#00687A" },
  { category: "Flow Fields & CFD Visualization", color: "#4B6269" },
  { category: "Dimensionality Reduction & Multivariate Plots", color: "#575C7E" },
  { category: "Surgical Planning & Tomography", color: "#85D2E7" },
  { category: "Diffusion MRI & Tractography", color: "#B2CBD3" },
  { category: "VIS Literature & Bibliometrics", color: "#BFC4EB" },
  { category: "Twitter & Social Media", color: "#ADECFF" },
  { category: "Dashboards & Infographics", color: "#CEE7EF" },
  { category: "Time Series & Temporal Patterns", color: "#DEE1FF" },
  { category: "Ultrasound Volume Rendering & Segmentation", color: "#D3D6D8" }
];

/**
 * Build a fast lookup object: { [category]: { color, order } }
 */
export const topicMeta = Object.fromEntries(
  topicColors.map((d, i) => [d.category, { color: d.color, order: i }])
);

/**
 * Normalize CSV category strings:
 * - trims whitespace
 * - removes surrounding quotes if present
 */
function normalizeCategory(s) {
  const t = (s ?? "").trim();
  return t.replace(/^"(.*)"$/, "$1"); // removes one pair of wrapping quotes
}

/**
 * Loads topic counts from CSV and enriches with color.
 * CSV columns expected: MacroCategory, Count
 *
 * @param {Object} d3 - D3.js library reference
 * @param {string} csvUrl - Path relative to the HTML page
 * @returns {Promise<Array<{category:string,count:number,color:string}>>}
 */
export async function loadTopicData(d3, csvUrl = "./topicData.csv") {
  const rows = await d3.csv(csvUrl, (d) => {
    const category = normalizeCategory(d.MacroCategory);
    const countRaw = String(d.Count ?? "").replace(/,/g, "");
    const count = Number(countRaw);

    return {
      category,
      count: Number.isFinite(count) ? count : 0
    };
  });

  // Enrich with color + keep stable ordering (based on topicColors list)
  const enriched = rows
    .filter(d => d.category.length > 0)
    .map(d => ({
      ...d,
      color: topicMeta[d.category]?.color ?? "#999999",
      _order: topicMeta[d.category]?.order ?? 9999
    }))
    .sort((a, b) => a._order - b._order)
    .map(({ _order, ...rest }) => rest);

  return enriched;
}
