/**
 * BeyainCorp — Client Login Portal & Notion CMS Frontend
 */

const loginSection = document.getElementById('login-section');
const portalWorkspace = document.getElementById('portal-workspace');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const backendPill = document.getElementById('backend-pill');
const portalContent = document.getElementById('portal-content');
const themeToggleBtn = document.getElementById('theme-toggle');

let currentUser = null;
let cmsStatus = null;
let activeTab = 'overview';

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function initPortal() {
  try {
    const health = await api('/api/health');
    cmsStatus = health;
    if (health.mode === 'notion-hybrid') {
      backendPill.textContent = 'Notion DB Connected';
      backendPill.className = 'badge-status ok';
    } else {
      backendPill.textContent = 'Local Store Mode';
      backendPill.className = 'badge-status warn';
    }
  } catch {
    backendPill.textContent = 'Start node server.mjs';
    backendPill.className = 'badge-status warn';
    loginError.textContent = 'Backend server is not running. Start it with: npm start';
    loginError.style.display = 'block';
    return;
  }

  try {
    const me = await api('/api/auth/me');
    currentUser = me.user;
    cmsStatus = me.cmsStatus;
    showWorkspace();
  } catch {
    showLogin();
  }
}

function showLogin() {
  loginSection.style.display = 'block';
  portalWorkspace.style.display = 'none';
  logoutBtn.style.display = 'none';
}

function isAdminRole(user) {
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

function isSuperAdminRole(user) {
  return user && user.role === 'super_admin';
}

function showWorkspace() {
  loginSection.style.display = 'none';
  portalWorkspace.style.display = 'block';
  logoutBtn.style.display = 'inline-flex';

  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-meta').textContent = `${currentUser.role.replace('_', ' ').toUpperCase()} • ${currentUser.company || currentUser.email}`;

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdminRole(currentUser) ? 'flex' : 'none';
  });

  if (!isAdminRole(currentUser)) {
    activeTab = 'tickets';
  }
  document.querySelectorAll('.portal-nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === activeTab);
  });
  loadTab(activeTab);
}

loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    currentUser = res.user;
    showWorkspace();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.style.display = 'block';
  }
});

logoutBtn?.addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  currentUser = null;
  showLogin();
});

document.getElementById('forgot-toggle-btn')?.addEventListener('click', () => {
  const f = document.getElementById('forgot-form');
  if (f) f.style.display = f.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('forgot-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const status = document.getElementById('forgot-status');
  status.style.display = 'block';
  status.textContent = 'Submitting reset request...';
  try {
    const res = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('forgot-email').value.trim(),
        note: document.getElementById('forgot-note').value.trim()
      })
    });
    status.textContent = res.message;
    e.target.reset();
  } catch (err) {
    status.textContent = err.message;
  }
});

document.querySelectorAll('.portal-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.portal-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
    loadTab(activeTab);
  });
});

/* =========================================================================
   TAB RENDERERS
   ========================================================================= */

async function loadTab(tab) {
  portalContent.innerHTML = '<div class="card">Loading...</div>';
  try {
    if (tab === 'overview') await renderOverview();
    else if (tab === 'tickets') await renderTickets();
    else if (tab === 'services') await renderServicesCms();
    else if (tab === 'portfolio') await renderPortfolioCms();
    else if (tab === 'inquiries') await renderInquiries();
    else if (tab === 'users') await renderUsersCms();
    else if (tab === 'notion') renderNotionGuide();
  } catch (err) {
    portalContent.innerHTML = `<div class="card" style="color:#ef4444;">Error: ${escapeHtml(err.message)}</div>`;
  }
}

