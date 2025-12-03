// components/shell.js
// ============================================================================
// REUSABLE WEB COMPONENTS FOR SITE SHELL
// This file defines three custom HTML elements that create the site structure:
// 1. <app-header> - Top navigation bar
// 2. <app-drawer> - Mobile slide-out navigation
// 3. <app-footer> - Bottom footer bar

// Import Material Web Components library
import '@material/web/all.js';

// ============================================================================
// 1. APP HEADER COMPONENT
// ============================================================================

class AppHeader extends HTMLElement {
  // connectedCallback runs when element is added to the DOM
  connectedCallback() {
    // Set the inner HTML structure of the header
    this.innerHTML = `
      <header class="app-bar">
        <!-- LEFT SIDE: Menu button + Logo -->
        <div class="app-bar-start">
          <!-- Mobile menu button (hidden on desktop via CSS) -->
          <md-icon-button id="menu-btn"><md-icon>menu</md-icon></md-icon-button>
          
          <!-- Clickable logo that links to home -->
          <a href="/" style="text-decoration: none; color: inherit;">
            <span class="brand-logo">DV2</span>
          </a>
        </div>
        
        <!-- RIGHT SIDE: Navigation + Theme toggle -->
        <div class="app-bar-end">
          <!-- Desktop navigation (hidden on mobile via CSS) -->
          <nav class="desktop-nav">
            <md-text-button href="/DV/">Home</md-text-button>
            <md-text-button href="/DV/section1/section1.html">Section 1</md-text-button>
            <md-text-button href="#">About</md-text-button>
          </nav>
          
          <!-- Theme toggle button (always visible) -->
          <md-icon-button id="theme-toggle">
            <md-icon id="theme-icon">light_mode</md-icon>
          </md-icon-button>
        </div>
      </header>
    `;

    // Initialize component functionality
    this.setupTheme();
    this.setupDrawerEvent();
  }

  // Set up drawer toggle event communication
  setupDrawerEvent() {
    // When menu button is clicked, dispatch a custom event
    // This allows the drawer component to listen and respond
    // Custom events enable communication between separate components
    this.querySelector('#menu-btn').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('toggle-drawer'));
    });
  }

  // Set up theme switching functionality
  setupTheme() {
    const toggle = this.querySelector('#theme-toggle');
    const icon = this.querySelector('#theme-icon');
    
    // === LOAD SAVED THEME ===
    // Check localStorage for user's previous theme choice
    const savedTheme = localStorage.getItem('dv2-theme');
    
    // Check system preference if no saved theme exists
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine initial theme: saved preference > system preference > light
    const isDark = savedTheme === 'dark' || (!savedTheme && systemDark);

    // === APPLY INITIAL THEME ===
    // Add/remove dark-theme class on body element
    // This triggers CSS variables change in style.css
    if (isDark) document.body.classList.add('dark-theme');
    
    // Update icon to match current theme
    icon.textContent = isDark ? 'dark_mode' : 'light_mode';

    // === THEME TOGGLE HANDLER ===
    toggle.addEventListener('click', () => {
      // Toggle the dark-theme class and get new state
      const isNowDark = document.body.classList.toggle('dark-theme');
      
      // Update icon to reflect new theme
      icon.textContent = isNowDark ? 'dark_mode' : 'light_mode';
      
      // Save preference to localStorage for next visit
      localStorage.setItem('dv2-theme', isNowDark ? 'dark' : 'light');
    });
  }
}

// Register the custom element so <app-header> can be used in HTML
customElements.define('app-header', AppHeader);


// ============================================================================
// 2. APP DRAWER COMPONENT
// ============================================================================
// Creates the mobile navigation drawer that slides in from the left
// Includes a scrim (dark overlay) that appears behind the drawer

class AppDrawer extends HTMLElement {
  connectedCallback() {
    // Create drawer structure with Material Design list
    this.innerHTML = `
      <!-- DRAWER PANEL: Slides in from left -->
      <aside id="drawer" class="drawer">
        <!-- Material Design list component for navigation items -->
        <md-list>
          <!-- HOME LINK -->
          <md-list-item type="link" href="/">
            <div slot="headline">Home</div>
            <md-icon slot="start">home</md-icon>
          </md-list-item>
          
          <!-- SECTION 1 LINK -->
          <md-list-item type="link" href="/section1/section1.html">
            <div slot="headline">Section 1</div>
            <md-icon slot="start">bar_chart</md-icon>
          </md-list-item>
        </md-list>
      </aside>
      
      <!-- SCRIM: Dark overlay that appears when drawer is open -->
      <div id="scrim" class="scrim"></div>
    `;

    // Cache references to drawer and scrim elements
    this.drawer = this.querySelector('#drawer');
    this.scrim = this.querySelector('#scrim');

    // === EVENT LISTENERS ===
    
    // Listen for custom event from header's menu button
    document.addEventListener('toggle-drawer', () => this.toggle());
    
    // Clicking the scrim closes the drawer
    this.scrim.addEventListener('click', () => this.close());
    
    // Highlight the current page in the navigation
    this.highlightActiveLink();
  }

  // Toggle drawer open/closed state
  toggle() {
    this.drawer.classList.toggle('open');
    this.scrim.classList.toggle('open');
  }

  // Close drawer (used by scrim click)
  close() {
    this.drawer.classList.remove('open');
    this.scrim.classList.remove('open');
  }

  // Add 'active' class to current page's link
  highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = this.querySelectorAll('md-list-item');
    
    links.forEach(link => {
      // Match links to current path (excluding home page to avoid all matches)
      if (link.href.includes(currentPath) && currentPath !== '/') {
        link.classList.add('active');
      }
    });
  }
}

// Register the custom element
customElements.define('app-drawer', AppDrawer);


// ============================================================================
// 3. APP FOOTER COMPONENT
// ============================================================================
// Creates the bottom footer bar with copyright and links

class AppFooter extends HTMLElement {
  connectedCallback() {
    
    this.innerHTML = `
      <footer class="app-footer">
        <!-- Copyright notice with current year -->
        <span class="md-typescale-body-small">© 2025 DV2</span>
        
        <!-- Footer navigation links -->
        <div class="footer-links">
          <md-text-button href="#">Privacy</md-text-button>
          <md-text-button href="#">Terms</md-text-button>
        </div>
      </footer>
    `;
  }
}

// Register the custom element
customElements.define('app-footer', AppFooter);