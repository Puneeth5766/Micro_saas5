# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /workspace
RUN corepack enable

# App selector passed at build time, e.g. --build-arg APP_NAME=rfp-tool
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Copy workspace manifests first for optimal dependency layer caching
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/${APP_NAME}/package.json ./apps/${APP_NAME}/package.json
COPY shared/ai/package.json ./shared/ai/package.json
COPY shared/analytics/package.json ./shared/analytics/package.json
COPY shared/auth/package.json ./shared/auth/package.json
COPY shared/billing/package.json ./shared/billing/package.json
COPY shared/config/package.json ./shared/config/package.json
COPY shared/db/package.json ./shared/db/package.json
COPY shared/ui/package.json ./shared/ui/package.json

RUN pnpm install --no-frozen-lockfile

FROM deps AS builder
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Copy only the selected app and required shared packages for build
COPY apps/${APP_NAME} ./apps/${APP_NAME}
COPY shared ./shared

RUN pnpm --filter @aether/${APP_NAME} build

FROM node:20-alpine AS runner
WORKDIR /workspace
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN corepack enable

ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
ENV PORT=3000

# Runtime assets for selected Next.js app
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/package.json
COPY --from=builder /workspace/apps/${APP_NAME}/.next ./apps/${APP_NAME}/.next
COPY --from=builder /workspace/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=builder /workspace/apps/${APP_NAME}/next.config.ts ./apps/${APP_NAME}/next.config.ts

USER appuser
WORKDIR /workspace/apps/${APP_NAME}

# Port is controlled with PORT env var (set by compose or runtime)
EXPOSE 3000

CMD ["sh", "-c", "pnpm start --port ${PORT}"]
