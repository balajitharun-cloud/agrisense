// ---------------------------------------------------------------------------
// Vercel serverless entry point.
//
// Vercel turns this file into a single Node function and routes /api/* to it
// (see the rewrites in vercel.json). It reuses the exact same Express app as
// the normal server, so there is no duplicated route logic.
//
// The frontend is served separately from Vercel's CDN via `outputDirectory`,
// which is why `serveFrontend` is false here - express.static() is ignored on
// Vercel by design.
// ---------------------------------------------------------------------------

import { createApiApp } from '../backend/src/api.js';

export default createApiApp({ serveFrontend: false, logging: false });
