# AI Agent Development Guide

## Project Overview

**iQ Foundation Tenant UI App** - A production-ready React application for the iQ Key Value Platform. Built with Feature-Sliced Design (FSD) architecture, it handles multi-tenant authentication, IAM, billing, CMS, and organization management.

**Key Characteristics:**

- Type-safe development with TypeScript 6 strict configuration
- Feature-Sliced Design with enforced layer boundaries (automated architecture tests)
- Modern build tooling with Vite 8 and SWC compiler
- Internationalization with Lingui 6 (lazy-loaded translations for `en-US`, `bg-BG`)
- MSW v2 for API mocking in development and testing
- Comprehensive testing with Vitest and Playwright
- Runtime configuration override support via `public/config.js` (window globals)
- Multi-tenant and single-tenant rollout modes (`VITE_ROLLOUT_MODE`)

## Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features
- **TypeScript 6** - Strict type safety with latest language features
- **Vite 8** - Lightning-fast development with instant HMR and optimized builds
- **PNPM 10.33.2** - Required package manager

### UI & Styling

- **Mantine UI v9** - React components library with comprehensive theming
- **Mantine Extensions** - Carousel, Charts, Dates, Dropzone, Form, Hooks, Modals, Notifications, NProgress, Tiptap
- **mantine-datatable** - Data table with sorting, filtering, pagination
- **Tabler Icons** - SVG icons (`@tabler/icons-react`)
- **PostCSS** - CSS processing with Mantine preset and simple vars
- **XYFlow React** - Node-based UI and flow diagrams
- **Lottie Web** - High-quality animations

### Routing & State

- **TanStack Router v1** - Type-safe file-based routing with code splitting
- **TanStack Query v5** - Server state synchronization and caching
- **Zustand v5** - Lightweight client state management (plain, no Immer middleware)
- **nuqs** - Type-safe URL search params state management

### Data & API

- **Axios** - HTTP client (`httpClient` instance in `shared/api/http-client.ts`)
- **Zod 4** - Runtime type validation and schema parsing
- **Mantine Form** - Form state management (primary form library)
- **MSW v2** - API mocking for development and testing
- **js-cookie** - Cookie management (locale preference detection)
- **jwt-decode** - JWT token decoding
- **ts-pattern** - Pattern matching for TypeScript
- **immer** - Installed but used selectively, not as global Zustand middleware

### Development & Quality

- **Vitest 4** - Fast unit testing with coverage reports and UI
- **Playwright 1.61** - End-to-end testing (Chromium, Firefox, WebKit)
- **Testing Library** - React component testing utilities
- **OxLint** - Ultra-fast linting with type-aware rules
- **OxFmt** - Fast opinionated code formatting
- **Stylelint** - CSS linting
- **Husky** - Git hooks for pre-commit validation
- **Commitlint** - Conventional commit message validation
- **Knip** - Dead code elimination and dependency analysis

### Internationalization & DevOps

- **Lingui 6** - Modern i18n with macro support and pluralization
- **Locales** - `en-US` (source locale) and `bg-BG`, PO-based catalogs in `locales/`
- **GitHub Actions** - CI/CD workflows for build, test, and PR validation
- **Dependabot** - Automated dependency updates
- **Release-it** - Automated versioning and changelog generation

## Architecture: Feature-Sliced Design (FSD)

The project strictly follows FSD with automated compliance tests (`src/architecture.test.ts`):

```
src/
├── app/          # Application layer (providers, routing, global styles, config)
├── processes/    # Process layer (cross-feature business processes)
├── pages/        # Page layer (TanStack Router file-based route components)
├── widgets/      # Widget layer (complex UI blocks composed from features)
├── features/     # Feature layer (user scenarios, business logic)
├── entities/     # Entity layer (business entities, data models)
├── shared/       # Shared layer (reusable code, UI kit, utilities, API)
│   ├── api/      # HTTP client, API modules, auth interceptor
│   ├── lib/      # Utilities (jwt, rollout, zod-form-validation, etc.)
│   ├── ui/       # Shared UI components
│   └── types/    # Global TypeScript types
└── architecture.test.ts  # Automated FSD compliance tests
```

### Existing Slices (current state)

**Processes** (`src/processes/`):

- `session` — JWT session store (access/refresh tokens, tenant key), `useSession` hook
- `theme` — Color scheme store persisted in localStorage
- `inactivity-timer` — `useInactivityTimer` hook for auto sign-out

