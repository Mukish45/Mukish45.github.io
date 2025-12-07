---
title: Docker Best Practices
category: DevOps
date: 2025-12-07
readTime: 10 min read
description: A production-ready guide to building efficient, secure, and maintainable Docker containers.
---

# Docker Best Practices

**Production-Ready Guide**

---

## 🏗️ 1. Efficiency: Building Faster & Smaller

Optimizing Docker images isn't just about disk space; it's about deployment speed and attack surface reduction.

### The Layer Cake Strategy

Docker caches layers. If a layer changes, all subsequent layers must be rebuilt. The key is to order your commands from least-frequently-changed to most-frequently-changed.

#### ❌ Bad: The Slow Way
Copying source code first invalidates the cache every time you edit a single file, forcing `npm install` to re-run needlessly.

1. `COPY . .`
2. `RUN npm install`
3. (Edit app.js)
4. 💥 Cache invalidated
5. 🐌 Re-run 1 & 2

#### ✅ Good: The Fast Way
Copying only `package.json` first ensures `npm install` only re-runs when your dependencies *actually* change.

1. `COPY package*.json .`
2. `RUN npm install`
3. `COPY . .`
4. (Edit app.js)
5. ✅ 1 & 2 are CACHED
6. 🚀 Only re-run 3

### Base Image Strategy

Choosing the right starting point matters. Avoid generic tags like `node:latest`. They are huge (1GB+) and change unexpectedly.

| Image Tag          | Size (Approx) | Use Case                                         |
| :----------------- | :------------ | :----------------------------------------------- |
| `node:latest`      | ~1 GB         | Dev only. Contains everything.                   |
| `node:18-slim`     | ~200 MB       | Production. Minimal OS packages.                 |
| `node:18-alpine`   | ~50 MB        | Extreme optimization (Warning: uses musl libc).  |

### Multi-Stage Builds

Don't ship your build tools (compilers, git, dev dependencies) to production. Use a **Builder** stage to create artifacts, and copy only what you need to a clean, lightweight **Runner** image.

```dockerfile
# --- Stage 1: The Builder ---
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Copy dependency definitions first (Cached!)
COPY package*.json .

# 2. Install dependencies (including devDependencies for building)
RUN npm ci

# 3. Copy source code last
COPY . .

# 4. Build the app (if using TypeScript/React etc)
RUN npm run build

# --- Stage 2: The Production Image ---
FROM node:18-alpine
WORKDIR /app

# Copy ONLY the production node_modules and built code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
```

### The .dockerignore File

Always include a `.dockerignore` file. This prevents local junk (like your node_modules folder, .git history, or .env files) from being sent to the Docker daemon.

```dockerfile
node_modules
.git
.env
npm-debug.log
Dockerfile
.dockerignore
```

### 🛡️ 2. Security: Locking It Down

By default, Docker containers run as root. This is a major security risk.

#### The "Root" Problem & Solution
**The Golden Rule:** Always create a dedicated, non-root system user for your application and switch to it using the `USER` instruction in your Dockerfile.

#### The Port Rule & Mapping
Non-root users cannot bind to "privileged" ports (any port below 1024). The standard practice is:
- Your application listens on a high port (e.g., 3000) inside the container.
- Docker maps a privileged port (e.g., 80) on the outside (host) to your application's high port.

**Flow:** `INTERNET (User Request Target: Port 80)` ➔ `HOST MACHINE (Docker Daemon -p 80:3000)` ➔ `CONTAINER (Node App USER: appuser PORT: 3000)`

### Secure Dockerfile Snippet

```dockerfile
FROM node:18-slim

# 1. Create a system group and user (-r flag)
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
COPY . .

# 2. Fix permissions so appuser owns the files
RUN chown -R appuser:appuser /app

# 3. Switch context (Drop root privileges)
USER appuser

# 4. Expose high port (internal only)
EXPOSE 3000

CMD ["node", "index.js"]
```

### Secrets: The Anti-Pattern

⚠️ **Never bake secrets into the image.**
Do NOT put `ENV API_KEY=12345` in your Dockerfile. Anyone who pulls the image can see it.

Instead, inject them at runtime:
```bash
docker run --env-file .env my-app
```

### 🏃 3. Runtime: Philosophy & Orchestration

#### "One Process Per Container"
Never bundle your Database and API in the same container. Why? If the API process crashes but the Database process keeps running, Docker will think the container is still healthy.

- **Monolithic Container:** Hard to scale, hard to debug, breaks self-healing. (Container contains API (Crashed) and DB (Running))
- **Decoupled Containers:** If the API crashes, Docker restarts just that container.

#### Healthchecks (Self-Healing)
Docker needs to know if your app is ready to receive traffic. A process can be "running" (PID exists) but "deadlocked" (stuck). Add a healthcheck:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

#### Resource Limits (Production Critical)
Without limits, one memory-leaking container can crash your entire server. Always set limits in your `docker-compose.yml`.

```yaml
version: '3.8'
services:
  api:
    build: .
    deploy:
      resources:
        limits:
          cpus: '0.50'    # Use max 50% of 1 CPU Core
          memory: 512M    # Hard limit
    ports:
      - "80:3000"
    depends_on:
      - db

  db:
    image: mongo:5.0
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### ⚡️ Cheat Sheet

Quick reference for the commands used in this guide.

| Action | Command |
| :--- | :--- |
| **Build Image** | `docker build -t my-app .` |
| **Run (Secure Port)** | `docker run -p 80:3000 my-app` |
| **Run (With Env File)** | `docker run --env-file .env my-app` |
| **Compose Start (Detach)** | `docker compose up -d` |
| **Compose Logs** | `docker compose logs -f` |
| **Check Resource Usage** | `docker stats` |
| **Clean up Unused** | `docker system prune -a` |