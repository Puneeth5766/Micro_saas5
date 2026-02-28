# Aether AI Business Suite

**Aether AI Business Suite — 5 production-grade AI micro-SaaS tools in one monorepo**

## Products

| Name | Slug | Port | Description |
| --- | --- | ---: | --- |
| RFP Tool | `rfp-tool` | 3001 | AI-assisted RFP drafting, response optimization, and submission workflows. |
| Compliance Tool | `compliance-tool` | 3002 | Policy and control validation with compliance evidence and risk checks. |
| Market Analyzer | `market-analyzer` | 3003 | Competitive and market signal analysis with AI-assisted research summaries. |
| Proposal Optimizer | `proposal-optimizer` | 3004 | Proposal quality scoring, rewrite guidance, and conversion-focused optimization. |
| Landing Critic | `landing-critic` | 3005 | Landing-page critique engine for messaging, UX, and conversion improvements. |

## Tech Stack

| Category | Technology |
| --- | --- |
| Monorepo orchestration | Turborepo |
| Package manager | pnpm workspaces |
| Frontend framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Backend runtime | Node.js |
| API/server framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | NextAuth v5 |
| Billing | Stripe |
| Containers | Docker / Docker Compose |

## Monorepo Structure

```text
aether-suite/
├── apps/
│   ├── rfp-tool/
│   ├── compliance-tool/
│   ├── market-analyzer/
│   ├── proposal-optimizer/
│   └── landing-critic/
├── shared/
│   ├── ui/
│   ├── auth/
│   ├── ai/
│   ├── billing/
│   ├── analytics/
│   ├── db/
│   └── config/
├── docs/
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .env.example
```

## Prerequisites

- Node.js 20+
- Docker (with Docker Compose)
- pnpm

## Local Setup

1. Clone the repository:

```bash
git clone <your-repository-url>
cd aether-suite
```

2. Create your local environment file and populate required values:

```bash
cp .env.example .env
```

3. Install workspace dependencies:

```bash
pnpm install
```

4. Start local infrastructure services:

```bash
docker-compose up -d
```

5. Start all apps in development mode via Turborepo:

```bash
pnpm dev
```

## Shared Packages

| Package | Purpose |
| --- | --- |
| `@aether/ui` | Reusable UI primitives and shared React components. |
| `@aether/auth` | Centralized NextAuth v5 auth configuration and helpers. |
| `@aether/ai` | AI provider abstraction and prompt/response utility layer. |
| `@aether/billing` | Stripe billing logic, checkout integration, and subscription helpers. |
| `@aether/analytics` | Event tracking and analytics instrumentation APIs. |
| `@aether/db` | MongoDB connection management and shared Mongoose models. |
| `@aether/config` | Environment schema validation and platform constants. |

## Environment Variables Reference

| Variable | Required | Description |
| --- | :---: | --- |
| `NODE_ENV` | Yes | Runtime mode (`development`, `production`, or `test`). |
| `MONGODB_URI` | Yes | MongoDB connection URI used by shared DB package. |
| `NEXTAUTH_SECRET` | Yes | Secret used by NextAuth to sign and verify session tokens. |
| `NEXTAUTH_URL` | Yes | Canonical auth callback/base URL for NextAuth. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID for social sign-in. |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret for social sign-in. |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for server-side billing operations. |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret for event verification. |
| `OPENAI_API_KEY` | No | Optional OpenAI API key for OpenAI-backed AI flows. |
| `GEMINI_API_KEY` | No | Optional Gemini API key for Gemini-backed AI flows. |
| `CLAUDE_API_KEY` | No | Optional Claude API key for Claude-backed AI flows. |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL exposed to browser-side runtime. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key for frontend payment flows. |

## Running Individual Apps

Run a single app with pnpm filter from the monorepo root:

```bash
pnpm --filter @aether/rfp-tool dev -- --hostname 0.0.0.0 --port 3001
pnpm --filter @aether/compliance-tool dev -- --hostname 0.0.0.0 --port 3002
pnpm --filter @aether/market-analyzer dev -- --hostname 0.0.0.0 --port 3003
pnpm --filter @aether/proposal-optimizer dev -- --hostname 0.0.0.0 --port 3004
pnpm --filter @aether/landing-critic dev -- --hostname 0.0.0.0 --port 3005
```

## Building for Production

Build all workspaces:

```bash
pnpm build
```

Build and run production containers:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## License

MIT
