/**
 * assets/js/components/app-footer.js
 * ============================================================================
 * APP FOOTER WEB COMPONENT
 * 
 * R2D3-style footer with:
 * - Project branding and description
 * - Data methodology section
 * - Team member profiles
 * 
 * Usage:
 *   <app-footer></app-footer>
 * ============================================================================
 */

import { SITE, createShellHelpers } from "../shell-utils.js";

/**
 * AppFooter custom element
 * Site footer component
 */
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
