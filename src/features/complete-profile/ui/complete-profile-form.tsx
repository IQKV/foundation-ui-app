import { Alert, Button, Group, Loader, Select, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { localesApi } from "@/shared/api";
import { useCompleteProfile } from "../model";

export function CompleteProfileForm() {
  const { t } = useLingui();
  const { form, isLoading, errorMessage, onSubmit } = useCompleteProfile();

  const { data: locales, isLoading: localesLoading } = useQuery({
    queryKey: ["locales"],
    queryFn: () => localesApi.list(),
    staleTime: Infinity,
  });

  const localeOptions =
    locales?.map((l) => ({
      value: l.code,
      label: l.nativeName ? `${l.name} — ${l.nativeName}` : l.name,
    })) ?? [];

  const handleFormSubmit = form.onSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="complete-profile-form">
      <Stack gap="md">
        {/* Server-side error */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              role="alert"
              data-testid="complete-profile-error"
            >
              {errorMessage}
            </Alert>
          )}
        </div>

        {/* Name row */}
        <Group grow gap="md">
          <TextInput
            id="complete-profile-first-name"
            data-testid="complete-profile-first-name"
            label={t`First name`}
            placeholder={t`Jane`}
            autoComplete="given-name"
            disabled={isLoading}
            inputWrapperOrder={["label", "input", "error"]}
            {...form.getInputProps("firstName")}
          />
          <TextInput
            id="complete-profile-last-name"
            data-testid="complete-profile-last-name"
            label={t`Last name`}
            placeholder={t`Smith`}
            autoComplete="family-name"
            disabled={isLoading}
            inputWrapperOrder={["label", "input", "error"]}
            {...form.getInputProps("lastName")}
          />
        </Group>

        {/* Locale */}
        <Select
          label={t`Language`}
          description={t`Sets your preferred language for notifications and emails.`}
          placeholder={localesLoading ? t`Loading…` : t`Select language (optional)`}
          data={localeOptions}
          rightSection={localesLoading ? <Loader size="xs" /> : undefined}
          disabled={localesLoading || isLoading}
          clearable
          searchable
          data-testid="complete-profile-locale"
          {...form.getInputProps("locale")}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          mt={4}
          data-testid="complete-profile-submit"
        >
          <Trans>Continue</Trans>
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          <Trans>You can update your avatar and other details in settings later.</Trans>
        </Text>
      </Stack>
    </form>
  );
}
