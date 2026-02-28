# Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 10+
- MongoDB 7+ (managed or self-hosted)
- Stripe account with webhook endpoint
- NextAuth secret and canonical app URL

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set production-grade values for:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `OPENAI_API_KEY`

## Build and quality gates

```bash
pnpm install
pnpm lint
pnpm type-check
pnpm build
```

## Docker compose deployment

```bash
docker compose up --build -d
```

This starts MongoDB and the `rfp-tool` app service on port `3000`.

## Scaling strategy

- Deploy each app independently with environment-specific `NEXTAUTH_URL`.
- Use shared package versioning from the monorepo to keep platform features consistent.
- Enable MongoDB Atlas replica sets for high availability.
- Route Stripe webhooks through a dedicated endpoint behind retry-aware handlers.
