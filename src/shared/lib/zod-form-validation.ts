import type { ZodSchema } from "zod";

/**
 * Helper function to validate a form using a Zod schema and return errors object compatible with Mantine Form.
 * @param schema - Zod schema to use for validation
 * @param values - Form values to validate
 * @returns Errors object where keys are field paths and values are error messages
 */
export function validateWithZod<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  values: T,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const result = schema.safeParse(values);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      errors[path] = issue.message;
    });
  }
  return errors;
}
