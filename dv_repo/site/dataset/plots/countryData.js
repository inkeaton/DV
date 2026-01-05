/**
 * dataset/plots/countryData.js
 * ============================================================================
 * DATA LOADER: Papers by Country
 *
 * Loads real counts from CSV with columns: Country,Count
 * ============================================================================
 */

export async function loadCountryData(d3, csvUrl = "./countryData.csv") {
  const rows = await d3.csv(csvUrl, (d) => {
    const country = String(d.Country ?? "").trim();
    const count = Number(String(d.Count ?? "").replace(/,/g, ""));

    return {
      country,
      count: Number.isFinite(count) ? count : 0
    };
  });

  return rows
    .filter(d => d.country !== "")
    .sort((a, b) => b.count - a.count);
}
