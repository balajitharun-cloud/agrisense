# ---------------------------------------------------------------------------
# AgriSense - single-service container.
# Stage 1 builds the React frontend; stage 2 runs the Express backend which
# also serves the built frontend. Result: one image, one port (8787).
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# src/lib/staticApi.js imports the backend's pure data/service modules (used by
# the GitHub Pages static build). They must exist at /app/backend/src for
# Rollup to resolve them, even though this image runs the real API.
COPY backend/src /app/backend/src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
# app.js resolves ../../frontend/dist relative to backend/src
COPY --from=frontend /app/frontend/dist /app/frontend/dist
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
