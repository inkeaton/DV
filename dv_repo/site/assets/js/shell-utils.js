/**
 * assets/js/shell-utils.js
 * ============================================================================
 * SHARED HELPERS FOR SHELL COMPONENTS
 * 
 * This module provides:
 * - Site configuration constants
 * - Path resolution utilities for navigation links
 * 
 * The path helpers ensure that links work correctly regardless of 
 * whether the page is at root level or in a subdirectory.
 * ============================================================================
 */

/**
 * Site configuration constants
 * @property {string} REPO - Repository name (used for GitHub Pages deployment)
 * @property {string} BRAND - Brand name displayed in the navbar
 */
export const SITE = {
  REPO: "DV",
  BRAND: "VIS 35",
};

/**
 * Creates helper functions for building correct paths based on current location.
 * 
 * The helpers account for whether the current page is:
 * - At root level (index.html)
 * - In a subdirectory (dataset/, student/, researcher/)
 * 
 * @returns {Object} Object containing path helper functions
 * @returns {string} BASE - Base path for the site
 * @returns {boolean} inSubdir - Whether current page is in a subdirectory
 * @returns {Function} build - Function to build navigation paths
 * @returns {Function} asset - Function to build asset paths
 */
export function createShellHelpers() {
  // Check if we're in a subdirectory (dataset, student, researcher)
  const pathname = window.location.pathname;
  const inSubdir = pathname.includes("/dataset/") || 
                   pathname.includes("/student/") || 
                   pathname.includes("/researcher/");

  /**
   * Build a navigation path based on current location
   * @param {string} fromRoot - Path relative to site root
   * @param {string} fromSubdir - Path relative to subdirectory
   * @returns {string} Correct path for current context
   */
  const build = (fromRoot, fromSubdir) => {
    return inSubdir ? fromSubdir : fromRoot;
  };

  /**
   * Build an asset path based on current location
   * @param {string} fromRoot - Asset path relative to site root
   * @param {string} fromSubdir - Asset path relative to subdirectory
   * @returns {string} Correct asset path for current context
   */
  const asset = (fromRoot, fromSubdir) => {
    return inSubdir ? fromSubdir : fromRoot;
  };

  return { inSubdir, build, asset };
}