async function renderOverview() {
  const data = await api('/api/portal/overview');
  const db = data.cmsStatus.databases;
  const dbBadges = Object.entries(db).map(([name, connected]) => `
    <div class="career-box" style="display:flex;justify-content:space-between;align-items:center;">
      <strong style="text-transform:capitalize;">Notion ${name} DB</strong>
      <span class="badge-status ${connected && data.cmsStatus.notionTokenConfigured ? 'ok' : 'warn'}">
        ${connected && data.cmsStatus.notionTokenConfigured ? 'Live Notion' : 'Local Store'}
      </span>
    </div>
  `).join('');

  portalContent.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="section-kicker">WORKSPACE OVERVIEW</div>
      <h2 class="section-title" style="font-size:26px;margin-bottom:8px;">Welcome, ${escapeHtml(currentUser.name)}</h2>
      <p class="card-desc" style="margin-bottom:18px;">
        Active Backend Mode: <strong>${escapeHtml(data.cmsStatus.mode)}</strong> &bull; Manage support tickets${isAdminRole(currentUser) ? ', live website CMS content, and RFP inquiries' : ' and SLA tracking'}${isSuperAdminRole(currentUser) ? ', plus Super Admin user & Notion DB controls' : ''}.
      </p>

      <div class="grid-4">
        <div class="career-box">
          <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">OPEN TICKETS</span>
          <strong style="display:block;font-size:24px;color:var(--primary);">${data.counts.openTickets}</strong>
        </div>
        <div class="career-box">
          <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">PUBLISHED SERVICES</span>
          <strong style="display:block;font-size:24px;">${data.counts.services}</strong>
        </div>
        <div class="career-box">
          <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">PORTFOLIO PROJECTS</span>
          <strong style="display:block;font-size:24px;">${data.counts.portfolio}</strong>
        </div>
        <div class="career-box">
          <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">${isAdminRole(currentUser) ? 'WEBSITE INQUIRIES' : 'TARGET SLA'}</span>
          <strong style="display:block;font-size:24px;">${isAdminRole(currentUser) ? data.counts.inquiries : '99.9%'}</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-kicker">DATABASE ADAPTER STATUS</div>
      <div class="grid-2" style="gap:12px;">${dbBadges}</div>
    </div>
  `;
}

async function renderTickets() {
  const { tickets } = await api('/api/portal/tickets');
  const isAdmin = isAdminRole(currentUser);
  const openCount = tickets.filter(t => t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  portalContent.innerHTML = `
    ${!isAdmin ? `
      <div class="card" style="margin-bottom:20px;">
        <div class="section-kicker">CLIENT TICKETING PORTAL</div>
        <h2 class="section-title" style="font-size:24px;margin-bottom:12px;">Welcome, ${escapeHtml(currentUser.name)}</h2>
        <div class="grid-3">
          <div class="career-box">
            <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">OPEN TICKETS</span>
            <strong style="display:block;font-size:24px;color:var(--primary);">${openCount}</strong>
          </div>
          <div class="career-box">
            <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">RESOLVED</span>
            <strong style="display:block;font-size:24px;">${resolvedCount}</strong>
          </div>
          <div class="career-box">
            <span class="font-mono" style="font-size:10.5px;color:var(--text-muted);">AMC SLA TARGET</span>
            <strong style="display:block;font-size:18px;margin-top:4px;">P1 &lt;15m / P2 &lt;30m</strong>
          </div>
        </div>
      </div>
    ` : ''}

    <div class="card" style="margin-bottom:20px;">
      <div class="section-kicker">SUPPORT DESK</div>
      <h2 class="section-title" style="font-size:24px;margin-bottom:14px;">Raise a Support Ticket</h2>
      <form id="ticket-form" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="tkt-subject">Subject</label>
            <input id="tkt-subject" class="input" required placeholder="e.g. SentinelOne policy update or VMware alert" />
          </div>
          <div>
            <label class="field-label" for="tkt-domain">Domain</label>
            <select id="tkt-domain" class="input">
              <option>Infra & SAN</option>
              <option>Cloud & O365</option>
              <option>Security & EDR</option>
              <option>Web & Apps</option>
              <option>Licensing & AMC</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="tkt-priority">Priority</label>
            <select id="tkt-priority" class="input">
              <option value="P3">P3 — Standard Request</option>
              <option value="P2">P2 — High Impact (&lt;30m)</option>
              <option value="P1">P1 — Critical Outage (&lt;15m)</option>
            </select>
          </div>
          <div>
            <label class="field-label" for="tkt-details">Details</label>
            <input id="tkt-details" class="input" required placeholder="Host, error message, or affected user count" />
          </div>
        </div>
        <div><button type="submit" class="btn btn-primary btn-sm">Submit Support Ticket →</button></div>
      </form>
    </div>

    <div class="card">
      <div class="section-kicker">TICKET QUEUE (${tickets.length})</div>
      <div class="table-wrap">
        <table class="cms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Domain</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tickets.map(t => `
              <tr>
                <td class="font-mono">${escapeHtml(t.ticketCode || t.id)}</td>
                <td>
                  <strong>${escapeHtml(t.subject)}</strong>
                  <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(t.company)} &bull; ${escapeHtml(t.details)}</div>
                </td>
                <td>${escapeHtml(t.domain)}</td>
                <td class="font-mono">${escapeHtml(t.priority)}</td>
                <td>
                  ${isAdmin ? `
                    <select class="input tkt-status-select" data-id="${escapeHtml(t.id)}" style="padding:5px 8px;font-size:12px;">
                      <option ${t.status === 'Open' ? 'selected' : ''}>Open</option>
                      <option ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option ${t.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                  ` : `<span class="badge-status ${t.status === 'Resolved' ? 'ok' : ''}">${escapeHtml(t.status)}</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('ticket-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    await api('/api/portal/tickets', {
      method: 'POST',
      body: JSON.stringify({
        subject: document.getElementById('tkt-subject').value,
        domain: document.getElementById('tkt-domain').value,
        priority: document.getElementById('tkt-priority').value,
        details: document.getElementById('tkt-details').value
      })
    });
    loadTab('tickets');
  });

  document.querySelectorAll('.tkt-status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      await api(`/api/portal/tickets/${encodeURIComponent(sel.dataset.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value })
      });
    });
  });
}

