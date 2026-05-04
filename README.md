# signal-scope

A financial timeseries inspection tool built with React 19, TypeScript, and ECharts.

---

## Local development (no Docker)

**Prerequisites:** Node 22+

```sh
# Install dependencies
npm install

# Start dev server — http://localhost:5173
npm run dev

# Run tests
npm test

# Lint + type-check
npm run lint
npx tsc --noEmit

# Production build
npm run build
```

---

## Docker

**Prerequisites:** Docker Desktop

### Using `just` (recommended)

```sh
# Install just (macOS)
brew install just

# List all available recipes
just

# Start dev server with HMR — http://localhost:5173
just dev

# Run tests inside container
just test

# Lint + type-check inside container
just lint

# Run tests + lint
just check

# Build production assets
just build

# Serve production build via nginx — http://localhost:8080
just preview
```

### Using `docker compose` directly

```sh
# Dev server — http://localhost:5173
docker compose up app

# Rebuild and start dev server
docker compose up --build app

# Run tests
docker compose run --rm app npm test -- --run

# Drop into a shell inside the container
docker compose run --rm app sh

# Production build + nginx preview — http://localhost:8080
docker compose up --build preview

# Stop all services
docker compose down

# Stop and remove volumes (wipes node_modules volume)
docker compose down -v
```

### First-time Docker setup

The `package-lock.json` must be in sync with `package.json` for `npm ci` to succeed inside the container. If you see an `EUSAGE` error from `npm ci`, regenerate the lockfile using the exact Node version the container uses:

```sh
docker compose run --rm --no-deps app npm install
docker compose build --no-cache app
```
