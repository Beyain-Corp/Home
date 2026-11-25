import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

/* =========================================================================
   PASSWORD HASHING (scrypt + timingSafeEqual)
   ========================================================================= */

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = crypto.scryptSync(password, salt, 64);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/* =========================================================================
   DEFAULT SEED DATA FOR LOCAL JSON FALLBACK
   ========================================================================= */

const DEFAULT_SERVICES = [
  {
    id: 'srv-01',
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
    tags: ['VMware ESXi', 'Dell PowerStore', 'NetApp ONTAP', 'SAN / NAS'],
    published: true
  },
  {
    id: 'srv-02',
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
    tags: ['AWS', 'Azure', 'OCI', 'M365 / Entra ID'],
    published: true
  },
  {
    id: 'srv-03',
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
    tags: ['SentinelOne', 'EDR / XDR', 'CIS GPO', 'Sophos VPN'],
    published: true
  },
  {
    id: 'srv-04',
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
    tags: ['AMC Retainers', 'Licensing', 'P1/P2 RCA', 'ITIL v4'],
    published: true
  },
  {
    id: 'srv-05',
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
    tags: ['Next.js', 'Spring Boot', 'Jenkins CI/CD', 'QA Testing'],
    published: true
  },
  {
    id: 'srv-06',
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
    tags: ['In-House Deploy', 'Cloud Deploy', 'Open-Source', 'Local AI'],
    published: true
  },
  {
    id: 'srv-07',
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
    tags: ['IT Advisory', 'IT Innovations', 'Tableau TCO', 'Automation'],
    published: true
  }
];

const DEFAULT_PORTFOLIO = [
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
    previewLines: ['RDS-NODE-01: 42 active | 9 idle cleared', 'RAM Reclaimed: +21.4% headroom', 'Status: Selective Policy Active'],
    published: true
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
    previewLines: ['Pipeline #418: AD Join + OU Placed', 'CIS GPO Baseline: 100% Inherited', 'M365 License Audit: Synced'],
    published: true
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
    previewLines: ['vCenter HA: 50+ Critical VMs Healthy', 'SAN Multipath: FC/iSCSI Active/Active', 'GxP DR Drill: RPO <1h | RTO <4h'],
    published: true
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
    previewLines: ['OCI VCN: Ingress/Egress Hardened', 'Containers: 6 Services Running', 'TLS Certs: Auto-Renew Verified'],
    published: true
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
    previewLines: ['AWS + Azure Telemetry: Ingested', 'Idle Compute Flagged: -15.8% Spend', 'IOPS Saturation: Balanced'],
    published: true
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
    previewLines: ['GET /api/products -> 200 OK (18ms)', 'Storefront UI: Responsive Next.js', 'DB Cluster: MySQL CRUD Active'],
    published: true
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
    previewLines: ['QGIS Topology Check: 0 Errors', 'SQL Integrity Rules: 148 Passed', 'Manual QA Overhead: Reduced'],
    published: true
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
    previewLines: ['OAuth 2.0 Token: Auto-Refreshed', 'Spring Boot API: CRUD Live', 'JDA Automation: Connected'],
    published: true
  }
];

/* =========================================================================
   NOTION PROPERTY HELPERS
   ========================================================================= */

function readText(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title || []).map(t => t.plain_text).join('').trim();
  if (prop.type === 'rich_text') return (prop.rich_text || []).map(t => t.plain_text).join('').trim();
  if (prop.type === 'email') return prop.email || '';
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'status') return prop.status?.name || '';
  if (prop.type === 'date') return prop.date?.start || '';
  if (prop.type === 'checkbox') return Boolean(prop.checkbox);
  if (prop.type === 'multi_select') return (prop.multi_select || []).map(m => m.name);
  return '';
}

function makeRichText(value) {
  return [{ type: 'text', text: { content: String(value || '').slice(0, 1900) } }];
}

/* =========================================================================
   CMS ADAPTER (NOTION DB OR LOCAL JSON STORE)
   ========================================================================= */

export class BeyainCmsAdapter {
  constructor(rootDir, env) {
    this.rootDir = rootDir;
    this.env = env;
    this.dataDir = path.join(rootDir, 'data');
    this.storePath = path.join(this.dataDir, 'cms-store.json');
    this._hasPasswordUnHashCol = null;
    this.ensureLocalStore();
  }

  isPasswordVisibilityAllowed() {
    return (
      String(this.env.NODE_ENV || '').toLowerCase() !== 'production' &&
      String(this.env.ALLOW_SUPER_ADMIN_PASSWORD_VISIBILITY || 'true').toLowerCase() !== 'false'
    );
  }

