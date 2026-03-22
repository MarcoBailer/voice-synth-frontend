## ==================================================================
## MULTI-STAGE DOCKERFILE - Voice Synth Frontend (Next.js 16)
## ==================================================================

# ── Stage 1: Dependencies ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time variables (baked into JS bundle)
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_VOICE_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL \
    NEXT_PUBLIC_VOICE_API_URL=$NEXT_PUBLIC_VOICE_API_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/voice-app || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
