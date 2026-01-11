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
    const { page } = createShellHelpers();

    const homeHref = page("index.html");
    const methodologyHref = page("methodology/methodology.html");
    const papersHref = page("papers/papers.html");
    const authorsHref = page("authors/authors.html");
    const researchHref = page("research/research.html"); // (cartella research)

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
    const { page, isActive } = createShellHelpers();

    // Build navigation paths
    const homeHref = page("index.html");
    const methodologyHref = page("methodology/methodology.html");
    const papersHref = page("papers/papers.html");
    const authorsHref = page("authors/authors.html");
    const researchHref = page("research/research.html");

    this.innerHTML = `
      <aside id="drawer" class="drawer" role="navigation" aria-label="Mobile navigation">
        <md-list>
          <md-list-item type="link" href="${homeHref}">
            <div slot="headline">Home</div>
            <md-icon slot="start">home</md-icon>
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
    const { isActive } = createShellHelpers();
    const links = this.querySelectorAll('md-list-item[type="link"]');

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      if (isActive(href)) link.classList.add("active");
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

    const { asset, page } = createShellHelpers();

    // immagini (sempre da /assets/...)
    const person1 = asset("assets/img/edo.jpeg");
    const person2 = asset("assets/img/iri.jpeg");

    // metodologia (nel tuo caso: methodology/methodology.html)
    const methodologyLink = page("methodology/methodology.html");

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
              data visualization research. Built for the <a href="https://corsi.unige.it/en/off.f/2025/ins/83997?codcla=10852">Data Visualization</a> course 2025/2026.
            
          </div>

          <!-- Methodology section -->
          <div class="f-methodology">
             <h2>Data &amp; Methodology</h2>

  

  <p>
    We use <a href="https://www.vispubdata.org" target="_blank" rel="noopener">VISpubdata</a> (1990–2024),
    enriched with structured metadata via the <strong>OpenAlex API</strong>.
    After an initial EDA pass to understand the dataset, we cleaned and standardized key fields, then extracted themes
    using BERTopic to support topic-based exploration.
  </p>

  <ul color: var(--md-sys-color-on-surface-variant);">
    <li><strong>Cleaning:</strong> removed papers without authors, handled noisy/missing entries, normalized conference tracks.</li>
    <li><strong>Processing:</strong> BERTopic for keyword/topic extraction; Python analysis for trends and growth rates.</li>
    <li><strong>Stack:</strong> D3.js, HTML5, CSS3, Material Design 3.</li>
  </ul>
</p>
  <p>Questions? <a href="${methodologyLink}">Read the full methodology</a>.</p>
          </div>
        </div>

        <div class="f-right">
           <!-- Team member 1 -->
  <div class="footer-team-row">
    <img src="${person1}" class="footer-team-pic" alt="Edoardo Vassallo" loading="lazy" decoding="async">
    <div class="footer-team-text">
      <h3>Edoardo Vassallo</h3>
      <span class="footer-team-role">Data Engineering, Analysis &amp; Web Design</span>
      <p class="footer-team-bio">
        M.Sc. student in <strong>Data Science &amp; Engineering (Artificial Intelligence)</strong> at the
        <strong>University of Genoa</strong>. Built the end-to-end Python pipeline (cleaning, enrichment, NLP) and
        contributed to the website design and structure.
      </p>
      <div class="footer-team-links">
        <a href="https://linkedin.com/in/inkeaton" rel="noopener">LinkedIn</a>
        <a href="https://github.com/inkeaton" rel="noopener">GitHub</a>
      </div>
    </div>
  </div>

  <!-- Team member 2 -->
  <div class="footer-team-row">
    <img src="${person2}" class="footer-team-pic" alt="Iryna Savchuk" loading="lazy" decoding="async">
    <div class="footer-team-text">
      <h3>Iryna Savchuk</h3>
      <span class="footer-team-role">Data Analysis, Visualization &amp; Trend Discovery</span>
      <p class="footer-team-bio">
        M.Sc. student in <strong>Data Science &amp; Engineering (Artificial Intelligence)</strong> at the
        <strong>University of Genoa</strong>. Focused on data analysis and visualization to understand patterns and
        trends, and designed the scrollytelling experience.
      </p>
      <div class="footer-team-links">
        <a href="https://www.linkedin.com/in/iryna-savchuk-0497a1225/" rel="noopener">LinkedIn</a>
        <a href="https://github.com/IRYNASAVCHUK" rel="noopener">GitHub</a>
      </div>
    </div>
       
        </div>
      </footer>
    `;
  }
}

// Register the custom element
customElements.define("app-footer", AppFooter);
