# AMBRIA हाज़िरी — Multi-Department Attendance PWA

> Phase 1A: Zero-cost attendance system for AMBRIA Group's 150+ production workers across 9 departments + Site Operations.

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_ORG/ambria-attendance.git
cd ambria-attendance

# Install build tools
npm install

# Run local dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build
# → outputs to dist/
```

## Project Structure

```
ambria-attendance/
├── .github/workflows/
│   ├── deploy.yml          # Auto-deploy to GitHub Pages on push to main
│   └── cron.yml            # Daily summary (9 PM IST) + weekly health check
├── src/
│   ├── index.html          # App shell
│   ├── manifest.json       # PWA manifest (Hindi + English)
│   ├── robots.txt
│   ├── css/styles.css      # Mobile-first, day/night themes
│   ├── js/
│   │   ├── app.js          # Main app logic + rendering
│   │   ├── i18n.js         # Bilingual Hindi/English strings
│   │   ├── data.js         # Departments, workers, approvers
│   │   └── supabase.js     # Database client (Week 2)
│   └── icons/              # PWA icons
├── scripts/
│   ├── build.mjs           # Copy src → dist + generate service worker
│   ├── dev-server.mjs      # Local dev server
│   ├── daily-summary.mjs   # Cron: 9 PM attendance report
│   └── health-check.mjs    # Cron: weekly usage check
├── lighthouse-budget.json   # Performance budget
└── package.json
```

## CI/CD Pipeline (GitHub Actions)

### Auto-Deploy (on every push to `main`)
1. Installs dependencies
2. Runs build (copies src → dist, generates Workbox service worker)
3. Checks bundle size (must be <150KB gzipped)
4. Deploys to GitHub Pages
5. Runs Lighthouse audit

### Cron Jobs
- **Daily 9 PM IST**: Compiles attendance summary, sends push notifications
- **Weekly Sunday**: Health check on Supabase usage

### Required Secrets (add in GitHub repo → Settings → Secrets)
```
SUPABASE_URL          → from Supabase dashboard
SUPABASE_SERVICE_KEY  → from Supabase dashboard (service_role key, server-side only)
```

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Vanilla HTML/CSS/JS (ES Modules) | Free |
| Hosting | GitHub Pages | Free |
| Database | Supabase PostgreSQL (free tier) | Free |
| Auth | 4-digit PIN + Supabase Anonymous Auth | Free |
| Realtime | Supabase Realtime | Free |
| Push | Web Push API + VAPID | Free |
| CI/CD | GitHub Actions | Free |
| **Total** | | **₹0/month** |

## Build Phases

- [x] **Week 1**: Scaffold + GitHub Pages + CI/CD pipeline
- [ ] **Week 2**: Supabase integration (database, auth, realtime sync)
- [ ] **Week 3**: Push notifications + admin panel
- [ ] **Week 4**: Real worker data + pilot launch (32 Light Dept workers)
- [ ] **Month 2**: Multi-department rollout + owner dashboard
- [ ] **Month 3+**: Video auto-attendance + GPS geofencing

## Key Constraints

- **Zero recurring cost** — no subscriptions, no paid APIs, no credit cards
- **Bundle < 150KB** gzipped total
- **Lighthouse PWA ≥ 90**
- **Offline-first** — works at outdoor event sites with no signal
- **Hindi-first** — Devanagari UI with English toggle
- **Mobile-first** — 95% users on Android, low-end devices

## License

Private — AMBRIA Group internal use only.
