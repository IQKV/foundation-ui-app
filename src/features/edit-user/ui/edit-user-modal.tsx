import { useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
  Button,
  Text,
  Divider,
  Box,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import type { IamUser } from "@/shared/api";
import { useEditUser, STATUS_OPTIONS, getStatusOptions } from "../model";
import type { EditUserFormValues } from "../model";

interface EditUserModalProps {
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, opened, onClose }: EditUserModalProps) {
  const { t } = useLingui();

  const form = useForm<EditUserFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      status: "ACTIVE",
    },
    validate: {
      firstName: (v) => (v.trim().length < 1 ? t`First name is required` : null),
      lastName: (v) => (v.trim().length < 1 ? t`Last name is required` : null),
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const mutation = useEditUser({
    userId: user?.id ?? "",
    displayName: `${form.values.firstName} ${form.values.lastName}`.trim(),
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
            <Trans>Edit User</Trans>
          </Text>
          {user && (
            <Text size="xs" c="dimmed">
              <Trans>ID: {user.id}</Trans>
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {user && (
            <Box
              p="sm"
              style={{
                background: "var(--mantine-color-gray-0)",
                borderRadius: "var(--mantine-radius-sm)",
                border: "1px solid var(--mantine-color-gray-2)",
              }}
            >
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  <Trans>Email verified:</Trans>
                </Text>
                <Badge color={user.emailVerified ? "green" : "orange"} variant="light" size="xs">
                  {user.emailVerified ? <Trans>Verified</Trans> : <Trans>Unverified</Trans>}
                </Badge>
              </Group>
            </Box>
          )}

          <Group grow>
            <TextInput
              label={t`First name`}
              placeholder={t`First name`}
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label={t`Last name`}
              placeholder={t`Last name`}
              {...form.getInputProps("lastName")}
            />
          </Group>

          <TextInput
            label={t`Email`}
            value={user?.email ?? ""}
            readOnly
            styles={{
              input: {
                cursor: "default",
                color: "var(--mantine-color-gray-6)",
                background: "var(--mantine-color-gray-0)",
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