async function renderServicesCms() {
  const { services } = await api('/api/cms/services');
  const isAdmin = isAdminRole(currentUser);
  portalContent.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="section-kicker">CMS // ADD SERVICE</div>
      <h2 class="section-title" style="font-size:24px;margin-bottom:14px;">Publish New IT Service</h2>
      <form id="cms-service-form" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="srv-title">Service Title</label>
            <input id="srv-title" class="input" required placeholder="e.g. Kubernetes & Hybrid Rancher Ops" />
          </div>
          <div>
            <label class="field-label" for="srv-cat">Category</label>
            <select id="srv-cat" class="input">
              <option value="INFRA">INFRA</option>
              <option value="CLOUD">CLOUD</option>
              <option value="SECURITY">SECURITY</option>
              <option value="APPS">APPS</option>
              <option value="ADVISORY">ADVISORY</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="srv-code">Code &amp; Label</label>
            <input id="srv-label" class="input" required placeholder="e.g. Cloud Native" />
          </div>
          <div>
            <label class="field-label" for="srv-tags">Tags (comma separated)</label>
            <input id="srv-tags" class="input" placeholder="Docker, Kubernetes, Linux" />
          </div>
        </div>
        <div>
          <label class="field-label" for="srv-desc">Summary Description</label>
          <input id="srv-desc" class="input" required placeholder="Concise overview shown on public card" />
        </div>
        <div>
          <label class="field-label" for="srv-bullets">Bullet Points (one per line)</label>
          <textarea id="srv-bullets" class="input" rows="3" placeholder="Cluster hardening&#10;Automated backups"></textarea>
        </div>
        <div><button type="submit" class="btn btn-primary btn-sm">Publish to Website &amp; Notion DB →</button></div>
      </form>
    </div>

    <div class="card">
      <div class="section-kicker">PUBLISHED SERVICES (${services.length})</div>
      <div class="table-wrap">
        <table class="cms-table">
          <thead><tr><th>Code</th><th>Category</th><th>Title</th><th>Tags</th>${isAdmin ? '<th>Action</th>' : ''}</tr></thead>
          <tbody>
            ${services.map(s => `
              <tr>
                <td class="font-mono">${escapeHtml(s.code)}</td>
                <td class="font-mono">${escapeHtml(s.cat)}</td>
                <td><strong>${escapeHtml(s.title)}</strong><div style="font-size:12px;color:var(--text-muted);">${escapeHtml(s.desc)}</div></td>
                <td>${(s.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</td>
                ${isAdmin ? `<td><button type="button" class="btn btn-outline btn-sm del-srv-btn" data-id="${escapeHtml(s.id)}">Remove</button></td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll('.del-srv-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/api/cms/services/${encodeURIComponent(btn.dataset.id)}`, { method: 'DELETE' });
      loadTab('services');
    });
  });

  document.getElementById('cms-service-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    await api('/api/cms/services', {
      method: 'POST',
      body: JSON.stringify({
        code: String(services.length + 1).padStart(2, '0'),
        cat: document.getElementById('srv-cat').value,
        label: document.getElementById('srv-label').value,
        title: document.getElementById('srv-title').value,
        desc: document.getElementById('srv-desc').value,
        bullets: document.getElementById('srv-bullets').value,
        tags: document.getElementById('srv-tags').value
      })
    });
    loadTab('services');
  });
}

