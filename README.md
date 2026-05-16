# Foundation UI App

Tenant-facing web application for the Key Value Platform. Workspace members use it to sign in, manage their team, and maintain their account — all scoped to a single tenant.

## About

This is the tenant surface of the platform — separate from `foundation-ui-platform-admin`, which is operator-only. The app talks to the IAM API (`/v1/iam/*`) with tenant-scoped JWTs and an `X-Tenant-ID` header on authenticated requests.

### Implemented today

| Area                   | What it does                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sign-in**            | Two-step flow: credentials → tenant discovery (`POST /v1/iam/users/tenants`); multi-tenant users pick a workspace; single-tenant users sign in directly (`POST /v1/iam/auth/signin`) |
| **Sign-up**            | Self-service registration with tenant creation; polls provisioning status until the tenant is `ACTIVE`                                                                               |
| **Password reset**     | Forgot-password email flow and token-based reset (`/forgot-password`, `/reset-password`)                                                                                             |
| **Email verification** | Token-based verification page (`/verify-email?token=…`)                                                                                                                              |
| **Invitations**        | Accept flow for new and existing users (`/invite/:token`); owners invite members, view pending invitations, revoke invitations                                                       |
| **Dashboard**          | Workspace name, welcome message, team member count                                                                                                                                   |
| **Team**               | Searchable member list; pending invitations panel (TENANT_OWNER only); send invitation modal (ADMIN or MEMBER role)                                                                  |
| **My Account**         | Profile view, edit name, change password, organizations and roles                                                                                                                    |
| **Session security**   | Access token in memory; refresh token + tenant key in `sessionStorage`; silent refresh on 401; 30-minute inactivity sign-out                                                         |
| **UX**                 | Light/dark theme, Lingui i18n (English catalog), locale cookie, navigation progress, error boundaries                                                                                |

### Not implemented yet

- Billing and subscription self-service
- Tenant/workspace settings (rename, configuration)
- Member role management beyond invitation authority (ADMIN / MEMBER)
- Additional locales (infrastructure is ready; only `en` is compiled today)

## Routes

| Path               | Access        | Description                             |
| ------------------ | ------------- | --------------------------------------- |
| `/sign-in`         | Public        | Tenant sign-in with optional redirect   |
| `/signup`          | Public        | New user + tenant registration          |
| `/forgot-password` | Public        | Request password reset email            |
| `/reset-password`  | Public        | Set new password from email token       |
| `/verify-email`    | Public        | Confirm email from link token           |
| `/invite/:token`   | Public        | Preview and accept workspace invitation |
| `/`                | Authenticated | Dashboard                               |
| `/team`            | Authenticated | Members and invitations                 |
| `/account`         | Authenticated | Profile and password                    |
| `/unauthorized`    | Public        | Shown when JWT is not a tenant session  |
| `/404`, `/500`     | Public        | Error pages                             |

Authenticated routes live under the `/_app` layout, which enforces a valid tenant JWT (or silent refresh) before rendering.

## Feature status

| Feature                                 | Status              |
| --------------------------------------- | ------------------- |
| Sign-in with tenant discovery           | Done                |
| Sign-up with tenant provisioning        | Done                |
| Forgot / reset password                 | Done                |
| Email verification                      | Done                |
| Accept invitation                       | Done                |
| Dashboard                               | Done (basic stats)  |
| Team — member list                      | Done                |
| Team — invitations (send, list, revoke) | Done (TENANT_OWNER) |
| Profile & change password               | Done                |
| Billing self-service                    | Planned             |
| Tenant settings                         | Planned             |
| Member role editing                     | Planned             |

## Tech stack

- React 19, TypeScript 6, Vite 8 (SWC)
- Mantine UI 8, Tabler Icons, mantine-datatable
- TanStack Router (file-based routes) + TanStack Query
- Zustand (session + theme), React Hook Form + Zod
- Lingui 6 (PO catalogs, lazy locale load)
- Axios with request/response interceptors
- Vitest + Testing Library, Playwright (E2E)
- OxLint, OxFmt, Stylelint, Knip

Architecture follows [Feature-Sliced Design](AGENTS.md) (`app` → `processes` → `pages` → `widgets` → `features` → `shared`) with automated boundary tests (`pnpm test:arch`).

## Prerequisites

- Node.js 20.19+, 22.12+, or 24+ (see Vite 8 engine requirements)
- pnpm 10.33.2 (`packageManager` in `package.json`)

## Quick start

```bash
git clone https://github.com/IQKV/foundation-ui-app.git
cd foundation-ui-app

pnpm install

cp .env.example .env.local
# Optional: point VITE_API_SERVER_URL at your API gateway

pnpm dev
# → http://localhost:5173 (API proxied via /api in development)
```

In development, the app uses `baseURL: /api` and Vite proxies to `VITE_API_SERVER_URL`, avoiding browser CORS. In production, set the full API URL via build env or `public/config.js`.