**Features** (`src/features/`): `accept-invitation`, `avatar`, `ban-user`, `change-password`,
`complete-profile`, `create-organization`, `edit-profile`, `forgot-password`, `invite-member`,
`magic-link`, `manage-billing`, `manage-organization`, `member-role`, `notification-bell`,
`onboarding`, `page-admin`, `reset-password`, `sign-in`, `sign-out`, `signup`, `tenant-switcher`

**Entities** (`src/entities/`): `cms-page`, `invitation`, `notification`, `refund`,
`subscription`, `tenant`, `user`, `webhook-log`

**Widgets** (`src/widgets/`): `dashboard-personal-welcome`, `dashboard-signup-chart`,
`dashboard-stat-card`

**Shared UI** (`src/shared/ui/`): `AppLayout`, `AuthLayout`, `AuthGuard`, `TenantOwnerOnly`,
`LoadingOverlay`, `ErrorBoundary`, `UserStatusBadge`, `TenantStatusBadge`,
`InvitationStatusBadge`, `PageHeader`, `ColorSchemeToggle`, `LocaleSwitcher`

**Shared API** (`src/shared/api/`): `httpClient`, `authApi`, `iamApi`, `billingApi`, `cmsApi`,
`oauth2Api`, `passwordResetApi`, `signupApi`, `auth-interceptor` (side-effect import)

**Shared Lib** (`src/shared/lib/`): `validateWithZod`, `queryClient`, `decodeJwt`,
`isTenantOwner`, `isTenantSession`, `rollout` helpers, `color-utils`, `date-utils`,
`page-title`, `oauth2-post-auth`, `test-selectors`

### FSD Layer Rules (CRITICAL — ENFORCED BY TESTS)

1. **Import Rule**: Higher layers can ONLY import from lower layers
   - ❌ `shared` cannot import from `features`
   - ✅ `features` can import from `shared` and `entities`
   - ✅ `processes` can import from `features`, `entities`, and `shared`

2. **Public API (MANDATORY)**: Every slice MUST expose functionality through `index.ts`
   - ✅ `from "@/features/sign-in"` — correct
   - ❌ `from "@/features/sign-in/model/use-sign-in"` — never import internals
   - Architecture tests fail if any slice is missing `index.ts`

3. **Cross-Feature Isolation**: Features cannot import each other
   - Common code → `shared/`
   - Cross-feature orchestration → `processes/`

4. **Segment Structure** (convention, not test-enforced):

   ```
   feature-name/
   ├── ui/       # React components
   ├── model/    # Hooks, business logic, types
   └── index.ts  # Public API exports (REQUIRED)
   ```

   Note: `processes/` slices may be flat files (e.g., `session.store.ts`) rather than using
   `model/` subfolders — both are valid.

5. **Naming Conventions (ENFORCED BY TESTS)**:
   - Pages: kebab-case `.tsx` files (e.g., `sign-in.tsx`, `forgot-password.tsx`)
   - Shared UI components: kebab-case folders (e.g., `auth-guard/`, `loading-overlay/`)
   - Features: kebab-case folders (e.g., `sign-in/`, `reset-password/`)

6. **Architecture Testing**: Run `pnpm test:arch` to verify FSD compliance
   - Verifies all FSD layers exist
   - Verifies all slices in `features/`, `widgets/`, `processes/` have `index.ts`
   - Verifies `shared/` has `api/`, `lib/`, `ui/`, `types/` segments
   - Verifies `shared/ui/index.ts` exists
   - Verifies kebab-case naming for pages and shared/ui components

## AI Agent Development Guidelines

### Code Generation Principles

1. **Always Follow FSD Architecture**: Respect layer boundaries and public APIs
2. **Type-First Development**: Define TypeScript interfaces before implementation
3. **Component Composition**: Prefer composition over complex prop drilling
4. **Performance by Default**: Use `React.memo`, `useMemo`, `useCallback` appropriately
5. **Accessibility First**: Include ARIA attributes and semantic HTML
6. **Test-Driven Approach**: Generate tests alongside components when requested

### Communication & Output Standards (CRITICAL)

**AI agents MUST communicate concisely and avoid unnecessary verbosity.**

#### Concise Output Requirements

1. **Be Direct**: No lengthy preambles
2. **Avoid Repetition**: Don't repeat information already stated
3. **Use Bullet Points**: For lists and multiple items
4. **Skip Obvious Statements**: Don't narrate what you are doing while doing it
5. **Minimal Summaries**: 2–3 sentences maximum after task completion
6. **No Fluff**: Avoid "I'll now proceed to...", "Let me...", "I'm going to..."

