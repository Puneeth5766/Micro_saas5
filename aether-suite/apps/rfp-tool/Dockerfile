FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json turbo.json tsconfig.base.json ./
COPY apps/rfp-tool/package.json ./apps/rfp-tool/package.json
COPY shared/ui/package.json ./shared/ui/package.json
COPY shared/auth/package.json ./shared/auth/package.json
COPY shared/ai/package.json ./shared/ai/package.json
COPY shared/billing/package.json ./shared/billing/package.json
COPY shared/analytics/package.json ./shared/analytics/package.json
COPY shared/db/package.json ./shared/db/package.json
COPY shared/config/package.json ./shared/config/package.json
RUN pnpm install --no-frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm --filter @aether/rfp-tool build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/rfp-tool/.next /app/apps/rfp-tool/.next
COPY --from=builder /app/apps/rfp-tool/public /app/apps/rfp-tool/public
COPY --from=builder /app/apps/rfp-tool/package.json /app/apps/rfp-tool/package.json
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app/apps/rfp-tool
EXPOSE 3000
CMD ["pnpm", "start"]
