/**
 * test_site/assets/js/shell_utils.js
 * ============================================================================
 * SHARED HELPERS FOR SHELL COMPONENTS
 * - Funziona in locale con /site/ e su GitHub Pages con /<REPO>/
 * ============================================================================
 */

export const SITE = {
  REPO: "DV",
  BRAND: "VIS 35",
};

/** Rimuove ./ e / iniziali per ottenere un path relativo pulito */
function toRelPath(p) {
  return String(p || "").replace(/^(\.\/)+/, "").replace(/^\/+/, "");
}

/** Assicura che base finisca con uno slash singolo */
function normalizeBase(base) {
  if (!base) return "/";
  base = String(base);
  if (!base.startsWith("/")) base = "/" + base;
  base = base.replace(/\/+$/, "");
  return base === "" ? "/" : base + "/";
}

/** Detect base path: /DV/ su GitHub Pages, /site/ in locale, altrimenti / */
function detectBasePath(pathname) {
  const repo = SITE.REPO;

  // GitHub Pages: /DV/ oppure /DV/....
  if (pathname === `/${repo}` || pathname.startsWith(`/${repo}/`)) {
    return normalizeBase(`/${repo}`);
  }

  // Locale: /site/....
  if (pathname === "/site" || pathname.startsWith("/site/")) {
    return normalizeBase("/site");
  }

  // Fallback: root
  return "/";
}

/** Toglie il basePath dall’inizio di pathname e restituisce un relativo */
function stripBasePath(pathname, basePath) {
  const base = normalizeBase(basePath);
  const p = String(pathname || "");
  if (base !== "/" && p.startsWith(base)) return p.slice(base.length);
  if (base === "/" && p.startsWith("/")) return p.slice(1);
  return p.replace(/^\/+/, "");
}

/** Normalizza per confronto “active”: /DV/ => index.html */
function normalizeForActive(rel) {
  rel = String(rel || "").replace(/^\/+/, "");
  if (rel === "" || rel.endsWith("/")) return rel + "index.html";
  return rel;
}

export function createShellHelpers() {
  const basePath = detectBasePath(window.location.pathname);

  const page = (rel) => normalizeBase(basePath) + toRelPath(rel);
  const asset = (rel) => normalizeBase(basePath) + toRelPath(rel);

  const currentRel = () =>
    normalizeForActive(stripBasePath(window.location.pathname, basePath));

  const isActive = (href) => {
    // href può essere relativo o assoluto: lo normalizziamo via URL
    const hrefPathname = new URL(href, window.location.href).pathname;
    const hrefRel = normalizeForActive(stripBasePath(hrefPathname, basePath));
    return currentRel() === hrefRel;
  };

  return { basePath, page, asset, stripBasePath, currentRel, isActive };
}