async function renderPortfolioCms() {
  const { portfolio } = await api('/api/cms/portfolio');
  const isAdmin = isAdminRole(currentUser);
  portalContent.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="section-kicker">CMS // ADD PORTFOLIO PROJECT</div>
      <h2 class="section-title" style="font-size:24px;margin-bottom:14px;">Publish Case Study to Portfolio</h2>
      <form id="cms-portfolio-form" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="prj-title">Project Title</label>
            <input id="prj-title" class="input" required placeholder="e.g. Zero-Trust Entra ID Migration" />
          </div>
          <div>
            <label class="field-label" for="prj-cat">Category</label>
            <select id="prj-cat" class="input">
              <option value="INFRA">INFRA</option>
              <option value="AUTOMATION">AUTOMATION</option>
              <option value="WEB">WEB</option>
              <option value="DATA">DATA</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="prj-impact">Impact Badge</label>
            <input id="prj-impact" class="input" required placeholder="e.g. 99.98% Uptime" />
          </div>
          <div>
            <label class="field-label" for="prj-stack">Stack (comma separated)</label>
            <input id="prj-stack" class="input" placeholder="Azure, Entra ID, SentinelOne" />
          </div>
        </div>
        <div>
          <label class="field-label" for="prj-summary">Card Summary</label>
          <input id="prj-summary" class="input" required placeholder="Short summary shown on portfolio grid" />
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="prj-challenge">Challenge</label>
            <input id="prj-challenge" class="input" placeholder="Problem solved" />
          </div>
          <div>
            <label class="field-label" for="prj-outcome">Verified Outcome</label>
            <input id="prj-outcome" class="input" placeholder="Measurable result" />
          </div>
        </div>
        <div><button type="submit" class="btn btn-primary btn-sm">Publish Portfolio Project →</button></div>
      </form>
    </div>

    <div class="card">
      <div class="section-kicker">PORTFOLIO PROJECTS (${portfolio.length})</div>
      <div class="table-wrap">
        <table class="cms-table">
          <thead><tr><th>Category</th><th>Project</th><th>Impact</th><th>Stack</th>${isAdmin ? '<th>Action</th>' : ''}</tr></thead>
          <tbody>
            ${portfolio.map(p => `
              <tr>
                <td class="font-mono">${escapeHtml(p.cat)}</td>
                <td><strong>${escapeHtml(p.title)}</strong><div style="font-size:12px;color:var(--text-muted);">${escapeHtml(p.summary)}</div></td>
                <td><span class="badge-status ok">${escapeHtml(p.impact)}</span></td>
                <td>${(p.stack || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join(' ')}</td>
                ${isAdmin ? `<td><button type="button" class="btn btn-outline btn-sm del-prj-btn" data-id="${escapeHtml(p.id)}">Remove</button></td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll('.del-prj-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/api/cms/portfolio/${encodeURIComponent(btn.dataset.id)}`, { method: 'DELETE' });
      loadTab('portfolio');
    });
  });

  document.getElementById('cms-portfolio-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const cat = document.getElementById('prj-cat').value;
    await api('/api/cms/portfolio', {
      method: 'POST',
      body: JSON.stringify({
        cat,
        categoryLabel: cat,
        title: document.getElementById('prj-title').value,
        impact: document.getElementById('prj-impact').value,
        summary: document.getElementById('prj-summary').value,
        challenge: document.getElementById('prj-challenge').value,
        solution: document.getElementById('prj-summary').value,
        outcome: document.getElementById('prj-outcome').value,
        stack: document.getElementById('prj-stack').value,
        previewLines: ['Status: Production Verified', `Impact: ${document.getElementById('prj-impact').value}`]
      })
    });
    loadTab('portfolio');
  });
}

