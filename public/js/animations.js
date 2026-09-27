/* ========================================
   HEPHZIBAH BEHULAH - ANIMATIONS
   Version: 1.0.0
   Description: AOS.js initialization and custom animations
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // AOS.JS INITIALIZATION
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize AOS with custom settings
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false,
                offset: 50,
                delay: 0,
                disable: function() {
                    // Disable on mobile if preferred
                    return window.innerWidth < 480 && !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
                }
            });
        }

        // Add intersection observer fallback for browsers without AOS
        if (typeof AOS === 'undefined') {
            initFallbackAnimations();
        }

        // Re-initialize on theme change
        document.addEventListener('themeChanged', function() {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        });
    });

    // ========================================
    // FALLBACK ANIMATIONS (No AOS)
    // ========================================
    function initFallbackAnimations() {
        const elements = document.querySelectorAll('[data-aos]');
        if (!elements.length) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const animation = el.getAttribute('data-aos') || 'fade-up';
                        el.classList.add('aos-animate', `aos-${animation}`);
                        observer.unobserve(el);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(el => observer.observe(el));
        } else {
            // Fallback: show all elements
            elements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        }
    }

    // ========================================
    // CUSTOM ANIMATIONS
    // ========================================
    
    // Typing effect for hero title
    function initTypingEffect() {
        const element = document.querySelector('.hero-title .name');
        if (!element) return;

        const text = element.textContent;
        element.textContent = '';
        
        let index = 0;
        const speed = 100; // ms per character

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        }

        // Start typing after a delay
        setTimeout(type, 500);
    }

    // Only run on desktop
    if (window.innerWidth > 768) {
        document.addEventListener('DOMContentLoaded', function() {
            // Check if element exists and hasn't been typed yet
            const nameElement = document.querySelector('.hero-title .name');
            if (nameElement && !nameElement.dataset.typed) {
                nameElement.dataset.typed = 'true';
                // Store original text
                const originalText = nameElement.textContent;
                nameElement.textContent = '';
                nameElement.dataset.originalText = originalText;
                initTypingEffect();
            }
        });
    }

    // ========================================
    // PARALLAX EFFECT
    // ========================================
    function initParallax() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            if (scrolled < hero.offsetHeight) {
                const parallaxElements = hero.querySelectorAll('.hero-visual, .tech-stack');
                parallaxElements.forEach(el => {
                    const speed = el.dataset.parallaxSpeed || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            }
        }, { passive: true });
    }

    // Only run on larger screens
    if (window.innerWidth > 768) {
        document.addEventListener('DOMContentLoaded', initParallax);
    }

    // ========================================
    // SCROLL PROGRESS INDICATOR
    // ========================================
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            z-index: 9999;
            width: 0%;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = progress + '%';
        }, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', initScrollProgress);

    // ========================================
    // REDUCED MOTION PREFERENCE
    // ========================================
    function handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
            // Disable AOS
            if (typeof AOS !== 'undefined') {
                AOS.init({ disable: true });
            }
        }

        prefersReducedMotion.addEventListener('change', function(e) {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', handleReducedMotion);

})();

// ========================================
// ADDITIONAL ANIMATION UTILITIES
// ========================================

// Number counter animation (for stats)
function animateNumber(element, target, duration = 2000) {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * target);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(update);
}

// Smooth reveal on scroll
function revealOnScroll(selector) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        animateNumber,
        revealOnScroll
    };
}
