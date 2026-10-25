# AgriSense — Real-Time Agriculture Monitoring System

A full-stack farm intelligence platform: live sensor telemetry (temperature, humidity,
soil moisture, NPK), weather, satellite soil indices, region-aware crop advice,
plant-protection guidance with chemical formulas, a marketplace, government
advisories, voice output and 10 Indian languages — in light and dark themes.

```
React + Vite  →  frontend/      (UI, i18n, charts, voice)
Node + Express →  backend/       (API, mock datasets, service layer)
```

---

## 1. Quick start

Two terminals, or use the single-service production mode.

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # optional — everything works without keys
npm start                 # http://localhost:8787
```

**Frontend (dev)**
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173  (proxies /api to :8787)
```

**Production (one service, one port)**
```bash
cd frontend && npm run build      # outputs frontend/dist
cd ../backend && npm start        # Express serves the built app + the API on :8787
```

Open http://localhost:8787 (production) or http://localhost:5173 (dev).

Demo login: **demo@agrisense.in** / **demo1234** (or click *Use demo account*).

---

## 2. Features and where they live

| # | Feature | Where |
|---|---------|-------|
| 1 | **Voice (ElevenLabs)** | `backend/src/services/voice.js`, `frontend/src/components/VoiceButton.jsx`, `frontend/src/lib/api.js` (`speak`) |
| 2 | **Marketplace** | `backend/src/data/marketplace.js`, `routes/index.js` (`/marketplace/*`), `pages/Marketplace.jsx` |
| 3 | **Intentional UI** (not template-y) | `frontend/src/styles/global.css` — Fraunces + Inter + JetBrains Mono, editorial/field-ledger look |
| 4 | **Multilingual** | `frontend/src/i18n/strings.js` (10 languages), `backend/src/services/translate.js` (dynamic content) |
| 5 | **Light / dark mode** | `global.css` (`[data-theme]` tokens), toggle in `components/Layout.jsx` |
| 6 | **Region-wise crop recommendations** | `backend/src/data/regions.js` (`recommendCrops`), `pages/Crops.jsx` |
| 7 | **Pesticide suggestions + chemical formulas, multilingual** | `backend/src/data/pesticides.js`, `pages/Protection.jsx` |
| 8 | **Account section** | `backend/src/services/account.js` (scrypt + tokens), `pages/Account.jsx` |
| 9 | **Satellite soil + weather suggestion** | `backend/src/services/satellite.js`, `services/weather.js`, `pages/Satellite.jsx`, `pages/Weather.jsx` |
| 10 | **Gov announcements/updates** | `backend/src/data/gov.js`, `pages/Gov.jsx` |

---

## 3. What is live vs simulated

The API is built so **every integration degrades gracefully** and the response
carries a `source` field the UI displays as a *Live* / *Simulated* badge.

| Data | Default (no keys) | Live when you add |
|------|-------------------|-------------------|
| Weather | **Open-Meteo, live** (no key needed) | `OPENWEATHER_API_KEY` to switch provider |
| Sensors (temp, humidity, soil, NPK) | Diurnal simulation | point `services/sensors.js` → your IoT gateway |
| Satellite soil / NDVI | Seeded simulation | `SENTINEL_HUB_CLIENT_ID` / `_SECRET` |
| Marketplace listings & mandi prices | Curated mock catalogue | `MARKETPLACE_API_BASE` / `_KEY` |
| Gov announcements | Curated mock feed | `GOV_FEED_URL` |
| Voice | **Browser Web Speech fallback** | `ELEVENLABS_API_KEY` for ElevenLabs |
| Translation | Curated phrase dictionary | `TRANSLATE_API_KEY` (e.g. Bhashini) |

All keys live in `backend/.env` (see `.env.example`). No key is required to run.

---

## 4. Enabling ElevenLabs voice

1. Get a key at elevenlabs.io → Profile → API key.
2. In `backend/.env`:
   ```
   ELEVENLABS_API_KEY=sk_...
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
   ELEVENLABS_MODEL=eleven_multilingual_v2
   ```
3. Restart the backend. Every **Listen** button now streams ElevenLabs audio;
   without a key it silently uses the device voice, so nothing breaks.

The backend proxies the request (the key never reaches the browser) and returns
`audio/mpeg`.

---

## 5. API reference (all under `/api`)

```
GET  /meta                              app info, languages, integration status
GET  /regions                           states + districts + agro-zones
GET  /regions/:regionId/districts
GET  /crops/recommend?regionId&districtId&season&water&lang
GET  /pests?lang
GET  /pesticides?pestId&cropId&lang     chemical formula, dosage, PHI, safety
GET  /pesticides/:id
GET  /sensors/nodes
GET  /sensors/:nodeId?lang              live readings + alerts
GET  /sensors/:nodeId/history?points
GET  /weather?regionId&districtId&lang  current + 7-day + agronomy tips
GET  /satellite/soil?regionId&districtId&lang
GET  /marketplace/listings?category&crop&q&lang
GET  /marketplace/prices?lang
GET  /gov/announcements?region&category&level&lang
GET  /voice/status
POST /voice/tts                         { text } -> audio/mpeg (501 if no key)
POST /translate                         { text, lang }
POST /auth/register | /auth/login | /auth/logout
GET  /account/me
PATCH /account/me
POST /account/farms
```

Run the endpoint smoke test:
```bash
cd backend && npm run smoke      # 27 checks across every route
```

---

## 6. Design notes

The UI deliberately avoids the default "AI-generated" look: a warm parchment /
deep-forest palette, a serif display face (Fraunces) against Inter and monospace
numerals, hairline rules, and data-dense layouts instead of glassy gradient cards.
Everything is driven by CSS custom properties, so retheming is a token change.

