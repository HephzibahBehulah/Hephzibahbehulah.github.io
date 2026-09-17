/* ========================================
   TREE DATA - All Resources
   ======================================== */

const resourcesTreeData = {
    id: 'root',
    name: 'Resources',
    icon: '📚',
    description: 'All learning resources and tools',
    category: 'learning',
    children: [
        // ========================================
        // PROGRAMMING & DEVELOPMENT
        // ========================================
        {
            id: 'programming',
            name: 'Programming & Dev',
            icon: '💻',
            description: 'Code editors, compilers, and development tools',
            category: 'web',
            children: [
                {
                    id: 'onecompiler',
                    name: 'OneCompiler',
                    icon: '⚡',
                    badge: null,
                    description: 'Interactive Python code compiler for testing and learning programming concepts.',
                    url: 'https://onecompiler.com/python',
                    category: 'web'
                },
                {
                    id: 'vscode',
                    name: 'VS Code',
                    icon: '📝',
                    badge: 'T',
                    description: 'Free, powerful code editor with extensions for every language.',
                    url: 'https://code.visualstudio.com',
                    category: 'web'
                },
                {
                    id: 'github',
                    name: 'GitHub',
                    icon: '🐙',
                    badge: 'R',
                    description: 'Version control and collaboration platform for developers.',
                    url: 'https://github.com',
                    category: 'web'
                },
                {
                    id: 'figma',
                    name: 'Figma',
                    icon: '🎨',
                    badge: 'R',
                    description: 'Collaborative design tool for UI/UX prototyping.',
                    url: 'https://figma.com',
                    category: 'web'
                },
                {
                    id: 'netlify',
                    name: 'Netlify',
                    icon: '🚀',
                    badge: 'R',
                    description: 'Static site hosting and deployment platform.',
                    url: 'https://netlify.com',
                    category: 'web'
                },
                {
                    id: 'vercel',
                    name: 'Vercel',
                    icon: '▲',
                    badge: 'R',
                    description: 'Frontend cloud platform for modern web apps.',
                    url: 'https://vercel.com',
                    category: 'web'
                }
            ]
        },
        
        // ========================================
        // CYBERSECURITY
        // ========================================
        {
            id: 'cybersecurity',
            name: 'Cybersecurity',
            icon: '🛡️',
            description: 'Ethical hacking, penetration testing, and security learning',
            category: 'cybersecurity',
            children: [
                {
                    id: 'portswigger',
                    name: 'PortSwigger Academy',
                    icon: '🎯',
                    description: 'Free web security training from the creators of Burp Suite.',
                    url: 'https://portswigger.net/web-security',
                    category: 'cybersecurity'
                },
                {
                    id: 'owasp',
                    name: 'OWASP Cheat Sheets',
                    icon: '📋',
                    description: 'Comprehensive security cheat sheets for web applications.',
                    url: 'https://cheatsheetseries.owasp.org',
                    category: 'cybersecurity'
                },
                {
                    id: 'tryhackme',
                    name: 'TryHackMe',
                    icon: '💻',
                    badge: 'R',
                    description: 'Hands-on cybersecurity training through gamified labs.',
                    url: 'https://tryhackme.com
