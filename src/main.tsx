import ReactDOM from "react-dom/client";
import { App } from "@/app";
import { initializeDefaultLocale } from "@/shared/locales";

// Registers Axios auth interceptors (Bearer token injection + silent refresh).
import "@/shared/api";

initializeDefaultLocale();

async function bootstrap() {
  // Start MSW browser worker in development when explicitly enabled.
  // The worker intercepts requests and returns mock responses so the app can
  // run without a live backend (useful for local dev and component testing).
  if (import.meta.env.VITE_ENABLE_MSW === "true") {
    const { worker } = await import("@/shared/mocks/browser");
    await worker.start({
      onUnhandledRequest: "warn",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  }

  const rootElement = document.getElementById("root")!;
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  }
}

bootstrap();
