/**
 * BeyainCorp — Corporate Website & Interactive Portfolio Engine
 */

const HERO_TABS = {
  infra: {
    badge: 'INFRASTRUCTURE & STORAGE',
    title: 'Multi-Site Virtualization, SAN/NAS & Live DR',
    desc: 'VMware ESXi 7.x/8.x HA clusters, Hyper-V, Windows/Linux servers, Dell EMC PowerStore & NetApp ONTAP multipathing, and Commvault BCP.',
    tags: ['VMware ESXi HA', 'Dell PowerStore', 'NetApp ONTAP', 'Commvault DR']
  },
  cloud: {
    badge: 'CLOUD, O365 & ZERO-TRUST',
    title: 'Hybrid Cloud & SentinelOne EDR/XDR Defense',
    desc: 'AWS, Azure & OCI administration alongside Microsoft 365, Entra ID Conditional Access/MFA (1,000+ accounts), CIS GPO hardening, and Sophos VPN.',
    tags: ['AWS / Azure / OCI', 'Microsoft 365', 'Entra ID MFA', 'SentinelOne XDR']
  },
  apps: {
    badge: 'WEB APPS & SOVEREIGN DEPLOYMENT',
    title: 'Full-Stack Engineering & Local Open-Source Apps',
    desc: 'Custom web applications (Next.js, Java Spring Boot, Python), automated QA & Jenkins CI/CD, in-house hosting, and private local AI workflows.',
    tags: ['Next.js & Spring Boot', 'In-House Hosting', 'Docker & CI/CD', 'Open-Source Local']
  }
};

