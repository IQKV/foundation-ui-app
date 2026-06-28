import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export interface A11yOptions {
  /** CSS selector to scope the scan. Defaults to the full page. */
  include?: string;
  /** Array of axe rule IDs to disable (use sparingly and document the reason). */
  disabledRules?: string[];
}

/**
 * Run an axe-core accessibility scan and assert zero violations.
 *
 * Usage:
 * ```ts
 * import { checkA11y } from "../../lib/a11y.js";
 *
 * test("sign-in page has no a11y violations", async ({ page }) => {
 *   await page.goto("/sign-in");
 *   await checkA11y(page);
 * });
 * ```
 */
export async function checkA11y(page: Page, options: A11yOptions = {}): Promise<void> {
  let builder = new AxeBuilder({ page });

  if (options.include) {
    builder = builder.include(options.include);
  }

  if (options.disabledRules?.length) {
    builder = builder.disableRules(options.disabledRules);
  }

  const results = await builder.analyze();

  const violationSummary = results.violations
    .map(
      (v) =>
        `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes
          .map((n) => n.target.join(", "))
          .join(" | ")}`,
    )
    .join("\n\n");

  expect(results.violations, `Accessibility violations found:\n\n${violationSummary}`).toHaveLength(
    0,
  );
}
