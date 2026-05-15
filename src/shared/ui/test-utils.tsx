/**
 * Test utility components and hooks for adding data-testid attributes
 *
 * These utilities make it easy to add consistent test IDs to components
 * while maintaining clean component code.
 */

import React from "react";

/**
 * Props interface for components that support data-testid
 */
export interface TestIdProps {
  /** Data test ID for Playwright/E2E testing */
  "data-testid"?: string;
}

/**
 * Higher-order component that adds data-testid support to any component
 */
export function withTestId<P extends object>(
  Component: React.ComponentType<P>,
  defaultTestId?: string,
): React.ComponentType<P & TestIdProps> {
  const WithTestId: React.FC<P & TestIdProps> = ({ "data-testid": testId, ...props }) => {
    const finalTestId = testId || defaultTestId;
    return finalTestId ? (
      <Component {...(props as P)} data-testid={finalTestId} />
    ) : (
      <Component {...(props as P)} />
    );
  };

  WithTestId.displayName = `WithTestId(${Component.displayName || Component.name || "Component"})`;
  return WithTestId;
}

/**
 * Hook that returns props with data-testid for easy spreading
 */
export function useTestId(
  testId: string,
  additionalProps: Record<string, any> = {},
): TestIdProps & Record<string, any> {
  return {
    "data-testid": testId,
    ...additionalProps,
  };
}

/**
 * Creates a test ID string following the project's naming convention
 */
export function createTestId(component: string, element: string, modifier?: string): string {
  const parts = [component, element];
  if (modifier) {
    parts.push(modifier);
  }
  return parts.join("--");
}

/**
 * Button test ID helper
 */
export const buttonTestId = (name: string) => createTestId("button", name);

/**
 * Input test ID helper
 */
export const inputTestId = (name: string) => createTestId("input", name);

/**
 * Form test ID helper
 */
export const formTestId = (name: string) => createTestId("form", name);

/**
 * Modal test ID helper
 */
export const modalTestId = (name: string) => createTestId("modal", name);

/**
 * Page test ID helper
 */
export const pageTestId = (name: string) => createTestId("page", name);

/**
 * Navigation test ID helper
 */
export const navTestId = (name: string) => createTestId("nav", name);

/**
 * Layout test ID helper
 */
export const layoutTestId = (name: string) => createTestId("layout", name);

/**
 * Header test ID helper
 */
export const headerTestId = (name: string) => createTestId("header", name);

/**
 * Example usage in components:
 *
 * ```tsx
 * import { buttonTestId, useTestId } from '@/shared/ui/test-utils';
 *
 * function MyButton() {
 *   const testProps = useTestId(buttonTestId('submit'));
 *
 *   return (
 *     <Button {...testProps}>
 *       Submit
 *     </Button>
 *   );
 * }
 * ```
 */
