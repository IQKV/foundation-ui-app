# AI Agent Development Guide

## Project Overview

**IQ Key Value Mantine UI Project Layout** - A modern, feature-rich template for building scalable React applications with the latest tools and best practices. Built with Feature-Sliced Design (FSD) architecture, this template provides a production-ready foundation for React projects with comprehensive tooling, testing infrastructure, and internationalization support.

**Key Characteristics:**

- Type-safe development with TypeScript 6 strict configuration
- Feature-Sliced Design with enforced layer boundaries (automated architecture tests)
- Modern build tooling with Vite 8 and SWC compiler
- Internationalization with Lingui (lazy-loaded translations for en, ru, it)
- Mock Service Worker (MSW) for API mocking in development and testing
- Comprehensive testing with Vitest and Playwright
- Production-ready with Docker Compose and CI/CD workflows
- Runtime configuration override support via `public/config.js`

## Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features and improved performance
- **TypeScript 6** - Strict type safety with latest language features
- **Vite 8** - Lightning-fast development with instant HMR and optimized builds
- **PNPM 10.33.2** - Fast, disk space efficient package manager (required)

### UI & Styling

- **Mantine UI v8** - Modern React components library with comprehensive theming
- **Mantine Extensions** - Carousel, Charts, Dates, Dropzone, Form, Hooks, Modals, Notifications, NProgress, Tiptap
- **Tabler Icons** - Beautiful SVG icons optimized for React (4000+ icons)
- **PostCSS** - CSS processing with Mantine preset and simple vars
- **XYFlow React** - Node-based UI and flow diagrams
- **Lottie Web** - High-quality animations

### Routing & State

- **TanStack Router v1** - Type-safe file-based routing with code splitting and search params
- **TanStack Query v5** - Powerful data synchronization and caching
- **Zustand** - Lightweight client state management with Immer middleware
- **nuqs** - Type-safe URL search params state management
- **React Hook Form** - Performant form validation and management

### Data & API

- **Axios** - Promise-based HTTP client for API calls
- **Zod 4** - Runtime type validation and schema parsing
- **Mantine Form** - Form state management with Zod resolver integration
- **Mock Service Worker (MSW)** - Client-agnostic API mocking for development and testing
- **JS Cookie** - Simple cookie management
- **jwt-decode** - JWT token decoding

### Development & Quality

- **Vitest** - Fast unit testing with coverage reports and UI
- **Playwright** - Reliable end-to-end testing (Chromium, Firefox, WebKit)
- **Testing Library** - Simple and complete testing utilities for React
- **OxLint** - Ultra-fast linting with type-aware rules
- **OxFmt** - Fast opinionated code formatting
- **Stylelint** - CSS linting for consistent styling
- **Husky** - Git hooks for pre-commit validation
- **Commitlint** - Conventional commit message validation
- **Knip** - Dead code elimination and dependency analysis

### Internationalization & DevOps

- **Lingui 6** - Modern i18n framework with macro support and pluralization
- **Locales** - English, Russian, Italian with PO-based catalogs
- **GitHub Actions** - CI/CD workflows for build, test, and PR validation
- **Dependabot** - Automated dependency updates and security monitoring
- **Release-it** - Automated versioning and changelog generation
- **Docker Compose** - Local SonarQube instance for code quality analysis

## Architecture: Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design methodology with strict layer hierarchy and **automated architecture tests**:

```
src/
├── app/          # Application layer (providers, routing, global styles, config)
├── processes/    # Process layer (cross-feature business processes like auth)
├── pages/        # Page layer (route components)
├── widgets/      # Widget layer (complex UI blocks)
├── features/     # Feature layer (user scenarios, business logic)
├── entities/     # Entity layer (business entities, data models)
├── shared/       # Shared layer (reusable code, UI kit, utilities)
└── architecture.test.ts  # Automated FSD compliance tests
```

**Note:** This template includes a `processes/` layer for cross-cutting concerns that span multiple features (e.g., authentication flows, multi-tenant management, global state orchestration).

### FSD Layer Rules (CRITICAL - ENFORCED BY TESTS)

1. **Import Rule**: Higher layers can ONLY import from lower layers
   - ❌ `shared` cannot import from `features`
   - ✅ `features` can import from `shared` and `entities`
   - ✅ `processes` can import from `features`, `entities`, and `shared`

2. **Public API (MANDATORY)**: Each slice MUST expose functionality through `index.ts`
   - ✅ All imports must go through public API: `from "@/features/signin-form"`
   - ❌ Never import internal files: `from "@/features/signin-form/model/validation"`
   - **Architecture tests verify all slices have index.ts files**

3. **Cross-Feature Isolation**: Features cannot depend on each other
   - Use `shared` layer for common functionality
   - Use `processes` layer for cross-feature orchestration
   - Communicate through `app` layer or events

4. **Segment Structure**: Each slice contains standardized segments

   ```
   feature-name/
   ├── ui/           # React components (REQUIRED - verified by tests)
   ├── model/        # Business logic, stores, types (REQUIRED - verified by tests)
   ├── api/          # API calls and contracts (optional)
   ├── lib/          # Utilities specific to this feature (optional)
   └── index.ts      # Public API exports (REQUIRED - verified by tests)
   ```

5. **Naming Conventions (ENFORCED BY TESTS)**:
   - Pages: kebab-case (e.g., `login.tsx`, `forgot-password.tsx`)
   - Shared UI components: kebab-case folders (e.g., `form-field/`, `error-boundary/`)
   - Features: kebab-case folders (e.g., `signin-form/`, `reset-password-form/`)

6. **Architecture Testing**: Run `pnpm test:arch` to verify FSD compliance
   - Tests verify layer structure exists
   - Tests verify all slices have public API (index.ts)
   - Tests verify required segments (ui/, model/) exist
   - Tests verify naming conventions

## AI Agent Development Guidelines

### Code Generation Principles

