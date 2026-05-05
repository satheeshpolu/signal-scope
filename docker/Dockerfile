# ── base: install deps only (layer-cached until package.json changes) ──────────
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── dev: source is bind-mounted at runtime via compose ─────────────────────────
FROM base AS dev
EXPOSE 5173

# ── build: bake source in, emit dist/ ──────────────────────────────────────────
FROM base AS build
COPY . .
RUN npm run build

# ── preview: nginx serves the built assets ─────────────────────────────────────
FROM nginx:1.27-alpine AS preview
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
