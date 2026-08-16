# syntax=docker/dockerfile:1
# Build context must be the repo root (dreamevents/).
# Northflank: Build Context = repo root, Dockerfile = backend/Dockerfile

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "server.js"]