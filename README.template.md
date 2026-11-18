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
|         |        |       |

## Tech Stack

- React 19 · TypeScript · Vite 8 (SWC)
- Mantine UI 9 · mantine-datatable · Tabler Icons
- TanStack Router · TanStack Query · Zustand
- Lingui 6 · Axios · Zod · MSW · Framer Motion
- Vitest · Playwright · OxLint · OxFmt

Architecture follows [Feature-Sliced Design](AGENTS.md).

## Global UI

Two persistent UI elements available on every authenticated route.

### Ask AI (`features/ask-ai`)

Right-side drawer panel backed by the `platform-ai-chat` addon. Sessions managed silently.

- Topbar orange `Ask AI` button (also toggleable from command bar)
- Pages register suggestion cards and optional endpoint override via `useAiContextActions`

### Command Bar (`features/command-bar`)

Floating bottom-center pill with Ctrl+K spotlight (Go To + Create actions) and Ask AI toggle.

- Pages register spotlight Create actions via `useCommandBarActions`
- Bar can be hidden per route with `{ hidden: true }`

## Prerequisites

- Node.js `>=24.0.0`
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

| Variable              | Default (`.env.example`) | Description                                      |
| --------------------- | ------------------------ | ------------------------------------------------ |
| `VITE_API_SERVER_URL` |                          | API base URL (production; dev uses `/api` proxy) |
| `VITE_LOG_LEVEL`      | `info`                   | Client log level: `silent`, `info`, `debug`      |
| `VITE_ROLLOUT_MODE`   | `MULTI_TENANT`           | `MULTI_TENANT` or `SINGLE_TENANT`                |
| `VITE_DEMO_MODE`      | `false`                  | Show demo helpers in auth flows                  |

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
├── app/           # Providers, theme, runtime config
├── processes/     # Session store, inactivity timer, theme
├── pages/         # File-based routes (TanStack Router)
├── widgets/       # Composed UI blocks
├── features/      # User scenarios and business logic (ask-ai, command-bar, …)
├── entities/      # Business entities and data models
├── addons/        # Optional capability addons (platform-ai-chat, …)
├── shared/        # API clients, UI kit, locales, utilities
└── architecture.test.ts
```

## Documentation

- [Architecture](./docs/architecture/README.md)
- [Deployment](./docs/deployment/README.md)
- [API notes](./docs/api/README.md)
- [Agent / FSD guide](./AGENTS.md)

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
