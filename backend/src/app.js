// ---------------------------------------------------------------------------
// Express app (no listen) - importable for tests; server.js binds the port.
// ---------------------------------------------------------------------------

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import router from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();

app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - t0}ms)`);
    }
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api', router);

// Serve the built frontend if present (production single-service deploy).
const dist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => (err ? next() : undefined));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

export default app;