  async hasPasswordUnHashColumn() {
    if (!this.isNotionDbActive('users')) return false;
    if (typeof this._hasPasswordUnHashCol === 'boolean') return this._hasPasswordUnHashCol;
    try {
      const dbId = this.getDbConfig().users;
      const meta = await this.notionRequest(`/databases/${dbId}`, 'GET');
      if (meta.properties && 'PasswordUnHash' in meta.properties) {
        this._hasPasswordUnHashCol = true;
        return true;
      }
      if (this.isPasswordVisibilityAllowed()) {
        await this.notionRequest(`/databases/${dbId}`, 'PATCH', {
          properties: { PasswordUnHash: { rich_text: {} } }
        });
        this._hasPasswordUnHashCol = true;
        return true;
      }
    } catch (err) {
      console.warn(`[Notion Schema:PasswordUnHash] ${err.message}`);
    }
    this._hasPasswordUnHashCol = false;
    return false;
  }

  hasNotionToken() {
    return Boolean(this.env.NOTION_TOKEN && this.env.NOTION_TOKEN.trim().length > 10);
  }

  getDbConfig() {
    return {
      users: this.env.NOTION_USERS_DB_ID || '',
      services: this.env.NOTION_SERVICES_DB_ID || '',
      portfolio: this.env.NOTION_PORTFOLIO_DB_ID || '',
      tickets: this.env.NOTION_TICKETS_DB_ID || '',
      inquiries: this.env.NOTION_INQUIRIES_DB_ID || ''
    };
  }

  isNotionDbActive(dbKey) {
    const dbs = this.getDbConfig();
    return this.hasNotionToken() && Boolean(dbs[dbKey]);
  }

  getStatus() {
    const dbs = this.getDbConfig();
    return {
      notionTokenConfigured: this.hasNotionToken(),
      testingPasswordVisibility: this.isPasswordVisibilityAllowed(),
      databases: {
        users: Boolean(dbs.users),
        services: Boolean(dbs.services),
        portfolio: Boolean(dbs.portfolio),
        tickets: Boolean(dbs.tickets),
        inquiries: Boolean(dbs.inquiries)
      },
      mode: this.hasNotionToken() ? 'notion-hybrid' : 'local-json-store'
    };
  }