## Environment variables

| Variable              | Default (`.env.example`)    | Description                                 |
| --------------------- | --------------------------- | ------------------------------------------- |
| `VITE_API_SERVER_URL` | `https://api.iqkv.site/api` | API base URL (origin + path prefix)         |
| `VITE_LOG_LEVEL`      | `info`                      | Client log level: `silent`, `info`, `debug` |

Copy `.env.example` to `.env.local` for local overrides. For runtime overrides without a rebuild, copy `public/config.js.example` to `public/config.js` and set `window.VITE_*` values.

## Runtime configuration

```bash
cp public/config.js.example public/config.js
# Edit public/config.js for the target environment
```

`window.*` values in `public/config.js` override build-time `VITE_*` variables. Do not commit secrets. See `public/config.js.example` for NGINX cache, SPA fallback, and CORS notes.

## Scripts

```bash
# Development
pnpm dev                  # Vite dev server
pnpm preview              # Preview production build

# Build
pnpm build                # tsc + i18n extract/compile + Vite build
pnpm type-check           # TypeScript only

# Quality
pnpm lint                 # OxLint (type-aware)
pnpm lint:fix             # OxLint --fix + OxFmt
pnpm formatter:check      # OxFmt check
pnpm formatter:write      # OxFmt write
pnpm knip                 # Unused exports / dependencies

# Tests
pnpm test                 # Vitest
pnpm test:coverage        # Vitest + coverage
pnpm test:arch            # FSD architecture tests
pnpm e2e                  # Playwright (all projects)
pnpm e2e:chrome           # Chromium only
pnpm e2e:smoke            # Smoke suite (Chromium)
pnpm playwright:install   # Install browsers (first time)

# i18n
pnpm messages:extract     # Extract strings to locales/*/messages.po
pnpm messages:compile     # Compile PO catalogs for runtime
```

## Internationalization

[Lingui](https://lingui.dev/) drives all user-visible strings. The active catalog is **English** (`locales/en`). To add a locale: add it to `lingui.config.ts` and `src/shared/locales/index.ts`, run `pnpm messages:extract`, translate the `.po` file, then `pnpm messages:compile`.

The locale switcher persists choice in a `locale` cookie. API requests send `Accept-Language` from the active Lingui locale.

## Project structure

```
src/
├── app/           # Providers, theme, runtime config
├── processes/     # Session store, inactivity timer, theme
├── pages/         # File-based routes (TanStack Router)
├── features/      # sign-in, signup, invite-member, edit-profile, …
├── widgets/       # (reserved for composed blocks)
├── shared/        # UI kit, API clients, locales, utilities
└── architecture.test.ts
```

## Authorization

Roles are carried on the JWT (`authorities` claim) and enforced in the UI:

| Role           | Capabilities in this app                               |
| -------------- | ------------------------------------------------------ |
| `TENANT_OWNER` | Invite members, view/revoke pending invitations        |
| `ADMIN`        | (Invitable role; no extra UI beyond member list today) |
| `MEMBER`       | Dashboard, team member list, own account               |

`TenantOwnerOnly` / `AuthGuard` hide owner-only actions. The `/_app` route guard requires `tenant_id` to be non-null in the JWT; platform-scoped tokens redirect to `/unauthorized`.

## Session and API auth

1. **Sign-in** stores `accessToken` (memory), `refreshToken` and `tenantKey` (`sessionStorage`).
2. **Request interceptor** attaches `Authorization: Bearer …` and `X-Tenant-ID` (except public auth/invitation endpoints).
3. **401 handling** deduplicates a single `POST /v1/iam/auth/refresh` and retries the original request.
4. **Page reload** triggers silent refresh in the `/_app` `beforeLoad` guard when refresh + tenant key exist.
5. **Inactivity** signs out after 30 minutes with no pointer/keyboard/scroll activity.

## Relationship to platform admin

|              | `foundation-ui-app`                                            | `foundation-ui-platform-admin`      |
| ------------ | -------------------------------------------------------------- | ----------------------------------- |
| Audience     | Tenant members                                                 | Platform operators                  |
| JWT          | `tenant_id` set (tenant session)                               | `tenant_id` null (platform session) |
| Sign-in      | `POST /v1/iam/auth/signin` + `X-Tenant-ID`                     | Admin sign-in endpoint              |
| Typical APIs | `/v1/iam/users/me`, `/v1/iam/tenants/:key`, tenant invitations | `/admin/*` operator APIs            |
| Deployment   | Public-facing                                                  | Internal / restricted               |

## Documentation

- [Architecture](./docs/architecture/README.md)
- [Deployment](./docs/deployment/README.md)
- [API notes](./docs/api/README.md)
- [Agent / FSD guide](./AGENTS.md)

## License

Apache License — see [LICENSE](LICENSE).

## Contributing

See [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).
