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
import type { IamUser } from "@/shared/api";
import { useEditUser, STATUS_OPTIONS } from "../model";
import type { EditUserFormValues } from "../model";

interface EditUserModalProps {
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, opened, onClose }: EditUserModalProps) {
  const form = useForm<EditUserFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      status: "ACTIVE",
    },
    validate: {
      firstName: (v) => (v.trim().length < 1 ? "First name is required" : null),
      lastName: (v) => (v.trim().length < 1 ? "Last name is required" : null),
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
            Edit User
          </Text>
          {user && (
            <Text size="xs" c="dimmed">
              ID: {user.id}
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
                  Email verified:
                </Text>
                <Badge color={user.emailVerified ? "green" : "orange"} variant="light" size="xs">
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </Group>
            </Box>
          )}

          <Group grow>
            <TextInput
              label="First name"
              placeholder="First name"
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Last name"
              placeholder="Last name"
              {...form.getInputProps("lastName")}
            />
          </Group>

          <TextInput
            label="Email"
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
                read-only
              </Text>
            }
            rightSectionWidth={72}
          />

          <Select label="Status" data={STATUS_OPTIONS} {...form.getInputProps("status")} />

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
