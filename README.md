# Foundation UI App

Tenant-facing web application for the Key Value Platform. Workspace members use it to sign in, manage their team, and maintain their account — all scoped to a single tenant.

## About

This is the tenant surface of the platform — separate from `foundation-ui-platform-admin`, which is operator-only. The app talks to the IAM API (`/v1/iam/*`) with tenant-scoped JWTs and an `X-Tenant-ID` header on authenticated requests.

### Implemented today

| Area                   | What it does                                                                                                                                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sign-in**            | Two-step flow: credentials → tenant discovery (`POST /v1/iam/users/tenants`); multi-tenant users pick a workspace; single-tenant users sign in directly (`POST /v1/iam/auth/signin`). Supports OAuth2/OIDC sign-in (Google/GitHub/Microsoft) and Enterprise SSO (tenant OIDC) |
| **Sign-up**            | Self-service registration with tenant creation; polls provisioning status until the tenant is `ACTIVE`                                                                                                                                                                        |
| **Password reset**     | Forgot-password email flow and token-based reset (`/forgot-password`, `/reset-password`)                                                                                                                                                                                      |
| **Email verification** | Token-based verification page (`/verify-email?token=…`)                                                                                                                                                                                                                       |
| **Invitations**        | Accept flow for new and existing users (`/invite/:token`); owners invite members, view pending invitations, revoke invitations                                                                                                                                                |
| **Dashboard**          | Workspace name, welcome message, team member count                                                                                                                                                                                                                            |
| **Team**               | Searchable member list; pending invitations panel (TENANT_OWNER only); send invitation modal (ADMIN or MEMBER role); ban/unban members (TENANT_OWNER only); change member role (TENANT_OWNER only); transfer ownership (TENANT_OWNER only)                                    |
| **My Account**         | Profile view, edit name, change password, organizations and roles; connected accounts (link/unlink OAuth2 providers)                                                                                                                                                          |
| **Billing**            | Billing portal access (Stripe or Lemon Squeezy), current subscription view, plan catalog, billing info, refunds list, webhook logs; **plan-based feature access control** with entitlements API integration                                                                   |
| **Tenant Settings**    | Organization metadata editing                                                                                                                                                                                                                                                 |
| **Notifications**      | In-app notifications with WebSocket support; notification bell UI                                                                                                                                                                                                             |
| **Session security**   | Access token in memory; refresh token + tenant key in `sessionStorage`; silent refresh on 401; 30-minute inactivity sign-out                                                                                                                                                  |
| **UX**                 | Light/dark theme, Lingui i18n (English catalog), locale cookie, navigation progress, error boundaries                                                                                                                                                                         |

## Routes

| Path                              | Access        | Description                                  |
| --------------------------------- | ------------- | -------------------------------------------- |
| `/sign-in`                        | Public        | Tenant sign-in with optional redirect        |
| `/auth/callback`                  | Public        | OAuth2/OIDC callback handler                 |
| `/signup`                         | Public        | New user + tenant registration               |
| `/forgot-password`                | Public        | Request password reset email                 |
| `/reset-password`                 | Public        | Set new password from email token            |
| `/verify-email`                   | Public        | Confirm email from link token                |
| `/invite/:token`                  | Public        | Preview and accept workspace invitation      |
| `/magic-link`                     | Public        | Magic link entry (feature-flagged)           |
| `/magic-link/verify`              | Public        | Exchange magic link token for session        |
| `/create-organization`            | Authenticated | Create a new organization                    |
| `/`                               | Authenticated | Dashboard                                    |
| `/team`                           | Authenticated | Members and invitations                      |
| `/billing`                        | Authenticated | Billing portal, plans, refunds, webhook logs |
| `/account/settings/general`       | Authenticated | General account settings                     |
| `/account/settings/organization`  | Authenticated | Organization settings                        |
| `/account/settings/security`      | Authenticated | Security settings                            |
| `/account/settings/notifications` | Authenticated | Notification settings                        |
| `/unauthorized`                   | Public        | Shown when JWT is not a tenant session       |
| `/404`, `/500`                    | Public        | Error pages                                  |

Authenticated routes live under the `/_app` layout, which enforces a valid tenant JWT (or silent refresh) before rendering.

## Feature status

