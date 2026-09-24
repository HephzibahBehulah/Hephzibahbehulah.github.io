const homeTreeData = {
    id: 'root',
    name: 'Hephzibah Behulah',
    icon: '⚡',
    badge: null,
    description: 'Cybersecurity Student & Web Developer based in Hamburg, Germany. Building secure, user-focused digital experiences with precision and ethical technology.',
    url: 'https://hephzibahbehulah.github.io',
    category: 'cybersecurity',
    children: [
        {
            id: 'hero',
            name: 'Welcome',
            icon: '👋',
            description: 'Hi, I\'m Hephzibah Behulah — Cybersecurity Student, Web Developer, Data Enthusiast.',
            category: 'cybersecurity',
            children: [
                { id: 'status', name: 'Open to Opportunities', icon: '🟢', badge: 'NEW', description: 'Available for freelance work and collaboration.', category: 'cybersecurity' },
                { id: 'mission', name: 'My Mission', icon: '🎯', description: 'I started with systems you can touch. Now I\'m building with systems you can\'t. Curiosity drives everything I do.', category: 'cybersecurity' },
                { id: 'location', name: 'Hamburg, Germany', icon: '🇩🇪', description: 'Based in Hamburg, working at Centerline Design and studying at IU Internationale Hochschule.', category: 'cybersecurity' }
            ]
        },
        {
            id: 'stats',
            name: 'By the Numbers',
            icon: '📊',
            description: 'Key metrics about my journey and work',
            category: 'data',
            children: [
                { id: 'tools', name: '50+ Pentest Tools', icon: '🔐', description: 'Integrated 50+ WSL2 security tools into an interactive dashboard.', category: 'cybersecurity' },
                { id: 'years', name: '3+ Years Experience', icon: '📅', description: 'Hands-on experience in electrical engineering, web development, and cybersecurity.', category: 'data' },
                { id: 'ethical', name: '100% Ethical Approach', icon: '🛡️', description: 'Committed to ethical hacking, responsible disclosure, and privacy-first design.', category: 'cybersecurity' },
                { id: 'projects', name: '15+ Projects Completed', icon: '✅', description: 'From web apps to security tools and data analytics dashboards.', category: 'data' }
            ]
        },
        {
            id: 'skills',
            name: 'Tech Stack & Skills',
            icon: '⚡',
            description: 'Technologies and tools I work with',
            category: 'web',
            children: [
                {
                    id: 'development',
                    name: 'Development',
                    icon: '💻',
                    category: 'web',
                    children: [
                        { id: 'html', name: 'HTML5 & CSS3', icon: '🎨', description: 'Semantic markup, responsive design', category: 'web' },
                        { id: 'js', name: 'JavaScript (ES6+)', icon: '⚡', description: 'Modern JS, DOM, async patterns', category: 'web' },
                        { id: 'tailwind', name: 'Tailwind CSS', icon: '🎯', description: 'Utility-first styling', category: 'web' },
                        { id: 'python', name: 'Python', icon: '🐍', description: 'Scripting, automation, data analysis', category: 'web' },
                        { id: 'bash', name: 'Bash Scripting', icon: '💲', description: 'Linux automation', category: 'web' }
                    ]
                },
                {
                    id: 'security-skills',
                    name: 'Security',
                    icon: '🛡️',
                    category: 'cybersecurity',
                    children: [
                        { id: 'ethical-hacking', name: 'Ethical Hacking', icon: '🎯', description: 'Responsible penetration testing', category: 'cybersecurity' },
                        { id: 'pentest', name: 'Penetration Testing', icon: '🔍', description: 'WSL2/Kali tools, methodologies', category: 'cybersecurity' },
                        { id: 'network-sec', name: 'Network Security', icon: '🌐', description: 'Analysis, hardening, monitoring', category: 'cybersecurity' },
                        { id: 'owasp', name: 'OWASP Top 10', icon: '📋', description: 'Web application security', category: 'cybersecurity' }
                    ]
                },
                {
                    id: 'data-skills',
                    name: 'Data Analytics',
                    icon: '📊',
                    category: 'data',
                    children: [
                        { id: 'bigquery', name: 'Google BigQuery', icon: '📊', description: 'Cloud data warehouse', category: 'data' },
                        { id: 'colab', name: 'Google Colab', icon: '📓', description: 'Cloud Python notebooks', category: 'data' },
                        { id: 'pandas', name: 'Pandas / NumPy', icon: '🐼', description: 'Data manipulation', category: 'data' },
                        { id: 'sql', name: 'SQL', icon: '🗃️', description: 'Database queries', category: 'data' }
                    ]
                },
                {
                    id: 'devops-skills',
                    name: 'DevOps',
                    icon: '⚙️',
                    category: 'tools',
                    children: [
                        { id: 'git', name: 'Git & GitHub', icon: '🐙', description: 'Version control', category: 'tools' },
                        { id: 'ghpages', name: 'GitHub Pages', icon: '🌐', description: 'Static hosting', category: 'tools' },
                        { id: 'docker', name: 'Docker', icon: '🐳', description: 'Containerization', category: 'tools' },
                        { id: 'netlify', name: 'Netlify', icon: '🚀', description: 'Deployment platform', category: 'tools' }
                    ]
                }
            ]
        },
        {
            id: 'featured',
            name: 'Featured Work',
            icon: '🚀',
            description: 'Highlighted projects and creations',
            category: 'web',
            children: [
                {
                    id: 'pentest-toolkit',
                    name: 'Pentest Toolkit',
                    icon: '🔐',
                    badge: 'R',
                    description: '50+ security tools integrated into an interactive web dashboard for ethical hacking and cybersecurity education.',
                    url: 'index.html#terminal',
                    category: 'cybersecurity'
                },
                {
                    id: 'data-analytics',
                    name: 'Data Analytics',
                    icon: '📊',
                    description: 'Python-based data analysis projects using Google Colab, BigQuery, and advanced visualization tools.',
                    url: 'index.html#projects',
                    category: 'data'
                },
                {
                    id: 'secure-web',
                    name: 'Secure Web Development',
                    icon: '🛡️',
                    description: 'Building secure, accessible, and responsive web applications with ethical AI integration and privacy-first design.',
                    url: 'index.html#projects',
                    category: 'web'
                }
            ]
        },
        {
            id: 'connect',
            name: 'Connect With Me',
            icon: '🌐',
            description: 'Social links and ways to reach me',
            category: 'social',
            children: [
                { id: 'github', name: 'GitHub', icon: '🐙', description: '@HephzibahBehulah', url: 'https://github.com/HephzibahBehulah', category: 'social' },
                { id: 'linkedin', name: 'LinkedIn', icon: '🔗', description: 'Isaac Oluwole Adigun', url: 'https://linkedin.com/in/isaacoluwoleadigun', category: 'social' },
                { id: 'twitter', name: 'Twitter / X', icon: '🐦', description: '@hephzibaBehulah', url: 'https://x.com/hephzibaBehulah', category: 'social' },
                { id: 'blog', name: 'Cybersecurity Blog', icon: '📝', description: 'hephzibahbehulah.blogspot.com', url: 'https://hephzibahbehulah.blogspot.com', category: 'social' },
                { id: 'facebook', name: 'Facebook', icon: '📘', description: 'Hephzibah Behulah', url: 'https://www.facebook.com/HephzibahBehulah', category: 'social' },
                { id: 'gitbook', name: 'GitBook', icon: '📚', description: 'Cybersecurity Study Notes', url: 'https://gitbook.io', category: 'social' },
                { id: 'email', name: 'Email', icon: '📧', description: 'isaacadigunoluwole@gmail.com', url: 'mailto:isaacadigunoluwole@gmail.com', category: 'contact' }
            ]
        },
        {
            id: 'navigate',
            name: 'Explore',
            icon: '🧭',
            description: 'Navigate to other sections',
            category: 'learning',
            children: [
                { id: 'nav-about', name: 'About Me', icon: '👤', description: 'My journey and experience', url: 'about.html', category: 'learning' },
                { id: 'nav-portfolio', name: 'Portfolio', icon: '📁', description: 'Projects and work samples', url: 'index.html#projects', category: 'learning' },
                { id: 'nav-resources', name: 'Resources', icon: '📚', description: 'Learning resources tree', url: 'index.html#resourceMatrix', category: 'learning' },
                { id: 'nav-pentest', name: 'Pentest Tools', icon: '🔐', description: '50+ security tools', url: 'pentest.html', category: 'cybersecurity' },
                { id: 'nav-contact', name: 'Contact', icon: '📧', description: 'Get in touch', url: 'contact.html', category: 'contact' }
            ]
        }
    ]
};

window.homeTreeData = homeTreeData;
