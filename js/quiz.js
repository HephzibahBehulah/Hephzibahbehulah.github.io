/* ========================================
   QUIZ.JS - Cybersecurity Quiz
   Clean Version
   ======================================== */

(function() {
    'use strict';

    // Prevent multiple initializations
    if (window.__quizInitialized) {
        console.log('⚠️ Quiz already initialized, skipping.');
        return;
    }
    window.__quizInitialized = true;

    const quizData = [
        {
            question: "What does WAF stand for?",
            options: ["Web Application Firewall", "World Application Framework", "Web Access Function", "Wide Area Firewall"],
            correct: 0
        },
        {
            question: "Which port does HTTPS use?",
            options: ["80", "443", "8080", "8443"],
            correct: 1
        },
        {
            question: "What is the most common type of cyber attack?",
            options: ["Phishing", "DDoS", "Man-in-the-Middle", "SQL Injection"],
            correct: 0
        },
        {
            question: "What does 'XSS' stand for?",
            options: ["Cross-Site Scripting", "Cross-System Security", "XML Secure Socket", "Extended Security Service"],
            correct: 0
        },
        {
            question: "Which of these is a strong password?",
            options: ["password123", "12345678", "P@ssw0rd!2024", "qwerty"],
            correct: 2
        },
        {
            question: "What is the purpose of encryption?",
            options: ["To hide data", "To secure data", "To delete data", "To copy data"],
            correct: 1
        },
        {
            question: "What does VPN stand for?",
            options: ["Virtual Private Network", "Very Personal Network", "Virtual Public Network", "Verified Protected Network"],
            correct: 0
        },
        {
            question: "Which of the following is NOT a type of malware?",
            options: ["Virus", "Spyware", "Firewall", "Ransomware"],
            correct: 2
        }
    ];

    class Quiz {
        constructor() {
            this.currentQuestion = 0;
            this.score = 0;
            this.answered = false;
            this.questions = this.shuffleArray([...quizData]);
            this.render();
            console.log('✅ Quiz initialized!');
        }
        
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        render() {
            const container = document.getElementById('quizContainer');
            if (!container) return;
            
            if (this.currentQuestion >= this.questions.length) {
                container.innerHTML = `
                    <div class="quiz-complete" style="text-align: center; padding: 1rem;">
                        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">🎉 Quiz Complete!</h3>
                        <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">You scored <strong>${this.score}</strong> out of ${this.questions.length}</p>
                        <p style="margin-bottom: 1.5rem;">${this.getFeedback()}</p>
                        <button onclick="window.quiz.reset()" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: var(--primary); color: white; cursor: pointer; font-size: 1rem; font-weight: 600;">
                            🔄 Restart Quiz
                        </button>
                    </div>
                `;
                return;
            }
            
            const q = this.questions[this.currentQuestion];
            container.innerHTML = `
                <div class="quiz-question">
                    <div class="quiz-progress" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 500; color: var(--text-light);">
                        <span>Question ${this.currentQuestion + 1}/${this.questions.length}</span>
                        <span>Score: ${this.score}</span>
                    </div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem;">${q.question}</h3>
                    <div class="quiz-options" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                        ${q.options.map((opt, i) => `
                            <button class="quiz-option" data-index="${i}" onclick="window.quiz.selectAnswer(${i})" style="padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; background: var(--bg-color); color: var(--text-color); cursor: pointer; font-size: 1rem; text-align: left;">
                                ${String.fromCharCode(65 + i)}. ${opt}
                            </button>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback" style="margin-bottom: 1rem; min-height: 30px; font-weight: 500;"></div>
                    <button onclick="window.quiz.nextQuestion()" disabled id="nextBtn" style="padding: 0.6rem 1.5rem; border: 2px solid var(--border-color); border-radius: 8px; background: transparent; color: var(--text-light); cursor: pointer; font-weight: 600; opacity: 0.5;">
                        ${this.currentQuestion < this.questions.length - 1 ? 'Next →' : 'See Results →'}
                    </button>
                </div>
            `;
        }
        
        selectAnswer(index) {
            if (this.answered) return;
            this.answered = true;
            
            const q = this.questions[this.currentQuestion];
            const options = document.querySelectorAll('.quiz-option');
            const feedback = document.querySelector('.quiz-feedback');
            
            options.forEach((btn, i) => {
                btn.disabled = true;
                if (i === q.correct) {
                    btn.style.borderColor = '#22c55e';
                    btn.style.background = 'rgba(34, 197, 94, 0.1)';
                    btn.style.color = '#22c55e';
                }
                if (i === index && index !== q.correct) {
                    btn.style.borderColor = '#ef4444';
                    btn.style.background = 'rgba(239, 68, 68, 0.1)';
                    btn.style.color = '#ef4444';
                }
            });
            
            if (index === q.correct) {
                this.score++;
                feedback.innerHTML = '<span style="color: #22c55e;">✅ Correct!</span>';
            } else {
                feedback.innerHTML = `<span style="color: #ef4444;">❌ Incorrect. Answer: ${q.options[q.correct]}</span>`;
            }
            
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.style.borderColor = 'var(--primary)';
                nextBtn.style.color = 'var(--primary)';
            }
        }
        
        nextQuestion() {
            this.currentQuestion++;
            this.answered = false;
            this.render();
        }
        
        getFeedback() {
            const pct = (this.score / this.questions.length) * 100;
            if (pct >= 80) return '🌟 Excellent!';
            if (pct >= 60) return '💪 Good job!';
            if (pct >= 40) return '📚 Keep learning!';
            return '🔄 Practice more!';
        }
        
        reset() {
            this.currentQuestion = 0;
            this.score = 0;
            this.answered = false;
            this.questions = this.shuffleArray([...quizData]);
            this.render();
        }
    }

    // Auto-init
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('quizContainer')) {
            window.quiz = new Quiz();
        }
    });

})();