async function renderInquiries() {
  const { inquiries } = await api('/api/cms/inquiries');
  portalContent.innerHTML = `
    <div class="card">
      <div class="section-kicker">WEBSITE INQUIRIES &amp; RFP INBOX (${inquiries.length})</div>
      <h2 class="section-title" style="font-size:24px;margin-bottom:14px;">Client Leads &amp; Consultation Requests</h2>
      <div class="table-wrap">
        <table class="cms-table">
          <thead><tr><th>Client</th><th>Scope &amp; Brief</th><th>Tier</th><th>Status</th></tr></thead>
          <tbody>
            ${inquiries.map(i => `
              <tr>
                <td>
                  <strong>${escapeHtml(i.name)}</strong>
                  <div class="font-mono" style="font-size:11.5px;color:var(--text-muted);">${escapeHtml(i.email)}</div>
                </td>
                <td>
                  <strong>${escapeHtml(i.scope)}</strong>
                  <div style="font-size:12.5px;color:var(--text-soft);">${escapeHtml(i.brief)}</div>
                </td>
                <td>${escapeHtml(i.tier)}</td>
                <td>
                  <select class="input inq-status-select" data-id="${escapeHtml(i.id)}" style="padding:5px 8px;font-size:12px;">
                    <option ${i.status === 'New' ? 'selected' : ''}>New</option>
                    <option ${i.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
                    <option ${i.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option ${i.status === 'Closed' ? 'selected' : ''}>Closed</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll('.inq-status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      await api(`/api/cms/inquiries/${encodeURIComponent(sel.dataset.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value })
      });
    });
  });
}

