/**
 * assets/js/components/app-header.js
 * ============================================================================
 * APP HEADER WEB COMPONENT
 * 
 * Sticky top navigation bar with:
 * - Brand logo/link
 * - Desktop navigation links
 * - Mobile menu button
 * - Theme toggle (light/dark mode)
 * 
 * Usage:
 *   <app-header></app-header>
 * ============================================================================
 */

import "@material/web/all.js";
import { SITE, createShellHelpers } from "../shell-utils.js";

/**
 * AppHeader custom element
 * Top navigation bar component
 */
class AppHeader extends HTMLElement {
  connectedCallback() {
    const { build } = createShellHelpers();

    // Build navigation paths based on current location
    const homeHref = build("./index.html", "../index.html");
    const datasetHref = build("./dataset/dataset.html", "../dataset/dataset.html");
    const papersHref = build("./papers/papers.html", "../papers/papers.html");
    const authorsHref = build("./authors/authors.html", "../authors/authors.html");
    const researchHref = build("./research/research.html", "../research/research.html");

    this.innerHTML = `
      <header class="app-bar" role="banner">
        <div class="app-bar-start">
          <!-- Mobile menu button (hidden on desktop) -->
          <md-icon-button id="menu-btn" aria-label="Open navigation menu">
            <md-icon>menu</md-icon>
          </md-icon-button>

          <!-- Brand logo/link -->
          <a href="${homeHref}" style="text-decoration: none; color: inherit;" aria-label="Go to homepage">
            <span class="brand-logo">${SITE.BRAND}</span>
          </a>
        </div>

        <div class="app-bar-end">
          <!-- Desktop navigation (hidden on mobile) -->
          <nav class="desktop-nav" aria-label="Main navigation">
            <md-text-button href="${homeHref}">Home</md-text-button>
            <md-text-button href="${datasetHref}">Dataset</md-text-button>
            <md-text-button href="${papersHref}">Papers</md-text-button>
            <md-text-button href="${authorsHref}">Authors</md-text-button>
            <md-text-button href="${researchHref}">Institutions</md-text-button>
          </nav>

          <!-- Theme toggle button -->
          <md-icon-button id="theme-toggle" aria-label="Toggle dark/light theme">
            <md-icon id="theme-icon">light_mode</md-icon>
          </md-icon-button>
        </div>
      </header>
    `;

    // Initialize theme toggle functionality
    this.setupTheme();
    // Connect drawer toggle event
    this.setupDrawerEvent();
  }

  /**
   * Sets up the drawer toggle event
   * Dispatches a custom event that the drawer component listens for
   */
  setupDrawerEvent() {
    this.querySelector("#menu-btn").addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("toggle-drawer"));
    });
  }

  /**
   * Sets up theme toggle functionality
   * - Checks for saved theme preference or system preference
   * - Applies theme on load
   * - Handles theme toggle clicks
   */
  setupTheme() {
    const toggle = this.querySelector("#theme-toggle");
    const icon = this.querySelector("#theme-icon");
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("vis35-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemDark);

    // Apply initial theme
    if (isDark) {
      document.body.classList.add("dark-theme");
    }
    icon.textContent = isDark ? "dark_mode" : "light_mode";

    // Handle theme toggle clicks
    toggle.addEventListener("click", () => {
      const isNowDark = document.body.classList.toggle("dark-theme");
      icon.textContent = isNowDark ? "dark_mode" : "light_mode";
      localStorage.setItem("vis35-theme", isNowDark ? "dark" : "light");
    });
  }
}

// Register the custom element
customElements.define("app-header", AppHeader);