let SERVICES = [
  {
    code: '01',
    cat: 'INFRA',
    label: 'Infra & Storage',
    title: 'Infrastructure, Server, Storage, NAS & SAN',
    desc: 'High-availability compute and multi-tier storage engineered for 99.9% uptime and GxP DR readiness.',
    bullets: [
      'VMware vSphere / ESXi 7.x–8.x, vCenter HA, DRS & Hyper-V',
      'Windows Server (2012–2025) & RHEL / CentOS / Ubuntu fleets',
      'Dell EMC PowerStore, NetApp ONTAP, iSCSI, NFS & FC Multipathing',
      'Commvault Complete Backup & live DR drills (<1h RPO / <4h RTO)'
    ],
    tags: ['VMware ESXi', 'Dell PowerStore', 'NetApp ONTAP', 'SAN / NAS']
  },
  {
    code: '02',
    cat: 'CLOUD',
    label: 'Cloud & O365',
    title: 'Cloud & Microsoft 365 Administration',
    desc: 'Zero-Trust hybrid identity and multi-cloud administration across AWS, Azure, OCI, and M365.',
    bullets: [
      'AWS (EC2/VPC), Microsoft Azure (VMs/VNets) & Oracle Cloud (OCI)',
      'Microsoft 365, Exchange Online, Teams governance & license audits',
      'Entra ID (Azure AD), AD Connect Password Hash Sync, SSO & RBAC',
      'Conditional Access, geofencing & enterprise-wide MFA enforcement'
    ],
    tags: ['AWS', 'Azure', 'OCI', 'M365 / Entra ID']
  },
  {
    code: '03',
    cat: 'SECURITY',
    label: 'Security & EDR',
    title: 'EDR/XDR Support & SentinelOne Administration',
    desc: 'Autonomous endpoint threat defense, directory hardening, and audit-ready security operations.',
    bullets: [
      'SentinelOne EDR/XDR deployment, triage & threat containment',
      'Active Directory FSMO roles, OU delegation & CIS GPO hardening',
      'Sophos Firewall, Enterprise VPN & VCN perimeter segmentation',
      'GxP & regulatory security audit coordination'
    ],
    tags: ['SentinelOne', 'EDR / XDR', 'CIS GPO', 'Sophos VPN']
  },
  {
    code: '04',
    cat: 'ADVISORY',
    label: 'AMC & Licensing',
    title: 'Licensing, Configuration, Troubleshooting & AMC',
    desc: 'Structured Annual Maintenance Contracts, licensing advisory, and 98%+ SLA incident resolution.',
    bullets: [
      'Enterprise software, OS & cloud licensing optimization',
      'Hardware/network setup, SCCM rollout & SAP MM integrations',
      'P1/P2 major incident escalation, Root Cause Analysis & runbooks',
      'Managed AMC retainers with proactive telemetry & dedicated L2/L3 engineers'
    ],
    tags: ['AMC Retainers', 'Licensing', 'P1/P2 RCA', 'ITIL v4']
  },
  {
    code: '05',
    cat: 'APPS',
    label: 'Web & DevOps',
    title: 'Web App Development, Testing & Deployment',
    desc: 'Full-stack web apps, custom admin GUIs, automated QA testing, and CI/CD release pipelines.',
    bullets: [
      'Modern web platforms (React, Next.js, Java Spring Boot, MySQL)',
      'Custom systems tooling & GUIs (PowerShell, .NET, Python)',
      'Jenkins & GitHub CI/CD pipelines, QA & regression testing',
      'Automated SSL/TLS certificates & production monitoring'
    ],
    tags: ['Next.js', 'Spring Boot', 'Jenkins CI/CD', 'QA Testing']
  },
  {
    code: '06',
    cat: 'APPS',
    label: 'In-House & Local',
    title: 'In-House, Cloud & Open-Source Local Apps',
    desc: 'Sovereign on-premise hosting, Docker containers, and self-hosted open-source / local AI stacks.',
    bullets: [
      'In-house on-prem server deployments & private network hosting',
      'Dockerized workflow automation & resilient cloud deployments',
      'Self-hosted open-source enterprise tools & local LLM/RAG apps',
      'Hybrid cloud bridges with automated backups & rollback safety'
    ],
    tags: ['In-House Deploy', 'Cloud Deploy', 'Open-Source', 'Local AI']
  },
  {
    code: '07',
    cat: 'ADVISORY',
    label: 'Advisory & AI',
    title: 'IT Advisory, Innovations & Workflow Automation',
    desc: 'Strategic technology roadmaps and smart automation that cut manual toil by 30%+.',
    bullets: [
      'Smart workflow automation with Jenkins, PowerShell, n8n & AI tooling',
      'Multi-cloud capacity rightsizing & Tableau TCO dashboards',
      'Zero-touch AD onboarding & SQL/QGIS automated validation',
      'Fractional CIO & Architecture Director guidance'
    ],
    tags: ['IT Advisory', 'IT Innovations', 'Tableau TCO', 'Automation']
  }
];

