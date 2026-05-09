# Project Name 🚀

<!-- TEMPLATE: This README.template.md is a starter template. Copy parts into your real README.md and replace placeholders. -->

<details>
  <summary><strong>How to use this template (click to expand)</strong></summary>

1. Rename the title above to your project name and optionally add a logo right below it.
2. Add badges (build, tests, coverage, license) under the title.
3. Fill each section below with your actual project content (keep the section order if you like it).
4. Replace placeholder code blocks and bullet points with real commands and steps.
5. Remove this guidance block after you finish customizing.

</details>

- Add your project logo.
- Write a short introduction to the project.
- If you are using badges, add them here.

<details>
  <summary><strong>Badge examples (optional)</strong></summary>

- Build: <code>![CI](https://img.shields.io/github/actions/workflow/status/ORG/REPO/build-nodejs-project.yml?label=CI)</code>
- Tests: <code>![Tests](https://img.shields.io/badge/tests-passing-brightgreen)</code>
- Coverage: <code>![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)</code>
- License: <code>![License](https://img.shields.io/github/license/ORG/REPO)</code>

</details>

## :beginner: About

Add a detailed introduction about the project here, everything you want the reader to know.

## 📚 Documentation

- [API Documentation](docs/api/README.md)
- [Architecture Overview](docs/architecture/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Contributing Guidelines](.github/CONTRIBUTING.md)

---

<details>
  <summary><strong>✅ Pre-publish checklist (remove in final README)</strong></summary>

- [ ] Title updated and logo added
- [ ] Badges added (CI, tests, coverage, license)
- [ ] About / Installation / Scripts sections completed
- [ ] Environment variables documented
- [ ] Runtime config (`public/config.js`) documented if used
- [ ] i18n locales updated in `lingui.config.ts` and documented
- [ ] Architecture notes reflect your FSD layers and modules
- [ ] Links verified (docs, GitHub workflows, external resources)
- [ ] This guidance block removed before publishing

</details>

---

## 🧩 Boilerplate Architecture

- FSD boundaries with public API barrels
- Typed forms, notifications, modals, and devtools
- Vite, OxLint/OxFmt, Vitest/Playwright, Lingui
- Runtime env override via `public/config.js` (no rebuild needed per environment)
- App: providers, router, theme, runtime config
- Processes: cross-feature flows (e.g. session management)
- Features: business logic and user interactions
- Entities: pure API methods and domain models
- Shared: UI kit, utilities, API clients, MSW mocks, locales

## ⚙️ Runtime Configuration

Override build-time `VITE_*` env vars at runtime without rebuilding:

```shell
cp public/config.js.example public/config.js
# Edit public/config.js with your environment values
```

Values set on `window.*` in `public/config.js` take precedence over build-time variables. Do **not** commit secrets.

## 🌍 Internationalization

Supported locales are defined in `lingui.config.ts`. Default: `en`.

```shell
# After adding new translatable strings:
pnpm messages:extract

# After editing .po files in locales/:
pnpm messages:compile
```

To add a new locale: add it to `lingui.config.ts` → `locales` array, run extract, translate the new `.po` file, compile.
