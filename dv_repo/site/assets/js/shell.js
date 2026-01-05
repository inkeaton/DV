/**
 * test_site/assets/js/shell.js
 * ============================================================================
 * SHELL COMPONENTS (Header, Drawer, Footer)
 * 
 * This module defines Web Components for the site's reusable shell elements:
 * - <app-header>: Top navigation bar with brand, links, and theme toggle
 * - <app-drawer>: Mobile slide-out navigation menu
 * - <app-footer>: Footer with project info and team members
 * 
 * These components are designed to be included on all pages except index.html
 * (which has a custom layout without navbar/footer).
 * 
 * Usage:
 * Include in HTML:
 *   <script type="module" src="./assets/js/shell.js"></script>
 *   <body>
 *     <app-header></app-header>
 *     <app-drawer></app-drawer>
 *     <!-- main content -->
 *     <app-footer></app-footer>
 *   </body>
 * ============================================================================
 */

import "@material/web/all.js";
import { SITE, createShellHelpers } from "./shell_utils.js";


/* ============================================================================
   1. APP HEADER COMPONENT
   Sticky top navigation bar with brand logo, navigation links, and theme toggle
   ============================================================================ */
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


/* ============================================================================
   2. APP DRAWER COMPONENT
   Mobile slide-out navigation menu with scrim overlay
   ============================================================================ */
class AppDrawer extends HTMLElement {
  connectedCallback() {
    const { build } = createShellHelpers();

    // Build navigation paths
    const homeHref = build("./index.html", "../index.html");
    const datasetHref = build("./dataset/dataset.html", "../dataset/dataset.html");
    const papersHref = build("./papers/papers.html", "../papers/papers.html");
    const authorsHref = build("./authors/authors.html", "../authors/authors.html");
    const researchHref = build("./research/research.html", "../research/research.html");

    this.innerHTML = `
      <aside id="drawer" class="drawer" role="navigation" aria-label="Mobile navigation">
        <md-list>
          <md-list-item type="link" href="${homeHref}">
            <div slot="headline">Home</div>
            <md-icon slot="start">home</md-icon>
          </md-list-item>

          <md-list-item type="link" href="${datasetHref}">
            <div slot="headline">Dataset</div>
            <md-icon slot="start">dataset</md-icon>
          </md-list-item>

          <md-list-item type="link" href="${papersHref}">
            <div slot="headline">Papers</div>
            <md-icon slot="start">description</md-icon>
          </md-list-item>

          <md-list-item type="link" href="${authorsHref}">
            <div slot="headline">Authors</div>
            <md-icon slot="start">group</md-icon>
          </md-list-item>

          <md-list-item type="link" href="${researchHref}">
            <div slot="headline">Institutions</div>
            <md-icon slot="start">apartment</md-icon>
          </md-list-item>
        </md-list>
      </aside>
      <div id="scrim" class="scrim" aria-hidden="true"></div>
    `;

    // Cache element references
    this.drawer = this.querySelector("#drawer");
    this.scrim = this.querySelector("#scrim");

    // Listen for toggle events from header
    document.addEventListener("toggle-drawer", () => this.toggle());
    
    // Close drawer when clicking scrim
    this.scrim.addEventListener("click", () => this.close());
    
    // Highlight the active navigation link
    this.highlightActiveLink();

    // Close drawer when clicking a link (for better UX)
    this.querySelectorAll('md-list-item[type="link"]').forEach(item => {
      item.addEventListener("click", () => this.close());
    });
  }

  /**
   * Toggle drawer open/closed state
   */
  toggle() {
    this.drawer.classList.toggle("open");
    this.scrim.classList.toggle("open");
  }

  /**
   * Close the drawer
   */
  close() {
    this.drawer.classList.remove("open");
    this.scrim.classList.remove("open");
  }

  /**
   * Highlights the navigation link matching the current page
   */
  highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = this.querySelectorAll("md-list-item");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && currentPath.includes(href.replace(/^\.\.\/|\.\//, ""))) {
        link.classList.add("active");
      }
    });
  }
}

// Register the custom element
customElements.define("app-drawer", AppDrawer);


/* ============================================================================
   3. APP FOOTER COMPONENT
   R2D3-style footer with project info and team members
   ============================================================================ */
class AppFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    const { asset } = createShellHelpers();

    // Build asset paths for team photos
    const person1 = asset("./assets/img/edo.jpeg", "../assets/img/edo.jpeg");
    const person2 = asset("./assets/img/iri.jpeg", "../assets/img/iri.jpeg");

    this.innerHTML = `
      <footer class="footer-r2d3" role="contentinfo">
        <div class="f-left">
          <!-- Brand box -->
          <div class="f-brand-box">
            <h2>${SITE.BRAND}</h2>
            <p class="f-year">© ${year}</p>
          </div>

          <!-- Project description -->
          <div class="f-desc">
            <p>
              VIS 35 is an interactive storytelling experiment exploring 35 years of 
              data visualization research. Built for the Data Visualization course 2024.
            </p>
            <p>Questions? <a href="#">Check the Documentation</a>.</p>
          </div>

          <!-- Methodology section -->
          <div class="f-methodology">
            <h4>Data &amp; Methodology</h4>
            <p>
              This project uses data from <strong>VISpubdata</strong> (1990-2024) enriched via
              <strong>OpenAlex API</strong>.
            </p>
            <ul>
              <li><strong>Cleaning:</strong> Removed papers without authors and normalized conference tracks.</li>
              <li><strong>Processing:</strong> Python scripts for keyword extraction (BERTopic) and growth rate calculation.</li>
              <li><strong>Stack:</strong> D3.js v7, HTML5, CSS3 (No Frameworks).</li>
            </ul>
          </div>
        </div>

        <div class="f-right">
          <!-- Team member 1 -->
          <div class="footer-team-row">
            <img src="${person1}" class="footer-team-pic" alt="Edoardo Vassallo" loading="lazy" decoding="async">
            <div class="footer-team-text">
              <h3>Edoardo Vassallo</h3>
              <span class="footer-team-role">Data Engineering &amp; Analysis</span>
              <p class="footer-team-bio">
                Master Student in Data Science. Currently working on NLP models for 
                scientific abstract analysis. Curated the Python pipeline and data cleaning.
              </p>
              <div class="footer-team-links">
                <a href="#" rel="noopener">LinkedIn</a>
                <a href="https://github.com/inkeaton" rel="noopener">GitHub</a>
              </div>
            </div>
          </div>

          <!-- Team member 2 -->
          <div class="footer-team-row">
            <img src="${person2}" class="footer-team-pic" alt="Iryna Savchuk" loading="lazy" decoding="async">
            <div class="footer-team-text">
              <h3>Iryna Savchuk</h3>
              <span class="footer-team-role">Visualization &amp; Frontend</span>
              <p class="footer-team-bio">
                Master Student in Computer Science. Specialized in Human-Computer Interaction.
                Designed the Scrollytelling interface and D3.js implementation.
              </p>
              <div class="footer-team-links">
                <a href="#" rel="noopener">LinkedIn</a>
                <a href="https://github.com/IRYNASAVCHUK" rel="noopener">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

// Register the custom element
customElements.define("app-footer", AppFooter);
