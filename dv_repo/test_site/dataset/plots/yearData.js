/**
 * dataset/plots/yearData.js
 * ============================================================================
 * DATA LOADER: Papers by Year
 *
 * Loads real counts from CSV with columns: Year,Count
 * ============================================================================
 */

/**
 * Loads year counts from CSV.
 * @param {Object} d3 - D3.js library reference
 * @param {string} csvUrl - Path relative to the HTML page
 * @returns {Promise<Array<{year:number,count:number}>>}
 */
export async function loadYearData(d3, csvUrl = "./yearData.csv") {
  const rows = await d3.csv(csvUrl, (d) => {
    const year = Number(d.Year);
    const count = Number(String(d.Count ?? "").replace(/,/g, ""));

    return {
      year: Number.isFinite(year) ? year : null,
      count: Number.isFinite(count) ? count : 0
    };
  });

  // Keep only valid years and sort ascending
  return rows
    .filter(d => d.year !== null)
    .sort((a, b) => a.year - b.year);
}
