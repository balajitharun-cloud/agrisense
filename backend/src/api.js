// ---------------------------------------------------------------------------
// API application factory.
//
// One definition of the Express app, used by two hosts:
//   * server.js      - the long-running Node server (also serves the built SPA)
//   * api/index.js   - the Vercel serverless entry (API only; Vercel's CDN
//                      serves the frontend, and express.static() is ignored
//                      on Vercel by design)
//
// `serveFrontend: false` skips the static + SPA middleware and additionally
// mounts the router at the root, because a serverless rewrite may hand the
// function a path with the /api prefix already stripped.
// ---------------------------------------------------------------------------

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import router from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApiApp({ serveFrontend = true, logging = true } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '256kb' }));

  if (logging) {
    app.use((req, res, next) => {
      const t0 = Date.now();
      res.on('finish', () => {
        if (req.path.startsWith('/api') || req.path === '/health') {
          console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - t0}ms)`);
        }
      });
      next();
    });
  }

  app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // Canonical mount.
  app.use('/api', router);

  if (!serveFrontend) {
    // Serverless fallback mount: a rewrite like "/api/(.*) -> /api" can present
    // the path as "/meta" instead of "/api/meta". Mounting at the root too
    // means routing works either way, with no path-normalising hacks.
    app.use('/', router);
  } else {
    // Serve the built frontend (long-running server / Docker only).
    const dist = path.resolve(__dirname, '../../frontend/dist');
    app.use(express.static(dist));
    app.get(/^(?!\/api).*/, (req, res, next) => {
      res.sendFile(path.join(dist, 'index.html'), (err) => (err ? next() : undefined));
    });
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  });

  return app;
}

export default createApiApp;
