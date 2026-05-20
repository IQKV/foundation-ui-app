import {
  Paper,
  Stack,
  Title,
  TextInput,
  Group,
  Button,
  Skeleton,
  Alert,
  Text,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconDeviceFloppy, IconBuilding, IconRefresh } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect } from "react";
import { useTenant, useUpdateTenant, useRetryProvisioning } from "../model/use-tenant";

interface OrganizationSettingsProps {
  tenantKey: string;
}

export function OrganizationSettings({ tenantKey }: OrganizationSettingsProps) {
  const { t } = useLingui();
  const { data: tenant, isLoading, isError } = useTenant(tenantKey);
  const { mutate: updateTenant, isPending: isUpdating } = useUpdateTenant(tenantKey);
  const retryProvisioning = useRetryProvisioning(tenantKey);

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? t`Name is too short` : null),
    },
  });

  useEffect(() => {
    if (tenant) {
      form.setValues({
        name: tenant.name,
      });
    }
  }, [tenant]);

  if (isLoading) {
    return <Skeleton height={200} radius="md" />;
  }

  if (isError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title={<Trans>Error</Trans>} color="red">
        <Trans>Failed to load organization settings.</Trans>
      </Alert>
    );
  }

  const isProvisioningFailed = (tenant?.status as string) === "PROVISIONING_FAILED";

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconBuilding size={24} />
            <Title order={3}>
              <Trans>Organization Settings</Trans>
            </Title>
          </Group>
          <Group gap="xs">
            {isProvisioningFailed && (
              <Button
                variant="light"
                color="orange"
                size="xs"
                leftSection={<IconRefresh size={14} />}
                onClick={() => retryProvisioning.mutate()}
                loading={retryProvisioning.isPending}
              >
                <Trans>Retry Provisioning</Trans>
              </Button>
            )}
            <Badge variant="light" color={isProvisioningFailed ? "red" : "blue"} size="lg">
              {tenant?.status}
            </Badge>
          </Group>
        </Group>

        <form onSubmit={form.onSubmit((values) => updateTenant(values))}>
          <Stack gap="sm">
            <TextInput
              label={t`Organization Name`}
              placeholder={t`ACME Corp`}
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t`Organization Key`}
              value={tenantKey}
              disabled
              description={t`The unique identifier for your organization. This cannot be changed.`}
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