1. **Always Follow FSD Architecture**: Respect layer boundaries and public APIs
2. **Type-First Development**: Define TypeScript interfaces before implementation
3. **Component Composition**: Prefer composition over complex prop drilling
4. **Performance by Default**: Use React.memo, useMemo, useCallback appropriately
5. **Accessibility First**: Include ARIA attributes and semantic HTML
6. **Test-Driven Approach**: Generate tests alongside components

### Communication & Output Standards (CRITICAL)

**AI agents MUST communicate concisely and avoid unnecessary verbosity.**

#### Concise Output Requirements

1. **Be Direct**: Get to the point quickly without lengthy preambles
2. **Avoid Repetition**: Don't repeat information already stated
3. **Use Bullet Points**: For lists and multiple items
4. **Skip Obvious Statements**: Don't state what you're about to do if you're already doing it
5. **Minimal Summaries**: Keep task completion summaries to 2-3 sentences maximum
6. **No Fluff**: Avoid phrases like "I'll now proceed to...", "Let me...", "I'm going to..."

#### Examples

❌ **Verbose**:

```
I understand you want to add a logout button. Let me analyze the requirements
and create solution. I'll now proceed to create the necessary
files following the FSD architecture. First, I'll create the feature structure,
then implement the component, and finally add the necessary exports.
```

✅ **Concise**:

```
Adding logout button to navigation.

Files to create:
- features/logout-button/ui/logout-button.tsx
- features/logout-button/model/use-logout.ts
- features/logout-button/index.ts

Proceed?
```

❌ **Verbose Summary**:

```
I have successfully completed the task of adding the logout button feature.
The implementation includes:
- Created the logout button component with proper styling
- Implemented the logout mutation hook with error handling
- Added proper TypeScript types and interfaces
- Integrated with the authentication store
- Added internationalization support
- Exported through the public API as required by FSD

The feature is now ready to use and follows all project conventions.
```

✅ **Concise Summary**:

```
✓ Logout button added to navigation with auth integration and i18n support.
```

#### Prohibited: Auto-Generated Documentation Files

**NEVER automatically create summary or review markdown files unless explicitly requested by the user.**

❌ **Do NOT create**:

- `SUMMARY.md`
- `REVIEW.md`
- `CHANGES.md`
- `IMPLEMENTATION_NOTES.md`
- `TASK_SUMMARY.md`
- Any other documentation files summarizing your work

These files are:

- Wasteful and create noise in the repository
- Rarely useful to the user
- Not part of the project structure
- Redundant with git commit messages

✅ **Instead**:

- Provide a brief verbal summary (2-3 sentences)
- Generate a commit message (as per Commit Message Generation section)
- Answer specific questions if the user asks

#### Exception: User-Requested Documentation

Only create documentation files when:

- User explicitly requests: "Create a README for this feature"
- Project structure requires it: Adding to existing docs folder
- Part of the original task: "Add feature X with documentation"

#### Response Length Guidelines

- **Simple tasks**: 1-2 sentences + commit message
- **Medium tasks**: 3-5 sentences highlighting key changes
- **Complex tasks**: Brief summary + commit message + offer to explain details

#### When Presenting Changes for Approval

Keep proposals focused:

```markdown
## Proposed Changes

**Goal**: Add logout functionality

**Files**:

- features/logout-button/ (new)
- widgets/navigation/ui/navigation.tsx (modify)

**Key Changes**:

- Logout button with confirmation modal
- Auth store integration
- i18n support

Proceed?
```

Not this:

```markdown
## Comprehensive Analysis and Proposed Implementation Strategy

I have thoroughly analyzed your request to add logout functionality...
[3 paragraphs of explanation]

**Detailed Implementation Plan**:
[10 bullet points with sub-bullets]

**Architectural Considerations**:
[5 paragraphs about FSD]

**Risk Assessment**:
[Detailed analysis]

Would you like me to proceed with this carefully planned implementation?
```

### AI-Assisted Development Workflow

```typescript
// 1. Define types first
interface UserProfileProps {
  userId: string;
  onEdit?: (user: User) => void;
  variant?: "compact" | "detailed";
}

// 2. Create component with proper FSD location
// features/user-profile/ui/user-profile.tsx

// 3. Implement with Mantine components
// 4. Write unit tests
// 5. Export through public API
```

### Code Quality Checklist for AI

- [ ] TypeScript strict mode compliance
- [ ] Proper error boundaries and loading states
- [ ] Mantine theme integration
- [ ] Responsive design with Mantine breakpoints
- [ ] Internationalization with Lingui macros
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Performance optimizations (memoization)
- [ ] Unit tests co-located with source files
- [ ] Tests follow existing patterns (Vitest + React Testing Library)

## User Confirmation Policy & Decision Framework

### CRITICAL RULE: Always Ask Before Applying Changes

**AI agents MUST obtain explicit user approval before modifying any files, creating new files, or executing commands that alter the codebase.**

This policy ensures:

- User maintains full control over their codebase
- Changes are reviewed before application
- Unexpected modifications are prevented
- Learning opportunities through explanation

### Approval Workflow (MANDATORY)

```
1. ANALYZE    → Understand the user request and requirements
2. EXPLAIN    → Describe what changes will be made and why
3. ASSESS     → Evaluate impact, risks, and alternatives
4. PRESENT    → Show proposed changes with clear examples
5. WAIT       → ⚠️ STOP and wait for explicit user approval
6. APPLY      → Only after approval, make the changes
7. VERIFY     → Confirm changes work as expected
```

**NEVER skip step 5 (WAIT) for operations that modify the codebase.**

### Operations Requiring User Approval

The following operations ALWAYS require explicit user confirmation:

#### File System Operations

- ✋ Creating new files or directories
- ✋ Modifying existing files (any content changes)
- ✋ Deleting files or directories
- ✋ Moving or renaming files
- ✋ Changing file permissions

#### Code Changes

- ✋ Adding new features or components
- ✋ Refactoring existing code
- ✋ Fixing bugs or issues
- ✋ Updating dependencies or configurations
- ✋ Modifying build scripts or tooling
- ✋ Changing environment variables or configs

