FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --no-frozen-lockfile

# Build shared package first
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @smsflow/shared build

# Build API
COPY apps/api/ ./apps/api/
RUN cd apps/api && npx prisma generate --schema=src/prisma/schema.prisma
RUN pnpm --filter @smsflow/api run build

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/src/prisma/schema.prisma ./apps/api/prisma/schema.prisma

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --schema=prisma/schema.prisma --skip-generate 2>&1 && node dist/main"]
