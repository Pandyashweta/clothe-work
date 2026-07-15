##############################################################################
# Dockerfile — Hardened Node.js API Container
# Base: node:20-alpine (minimal attack surface)
##############################################################################

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with locked versions
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ── Final image ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: Update base packages
RUN apk update && apk upgrade --no-cache && apk add --no-cache wget

# Security: Create non-root user
RUN addgroup -g 1001 -S ohpolly && adduser -u 1001 -S ohpolly -G ohpolly

WORKDIR /app

# Copy only production files
COPY --from=builder --chown=ohpolly:ohpolly /app/node_modules ./node_modules
COPY --chown=ohpolly:ohpolly server.js   .
COPY --chown=ohpolly:ohpolly package.json .

# Security: Create logs directory with correct ownership
RUN mkdir -p /app/logs && chown -R ohpolly:ohpolly /app/logs

# Switch to non-root user
USER ohpolly

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
