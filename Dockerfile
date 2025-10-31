# ------------------------------------------------------------
# Dockerfile for Etho-DV Next.js Application (Optimized)
# ------------------------------------------------------------

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (for caching)
COPY package.json package-lock.json* yarn.lock* ./

# Install all dependencies (build + runtime)
RUN if [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile --network-timeout 100000; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi


# ------------------------------------------------------------
# Stage 2: Builder
# ------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Inline dummy env to satisfy env-dependent builds
RUN MONGODB_URI="mongodb://dummy:27017/etho-dv" npm run build


# ------------------------------------------------------------
# Stage 3: Runner (Production)
# ------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create uploads directory for runtime file storage
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

# Remove dev dependencies and clean cache
RUN npm prune --production && npm cache clean --force

# Switch to non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]
