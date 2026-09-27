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
        {
            id: 'programming',
            name: 'Programming & Dev',
            icon: '💻',
            description: 'Code editors, compilers, and development tools',
            category: 'web',
            children: [
                { id: 'onecompiler', name: 'OneCompiler', icon: '⚡', description: 'Interactive Python code compiler for testing and learning programming concepts.', url: 'https://onecompiler.com/python', category: 'web' },
                { id: 'vscode', name: 'VS Code', icon: '📝', badge: 'T', description: 'Free, powerful code editor with extensions for every language.', url: 'https://code.visualstudio.com', category: 'web' },
                { id: 'github', name: 'GitHub', icon: '🐙', badge: 'R', description: 'Version control and collaboration platform for developers.', url: 'https://github.com', category: 'web' },
                { id: 'figma', name: 'Figma', icon: '🎨', badge: 'R', description: 'Collaborative design tool for UI/UX prototyping.', url: 'https://figma.com', category: 'web' },
                { id: 'netlify', name: 'Netlify', icon: '🚀', badge: 'R', description: 'Static site hosting and deployment platform.', url: 'https://netlify.com', category: 'web' },
                { id: 'vercel', name: 'Vercel', icon: '▲', badge: 'R', description: 'Frontend cloud platform for modern web apps.', url: 'https://vercel.com', category: 'web' }
            ]
        },
        {
            id: 'cybersecurity',
            name: 'Cybersecurity',
            icon: '🛡️',
            description: 'Ethical hacking, penetration testing, and security learning',
            category: 'cybersecurity',
            children: [
                { id: 'portswigger', name: 'PortSwigger Academy', icon: '🎯', description: 'Free web security training from the creators of Burp Suite.', url: 'https://portswigger.net/web-security', category: 'cybersecurity' },
                { id: 'owasp', name: 'OWASP Cheat Sheets', icon: '📋', description: 'Comprehensive security cheat sheets for web applications.', url: 'https://cheatsheetseries.owasp.org', category: 'cybersecurity' },
                { id: 'tryhackme', name: 'TryHackMe', icon: '💻', badge: 'R', description: 'Hands-on cybersecurity training through gamified labs.', url: 'https://tryhackme.com', category: 'cybersecurity' },
                { id: 'hackthebox', name: 'Hack The Box', icon: '📦', badge: 'R', description: 'Penetration testing labs and CTF challenges.', url: 'https://app.hackthebox.com', category: 'cybersecurity' },
                { id: 'osint-framework', name: 'OSINT Framework', icon: '🕵️', description: 'Interactive map of open-source intelligence tools.', url: 'https://osintframework.com', category: 'cybersecurity' },
                { id: 'cybrary', name: 'Cybrary', icon: '📚', badge: 'R', description: 'Free and premium cybersecurity courses.', url: 'https://cybrary.it', category: 'cybersecurity' },
                { id: 'vulnhub', name: 'VulnHub', icon: '💿', description: 'Vulnerable virtual machines for practice.', url: 'https://vulnhub.com', category: 'cybersecurity' },
                { id: 'ctftime', name: 'CTF Time', icon: '🏁', description: 'Global CTF competition calendar and rankings.', url: 'https://ctftime.org', category: 'cybersecurity' }
            ]
        },
        {
            id: 'data',
            name: 'Data & Analytics',
            icon: '📊',
            description: 'Data science, machine learning, and analytics tools',
            category: 'data',
            children: [
                { id: 'kaggle', name: 'Kaggle', icon: '🏆', badge: 'R', description: 'Datasets, competitions, and ML notebooks.', url: 'https://kaggle.com', category: 'data' },
                { id: 'colab', name: 'Google Colab', icon: '📓', description: 'Free cloud-based Python notebooks with GPU.', url: 'https://colab.research.google.com', category: 'data' },
                { id: 'bigquery', name: 'BigQuery', icon: '📊', description: 'Serverless data warehouse from Google Cloud.', url: 'https://cloud.google.com/bigquery', category: 'data' },
                { id: 'tableau', name: 'Tableau', icon: '📈', badge: 'R', description: 'Business intelligence and data visualization.', url: 'https://tableau.com', category: 'data' },
                { id: 'powerbi', name: 'Power BI', icon: '📉', badge: 'R', description: 'Microsoft business analytics service.', url: 'https://powerbi.microsoft.com', category: 'data' },
                { id: 'database-star', name: 'Database Star', icon: '⭐', description: 'Free datasets for data science projects.', url: 'https://database.star', category: 'data' }
            ]
        },
        {
            id: 'electrical',
            name: 'Electrical Engineering',
            icon: '⚡',
            description: 'Electronics, circuits, and electrical systems',
            category: 'electrical',
            children: [
                { id: 'allaboutcircuits', name: 'All About Circuits', icon: '⚡', description: 'Free electrical engineering textbooks and resources.', url: 'https://allaboutcircuits.com', category: 'electrical' },
                { id: 'electronics-tutorials', name: 'Electronics Tutorials', icon: '🔌', description: 'Electronics tutorials and circuit theory.', url: 'https://electronics-tutorials.ws', category: 'electrical' },
                { id: 'circuitlab', name: 'CircuitLab', icon: '🔄', badge: 'R', description: 'Online circuit simulator and schematic editor.', url: 'https://circuitlab.com', category: 'electrical' },
                { id: 'ti', name: 'Texas Instruments', icon: '🔋', description: 'Electronic components and reference designs.', url: 'https://ti.com', category: 'electrical' },
                { id: 'arduino', name: 'Arduino', icon: '🔧', description: 'Open-source electronics platform.', url: 'https://arduino.cc', category: 'electrical' },
                { id: 'raspberrypi', name: 'Raspberry Pi', icon: '🍓', description: 'Single-board computers for projects.', url: 'https://raspberrypi.org', category: 'electrical' }
            ]
        },
        {
            id: 'aviation',
            name: 'Aviation Systems',
            icon: '✈️',
            description: 'Aviation technology and aerospace engineering',
            category: 'aviation',
            children: [
                { id: 'airbus', name: 'Airbus Official', icon: '✈️', description: 'Airbus aircraft and aerospace technology.', url: 'https://airbus.com', category: 'aviation' },
                { id: 'faa', name: 'FAA Resources', icon: '🛫', description: 'Federal Aviation Administration resources.', url: 'https://faa.gov', category: 'aviation' },
                { id: 'skybrary', name: 'SKYbrary', icon: '📚', description: 'Aviation safety knowledge base.', url: 'https://skybrary.aero', category: 'aviation' },
                { id: 'flightglobal', name: 'FlightGlobal', icon: '🌍', description: 'Aviation news and industry insights.', url: 'https://flightglobal.com', category: 'aviation' }
            ]
        },
        {
            id: 'learning',
            name: 'Learning & Education',
            icon: '🎓',
            description: 'Free courses, eBooks, and educational platforms',
            category: 'learning',
            children: [
                { id: 'openlibrary', name: 'Open Library', icon: '📚', description: 'Millions of free eBooks from the Internet Archive.', url: 'https://openlibrary.org', category: 'learning' },
                { id: 'gutenberg', name: 'Project Gutenberg', icon: '📖', description: 'Over 60,000 free classic eBooks.', url: 'https://gutenberg.org', category: 'learning' },
                { id: 'pdfdrive', name: 'PDF Drive', icon: '📕', description: 'Free PDF eBooks for download.', url: 'https://pdfdrive.com', category: 'learning' },
                { id: 'genz-bible', name: 'GenZ Bible', icon: '📖', description: 'Modern Bible reading platform for youth.', url: 'https://genz-bible.com', category: 'learning' },
                { id: 'biblegateway', name: 'Bible Gateway', icon: '📜', description: 'Read and search the Bible in multiple versions.', url: 'https://biblegateway.com', category: 'learning' }
            ]
        },
        {
            id: 'cloud',
            name: 'Cloud & DevOps',
            icon: '☁️',
            description: 'Cloud platforms, containers, and infrastructure',
            category: 'tools',
            children: [
                { id: 'aws', name: 'AWS', icon: '☁️', badge: 'R', description: 'Amazon Web Services cloud platform.', url: 'https://aws.amazon.com', category: 'tools' },
                { id: 'gcp', name: 'Google Cloud', icon: '🔵', badge: 'R', description: 'Google Cloud Platform services.', url: 'https://cloud.google.com', category: 'tools' },
                { id: 'azure', name: 'Microsoft Azure', icon: '🔷', badge: 'R', description: 'Microsoft cloud computing platform.', url: 'https://azure.microsoft.com', category: 'tools' },
                { id: 'docker', name: 'Docker', icon: '🐳', badge: 'T', description: 'Container platform for applications.', url: 'https://docker.com', category: 'tools' },
                { id: 'kubernetes', name: 'Kubernetes', icon: '⚓', badge: 'T', description: 'Container orchestration system.', url: 'https://kubernetes.io', category: 'tools' }
            ]
        },
        {
            id: 'networking',
            name: 'Networking',
            icon: '🌐',
            description: 'Network engineering and infrastructure',
            category: 'tools',
            children: [
                { id: 'cisco', name: 'Cisco', icon: '🌐', description: 'Networking hardware and certifications.', url: 'https://cisco.com', category: 'tools' },
                { id: 'netacad', name: 'Cisco NetAcad', icon: '📡', badge: 'R', description: 'Free networking courses from Cisco.', url: 'https://netacad.com', category: 'tools' },
                { id: 'wireshark', name: 'Wireshark', icon: '🦈', badge: 'T', description: 'Network protocol analyzer.', url: 'https://wireshark.org', category: 'tools' },
                { id: 'nmap', name: 'Nmap', icon: '🔍', badge: 'T', description: 'Network discovery and security scanning.', url: 'https://nmap.org', category: 'tools' }
            ]
        },
        {
            id: 'iot',
            name: 'IoT & Automation',
            icon: '🤖',
            description: 'Internet of Things and automation platforms',
            category: 'tools',
            children: [
                { id: 'homeassistant', name: 'Home Assistant', icon: '🏠', badge: 'T', description: 'Open-source home automation platform.', url: 'https://home-assistant.io', category: 'tools' },
                { id: 'iotforall', name: 'IoT For All', icon: '📶', description: 'IoT news, articles, and resources.', url: 'https://iotforall.com', category: 'tools' },
                { id: 'eclipse-iot', name: 'Eclipse IoT', icon: '🌐', description: 'Open-source IoT projects and tools.', url: 'https://eclipse.org', category: 'tools' }
            ]
        }
    ]
};

window.resourcesTreeData = resourcesTreeData;