| Feature                                 | Status              |
| --------------------------------------- | ------------------- |
| Sign-in with tenant discovery           | Done                |
| OAuth2/OIDC sign-in                     | Done                |
| Enterprise SSO (tenant OIDC)            | Done                |
| OAuth2 provider link/unlink             | Done                |
| Tenant SSO configuration                | Done (TENANT_OWNER) |
| Sign-up with tenant provisioning        | Done                |
| Forgot / reset password                 | Done                |
| Email verification                      | Done                |
| Accept invitation                       | Done                |
| Dashboard                               | Done (basic stats)  |
| Team — member list                      | Done                |
| Team — invitations (send, list, revoke) | Done (TENANT_OWNER) |
| Profile & change password               | Done                |
| Billing self-service                    | Done                |
| Webhook logs (tenant)                   | Done                |
| Plan-based feature access control       | Done                |
| Tenant settings                         | Done                |
| Notifications                           | Done                |
| Member role editing                     | Done (TENANT_OWNER) |
| Member ban/unban                        | Done (TENANT_OWNER) |
| Member transfer ownership               | Done (TENANT_OWNER) |
| Magic link authentication               | Done (feature flag) |

## Billing & Entitlements

Plan-based feature access control is implemented end-to-end across the UI.

### PlanEntitlement shape

The billing service returns the following structure from `GET /v1/billing/entitlements/me`:

```json
{
  "planCode": "pro-monthly",
  "status": "active",
  "currentPeriodEnd": "2026-07-15T00:00:00Z",
  "features": {
    "maxUsers": 50,
    "maxProjects": 0,
    "features": {
      "priority_support": {
        "code": "priority_support",
        "title": "Priority Support",
        "value": "true",
        "description": "Access to priority support channel"
      }
    }
  }
}
```

`maxUsers` and `maxProjects` are typed quota fields (0 = unlimited). `features` is an open map keyed by feature code (snake_case, matches YAML). Boolean features are stored as `value: "true"` / `"false"` strings so new features require only a YAML change in the billing service — no UI code change.

### Default fallbacks

Defined in `src/app/config/billing.ts`:

| Context              | maxUsers | maxProjects | features |
| -------------------- | -------- | ----------- | -------- |
| Personal workspace   | 1        | 0 (∞)       | `{}`     |
| Free tenant (no sub) | 1        | 1           | `{}`     |

### Feature codes (`BILLING_FEATURES`)

| Constant           | Code               | Meaning                    |
| ------------------ | ------------------ | -------------------------- |
| `PRIORITY_SUPPORT` | `priority_support` | Access to priority support |

### `EntitlementsProvider`

Wrap any subtree that needs plan data. Provides:

- `hasFeature(code)` — looks up `features[code].value === "true"`. Use for boolean feature-map entries.
- `getQuota(field)` — returns `maxUsers` or `maxProjects` as a number.
- `isActive` — always `true` (free plan is active by definition).
- `planCode` — resolved plan code or `"free"`.

### Hooks

```tsx
import { useHasFeature, useQuota } from "@/features/manage-billing";
import { BILLING_FEATURES } from "@/app/config";

const hasPrioritySupport = useHasFeature(BILLING_FEATURES.PRIORITY_SUPPORT);
const maxUsers = useQuota("maxUsers"); // 0 = unlimited
const maxProjects = useQuota("maxProjects");
```

### `FeatureGate`

Conditionally renders children when a feature-map code is enabled:

```tsx
<FeatureGate feature={BILLING_FEATURES.PRIORITY_SUPPORT} showUpgradePrompt>
  <PriorityContactButton />
</FeatureGate>
```

`showUpgradePrompt` shows a default locked-state `Alert` when the feature is absent or there is no active subscription. Pass `fallback` for a custom locked state. For quota checks (`maxUsers`, `maxProjects`) use `useQuota()` directly — those are enforced by the IAM service at write time, not gated in the UI.

### UI components (`features/manage-billing`)

| Component / Hook           | Purpose                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `EntitlementsCard`         | Current plan, status, renewal date, and feature list card                                                                                 |
| `PlanEntitlement`          | Feature list display (quota badges + boolean icons)                                                                                       |
| `PlanCard`                 | Single plan tile with price, features, and select action                                                                                  |
| `PlanList`                 | Grid of `PlanCard` components from catalog                                                                                                |
| `CurrentSubscription`      | Active subscription summary                                                                                                               |
| `BillingInfo`              | Billing settings form (multi-tenant: `/v1/billing/settings/{key}`; single-tenant: `/v1/billing/user-settings`)                            |
| `RefundList`               | Refund history table                                                                                                                      |
| `WebhookLogList`           | Webhook log history table with search, status filter, pagination                                                                          |
| `BillingPortalButton`      | Opens the billing portal — multi-tenant: `POST /v1/billing/settings/{key}/portal`; single-tenant: `POST /v1/billing/user-settings/portal` |
| `FeatureGate`              | Conditional render by feature code                                                                                                        |
| `useEntitlements`          | TanStack Query hook — fetches `GET /v1/billing/entitlements/me`                                                                           |
| `useHasFeature(code)`      | Boolean check against features map                                                                                                        |
| `useQuota(field)`          | Returns typed quota value                                                                                                                 |
| `useEntitlementsContext()` | Raw context access                                                                                                                        |