let PORTFOLIO_PROJECTS = [
  {
    id: 'orchid-rdm',
    cat: 'AUTOMATION',
    categoryLabel: 'Automation & Tooling',
    impact: '20%+ RAM Recovered',
    title: 'OrchidRDM — Remote Session GUI & Optimizer',
    summary: 'Custom PowerShell & .NET terminal server control utility eliminating ghost sessions and reclaiming 20%+ host RAM.',
    challenge: 'Multi-site terminal servers accumulated stale and ghost user sessions that degraded responsiveness and forced manual reboots.',
    solution: 'Engineered a custom .NET + PowerShell administrative GUI giving L1/L2 engineers selective disconnect controls and automated idle session cleanup.',
    outcome: 'Recovered 20%+ host RAM across multi-site terminal clusters and eliminated unplanned session slowdowns.',
    stack: ['PowerShell', '.NET', 'Windows RDS', 'Systems Tooling'],
    previewLines: ['RDS-NODE-01: 42 active | 9 idle cleared', 'RAM Reclaimed: +21.4% headroom', 'Status: Selective Policy Active']
  },
  {
    id: 'ad-provisioning',
    cat: 'AUTOMATION',
    categoryLabel: 'Identity & CI/CD',
    impact: '30% Admin Toil Cut',
    title: 'Automated AD Provisioning & OU Delegation',
    summary: 'Zero-touch Jenkins CI/CD + PowerShell pipeline automating domain joins, CIS GPO inheritance, and Teams audits.',
    challenge: 'Manual workstation and user onboarding led to inconsistent OU placement, missed CIS GPO baselines, and Teams license sprawl.',
    solution: 'Built a zero-touch Jenkins CI/CD + PowerShell provisioning engine enforcing targeted OU delegation, CIS GPO inheritance, and scheduled M365 audits.',
    outcome: 'Eliminated 30% of repetitive directory admin overhead while maintaining zero security breaches across 1,000+ accounts.',
    stack: ['Jenkins CI/CD', 'PowerShell', 'Active Directory', 'Entra ID'],
    previewLines: ['Pipeline #418: AD Join + OU Placed', 'CIS GPO Baseline: 100% Inherited', 'M365 License Audit: Synced']
  },
  {
    id: 'vmware-san-dr',
    cat: 'INFRA',
    categoryLabel: 'Infrastructure & DR',
    impact: '99.9% Uptime | <1h RPO',
    title: 'Enterprise VMware ESXi & SAN/NAS HA Cluster',
    summary: 'Multi-site VMware ESXi 7.x/8.x clusters with Dell PowerStore / NetApp SAN multipathing and Commvault GxP DR.',
    challenge: 'Business-critical pharmaceutical workloads required zero-downtime upgrades, resilient SAN multipathing, and strict GxP DR compliance.',
    solution: 'Engineered vCenter HA/DRS balancing, FC/iSCSI multipathing across Dell EMC & NetApp arrays, and quarterly Commvault live DR drills.',
    outcome: 'Sustained 99.9% application uptime with RPO < 1 hr, RTO < 4 hrs, and zero critical GxP audit findings.',
    stack: ['VMware ESXi 8.x', 'Dell PowerStore', 'NetApp ONTAP', 'Commvault'],
    previewLines: ['vCenter HA: 50+ Critical VMs Healthy', 'SAN Multipath: FC/iSCSI Active/Active', 'GxP DR Drill: RPO <1h | RTO <4h']
  },
  {
    id: 'oci-containers',
    cat: 'INFRA',
    categoryLabel: 'Hybrid Cloud & Containers',
    impact: 'Hardened VCN + Auto TLS',
    title: 'OCI Cloud Architecture & Workflow Containers',
    summary: 'Oracle Cloud Infrastructure Linux compute inside hardened VCNs running Dockerized workflows with auto SSL/TLS.',
    challenge: 'Workflow automation services needed isolated, reproducible cloud hosting with automated HTTPS certificate management.',
    solution: 'Architected hardened OCI Virtual Cloud Networks with strict security rules, Dockerized application services, and automated SSL/TLS renewals.',
    outcome: 'Delivered reliable, zero-touch containerized public endpoints with automated security lifecycle.',
    stack: ['Oracle Cloud OCI', 'Docker', 'Linux', 'SSL/TLS'],
    previewLines: ['OCI VCN: Ingress/Egress Hardened', 'Containers: 6 Services Running', 'TLS Certs: Auto-Renew Verified']
  },
  {
    id: 'tco-telemetry',
    cat: 'DATA',
    categoryLabel: 'Cloud FinOps & Analytics',
    impact: '15%+ Cloud Waste Cut',
    title: 'Multi-Cloud Telemetry & Capacity Rightsizing',
    summary: 'Automated AWS and Azure CPU, memory, and IOPS telemetry into Tableau dashboards to cut idle cloud spend.',
    challenge: 'Multi-tenant AWS and Azure workloads lacked unified capacity visibility, leading to over-provisioned cloud instances.',
    solution: 'Synthesized compute, memory, and storage IOPS telemetry across AWS & Azure into executive Tableau capacity trend models.',
    outcome: 'Eliminated idle compute allocations and cut client cloud infrastructure waste by 15%+.',
    stack: ['AWS EC2/VPC', 'Azure VMs', 'Tableau', 'Capacity FinOps'],
    previewLines: ['AWS + Azure Telemetry: Ingested', 'Idle Compute Flagged: -15.8% Spend', 'IOPS Saturation: Balanced']
  },
  {
    id: 'green-gros-dhuruv',
    cat: 'WEB',
    categoryLabel: 'Full-Stack Web Apps',
    impact: 'Production Web Platforms',
    title: 'Green Gros & Dhuruv Detailing Studio',
    summary: 'Full-stack commercial web platforms and RESTful CRUD microservices built with Next.js, Java Spring Boot, and MySQL.',
    challenge: 'Service and retail businesses needed fast, modern web storefronts backed by structured product, shop, and order management APIs.',
    solution: 'Developed responsive Next.js frontends paired with Spring Boot / Node.js RESTful APIs and relational MySQL storage.',
    outcome: 'Delivered smooth customer discovery, shop inventory control, and mobile-responsive booking/ordering experiences.',
    stack: ['Next.js', 'Java Spring Boot', 'Node.js', 'MySQL'],
    previewLines: ['GET /api/products -> 200 OK (18ms)', 'Storefront UI: Responsive Next.js', 'DB Cluster: MySQL CRUD Active']
  },
  {
    id: 'qgis-data-integrity',
    cat: 'DATA',
    categoryLabel: 'Geospatial & Data Ops',
    impact: 'Automated QA Pipeline',
    title: 'SQL & QGIS Map Data Integrity Automation',
    summary: 'Automated SQL and QGIS validation scripts maintaining complex geospatial map data networks with minimal manual QA.',
    challenge: 'Large-scale map data networks required complex business-logic validation that slowed down manual QA cycles.',
    solution: 'Engineered automated SQL and QGIS validation scripts to detect topology anomalies and enforce database integrity continuously.',
    outcome: 'Streamlined data integrity checks across map networks and significantly cut manual QA overhead.',
    stack: ['SQL', 'QGIS', 'Data Engineering', 'Automation'],
    previewLines: ['QGIS Topology Check: 0 Errors', 'SQL Integrity Rules: 148 Passed', 'Manual QA Overhead: Reduced']
  },
  {
    id: 'api-sync-suite',
    cat: 'WEB',
    categoryLabel: 'APIs & Microservices',
    impact: 'OAuth 2.0 + REST APIs',
    title: 'Studento REST API & Spotify2YouTube Sync',
    summary: 'Spring Boot student microservice backend and Java JDA / OAuth 2.0 cross-platform media synchronization bot.',
    challenge: 'Needed clean, scalable Java backend services handling OAuth 2.0 token flows, Discord automation, and campus CRUD APIs.',
    solution: 'Built Spring Boot + MySQL RESTful microservices for Studento and an automated Java/JDA OAuth 2.0 Spotify-to-YouTube bot.',
    outcome: 'Delivered reliable, policy-compliant API automation and modular Java backend architecture.',
    stack: ['Java', 'Spring Boot', 'OAuth 2.0', 'MySQL'],
    previewLines: ['OAuth 2.0 Token: Auto-Refreshed', 'Spring Boot API: CRUD Live', 'JDA Automation: Connected']
  }
];

