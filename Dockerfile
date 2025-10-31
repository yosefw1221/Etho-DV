# ------------------------------------------------------------
# Dockerfile for Etho-DV Next.js Application (Optimized)
# ------------------------------------------------------------

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (for caching)
COPY package.json ./
COPY yarn.lock ./

# Install ALL dependencies including devDependencies (needed for build)
# Use --production=false to ensure devDependencies are installed
RUN yarn install --frozen-lockfile --production=false && \
    echo "✓ Dependencies installed. Listing build tools:" && \
    ls node_modules | grep -E "tailwind|postcss|autoprefixer" || echo "Note: Some build tools may not be visible yet"


# ------------------------------------------------------------
# Stage 2: Builder
# ------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Verify critical build dependencies are present
RUN echo "Verifying build dependencies..." && \
    test -d node_modules/tailwindcss || (echo "ERROR: tailwindcss not found!" && exit 1) && \
    test -d node_modules/postcss || (echo "ERROR: postcss not found!" && exit 1) && \
    echo "✓ All build dependencies verified"

# Build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Environment variables are injected by Coolify at build time
# No need for dummy values - Coolify provides real ones via build args

# Build the application
RUN npm run build


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

# Create environment check script (before switching to non-root user)
RUN echo '#!/bin/sh' > /app/check-env.sh && \
    echo 'echo "=== Environment Check ==="' >> /app/check-env.sh && \
    echo 'if [ -z "$MONGODB_URI" ]; then echo "❌ MONGODB_URI not set"; else echo "✓ MONGODB_URI is set"; fi' >> /app/check-env.sh && \
    echo 'if [ -z "$NEXTAUTH_SECRET" ]; then echo "❌ NEXTAUTH_SECRET not set"; else echo "✓ NEXTAUTH_SECRET is set"; fi' >> /app/check-env.sh && \
    echo 'if [ -z "$NEXTAUTH_URL" ]; then echo "❌ NEXTAUTH_URL not set"; else echo "✓ NEXTAUTH_URL is set"; fi' >> /app/check-env.sh && \
    echo 'echo "========================="' >> /app/check-env.sh && \
    echo 'exec node server.js' >> /app/check-env.sh && \
    chmod +x /app/check-env.sh && \
    chown nextjs:nodejs /app/check-env.sh

# Switch to non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Start the Next.js server with environment check
CMD ["/app/check-env.sh"]