#### Architectural Changes

- ✋ Creating new FSD layers or slices
- ✋ Restructuring folder organization
- ✋ Adding new dependencies to package.json
- ✋ Modifying routing structure
- ✋ Changing state management patterns

#### Testing & Quality

- ✋ Adding or modifying tests
- ✋ Updating linting rules
- ✋ Changing formatting configuration
- ✋ Modifying CI/CD workflows

#### Commands with Side Effects

- ✋ Installing or removing packages
- ✋ Running database migrations
- ✋ Executing build or deployment commands
- ✋ Modifying git history or branches
- ✋ Running scripts that modify files

### Operations NOT Requiring Approval

These read-only operations can be performed without explicit approval:

#### Information Gathering

- ✅ Reading files to understand code structure
- ✅ Searching for patterns or specific code
- ✅ Listing directory contents
- ✅ Checking file diagnostics (errors, warnings)
- ✅ Analyzing dependencies or imports

#### Recommendations & Explanations

- ✅ Providing code examples or suggestions
- ✅ Explaining concepts or best practices
- ✅ Answering questions about the codebase
- ✅ Reviewing code and providing feedback
- ✅ Suggesting architectural improvements

#### Non-Destructive Analysis

- ✅ Running type checks (read-only)
- ✅ Analyzing test coverage reports
- ✅ Checking code quality metrics
- ✅ Reviewing git history or diffs

### How to Present Changes for Approval

When proposing changes, use this format:

```markdown
## Proposed Changes

**Goal**: [Brief description of what we're trying to achieve]

**Impact**: [What will change and why]

**Files Affected**:

- `path/to/file1.ts` - [What changes]
- `path/to/file2.tsx` - [What changes]
- `path/to/new-file.ts` - [New file, purpose]

**Changes Preview**:
[Show key code snippets or file structure]

**Risks & Considerations**:

- [Any potential issues or breaking changes]
- [Dependencies or related changes needed]

**Alternatives Considered**:

- [Other approaches and why this one is better]

**Testing Plan**:

- [How to verify the changes work]

---

**Ready to proceed?** Please confirm and I'll apply these changes.
```

### User Approval Phrases

The AI should wait for clear approval phrases such as:

- "Yes, go ahead"
- "Proceed"
- "Apply the changes"
- "Make the changes"
- "Do it"
- "Looks good"
- "Approved"

### Handling User Feedback

If the user provides feedback instead of approval:

- **"Change X to Y"** → Update the proposal and present again
- **"What about Z?"** → Address the question, then re-present
- **"No" or "Cancel"** → Acknowledge and ask what they'd like instead
- **"Show me more"** → Provide additional details or examples

### Multi-Step Changes

For complex changes involving multiple files or steps:

1. **Break down into logical phases**
   - Phase 1: Core functionality
   - Phase 2: UI components
   - Phase 3: Tests and documentation

2. **Get approval for each phase** (or all phases upfront)

3. **Apply incrementally** and verify after each phase

4. **Stop if issues arise** and report back to user

### Exception: Emergency Fixes

In rare cases where the user explicitly requests immediate action:

- "Just fix it"
- "Do whatever is needed"
- "I trust you, go ahead"

Even then, provide a summary of what was changed after completion.

### Decision Framework Examples

#### Example 1: Adding a New Feature

```
❌ WRONG:
User: "Add a logout button"
AI: [Immediately creates files and modifies code]

✅ CORRECT:
User: "Add a logout button"
AI: "I'll add a logout button to the navigation. Here's my plan:

**Changes**:
1. Create `features/logout-button/` with FSD structure
2. Add logout mutation using useFormMutation
3. Integrate into navigation widget
4. Add i18n translations

**Files to create**:
- features/logout-button/ui/logout-button.tsx
- features/logout-button/model/use-logout.ts
- features/logout-button/index.ts

**Files to modify**:
- widgets/navigation/ui/navigation.tsx (add button)
- locales/en/messages.po (add translations)

Would you like me to proceed with this implementation?"
```

#### Example 2: Fixing a Bug

````
❌ WRONG:
User: "The form validation isn't working"
AI: [Reads code, identifies issue, immediately fixes it]

✅ CORRECT:
User: "The form validation isn't working"
AI: [Reads code and analyzes]
"I found the issue. The form is missing the Zod schema in the useForm hook.

**Problem**:
The form in `features/signin-form/ui/signin-form-feature.tsx`
is using useMantineForm directly instead of our enhanced useForm hook.

**Solution**:
Replace useMantineForm with useForm and pass the signInFormSchema.

**Change**:
```tsx
// Before
const form = useMantineForm({ initialValues });

// After
const form = useForm({
  initialValues,
  schema: signInFormSchema
});
````

This will enable Zod validation. Should I apply this fix?"

```

#### Example 3: Information Request (No Approval Needed)

```

✅ CORRECT:
User: "How does the error handling work?"
AI: [Reads relevant files and explains]
"The project uses RFC 7807 Problem Details for error handling:

1. API errors are normalized in `shared/lib/http-error.ts`
2. The `useFormMutation` hook automatically maps field errors
3. Global errors show notifications via interceptors

[Provides code examples and explanation]

Would you like me to show you how to implement this in a specific feature?"

````

### Verification After Changes

After applying approved changes:

1. **Run diagnostics** to check for errors
2. **Verify architecture compliance** (if FSD changes)
3. **Report results** concisely (2-3 sentences max)
4. **Generate commit message** (for complex tasks, see Commit Message Generation)
5. **Suggest next steps** (if relevant, keep brief)

**Important**: Do NOT create summary markdown files. Provide verbal summary only.

### Summary

**The golden rule**: When in doubt, ask for approval. It's better to ask unnecessarily than to make unwanted changes.

**Remember**: Users appreciate transparency and control. Always explain your reasoning and wait for confirmation before modifying their codebase.

## Development Guidelines

### Component Development Standards

1. **Mantine Components First**: Use Mantine UI components as building blocks
2. **TypeScript Interfaces**: Define strict interfaces for all props
3. **Component Naming**: PascalCase, file name matches component name (kebab-case)
4. **Feature-Sliced Structure**: Organize by features, not by file types
5. **Lingui Integration**: Use `msg` macro for labels and `useLingui()._()` for runtime translation

**Example: A generic FormField pattern (example for future implementation)**

```tsx
// shared/ui/form-field/form-field.tsx
// Example pattern for a generic field component - supports many field types
// NOTE: This is a pattern example - implement based on your project needs
import { TextInput, PasswordInput, Select, Checkbox } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";

