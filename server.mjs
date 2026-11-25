import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BeyainCmsAdapter, verifyPassword } from './lib/notion-cms.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* =========================================================================
   LOAD .env (ZERO-DEPENDENCY)
   ========================================================================= */

function loadEnv(dir) {
  const env = { ...process.env };
  const envPath = path.join(dir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) env[key] = val;
    }
  }
  return env;
}

const ENV = loadEnv(__dirname);
const PORT = Number(ENV.PORT || 8787);
const SESSION_SECRET = ENV.SESSION_SECRET && ENV.SESSION_SECRET !== 'replace-with-a-64-char-random-hex-secret'
  ? ENV.SESSION_SECRET
  : crypto.randomBytes(32).toString('hex');

if (!ENV.SESSION_SECRET || ENV.SESSION_SECRET === 'replace-with-a-64-char-random-hex-secret') {
  console.warn('[BeyainCorp] Notice: Using ephemeral SESSION_SECRET. Set SESSION_SECRET in .env for persistent sessions.');
}

const cms = new BeyainCmsAdapter(__dirname, ENV);

/* =========================================================================
   SIGNED HTTP-ONLY SESSION COOKIE
   ========================================================================= */

const COOKIE_NAME = 'beyain_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const map = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      map[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return map;
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const data = verifyToken(cookies[COOKIE_NAME]);
  if (!data) return null;
  if (String(data.email || '').toLowerCase() === 'jjebin05@gmail.com') {
    data.role = 'super_admin';
  }
  return data;
}

/* =========================================================================
   HTTP HELPERS
   ========================================================================= */

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const BLOCKED_PREFIXES = ['/data/', '/lib/', '/scripts/', '/.env', '/package.json', '/server.mjs'];

