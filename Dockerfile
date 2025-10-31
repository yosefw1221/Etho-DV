# ------------------------------------------------------------
# Dockerfile for Etho-DV Next.js Application (Optimized)
# ------------------------------------------------------------

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (for caching)
COPY package.json ./
COPY package-lock.json ./

# Install ALL dependencies including devDependencies (needed for build)
# Using npm ci without --production flag to include devDependencies
RUN npm ci && \
    echo "✓ Dependencies installed. Verifying tailwindcss:" && \
    ls node_modules/tailwindcss/package.json && echo "✓ tailwindcss found"


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
# Dummy env vars for build - real ones injected at runtime
ENV MONGODB_URI=mongodb://dummy:27017/etho-dv
ENV NEXTAUTH_SECRET=build-time-dummy-secret-at-least-32-chars-long
ENV NEXTAUTH_URL=http://localhost:3000

# Build the application with verbose output
RUN set -x && npm run build


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

# Switch to non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]
