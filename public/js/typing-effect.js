/* ========================================
   FUTURISTIC TYPING EFFECT v2.0
   - Multi-phrase cycling
   - Glitch text animation
   - Gradient text
   - Blinking cursor
   - Random typing speeds
   - Emoji prefixes
   - Respects reduced-motion
   ======================================== */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const element = document.querySelector('.hero-title .title-role');
        if (!element) return;

        // ========================================
        // CONFIGURATION
        // ========================================
        const phrases = [
            { text: 'Cybersecurity Student',       icon: '🛡️', color: '#ef4444' },
            { text: 'Web Developer @Home',         icon: '💻', color: '#10b981' },
            { text: 'Ethical Hacker @Home',        icon: '🎯', color: '#f59e0b' },
            { text: 'Data Enthusiast',             icon: '📊', color: '#8b5cf6' },
            { text: 'Aviation Systems Expert',     icon: '✈️', color: '#06b6d4' },
            { text: 'Electroniker @Centerline',    icon: '⚡', color: '#e87a2d' },
            { text: 'AI Security Researcher',      icon: '🤖', color: '#ec4899' },
            { text: 'Building Secure Digital XR',  icon: '🚀', color: '#4ade80' }
        ];

        const CONFIG = {
            typeSpeed: 80,           // ms per char when typing
            deleteSpeed: 40,         // ms per char when deleting
            pauseAfterType: 2200,    // pause before deleting
            pauseAfterDelete: 400,   // pause before next phrase
            glitchInterval: 3000,    // how often to glitch
            glitchDuration: 200,     // glitch duration in ms
            startDelay: 800          // initial delay before typing starts
        };

        // ========================================
        // STATE
        // ========================================
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;
        let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ========================================
        // SETUP: Apply futuristic styling
        // ========================================
        element.classList.add('futuristic-typing');
        element.setAttribute('aria-live', 'polite');
        element.setAttribute('aria-label', 'Current role');

        // Add cursor element
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '▊';
        cursor.setAttribute('aria-hidden', 'true');

        // Wrap text in a span for gradient
        const textSpan = document.createElement('span');
        textSpan.className = 'typing-text';
        element.textContent = '';
        element.appendChild(textSpan);
        element.appendChild(cursor);

        // ========================================
        // TYPE EFFECT
        // ========================================
        function typeEffect() {
            if (isPaused) return;

            const current = phrases[phraseIndex];
            const fullText = current.text;

            if (isDeleting) {
                charIndex--;
                textSpan.textContent = fullText.substring(0, charIndex);
            } else {
                charIndex++;
                textSpan.textContent = fullText.substring(0, charIndex);
            }

            // Random speed variation for realism
            let speed = isDeleting ? CONFIG.deleteSpeed : CONFIG.typeSpeed;
            speed += Math.random() * 30 - 15; // ±15ms randomness

            // Handle state transitions
            if (!isDeleting && charIndex >= fullText.length) {
                // Finished typing → pause → start deleting
                setTimeout(() => {
                    isDeleting = true;
                    typeEffect();
                }, CONFIG.pauseAfterType);
                return;
            }

            if (isDeleting && charIndex <= 0) {
                // Finished deleting → switch phrase → start typing
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                updateGlowColor(phrases[phraseIndex].color);
                setTimeout(typeEffect, CONFIG.pauseAfterDelete);
                return;
            }

            setTimeout(typeEffect, speed);
        }

        // ========================================
        // GLOW COLOR UPDATE
        // ========================================
        function updateGlowColor(color) {
            if (reducedMotion) return;
            element.style.setProperty('--glow-color', color);
            textSpan.style.setProperty('--glow-color', color);
        }

        // ========================================
        // GLITCH EFFECT (Randomly)
        // ========================================
        function glitchEffect() {
            if (reducedMotion) return;

            element.classList.add('glitching');

            // Optional: random glitch text
            const glitchChars = ['#', '@', '%', '$', '&', '*', '0', '1'];
            const original = textSpan.textContent;

            if (Math.random() > 0.5) {
                // Scramble a few characters
                const chars = original.split('');
                const scrambleCount = Math.min(3, Math.floor(Math.random() * 4));
                
                for (let i = 0; i < scrambleCount; i++) {
                    const pos = Math.floor(Math.random() * chars.length);
                    chars[pos] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }

                textSpan.textContent = chars.join('');

                setTimeout(() => {
                    textSpan.textContent = original;
                }, 100);
            }

            setTimeout(() => {
                element.classList.remove('glitching');
            }, CONFIG.glitchDuration);
        }

        // ========================================
        // PERIODIC GLITCH
        // ========================================
        if (!reducedMotion) {
            setInterval(() => {
                if (!isDeleting && charIndex === phrases[phraseIndex].text.length) {
                    glitchEffect();
                }
            }, CONFIG.glitchInterval);
        }

        // ========================================
        // PAUSE ON HOVER (nice UX)
        // ========================================
        element.addEventListener('mouseenter', () => {
            isPaused = true;
            cursor.style.animationPlayState = 'paused';
        });

        element.addEventListener('mouseleave', () => {
            if (isPaused) {
                isPaused = false;
                cursor.style.animationPlayState = 'running';
                typeEffect();
            }
        });

        // ========================================
        // PAUSE WHEN TAB HIDDEN (performance)
        // ========================================
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isPaused = true;
            } else if (!element.matches(':hover')) {
                isPaused = false;
                typeEffect();
            }
        });

        // ========================================
        // INIT: Set initial color, then start
        // ========================================
        updateGlowColor(phrases[0].color);

        if (reducedMotion) {
            // Static display for reduced-motion users
            textSpan.textContent = phrases[0].text;
            cursor.style.display = 'none';
        } else {
            setTimeout(typeEffect, CONFIG.startDelay);
        }

    });
})();
