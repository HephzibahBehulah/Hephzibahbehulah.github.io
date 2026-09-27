// js/performance.js - Performance Optimizations

document.addEventListener('DOMContentLoaded', function() {
    // Defer non-critical resources
    deferNonCritical();
    
    // Optimize images
    optimizeImages();
    
    // Reduce layout shifts
    stabilizeLayout();
});

function deferNonCritical() {
    // Defer iframes
    document.querySelectorAll('iframe').forEach(iframe => {
        if (!iframe.dataset.src) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    iframe.src = iframe.dataset.src;
                    observer.unobserve(iframe);
                }
            });
        });
        observer.observe(iframe);
    });
    
    // Defer videos
    document.querySelectorAll('video[data-src]').forEach(video => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.src = video.dataset.src;
                    observer.unobserve(video);
                }
            });
        });
        observer.observe(video);
    });
}

function optimizeImages() {
    // Already handled by lazy-load.js
    // Ensure images have width/height attributes
    document.querySelectorAll('img').forEach(img => {
        if (!img.width && !img.height) {
            img.setAttribute('width', 'auto');
            img.setAttribute('height', 'auto');
        }
    });
}

function stabilizeLayout() {
    // Set explicit dimensions for dynamic content
    document.querySelectorAll('.resource-card, .project-item, .tool-card').forEach(el => {
        if (!el.style.minHeight) {
            el.style.minHeight = '250px';
        }
    });
}
