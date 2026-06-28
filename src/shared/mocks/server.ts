import { setupServer } from "msw/node";
import { handlers } from "./handlers/index";

/**
 * MSW Node server for Vitest unit tests.
 *
 * Wire up in src/setupTests.ts:
 *
 * ```ts
 * import { server } from "@/shared/mocks/server";
 *
 * beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...handlers);
