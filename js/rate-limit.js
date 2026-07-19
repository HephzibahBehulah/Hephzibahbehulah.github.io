// js/rate-limit.js - Form rate limiting
class FormRateLimiter {
    constructor() {
        this.submissions = {};
        this.limit = 3; // submissions per hour
        this.window = 3600000; // 1 hour in ms
    }
    
    check(key) {
        const now = Date.now();
        if (!this.submissions[key]) {
            this.submissions[key] = [];
        }
        
        // Clean old submissions
        this.submissions[key] = this.submissions[key].filter(
            time => now - time < this.window
        );
        
        if (this.submissions[key].length >= this.limit) {
            return { allowed: false, remaining: 0, resetIn: this.getResetTime(key) };
        }
        
        this.submissions[key].push(now);
        const remaining = this.limit - this.submissions[key].length;
        return { allowed: true, remaining };
    }
    
    getResetTime(key) {
        const times = this.submissions[key] || [];
        if (times.length === 0) return 0;
        const oldest = Math.min(...times);
        const resetTime = oldest + this.window;
        return Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
    }
}

const
