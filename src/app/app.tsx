import { StrictMode, useEffect, useState } from "react";

import { localStorageColorSchemeManager, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { HelmetProvider } from "@dr.pogodin/react-helmet";

import { routeTree } from "@/routeTree.gen";
import { theme, cssVariablesResolver } from "./theme";
import { ErrorBoundary, LoadingOverlay } from "@/shared/ui";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/tiptap/styles.css";
import "mantine-datatable/styles.layer.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

const router = createRouter({ routeTree, defaultPreload: "intent" });

// Persist color scheme preference in localStorage under the same key used by
// the Zustand theme store so both stay in sync across page reloads.
const colorSchemeManager = localStorageColorSchemeManager({ key: "iqkv_color_scheme" });

// Router navigation progress integration
router.subscribe("onBeforeLoad", () => {
  nprogress.start();
});

router.subscribe("onLoad", () => {
  nprogress.complete();
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadLocale = async () => {
      const { dynamicActivateLocale, getClientLocale } = await import("@/shared/locales");
      await dynamicActivateLocale(getClientLocale());
      // Hide initial loader after locale is loaded
      setIsInitialLoading(false);
    };
    loadLocale().catch((error) => {
      console.error("Failed to load locale:", error);
      // Hide loader even on error to prevent infinite loading
      setIsInitialLoading(false);
    });
  }, []);

  return (
    <StrictMode>
      <HelmetProvider>
        <I18nProvider i18n={i18n}>
          <ErrorBoundary>
            <MantineProvider
              theme={theme}
              colorSchemeManager={colorSchemeManager}
              cssVariablesResolver={cssVariablesResolver}
            >
              <ModalsProvider>
                <NavigationProgress />
                <Notifications />
                <LoadingOverlay visible={isInitialLoading} />
                <QueryClientProvider client={queryClient}>
                  <RouterProvider router={router} />
                  <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
              </ModalsProvider>
            </MantineProvider>
          </ErrorBoundary>
        </I18nProvider>
      </HelmetProvider>
    </StrictMode>
  );
}
