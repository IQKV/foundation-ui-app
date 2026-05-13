# Foundation UI App 🖥️

Tenant-facing application for the Key Value Platform. Provides workspace members with self-service access to their profile, team, and billing — scoped entirely to their own tenant.

## About

This is the tenant surface of the platform — the app that end users interact with after signing up or accepting an invitation. It is intentionally separate from the platform admin console (`foundation-ui-platform-admin`), which is operator-only.

- **Sign-in with tenant discovery** — credentials are validated first, then the user selects their workspace if they belong to multiple tenants; single-tenant users are signed in directly
- **Dashboard** — workspace overview: subscription status, team size, recent activity
- **Team management** — member list, invite new members by email, revoke invitations, manage member roles
- **Profile & settings** — update own profile (`/users/me`), change password, manage notification preferences
- **Billing** — view active subscription, browse plan catalog, manage billing settings (TENANT_OWNER only)
- **Tenant settings** — update workspace name and configuration (TENANT_OWNER only)
- **Secure token strategy** — access token in memory only; refresh token in sessionStorage with tenant key; `X-Tenant-ID` header injected automatically on every API request
- **Internationalization** — full i18n with Lingui; English as base language; runtime locale switching without rebuild

## Quick Links

- [Architecture Overview](./docs/architecture/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Contributing Guidelines](.github/CONTRIBUTING.md)

## Feature Status

| Feature                       | Status         |
| ----------------------------- | -------------- |
| Sign-in with tenant discovery | 🚧 In progress |
| Dashboard                     | 📋 Planned     |
| Team management               | 📋 Planned     |
| Invitations                   | 📋 Planned     |
| Profile & settings            | 📋 Planned     |
| Billing self-service          | 📋 Planned     |
| Tenant settings               | 📋 Planned     |

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
git clone https://github.com/IQKV/foundation-ui-app.git
cd foundation-ui-app

# Install dependencies and git hooks
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local — set VITE_API_BASE_URL to your gateway address

# Start the dev server
pnpm dev
# → App: http://localhost:5174
```

## Environment Variables

| Variable            | Default                 | Description              |
| ------------------- | ----------------------- | ------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:8080` | API Gateway base URL     |
| `VITE_APP_NAME`     | `Key Value`             | Application display name |

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
├── pages/        # Route components (/dashboard, /team, /settings, /billing, etc.)
├── widgets/      # Composed UI blocks (member tables, subscription cards, etc.)
├── features/     # Business logic and user interactions (sign-in, invite, etc.)
├── entities/     # Pure API methods and domain models (user, tenant, subscription)
├── shared/       # UI kit, utilities, Axios clients, MSW mocks, locales
└── types/        # Global TypeScript declarations
```

## Authorization Model

```
TENANT_OWNER  — full management within their tenant (settings, billing, member roles)
ADMIN         — user management and invitations within their tenant
MEMBER        — basic access within their tenant
```

All routes are guarded at the router level. Unauthenticated users are redirected to `/sign-in`. Users without an active tenant membership are redirected to `/unauthorized`.

The session always carries a `tenant_id` claim — there is no cross-tenant access from this app. The `X-Tenant-ID` header is injected automatically on every API request by the auth interceptor.

## Relationship to Platform Admin

This app and `foundation-ui-platform-admin` are intentionally separate:

|                  | `foundation-ui-app`                               | `foundation-ui-platform-admin`                           |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Audience         | Tenant members                                    | Platform operators                                       |
| Token type       | Tenant-scoped (`tenant_id` = tenantKey)           | Platform-scoped (`tenant_id` = null)                     |
| Sign-in endpoint | `POST /auth/signin` + `X-Tenant-ID`               | `POST /auth/admin/signin`                                |
| API surface      | `/users/me`, `/tenants/:key`, `/subscriptions/me` | `/admin/users`, `/admin/tenants`, `/admin/subscriptions` |
| Deployment       | Public-facing                                     | Internal / VPN-restricted                                |

## License

This project is licensed under the Apache License. See the [LICENSE](LICENSE) file for details.

## Contributing

Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).

---

## 🧩 Boilerplate Architecture

- **FSD layers**: `app → processes → pages → widgets → features → entities → shared`; each layer exposes a public API barrel; cross-layer imports are enforced by architecture tests
- **Routing**: TanStack Router with file-based route tree generation (`tsr.config.json`); route guards check for a valid tenant session (`tenant_id` non-null in JWT)
- **State**: Zustand for session (access token in memory, tenant key + refresh token in sessionStorage); TanStack Query for server state with smart cache invalidation
- **Forms**: React Hook Form + Zod schemas via `mantine-form-zod-resolver`; typed resolvers per entity
- **Token security**: access token lives in a Zustand store (memory only); refresh token + tenant key in sessionStorage; Axios interceptor silently refreshes on 401 before retrying the original request; `X-Tenant-ID` header injected on every non-auth request
- **Mocking**: MSW 2.x for API mocking in development and tests
- **Observability**: structured error boundaries per route; TanStack Query Devtools and Router Devtools in development
- **Quality tools**: OxLint (type-aware), OxFmt, Stylelint, Vitest (unit + arch), Playwright (E2E), Knip (dead code), commit convention enforcement

> See [AGENTS.md](AGENTS.md) for FSD conventions, naming rules, and agent guidelines.
