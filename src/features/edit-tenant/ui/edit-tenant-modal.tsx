import { useEffect } from "react";
import { Modal, Stack, TextInput, Select, Group, Button, Text, Divider, Code } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import type { IamTenant } from "@/shared/api";
import { useEditTenant, getStatusOptions } from "../model";
import type { EditTenantFormValues } from "../model";

interface EditTenantModalProps {
  tenant: IamTenant | null;
  opened: boolean;
  onClose: () => void;
}

export function EditTenantModal({ tenant, opened, onClose }: EditTenantModalProps) {
  const { t } = useLingui();

  const form = useForm<EditTenantFormValues>({
    initialValues: {
      name: "",
      status: "ACTIVE",
    },
    validate: {
      name: (v) => (v.trim().length < 1 ? t`Organization name is required` : null),
    },
  });

  useEffect(() => {
    if (tenant) {
      form.setValues({
        name: tenant.name,
        status: tenant.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const mutation = useEditTenant({
    tenantKey: tenant?.tenantKey ?? "",
    displayName: form.values.name,
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values);
  });

  function handleClose() {
    form.reset();
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Edit Organization</Trans>
          </Text>
          {tenant && (
            <Text size="xs" c="dimmed">
              <Trans>Key:</Trans> <Code>{tenant.tenantKey}</Code>
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t`Organization name`}
            placeholder={t`Organization name`}
            {...form.getInputProps("name")}
          />

          <TextInput
            label={t`Tenant key`}
            value={tenant?.tenantKey ?? ""}
            readOnly
            styles={{
              input: {
                cursor: "default",
                color: "var(--mantine-color-gray-6)",
                background: "var(--mantine-color-gray-0)",
                fontFamily: "var(--mantine-font-family-monospace)",
              },
            }}
            rightSection={
              <Text size="xs" c="dimmed" pr={4}>
                <Trans>read-only</Trans>
              </Text>
            }
            rightSectionWidth={72}
          />

          <Select label={t`Status`} data={getStatusOptions()} {...form.getInputProps("status")} />

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              <Trans>Save changes</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