async function renderUsersCms() {
  const { users, passwordVisibilityEnabled } = await api('/api/cms/users');
  const isSuper = isSuperAdminRole(currentUser);
  const showPasswords = Boolean(isSuper && passwordVisibilityEnabled);

  portalContent.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="section-kicker">USER MANAGEMENT</div>
      <h2 class="section-title" style="font-size:24px;margin-bottom:14px;">Provision Client or Director Login</h2>
      <form id="cms-user-form" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="usr-name">Full Name</label>
            <input id="usr-name" class="input" required placeholder="e.g. Ops Manager" />
          </div>
          <div>
            <label class="field-label" for="usr-email">Email</label>
            <input id="usr-email" class="input" type="email" required placeholder="client@company.com" />
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="usr-company">Company / Organization</label>
            <input id="usr-company" class="input" required placeholder="e.g. Horizon Pharma" />
          </div>
          <div>
            <label class="field-label" for="usr-role">Role</label>
            <select id="usr-role" class="input">
              <option value="client">Client (Ticketing Only)</option>
              <option value="admin">Admin / Director (Full CMS &amp; User Control)</option>
            </select>
          </div>
        </div>
        <div>
          <label class="field-label" for="usr-pass">Initial Password (min 8 chars, hashed via scrypt)</label>
          <input id="usr-pass" class="input" type="password" minlength="8" required placeholder="Strong password" />
        </div>
        <div><button type="submit" class="btn btn-primary btn-sm">Create Portal User →</button></div>
      </form>
    </div>

    <div id="edit-user-card" class="card" style="display:none;margin-bottom:20px;border:2px solid var(--primary);">
      <div class="section-kicker">MODIFY USER DETAILS</div>
      <h3 class="section-title" style="font-size:20px;margin-bottom:12px;">Edit Portal Account</h3>
      <form id="edit-user-form" style="display:flex;flex-direction:column;gap:12px;">
        <input id="edit-usr-id" type="hidden" />
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="edit-usr-name">Full Name</label>
            <input id="edit-usr-name" class="input" required />
          </div>
          <div>
            <label class="field-label" for="edit-usr-email">Email</label>
            <input id="edit-usr-email" class="input" type="email" required />
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="edit-usr-company">Company / Organization</label>
            <input id="edit-usr-company" class="input" />
          </div>
          <div>
            <label class="field-label" for="edit-usr-role">Role</label>
            <select id="edit-usr-role" class="input">
              <option value="client">client</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <label class="field-label" for="edit-usr-pass">New Password (leave blank to keep current)</label>
            <input id="edit-usr-pass" class="input" type="password" minlength="8" placeholder="Optional new password (min 8 chars)" />
          </div>
          <div style="display:flex;align-items:flex-end;padding-bottom:8px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;">
              <input id="edit-usr-active" type="checkbox" /> Account Active
            </label>
          </div>
        </div>
        <div id="edit-usr-error" class="font-mono" style="font-size:12px;color:#ef4444;display:none;"></div>
        <div style="display:flex;gap:8px;">
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
          <button type="button" id="cancel-edit-usr" class="btn btn-outline btn-sm">Cancel</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="section-kicker">PORTAL ACCOUNTS (${users.length}) &mdash; ${isSuper ? 'SUPER ADMIN CONTROL' : 'ADMIN MANAGEMENT'}</div>
      ${showPasswords ? `
        <div class="career-box" style="margin:10px 0 14px;font-size:12.5px;">
          <strong>Testing Mode Active:</strong> Password visibility is enabled for Super Admin only. Set <code>ALLOW_SUPER_ADMIN_PASSWORD_VISIBILITY=false</code> or <code>NODE_ENV=production</code> in <code>.env</code> before production deployment.
        </div>
      ` : ''}
      <div id="reset-banner" class="career-box" style="display:none;margin-bottom:14px;"></div>
      <div class="table-wrap">
        <table class="cms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Role</th>
              <th>Active</th>
              ${showPasswords ? '<th>Password (Testing)</th>' : ''}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const isSelfSuper = u.role === 'super_admin';
              const canEditRow = isSuper || !isSelfSuper;
              return `
              <tr>
                <td><strong>${escapeHtml(u.name)}</strong></td>
                <td class="font-mono">${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.company)}</td>
                <td>
                  ${isSelfSuper ? `<span class="badge-status ok">super_admin</span>` : `
                    <select class="input usr-role-select" data-id="${escapeHtml(u.id)}" style="padding:4px 8px;font-size:12px;">
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                      <option value="client" ${u.role === 'client' ? 'selected' : ''}>client</option>
                    </select>
                  `}
                </td>
                <td>
                  ${isSelfSuper ? `<span class="badge-status ok">Yes</span>` : `
                    <input type="checkbox" class="usr-active-toggle" data-id="${escapeHtml(u.id)}" ${u.active !== false ? 'checked' : ''} />
                  `}
                </td>
                ${showPasswords ? `
                  <td>
                    ${u.passwordUnHash ? `
                      <div style="display:flex;align-items:center;gap:6px;">
                        <code class="font-mono pw-val" data-plain="${escapeHtml(u.passwordUnHash)}" style="font-size:12px;">••••••••</code>
                        <button type="button" class="btn btn-outline btn-sm toggle-pw-btn" style="padding:3px 8px;font-size:11px;">Show</button>
                      </div>
                    ` : '<span class="font-mono" style="font-size:11px;color:var(--text-muted);">Not stored — reset to set</span>'}
                  </td>
                ` : ''}
                <td style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${canEditRow ? `<button type="button" class="btn btn-outline btn-sm edit-usr-btn" data-id="${escapeHtml(u.id)}">Edit</button>` : ''}
                  ${isSuper ? `<button type="button" class="btn btn-outline btn-sm reset-pw-btn" data-id="${escapeHtml(u.id)}" data-email="${escapeHtml(u.email)}">Reset Password</button>` : ''}
                  ${isSelfSuper ? '' : `<button type="button" class="btn btn-outline btn-sm del-usr-btn" data-id="${escapeHtml(u.id)}">Remove</button>`}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll('.toggle-pw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.parentElement.querySelector('.pw-val');
      const revealed = btn.dataset.revealed === '1';
      code.textContent = revealed ? '••••••••' : code.dataset.plain;
      btn.textContent = revealed ? 'Show' : 'Hide';
      btn.dataset.revealed = revealed ? '0' : '1';
    });
  });

  const editCard = document.getElementById('edit-user-card');
  const editForm = document.getElementById('edit-user-form');
  const editErr = document.getElementById('edit-usr-error');
  const editRoleEl = document.getElementById('edit-usr-role');
  const editEmailEl = document.getElementById('edit-usr-email');
  const editActiveEl = document.getElementById('edit-usr-active');

  document.querySelectorAll('.edit-usr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = users.find(item => item.id === btn.dataset.id);
      if (!u) return;
      const isSuperTarget = u.role === 'super_admin';
      document.getElementById('edit-usr-id').value = u.id;
      document.getElementById('edit-usr-name').value = u.name || '';
      editEmailEl.value = u.email || '';
      editEmailEl.disabled = isSuperTarget;
      document.getElementById('edit-usr-company').value = u.company || '';
      editRoleEl.value = isSuperTarget ? 'admin' : u.role;
      editRoleEl.disabled = isSuperTarget;
      editActiveEl.checked = u.active !== false;
      editActiveEl.disabled = isSuperTarget;
      document.getElementById('edit-usr-pass').value = '';
      editErr.style.display = 'none';
      editCard.style.display = 'block';
      editCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  document.getElementById('cancel-edit-usr')?.addEventListener('click', () => {
    editCard.style.display = 'none';
  });

  editForm?.addEventListener('submit', async e => {
    e.preventDefault();
    editErr.style.display = 'none';
    const userId = document.getElementById('edit-usr-id').value;
    const u = users.find(item => item.id === userId);
    const payload = {
      name: document.getElementById('edit-usr-name').value.trim(),
      company: document.getElementById('edit-usr-company').value.trim()
    };
    if (!u || u.role !== 'super_admin') {
      payload.email = editEmailEl.value.trim();
      payload.role = editRoleEl.value;
      payload.active = editActiveEl.checked;
    }
    const newPass = document.getElementById('edit-usr-pass').value;
    if (newPass) payload.password = newPass;

    try {
      await api(`/api/cms/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      loadTab('users');
    } catch (err) {
      editErr.textContent = err.message;
      editErr.style.display = 'block';
    }
  });

  document.querySelectorAll('.usr-role-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      await api(`/api/cms/users/${encodeURIComponent(sel.dataset.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: sel.value })
      });
    });
  });

  document.querySelectorAll('.usr-active-toggle').forEach(chk => {
    chk.addEventListener('change', async () => {
      await api(`/api/cms/users/${encodeURIComponent(chk.dataset.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: chk.checked })
      });
    });
  });

  document.querySelectorAll('.del-usr-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/api/cms/users/${encodeURIComponent(btn.dataset.id)}`, { method: 'DELETE' });
      loadTab('users');
    });
  });

  document.querySelectorAll('.reset-pw-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const banner = document.getElementById('reset-banner');
      const res = await api(`/api/cms/users/${encodeURIComponent(btn.dataset.id)}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      banner.style.display = 'block';
      banner.innerHTML = `<strong>New password for ${escapeHtml(btn.dataset.email)}:</strong> <code class="font-mono">${escapeHtml(res.temporaryPassword)}</code>`;
      setTimeout(() => loadTab('users'), 1200);
    });
  });

  document.getElementById('cms-user-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    await api('/api/cms/users', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('usr-name').value,
        email: document.getElementById('usr-email').value,
        company: document.getElementById('usr-company').value,
        role: document.getElementById('usr-role').value,
        password: document.getElementById('usr-pass').value
      })
    });
    loadTab('users');
  });
}

async function renderNotionGuide() {
  portalContent.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="section-kicker">NOTION DB DIAGNOSTICS &amp; SYNC</div>
      <h2 class="section-title" style="font-size:24px;margin-bottom:10px;">Live Notion Database Status</h2>
      <p class="card-desc">
        Make sure each of your 5 Notion databases is connected to the <strong>BeyainCorp_Portfolio</strong> integration in Notion (<code>•••</code> menu &rarr; <strong>Connections</strong> &rarr; <strong>BeyainCorp_Portfolio</strong>).
      </p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0;">
        <button type="button" id="btn-test-notion" class="btn btn-outline btn-sm">Re-Check Notion Connections</button>
        <button type="button" id="btn-seed-notion" class="btn btn-primary btn-sm">Seed Initial Data to Notion →</button>
      </div>
      <div id="notion-check-results" class="grid-2" style="gap:10px;">Loading Notion status...</div>
    </div>

    <div class="card">
      <div class="section-kicker">NOTION DB SCHEMA REFERENCE</div>
      <div class="table-wrap" style="margin-top:10px;">
        <table class="cms-table">
          <thead><tr><th>Database</th><th>.env Variable</th><th>Required Notion Properties</th></tr></thead>
          <tbody>
            <tr><td><strong>Users</strong></td><td class="font-mono">NOTION_USERS_DB_ID</td><td class="font-mono">Name (title), Email (email), PasswordHash (text), Role (select: super_admin/admin/client), Company (text), Active (checkbox), optional testing PasswordUnHash (text)</td></tr>
            <tr><td><strong>Services</strong></td><td class="font-mono">NOTION_SERVICES_DB_ID</td><td class="font-mono">Title (title), Code (text), Category (select), Label (text), Description (text), Bullets (text), Tags (multi_select), Published (checkbox)</td></tr>
            <tr><td><strong>Portfolio</strong></td><td class="font-mono">NOTION_PORTFOLIO_DB_ID</td><td class="font-mono">Title (title), Category (select), CategoryLabel (text), Impact (text), Summary (text), Challenge (text), Solution (text), Outcome (text), Stack (multi_select), PreviewLines (text), Published (checkbox)</td></tr>
            <tr><td><strong>Tickets</strong></td><td class="font-mono">NOTION_TICKETS_DB_ID</td><td class="font-mono">Subject (title), TicketId (text), ClientEmail (email), Company (text), Domain (select), Priority (select), Status (select), Details (text), CreatedAt (date)</td></tr>
            <tr><td><strong>Inquiries</strong></td><td class="font-mono">NOTION_INQUIRIES_DB_ID</td><td class="font-mono">Name (title), Email (email), Scope (text), Tier (select), Brief (text), Status (select), SubmittedAt (date)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  async function runCheck() {
    const box = document.getElementById('notion-check-results');
    box.innerHTML = 'Checking Notion API...';
    const { databases } = await api('/api/cms/notion-check');
    box.innerHTML = Object.entries(databases).map(([key, info]) => `
      <div class="career-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <strong style="text-transform:capitalize;">${escapeHtml(key)} DB</strong>
          <span class="badge-status ${info.ok ? 'ok' : 'warn'}">${info.ok ? 'Ready' : 'Action Needed'}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(info.error || `Connected: ${info.title}`)}</div>
      </div>
    `).join('');
  }

  document.getElementById('btn-test-notion')?.addEventListener('click', runCheck);
  document.getElementById('btn-seed-notion')?.addEventListener('click', async () => {
    const box = document.getElementById('notion-check-results');
    const { summary } = await api('/api/cms/notion-seed', { method: 'POST' });
    box.innerHTML = Object.entries(summary).map(([k, msg]) => `
      <div class="career-box"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(msg)}</div>
    `).join('');
  });

  await runCheck();
}

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

initPortal();
