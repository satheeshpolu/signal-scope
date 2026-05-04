# signal-scope task runner
# Install: brew install just
# Usage: just <recipe>

# List available recipes
default:
    @just --list

# ── dev ────────────────────────────────────────────────────────────────────────
# Start Vite dev server with HMR on http://localhost:5173
dev:
    docker compose up app

# ── test ───────────────────────────────────────────────────────────────────────
# Vitest single pass + coverage
test:
    docker compose run --rm app npm test -- --run --coverage

# ── lint ───────────────────────────────────────────────────────────────────────
# ESLint + TypeScript type-check (no emit)
lint:
    docker compose run --rm app sh -c "npm run lint && npx tsc --noEmit"

# ── check ──────────────────────────────────────────────────────────────────────
# Test + lint sequentially
check: test lint

# ── build ──────────────────────────────────────────────────────────────────────
# Produce dist/ via the build stage (output lands on host via volume mount)
build:
    docker compose run --rm app npm run build

# ── preview ────────────────────────────────────────────────────────────────────
# Serve the built dist/ via nginx on http://localhost:8080
# Rebuilds the preview image automatically
preview:
    docker compose up --build preview

# ── e2e ────────────────────────────────────────────────────────────────────────
# (Task 6) Run Playwright against the web service
e2e:
    docker compose run --rm app npx playwright test
