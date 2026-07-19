// js/projects-data.js - Project data
const projects = [
    {
        id: 1,
        title: 'Pentest Toolkit Dashboard',
        category: 'cybersecurity',
        description: 'Interactive web dashboard integrating 50+ WSL2 security tools with real-time terminal emulator for ethical hacking.',
        tech: ['Bash', 'JavaScript', 'WSL2', 'Kali'],
        github: 'https://github.com/HephzibahBehulah/pentest-toolkit',
        demo: 'pentest.html',
        image: 'assets/images/projects/pentest.jpg',
        featured: true,
        date: '2024-12-01',
        stats: { stars: 12, forks: 3, views: 245 }
    },
    {
        id: 2,
        title: 'Data Analytics Dashboard',
        category: 'data',
        description: 'Real-time data visualization and analytics using Python, Google BigQuery, and Colab for business intelligence.',
        tech: ['Python', 'BigQuery', 'Colab', 'Pandas'],
        github: 'https://github.com/HephzibahBehulah/data-dashboard',
        demo: '#',
        image: 'assets/images/projects/data-analytics.jpg',
        featured: true,
        date: '2024-11-15',
        stats: { stars: 8, forks: 2, views: 189 }
    },
    {
        id: 3,
        title: 'Secure E-Commerce Platform',
        category: 'web',
        description: 'Full-stack web application with payment processing, user authentication, and comprehensive security features.',
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Node.js'],
        github: 'https://github.com/HephzibahBehulah/secure-ecommerce',
        demo: '#',
        image: 'assets/images/projects/secure-web.jpg',
        featured: false,
        date: '2024-10-20',
        stats: { stars: 5, forks: 1, views: 134 }
    },
    {
        id: 4,
        title: 'Aviation Systems Monitor',
        category: 'aviation',
        description: 'Monitoring and diagnostic tool for Airbus electronic systems and lighting installations with real-time alerts.',
        tech: ['Python', 'IoT', 'Electronics', 'Dashboard'],
        github: '#',
        demo: '#',
        image: 'assets/images/projects/aviation.jpg',
        featured: false,
        date: '2024-09-10',
        stats: { stars: 3, forks: 0, views: 67 }
    },
    {
        id: 5,
        title: 'Cybersecurity Blog',
        category: 'cybersecurity',
        description: 'Educational blog covering ethical hacking, security best practices, and technology insights for beginners.',
        tech: ['Blogger', 'Content', 'Security', 'Education'],
        github: '#',
        demo: 'https://hephzibahbehulah.blogspot.com',
        image: 'assets/images/projects/blog.jpg',
        featured: false,
        date: '2024-08-01',
        stats: { stars: 0, forks: 0, views: 523 }
    }
];

function renderProjects(filter = 'all') {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    
    const filtered = filter === 'all' 
        ? projects 
        : projects.filter(p => p.category === filter);
    
    grid.innerHTML = filtered.map(project => `
        <article class="project-item" data-category="${project.category}">
            <div class="project-image">
                <img src="assets/images/placeholder.jpg" 
                     data-src="${project.image}" 
                     alt="${project.title}" 
                     loading="lazy" 
                     class="lazy-load">
                ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
            </div>
            <div class="project-info">
                <span class="project-category">${project.category}</span>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.tech.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                <div class="project-stats">
                    <span>⭐ ${project.stats.stars}</span>
                    <span>🔀 ${project.stats.forks}</span>
                    <span>👁️ ${project.stats.views}</span>
                </div>
                <div class="project-links">
                    ${project.demo && project.demo !== '#' ? `<a href="${project.demo}" class="btn btn-sm btn-primary">Live Demo</a>` : ''}
                    ${project.github && project.github !== '#' ? `<a href="${project.github}" class="btn btn-sm btn-secondary" target="_blank">GitHub</a>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { projects, renderProjects };
}