`frontend/src/styles/global.css` holds the whole design system; the two theme
blocks at the top are the only place colours are defined.

---

## 7. Project layout

```
agrisense/
├── backend/
│   ├── src/
│   │   ├── server.js          # entrypoint (listens)
│   │   ├── app.js             # express app (importable for tests)
│   │   ├── routes/index.js    # all API routes
│   │   ├── services/          # sensors, weather, satellite, voice, translate, account, http
│   │   └── data/              # regions, pesticides, marketplace, gov
│   ├── scripts/smoke.mjs      # endpoint smoke test
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/        # Layout, ui primitives, Sparkline, VoiceButton
    │   ├── pages/             # Dashboard, Sensors, Weather, Satellite, Crops,
    │   │                      # Protection, Marketplace, Gov, Account
    │   ├── context/           # theme, language, region, auth, toasts
    │   ├── i18n/strings.js    # 10-language UI dictionary
    │   ├── lib/               # api client, hooks
    │   └── styles/global.css  # design system
    └── vite.config.js
```

---

## 8. Safety note

Pesticide guidance is **decision-support only**. Dosages, pre-harvest intervals
and toxicity classes must be verified against the current CIB&RC label and a
licensed agronomist before any use. The app shows this disclaimer in the UI.

---

## 9. Deployment

### Container (single service, one port)

The `Dockerfile` builds the frontend, then runs the Express backend serving
that build — one image, port `8787`.

```bash
docker build -t agrisense .
docker run -p 8787:8787 \
  -e ELEVENLABS_API_KEY=sk_... \
  agrisense
# open http://localhost:8787
```

### GitHub Actions

Two workflows ship in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | push / PR to `main` | Installs backend, runs the **27-check endpoint smoke test**; installs frontend and builds it; uploads `dist` as an artifact |
| `deploy.yml` | push to `main` (backend/frontend/Dockerfile paths) or manual | Builds the image and publishes it to **GitHub Container Registry** as `ghcr.io/<owner>/agrisense:latest` and `:sha-<short>` |

To pull and run the published image on any container host:

```bash
echo $GHCR_TOKEN | docker login ghcr.io -u <username> --password-stdin
docker run -p 8787:8787 ghcr.io/balajitharun-cloud/agrisense:latest
```

**Automatic redeploy on a host:** create a Render "Deploy Hook" for a Web
Service, then add it as a repository secret named `RENDER_DEPLOY_HOOK`. The
`deploy.yml` workflow pings it after each successful image push. Any other host
(Fly.io, Railway, a VPS) can simply pull the same image.

> **GitHub Pages will not work for this app.** Pages serves static files only,
> and AgriSense needs the Express backend for sensors, weather, the voice proxy
> and accounts. Hosting the frontend on Pages alone gives you a UI with no
> working API.

### Local checks

```bash
cd backend  && npm run smoke         # 27 API route checks
cd frontend && npm run check:render  # server-renders all 9 routes, catches runtime errors
```

---

## 10. Deploying to Vercel

### Import the repo

1. Go to **vercel.com/new** and import `balajitharun-cloud/agrisense`.
2. Leave Framework Preset / Build / Output on their defaults — `vercel.json` pins
   everything (`vite`, `frontend/dist`, the API function).
3. Add environment variables (Project → Settings → Environment Variables) if you
   want live integrations: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, etc.
   Weather works with no keys at all.
4. Deploy. Every push to `main` then redeploys automatically.

### How it is wired

Vercel is serverless, so the Express server cannot run as a long-lived process.
The repo is set up for it:

| Piece | File | Notes |
|-------|------|-------|
| API function | `api/index.js` | Vercel turns this into one Node function; it re-exports the same Express app the normal server uses |
| Shared app | `backend/src/api.js` | `createApiApp({ serveFrontend })` — one definition, two hosts |
| Routing | `vercel.json` | `/api/*` and `/health` → the function; everything else → `/index.html` (SPA deep links) |
| Frontend | `frontend/dist` | Built by `buildCommand`, served from Vercel's CDN |

Because a rewrite can present the path with or without the `/api` prefix, the
function mounts the router at **both** `/api` and `/`, so routing works either
way. Verified locally: `/api/meta`, `/meta`, `/api/regions`, `/regions`, a real
`POST /api/auth/register`, and a 404 that leaves the function healthy.

Note that Vercel **ignores `express.static()`** by design — that is why the
function sets `serveFrontend: false` and the SPA is served from the CDN instead.

### Serverless limitations — read this

- **Accounts are not durable.** `backend/src/services/account.js` keeps users in
  memory, and on Vercel each function instance has its own memory. Registration
  and login will appear to work inside a warm instance but will not persist
  reliably. Swap the `Map` for a real database (Postgres, Upstash Redis, Mongo)
  before using accounts in production. Everything else — sensors, weather,
  satellite, crops, pesticides, marketplace, gov — is stateless and fine.
- **Cold starts.** The first request after idle takes a moment; the
  `maxDuration: 30` in `vercel.json` is generous for these endpoints.
- **Voice** falls back to the browser's Web Speech engine unless
  `ELEVENLABS_API_KEY` is set in the Vercel dashboard.

### Alternative: two projects

For a cleaner production split (and better isolation), create two Vercel
projects from the same repo:

- **Frontend** — Root Directory `frontend`, framework Vite, plus a rewrite of
  `/(.*)` → `/index.html` for SPA deep links.
- **Backend** — Root Directory `backend`. Vercel auto-detects Express from
  `backend/src/app.js` and runs it as a function, no rewrites needed.

Then point the frontend at the backend's URL via a `VITE_API_BASE` environment
variable. The single-project setup above is the one wired up by default.
