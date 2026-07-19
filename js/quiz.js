// js/quiz.js - Cybersecurity Quiz
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
        this.questions = this.shuffleArray(quizData);
        this.render();
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
                <div class="quiz-complete">
                    <h3>🎉 Quiz Complete!</h3>
                    <p>You scored <strong>${this.score}</strong> out of ${this.questions.length}</p>
                    <p>${this.getFeedback()}</p>
                    <button class="btn btn-primary" onclick="window.quiz.reset()">🔄 Restart Quiz</button>
                </div>
            `;
            return;
        }
        
        const q = this.questions[this.currentQuestion];
        container.innerHTML = `
            <div class="quiz-question">
                <div class="quiz-progress">
                    <span>Question ${this.currentQuestion + 1}/${this.questions.length}</span>
                    <span>Score: ${this.score}</span>
                </div>
                <h3>${q.question}</h3>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}" onclick="window.quiz.selectAnswer(${i})">
                            ${String.fromCharCode(65 + i)}. ${opt}
                        </button>
                    `).join('')}
                </div>
                <div class="quiz-feedback"></div>
                ${this.currentQuestion < this.questions.length - 1 ? 
                    `<button class="btn btn-secondary" onclick="window.quiz.nextQuestion()" disabled id="nextBtn">Next →</button>` : 
                    `<button class="btn btn-primary" onclick="window.quiz.nextQuestion()" disabled id="nextBtn">See Results →</button>`
                }
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
                btn.classList.add('correct');
            }
            if (i === index && index !== q.correct) {
                btn.classList.add('incorrect');
            }
        });
        
        if (index === q.correct) {
            this.score++;
            feedback.innerHTML = '<span style="color: #22c55e;">✅ Correct!</span>';
        } else {
            feedback.innerHTML = `<span style="color: #ef4444;">❌ Incorrect. The answer was: ${q.options[q.correct]}</span>`;
        }
        
        document.getElementById('nextBtn').disabled = false;
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.answered = false;
        this.render();
    }
    
    getFeedback() {
        const percentage = (this.score / this.questions.length) * 100;
        if (percentage >= 80) return '🌟 Excellent! You\'re a cybersecurity expert!';
        if (percentage >= 60) return '💪 Good job! Keep learning and improving!';
        if (percentage >= 40) return '📚 Nice try! Review the topics to strengthen your knowledge.';
        return '🔄 Keep practicing! Cybersecurity is a journey of continuous learning.';
    }
    
    reset() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answered = false;
        this.questions = this.shuffleArray(quizData);
        this.render();
    }
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('quizContainer')) {
        window.quiz = new Quiz();
    }
});
