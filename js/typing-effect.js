// js/typing-effect.js - Multi-phrase typing effect
document.addEventListener('DOMContentLoaded', function() {
    const phrases = [
        'Cybersecurity Student',
        'Web Developer',
        'Data Enthusiast',
        'Ethical Hacker',
        'Aviation Systems Expert'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const element = document.querySelector('.hero-title .title-role');
    
    if (!element) return;
    
    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            element.textContent = currentPhrase.substring(0, charIndex--);
        } else {
            element.textContent = currentPhrase.substring(0, charIndex++);
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            setTimeout(() => isDeleting = true, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        
        setTimeout(typeEffect, isDeleting ? 50 : 100);
    }
    
    typeEffect();
});
