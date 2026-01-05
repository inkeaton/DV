/**
 * assets/js/shell.js
 * ============================================================================
 * SHELL COMPONENTS BARREL FILE
 * 
 * This module imports and re-exports all shell web components for convenient
 * single-import usage. Components are now split into separate files:
 * - components/app-header.js: Top navigation bar with theme toggle
 * - components/app-drawer.js: Mobile slide-out navigation menu
 * - components/app-footer.js: Footer with project info and team members
 * 
 * Usage (backward compatible):
 *   <script type="module" src="./assets/js/shell.js"></script>
 *   <body>
 *     <app-header></app-header>
 *     <app-drawer></app-drawer>
 *     <!-- main content -->
 *     <app-footer></app-footer>
 *   </body>
 * 
 * Or import components individually:
 *   import './assets/js/components/app-header.js';
 * ============================================================================
 */

// Import all shell components
import "./components/app-header.js";
import "./components/app-drawer.js";
import "./components/app-footer.js";

// Re-export utilities for direct access if needed
export { SITE, createShellHelpers } from "./shell-utils.js";
