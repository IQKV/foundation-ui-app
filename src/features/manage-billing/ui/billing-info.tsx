import { Paper, Stack, Title, TextInput, Group, Button, Skeleton, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect } from "react";
import { useBillingSettings, useUpdateBillingSettings } from "../model/use-billing-settings";

interface BillingInfoProps {
  tenantKey: string;
}

export function BillingInfo({ tenantKey }: BillingInfoProps) {
  const { t } = useLingui();
  const { data: settings, isLoading, isError } = useBillingSettings(tenantKey);
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateBillingSettings(tenantKey);

  const form = useForm({
    initialValues: {
      billingEmail: "",
      companyName: "",
      currency: "USD",
    },
    validate: {
      billingEmail: (value) => (/^\S+@\S+$/.test(value) ? null : t`Invalid email`),
    },
  });

  useEffect(() => {
    if (settings) {
      form.setValues({
        billingEmail: settings.billingEmail || "",
        companyName: settings.companyName || "",
        currency: settings.currency || "USD",
      });
    }
  }, [settings]);

  if (isLoading) {
    return <Skeleton height={200} radius="md" />;
  }

  if (isError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title={<Trans>Error</Trans>} color="red">
        <Trans>Failed to load billing settings.</Trans>
      </Alert>
    );
  }

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="md">
        <Title order={3}>
          <Trans>Billing Information</Trans>
        </Title>
        <form onSubmit={form.onSubmit((values) => updateSettings(values))}>
          <Stack gap="sm">
            <TextInput
              label={t`Billing Email`}
              placeholder={t`email@company.com`}
              {...form.getInputProps("billingEmail")}
            />
            <TextInput
              label={t`Company Name`}
              placeholder={t`ACME Corp`}
              {...form.getInputProps("companyName")}
            />
            <TextInput
              label={t`Currency`}
              placeholder="USD"
              disabled
              {...form.getInputProps("currency")}
            />
            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={isUpdating}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                <Trans>Save Changes</Trans>
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