interface BaseFormFieldProps {
  name: string;
  label: string | MessageDescriptor;
  form: UseFormReturnType<any>;
  placeholder?: string | MessageDescriptor;
  description?: string | MessageDescriptor;
  tooltip?: string | MessageDescriptor;
  showValidationStatus?: boolean;
  withAsterisk?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

// Supports: text, email, password, textarea, number, select, multiselect,
// date, time, datetime, checkbox, switch, radio, file, color
type FormFieldProps = TextFormFieldProps | PasswordFormFieldProps | ...;

export function FormField(props: FormFieldProps) {
  const { _ } = useLingui();
  const { name, label, form, type } = props;

  const resolveMessage = (msg: string | MessageDescriptor | undefined) => {
    if (!msg) return "";
    return typeof msg === "string" ? msg : _(msg);
  };

  const baseProps = {
    label: resolveMessage(label),
    ...form.getInputProps(name),
    error: form.errors[name],
  };

  // Switch based on type with full validation, character counts,
  // password strength indicators, etc.
  switch (type) {
    case "text": return <TextInput {...baseProps} />;
    case "password": return <PasswordInput {...baseProps} />;
    // ... 13 more types
  }
}
````

**Usage in Features:**

```tsx
// features/signin-form/ui/signin-form-feature.tsx
import { FormField } from "@/shared/ui";
import { t } from "@lingui/core/macro";

<FormField
  type="text"
  name="username"
  label={t`Username or Email`}
  placeholder={t`Enter your username or email`}
  leftSection={<IconUser size={16} />}
  required
  form={form}
/>;
```

### State Management Standards

#### TanStack Query for Server State with Enhanced Error Handling

**Pattern for implementing `useFormMutation` hook (example for future implementation):**

```tsx
// shared/lib/use-form-mutation.ts (EXAMPLE PATTERN)
// Implement this pattern when building form-heavy features
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { UseFormReturnType } from "@mantine/form";
import { normalizeAxiosError, toMantineErrors, shouldShowError, getErrorTitle } from "./http-error";
import { notificationService } from "./notifications";

export type NotifyConfig = {
  title?: string;
  message?: string;
  fallback?: string;
};

export type FormMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  unknown,
  TVariables,
  TContext
> & {
  notifySuccess?: NotifyConfig | false;
  notifyError?: (NotifyConfig & { includeFieldErrorsInMessage?: boolean }) | false;
  mapField?: (errors: Record<string, string>) => Record<string, string>;
};

export function useFormMutation<TData, TVariables, TContext = unknown>(
  form: UseFormReturnType<any>,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: FormMutationOptions<TData, TVariables, TContext>,
) {
  const { notifySuccess, notifyError, mapField, onError, onSuccess, ...rest } = options ?? {};

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Clear previous field errors
      form.setErrors({});

      // Show success notification
      if (notifySuccess && (notifySuccess.message || typeof notifySuccess === "object")) {
        notificationService.success({
          title: notifySuccess.title ?? "Success",
          message: notifySuccess.message ?? "Operation completed successfully",
        });
      }

      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const normalized = normalizeAxiosError(error);

      // Map field-level errors to form (supports RFC 7807 Problem Details)
      const fieldErrors = toMantineErrors(normalized);
      const mapped = mapField ? mapField(fieldErrors) : fieldErrors;
      if (Object.keys(mapped).length) {
        form.setErrors(mapped);
      }

      // Show error notification with enhanced RFC 7807 support
      if (notifyError !== false && shouldShowError(error)) {
        notificationService.errorFromAxios(error, {
          title: notifyError?.title || getErrorTitle(error),
        });
      }

      onError?.(normalized as any, variables, context);
    },
    ...rest,
  });
}
```

**Key Features (when implemented):**

- Automatic RFC 7807 Problem Details parsing
- Field-level error mapping to Mantine forms
- Configurable notifications with i18n support
- Custom field mapping for backend/frontend field name differences
- Proper error type detection (network, timeout, auth, validation, server)

#### Zustand for Client State (Process Layer Pattern)

**Pattern for using Zustand in the `processes/` layer (example for future implementation):**

```tsx
// processes/auth/model/auth-store.ts (EXAMPLE PATTERN)
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await authApi.login(credentials);
          set((state) => {
            state.user = response.user;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = normalizeAxiosError(error);
            state.isLoading = false;
          });
          throw error;
        }
      },

      logout: async () => {
        await authApi.logout();
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
        });
      },

      // ... other actions
    })),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Selectors (exported from auth-selectors.ts)
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
```

**Key Patterns:**

- Use `processes/` layer for stores that span multiple features
- Use Immer middleware for immutable updates
- Optionally use persist middleware for localStorage sync when appropriate
- Export granular selectors to prevent unnecessary re-renders
- Separate selectors into dedicated files for organization

### API Service Standards with RFC 7807 Support

**Pattern for implementing API client with error handling (example for future implementation):**

```tsx
// shared/api/base.ts (EXAMPLE PATTERN)
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosInstance } from "axios";
import { getConfig, getFinalMSWConfig } from "@/app/config";
import { normalizeAxiosError } from "@/shared/lib/http-error";
import { notificationService } from "@/shared/lib/notifications";
import { useTenantStore } from "@/processes/tenant";
import { i18n } from "@lingui/core";
import { getUserLocalePreference } from "@/shared/lib/locale-preference";
import { getClientLocale } from "@/shared/locales";

const mswEnabled = getFinalMSWConfig().enabled;
const BASE_URL = getConfig("VITE_API_SERVER_URL");

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axios.defaults.withCredentials = true;

apiClient.interceptors.request.use(
  (config) => {
    const tenantId = useTenantStore.getState().currentTenantId;
    if (tenantId && !config.headers["X-Tenant-ID"]) {
      config.headers["X-Tenant-ID"] = tenantId;
    }

    config.headers = config.headers ?? {};

    const currentLocale = i18n.locale || getClientLocale();
    (config.headers as any)["Accept-Language"] = currentLocale;

    const userPreference = getUserLocalePreference();
    if (userPreference) {
      (config.headers as any)["X-User-Locale"] = userPreference;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (!status || !original) {
      return Promise.reject(error);
    }

    const normalized = normalizeAxiosError(error);
    if (normalized.type === "server") {
      const cfg = original as any;
      if (!cfg?.__suppressGlobalError) {
        notificationService.error({
          title: "Server error",
          message: normalized.message,
        });
      }
    }

    return Promise.reject(normalized);
  },
);
```

**RFC 7807 Error Handling (`shared/lib/http-error.ts`):**

```tsx
// Supports RFC 7807 Problem Details format
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  correlationId?: string;
  requestId?: string;
  fields?: Array<{
    field: string;
    rejectedValue?: any;
    message: string;
  }>;
}

export type AppErrorType =
  | "network"
  | "timeout"
  | "canceled"
  | "auth"
  | "validation"
  | "client"
  | "server"
  | "unknown";

export interface AppError {
  type: AppErrorType;
  message: string;
  status?: number;
  code?: string | number;
  details?: any;
  requestId?: string;
  correlationId?: string;
  retryable?: boolean;
  cause?: unknown;
}

// Normalizes any error to AppError with RFC 7807 support
export function normalizeAxiosError(err: unknown): AppError;

// Extracts field errors for form validation
export function getFieldErrors(err: unknown): Record<string, string[]>;

// Converts to Mantine form errors
export function toMantineErrors(err: unknown): Record<string, string>;
```

**Key Features (when implemented):**

- Cookie-based authentication (withCredentials: true)
- Multi-tenant support with X-Tenant-ID header
- RFC 7807 Problem Details parsing
- Automatic field error extraction for forms
- Request/correlation ID tracking
- Retryable error detection
- Type-safe error handling

### Form Handling Standards (EXAMPLE PATTERNS)

**Pattern for centralized validation schemas with Lingui i18n (example for future implementation):**

```tsx
// shared/lib/form-validation.ts (EXAMPLE PATTERN)
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { t } from "@lingui/core/macro";

// Factory functions with lazy initialization for i18n
export const createValidationSchemas = () => ({
  email: z
    .string()
    .min(1, t`Email is required`)
    .email(t`Please enter a valid email address`),

  password: z
    .string()
    .min(8, t`Password must be at least 8 characters`)
    .regex(/(?=.*[a-z])/, t`Password must include at least one lowercase letter`)
    .regex(/(?=.*[A-Z])/, t`Password must include at least one uppercase letter`)
    .regex(/(?=.*\d)/, t`Password must include at least one number`)
    .regex(/(?=.*[@$!%*?&])/, t`Password must include at least one special character`),

  username: z
    .string()
    .min(3, t`Username must be at least 3 characters`)
    .regex(/^[a-zA-Z0-9_]+$/, t`Username can only contain letters, numbers, and underscores`),

  usernameOrEmail: z
    .string()
    .trim()
    .min(3, t`Username or email must be at least 3 characters`)
    .refine(
      (value) => {
        const isEmail = value.includes("@");
        return isEmail ? /^\S+@\S+\.\S+$/.test(value) : /^[a-zA-Z0-9_]+$/.test(value);
      },
      t`Please enter a valid username or email address`,
    ),
});

// Lazy-loaded proxy for validation schemas
export const validationSchemas = new Proxy({} as ReturnType<typeof createValidationSchemas>, {
  get(target, prop) {
    if (!_validationSchemas) {
      _validationSchemas = createValidationSchemas();
    }
    return _validationSchemas[prop];
  },
});

// Pre-built form schemas
export const createFormSchemas = () => {
  const schemas = createValidationSchemas();
  return {
    signIn: z.object({
      username: schemas.usernameOrEmail,
      password: schemas.simplePassword,
      rememberMe: z.boolean().default(false),
    }),

    signUp: z
      .object({
        username: schemas.username,
        email: schemas.email,
        firstName: schemas.firstName,
        lastName: schemas.lastName,
        password: schemas.password,
        confirmPassword: z.string().min(1, t`Please confirm your password`),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t`Passwords do not match`,
        path: ["confirmPassword"],
      }),

    resetPassword: z
      .object({
        password: schemas.password,
        confirmPassword: z.string().min(1, t`Please confirm your password`),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t`Passwords do not match`,
        path: ["confirmPassword"],
      }),
  };
};

// Lazy-loaded form schemas
export const formSchemas = new Proxy({} as ReturnType<typeof createFormSchemas>, {
  get(target, prop) {
    if (!_formSchemas) _formSchemas = createFormSchemas();
    return _formSchemas[prop];
  },
});
```

**Enhanced Form Hook (`shared/lib/enhanced-form-hook.ts`):**

```tsx
import { useForm as useMantineForm, UseFormInput, UseFormReturnType } from "@mantine/form";
import { z } from "zod";
import { createFormResolver } from "./form-validation";

export interface UseFormInput<T extends Record<string, any>> extends Omit<
  UseFormInput<T>,
  "validate"
> {
  schema: z.ZodType<any, any, any>;
}

// Standardized form hook with automatic Zod validation
export function useForm<T extends Record<string, any>>(
  input: UseFormInput<T>,
): UseFormReturnType<T> {
  const { schema, ...mantineFormInput } = input;

  return useMantineForm({
    ...mantineFormInput,
    validate: createFormResolver(schema),
  });
}
```

**Feature Implementation Example (Sign-in Form Pattern):**

```tsx
// features/signin-form/model/validation.ts
import { formSchemas } from "@/shared/lib/form-validation";

export const signInFormSchema = formSchemas.signIn;
export type SignInFormSchemaType = z.infer<typeof signInFormSchema>;

export const initialSignInValues: SignInFormSchemaType = {
  username: "",
  password: "",
  rememberMe: false,
};

// features/signin-form/ui/signin-form-feature.tsx
import { useForm } from "@/shared/lib/enhanced-form-hook";
import { FormField } from "@/shared/ui";
import { t } from "@lingui/core/macro";
import { signInFormSchema, initialSignInValues } from "../model/validation";

export function SignInFormFeature() {
  const form = useForm({
    initialValues: initialSignInValues,
    schema: signInFormSchema,
  });

  const loginMutation = useMutation({
    mutationFn: async (values) => await login(values),
    onSuccess: () => (window.location.href = authConfig.redirects.afterLogin),
  });

  return (
    <form onSubmit={form.onSubmit((values) => loginMutation.mutate(values))}>
      <Stack gap="md">
        <FormField
          type="text"
          name="username"
          label={t`Username or Email`}
          placeholder={t`Enter your username or email`}
          leftSection={<IconUser size={16} />}
          required
          form={form}
        />

        <FormField
          type="password"
          name="password"
          label={t`Password`}
          leftSection={<IconLock size={16} />}
          required
          form={form}
        />

        <FormField type="checkbox" name="rememberMe" label={t`Remember me`} form={form} />

        <Button type="submit" loading={loginMutation.isPending}>
          {t`Sign In`}
        </Button>
      </Stack>
    </form>
  );
}

// features/signin-form/index.ts (PUBLIC API - REQUIRED)
export { SignInFormFeature } from "./ui/signin-form-feature";
export type { SignInFormValues } from "./model/types";
```

**Key Patterns:**

- Centralized validation schemas in `shared/lib/form-validation.ts`
- Lazy-loaded schemas for i18n support
- Enhanced form hook wraps Mantine form with Zod
- Use `formSchemas` for common forms (signIn, signUp, resetPassword)
- All features MUST export through `index.ts` (enforced by tests)

## Environment Setup

### Development Requirements

- **Node.js**: >= 24.0.0 (LTS recommended)
- **Package Manager**: pnpm 10.33.2 (required - specified in package.json)
- **Editor**: VS Code with recommended extensions (optional but recommended)

### Environment Variables (TEMPLATE DEFAULTS)

```env
# Backend API Configuration
VITE_API_SERVER_URL=http://localhost:8080/api  # Backend API base URL

# Application Configuration
VITE_LOG_LEVEL=info            # Logging level: silent/info/debug
VITE_ENABLE_MSW=true           # Enable Mock Service Worker for development
TZ=UTC                         # Timezone
NODE_ENV=development           # Environment: development/production
```

**Note:** This is a template project. Customize environment variables based on your specific application needs. Variables can be overridden at runtime via `public/config.js` without rebuilding (useful for containerized deployments).

### Runtime Configuration Pattern

```tsx
// app/config/runtime-env.ts (TEMPLATE PATTERN)
const env = {
  VITE_API_SERVER_URL: import.meta.env.VITE_API_SERVER_URL,
  VITE_ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === "true",
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "info",
  // Add your custom environment variables here
};

export function getConfig<K extends keyof typeof env>(key: K): (typeof env)[K] {
  return env[key];
}
```

**Runtime Override:** Values in `public/config.js` (loaded before app bundle) take precedence over build-time `VITE_*` variables. This enables environment-specific configuration without rebuilding for containerized deployments.

### Editor Configuration

The project uses these formatting rules:

```yaml
# .prettierrc
endOfLine: lf
trailingComma: es5
tabWidth: 2
semi: true
singleQuote: false
```

### Development Scripts

```bash
# Development
pnpm dev                    # Start development server (http://localhost:5173)
pnpm build                  # Build for production (includes i18n compile)
pnpm preview               # Preview production build

# Testing
pnpm test                  # Run unit tests with Vitest
pnpm test:coverage         # Run tests with coverage report
pnpm test:ui               # Run tests with UI interface
pnpm test:arch             # Run FSD architecture boundary tests
pnpm e2e                   # Run E2E tests with Playwright
pnpm e2e:ui                # Run E2E tests with UI interface
pnpm e2e:headed            # Run E2E tests in headed mode
pnpm e2e:smoke             # Run smoke tests on Chromium
pnpm playwright:install    # Install Playwright browsers (first time)

# Code Quality
pnpm lint                  # Run OxLint (type-aware)
pnpm lint:fix              # Fix linting issues and format
pnpm formatter:check       # Check code formatting with OxFmt
pnpm formatter:write       # Format code with OxFmt
pnpm type-check            # TypeScript type checking
pnpm knip                  # Detect unused exports and dependencies

# Internationalization
pnpm messages:extract      # Extract translation messages from source
pnpm messages:compile      # Compile PO catalogs to TypeScript

# Maintenance
pnpm cleanup               # Remove dist, .tanstack, coverage, caches
pnpm cleanup:all           # Full cleanup including node_modules
```

## Testing Strategy

### Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Vitest coverage with v8

### Test Co-location Pattern (CRITICAL)

**Tests MUST be co-located with their source files** following FSD architecture:

```
src/
├── features/
│   └── signin-form/
│       └── ui/
│           ├── signin-form-feature.tsx
│           └── signin-form-feature.test.tsx  ← Test alongside component
├── processes/
│   └── auth/
│       └── model/
│           ├── auth-store.ts
│           └── auth-store.test.ts  ← Test alongside store
├── shared/
│   └── ui/
│       └── error-boundary/
│           ├── error-boundary.tsx
│           └── error-boundary.test.tsx  ← Test alongside component
```

**Benefits:**

- ✅ Tests are easier to find and maintain
- ✅ Changes to components naturally prompt test updates
- ✅ Clear 1:1 relationship between code and tests
- ✅ Follows FSD principles of feature isolation
- ✅ Reduces cognitive load when working on features

**Naming Convention:**

- Component: `component-name.tsx`
- Test: `component-name.test.tsx`
- Store: `store-name.ts`
- Test: `store-name.test.ts`

**When Creating Tests:**

1. Place test file in the same directory as the source file
2. Use `.test.tsx` for component tests
3. Use `.test.ts` for logic/store tests
4. Follow existing test patterns in the project

### Unit Testing with Mantine Components

```tsx
// shared/ui/form-field/form-field.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormField } from "./form-field";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const FormFieldTestComponent = ({ type, ...props }: any) => {
  const form = useForm({
    initialValues: { testField: "" },
  });

  return <FormField name="testField" label="Test Field" form={form} type={type} {...props} />;
};

describe("FormField", () => {
  it("renders text input correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" placeholder="Enter text" />
      </TestWrapper>,
    );

    const input = screen.getByLabelText("Test Field");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("handles user input correctly", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" />
      </TestWrapper>,
    );

    const input = screen.getByLabelText("Test Field");
    await user.type(input, "test value");

    expect(input).toHaveValue("test value");
  });
});
```

### Feature Testing with TanStack Query

```tsx
// features/sample-form/ui/sample-form-feature.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { SampleFormFeature } from "./sample-form-feature";

// Mock the form mutation hook
vi.mock("@/shared/lib", () => ({
  ...vi.importActual("@/shared/lib"),
  useFormMutation: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
};

describe("SampleFormFeature", () => {
  const mockMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useFormMutation } = await import("@/shared/lib");
    (useFormMutation as any).mockReturnValue(mockMutation);
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockMutation.mutateAsync.mockResolvedValue(undefined);

    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const openButton = screen.getByRole("button", { name: /open form/i });
    await user.click(openButton);

    // Fill form
    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
    });
  });
});
```

### E2E Testing Best Practices

By following these guidelines, you can create a well-structured and maintainable Playwright test suite:

1. **Organized Folder Structure:** Separate tests based on their context (logged-in vs. logged-out) and per feature. For example:

