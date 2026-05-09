# Foundation UI Platform Admin 🖥️

Platform administration interface for the Key Value Platform. Provides comprehensive oversight and control over users, organizations, subscriptions, and system health across all tenants. Operator and tenant surfaces share the same SPA, build, and API Gateway connection — route-level guards enforce `PLATFORM_ADMIN` authority.

## About

The admin UI is the operator surface of the platform:

- **Dashboard & metrics** — real-time platform health, active users, organization counts, subscription KPIs, MRR/ARR, trial conversion, and growth trends
- **User management** — paginated user list with advanced filtering, bulk actions, and a tabbed detail view covering profile, memberships, auth history, billing, activity log, and operator notes
- **Organization management** — cross-tenant grid with status-based highlighting, inline actions, and a tabbed detail view covering members, subscription & billing, usage limits, audit trail, and settings
- **Subscription & billing** — global subscription list, plan catalog CRUD, billing settings, and subscription lifecycle actions (change plan, cancel, reactivate, apply discount)
- **Platform actions** — ban/unban, account unlock, email verification, impersonation (with full audit trail), tenant suspend/unsuspend/delete, ownership transfer, GDPR data export
- **System administration** — service health dashboard, background job monitoring, manual job triggers, platform rollout mode display, and global audit log
- **Protected route group** — `/admin/*` routes require `PLATFORM_ADMIN` authority; completely separate layout and session store from the tenant surface
- **Secure token strategy** — access token in memory only; refresh token in an httpOnly, Secure, SameSite=Strict cookie; XSS cannot steal long-lived credentials
- **Internationalization** — full i18n with Lingui; English as base language; runtime locale switching without rebuild

## Quick Links

- [Architecture Overview](./docs/architecture/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Contributing Guidelines](.github/CONTRIBUTING.md)

## Feature Status

| Feature                        | Status         |
| ------------------------------ | -------------- |
| Dashboard & metrics            | 🚧 In progress |
| User management                | 🚧 In progress |
| Organization management        | 🚧 In progress |
| Subscription & billing         | 📋 Planned     |
| Platform actions (ban, unlock) | 📋 Planned     |
| Impersonation                  | 📋 Planned     |
| System administration          | 📋 Planned     |
| Audit log                      | 📋 Planned     |

## Tech Stack

- React 19 + TypeScript
- Mantine UI 8 + mantine-datatable
- TanStack Router + TanStack Query
- Zustand (session store)
- Lingui i18n
- Zod + React Hook Form
- Vite 8 + SWC
- Vitest + Playwright
- OxLint / OxFmt

## Prerequisites

- Node.js >= 22.15.0
- pnpm >= 10.33.2

## Quick Start

```bash
# Clone the repository
git clone https://github.com/IQKV/foundation-ui-platform-admin.git
cd foundation-ui-platform-admin

# Install dependencies and git hooks
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local — set VITE_API_BASE_URL to your gateway address

# Start the dev server
pnpm dev
# → App: http://localhost:5173
```

## Environment Variables

| Variable            | Default                 | Description              |
| ------------------- | ----------------------- | ------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:8080` | API Gateway base URL     |
| `VITE_APP_NAME`     | `Platform Admin`        | Application display name |

> Copy `.env.example` to `.env.local` / `.env.uat` / `.env.prd` and fill in values per environment. For runtime overrides without a rebuild, copy `public/config.js.example` to `public/config.js` and set values on `window.*`.

## Runtime Configuration

Override build-time `VITE_*` variables at runtime without rebuilding:

```bash
cp public/config.js.example public/config.js
# Edit public/config.js with environment-specific values
```

Values set on `window.*` in `public/config.js` take precedence over build-time variables. Do not commit secrets.

## pnpm Scripts

```bash
# Development
pnpm dev                  # Start Vite dev server

# Build
pnpm build                # Type-check + extract/compile i18n + Vite build

# Lint & format
pnpm lint                 # OxLint (type-aware)
pnpm lint:fix             # OxLint --fix + OxFmt write
pnpm formatter:check      # OxFmt check only

# Tests
pnpm test                 # Vitest (single run)
pnpm test:coverage        # Vitest with V8 coverage
pnpm test:arch            # Architecture boundary tests

# E2E
pnpm e2e                  # Playwright (all tests)
pnpm e2e:chrome           # Chromium only
pnpm e2e:smoke            # Smoke suite, Chromium

# i18n
pnpm messages:extract     # Extract translatable strings to .po files
pnpm messages:compile     # Compile .po files to runtime catalogs
```

## Internationalization

Supported locales are defined in `lingui.config.ts`. Default: `en`.

To add a new locale: add it to the `locales` array in `lingui.config.ts`, run `pnpm messages:extract`, translate the new `.po` file under `locales/`, then run `pnpm messages:compile`.

## Project Structure

```
src/
├── app/          # Providers, router, theme, runtime config bootstrap
├── processes/    # Cross-feature flows (session management, auth lifecycle)
├── pages/        # Route components (/admin/*, /auth/*, tenant surface)
├── widgets/      # Composed UI blocks (data grids, detail panels, dashboards)
├── features/     # Business logic and user interactions (ban, invite, etc.)
├── entities/     # Pure API methods and domain models (user, tenant, plan)
├── shared/       # UI kit, utilities, Axios clients, MSW mocks, locales
└── types/        # Global TypeScript declarations
```

## Authorization Model

```
PLATFORM_ADMIN  — full platform access, bypasses all tenant restrictions
TENANT_OWNER    — full management within their tenant
ADMIN           — user management and invitations within their tenant
MEMBER          — basic access within their tenant
```

`/admin/*` routes are guarded at the router level. Non-platform users are redirected to the tenant surface.

## License

This project is licensed under the Apache License. See the [LICENSE](LICENSE) file for details.

## Contributing

Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).

---

## 🧩 Boilerplate Architecture

- **FSD layers**: `app → processes → pages → widgets → features → entities → shared`; each layer exposes a public API barrel; cross-layer imports are enforced by architecture tests
- **Routing**: TanStack Router with file-based route tree generation (`tsr.config.json`); `_operator` route group guards enforce `PLATFORM_ADMIN` authority; separate layouts for admin and tenant surfaces
- **State**: Zustand for session (access token in memory, never persisted); TanStack Query for server state with smart cache invalidation; Immer for complex state mutations
- **Forms**: React Hook Form + Zod schemas via `mantine-form-zod-resolver`; typed resolvers per entity
- **Data grids**: `mantine-datatable` for paginated, sortable, filterable tables; `nuqs` for URL-synced filter state
- **Token security**: access token lives in a Zustand store (memory only); refresh token in an httpOnly cookie; Axios interceptor silently refreshes on 401 before retrying the original request
- **Mocking**: MSW 2.x for API mocking in development and tests; MirageJS available for in-memory scenarios
- **Observability**: structured error boundaries per route; TanStack Query Devtools and Router Devtools in development
- **Quality tools**: OxLint (type-aware), OxFmt, Stylelint, Vitest (unit + arch), Playwright (E2E), Knip (dead code), commit convention enforcement

> See [AGENTS.md](AGENTS.md) for FSD conventions, naming rules, and agent guidelines.
