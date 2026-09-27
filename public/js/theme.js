/* ========================================
   HEPHZIBAH BEHULAH - THEME TOGGLE
   Version: 1.0.0
   Description: Dark/Light mode toggle with localStorage persistence
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // THEME CONFIGURATION
    // ========================================
    const THEME_KEY = 'hephzibah-theme';
    const DARK_CLASS = 'dark-mode';
    const LIGHT_CLASS = 'light-mode';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    let themeToggle;
    let themeIcon;
    let themeLabel;

    // ========================================
    // INITIALIZE
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
        if (!themeToggle) return;

        themeIcon = themeToggle.querySelector('.theme-icon');
        themeLabel = themeToggle.querySelector('.theme-label');

        // Load saved theme
        const savedTheme = localStorage.getItem(THEME_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            enableDarkMode();
        } else {
            enableLightMode();
        }

        // Toggle click handler
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem(THEME_KEY)) {
                if (e.matches) {
                    enableDarkMode();
                } else {
                    enableLightMode();
                }
            }
        });
    });

    // ========================================
    // THEME FUNCTIONS
    // ========================================
    function toggleTheme() {
        if (document.body.classList.contains(DARK_CLASS)) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    }

    function enableDarkMode() {
        document.body.classList.add(DARK_CLASS);
        document.body.classList.remove(LIGHT_CLASS);
        localStorage.setItem(THEME_KEY, 'dark');
        updateThemeUI('dark');
        updateMetaTheme('#0a0a0a');
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'dark' } }));
    }

    function enableLightMode() {
        document.body.classList.remove(DARK_CLASS);
        document.body.classList.add(LIGHT_CLASS);
        localStorage.setItem(THEME_KEY, 'light');
        updateThemeUI('light');
        updateMetaTheme('#1a365d');
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'light' } }));
    }

    function updateThemeUI(theme) {
        if (!themeIcon) return;

        if (theme === 'dark') {
            themeIcon.className = 'theme-icon fas fa-sun';
            if (themeLabel) themeLabel.textContent = 'Light';
        } else {
            themeIcon.className = 'theme-icon fas fa-moon';
            if (themeLabel) themeLabel.textContent = 'Dark';
        }
    }

    function updateMetaTheme(color) {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = color;
    }

    // ========================================
    // EXPOSE API
    // ========================================
    window.themeManager = {
        enableDarkMode,
        enableLightMode,
        toggleTheme,
        getCurrentTheme: () => document.body.classList.contains(DARK_CLASS) ? 'dark' : 'light'
    };

})();
