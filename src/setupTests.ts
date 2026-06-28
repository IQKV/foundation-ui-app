import "@testing-library/jest-dom";
import { i18n } from "@lingui/core";
import { messages } from "../locales/en-US";
import { server } from "@/shared/mocks/server";

i18n.load("en-US", messages);
i18n.activate("en-US");

// Start MSW server before all tests, reset handlers after each test,
// and close after all tests complete.
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
