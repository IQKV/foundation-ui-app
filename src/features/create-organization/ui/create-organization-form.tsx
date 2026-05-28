import { Alert, Button, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { Trans, useLingui } from "@lingui/react/macro";
import type { UseFormReturn } from "react-hook-form";
import type { CreateOrganizationFormValues } from "../model/use-create-organization";

interface CreateOrganizationFormProps {
  form: UseFormReturn<CreateOrganizationFormValues>;
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleFormSubmit = handleSubmit((values: CreateOrganizationFormValues) => onSubmit(values));

  return (
    <form onSubmit={(e) => void handleFormSubmit(e)} noValidate>
      <Stack gap="md">
        {/* Server-side error */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" role="alert">
              {errorMessage}
            </Alert>
          )}
        </div>

        {/* Organization name */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="create-organization-name"
              label={t`Organization name`}
              placeholder={t`Acme Inc.`}
              autoComplete="organization"
              error={errors.name?.message}
              disabled={isLoading}
              inputWrapperOrder={["label", "input", "error"]}
            />
          )}
        />

        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading} mt={4}>
          <Trans>Create organization</Trans>
        </Button>
      </Stack>
    </form>
  );
}