const TECH_STACKS = {
  infra: [
    { name: 'VMware vSphere / ESXi', role: '7.x / 8.x HA & DRS Clusters' },
    { name: 'Dell EMC PowerStore', role: 'Enterprise SAN Storage' },
    { name: 'NetApp ONTAP', role: 'Unified NAS / SAN Arrays' },
    { name: 'Commvault Backup', role: 'GxP BCP & Live DR Drills' },
    { name: 'Windows Server', role: '2012 – 2025 Enterprise' },
    { name: 'RHEL / CentOS / Ubuntu', role: 'Production Linux Fleets' },
    { name: 'Microsoft Hyper-V', role: 'On-Prem Virtualization' },
    { name: 'vCenter Server', role: 'vMotion & Rolling Upgrades' }
  ],
  cloud: [
    { name: 'Microsoft Entra ID', role: 'Zero-Trust IAM & SSO' },
    { name: 'Microsoft 365', role: 'Exchange Online & Teams' },
    { name: 'Amazon Web Services', role: 'EC2, VPC & Cloud Ops' },
    { name: 'Microsoft Azure', role: 'VMs, VNets & AD Connect' },
    { name: 'Oracle Cloud (OCI)', role: 'Hardened VCN & Compute' },
    { name: 'Conditional Access', role: 'Geofencing & MFA Rules' },
    { name: 'RBAC Governance', role: 'Least-Privilege Controls' },
    { name: 'SSL / TLS Automation', role: 'Automated Cert Lifecycle' }
  ],
  security: [
    { name: 'SentinelOne EDR / XDR', role: 'Autonomous Endpoint Defense' },
    { name: 'CIS GPO Hardening', role: 'Active Directory Baselines' },
    { name: 'Sophos Firewall', role: 'Perimeter & Enterprise VPN' },
    { name: 'Zero-Trust Architecture', role: 'Identity-First Security' },
    { name: 'Active Directory FSMO', role: 'OU Delegation & Auditing' },
    { name: 'GxP Audit Readiness', role: 'Pharmaceutical Compliance' },
    { name: 'SCCM Patching', role: 'Automated OS & Driver Rollout' },
    { name: 'Cisco Cyber Defense', role: 'Threat Analysis & Hardening' }
  ],
  apps: [
    { name: 'React & Next.js', role: 'Modern Web Applications' },
    { name: 'Java & Spring Boot', role: 'RESTful Microservices' },
    { name: 'Python & Node.js', role: 'APIs, Scripts & Automation' },
    { name: 'MySQL & MongoDB', role: 'Relational & NoSQL Storage' },
    { name: 'PowerShell & .NET', role: 'Admin GUIs & Systems Tools' },
    { name: 'Docker & Maven', role: 'Containers & Builds' },
    { name: 'Jenkins & GitHub CI/CD', role: 'Zero-Touch Pipelines' },
    { name: 'Open-Source Local Apps', role: 'Self-Hosted Sovereign Stacks' }
  ],
  ai: [
    { name: 'Workflow Automation', role: 'n8n, PowerShell & CI/CD' },
    { name: 'Oracle AI Agent Studio', role: 'Certified Agent Workflows' },
    { name: 'Claude Code & Local LLM', role: 'Assisted Engineering & RAG' },
    { name: 'SQL & QGIS Data', role: 'Map Data Integrity' },
    { name: 'ServiceNow & ITIL v4', role: 'P1/P2 RCA & 98%+ SLA' },
    { name: 'Tableau Telemetry', role: 'Capacity & TCO Forecasting' },
    { name: 'Lansweeper', role: 'Enterprise Asset Discovery' },
    { name: 'Jira & Confluence', role: 'Agile Sprints & Runbooks' }
  ]
};