  ensureLocalStore() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.storePath)) {
      const adminEmail = (this.env.ADMIN_EMAIL || 'jjebin05@gmail.com').toLowerCase();
      const adminName = this.env.ADMIN_NAME || 'Jebin Joseph J';
      const adminHash = this.env.ADMIN_PASSWORD_HASH || hashPassword('BeyainAdmin#2026');
      const sanjaiHash = hashPassword('BeyainDirector#2026');
      const clientHash = hashPassword('ClientPortal#2026');
      const allowVis = this.isPasswordVisibilityAllowed();

      const seed = {
        users: [
          {
            id: 'usr-admin-1',
            name: adminName,
            email: adminEmail,
            passwordHash: adminHash,
            passwordUnHash: allowVis && verifyPassword('BeyainAdmin#2026', adminHash) ? 'BeyainAdmin#2026' : '',
            role: 'super_admin',
            company: 'BeyainCorp (CIO & Super Admin)',
            active: true
          },
          {
            id: 'usr-admin-2',
            name: 'Sanjai Kumar J',
            email: 'sanjaikuma2003@gmail.com',
            passwordHash: sanjaiHash,
            passwordUnHash: allowVis ? 'BeyainDirector#2026' : '',
            role: 'admin',
            company: 'BeyainCorp (Director)',
            active: true
          },
          {
            id: 'usr-client-1',
            name: 'Enterprise Client Demo',
            email: 'client@beyaincorp.local',
            passwordHash: clientHash,
            passwordUnHash: allowVis ? 'ClientPortal#2026' : '',
            role: 'client',
            company: 'Horizon Pharma Ltd',
            active: true
          }
        ],
        services: DEFAULT_SERVICES,
        portfolio: DEFAULT_PORTFOLIO,
        tickets: [
          {
            id: 'TKT-1042',
            clientEmail: 'client@beyaincorp.local',
            company: 'Horizon Pharma Ltd',
            subject: 'ESXi Host 04 Multipath Verification & Commvault DR Check',
            domain: 'Infra & SAN',
            priority: 'P2',
            status: 'In Progress',
            details: 'Quarterly Fibre Channel multipathing audit and Commvault live DR verification.',
            createdAt: '2026-11-24T10:15:00Z'
          },
          {
            id: 'TKT-1039',
            clientEmail: 'client@beyaincorp.local',
            company: 'Horizon Pharma Ltd',
            subject: 'SentinelOne Policy Hardening for Finance Endpoints',
            domain: 'Security & EDR',
            priority: 'P3',
            status: 'Resolved',
            details: 'Updated SentinelOne XDR containment policy and CIS GPO baseline for 35 endpoints.',
            createdAt: '2026-11-20T14:30:00Z'
          }
        ],
        inquiries: [
          {
            id: 'INQ-201',
            name: 'Operations Lead, Apex Logistics',
            email: 'ops@apexlogistics.example',
            scope: 'Enterprise Managed Operations & O365 Zero-Trust',
            tier: 'Enterprise Managed Operations',
            brief: 'Looking for 24/7 monitoring for 28 VMs, NetApp NAS, and 300 Microsoft 365 accounts.',
            status: 'New',
            submittedAt: '2026-11-25T08:45:00Z'
          }
        ]
      };
      fs.writeFileSync(this.storePath, JSON.stringify(seed, null, 2), 'utf8');
    }
  }

  readLocalStore() {
    this.ensureLocalStore();
    return JSON.parse(fs.readFileSync(this.storePath, 'utf8'));
  }

  writeLocalStore(data) {
    fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async notionRequest(endpoint, method = 'GET', body = null) {
    const res = await fetch(`${NOTION_API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.env.NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion API ${res.status}: ${text.slice(0, 300)}`);
    }
    return res.json();
  }

  async queryNotionDb(databaseId, sorts = undefined) {
    const payload = { page_size: 100 };
    if (sorts) payload.sorts = sorts;
    const data = await this.notionRequest(`/databases/${databaseId}/query`, 'POST', payload);
    return data.results || [];
  }

  async tryNotion(label, notionFn, fallbackFn) {
    try {
      return await notionFn();
    } catch (err) {
      console.warn(`[Notion Fallback:${label}] ${err.message}`);
      return fallbackFn();
    }
  }

  async verifyNotionDatabases() {
    const dbs = this.getDbConfig();
    const requiredProps = {
      users: ['Name', 'Email', 'PasswordHash', 'Role', 'Company', 'Active'],
      services: ['Title', 'Code', 'Category', 'Label', 'Description', 'Bullets', 'Tags', 'Published'],
      portfolio: ['Title', 'Category', 'CategoryLabel', 'Impact', 'Summary', 'Challenge', 'Solution', 'Outcome', 'Stack', 'PreviewLines', 'Published'],
      tickets: ['Subject', 'TicketId', 'ClientEmail', 'Company', 'Domain', 'Priority', 'Status', 'Details', 'CreatedAt'],
      inquiries: ['Name', 'Email', 'Scope', 'Tier', 'Brief', 'Status', 'SubmittedAt']
    };

    const results = {};
    for (const [key, id] of Object.entries(dbs)) {
      if (!this.hasNotionToken() || !id) {
        results[key] = { ok: false, error: 'Missing NOTION_TOKEN or DB ID' };
        continue;
      }
      try {
        const meta = await this.notionRequest(`/databases/${id}`, 'GET');
        const existing = Object.keys(meta.properties || {});
        const missing = requiredProps[key].filter(p => !existing.includes(p));
        results[key] = {
          ok: missing.length === 0,
          reachable: true,
          title: (meta.title || []).map(t => t.plain_text).join('') || key,
          missingProps: missing,
          error: missing.length ? `Missing properties: ${missing.join(', ')}` : null
        };
      } catch (err) {
        results[key] = { ok: false, reachable: false, missingProps: [], error: err.message };
      }
    }
    return results;
  }

  async seedDefaultsToNotion() {
    const checks = await this.verifyNotionDatabases();
    const summary = {};
    const store = this.readLocalStore();

    if (checks.services?.ok) {
      const pages = await this.queryNotionDb(this.getDbConfig().services);
      const real = pages.filter(p => readText(p.properties?.Title));
      if (real.length === 0) {
        for (const srv of store.services) await this.createService(srv);
        summary.services = `Seeded ${store.services.length} services`;
      } else {
        summary.services = `Skipped (${real.length} already in Notion)`;
      }
    } else {
      summary.services = checks.services?.error || 'Not ready';
    }

    if (checks.portfolio?.ok) {
      const pages = await this.queryNotionDb(this.getDbConfig().portfolio);
      const real = pages.filter(p => readText(p.properties?.Title));
      if (real.length === 0) {
        for (const proj of store.portfolio) await this.createPortfolio(proj);
        summary.portfolio = `Seeded ${store.portfolio.length} portfolio projects`;
      } else {
        summary.portfolio = `Skipped (${real.length} already in Notion)`;
      }
    } else {
      summary.portfolio = checks.portfolio?.error || 'Not ready';
    }

    if (checks.users?.ok) {
      const pages = await this.queryNotionDb(this.getDbConfig().users);
      const real = pages.filter(p => readText(p.properties?.Email));
      if (real.length === 0) {
        const withUnhash = this.isPasswordVisibilityAllowed() && (await this.hasPasswordUnHashColumn());
        for (const usr of store.users) {
          const props = {
            Name: { title: makeRichText(usr.name) },
            Email: { email: usr.email },
            PasswordHash: { rich_text: makeRichText(usr.passwordHash) },
            Role: { select: { name: usr.role } },
            Company: { rich_text: makeRichText(usr.company || '') },
            Active: { checkbox: true }
          };
          if (withUnhash && usr.passwordUnHash) {
            props.PasswordUnHash = { rich_text: makeRichText(usr.passwordUnHash) };
          }
          await this.notionRequest('/pages', 'POST', {
            parent: { database_id: this.getDbConfig().users },
            properties: props
          });
        }
        summary.users = `Seeded ${store.users.length} users`;
      } else {
        summary.users = `Skipped (${real.length} already in Notion)`;
      }
    } else {
      summary.users = checks.users?.error || 'Not ready';
    }

    if (checks.tickets?.ok) {
      const pages = await this.queryNotionDb(this.getDbConfig().tickets);
      const real = pages.filter(p => readText(p.properties?.Subject));
      if (real.length === 0) {
        for (const t of store.tickets) {
          await this.notionRequest('/pages', 'POST', {
            parent: { database_id: this.getDbConfig().tickets },
            properties: {
              Subject: { title: makeRichText(t.subject) },
              TicketId: { rich_text: makeRichText(t.id) },
              ClientEmail: { email: t.clientEmail },
              Company: { rich_text: makeRichText(t.company) },
              Domain: { select: { name: t.domain } },
              Priority: { select: { name: t.priority } },
              Status: { select: { name: t.status } },
              Details: { rich_text: makeRichText(t.details) },
              CreatedAt: { date: { start: t.createdAt } }
            }
          });
        }
        summary.tickets = `Seeded ${store.tickets.length} sample tickets`;
      } else {
        summary.tickets = `Skipped (${real.length} already in Notion)`;
      }
    }

    if (checks.inquiries?.ok) {
      const pages = await this.queryNotionDb(this.getDbConfig().inquiries);
      const real = pages.filter(p => readText(p.properties?.Name));
      if (real.length === 0) {
        for (const i of store.inquiries) {
          await this.notionRequest('/pages', 'POST', {
            parent: { database_id: this.getDbConfig().inquiries },
            properties: {
              Name: { title: makeRichText(i.name) },
              Email: { email: i.email },
              Scope: { rich_text: makeRichText(i.scope) },
              Tier: { select: { name: i.tier } },
              Brief: { rich_text: makeRichText(i.brief) },
              Status: { select: { name: i.status } },
              SubmittedAt: { date: { start: i.submittedAt } }
            }
          });
        }
        summary.inquiries = `Seeded ${store.inquiries.length} sample inquiries`;
      } else {
        summary.inquiries = `Skipped (${real.length} already in Notion)`;
      }
    }

    return summary;
  }

  /* ---------------- USERS ---------------- */

  async findUserByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return null;
    const superAdminEmail = 'jjebin05@gmail.com';

    if (this.isNotionDbActive('users')) {
      const notionUser = await this.tryNotion(
        'users.find',
        async () => {
          const data = await this.notionRequest(`/databases/${this.getDbConfig().users}/query`, 'POST', {
            filter: { property: 'Email', email: { equals: normalized } },
            page_size: 1
          });
          const page = data.results?.[0];
          if (!page) return null;
          const p = page.properties || {};
          const foundEmail = readText(p.Email).toLowerCase();
          const rawRole = (readText(p.Role) || 'client').toLowerCase();
          const safeRole = foundEmail === superAdminEmail
            ? 'super_admin'
            : (rawRole === 'admin' || rawRole === 'super_admin' ? 'admin' : 'client');
          return {
            id: page.id,
            name: readText(p.Name),
            email: foundEmail,
            passwordHash: readText(p.PasswordHash),
            role: safeRole,
            company: readText(p.Company),
            active: p.Active ? readText(p.Active) : true
          };
        },
        () => null
      );
      if (notionUser) return notionUser;
    }

    const store = this.readLocalStore();
    const localUser = store.users.find(u => u.email.toLowerCase() === normalized) || null;
    if (!localUser) return null;
    const safeRole = localUser.email.toLowerCase() === superAdminEmail
      ? 'super_admin'
      : (localUser.role === 'admin' || localUser.role === 'super_admin' ? 'admin' : 'client');
    return { ...localUser, role: safeRole };
  }

  async listUsers({ includePassword = false } = {}) {
    const superAdminEmail = 'jjebin05@gmail.com';
    const canExpose = Boolean(includePassword && this.isPasswordVisibilityAllowed());
    const normalizeUser = u => {
      const base = {
        id: u.id,
        name: u.name,
        email: u.email,
        company: u.company,
        active: u.active,
        role: u.email === superAdminEmail
          ? 'super_admin'
          : (u.role === 'admin' || u.role === 'super_admin' ? 'admin' : 'client')
      };
      if (canExpose) {
        base.passwordUnHash = u.passwordUnHash || '';
      }
      return base;
    };

    if (this.isNotionDbActive('users')) {
      return this.tryNotion(
        'users.list',
        async () => {
          const pages = await this.queryNotionDb(this.getDbConfig().users);
          return pages
            .map(page => {
              const p = page.properties || {};
              return {
                id: page.id,
                name: readText(p.Name),
                email: readText(p.Email).toLowerCase(),
                role: (readText(p.Role) || 'client').toLowerCase(),
                company: readText(p.Company),
                active: p.Active ? readText(p.Active) : true,
                passwordUnHash: canExpose && p.PasswordUnHash ? readText(p.PasswordUnHash) : ''
              };
            })
            .filter(u => u.email)
            .map(normalizeUser);
        },
        () => this.readLocalStore().users.map(u => normalizeUser(u))
      );
    }
    const store = this.readLocalStore();
    return store.users.map(u => normalizeUser(u));
  }

  async createUser({ name, email, password, role = 'client', company = '' }) {
    const normalized = String(email || '').trim().toLowerCase();
    const existing = await this.findUserByEmail(normalized);
    if (existing) throw new Error('User with this email already exists.');

    const passwordHash = hashPassword(password);
    const safeRole = role === 'admin' ? 'admin' : 'client';
    const storePlain = this.isPasswordVisibilityAllowed();

    if (this.isNotionDbActive('users')) {
      const withUnhash = storePlain && (await this.hasPasswordUnHashColumn());
      const properties = {
        Name: { title: makeRichText(name) },
        Email: { email: normalized },
        PasswordHash: { rich_text: makeRichText(passwordHash) },
        Role: { select: { name: safeRole } },
        Company: { rich_text: makeRichText(company) },
        Active: { checkbox: true }
      };
      if (withUnhash) {
        properties.PasswordUnHash = { rich_text: makeRichText(password) };
      }
      const page = await this.notionRequest('/pages', 'POST', {
        parent: { database_id: this.getDbConfig().users },
        properties
      });
      return { id: page.id, name, email: normalized, role: safeRole, company, active: true };
    }

    const store = this.readLocalStore();
    const record = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name,
      email: normalized,
      passwordHash,
      passwordUnHash: storePlain ? password : '',
      role: safeRole,
      company,
      active: true
    };
    store.users.push(record);
    this.writeLocalStore(store);
    const { passwordHash: _omit, passwordUnHash: _omitPlain, ...safe } = record;
    return safe;
  }

  async resetUserPassword(userId, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters.');
    }
    const passwordHash = hashPassword(newPassword);
    const storePlain = this.isPasswordVisibilityAllowed();

    if (this.isNotionDbActive('users')) {
      const withUnhash = storePlain && (await this.hasPasswordUnHashColumn());
      const properties = {
        PasswordHash: { rich_text: makeRichText(passwordHash) }
      };
      if (withUnhash) {
        properties.PasswordUnHash = { rich_text: makeRichText(newPassword) };
      }
      await this.notionRequest(`/pages/${userId}`, 'PATCH', { properties });
      return { id: userId, updated: true };
    }

    const store = this.readLocalStore();
    const target = store.users.find(u => u.id === userId);
    if (!target) throw new Error('User not found.');
    target.passwordHash = passwordHash;
    target.passwordUnHash = storePlain ? newPassword : '';
    this.writeLocalStore(store);
    return { id: userId, updated: true };
  }

  async updateUser(userId, updates = {}, actor = null) {
    const superAdminEmail = 'jjebin05@gmail.com';
    const users = await this.listUsers();
    const existing = users.find(u => u.id === userId);
    if (!existing) throw new Error('User not found.');

    const isTargetSuperAdmin = existing.email === superAdminEmail;
    if (isTargetSuperAdmin) {
      if (actor && String(actor.email || '').toLowerCase() !== superAdminEmail) {
        throw new Error('Only Super Admin can modify the Super Admin account.');
      }
      if (updates.role && updates.role !== 'super_admin') {
        throw new Error('Super Admin role cannot be modified.');
      }
      if (updates.active === false) {
        throw new Error('Super Admin account cannot be deactivated.');
      }
      if (updates.email && String(updates.email).trim().toLowerCase() !== superAdminEmail) {
        throw new Error('Super Admin email cannot be modified.');
      }
    }

    const nextName = typeof updates.name === 'string' && updates.name.trim() ? updates.name.trim() : existing.name;
    let nextEmail = existing.email;
    if (typeof updates.email === 'string' && updates.email.trim()) {
      const candidate = updates.email.trim().toLowerCase();
      if (!candidate.includes('@')) throw new Error('Valid email address is required.');
      if (candidate !== existing.email) {
        const collision = users.find(u => u.email === candidate && u.id !== userId);
        if (collision) throw new Error('Another user with this email already exists.');
      }
      nextEmail = candidate;
    }

    const nextCompany = typeof updates.company === 'string' ? updates.company.trim() : existing.company;
    const nextRole = isTargetSuperAdmin
      ? 'super_admin'
      : (updates.role ? (updates.role === 'admin' ? 'admin' : 'client') : existing.role);
    const nextActive = isTargetSuperAdmin
      ? true
      : (typeof updates.active === 'boolean' ? updates.active : existing.active);

    let newPasswordHash = null;
    let newPasswordPlain = null;
    if (typeof updates.password === 'string' && updates.password.length > 0) {
      if (updates.password.length < 8) {
        throw new Error('New password must be at least 8 characters.');
      }
      newPasswordHash = hashPassword(updates.password);
      newPasswordPlain = updates.password;
    }

    const storePlain = this.isPasswordVisibilityAllowed();

    if (this.isNotionDbActive('users')) {
      const properties = {
        Name: { title: makeRichText(nextName) },
        Email: { email: nextEmail },
        Company: { rich_text: makeRichText(nextCompany) },
        Role: { select: { name: nextRole } },
        Active: { checkbox: nextActive }
      };
      if (newPasswordHash) {
        properties.PasswordHash = { rich_text: makeRichText(newPasswordHash) };
        if (storePlain && (await this.hasPasswordUnHashColumn())) {
          properties.PasswordUnHash = { rich_text: makeRichText(newPasswordPlain) };
        }
      }
      await this.notionRequest(`/pages/${userId}`, 'PATCH', { properties });
      return { ...existing, name: nextName, email: nextEmail, company: nextCompany, role: nextRole, active: nextActive };
    }

    const store = this.readLocalStore();
    const target = store.users.find(u => u.id === userId);
    if (!target) throw new Error('User not found.');
    target.name = nextName;
    target.email = nextEmail;
    target.company = nextCompany;
    target.role = nextRole;
    target.active = nextActive;
    if (newPasswordHash) {
      target.passwordHash = newPasswordHash;
      target.passwordUnHash = storePlain ? newPasswordPlain : '';
    }
    this.writeLocalStore(store);
    const { passwordHash: _omit, passwordUnHash: _omitPlain, ...safe } = target;
    return safe;
  }

  async deleteRecord(collection, id) {
    const superAdminEmail = 'jjebin05@gmail.com';
    if (collection === 'users') {
      const users = await this.listUsers();
      const target = users.find(u => u.id === id);
      if (target?.email === superAdminEmail) {
        throw new Error('Cannot delete the Super Admin account.');
      }
    }

    if (this.isNotionDbActive(collection)) {
      await this.notionRequest(`/pages/${id}`, 'PATCH', { archived: true });
      return { id, deleted: true };
    }

    const store = this.readLocalStore();
    if (!Array.isArray(store[collection])) throw new Error('Unknown collection');
    store[collection] = store[collection].filter(item => item.id !== id);
    this.writeLocalStore(store);
    return { id, deleted: true };
  }

  /* ---------------- SERVICES CMS ---------------- */

  async listServices({ onlyPublished = false } = {}) {
    let items;
    if (this.isNotionDbActive('services')) {
      items = await this.tryNotion(
        'services.list',
        async () => {
          const pages = await this.queryNotionDb(this.getDbConfig().services);
          const mapped = pages
            .map(page => {
              const p = page.properties || {};
              const bulletsText = readText(p.Bullets);
              return {
                id: page.id,
                code: readText(p.Code) || '00',
                cat: (readText(p.Category) || 'INFRA').toUpperCase(),
                label: readText(p.Label) || 'Capability',
                title: readText(p.Title),
                desc: readText(p.Description),
                bullets: bulletsText ? bulletsText.split('\n').map(s => s.trim()).filter(Boolean) : [],
                tags: Array.isArray(readText(p.Tags)) ? readText(p.Tags) : [],
                published: p.Published ? readText(p.Published) : true
              };
            })
            .filter(s => s.title)
            .sort((a, b) => a.code.localeCompare(b.code));
          return mapped.length ? mapped : this.readLocalStore().services;
        },
        () => this.readLocalStore().services
      );
    } else {
      items = this.readLocalStore().services;
    }
    return onlyPublished ? items.filter(i => i.published !== false) : items;
  }

  async createService(input) {
    const record = {
      id: `srv-${crypto.randomUUID().slice(0, 8)}`,
      code: String(input.code || '08').slice(0, 6),
      cat: String(input.cat || 'INFRA').toUpperCase(),
      label: String(input.label || input.cat || 'Service').trim(),
      title: String(input.title || '').trim(),
      desc: String(input.desc || '').trim(),
      bullets: Array.isArray(input.bullets) ? input.bullets : String(input.bullets || '').split('\n').map(s => s.trim()).filter(Boolean),
      tags: Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(',').map(s => s.trim()).filter(Boolean),
      published: input.published !== false
    };

    if (this.isNotionDbActive('services')) {
      const page = await this.notionRequest('/pages', 'POST', {
        parent: { database_id: this.getDbConfig().services },
        properties: {
          Title: { title: makeRichText(record.title) },
          Code: { rich_text: makeRichText(record.code) },
          Category: { select: { name: record.cat } },
          Label: { rich_text: makeRichText(record.label) },
          Description: { rich_text: makeRichText(record.desc) },
          Bullets: { rich_text: makeRichText(record.bullets.join('\n')) },
          Tags: { multi_select: record.tags.slice(0, 6).map(name => ({ name })) },
          Published: { checkbox: record.published }
        }
      });
      return { ...record, id: page.id };
    }

    const store = this.readLocalStore();
    store.services.push(record);
    this.writeLocalStore(store);
    return record;
  }

  /* ---------------- PORTFOLIO CMS ---------------- */

  async listPortfolio({ onlyPublished = false } = {}) {
    let items;
    if (this.isNotionDbActive('portfolio')) {
      items = await this.tryNotion(
        'portfolio.list',
        async () => {
          const pages = await this.queryNotionDb(this.getDbConfig().portfolio);
          const mapped = pages
            .map(page => {
              const p = page.properties || {};
              const previewText = readText(p.PreviewLines);
              return {
                id: page.id,
                cat: (readText(p.Category) || 'INFRA').toUpperCase(),
                categoryLabel: readText(p.CategoryLabel) || 'Enterprise System',
                impact: readText(p.Impact) || 'Production',
                title: readText(p.Title),
                summary: readText(p.Summary),
                challenge: readText(p.Challenge),
                solution: readText(p.Solution),
                outcome: readText(p.Outcome),
                stack: Array.isArray(readText(p.Stack)) ? readText(p.Stack) : [],
                previewLines: previewText ? previewText.split('\n').map(s => s.trim()).filter(Boolean) : ['System Active'],
                published: p.Published ? readText(p.Published) : true
              };
            })
            .filter(p => p.title);
          return mapped.length ? mapped : this.readLocalStore().portfolio;
        },
        () => this.readLocalStore().portfolio
      );
    } else {
      items = this.readLocalStore().portfolio;
    }
    return onlyPublished ? items.filter(i => i.published !== false) : items;
  }

  async createPortfolio(input) {
    const record = {
      id: `prj-${crypto.randomUUID().slice(0, 8)}`,
      cat: String(input.cat || 'INFRA').toUpperCase(),
      categoryLabel: String(input.categoryLabel || 'Enterprise Delivery').trim(),
      impact: String(input.impact || 'Delivered').trim(),
      title: String(input.title || '').trim(),
      summary: String(input.summary || '').trim(),
      challenge: String(input.challenge || '').trim(),
      solution: String(input.solution || '').trim(),
      outcome: String(input.outcome || '').trim(),
      stack: Array.isArray(input.stack) ? input.stack : String(input.stack || '').split(',').map(s => s.trim()).filter(Boolean),
      previewLines: Array.isArray(input.previewLines) ? input.previewLines : String(input.previewLines || 'Production Active').split('\n').map(s => s.trim()).filter(Boolean),
      published: input.published !== false
    };

    if (this.isNotionDbActive('portfolio')) {
      const page = await this.notionRequest('/pages', 'POST', {
        parent: { database_id: this.getDbConfig().portfolio },
        properties: {
          Title: { title: makeRichText(record.title) },
          Category: { select: { name: record.cat } },
          CategoryLabel: { rich_text: makeRichText(record.categoryLabel) },
          Impact: { rich_text: makeRichText(record.impact) },
          Summary: { rich_text: makeRichText(record.summary) },
          Challenge: { rich_text: makeRichText(record.challenge) },
          Solution: { rich_text: makeRichText(record.solution) },
          Outcome: { rich_text: makeRichText(record.outcome) },
          Stack: { multi_select: record.stack.slice(0, 6).map(name => ({ name })) },
          PreviewLines: { rich_text: makeRichText(record.previewLines.join('\n')) },
          Published: { checkbox: record.published }
        }
      });
      return { ...record, id: page.id };
    }

    const store = this.readLocalStore();
    store.portfolio.unshift(record);
    this.writeLocalStore(store);
    return record;
  }

  /* ---------------- SUPPORT TICKETS ---------------- */

  async listTickets(user) {
    let items;
    if (this.isNotionDbActive('tickets')) {
      items = await this.tryNotion(
        'tickets.list',
        async () => {
          const pages = await this.queryNotionDb(this.getDbConfig().tickets);
          return pages
            .map(page => {
              const p = page.properties || {};
              return {
                id: page.id,
                ticketCode: readText(p.TicketId) || page.id.slice(0, 8).toUpperCase(),
                clientEmail: readText(p.ClientEmail).toLowerCase(),
                company: readText(p.Company),
                subject: readText(p.Subject),
                domain: readText(p.Domain),
                priority: readText(p.Priority) || 'P3',
                status: readText(p.Status) || 'Open',
                details: readText(p.Details),
                createdAt: readText(p.CreatedAt) || page.created_time
              };
            })
            .filter(t => t.subject);
        },
        () => this.readLocalStore().tickets
      );
    } else {
      items = this.readLocalStore().tickets;
    }

    if (user.role === 'admin' || user.role === 'super_admin') return items;
    return items.filter(t => t.clientEmail.toLowerCase() === user.email.toLowerCase());
  }

  async createTicket(user, input) {
    const code = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const record = {
      id: code,
      ticketCode: code,
      clientEmail: user.email,
      company: user.company || 'Client Organization',
      subject: String(input.subject || '').trim(),
      domain: String(input.domain || 'Infra & SAN').trim(),
      priority: String(input.priority || 'P3').trim(),
      status: 'Open',
      details: String(input.details || '').trim(),
      createdAt: now
    };

    if (this.isNotionDbActive('tickets')) {
      const page = await this.notionRequest('/pages', 'POST', {
        parent: { database_id: this.getDbConfig().tickets },
        properties: {
          Subject: { title: makeRichText(record.subject) },
          TicketId: { rich_text: makeRichText(record.ticketCode) },
          ClientEmail: { email: record.clientEmail },
          Company: { rich_text: makeRichText(record.company) },
          Domain: { select: { name: record.domain } },
          Priority: { select: { name: record.priority } },
          Status: { select: { name: record.status } },
          Details: { rich_text: makeRichText(record.details) },
          CreatedAt: { date: { start: now } }
        }
      });
      return { ...record, id: page.id };
    }

    const store = this.readLocalStore();
    store.tickets.unshift(record);
    this.writeLocalStore(store);
    return record;
  }

  async updateTicketStatus(id, status) {
    const valid = ['Open', 'In Progress', 'Resolved'];
    if (!valid.includes(status)) throw new Error('Invalid ticket status');

    if (this.isNotionDbActive('tickets')) {
      await this.notionRequest(`/pages/${id}`, 'PATCH', {
        properties: { Status: { select: { name: status } } }
      });
      return { id, status };
    }

    const store = this.readLocalStore();
    const target = store.tickets.find(t => t.id === id);
    if (!target) throw new Error('Ticket not found');
    target.status = status;
    this.writeLocalStore(store);
    return target;
  }

  /* ---------------- INQUIRIES / RFP INBOX ---------------- */

  async listInquiries() {
    if (this.isNotionDbActive('inquiries')) {
      return this.tryNotion(
        'inquiries.list',
        async () => {
          const pages = await this.queryNotionDb(this.getDbConfig().inquiries);
          return pages
            .map(page => {
              const p = page.properties || {};
              return {
                id: page.id,
                name: readText(p.Name),
                email: readText(p.Email),
                scope: readText(p.Scope),
                tier: readText(p.Tier),
                brief: readText(p.Brief),
                status: readText(p.Status) || 'New',
                submittedAt: readText(p.SubmittedAt) || page.created_time
              };
            })
            .filter(i => i.name || i.email);
        },
        () => this.readLocalStore().inquiries
      );
    }
    return this.readLocalStore().inquiries;
  }

  async createInquiry(input) {
    const now = new Date().toISOString();
    const record = {
      id: `INQ-${Math.floor(100 + Math.random() * 899)}`,
      name: String(input.name || '').trim(),
      email: String(input.email || '').trim(),
      scope: String(input.scope || '').trim(),
      tier: String(input.tier || 'General Consultation').trim(),
      brief: String(input.brief || '').trim(),
      status: 'New',
      submittedAt: now
    };

    if (this.isNotionDbActive('inquiries')) {
      const page = await this.notionRequest('/pages', 'POST', {
        parent: { database_id: this.getDbConfig().inquiries },
        properties: {
          Name: { title: makeRichText(record.name) },
          Email: { email: record.email },
          Scope: { rich_text: makeRichText(record.scope) },
          Tier: { select: { name: record.tier } },
          Brief: { rich_text: makeRichText(record.brief) },
          Status: { select: { name: record.status } },
          SubmittedAt: { date: { start: now } }
        }
      });
      return { ...record, id: page.id };
    }

    const store = this.readLocalStore();
    store.inquiries.unshift(record);
    this.writeLocalStore(store);
    return record;
  }

  async updateInquiryStatus(id, status) {
    const valid = ['New', 'Reviewed', 'Scheduled', 'Closed'];
    if (!valid.includes(status)) throw new Error('Invalid inquiry status');

    if (this.isNotionDbActive('inquiries')) {
      await this.notionRequest(`/pages/${id}`, 'PATCH', {
        properties: { Status: { select: { name: status } } }
      });
      return { id, status };
    }

    const store = this.readLocalStore();
    const target = store.inquiries.find(i => i.id === id);
    if (!target) throw new Error('Inquiry not found');
    target.status = status;
    this.writeLocalStore(store);
    return target;
  }
}