   ```
   e2e/
   ├── auth/
   │   ├── login.spec.ts
   │   └── signup.spec.ts
   └── features/
       └── dashboard.spec.ts
   ```

2. **Using Hooks and Describe Blocks:** Improve readability and set up common prerequisites with `beforeAll`, `beforeEach`, `afterAll`, `afterEach` and organize tests into logical groups.

3. **Step Definition:** Use `test.step` to break down complex test cases into smaller, readable steps.

4. **Leveraging Annotations and Tags:** Use annotations and tags to mark failing or incomplete tests, link issues, and categorize your tests for better filtering and reporting.

### Test Setup Configuration

```tsx
// src/setupTests.ts
import "@testing-library/jest-dom";

// Mock window.matchMedia for Mantine components
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

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## Performance Optimization

### Code Splitting with TanStack Router

```tsx
// pages/examples.tsx
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { LoadingOverlay } from "@/shared/ui";

const ExamplesPage = lazy(() => import("../widgets/examples-page"));

export const Route = createFileRoute("/examples")({
  component: () => (
    <Suspense fallback={<LoadingOverlay visible message="Loading examples..." />}>
      <ExamplesPage />
    </Suspense>
  ),
});
```

### Mantine Component Optimization

```tsx
// shared/ui/data-table/data-table.tsx
import { memo, useMemo } from "react";
import { DataTable as MantineDataTable } from "mantine-datatable";
import type { DataTableProps } from "mantine-datatable";

interface OptimizedDataTableProps<T> extends Omit<DataTableProps<T>, "records"> {
  data: T[];
  searchQuery?: string;
  searchFields?: (keyof T)[];
}

export const DataTable = memo(
  <T extends Record<string, any>>({
    data,
    searchQuery,
    searchFields = [],
    ...props
  }: OptimizedDataTableProps<T>) => {
    const filteredData = useMemo(() => {
      if (!searchQuery || !searchFields.length) return data;

      return data.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }, [data, searchQuery, searchFields]);

    return <MantineDataTable records={filteredData} highlightOnHover striped {...props} />;
  },
);
```

### TanStack Query Optimization

```tsx
// shared/lib/queries/use-users-query.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiClient } from "@/shared/api";

export function useUsersQuery(params?: { page?: number; search?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => apiClient.get("/users", { params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: params?.enabled ?? true,
  });
}

// Prefetch for better UX
export function usePrefetchUsers() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: { page?: number; search?: string }) => {
      queryClient.prefetchQuery({
        queryKey: ["users", params],
        queryFn: () => apiClient.get("/users", { params }),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient],
  );
}
```

## Internationalization with Lingui

**The template uses lazy-loaded translations with dynamic locale activation:**

### Setup and Usage

```tsx
// shared/locales/index.ts (TEMPLATE IMPLEMENTATION)
import { i18n } from "@lingui/core";

export async function dynamicActivateLocale(locale: string) {
  const { messages } = await import(`./locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export function getClientLocale(): string {
  // Check localStorage, navigator.language, or default to 'en'
  return localStorage.getItem("locale") || navigator.language.split("-")[0] || "en";
}

// app/app.tsx - Lazy load locale after mount
useEffect(() => {
  const loadLocale = async () => {
    const { dynamicActivateLocale, getClientLocale } = await import("@/shared/locales");
    await dynamicActivateLocale(getClientLocale());
  };
  loadLocale().catch(console.error);
}, []);
```

### Translation Patterns

```tsx
// Use t macro for static strings (compile-time)
import { t } from "@lingui/core/macro";

<FormField label={t`Username or Email`} placeholder={t`Enter your username or email`} />;

// Use Trans for JSX with interpolation
import { Trans } from "@lingui/core/macro";

<h1>
  <Trans>Welcome, {userName}!</Trans>
</h1>;

// Use useLingui for runtime translations
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

const { _ } = useLingui();
const message = _(msg`Dynamic message`);

// In validation schemas (lazy-loaded)
import { t } from "@lingui/core/macro";

const schema = z.string().min(3, t`Must be at least 3 characters`);
```

### Message Extraction and Compilation

```bash
# Extract messages from source code
pnpm messages:extract

# Compile messages for production
pnpm messages:compile
```

**Key Features:**

- Lazy-loaded translations (not bundled in main chunk)
- Compile-time extraction with `t` macro
- Runtime translation with `useLingui()._()`
- Support for pluralization and context
- Integrated with Zod validation schemas
- FormField component supports MessageDescriptor for labels

## Error Handling Best Practices

### Global Error Boundary

```tsx
// shared/ui/error-boundary/error-boundary.tsx
import { Alert, Button, Container, Stack, Title } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl">
          <Stack align="center" gap="lg">
            <Title order={2}>Something went wrong</Title>

            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Application Error"
              color="red"
              variant="light"
            >
              {this.state.error?.message || "An unexpected error occurred"}
            </Alert>

            <Button
              leftSection={<IconRefresh size="1rem" />}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}
```

## Code Quality Standards

### ESLint Configuration

The project uses Mantine's ESLint configuration with additional rules:

- **TanStack Query**: Enforces query best practices
- **TanStack Router**: Ensures proper route configuration
- **Lingui**: Validates translation usage
- **React Hooks**: Prevents common hook mistakes

### Commit Standards

```bash
# Conventional Commits with Commitizen
pnpm commit  # Interactive commit with proper formatting

# Examples:
feat: add user profile form
fix: resolve validation error in login form
docs: update API documentation
test: add unit tests for form components
```

### AI Commit Message Generation (REQUIRED)

**After completing complex tasks involving multiple file changes, AI agents MUST generate a concise, well-structured commit message following Conventional Commits format.**

#### When to Generate Commit Messages

Generate commit messages after:

- ✅ Creating new features or components
- ✅ Fixing bugs across multiple files
- ✅ Refactoring code structure
- ✅ Adding or updating tests
- ✅ Updating documentation
- ✅ Modifying configuration or build files
- ✅ Any task that results in file modifications

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type** (required):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (deps, config, build)
- `perf`: Performance improvements

**Scope** (optional): Feature or module affected (e.g., `signin-form`, `auth`, `api`)

**Subject** (required):

- Concise summary (50 chars or less)
- Imperative mood ("add" not "added")
- No period at the end
- Lowercase after colon

**Body** (optional but recommended for complex changes):

- Explain WHAT changed and WHY
- Wrap at 72 characters
- Separate from subject with blank line
- Use bullet points for multiple changes

**Footer** (optional):

- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Closes #123`, `Fixes #456`

#### Examples

**Simple Feature:**

```
feat(logout): add logout button to navigation

Add logout functionality with confirmation modal and proper state cleanup.
```

**Bug Fix:**

```
fix(signin-form): resolve validation error handling

- Fix Zod schema not being applied to form
- Add proper error message mapping for RFC 7807 responses
- Update form field error display logic
```

**Complex Refactoring:**

```
refactor(auth): migrate to processes layer for cross-feature auth

Move authentication logic from features to processes layer following FSD architecture:
- Create processes/auth with store, selectors, and API
- Update all features to use centralized auth store
- Add proper TypeScript types and error handling
- Maintain backward compatibility with existing auth flow

This improves code organization and enables better auth state sharing across features.
```

**Documentation:**

```
docs: add user confirmation policy to AGENTS.md

Establish mandatory approval workflow for AI agents before applying changes, with clear examples and decision framework.
```

**Multiple File Types:**

```
feat(user-profile): add user profile management feature

Implement complete user profile feature following FSD architecture:
- Create features/user-profile with form, validation, and API
- Add profile page with edit capabilities
- Integrate with auth store for current user data
- Add i18n translations for all UI text
- Include unit tests

Closes #234
```

#### AI Agent Workflow

After completing a task:

1. **Analyze changes**: Review all modified/created files
2. **Determine type**: Choose appropriate commit type
3. **Identify scope**: Determine affected feature/module
4. **Write subject**: Concise summary of changes
5. **Add body** (if complex): Explain what and why
6. **Present to user**: Show the generated commit message
7. **Allow refinement**: User can request modifications

#### Presentation Format

```markdown
## Task Complete ✓

**Changes Applied**:

- Created 3 files
- Modified 2 files
- Added tests and documentation

**Suggested Commit Message**:
\`\`\`
feat(feature-name): add new functionality

- Implement core feature logic
- Add UI components with Mantine
- Include validation and error handling
- Add i18n support
  \`\`\`

You can use this message as-is or modify it as needed.
```

#### Best Practices

- **Be specific**: "add user profile form" not "add form"
- **Be concise**: Keep subject under 50 characters
- **Be consistent**: Follow project conventions
- **Be informative**: Body should explain non-obvious changes
- **Be accurate**: Reflect actual changes made
- **Group related changes**: One logical change per commit
- **Reference issues**: Link to relevant tickets/issues

#### What NOT to Do

❌ Vague messages:

```
fix: fix bug
feat: update code
chore: changes
```

❌ Too detailed in subject:

```
feat: add user profile form with validation, error handling, i18n, tests, and storybook stories
```

❌ Missing context:

```
refactor: update auth
```

✅ Good messages:

```
fix(signin-form): resolve validation error handling
feat(user-profile): add profile management feature
refactor(auth): migrate to processes layer for cross-feature auth
```

### Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*": ["pnpm formatter:check"],
    "package.json": ["sort-package-json"]
  }
}
```

## Deployment Considerations

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          mantine: ["@mantine/core", "@mantine/hooks"],
          tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
        },
      },
    },
  },
});
```

### Environment-specific Configuration

```bash
# Production build
pnpm build

# Preview production build locally
pnpm preview

# Type checking before deployment
pnpm type-check
```