const POLICIES = {
  sla: {
    kicker: 'GOVERNANCE // SLA & ESCALATION',
    title: 'BeyainCorp Managed SLA Commitments',
    html: `
      <p><strong>Priority Response &amp; Escalation:</strong></p>
      <ul class="bullet-list">
        <li><strong>P1 (Critical Outage):</strong> Automated monitoring alerts immediately; dedicated L2/L3 engineer triage within <strong>&lt; 15 minutes</strong>.</li>
        <li><strong>P2 (High Impact):</strong> Diagnostics + engineer engagement within <strong>&lt; 30 minutes</strong>.</li>
        <li><strong>Uptime &amp; DR:</strong> <strong>99.9%</strong> virtualization uptime target and Commvault DR with <strong>RPO &lt; 1h / RTO &lt; 4h</strong>.</li>
      </ul>
    `
  },
  security: {
    kicker: 'COMPLIANCE // SECURITY & PRIVACY',
    title: 'Security, Data Sovereignty & Privacy',
    html: `
      <p><strong>1. Zero-Trust Identity &amp; Endpoint Defense:</strong> Every managed tenant enforces MFA, Conditional Access, CIS GPO hardening, and SentinelOne EDR/XDR.</p>
      <p><strong>2. Sovereign In-House &amp; Local AI Custody:</strong> For on-premise and open-source local deployments, all application data and AI models stay strictly inside your network.</p>
      <p><strong>3. Inquiry Confidentiality:</strong> Project briefs submitted here are sent directly to BeyainCorp Directors for scoping your engagement.</p>
    `
  }
};

