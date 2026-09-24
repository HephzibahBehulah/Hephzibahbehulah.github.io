# Hephzibah Behulah — Personal Website

> **Wires taught me precision. Code taught me possibility. Ethics taught me responsibility.**

Personal portfolio and learning platform for **Hephzibah Behulah**, bringing together electrical engineering experience, cybersecurity learning, web development, data analytics, and practical security research.

**Live website:** https://hephzibahbehulah.github.io/FirstWebsite/  
**Repository:** https://github.com/HephzibahBehulah/FirstWebsite

---

## About the Project

This is more than a static portfolio. It is a living digital workspace that documents my transition from hands-on electrical work into technology and cybersecurity.

The website combines:

- A personal portfolio and professional profile
- Cybersecurity and penetration-testing learning resources
- An OSINT research and discovery interface
- A security tools hub
- An ebook/resource index
- Interactive learning features
- Projects, notes, and experiments
- Contact and professional information

The goal is simple: **learn, build, document, and share responsibly.**

---

## What You Can Explore

### Portfolio
Information about my background, experience, skills, projects, and ongoing technology journey.

### Cybersecurity
A practical learning environment covering areas such as:

- Networking
- Web security
- OSINT
- Reconnaissance
- Vulnerability assessment
- Penetration-testing concepts
- Security tooling
- Ethical hacking labs

### OSINT Research Hub
An organized interface for discovering publicly available OSINT resources and tools.

The OSINT section uses external public data where appropriate and includes local fallback data so the interface can remain useful when an external source is unavailable.

### Pentest Toolkit
An educational browser-based toolkit containing security utilities, explanations, terminal-style interactions, and links to relevant resources.

> **Responsible use:** Security tools and techniques on this site are intended for education, authorized testing, CTFs, labs, and systems you own or have explicit permission to assess.

### Learning Resources
The site can dynamically index cybersecurity ebooks and other learning resources from the associated repository.

---

## Technology

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Responsive design
- CSS custom properties
- Modular JavaScript
- Font Awesome
- AOS / animation libraries where used

### Security & Research Features
- OSINT resource discovery
- Pentesting reference tools
- Interactive terminal interface
- Security learning resources
- External resource integration
- Client-side filtering and search

### Deployment
- GitHub
- GitHub Pages
- HTTPS
- Static-site architecture

---

## Project Structure

\`\`\`text
FirstWebsite/
├── index.html                 # Main landing page
├── about.html                 # About / background
├── portfolio.html             # Projects and portfolio
├── resources.html             # Learning resources
├── pentest.html               # Pentesting toolkit
├── contact.html               # Contact page
│
├── assets/
│   └── images/                # Website images
│
├── css/
│   ├── main.css               # Core styling
│   ├── responsive.css         # Responsive behaviour
│   ├── dark.css               # Dark-mode styling
│   ├── pentest.css            # Pentest interface
│   ├── accessibility.css      # Accessibility support
│   └── osint-*.css            # OSINT interfaces
│
├── js/
│   ├── main.js                # Main website behaviour
│   ├── intelligence-hub.js    # Dynamic tools/resources hub
│   ├── pentest.js             # Pentest interface
│   ├── osint-*.js             # OSINT functionality
│   ├── projects-data.js       # Portfolio project data
│   ├── tree-data*.js          # Navigation/tree data
│   ├── terminal-emulator.js   # Terminal interface
│   └── theme.js               # Theme management
│
├── pentest-script/
│   └── hephzibah-pentest.sh   # Bash security-learning script
│
├── sw.js                      # Service worker
└── .nojekyll                  # GitHub Pages configuration
\`\`\`

---

## Design Principles

### Practical
The website is built around things I am actually learning, testing, or building.

### Modular
Features are separated into reusable HTML, CSS, and JavaScript components so the project can evolve without rebuilding everything.

### Resilient
Dynamic features should fail gracefully. If an external API or data source is unavailable, the website should preserve the core interface and provide a useful fallback where possible.

### Privacy-conscious
The project avoids exposing secrets or credentials in client-side code. Public resources are linked openly, while sensitive configuration should remain outside the repository.

### Accessible
The interface aims to support semantic structure, keyboard navigation, readable contrast, responsive layouts, and accessibility attributes where appropriate.

---

## Development

Clone the repository:

\`\`\`bash
git clone https://github.com/HephzibahBehulah/FirstWebsite.git
cd FirstWebsite
\`\`\`

Because this is primarily a static website, the files can be served with any local HTTP server.

For example:

\`\`\`bash
python -m http.server 8000
\`\`\`

Then open:

\`\`\`text
http://localhost:8000
\`\`\`

---

## Important Security Notes

This repository is public.

Do **not** commit:

- API keys
- Passwords
- Access tokens
- Private certificates
- Personal authentication data
- Production secrets
- Private customer or employer information

Client-side JavaScript is visible to anyone visiting the website, so anything placed there should be treated as public.

---

## Current Direction

The project is evolving from a traditional portfolio into a broader **personal technology and cybersecurity learning platform**.

Current areas of development include:

- Improving the OSINT experience
- Expanding the security toolkit
- Improving resource and ebook discovery
- Building more practical cybersecurity projects
- Documenting the transition into technology
- Improving accessibility and performance
- Keeping the site reliable on GitHub Pages

---

## Author

**Hephzibah Behulah**

Electrical background → Technology → Cybersecurity

Currently building skills across:

**Cybersecurity · Web Development · Data Analytics · Networking · OSINT**

---

## Responsible Use

This project is created for learning, experimentation, and legitimate security research.

Only use security tools, reconnaissance techniques, scanning methods, and testing workflows against systems where you have explicit authorization.

---

## License

Unless a specific file or resource states otherwise, the website's original code and content are provided for personal learning and portfolio purposes.

Third-party libraries, datasets, icons, and external resources remain subject to their respective licenses and terms.
