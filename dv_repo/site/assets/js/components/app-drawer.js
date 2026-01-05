/**
 * assets/js/components/app-drawer.js
 * ============================================================================
 * APP DRAWER WEB COMPONENT
 * 
 * Mobile slide-out navigation menu with:
 * - Navigation links
 * - Scrim overlay
 * - Active link highlighting
 * 
 * Usage:
 *   <app-drawer></app-drawer>
 * 
 * Listens for 'toggle-drawer' event dispatched by app-header.
 * ============================================================================
 */

import "@material/web/all.js";
import { createShellHelpers } from "../shell-utils.js";

/**
 * AppDrawer custom element
 * Mobile navigation drawer component
 */
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