/* =========================================================================
   DOM REFERENCES & RENDERING
   ========================================================================= */

const siteHeader = document.getElementById('site-header');
const heroPreviewBox = document.getElementById('hero-preview-box');
const servicesGrid = document.getElementById('services-grid');
const portfolioGrid = document.getElementById('portfolio-grid');
const techGrid = document.getElementById('tech-grid');
const themeToggleBtn = document.getElementById('theme-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileDrawer = document.getElementById('mobile-drawer');

const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close');
const modalKicker = document.getElementById('modal-kicker');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

let activeHeroTab = 'infra';
let activeServiceFilter = 'ALL';
let activePortfolioFilter = 'ALL';
let activeTechTab = 'infra';

function renderHeroPreview() {
  const data = HERO_TABS[activeHeroTab] || HERO_TABS.infra;
  heroPreviewBox.innerHTML = `
    <div class="font-mono" style="font-size:11px;color:#38bdf8;margin-bottom:8px;">${data.badge}</div>
    <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:700;margin:0 0 8px;color:#ffffff;">${data.title}</h3>
    <p style="font-size:13.5px;color:#cbd5e1;margin:0 0 14px;line-height:1.6;">${data.desc}</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${data.tags.map(t => `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;padding:4px 10px;border-radius:999px;background:rgba(56,189,248,0.12);color:#7dd3fc;border:1px solid rgba(56,189,248,0.28);">${t}</span>`).join('')}
    </div>
  `;
}

function renderServices() {
  const list = activeServiceFilter === 'ALL'
    ? SERVICES
    : SERVICES.filter(s => s.cat === activeServiceFilter);

  servicesGrid.innerHTML = list.map(srv => `
    <article class="card hoverable service-card" data-service="${srv.title}" style="cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div class="icon-box" style="margin-bottom:0;">${srv.code}</div>
          <span class="font-mono" style="font-size:11px;color:var(--primary);font-weight:600;">${srv.label.toUpperCase()}</span>
        </div>
        <h3 class="card-title">${srv.title}</h3>
        <p class="card-desc">${srv.desc}</p>
        <ul class="bullet-list">
          ${srv.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
      <div>
        <div class="tag-row" style="margin-bottom:12px;">
          ${srv.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <span class="font-mono" style="font-size:11.5px;color:var(--primary);font-weight:600;">Request Service →</span>
      </div>
    </article>
  `).join('');

  servicesGrid.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => routeToContact(card.dataset.service));
  });
}

function renderPortfolio() {
  const list = activePortfolioFilter === 'ALL'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter(p => p.cat === activePortfolioFilter);

  portfolioGrid.innerHTML = list.map(proj => `
    <article class="portfolio-card" data-project-id="${proj.id}">
      <div class="portfolio-visual">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;gap:5px;">
            <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;"></span>
            <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block;"></span>
            <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;"></span>
          </div>
          <span class="impact-badge">${proj.impact}</span>
        </div>

        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#cbd5e1;line-height:1.6;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:10px 12px;">
          ${proj.previewLines.map(line => `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"><span style="color:#38bdf8;">&gt;</span> ${line}</div>`).join('')}
        </div>
      </div>

      <div class="portfolio-body">
        <div>
          <div class="font-mono" style="font-size:10.5px;color:var(--primary);font-weight:600;margin-bottom:6px;">${proj.categoryLabel.toUpperCase()}</div>
          <h3 class="card-title">${proj.title}</h3>
          <p class="card-desc" style="margin-bottom:0;">${proj.summary}</p>
        </div>

        <div>
          <div class="tag-row" style="margin-bottom:12px;">
            ${proj.stack.map(s => `<span class="tag">${s}</span>`).join('')}
          </div>
          <span class="font-mono" style="font-size:11.5px;color:var(--primary);font-weight:600;">View Case Study →</span>
        </div>
      </div>
    </article>
  `).join('');

  portfolioGrid.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('click', () => {
      const proj = PORTFOLIO_PROJECTS.find(p => p.id === card.dataset.projectId);
      if (proj) openProjectModal(proj);
    });
  });
}

function renderTechnologies() {
  const items = TECH_STACKS[activeTechTab] || TECH_STACKS.infra;
  techGrid.innerHTML = items.map(item => `
    <div class="card" style="padding:16px 18px;">
      <strong style="display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;">${item.name}</strong>
      <span style="font-size:12.5px;color:var(--text-muted);">${item.role}</span>
    </div>
  `).join('');
}

function routeToContact(scope, tier = '') {
  const serviceInput = document.getElementById('contact-service');
  const modeSelect = document.getElementById('contact-mode');
  if (serviceInput && scope) serviceInput.value = scope;
  if (modeSelect && tier) {
    const opt = Array.from(modeSelect.options).find(o => o.value === tier);
    if (opt) modeSelect.value = tier;
  }
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => serviceInput?.focus(), 420);
}

/* =========================================================================
   MODALS
   ========================================================================= */

function openModal(kicker, title, html) {
  modalKicker.textContent = kicker;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modalOverlay.classList.add('open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
}

function openProjectModal(proj) {
  const html = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div class="career-box">
        <strong style="display:block;margin-bottom:4px;">Challenge</strong>
        <span>${proj.challenge}</span>
      </div>
      <div class="career-box">
        <strong style="display:block;margin-bottom:4px;">Engineering Solution</strong>
        <span>${proj.solution}</span>
      </div>
      <div class="career-box">
        <strong style="display:block;margin-bottom:4px;">Verified Outcome</strong>
        <span style="color:var(--primary);font-weight:600;">${proj.outcome}</span>
      </div>
      <div class="tag-row">
        ${proj.stack.map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
      <div style="margin-top:6px;">
        <button type="button" class="btn btn-primary btn-sm" id="modal-scope-btn">Request Similar Solution →</button>
      </div>
    </div>
  `;
  openModal(`PORTFOLIO // ${proj.categoryLabel.toUpperCase()}`, proj.title, html);
  document.getElementById('modal-scope-btn')?.addEventListener('click', () => {
    closeModal();
    routeToContact(proj.title);
  });
}

modalCloseBtn?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay?.classList.contains('open')) closeModal();
});

