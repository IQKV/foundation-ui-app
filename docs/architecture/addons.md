# Addon System

## Overview

The addon system allows for modular, self-contained feature modules to be dynamically included or excluded without modifying core code. It follows Feature-Sliced Design (FSD) principles and integrates with existing architecture.

## Key Components

- **Addon Manifest**: Defines addon metadata (id, name, version, description)
- **Addon Registry**: Manages registered addons
- **Addon Loader**: Loads enabled addons from configuration (supports both local addons and external npm packages)
- **Extension Points**: Allow addons to contribute UI (navigation, widgets)
- **Addon Context**: Provides core services to addons (httpClient, queryClient, session, i18n, extensions)

## Using External Packages as Addons

You can use external npm packages as addons by adding them to `availableAddons` as a string (the package name):

```typescript
// src/app/addons/addon-loader.ts
const availableAddons: AvailableAddons = {
  // External package
  "@company/my-external-addon": "@company/my-external-addon",
};
```

External packages should export an addon as their default export, following the same `Addon` interface as local addons.

## Directory Structure

```
src/
├── app/
│   ├── addons/
│   │   ├── index.ts          # Public API
│   │   ├── types.ts          # Type definitions
│   │   ├── addon-registry.ts # Addon registry
│   │   ├── addon-loader.ts   # Addon loader
│   │   └── extension-points/ # Extension points
│   │       ├── index.ts
│   │       ├── navigation.ts
│   │       └── widgets.ts
│   └── config/
│       └── addons.ts         # Addon configuration
├── addons/                   # Addon implementations
│   └── [addon-id]/
│       ├── index.ts
│       ├── features/
│       ├── widgets/
│       ├── pages/
│       ├── api/
│       ├── types/
│       └── locales/
```

## Environment Variables

```env
# Comma-separated list of enabled addon IDs
VITE_ENABLED_UI_ADDONS=
```

## Example Addon

```typescript
// src/addons/example-addon/index.ts
import type { Addon } from "@/app/addons/types";
import { ExampleWidget } from "./widgets/example-widget";

const addon: Addon = {
  manifest: {
    id: "example-addon",
    name: "Example Addon",
    version: "1.0.0",
    description: "Example addon description",
  },
  initialize: ({ extensions }) => {
    // Register nav item
    extensions.navigation.registerNavItem({
      id: "example-nav-item",
      label: "Example",
      to: "/_app/addons/example",
      icon: IconExample,
      section: "workspace",
      order: 20,
    });

    // Register widget
    extensions.widgets.registerWidget({
      id: "example-widget",
      component: ExampleWidget,
      location: "dashboard",
      order: 50,
    });
  },
};

export default addon;
```

## Design Principles

1. **Backward Compatibility**: No breaking changes to existing code
2. **FSD Alignment**: Addons follow same FSD structure
3. **Opt-in**: Addons are optional, core app works without them
4. **Configuration Driven**: Feature inclusion/exclusion via config
5. **Type Safety**: Full TypeScript support
6. **Extension Points**: Addons contribute to UI via well-defined points
