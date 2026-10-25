// ---------------------------------------------------------------------------
// Express app (no listen) - importable for tests; server.js binds the port.
// The actual app definition lives in api.js so the Vercel serverless entry
// can reuse it.
// ---------------------------------------------------------------------------

import 'dotenv/config';
import { createApiApp } from './api.js';

export const app = createApiApp({ serveFrontend: true });
export default app;