document.querySelectorAll('[data-policy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = POLICIES[btn.dataset.policy];
    if (p) openModal(p.kicker, p.title, p.html);
  });
});

/* =========================================================================
   CONTROLS & INTERACTIONS
   ========================================================================= */

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) siteHeader.classList.add('scrolled');
  else siteHeader.classList.remove('scrolled');
});

document.querySelectorAll('[data-hero-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    activeHeroTab = tab.dataset.heroTab;
    document.querySelectorAll('[data-hero-tab]').forEach(t => {
      t.classList.toggle('active', t.dataset.heroTab === activeHeroTab);
    });
    renderHeroPreview();
  });
});

document.querySelectorAll('[data-srv-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    activeServiceFilter = btn.dataset.srvFilter;
    document.querySelectorAll('[data-srv-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.srvFilter === activeServiceFilter);
    });
    renderServices();
  });
});

document.querySelectorAll('[data-port-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    activePortfolioFilter = btn.dataset.portFilter;
    document.querySelectorAll('[data-port-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.portFilter === activePortfolioFilter);
    });
    renderPortfolio();
  });
});

document.querySelectorAll('[data-tech-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTechTab = btn.dataset.techTab;
    document.querySelectorAll('[data-tech-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.techTab === activeTechTab);
    });
    renderTechnologies();
  });
});

