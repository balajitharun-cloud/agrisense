// ---------------------------------------------------------------------------
// AgriSense API server entrypoint.
// ---------------------------------------------------------------------------

import app from './app.js';

const PORT = process.env.PORT || 8787;

const server = app.listen(PORT, () => {
  console.log(`\n  AgriSense API listening on http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`  Meta:    http://localhost:${PORT}/api/meta\n`);
});

// Turn the two errors people actually hit into actionable messages instead of
// a raw stack trace.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.`);
    console.error(`  Either stop the other process, or pick another port:`);
    console.error(`    - create backend/.env containing  PORT=8788`);
    console.error(`    - or run:  PORT=8788 npm start   (PowerShell: $env:PORT=8788; npm start)\n`);
    process.exit(1);
  }
  if (err.code === 'EACCES') {
    console.error(`\n  Not allowed to bind port ${PORT}. Try a port above 1024, e.g. PORT=8787.\n`);
    process.exit(1);
  }
  throw err;
});
