# Step 1: Build the app with Node 22 in a monorepo workspace
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only package manifests to leverage Docker layer caching
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install workspace deps (uses npm v10+ bundled with Node 22)
RUN npm ci

# Copy the rest of the repository
COPY . .

# Build only the web workspace
RUN npm run build -w apps/web

# Step 2: Run with standalone output on Node 22
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
WORKDIR /app

# Copy only the standalone server & static assets from the web workspace
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "apps/web/server.js"]