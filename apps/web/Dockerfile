# Step 1: Build
FROM node:22-alpine3.20 AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Run
FROM node:22-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy standalone output + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Railway assigns PORT dynamically
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${PORT:-3000}/ || exit 1

CMD node server.js
