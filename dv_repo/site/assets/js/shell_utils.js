// assets/js/shell-utils.js
// ============================================================================
// SHARED HELPERS
// ============================================================================

export const SITE = {
    REPO: "DV",
    BRAND: "DV2",
};

export function createShellHelpers() {
    const isGitHubPages = location.hostname.endsWith("github.io");
    const BASE = isGitHubPages ? `/${SITE.REPO}` : "";

    const inPages = window.location.pathname.includes("/pages/");

    const build = (fromRoot, fromPages) => {
        const relPath = inPages ? fromPages : fromRoot;
        const cleaned = relPath === "./" ? "" : relPath;

        if (BASE) {
            if (cleaned === "" || cleaned === "../" || cleaned === "../../") return `${BASE}/`;

            const pagesIdx = cleaned.indexOf("pages/");
            if (pagesIdx !== -1) return `${BASE}/${cleaned.slice(pagesIdx)}`;

            // fallback
            return `${BASE}/${cleaned.replace(/^(\.\/|(\.\.\/)+)/, "")}`;
        }

        return relPath;
    };

    // Helper
    const asset = (fromRoot, fromPages) => {
        if (BASE) return `${BASE}/assets/img/${fromRoot.split("/").pop()}`; // /DV/assets/img/...
        return inPages ? fromPages : fromRoot; 
    };

    return { BASE, inPages, build, asset };
}
