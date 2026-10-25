// ---------------------------------------------------------------------------
// AgriSense API server entrypoint.
// ---------------------------------------------------------------------------

import app from './app.js';

const PORT = process.env.PORT || 8787;

app.listen(PORT, () => {
  console.log(`\n  AgriSense API listening on http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`  Meta:    http://localhost:${PORT}/api/meta\n`);
});
