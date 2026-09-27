/* ========================================
   HEPHZIBAH BEHULAH - MAIN JAVASCRIPT
   Version: 1.0.0
   Description: Core functionality for portfolio website
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // DOM READY
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize all modules
        initNavigation();
        initStatsCounter();
        initContactForm();
        initProjectFilters();
        initSmoothScroll();
        initBackToTop();
    });

    // ========================================
    // NAVIGATION
    // ========================================
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const header = document.querySelector('.header');

        // Toggle mobile menu
        if (navToggle) {
            navToggle.addEventListener('click', function() {
                const isOpen = navMenu.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpen);
            });
        }

        // Close menu on link click
        if (navMenu) {
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('open');
                    if (navToggle) {
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }

        // Header scroll effect
        if (header) {
            let lastScroll = 0;
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;
                if (currentScroll > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                lastScroll = currentScroll;
            });
        }
    }

    // ========================================
    // STATS COUNTER ANIMATION
    // ========================================
    function initStatsCounter() {
        const statElements = document.querySelectorAll('.stat-number');
        if (!statElements.length) return;

        let animated = false;

        function animateStats() {
            if (animated) return;
            const windowHeight = window.innerHeight;
            const elementTop = statElements[0].getBoundingClientRect().top;

            if (elementTop < windowHeight - 100) {
                animated = true;
                statElements.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-count'), 10);
                    if (isNaN(target)) return;

                    let current = 0;
                    const increment = Math.ceil(target / 50);
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        stat.textContent = current + (target === 100 ? '%' : '+');
                    }, 30);
                });
            }
        }

        window.addEventListener('scroll', animateStats);
        setTimeout(animateStats, 500);
    }

    // ========================================
    // CONTACT FORM HANDLING
    // ========================================
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Basic validation
            if (!data.fullName || !data.email || !data.message) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission
            showFormMessage('Sending your message...', 'loading');
            
            setTimeout(() => {
                showFormMessage(
                    '✅ Message sent successfully! I\'ll get back to you within 24 hours.',
                    'success'
                );
                this.reset();
            }, 1500);
        });
    }

    function showFormMessage(message, type) {
        const form = document.getElementById('contactForm');
        let messageDiv = document.querySelector('.form-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'form-message';
            form.insertBefore(messageDiv, form.firstChild);
        }

        messageDiv.textContent = message;
        messageDiv.className = 'form-message ' + type;
        messageDiv.style.display = 'block';

        // Auto-hide success/error messages after 5 seconds
        if (type !== 'loading') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // ========================================
    // PROJECT FILTERS
    // ========================================
    function initProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectItems = document.querySelectorAll('.project-item');
        
        if (!filterButtons.length || !projectItems.length) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Filter projects
                const filter = this.getAttribute('data-filter');
                projectItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.5s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // BACK TO TOP
    // ========================================
    function initBackToTop() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '↑';
        button.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(button);

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        });

        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // NEWSLETTER FORM
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = this.querySelector('input[type="email"]');
                if (!input) return;

                const email = input.value.trim();
                if (!email) {
                    showNewsletterMessage(this, 'Please enter your email address.', 'error');
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showNewsletterMessage(this, 'Please enter a valid email address.', 'error');
                    return;
                }

                showNewsletterMessage(this, '✅ Subscribed successfully!', 'success');
                input.value = '';
                setTimeout(() => {
                    const msg = this.querySelector('.newsletter-message');
                    if (msg) msg.remove();
                }, 3000);
            });
        });
    });

    function showNewsletterMessage(form, message, type) {
        let msg = form.querySelector('.newsletter-message');
        if (!msg) {
            msg = document.createElement('div');
            msg.className = 'newsletter-message';
            form.appendChild(msg);
        }
        msg.textContent = message;
        msg.className = 'newsletter-message ' + type;
        msg.style.display = 'block';
    }

})();

// ========================================
// ADDITIONAL UTILITY FUNCTIONS
// ========================================

// Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});

// Add fade-in animation class
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('[data-aos]');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '1';
    });
});
