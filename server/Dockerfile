# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build tools needed by bcrypt (native C++ module)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Strip dev dependencies so only production deps are copied
RUN npm prune --omit=dev

# ── Stage 2: production image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy pre-compiled node_modules (native binaries already built for musl/alpine)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY package.json ./

# Cloud Run injects PORT (default 8080)
EXPOSE 8080

CMD ["node", "dist/main.js"]