#### Response Length Guidelines

- **Simple tasks**: 1–2 sentences + commit message
- **Medium tasks**: 3–5 sentences highlighting key changes
- **Complex tasks**: Brief summary + commit message + offer to explain details

#### Prohibited: Auto-Generated Documentation Files

**NEVER automatically create summary or review markdown files unless explicitly requested.**

❌ Do NOT create: `SUMMARY.md`, `REVIEW.md`, `CHANGES.md`, `IMPLEMENTATION_NOTES.md`, or any other files summarizing your work.

✅ Instead: Provide a brief verbal summary and a commit message.

#### When Presenting Changes for Approval

```markdown
## Proposed Changes

**Goal**: Add logout button to navigation

**Files**:

- `features/sign-out/` — already exists, use `SignOutButton` from it
- `widgets/dashboard-personal-welcome/` — integrate button

**Key Changes**:

- Import and render `SignOutButton` in the widget
- i18n already handled inside the feature

Proceed?
```

## User Confirmation Policy & Decision Framework

### CRITICAL RULE: Always Ask Before Applying Changes

**AI agents MUST obtain explicit user approval before modifying any files, creating new files, or executing commands that alter the codebase.**

### Approval Workflow (MANDATORY)

```
1. ANALYZE    → Understand the user request
2. EXPLAIN    → Describe what changes will be made and why
3. PRESENT    → Show proposed changes with code snippets
4. WAIT       → ⚠️ STOP and wait for explicit user approval
5. APPLY      → Only after approval, make the changes
6. VERIFY     → Confirm changes work as expected
```

**NEVER skip step 4 (WAIT) for operations that modify the codebase.**

### Operations Requiring Approval

- ✋ Creating, modifying, deleting, or moving files
- ✋ Adding new features, refactoring, or bug fixes
- ✋ Updating dependencies or configurations
- ✋ Creating new FSD layers or slices
- ✋ Installing or removing packages

### Operations NOT Requiring Approval

- ✅ Reading files and searching code
- ✅ Explaining concepts or answering questions
- ✅ Providing code examples or suggestions
- ✅ Running type checks or reviewing git history

### User Approval Phrases

Wait for: "Yes, go ahead", "Proceed", "Apply the changes", "Do it", "Looks good", "Approved"

### Verification After Changes

1. Run `pnpm type-check` to catch TypeScript errors
2. Run `pnpm test:arch` for FSD compliance if layers were modified
3. Report results concisely (2–3 sentences max)
4. Generate a commit message

## Development Guidelines

### Component Development Standards

1. **Mantine v9 Components First**: Use Mantine UI as building blocks — `TextInput`, `PasswordInput`, `Button`, `Stack`, `Group`, `Card`, etc.
2. **TypeScript Interfaces**: Define strict interfaces for all props
3. **Component Naming**: PascalCase component, kebab-case filename (e.g., `SignInForm` in `sign-in-form.tsx`)
4. **Feature-Sliced Structure**: Organize by feature, not file type
5. **Lingui macros**: Use `t` macro from `@lingui/core/macro` for static strings, `Trans` from `@lingui/react/macro` for JSX, `useLingui()` for runtime translations

**Real feature component pattern (from `features/sign-in/ui/sign-in-form.tsx`):**

```tsx
import { TextInput, PasswordInput, Button, Stack, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useSignIn } from "../model/use-sign-in";
import type { SignInFormValues } from "../model/use-sign-in";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const { t } = useLingui();
  const { form, isLoading, errorMessage, onSubmitCredentials } = useSignIn(redirectTo);

  return (
    <form onSubmit={form.onSubmit(onSubmitCredentials)} noValidate data-testid="sign-in-form">
      <Stack gap="md">
        {errorMessage && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" role="alert">
            {errorMessage}
          </Alert>
        )}
        <TextInput
          label={t`Email`}
          type="email"
          autoComplete="email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label={t`Password`}
          autoComplete="current-password"
          disabled={isLoading}
          {...form.getInputProps("password")}
        />
        <Button type="submit" fullWidth loading={isLoading}>
          <Trans>Continue</Trans>
        </Button>
      </Stack>
    </form>
  );
}
```

### Form Handling Standards

The project uses **`@mantine/form`** directly combined with `validateWithZod` from `shared/lib`.
There is no shared `FormField` wrapper component, no `formSchemas` proxy, and no `useFormMutation`
hook — use Mantine form and TanStack Query `useMutation` directly.

**Real pattern (from `features/sign-in/model/use-sign-in.ts`):**

