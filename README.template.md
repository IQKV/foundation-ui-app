# Project Name

<!-- TEMPLATE: Replace the title above. Remove this comment block when done. -->

<details>
  <summary><strong>How to use this template (click to expand)</strong></summary>

1. Replace the title with your app name.
2. Update the short description below.
3. Add CI/coverage/license badges after the title.
4. Fill in each section with real content; remove placeholder text.
5. Delete this guidance block when finished.

</details>

Short description of what this app does and who it is for.

<!-- Badge examples (optional):
![CI](https://img.shields.io/github/actions/workflow/status/ORG/REPO/ci.yml?label=CI)
![License](https://img.shields.io/github/license/ORG/REPO)
-->

## About

Describe the purpose of the app, the platform surface it covers, and the primary user roles.

## Feature Status

| Feature | Status | Notes |
| ------- | ------ | ----- |
| Sign in / Sign out | ✅ Live | JWT, silent refresh, multi-tenant picker |
| Magic link auth | ✅ Live | Email link → token exchange |
| OAuth2 / OIDC | ✅ Live | Callback handler, provider integrations |
| Signup & onboarding | ✅ Live | Registration, profile completion, org creation |
| Team management | ✅ Live | Invite, role change, ban member |
| Billing | ✅ Live | Plans, Stripe/Lemon Squeezy checkout, portal |
| CMS pages | ✅ Live | CRUD, rich-text editor |
| Venue list | ✅ Live | Keyword search, semantic (AI) search, bulk delete |
| Venue detail & edit | ✅ Live | See [Venue Detail Page](#venue-detail-page) |
| Venue AI enrichment | ✅ Live | Fill-with-AI chat, inline diff suggestions, atomic apply |
| Settings | ✅ Live | Profile, security, notifications, organisation |
| Platform AI Chat addon | ✅ Live | Pluggable addon, extension-point nav entry |

## Tech Stack

- React 19 · TypeScript · Vite 8 (SWC)
- Mantine UI 9 · mantine-datatable · Tabler Icons
- TanStack Router · TanStack Query · Zustand
- Lingui 6 · Axios · Zod · MSW
- Vitest · Playwright · OxLint · OxFmt

Architecture follows [Feature-Sliced Design](AGENTS.md).

## Prerequisites

- Node.js `>=20.19.0` (22.12+ or 24+ also supported)
- pnpm `10.33.2`

## Quick Start

```bash
git clone https://github.com/IQKV/<repo>.git
cd <repo>

pnpm install

cp .env.example .env.local
# Edit .env.local — set VITE_API_SERVER_URL

pnpm dev
# → http://localhost:5173
```

## Environment Variables

| Variable                    | Default (`.env.example`) | Description                                      |
| --------------------------- | ------------------------ | ------------------------------------------------ |
| `VITE_API_SERVER_URL`       |                          | API base URL (production; dev uses `/api` proxy) |
| `VITE_LOG_LEVEL`            | `info`                   | Client log level: `silent`, `info`, `debug`      |
| `VITE_ROLLOUT_MODE`         | `MULTI_TENANT`           | `MULTI_TENANT` or `SINGLE_TENANT`                |
| `VITE_DEMO_MODE`            | `false`                  | Show demo helpers in auth flows                  |
| `VITE_ENABLE_MAGIC_LINK`    | `true`                   | Enable magic link auth routes                    |
| `VITE_PAYMENT_GATEWAY_TYPE` | `STRIPE`                 | `STRIPE` or `LEMON_SQUEEZY`                      |
| `VITE_ENABLED_UI_ADDONS`    |                          | Comma-separated addon IDs to enable              |
| `VITE_APP_NAV_VARIANT`      | `sidebar`                | `sidebar` or `topbar`                            |
| `VITE_APP_TITLE`            |                          | App name; source for all branding defaults       |

Copy `.env.example` to `.env.local`. For runtime overrides without a rebuild copy `public/config.js.example` to `public/config.js` and set `window.VITE_*` values.

## Scripts

```bash
pnpm dev                  # Vite dev server
pnpm build                # tsc + i18n compile + Vite build
pnpm type-check           # TypeScript only
pnpm lint                 # OxLint
pnpm lint:fix             # OxLint --fix + OxFmt
pnpm test                 # Vitest
pnpm test:arch            # FSD architecture tests
pnpm e2e                  # Playwright
pnpm messages:extract     # Extract i18n strings
pnpm messages:compile     # Compile PO catalogs
```

## Project Structure

```
src/
├── app/           # Providers, theme, runtime config, addon registry
├── processes/     # Session store, inactivity timer, theme
├── pages/         # File-based routes (TanStack Router)
├── widgets/       # Composed UI blocks
├── features/      # User scenarios and business logic
├── entities/      # Business entities and data models
├── shared/        # API clients, UI kit, locales, utilities
├── addons/        # Optional pluggable modules
└── architecture.test.ts
```

## Documentation

- [Architecture](./docs/architecture/README.md)
- [Deployment](./docs/deployment/README.md)
- [API notes](./docs/api/README.md)
- [Agent / FSD guide](./AGENTS.md)

---

## Venue Detail Page

Route: `/_app/venues/$venueId`  
Feature slice: `features/manage-venue`  
Roles: `TENANT_OWNER`, `MEMBER` (read); `TENANT_OWNER`, `MEMBER` (write via AI apply); `TENANT_OWNER` (manual edit, delete)

### Layout

The page uses a two-column grid (`lg: 4 / 8`).

**Left column**
- Hero card — primary photo banner, venue name and city
- `VenueCompletenessCard` — per-section completeness breakdown with a ring chart
- Address & coordinates card with a Google Maps link
- Identifiers & timestamps card

**Right column**
- Sticky "Fill with AI" button at the top (hidden when profile is 100% complete)
- Tabs: Details · Photos · Assets · Sources

### Details tab

Shows the full structured metadata document via `VenueMetadataSections`. Each section renders as a card with:
- Current field values as read chips
- A pencil icon that opens a right-anchored drawer (`SectionFieldsForm`) for manual editing
- Inline AI suggestion chips (violet) when enrichment suggestions are active — each chip shows the AI-suggested value with individual Accept ✓ and Dismiss ✗ controls

A collapsible raw JSON viewer is available below the sections.

### Fill with AI flow

1. Click **Fill with AI** (sticky button, top of right column) → opens `VenueAiEnrichModal`
2. Optionally select a field group focus (capacity, amenities, catering, etc.)
3. Type a free-text description of the venue and press Enter or Send
4. The modal calls `POST /v1/catalog/venues/{id}/enrichment/suggestions`; the AI returns a conversational reply and a list of structured field patches
5. Patches appear as inline diff chips on the matching metadata section cards
6. The modal also shows the patches with **Accept** / **Dismiss** per chip, **Apply accepted**, and **Apply all** buttons
7. Applying calls `POST /v1/catalog/venues/{id}/enrichment/apply` — the backend merges the accepted patches atomically into the metadata document and re-embeds the venue
8. The venue query is invalidated and section cards refresh immediately

### Header toolbar

| Button | Role required | Action |
| ------ | ------------- | ------ |
| Edit Manually | `TENANT_OWNER` | Opens `EditVenueModal` (name, address, city, coordinates) |
| Upload asset | `TENANT_OWNER` | Presigned two-phase upload to MinIO |
| Delete | `TENANT_OWNER` | Opens `DeleteVenueModal` with confirmation |

### Key hooks & components

| Symbol | Location | Purpose |
| ------ | -------- | ------- |
| `useVenueEnrichment` | `features/manage-venue/model` | Manages chat history, pending patches, suggest + apply mutations |
| `VenueAiEnrichModal` | `features/manage-venue/ui` | Chat modal with reply bubbles and per-patch diff chips |
| `VenueMetadataSections` | `features/manage-venue/ui` | Structured metadata view with inline suggestion chips |
| `VenueCompletenessCard` | `features/manage-venue/ui` | Per-section completeness ring |
| `catalogApi.venueEnrichmentSuggestions` | `shared/api` | `POST /v1/catalog/venues/{id}/enrichment/suggestions` |
| `catalogApi.venueEnrichmentApply` | `shared/api` | `POST /v1/catalog/venues/{id}/enrichment/apply` |

## License

Apache License — see [LICENSE](LICENSE).

## Contributing

See [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).

---

<details>
  <summary><strong>Pre-publish checklist (remove before merging)</strong></summary>

- [ ] Title and description updated
- [ ] Badges added
- [ ] Feature Status table populated
- [ ] Environment variables documented
- [ ] Architecture notes reflect actual stack
- [ ] Links verified

</details>
