# BeyainCorp Website, Portfolio & Notion CMS Portal

Full-stack corporate website, portfolio showcase, client support login portal, and Notion Database CMS built with zero external npm dependencies on Node.js (`>=20`).

## Quick Start

1. **Start the backend & website server:**
   ```zsh
   npm start
   ```
   Open `http://localhost:8787` (public website) and `http://localhost:8787/portal.html` (Client & Director Portal).

2. **Public Hosting via Cloudflare Tunnel (MacBook Pro):**
   ```zsh
   cloudflared tunnel --protocol http2 --url http://localhost:8787
   ```

## Local Store Mode vs. Live Notion DB Mode

- **Out of the box (no `.env` required):** The server uses a local JSON store (`data/cms-store.json`) with `scrypt`-hashed credentials so you can test the entire Login Portal, Tickets, Inquiries Inbox, Services CMS, and Portfolio CMS immediately.
  - **Director (Admin CMS):** `jjebin05@gmail.com` / `BeyainAdmin#2026`
  - **Client Portal Demo:** `client@beyaincorp.local` / `ClientPortal#2026`
  - **Important:** Change default passwords or configure `.env` before exposing publicly.

- **Connecting Live Notion Databases:**
  1. Copy `.env.example` to `.env`:
     ```zsh
     cp .env.example .env
     ```
  2. Set a strong `SESSION_SECRET`:
     ```zsh
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
  3. Generate a password hash for your Notion Users DB or `ADMIN_PASSWORD_HASH`:
     ```zsh
     npm run hash-password -- "YourStrongPassword"
     ```
  4. Create an internal integration at `https://www.notion.so/my-integrations`, add `NOTION_TOKEN` and the 5 Database IDs (`NOTION_USERS_DB_ID`, `NOTION_SERVICES_DB_ID`, `NOTION_PORTFOLIO_DB_ID`, `NOTION_TICKETS_DB_ID`, `NOTION_INQUIRIES_DB_ID`) to `.env`, and share each database with your Notion integration.
  5. Restart `npm start`. The exact property names for all 5 Notion databases are documented inside the **Notion DB Setup** tab of `/portal.html`.