```ts
import { useForm } from "@mantine/form";
import { z } from "zod";
import { t } from "@lingui/core/macro";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

// Build schema inside a factory function so t`` macros re-evaluate after locale change
function buildSignInSchema() {
  return z.object({
    email: z
      .string()
      .min(1, t`Email is required`)
      .email(t`Enter a valid email address`),
    password: z.string().min(1, t`Password is required`),
  });
}

export type SignInFormValues = z.infer<ReturnType<typeof buildSignInSchema>>;

// Inside the hook:
const form = useForm<SignInFormValues>({
  initialValues: { email: "", password: "" },
  validate: (values) => validateWithZod(buildSignInSchema(), values),
});
```

**`validateWithZod` utility** (`shared/lib/zod-form-validation.ts`):

```ts
export function validateWithZod<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  values: T,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const result = schema.safeParse(values);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors[issue.path.join(".")] = issue.message;
    });
  }
  return errors;
}
```

**Key points:**

- Always use a schema factory function (not a module-level constant) so Lingui `t` macros
  capture the active locale at call time
- Use `form.getInputProps("fieldName")` to bind inputs
- Handle HTTP errors with `isAxiosError` from axios and map status codes to user messages manually
- Use `useMutation` from TanStack Query for API calls, manage loading/error state in the hook

### State Management Standards

#### Zustand for Client State (Process Layer)

Zustand stores live in `processes/` and use plain `create` — no `immer` or `persist` middleware.
Persistence is done manually with `sessionStorage` or `localStorage` helpers.

**Real pattern (from `processes/session/session.store.ts`):**

```ts
import { create } from "zustand";

interface SessionState {
  accessToken: string | null; // in-memory only (cleared on page reload)
  refreshToken: string | null; // persisted in sessionStorage
  tenantKey: string | null; // persisted in sessionStorage
  isPersonalWorkspace: boolean; // persisted in sessionStorage
  setTokens: (
    accessToken: string,
    refreshToken: string,
    tenantKey: string,
    isPersonalWorkspace: boolean,
  ) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: loadFromStorage(REFRESH_TOKEN_KEY),
  tenantKey: loadFromStorage(TENANT_KEY_KEY),
  isPersonalWorkspace: resolvePersonalWorkspaceFlag(
    loadFromStorage(IS_PERSONAL_WORKSPACE_KEY) === "true",
  ),
  setTokens: (accessToken, refreshToken, tenantKey, isPersonalWorkspace) => {
    saveToStorage(REFRESH_TOKEN_KEY, refreshToken);
    saveToStorage(TENANT_KEY_KEY, tenantKey);
    saveToStorage(IS_PERSONAL_WORKSPACE_KEY, String(isPersonalWorkspace));
    set({ accessToken, refreshToken, tenantKey, isPersonalWorkspace });
  },
  setAccessToken: (token) => set({ accessToken: token }),
  clearSession: () => {
    removeFromStorage(REFRESH_TOKEN_KEY);
    // ...
    set({ accessToken: null, refreshToken: null, tenantKey: null, isPersonalWorkspace: false });
  },
}));

// Imperative accessors for use outside React (e.g. Axios interceptors)
export const getAccessToken = (): string | null => useSessionStore.getState().accessToken;
export const clearSession = (): void => useSessionStore.getState().clearSession();
```

**Key patterns:**

- Stores that span features belong in `processes/` layer
- Export both the React hook (`useSessionStore`) and imperative accessors (`getAccessToken`)
  for use in non-React contexts (interceptors, route guards)
- Manual storage helpers instead of `persist` middleware — gives full control over
  which keys live where (sessionStorage vs localStorage)
- `processes/theme` uses `localStorage` for color scheme preference

#### Consuming Session State

```tsx
// In React components — use the hook from processes/session public API
import { useSession } from "@/processes/session";

const { isLoading, isAuthenticated, isTenantOwner, isPersonalWorkspace, tenantKey } = useSession();
```

#### TanStack Query for Server State

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ["members", tenantKey, page],
  queryFn: () => iamApi.listMembers({ tenantKey, page }),
  staleTime: 5 * 60 * 1000,
});

