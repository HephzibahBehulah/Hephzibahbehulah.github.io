/* ========================================
   TREE LOADER
   Auto-detects page and loads correct tree
   ======================================== */

(function() {
    'use strict';
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            const path = window.location.pathname;
            let treeData = null;
            let containerId = 'mainTree';
            
            // Detect page and pick data source
            if (path.includes('about')) {
                treeData = window.aboutTreeData;
            } else if (path.includes('portfolio')) {
                treeData = window.portfolioTreeData;
            } else if (path.includes('resources')) {
                treeData = window.resourcesTreeData;
                containerId = 'resourcesTree';
            } else if (path.includes('pentest')) {
                treeData = window.pentestTreeData;
            } else if (path.includes('contact')) {
                treeData = window.contactTreeData;
            } else {
                treeData = window.homeTreeData;
            }
            
            // Check if OSINT tree should load
            const container = document.getElementById(containerId);
            if (!container) {
                console.log('No tree container found for:', path);
                return;
            }
            
            if (!treeData) {
                console.warn('No tree data available for:', path);
                return;
            }
            
            if (!window.OsintTree) {
                console.warn('OsintTree class not loaded');
                return;
            }
            
            // Initialize tree
            window.mainTree = new OsintTree(containerId, treeData);
            console.log('✅ Tree loaded for:', path);
            
        }, 100);
    });
})();
