// assets/js/shell.js
// ============================================================================
// REUSABLE WEB COMPONENTS FOR SITE SHELL
// ============================================================================

import '@material/web/all.js';

// ============================================================================
// 1. APP HEADER COMPONENT
// ============================================================================
class AppHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="app-bar">
                <div class="app-bar-start">
                    <md-icon-button id="menu-btn"><md-icon>menu</md-icon></md-icon-button>
                    <a href="/" style="text-decoration: none; color: inherit;">
                        <span class="brand-logo">DV2</span>
                    </a>
                </div>
                
                <div class="app-bar-end">
                    <nav class="desktop-nav">
                        <md-text-button href="/">Home</md-text-button>
                        <md-text-button href="/pages/section1/section1.html">Section 1</md-text-button>
                        <md-text-button href="/pages/section2/section2.html">Section 2</md-text-button>
                        <md-text-button href="/pages/about.html">About</md-text-button>
                    </nav>
                    
                    <md-icon-button id="theme-toggle">
                        <md-icon id="theme-icon">light_mode</md-icon>
                    </md-icon-button>
                </div>
            </header>
        `;

        this.setupTheme();
        this.setupDrawerEvent();
    }

    setupDrawerEvent() {
        this.querySelector('#menu-btn').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('toggle-drawer'));
        });
    }

    setupTheme() {
        const toggle = this.querySelector('#theme-toggle');
        const icon = this.querySelector('#theme-icon');
        const savedTheme = localStorage.getItem('dv2-theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && systemDark);

        if (isDark) document.body.classList.add('dark-theme');
        icon.textContent = isDark ? 'dark_mode' : 'light_mode';

        toggle.addEventListener('click', () => {
            const isNowDark = document.body.classList.toggle('dark-theme');
            icon.textContent = isNowDark ? 'dark_mode' : 'light_mode';
            localStorage.setItem('dv2-theme', isNowDark ? 'dark' : 'light');
        });
    }
}
customElements.define('app-header', AppHeader);


// ============================================================================
// 2. APP DRAWER COMPONENT
// ============================================================================
class AppDrawer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <aside id="drawer" class="drawer">
                <md-list>
                    <md-list-item type="link" href="/">
                        <div slot="headline">Home</div>
                        <md-icon slot="start">home</md-icon>
                    </md-list-item>
                    
                    <md-list-item type="link" href="/pages/section1/section1.html">
                        <div slot="headline">Section 1</div>
                        <md-icon slot="start">bar_chart</md-icon>
                    </md-list-item>
                    
                    <md-list-item type="link" href="/pages/section2/section2.html">
                        <div slot="headline">Section 2</div>
                        <md-icon slot="start">auto_stories</md-icon>
                    </md-list-item>
                    
                    <md-list-item type="link" href="/pages/about.html">
                        <div slot="headline">About</div>
                        <md-icon slot="start">info</md-icon>
                    </md-list-item>
                </md-list>
            </aside>
            <div id="scrim" class="scrim"></div>
        `;

        this.drawer = this.querySelector('#drawer');
        this.scrim = this.querySelector('#scrim');

        document.addEventListener('toggle-drawer', () => this.toggle());
        this.scrim.addEventListener('click', () => this.close());
        this.highlightActiveLink();
    }

    toggle() {
        this.drawer.classList.toggle('open');
        this.scrim.classList.toggle('open');
    }

    close() {
        this.drawer.classList.remove('open');
        this.scrim.classList.remove('open');
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const links = this.querySelectorAll('md-list-item');
        
        links.forEach(link => {
            // Updated logic to handle exact matches better
            if (link.href.endsWith(currentPath) && currentPath !== '/') {
                link.classList.add('active');
            } else if (currentPath === '/' && link.href.endsWith('/')) {
                 link.classList.add('active');
            }
        });
    }
}
customElements.define('app-drawer', AppDrawer);

// ============================================================================
// 3. APP FOOTER COMPONENT (R2D3 FOOTER)
// ============================================================================
class AppFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();

    this.innerHTML = `
      <footer class="footer-r2d3" role="contentinfo">
        <div class="f-left">
          <div class="f-brand-box">
            <h2>VIS 35</h2>
            <p class="f-year">© ${year} DV2</p>
          </div>

          <div class="f-desc">
            <p>
              VIS 35 è un esperimento di storytelling interattivo per esplorare 35 anni di ricerca nella
              visualizzazione dati. Realizzato per il corso di Data Visualization 2024.
            </p>
            <p>Domande? <a href="#">Consulta la Documentazione</a>.</p>
          </div>

          <div class="f-methodology">
            <h4>Data &amp; Methodology</h4>
            <p>
              Il progetto utilizza dati provenienti da <strong>VISpubdata</strong> (1990-2024) arricchiti tramite
              <strong>OpenAlex API</strong>.
            </p>
            <ul>
              <li><strong>Cleaning:</strong> Rimozione paper senza autori e normalizzazione track conferenze.</li>
              <li><strong>Processing:</strong> Python scripts per estrazione keyword (BERTopic) e calcolo growth rate.</li>
              <li><strong>Stack:</strong> D3.js v7, HTML5, CSS3 (No Frameworks).</li>
            </ul>

            <p class="f-cta">
              <a href="#" class="f-cta-link">View GitHub Repository &rarr;</a>
            </p>
          </div>
        </div>

        <div class="f-right">
          <div class="team-row">
            <img
              src="/assets/img/edo.jpeg"
              class="team-pic"
              alt="Edoardo Vassallo"
              loading="lazy"
              decoding="async"
            >
            <div class="team-text">
              <h3>Edoardo Vassallo</h3>
              <span class="team-role">Data Engineering &amp; Analysis</span>
              <p class="team-bio">
                Master Student in Data Science. Attualmente lavora su modelli NLP per l'analisi
                di abstract scientifici. Ha curato la pipeline Python e il cleaning.
              </p>
              <div class="team-links">
                <a href="#" rel="noopener">LinkedIn</a>
                <a href="https://github.com/inkeaton" rel="noopener">GitHub</a>
              </div>
            </div>
          </div>

          <div class="team-row">
            <img
              src="/assets/img/iri.jpg"
              class="team-pic"
              alt="Iryna Savchuk"
              loading="lazy"
              decoding="async"
            >
            <div class="team-text">
              <h3>Iryna Savchuk</h3>
              <span class="team-role">Visualization &amp; Frontend</span>
              <p class="team-bio">
                Master Student in Computer Science. Specializzata in Human-Computer Interaction.
                Ha progettato l'interfaccia Scrollytelling e l'implementazione D3.js.
              </p>
              <div class="team-links">
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
customElements.define("app-footer", AppFooter);