// Mutation
const queryClient = useQueryClient();
const banMutation = useMutation({
  mutationFn: (userId: string) => iamApi.banUser(userId),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
});
```

### API Service Standards

The project uses a single **`httpClient`** Axios instance (not `apiClient`). All API modules are
thin wrappers over it and exported from `shared/api/index.ts`.

**`httpClient`** (`shared/api/http-client.ts`):

- Development: routes through Vite proxy at `/api` — no `withCredentials`
- Production: uses `window.VITE_API_SERVER_URL` (runtime) or `VITE_API_SERVER_URL` (build-time)
  with `withCredentials: true`
- Injects `Accept-Language` header from the active Lingui locale

**`auth-interceptor`** (`shared/api/auth-interceptor.ts`):

- Registered as a side-effect import in `shared/api/index.ts` — must be bootstrapped once
- REQUEST interceptor: attaches `Authorization: Bearer <token>` and `X-Tenant-ID` on all
  non-auth endpoints, reading tokens from `processes/session` imperatively
- RESPONSE interceptor: handles 401 with a deduplicated silent refresh (one in-flight refresh
  shared across concurrent requests), retries the original request, clears session on failure

**Real API module pattern (from `shared/api/auth.ts`):**

```ts
import { httpClient } from "./http-client";

export const authApi = {
  signIn: (body: SignInRequest, tenantKey: string): Promise<SignInResponse> =>
    httpClient
      .post<SignInResponse>("/v1/iam/auth/signin", body, {
        headers: { "X-Tenant-ID": tenantKey },
      })
      .then((r) => r.data),

  signOut: (): Promise<void> => httpClient.post("/v1/iam/auth/signout").then(() => undefined),

  listUserTenants: (email: string, password: string): Promise<TenantMembershipSummary[]> =>
    httpClient
      .post<TenantMembershipSummary[]>("/v1/iam/users/tenants", { email, password })
      .then((r) => r.data),
};
```

**Available API modules** (all exported from `@/shared/api`):

- `httpClient` — base Axios instance
- `authApi` — sign-in, sign-out, tenant discovery, magic link, token exchange
- `iamApi`, `localesApi`, `notificationApi` — IAM, locale, notifications
- `billingApi` — plans, subscriptions, checkout, portal
- `cmsApi` — CMS pages CRUD
- `oauth2Api` — OAuth2/OIDC provider integrations
- `passwordResetApi` — forgot password, reset password
- `signupApi` — user registration

### Authentication & Session Patterns

The app uses a **two-step tenant sign-in flow**:

1. `POST /v1/iam/users/tenants` — discover which tenants the user belongs to
2. `POST /v1/iam/auth/signin` (with `X-Tenant-ID`) — sign in to the selected tenant

After sign-in, tokens are stored in `processes/session`:

- `accessToken` — in-memory only (cleared on page reload, XSS protection)
- `refreshToken` + `tenantKey` — persisted in `sessionStorage` (cleared on tab close)
- `isPersonalWorkspace` — persisted in `sessionStorage` (derived from backend `Tenant.isInternal`)

**Checking session state in components:**

```tsx
import { useSession } from "@/processes/session";

const { isLoading, isAuthenticated, isTenantOwner, isPersonalWorkspace } = useSession();

// isLoading = true when refresh token exists but no access token yet (page reload + silent refresh)
// isAuthenticated = true after silent refresh completes and JWT is valid
```

**`AuthGuard`** and **`TenantOwnerOnly`** components from `shared/ui/auth-guard` handle
route-level protection and can be used directly in page components.

**Rollout modes** (`VITE_ROLLOUT_MODE`):

```ts
import { isMultiTenantMode, isSingleTenantMode } from "@/app/config";
// MULTI_TENANT (default): full tenant picker, org management visible
// SINGLE_TENANT: auto-selects platform tenant, no org UI
```

**Feature flags:**

```ts
import { isDemoMode, isMagicLinkEnabled, paymentGatewayType } from "@/app/config/runtime-env";
```

### JWT Utilities (`shared/lib/jwt.ts`)

```ts
import { decodeJwt, isTenantSession, isTenantOwner } from "@/shared/lib";

const payload = decodeJwt(accessToken); // JwtPayload | null
// payload.sub, payload.userId, payload.email, payload.tenant_id
// payload.authorities: string[] — e.g. ["TENANT_OWNER"]
// payload.onboarding_completed, payload.profile_completed
```

## Environment Setup

### Development Requirements

- **Node.js**: >= 24.0.0
- **Package Manager**: pnpm 10.33.2 (required — specified in `packageManager` field)
- **Editor**: VS Code with recommended extensions

### Environment Variables

```env
# Backend API Configuration
VITE_API_SERVER_URL=https://api.iqkv.site/api   # Full API URL (production)
                                                  # Dev uses /api proxy — no config needed

# Application Configuration
VITE_LOG_LEVEL=info                              # Logging level: silent/info/debug