document.querySelectorAll('.select-tier-btn').forEach(btn => {
  btn.addEventListener('click', () => routeToContact(btn.dataset.tier, btn.dataset.tier));
});

// Leadership photo switcher
const photoExecBtn = document.getElementById('photo-exec-btn');
const photoPortBtn = document.getElementById('photo-port-btn');
const cioPortrait = document.getElementById('cio-portrait');

if (photoExecBtn && photoPortBtn && cioPortrait) {
  photoExecBtn.addEventListener('click', () => {
    cioPortrait.src = 'assets/img/jebin-executive.jpg';
    photoExecBtn.classList.add('active');
    photoPortBtn.classList.remove('active');
  });

  photoPortBtn.addEventListener('click', () => {
    cioPortrait.src = 'assets/img/jebin-portrait.jpg';
    photoPortBtn.classList.add('active');
    photoExecBtn.classList.remove('active');
  });
}

// Theme toggle (Light Corporate Default <-> Dark Mode)
themeToggleBtn?.addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (isDark) {
    root.removeAttribute('data-theme');
    themeToggleBtn.textContent = '☾';
  } else {
    root.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀';
  }
});

// Mobile Drawer
mobileMenuBtn?.addEventListener('click', () => mobileDrawer.classList.toggle('open'));
mobileDrawer?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileDrawer.classList.remove('open'));
});

// Copy email & Inquiry form
document.getElementById('copy-email-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('copy-email-btn');
  try {
    await navigator.clipboard.writeText('jjebin05@gmail.com');
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy Email'), 1500);
  } catch {
    btn.textContent = 'jjebin05@gmail.com';
  }
});

document.getElementById('contact-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('sender-name').value.trim();
  const email = document.getElementById('sender-email').value.trim();
  const service = document.getElementById('contact-service').value.trim();
  const mode = document.getElementById('contact-mode').value;
  const brief = document.getElementById('contact-brief').value.trim();
  const statusEl = document.getElementById('form-status');

  statusEl.textContent = 'Submitting inquiry to BeyainCorp desk...';
  try {
    const res = await fetch('/api/public/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, scope: service, tier: mode, brief })
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    statusEl.textContent = `✓ Received (${data.inquiry?.id || 'Logged'}) — visible in Director CMS Portal.`;
    e.target.reset();
  } catch {
    statusEl.textContent = 'Opening email client with your brief...';
    const subject = encodeURIComponent(`[BeyainCorp Inquiry] ${service || mode} — ${name}`);
    const body = encodeURIComponent(
      `Name / Org: ${name}\nWork Email: ${email}\nService Scope: ${service}\nEngagement Tier: ${mode}\n\nBrief:\n${brief}`
    );
    window.location.href = `mailto:jjebin05@gmail.com?subject=${subject}&body=${body}`;
  }
});

async function loadLiveCmsContent() {
  try {
    const res = await fetch('/api/public/content');
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.services) && data.services.length) {
      SERVICES = data.services;
      renderServices();
    }
    if (Array.isArray(data.portfolio) && data.portfolio.length) {
      PORTFOLIO_PROJECTS = data.portfolio;
      renderPortfolio();
    }
  } catch {
    // Graceful fallback to built-in catalog when served statically
  }
}

// Initial render
renderHeroPreview();
renderServices();
renderPortfolio();
renderTechnologies();
loadLiveCmsContent();
