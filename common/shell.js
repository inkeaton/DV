// components/shell.js
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
                        <md-text-button href="/section1/section1.html">Section 1</md-text-button>
                        <md-text-button href="/section2/section2.html">Section 2</md-text-button>
                        <md-text-button href="/about.html">About</md-text-button>
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
                    
                    <md-list-item type="link" href="/section1/section1.html">
                        <div slot="headline">Section 1</div>
                        <md-icon slot="start">bar_chart</md-icon>
                    </md-list-item>
                    
                    <md-list-item type="link" href="/section2/section2.html">
                        <div slot="headline">Section 2</div>
                        <md-icon slot="start">auto_stories</md-icon>
                    </md-list-item>
                    
                    <md-list-item type="link" href="/about.html">
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
// 3. APP FOOTER COMPONENT
// ============================================================================
class AppFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer class="app-footer">
                <span class="md-typescale-body-small">© ${year} DV2</span>
                <div class="footer-links">
                    <md-text-button href="#">Privacy</md-text-button>
                    <md-text-button href="#">Terms</md-text-button>
                </div>
            </footer>
        `;
    }
}
customElements.define('app-footer', AppFooter);