# Platform rollout mode
VITE_ROLLOUT_MODE=MULTI_TENANT                  # MULTI_TENANT (default) or SINGLE_TENANT

# Feature flags
VITE_DEMO_MODE=false                            # Show demo credential hints
VITE_ENABLE_MAGIC_LINK=true                     # Enable magic link sign-in
VITE_PAYMENT_GATEWAY_TYPE=STRIPE               # STRIPE (default) or LEMON_SQUEEZY
```

### Runtime Configuration Override

`public/config.js` is loaded before the app bundle. Any `window.VITE_*` value set there
overrides the build-time `.env` values. This enables environment-specific configuration
without rebuilding for containerized deployments.

```ts
// app/config/runtime-env.ts — actual implementation
const readRuntimeEnv = (key: string): string | undefined => {
  const w: any = typeof window !== "undefined" ? window : undefined;
  return (w && w[key]) ?? import.meta.env?.[key];
};
```

### Development Scripts

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:5173), proxies /api to backend
pnpm build                  # Type-check + extract i18n + compile i18n + Vite build
pnpm preview               # Preview production build

# Testing
pnpm test                  # Run unit tests (Vitest, single run)
pnpm test:coverage         # Run tests with coverage report
pnpm test:ui               # Run tests with Vitest UI
pnpm test:arch             # Run FSD architecture boundary tests
pnpm e2e                   # Run E2E tests with Playwright
pnpm e2e:ui                # Playwright UI mode
pnpm e2e:headed            # Playwright headed mode
pnpm e2e:smoke             # Smoke tests on Chromium only
pnpm e2e:auth              # Auth-specific E2E tests
pnpm e2e:a11y              # Accessibility E2E tests
pnpm playwright:install    # Install Playwright browsers (first time setup)

# Code Quality
pnpm lint                  # Run OxLint (type-aware)
pnpm lint:fix              # Fix linting issues and format code
pnpm formatter:check       # Check code formatting with OxFmt
pnpm formatter:write       # Format code with OxFmt
pnpm type-check            # TypeScript type checking (no emit)
pnpm knip                  # Detect unused exports and dependencies

# Internationalization
pnpm messages:extract      # Extract translation messages from source
pnpm messages:compile      # Compile PO catalogs to TypeScript modules

# Maintenance
pnpm cleanup               # Remove dist, .tanstack, coverage, caches
pnpm cleanup:all           # Full cleanup including node_modules
```

## Internationalization with Lingui 6

**Locales**: `en-US` (source) and `bg-BG`. Catalog files live in `locales/en-US.ts` and
`locales/bg-BG.ts` (compiled from `locales/en-US/` and `locales/bg-BG/` PO files).

### Locale Detection

Locale preference is stored as a cookie (`locale=`). On startup, `getClientLocale()` reads
the cookie then falls back to `navigator.language`, then to `"en-US"`.

### Setup in `app/app.tsx`

```tsx
useEffect(() => {
  const loadLocale = async () => {
    const { dynamicActivateLocale, getClientLocale } = await import("@/shared/locales");
    await dynamicActivateLocale(getClientLocale());
    setIsInitialLoading(false);
  };
  loadLocale().catch(() => setIsInitialLoading(false));
}, []);
```

### Translation Patterns

```tsx
// Static strings — compile-time extraction
import { t } from "@lingui/core/macro";
<TextInput label={t`Email`} placeholder={t`you@example.com`} />;

// JSX interpolation
import { Trans } from "@lingui/react/macro";
<Trans>Select the workspace you want to sign in to.</Trans>;

// Runtime translation (component context)
import { useLingui } from "@lingui/react/macro";
const { t } = useLingui();
const label = t`Email`;

// In validation schemas — use the t macro inside a factory function
// (NOT a module-level const) so it captures the current locale
function buildSchema() {
  return z.object({
    email: z.string().min(1, t`Email is required`),
  });
}
```

### Extraction and Compilation

```bash
pnpm messages:extract   # Scans src/ for t`...`, Trans, msg macros → updates PO files
pnpm messages:compile   # Compiles PO → TypeScript modules (required before build)
```

## Testing Strategy

### Testing Stack

- **Unit Tests**: Vitest + React Testing Library, co-located with source files
- **E2E Tests**: Playwright (`e2e/` directory)
- **Architecture Tests**: Vitest (`src/architecture.test.ts`)
- **Coverage**: Vitest + `@vitest/coverage-v8`

### Test Co-location Pattern (CRITICAL)

Tests MUST be placed in the same directory as the source file they test:

