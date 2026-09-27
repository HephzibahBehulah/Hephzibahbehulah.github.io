/* ========================================
   OSINT-STYLE INTERACTIVE TREE
   ======================================== */

class OsintTree {
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.data = data;
        this.options = {
            nodeWidth: 180,
            nodeHeight: 40,
            hGap: 60,
            vGap: 20,
            ...options
        };
        
        this.expandedNodes = new Set();
        this.visibleNodes = new Map();
        this.connections = [];
        this.scale = 1;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.render();
        this.setupControls();
        this.setupSearch();
    }
    
    createCanvas() {
        this.container.innerHTML = `
            <div class="osint-tree-container">
                <div class="tree-search">
                    <input type="text" class="tree-search-input" placeholder="Search nodes..." id="treeSearchInput">
                    <span class="tree-search-icon">🔍</span>
                </div>
                
                <div class="tree-canvas" id="treeCanvas">
                    <div class="tree-inner" id="treeInner">
                        <svg class="tree-svg" id="treeSvg"></svg>
                    </div>
                </div>
                
                <div class="tree-controls">
                    <button class="tree-control-btn" id="zoomIn" title="Zoom In">+</button>
                    <button class="tree-control-btn" id="zoomOut" title="Zoom Out">−</button>
                    <button class="tree-control-btn" id="fitView" title="Fit to View">⛶</button>
                    <button class="tree-control-btn" id="expandAll" title="Expand All">▼</button>
                    <button class="tree-control-btn" id="collapseAll" title="Collapse All">▲</button>
                </div>
                
                <div class="tree-legend">
                    <div class="legend-title">Legend</div>
                    <div class="legend-items">
                        <div class="legend-item"><span class="legend-badge" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24;">T</span><span>Tool (Local Install)</span></div>
                        <div class="legend-item"><span class="legend-badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">D</span><span>Google Dork</span></div>
                        <div class="legend-item"><span class="legend-badge" style="background: rgba(96, 165, 250, 0.2); color: #60a5fa;">R</span><span>Requires Registration</span></div>
                        <div class="legend-item"><span class="legend-badge" style="background: rgba(167, 139, 250, 0.2); color: #a78bfa;">M</span><span>Manual URL Edit</span></div>
                    </div>
                </div>
                
                <div class="node-modal-overlay" id="nodeModalOverlay"></div>
                <div class="node-modal" id="nodeModal">
                    <div class="node-modal-header">
                        <div class="node-modal-title" id="nodeModalTitle"></div>
                        <button class="node-modal-close" id="nodeModalClose">✕</button>
                    </div>
                    <div class="node-modal-description" id="nodeModalDescription"></div>
                    <div class="node-modal-links" id="nodeModalLinks"></div>
                </div>
            </div>
        `;
        
        this.canvas = document.getElementById('treeCanvas');
        this.inner = document.getElementById('treeInner');
        this.svg = document.getElementById('treeSvg');
    }
    
    render() {
        this.inner.querySelectorAll('.tree-node').forEach(n => n.remove());
        this.svg.innerHTML = '';
        this.connections = [];
        this.visibleNodes.clear();
        
        this.renderNode(this.data, 60, 60, null, 0);
        this.drawConnections();
        this.applyTransform();
    }
    
    renderNode(node, x, y, parentId, depth) {
        const nodeId = node.id;
        this.visibleNodes.set(nodeId, { x, y, node });
        
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tree-node appearing';
        nodeEl.id = `node-${nodeId}`;
        nodeEl.style.left = `${x}px`;
        nodeEl.style.top = `${y}px`;
        nodeEl.style.zIndex = 10 + depth;
        
        if (node.category) nodeEl.dataset.category = node.category;
        
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = this.expandedNodes.has(nodeId);
        
        if (isExpanded) nodeEl.classList.add('expanded');
        
        nodeEl.innerHTML = `
            ${node.icon ? `<span class="node-icon">${node.icon}</span>` : ''}
            <span>${node.name}</span>
            ${node.badge ? `<span class="node-badge ${node.badge.toLowerCase()}">${node.badge}</span>` : ''}
            ${hasChildren ? `<span class="node-expand">${isExpanded ? '▼' : '▶'}</span>` : ''}
        `;
        
        nodeEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (hasChildren) {
                this.toggleNode(nodeId);
            } else {
                this.showModal(node);
            }
        });
        
        this.inner.appendChild(nodeEl);
        
        if (hasChildren && isExpanded) {
            const startY = y + this.options.nodeHeight + this.options.vGap;
            let childY = startY;
            let childX = x + this.options.nodeWidth + this.options.hGap;
            
            node.children.forEach((child) => {
                this.renderNode(child, childX, childY, nodeId, depth + 1);
                this.connections.push({
                    from: { x: x + this.options.nodeWidth, y: y + this.options.nodeHeight / 2 },
                    to: { x: childX, y: childY + this.options.nodeHeight / 2 }
                });
                childY += this.options.nodeHeight + this.options.vGap;
            });
        }
    }
    
    toggleNode(nodeId) {
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        this.render();
    }
    
    drawConnections() {
        this.svg.innerHTML = '';
        
        this.connections.forEach(conn => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const midX = (conn.from.x + conn.to.x) / 2;
            const d = `M ${conn.from.x} ${conn.from.y} C ${midX} ${conn.from.y}, ${midX} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`;
            path.setAttribute('d', d);
            path.setAttribute('class', 'tree-connection drawing');
            this.svg.appendChild(path);
        });
        
        this.svg.setAttribute('width', this.inner.scrollWidth);
        this.svg.setAttribute('height', this.inner.scrollHeight);
    }
    
    showModal(node) {
        document.getElementById('nodeModalTitle').innerHTML = `${node.icon || ''} ${node.name}`;
        document.getElementById('nodeModalDescription').textContent = node.description || 'No description available.';
        
        const linksContainer = document.getElementById('nodeModalLinks');
        linksContainer.innerHTML = '';
        
        if (node.url) {
            linksContainer.innerHTML += `<a href="${node.url}" target="_blank" class="node-modal-link"><span>🌐</span><span>Visit ${node.name}</span></a>`;
        }
        if (node.github) {
            linksContainer.innerHTML += `<a href="${node.github}" target="_blank" class="node-modal-link"><span>🐙</span><span>View on GitHub</span></a>`;
        }
        
        document.getElementById('nodeModal').classList.add('active');
        document.getElementById('nodeModalOverlay').classList.add('active');
    }
    
    hideModal() {
        document.getElementById('nodeModal').classList.remove('active');
        document.getElementById('nodeModalOverlay').classList.remove('active');
    }
    
    setupControls() {
        document.getElementById('zoomIn')?.addEventListener('click', () => {
            this.scale = Math.min(this.scale + 0.1, 2);
            this.applyTransform();
        });
        
        document.getElementById('zoomOut')?.addEventListener('click', () => {
            this.scale = Math.max(this.scale - 0.1, 0.3);
            this.applyTransform();
        });
        
        document.getElementById('fitView')?.addEventListener('click', () => {
            this.scale = 1;
            this.applyTransform();
            this.canvas.scrollTo(0, 0);
        });
        
        document.getElementById('expandAll')?.addEventListener('click', () => {
            this.expandAllNodes(this.data);
            this.render();
        });
        
        document.getElementById('collapseAll')?.addEventListener('click', () => {
            this.expandedNodes.clear();
            this.render();
        });
        
        document.getElementById('nodeModalClose')?.addEventListener('click', () => this.hideModal());
        document.getElementById('nodeModalOverlay')?.addEventListener('click', () => this.hideModal());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });
        
        this.setupPan();
    }
    
    setupPan() {
        let isDown = false;
        let startX, startY, scrollLeft, scrollTop;
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target.closest('.tree-node')) return;
            isDown = true;
            this.canvas.classList.add('grabbing');
            startX = e.pageX - this.canvas.offsetLeft;
            startY = e.pageY - this.canvas.offsetTop;
            scrollLeft = this.canvas.scrollLeft;
            scrollTop = this.canvas.scrollTop;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            isDown = false;
            this.canvas.classList.remove('grabbing');
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDown = false;
            this.canvas.classList.remove('grabbing');
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - this.canvas.offsetLeft;
            const y = e.pageY - this.canvas.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;
            this.canvas.scrollLeft = scrollLeft - walkX;
            this.canvas.scrollTop = scrollTop - walkY;
        });
    }
    
    applyTransform() {
        this.inner.style.transform = `scale(${this.scale})`;
        this.inner.style.transformOrigin = '0 0';
    }
    
    expandAllNodes(node) {
        if (node.children && node.children.length > 0) {
            this.expandedNodes.add(node.id);
            node.children.forEach(child => this.expandAllNodes(child));
        }
    }
    
    setupSearch() {
        const searchInput = document.getElementById('treeSearchInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const nodes = this.inner.querySelectorAll('.tree-node');
            
            nodes.forEach(node => {
                const text = node.textContent.toLowerCase();
                if (query === '' || text.includes(query)) {
                    node.style.opacity = '1';
                    if (query) {
                        node.style.borderColor = 'var(--node-active)';
                        node.style.boxShadow = '0 0 20px rgba(232, 122, 45, 0.5)';
                    } else {
                        node.style.borderColor = '';
                        node.style.boxShadow = '';
                    }
                } else {
                    node.style.opacity = '0.3';
                }
            });
        });
    }
}

window.OsintTree = OsintTree;
