# syntax=docker/dockerfile:1
# FaithfulC Recipe Box — single container: Express API (server/) serves the
# compiled Angular SPA (web/frontend/) on port 8080.

# --- Stage 1: build the Angular SPA -----------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY web/frontend/package*.json ./
RUN npm ci
COPY web/frontend/ .
# Produces dist/frontend/ (angular.json sets browser output dir to "").
RUN npm run build

# --- Stage 2: build the Express server --------------------------------------
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
# Compiles TypeScript to dist/.
RUN npm run build

# --- Stage 3: runtime -------------------------------------------------------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

# Server production dependencies only.
COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled server.
COPY --from=server-build /app/server/dist ./dist
# Compiled SPA served as static files. STATIC_DIR defaults to <dist>/../public.
COPY --from=frontend /app/frontend/dist/frontend ./public

EXPOSE 8080
CMD ["node", "dist/index.js"]