```
src/features/sign-in/
├── ui/
│   ├── sign-in-form.tsx
│   └── sign-in-form.test.tsx     ← co-located
├── model/
│   ├── use-sign-in.ts
│   └── use-sign-in.test.ts       ← co-located
└── index.ts
```

### Unit Test Setup (`src/setupTests.ts`)

```ts
import "@testing-library/jest-dom";

// Required for Mantine components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

### Unit Test Pattern

```tsx
// features/sign-in/ui/sign-in-form.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { messages } from "../../../../locales/en-US";

i18n.load("en-US", messages);
i18n.activate("en-US");

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <MantineProvider>{children}</MantineProvider>
  </I18nProvider>
);

describe("SignInForm", () => {
  it("renders email and password fields", () => {
    render(<SignInForm />, { wrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
```

### E2E Test Structure

```
e2e/
├── tests/
│   ├── auth/          # Auth flow tests (login, signup, magic link)
│   ├── a11y/          # Accessibility tests (axe-core)
│   ├── settings/      # Settings page tests
│   └── smoke/         # Quick smoke tests
└── fixtures/          # Playwright fixtures and helpers
```

### Test Selectors

The project provides a `test-selectors.ts` utility in `shared/lib` for consistent
`data-testid` attribute usage across unit and E2E tests:

```ts
import { testId } from "@/shared/lib";
// Use data-testid attributes: data-testid="sign-in-form", data-testid="sign-in-email-input"
```

## Code Quality Standards

### Code Quality Checklist for AI

- [ ] TypeScript strict mode compliance — no `any` without justification
- [ ] FSD layer boundaries respected — no upward imports
- [ ] Slice has `index.ts` public API — internal files not imported directly
- [ ] Mantine v9 components used as building blocks
- [ ] i18n with Lingui macros — no bare string literals in UI
- [ ] Accessibility attributes (`aria-*`, `role`, semantic HTML)
- [ ] `data-testid` attributes on key interactive elements
- [ ] Zod schema in a factory function (not module-level) for i18n correctness
- [ ] Error states handled and displayed to the user
- [ ] Loading states using Mantine `loading` prop or `LoadingOverlay`

### Linting & Formatting

- **OxLint** (`pnpm lint`) — type-aware, runs in CI
- **OxFmt** (`pnpm formatter:check`) — enforced in pre-commit via lint-staged
- **Stylelint** (`pnpm lint:stylelint`) — for CSS files

Pre-commit hook runs `oxfmt --check` on all staged files and `sort-package-json` on
`package.json` changes.

### Commit Standards

```bash
pnpm commit   # Interactive commit via cz-conventional-changelog
```

Examples:

- `feat(sign-in): add magic link fallback option`
- `fix(session): restore workspace flag on page reload`
- `refactor(tenant-switcher): simplify tenant selection flow`
- `test(sign-in): add unit tests for credential validation`
- `chore(deps): update mantine to v9.4.1`

## AI Commit Message Generation (REQUIRED)

After completing tasks involving multiple file changes, generate a commit message in
Conventional Commits format.

### Format

```
<type>(<scope>): <subject>

<body>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`  
**Scope**: affected feature/module (e.g., `sign-in`, `session`, `billing`, `shared`)  
**Subject**: imperative, lowercase, ≤ 50 chars, no trailing period

### Presentation Format

```markdown
## Task Complete ✓

**Suggested Commit Message**:
```

feat(invite-member): add role selection to invitation form

- Add role dropdown using member-role feature
- Validate role is selected before submit
- Add i18n for new role labels

```

```

### Good Examples

```
fix(session): clear workspace flag on sign-out
feat(tenant-switcher): support internal tenant badge display
refactor(sign-in): extract tenant picker into separate component
chore: update mantine to v9.4.1
test(use-sign-in): add coverage for single-tenant auto-select path
```

### Bad Examples (avoid)

```
fix: fix bug
feat: update stuff
chore: changes
```

## Adding a New Feature (Step-by-Step)

This shows how to add a new feature following all project conventions.

**Example: "block-user" feature**

### 1. Create the slice structure

```
src/features/block-user/
├── ui/
│   └── block-user-button.tsx
├── model/
│   └── use-block-user.ts
└── index.ts
```

### 2. Define the model hook (`model/use-block-user.ts`)

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";

export function useBlockUser(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => iamApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  return {
    blockUser: mutation.mutate,
    isBlocking: mutation.isPending,
    error: mutation.error,
  };
}
```

### 3. Build the component (`ui/block-user-button.tsx`)

```tsx
import { Button } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { useBlockUser } from "../model/use-block-user";

interface BlockUserButtonProps {
  userId: string;
}

export function BlockUserButton({ userId }: BlockUserButtonProps) {
  const { blockUser, isBlocking } = useBlockUser(userId);

  return (
    <Button color="red" variant="light" loading={isBlocking} onClick={() => blockUser()}>
      <Trans>Block User</Trans>
    </Button>
  );
}
```

### 4. Export through public API (`index.ts`)

```ts
export { BlockUserButton } from "./ui/block-user-button";
export { useBlockUser } from "./model/use-block-user";
```

### 5. Use in a page or widget

```tsx
import { BlockUserButton } from "@/features/block-user";
```

### 6. Run architecture tests

```bash
pnpm test:arch   # Verifies index.ts exists, kebab-case naming, etc.
pnpm type-check  # TypeScript validation
```

## Routing

TanStack Router uses file-based routing. Route files live in `src/pages/`:

```
src/pages/
├── __root.tsx             # Root layout (wraps everything)
├── _app.tsx               # Authenticated area layout + auth guard
├── _app/                  # Authenticated routes
│   ├── index.tsx          # Dashboard
│   ├── team.tsx           # Team management
│   ├── cms-pages.tsx      # CMS pages layout
│   ├── cms-pages.index.tsx
│   ├── cms-pages.$pageId.tsx
│   ├── cms-pages.create.tsx
│   ├── billing/           # Billing sub-routes
│   └── settings/          # Settings sub-routes
├── sign-in.tsx
├── signup.tsx
├── forgot-password.tsx
├── reset-password.tsx
├── magic-link.tsx
├── magic-link.index.tsx
├── magic-link.verify.tsx
├── auth.callback.tsx      # OAuth2 callback
├── invite.$token.tsx      # Invitation acceptance
├── complete-profile.tsx
├── create-organization.tsx
├── verify-email.tsx
├── unauthorized.tsx
├── 404.tsx
└── 500.tsx
```

**Route generation**: `src/routeTree.gen.ts` is auto-generated by the TanStack Router
Vite plugin — do not edit manually. The plugin runs during `pnpm dev` and `pnpm build`.

**Route context**: The router is initialized with `{ queryClient }` context so routes can
prefetch queries in `loader` functions.

**Navigation progress**: `@mantine/nprogress` NProgress bar is wired to `router.subscribe()`
in `app/app.tsx` — no extra setup needed in new routes.

## App Bootstrap (`app/app.tsx`)

The full provider stack in order (outermost to innermost):

```
StrictMode
  └── HelmetProvider         (@dr.pogodin/react-helmet)
       └── I18nProvider      (Lingui — i18n instance)
            └── ErrorBoundary (shared/ui)
                 └── MantineProvider  (theme + colorSchemeManager + cssVariablesResolver)
                      └── ModalsProvider
                           ├── NavigationProgress  (@mantine/nprogress)
                           ├── Notifications       (@mantine/notifications)
                           ├── LoadingOverlay      (shown during initial locale load)
                           └── QueryClientProvider (TanStack Query)
                                ├── RouterProvider  (TanStack Router)
                                └── ReactQueryDevtools
```

**Color scheme**: `localStorageColorSchemeManager` from Mantine persists the preference
under the key `"iqkv_color_scheme"` — same key used by `processes/theme/theme.store.ts`.

**Locale loading**: Happens asynchronously in `useEffect` on mount. A `LoadingOverlay`
is shown until the locale is loaded to prevent flash of untranslated content.

## Shared UI Components Reference

All exported from `@/shared/ui`:

| Component               | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `AppLayout`             | Authenticated app shell with nav sidebar           |
| `AuthLayout`            | Centered card layout for auth pages                |
| `AuthGuard`             | Redirects unauthenticated users to `/sign-in`      |
| `TenantOwnerOnly`       | Renders children only for `TENANT_OWNER` authority |
| `LoadingOverlay`        | Full-screen or container loading overlay           |
| `ErrorBoundary`         | React error boundary with retry button             |
| `UserStatusBadge`       | Badge for user status (active, banned, etc.)       |
| `TenantStatusBadge`     | Badge for tenant status                            |
| `InvitationStatusBadge` | Badge for invitation status                        |
| `PageHeader`            | Page title with breadcrumbs                        |
| `ColorSchemeToggle`     | Light/dark/auto toggle button                      |
| `LocaleSwitcher`        | Locale selector dropdown                           |
