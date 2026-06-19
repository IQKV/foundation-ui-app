import { Alert, Button, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import type { UseFormReturnType } from "@mantine/form";
import type { CreateOrganizationFormValues } from "../model/use-create-organization";

interface CreateOrganizationFormProps {
  form: UseFormReturnType<CreateOrganizationFormValues>;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: CreateOrganizationFormValues) => Promise<void>;
}

/**
 * Organization creation form component
 */
export function CreateOrganizationForm({
  form,
  isLoading,
  errorMessage,
  onSubmit,
}: CreateOrganizationFormProps) {
  const { t } = useLingui();

  const handleFormSubmit = form.onSubmit((values: CreateOrganizationFormValues) =>
    onSubmit(values),
  );

  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="create-organization-form">
      <Stack gap="md">
        {/* Server-side error */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              role="alert"
              data-testid="create-organization-error-alert"
            >
              {errorMessage}
            </Alert>
          )}
        </div>

        {/* Organization name */}
        <TextInput
          id="create-organization-name"
          data-testid="create-organization-name-input"
          label={t`Organization name`}
          placeholder={t`Acme Inc.`}
          autoComplete="organization"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("name")}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          mt={4}
          data-testid="create-organization-submit-button"
        >
          <Trans>Create organization</Trans>
        </Button>
      </Stack>
    </form>
  );
}