A working integration example lives at `src/pages/billing-example.tsx`.

### Billing API endpoints

All calls go through `src/shared/api/billing.ts` → `billingApi`. The paths below are relative to `baseURL` (`/api` in dev, `VITE_API_SERVER_URL` in production).

| `billingApi` method          | HTTP  | Path                                       | Mode          |
| ---------------------------- | ----- | ------------------------------------------ | ------------- |
| `listPlans`                  | GET   | `/v1/billing/plans`                        | both          |
| `getActiveSubscription`      | GET   | `/v1/billing/subscriptions/{key}/active`   | multi-tenant  |
| `getActiveSubscriptionForMe` | GET   | `/v1/billing/subscriptions/me/active`      | single-tenant |
| `createCheckoutSession`      | POST  | `/v1/billing/subscriptions/{key}/checkout` | multi-tenant  |
| `createCheckoutSessionForMe` | POST  | `/v1/billing/subscriptions/me/checkout`    | single-tenant |
| `createTenantPortalSession`  | POST  | `/v1/billing/settings/{key}/portal`        | multi-tenant  |
| `createUserPortalSession`    | POST  | `/v1/billing/user-settings/portal`         | single-tenant |
| `getEntitlements`            | GET   | `/v1/billing/entitlements/me`              | both          |
| `listRefunds`                | GET   | `/v1/billing/payments/{key}/refunds`       | multi-tenant  |
| `listRefundsForMe`           | GET   | `/v1/billing/payments/me/refunds`          | single-tenant |
| `getBillingSettings`         | GET   | `/v1/billing/settings/{key}`               | multi-tenant  |
| `createBillingSettings`      | POST  | `/v1/billing/settings/{key}`               | multi-tenant  |
| `updateBillingSettings`      | PATCH | `/v1/billing/settings/{key}`               | multi-tenant  |
| `getUserBillingSettings`     | GET   | `/v1/billing/user-settings`                | single-tenant |
| `createUserBillingSettings`  | POST  | `/v1/billing/user-settings`                | single-tenant |
| `updateUserBillingSettings`  | PATCH | `/v1/billing/user-settings`                | single-tenant |
| `listWebhookLogsForMe`       | GET   | `/v1/billing/webhook-logs/me`              | both          |
| `getWebhookLogForMe`         | GET   | `/v1/billing/webhook-logs/me/{id}`         | both          |

---

## Tech stack

- React 19, TypeScript 6, Vite 8 (SWC)
- Mantine UI 9, Tabler Icons, mantine-datatable
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

| Variable                    | Default (`.env.example`)    | Description                                           |
| --------------------------- | --------------------------- | ----------------------------------------------------- |
| `VITE_API_SERVER_URL`       | `https://api.iqkv.site/api` | API base URL (origin + path prefix)                   |
| `VITE_LOG_LEVEL`            | `info`                      | Client log level: `silent`, `info`, `debug`           |
| `VITE_ROLLOUT_MODE`         | `MULTI_TENANT`              | Operational mode: `MULTI_TENANT` or `SINGLE_TENANT`   |
| `VITE_DEMO_MODE`            | `false`                     | Show demo helpers in auth flows (non-production only) |
| `VITE_ENABLE_MAGIC_LINK`    | `true`                      | Enable magic link auth routes (`/magic-link/*`)       |
| `VITE_PAYMENT_GATEWAY_TYPE` | `STRIPE`                    | Billing UI mode: `STRIPE` or `LEMON_SQUEEZY`          |

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

| Role           | Capabilities in this app                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `TENANT_OWNER` | Invite members, view/revoke pending invitations, edit organization settings, ban/unban members, change member role, transfer ownership |
| `ADMIN`        | (Invitable role; no extra UI beyond member list today)                                                                                 |
| `MEMBER`       | Dashboard, team member list, own account                                                                                               |

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
