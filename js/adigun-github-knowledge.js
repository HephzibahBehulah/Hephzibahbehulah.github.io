(() => {
  "use strict";

  const SOURCES = [
    {
      id: "public-api-lists",
      title: "Public API Lists",
      repo: "HephzibahBehulah/public-api-lists",
      branch: "master",
      description: "Hand-curated public API directory. The repository documents 730+ free APIs across 48 categories and exposes a JSON catalogue.",
      files: [
        ["README.md", "Full catalogue and project documentation"]
      ],
      links: [
        ["Repository", "https://github.com/HephzibahBehulah/public-api-lists"],
        ["Website", "https://public-api-lists.github.io/public-api-lists/"],
        ["JSON catalogue", "https://public-api-lists.github.io/public-api-lists/api/all.json"]
      ],
      tags: ["APIs", "OSINT", "Data", "Security", "Development"]
    },
    {
      id: "public-apis",
      title: "Public APIs",
      repo: "HephzibahBehulah/public-apis",
      branch: "master",
      description: "Large community-curated API reference covering development, data, finance, security, geocoding, health, machine learning, networking and more.",
      files: [
        ["README.md", "Full catalogue, categories and API metadata"]
      ],
      links: [
        ["Repository", "https://github.com/HephzibahBehulah/public-apis"]
      ],
      tags: ["APIs", "Development", "Data", "Security"]
    },
    {
      id: "linux-pentest",
      title: "Linux Pentesting Tools",
      repo: "HephzibahBehulah/Linux-Pentesting-Tools",
      branch: "main",
      description: "A structured 100-tool Linux security, administration and networking reference with installation and usage guidance.",
      files: [["README.md", "100-tool roadmap and installation guide"]],
      links: [["Repository", "https://github.com/HephzibahBehulah/Linux-Pentesting-Tools"]],
      tags: ["Linux", "Pentesting", "Networking", "DFIR", "Security"]
    },
    {
      id: "hackers-information",
      title: "Hackers Information",
      repo: "HephzibahBehulah/Hackers-infomation",
      branch: "main",
      description: "Foundational cybersecurity notes covering the ethical hacking lifecycle, hacker classifications and threat motivations.",
      files: [
        ["5 Stages of the Ethical Hacking Cycle", "Ethical hacking lifecycle"],
        ["Types of Hackers by Hat Color", "Common hacker classifications"],
        ["four types of hackers/threats", "Threat actor and motivation notes"]
      ],
      links: [["Repository", "https://github.com/HephzibahBehulah/Hackers-infomation"]],
      tags: ["Ethical Hacking", "Threats", "Security"]
    },
    {
      id: "prompt-injection",
      title: "Prompt Injection Learning Journal",
      repo: "HephzibahBehulah/Prompt-Injection-Learning-Journal",
      branch: "main",
      description: "Educational AI security journal covering prompt injection patterns, red-team learning, references and defensive thinking.",
      files: [["README.md", "Full learning journal and references"]],
      links: [["Repository", "https://github.com/HephzibahBehulah/Prompt-Injection-Learning-Journal"]],
      tags: ["AI Security", "Prompt Injection", "Red Team", "Defence"]
    }
  ];

  const API_CATEGORIES = [
    "Animals","Anime","Anti-Malware","Art & Design","Books","Business","Calendar",
    "Cloud Storage & File Sharing","Continuous Integration","Cryptocurrency","Currency Exchange",
    "Data Validation","Development","Dictionaries","Disasters","Documents & Productivity",
    "Education","Environment","Events","Finance","Food & Drink","Fraud Prevention","Games & Comics",
    "Geocoding","Government","Health","Jobs","Machine Learning","Music","News","Open Data",
    "Open Source Projects","Patent","Personality","Photography","Science & Math","Security",
    "Shopping","Social","Sports & Fitness","Test Data","Text Analysis","Tracking","Transportation",
    "URL Shorteners","Vehicle","Video","Weather"
  ];

  const PUBLIC_APIS_CATEGORIES = [
    "Animals","Anime","Anti-Malware","Art & Design","Authentication & Authorization","Blockchain",
    "Books","Business","Calendar","Cloud Storage & File Sharing","Continuous Integration",
    "Cryptocurrency","Currency Exchange","Data Validation","Development","Dictionaries",
    "Documents & Productivity","Email","Entertainment","Environment","Events","Finance",
    "Food & Drink","Games & Comics","Geocoding","Government","Health","Jobs","Machine Learning",
    "Music","News","Open Data","Open Source Projects","Patent","Personality","Phone","Photography",
    "Programming","Science & Math","Security","Shopping","Social","Sports & Fitness","Test Data",
    "Text Analysis","Tracking","Transportation","URL Shorteners","Vehicle","Video","Weather"
  ];

  const SECURITY_APIS = [
    ["AbuseIPDB","IP, domain and URL reputation","API key","https://docs.abuseipdb.com/"],
    ["Google Safe Browsing","Link and domain threat flagging","API key","https://developers.google.com/safe-browsing/"],
    ["VirusTotal","File and URL analysis","API key","https://www.virustotal.com/en/documentation/public-api/"],
    ["National Vulnerability Database","Public vulnerability data","No auth for feeds","https://nvd.nist.gov/vuln/Data-Feeds/JSON-feed-changelog"],
    ["Shodan","Search engine for internet-connected devices","API key","https://developer.shodan.io/"],
    ["Have I Been Pwned","Exposed-password and breach checking","API key","https://haveibeenpwned.com/API/v3"],
    ["SecurityTrails","Domain and IP intelligence","API key","https://securitytrails.com/corp/api"],
    ["CVE.report","CVE records with enrichment","No auth","https://cve.report/api"],
    ["ClassiFinder","Secret and prompt-injection detection in text","API key","https://classifinder.ai"],
    ["Whoisfreaks","WHOIS/DNS and attack-surface intelligence","API key","https://whoisfreaks.com/"]
  ];

  const LINUX_TOOLS = {
    "System & Administration": ["htop","tmux","screen","neofetch","tree","curl","wget","nano","vim","git"],
    "Networking Basics": ["net-tools","iproute2","traceroute","tracepath","ping","mtr","dig","nslookup","whois","arp-scan"],
    "Scanning & Recon": ["nmap","masscan","zmap","amass","subfinder","dnsenum","theHarvester","shodan","whatweb","wafw00f"],
    "Exploitation": ["msfconsole","exploitdb/searchsploit","sqlmap","commix","beef-xss","setoolkit","hydra","medusa","patator","ncrack"],
    "Web Security": ["nikto","wpscan","dirb","gobuster","ffuf","Burp Suite","OWASP ZAP","httprobe","httpie","curl"],
    "Passwords & Hashes": ["john","hashcat","hydra","cewl","crunch","rockyou.txt","rsmangler","rainbowcrack","medusa","ophcrack"],
    "Forensics & Analysis": ["binwalk","foremost","strings","xxd","volatility","autopsy","sleuthkit","radare2","ghidra","gdb"],
    "Wireless & Bluetooth": ["aircrack-ng","reaver","kismet","bettercap","hcxdumptool","hcxtools","bluetoothctl","bluelog","bluez","wifi-honey"],
    "Sniffing & MITM": ["Wireshark","tshark","tcpdump","dsniff","ettercap","mitmproxy","netsniff-ng","driftnet","sslstrip","arpspoof"],
    "Hardening & Monitoring": ["ufw","iptables","fail2ban","rkhunter","chkrootkit","lynis","clamav","tripwire","auditd","logwatch"]
  };

  const HACKING_CYCLE = [
    ["01","Reconnaissance","Gather target information, domains, IPs and network context. Distinguish passive research from active interaction."],
    ["02","Scanning","Identify exposed ports, services and potential vulnerabilities using authorised assessment techniques."],
    ["03","Gaining Access","Validate the impact of a vulnerability in a controlled environment. Exploitation must remain authorised."],
    ["04","Maintaining Access","In red-team simulations, demonstrate persistence impact in a controlled lab. Do not deploy persistence to systems without permission."],
    ["05","Clearing Tracks & Reporting","Do not erase real evidence. Document findings, risk, evidence, remediation and limitations."],
    ["06","Retesting","After remediation, verify that the reported weakness has actually been addressed."]
  ];

  const HACKER_TYPES = [
    ["Black Hat","Malicious activity for theft, disruption or illegal gain.","Criminal threat"],
    ["White Hat","Authorised security testing and vulnerability research.","Defensive / ethical"],
    ["Gray Hat","May discover or expose weaknesses without clear authorisation.","Unauthorised or mixed intent"],
    ["Green Hat","Learner developing security skills and experimenting in labs.","Learning"],
    ["Red Hat","Commonly described as aggressive defenders targeting malicious actors.","Defensive concept; terminology varies"],
    ["Blue Hat","Commonly associated with pre-release testing or invited external security review.","Testing / review"]
  ];

  const PROMPT_INJECTION = [
    ["Filter bypass / jailbreak","Attempts to persuade an AI system to ignore its governing instructions."],
    ["Fake system commands","Text that imitates privileged system or administrator messages."],
    ["Document / form injection","Malicious instructions embedded in documents, HTML, CSV, forms or retrieved content."],
    ["Role-play / social engineering","Uses a fictional role, urgency or authority to pressure a model into unsafe behaviour."],
    ["Nested injection","Places an instruction inside content that the model is asked to analyse or summarise."],
    ["Prompt confusion","Attempts to redefine the model's role, state or safety boundaries through natural language."],
    ["Defensive focus","Treat untrusted text as data, isolate instructions from data, constrain tools, validate outputs and log high-risk actions."]
  ];

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  function sourceUrl(source, file) {
    return "https://raw.githubusercontent.com/" + source.repo + "/" + source.branch + "/" + encodeURIComponent(file).replace(/%2F/g, "/");
  }

  function renderOverview() {
    const root = document.getElementById("githubKnowledgeOverview");
    if (!root) return;

    root.innerHTML = [
      '<div class="ghk-stats">',
      '<div><b>5</b><span>source repositories</span></div>',
      '<div><b>730+</b><span>public APIs in Public API Lists</span></div>',
      '<div><b>48</b><span>API categories indexed</span></div>',
      '<div><b>100</b><span>Linux security tools</span></div>',
      '<div><b>6</b><span>prompt-injection learning classes</span></div>',
      '</div>',
      '<div class="ghk-grid">',
      SOURCES.map(s => '<article class="ghk-source" data-source="' + esc(s.id) + '">' +
        '<div class="ghk-source-head"><span>' + esc(s.title) + '</span><small>' + esc(s.repo) + '</small></div>' +
        '<p>' + esc(s.description) + '</p>' +
        '<div class="ghk-tags">' + s.tags.map(t => '<span>' + esc(t) + '</span>').join("") + '</div>' +
        '<div class="ghk-actions"><button type="button" data-ghk-open="' + esc(s.id) + '">OPEN KNOWLEDGE</button><a href="' + esc(s.links[0][1]) + '" target="_blank" rel="noopener">SOURCE ↗</a></div>' +
        '</article>').join(""),
      '</div>'
    ].join("");
  }

  function renderIndexes() {
    const root = document.getElementById("githubKnowledgeIndexes");
    if (!root) return;

    const apiBlock = (title, categories) =>
      '<article class="ghk-index-block"><h3>' + esc(title) + '</h3><p>' + esc(categories.length + " indexed categories") + '</p><div class="ghk-category-cloud">' +
      categories.map(c => '<span>' + esc(c) + '</span>').join("") + '</div></article>';

    const linux = Object.entries(LINUX_TOOLS).map(([cat, tools]) =>
      '<div class="ghk-tool-group"><h4>' + esc(cat) + '</h4><div class="ghk-tool-list">' +
      tools.map(t => '<span>' + esc(t) + '</span>').join("") + '</div></div>').join("");

    const security = SECURITY_APIS.map(([name,desc,auth,url]) =>
      '<div class="ghk-api-row"><div><b>' + esc(name) + '</b><span>' + esc(desc) + '</span></div><small>' + esc(auth) + '</small><a href="' + esc(url) + '" target="_blank" rel="noopener">DOCS ↗</a></div>').join("");

    const cycle = HACKING_CYCLE.map(x => '<div class="ghk-cycle"><b>' + x[0] + '</b><div><strong>' + esc(x[1]) + '</strong><span>' + esc(x[2]) + '</span></div></div>').join("");
    const hackers = HACKER_TYPES.map(x => '<div class="ghk-hacker"><strong>' + esc(x[0]) + '</strong><span>' + esc(x[1]) + '</span><small>' + esc(x[2]) + '</small></div>').join("");
    const prompts = PROMPT_INJECTION.map(x => '<div class="ghk-prompt"><strong>' + esc(x[0]) + '</strong><span>' + esc(x[1]) + '</span></div>').join("");

    root.innerHTML =
      apiBlock("Public API Lists · 730+ / 48 categories", API_CATEGORIES) +
      apiBlock("Public APIs · community catalogue", PUBLIC_APIS_CATEGORIES) +
      '<article class="ghk-index-block ghk-wide"><h3>Linux Pentesting Tools · 100-tool roadmap</h3><p>Installation model documented in the source: Debian/Ubuntu/Kali/WSL use apt, Fedora/RHEL/CentOS use dnf, Arch uses pacman. Use <code>which</code> to locate installed tools and <code>man</code> for local documentation.</p>' + linux + '</article>' +
      '<article class="ghk-index-block ghk-wide"><h3>Security API reference</h3><div class="ghk-api-list">' + security + '</div></article>' +
      '<article class="ghk-index-block"><h3>Ethical Hacking Lifecycle</h3><div class="ghk-cycle-list">' + cycle + '</div></article>' +
      '<article class="ghk-index-block"><h3>Hacker Classifications</h3><div class="ghk-hacker-list">' + hackers + '</div><small class="ghk-note">Hat-color terminology is a learning convention, not a universal technical taxonomy.</small></article>' +
      '<article class="ghk-index-block ghk-wide"><h3>Prompt Injection Learning Journal</h3><div class="ghk-prompt-list">' + prompts + '</div><div class="ghk-defense"><b>DEFENSIVE OPERATING MODEL</b><span>Separate trusted instructions from untrusted content. Constrain tool permissions. Validate model outputs before high-impact actions. Keep secrets out of prompts and retrieved content. Test in isolated environments.</span></div></article>';
  }

  async function openSource(sourceId) {
    const source = SOURCES.find(s => s.id === sourceId);
    const modal = document.getElementById("githubKnowledgeModal");
    const title = document.getElementById("githubKnowledgeModalTitle");
    const body = document.getElementById("githubKnowledgeModalBody");
    if (!source || !modal || !title || !body) return;

    title.textContent = source.title;
    body.innerHTML = '<div class="ghk-loading">LOADING SOURCE KNOWLEDGE…</div>';
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");

    try {
      const results = [];
      for (const [file, label] of source.files) {
        const response = await fetch(sourceUrl(source, file), { cache: "no-store" });
        if (!response.ok) throw new Error(file + " returned HTTP " + response.status);
        const text = await response.text();
        results.push({file,label,text});
      }

      body.innerHTML = results.map(r => {
        const isMarkdown = /\.md$/i.test(r.file);
        let html;
        if (isMarkdown && window.marked && window.DOMPurify) {
          html = DOMPurify.sanitize(marked.parse(r.text));
        } else {
          html = "<pre>" + esc(r.text) + "</pre>";
        }
        return '<section class="ghk-source-document"><div class="ghk-document-head"><b>' + esc(r.label) + '</b><code>' + esc(r.file) + '</code></div><div class="ghk-document-content">' + html + '</div></section>';
      }).join("");
    } catch (error) {
      body.innerHTML = '<div class="ghk-error">SOURCE LOAD FAILED<br><span>' + esc(error.message) + '</span><p>Use SOURCE ↗ to open the original GitHub repository directly.</p></div>';
    }
  }

  function closeModal() {
    const modal = document.getElementById("githubKnowledgeModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }

  function init() {
    renderOverview();
    renderIndexes();

    document.addEventListener("click", e => {
      const open = e.target.closest("[data-ghk-open]");
      if (open) openSource(open.dataset.ghkOpen);
      if (e.target.closest("#githubKnowledgeClose") || e.target.id === "githubKnowledgeModal") closeModal();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeModal();
    });

    const search = document.getElementById("githubKnowledgeSearch");
    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        document.querySelectorAll(".ghk-source,.ghk-index-block").forEach(card => {
          card.hidden = !!q && !card.textContent.toLowerCase().includes(q);
        });
      });
    }
  }

  window.HB_GITHUB_KNOWLEDGE = { SOURCES, API_CATEGORIES, PUBLIC_APIS_CATEGORIES, LINUX_TOOLS, SECURITY_APIS, HACKING_CYCLE, HACKER_TYPES, PROMPT_INJECTION };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();