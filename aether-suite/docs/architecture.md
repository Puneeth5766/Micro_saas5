# Aether Suite Architecture

Aether Suite is a Turborepo monorepo hosting five Next.js micro-SaaS applications and a set of shared, publishable workspace packages.

## Core principles

- **Vertical apps, horizontal shared packages**: Product-specific logic lives in `/apps`, while cross-cutting concerns live in `/shared`.
- **Type-safe contracts**: Strict TypeScript settings are enforced across every workspace package.
- **Composable platform**: Authentication, billing, analytics, AI, and DB access are consumed as internal packages.
- **Production runtime**: Applications run on Node.js with Next.js and can connect to MongoDB through Mongoose-backed shared utilities.

## Runtime components

1. **Next.js apps (`apps/*`)**
   - App Router architecture
   - Tailwind CSS v4 styling
   - Shared package imports via workspace protocol
2. **Shared packages (`shared/*`)**
   - `@aether/config`: central environment schema and constants
   - `@aether/db`: database connection and reusable model patterns
   - `@aether/auth`: NextAuth v5 configuration
   - `@aether/billing`: Stripe customer and checkout orchestration
   - `@aether/analytics`: event instrumentation
   - `@aether/ai`: AI utility abstraction
   - `@aether/ui`: reusable React component primitives
3. **Infrastructure**
   - Turborepo task graph for build/lint/type-check/dev
   - Docker Compose for local MongoDB + app bootstrapping

## Data flow

- Incoming requests hit each Next.js app.
- Server components, route handlers, or server actions pull typed config from `@aether/config`.
- Persistence flows through `@aether/db` and Mongoose models.
- User identity is handled through `@aether/auth`.
- Payment events and checkout are delegated to `@aether/billing`.
- User behavior and product metrics are tracked with `@aether/analytics`.
- AI-assisted features route through `@aether/ai` for provider isolation.