function sendJson(res, status, data, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function serveStaticFile(reqPath, res) {
  const cleanUrlPath = reqPath === '/' ? '/index.html' : reqPath;
  if (BLOCKED_PREFIXES.some(prefix => cleanUrlPath.toLowerCase().startsWith(prefix))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  const resolved = path.resolve(__dirname, `.${cleanUrlPath}`);
  if (!resolved.startsWith(__dirname + path.sep) && resolved !== __dirname) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  const ext = path.extname(resolved).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  fs.createReadStream(resolved).pipe(res);
}

/* =========================================================================
   REQUEST ROUTER
   ========================================================================= */

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method || 'GET';

    // 1. Health & Public Content
    if (method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, ...cms.getStatus() });
    }

    if (method === 'GET' && pathname === '/api/public/content') {
      const [services, portfolio] = await Promise.all([
        cms.listServices({ onlyPublished: true }),
        cms.listPortfolio({ onlyPublished: true })
      ]);
      return sendJson(res, 200, { services, portfolio, backend: cms.getStatus().mode });
    }

    if (method === 'POST' && pathname === '/api/public/inquiries') {
      const body = await readJsonBody(req);
      if (!body.name || !body.email || !body.brief) {
        return sendJson(res, 400, { error: 'Name, email, and project brief are required.' });
      }
      const created = await cms.createInquiry(body);
      return sendJson(res, 201, { ok: true, inquiry: created });
    }

    // 2. Authentication
    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = await readJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      const user = await cms.findUserByEmail(email);
      if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
        return sendJson(res, 401, { error: 'Invalid email or password.' });
      }

      const sessionPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        exp: Date.now() + SESSION_TTL_MS
      };
      const token = signToken(sessionPayload);
      const cookieFlags = [
        `${COOKIE_NAME}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
      ].join('; ');

      return sendJson(
        res,
        200,
        { user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company } },
        { 'Set-Cookie': cookieFlags }
      );
    }

    if (method === 'POST' && pathname === '/api/auth/logout') {
      return sendJson(
        res,
        200,
        { ok: true },
        { 'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` }
      );
    }

    if (method === 'GET' && pathname === '/api/auth/me') {
      const session = getSessionUser(req);
      if (!session) return sendJson(res, 401, { error: 'Not authenticated' });
      return sendJson(res, 200, { user: session, cmsStatus: cms.getStatus() });
    }

    if (method === 'POST' && pathname === '/api/auth/forgot-password') {
      const body = await readJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      if (!email) return sendJson(res, 400, { error: 'Email address is required.' });
      // Log emergency password reset request into Tickets DB for Director action (no user enumeration)
      await cms.createTicket(
        { email, company: 'Password Reset Request' },
        {
          subject: `Emergency Password Reset Request (${email})`,
          domain: 'Licensing & AMC',
          priority: 'P2',
          details: String(body.note || 'User requested emergency portal password reset via login screen.').trim()
        }
      );
      return sendJson(res, 200, {
        ok: true,
        message: 'If this account exists, an emergency reset request has been logged for BeyainCorp Directors.'
      });
    }

    // 3. Authenticated Portal & CMS Routes
    if (pathname.startsWith('/api/portal') || pathname.startsWith('/api/cms')) {
      const session = getSessionUser(req);
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const isSuperAdmin = session.role === 'super_admin' && session.email.toLowerCase() === 'jjebin05@gmail.com';
      const isAdmin = isSuperAdmin || session.role === 'admin';

      // Portal overview (Admin / Super Admin only; clients have ticketing access only)
      if (method === 'GET' && pathname === '/api/portal/overview') {
        if (!isAdmin) {
          return sendJson(res, 403, { error: 'Admin access required. Clients have ticketing access only.' });
        }
        const tickets = await cms.listTickets(session);
        const [services, portfolio] = await Promise.all([cms.listServices(), cms.listPortfolio()]);
        const inquiries = await cms.listInquiries();
        return sendJson(res, 200, {
          user: session,
          cmsStatus: cms.getStatus(),
          counts: {
            services: services.length,
            portfolio: portfolio.length,
            openTickets: tickets.filter(t => t.status !== 'Resolved').length,
            totalTickets: tickets.length,
            inquiries: inquiries.length
          }
        });
      }

      // Support Tickets (Clients see own; Admins see all & can change status)
      if (method === 'GET' && pathname === '/api/portal/tickets') {
        return sendJson(res, 200, { tickets: await cms.listTickets(session) });
      }

      if (method === 'POST' && pathname === '/api/portal/tickets') {
        const body = await readJsonBody(req);
        if (!body.subject || !body.details) {
          return sendJson(res, 400, { error: 'Ticket subject and details are required.' });
        }
        const created = await cms.createTicket(session, body);
        return sendJson(res, 201, { ticket: created });
      }

      if (method === 'PATCH' && pathname.startsWith('/api/portal/tickets/')) {
        if (!isAdmin) return sendJson(res, 403, { error: 'Admin access required' });
        const id = decodeURIComponent(pathname.replace('/api/portal/tickets/', ''));
        const body = await readJsonBody(req);
        const updated = await cms.updateTicketStatus(id, body.status);
        return sendJson(res, 200, { ticket: updated });
      }

      // Admin-only CMS endpoints
      if (!isAdmin) {
        return sendJson(res, 403, { error: 'Director / Admin privileges required.' });
      }

      if (method === 'GET' && pathname === '/api/cms/services') {
        return sendJson(res, 200, { services: await cms.listServices() });
      }
      if (method === 'POST' && pathname === '/api/cms/services') {
        const body = await readJsonBody(req);
        if (!body.title || !body.desc) return sendJson(res, 400, { error: 'Title and description are required.' });
        return sendJson(res, 201, { service: await cms.createService(body) });
      }
      if (method === 'DELETE' && pathname.startsWith('/api/cms/services/')) {
        const id = decodeURIComponent(pathname.replace('/api/cms/services/', ''));
        return sendJson(res, 200, await cms.deleteRecord('services', id));
      }

      if (method === 'GET' && pathname === '/api/cms/portfolio') {
        return sendJson(res, 200, { portfolio: await cms.listPortfolio() });
      }
      if (method === 'POST' && pathname === '/api/cms/portfolio') {
        const body = await readJsonBody(req);
        if (!body.title || !body.summary) return sendJson(res, 400, { error: 'Title and summary are required.' });
        return sendJson(res, 201, { project: await cms.createPortfolio(body) });
      }
      if (method === 'DELETE' && pathname.startsWith('/api/cms/portfolio/')) {
        const id = decodeURIComponent(pathname.replace('/api/cms/portfolio/', ''));
        return sendJson(res, 200, await cms.deleteRecord('portfolio', id));
      }

      if (method === 'GET' && pathname === '/api/cms/inquiries') {
        return sendJson(res, 200, { inquiries: await cms.listInquiries() });
      }
      if (method === 'PATCH' && pathname.startsWith('/api/cms/inquiries/')) {
        const id = decodeURIComponent(pathname.replace('/api/cms/inquiries/', ''));
        const body = await readJsonBody(req);
        return sendJson(res, 200, { inquiry: await cms.updateInquiryStatus(id, body.status) });
      }

      if (method === 'GET' && pathname === '/api/cms/users') {
        const allowPasswordVisibility = isSuperAdmin && cms.isPasswordVisibilityAllowed();
        return sendJson(res, 200, {
          users: await cms.listUsers({ includePassword: allowPasswordVisibility }),
          passwordVisibilityEnabled: allowPasswordVisibility
        });
      }
      if (method === 'POST' && pathname === '/api/cms/users') {
        const body = await readJsonBody(req);
        if (!body.name || !body.email || !body.password || body.password.length < 8) {
          return sendJson(res, 400, { error: 'Name, email, and password (min 8 chars) are required.' });
        }
        return sendJson(res, 201, { user: await cms.createUser(body) });
      }
      if (method === 'POST' && pathname.startsWith('/api/cms/users/') && pathname.endsWith('/reset-password')) {
        if (!isSuperAdmin) {
          return sendJson(res, 403, { error: 'Super Admin privilege (jjebin05@gmail.com) required for credential resets.' });
        }
        const userId = decodeURIComponent(
          pathname.replace('/api/cms/users/', '').replace('/reset-password', '')
        );
        const body = await readJsonBody(req);
        const tempPassword = body.password && body.password.length >= 8
          ? String(body.password)
          : `Beyain-${crypto.randomBytes(5).toString('hex')}`;
        await cms.resetUserPassword(userId, tempPassword);
        return sendJson(res, 200, { ok: true, id: userId, temporaryPassword: tempPassword });
      }
      if (method === 'PATCH' && pathname.startsWith('/api/cms/users/')) {
        const userId = decodeURIComponent(pathname.replace('/api/cms/users/', ''));
        const body = await readJsonBody(req);
        try {
          return sendJson(res, 200, { user: await cms.updateUser(userId, body, session) });
        } catch (err) {
          const status = /Only Super Admin|cannot be modified/i.test(err.message) ? 403 : 400;
          return sendJson(res, status, { error: err.message });
        }
      }
      if (method === 'DELETE' && pathname.startsWith('/api/cms/users/')) {
        const userId = decodeURIComponent(pathname.replace('/api/cms/users/', ''));
        return sendJson(res, 200, await cms.deleteRecord('users', userId));
      }

      if (method === 'GET' && pathname === '/api/cms/notion-check') {
        return sendJson(res, 200, { databases: await cms.verifyNotionDatabases() });
      }
      if (method === 'POST' && pathname === '/api/cms/notion-seed') {
        return sendJson(res, 200, { summary: await cms.seedDefaultsToNotion() });
      }

      return sendJson(res, 404, { error: 'API endpoint not found' });
    }

    // 4. Static Website Files
    if (method === 'GET') {
      return serveStaticFile(pathname, res);
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  } catch (err) {
    console.error('[Server Error]', err);
    return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  const status = cms.getStatus();
  console.log(`[BeyainCorp] Server running on http://localhost:${PORT} (mode: ${status.mode})`);
});
