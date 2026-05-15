import { useEffect } from "react";
import { Modal, Stack, TextInput, Group, Button, Text, Divider, Box, Badge } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import type { UserProfile } from "@/shared/api";
import { useEditProfile } from "../model";
import type { EditProfileFormValues } from "../model";

interface EditProfileModalProps {
  profile: UserProfile | null;
  opened: boolean;
  onClose: () => void;
}

export function EditProfileModal({ profile, opened, onClose }: EditProfileModalProps) {
  const { t } = useLingui();

  const form = useForm<EditProfileFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
    },
    validate: {
      firstName: (v) => (v.trim().length < 1 ? t`First name is required` : null),
      lastName: (v) => (v.trim().length < 1 ? t`Last name is required` : null),
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValues({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const mutation = useEditProfile({ onSuccess: handleClose });

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
            <Trans>Edit Profile</Trans>
          </Text>
          {profile && (
            <Text size="xs" c="dimmed">
              {profile.email}
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {profile && (
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
                <Badge color={profile.emailVerified ? "green" : "orange"} variant="light" size="xs">
                  {profile.emailVerified ? <Trans>Verified</Trans> : <Trans>Unverified</Trans>}
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
            value={profile?.email ?? ""}
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
