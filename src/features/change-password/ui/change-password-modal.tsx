import { useEffect } from "react";
import {
  Modal,
  Stack,
  PasswordInput,
  Group,
  Button,
  Text,
  Divider,
  List,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconCircleCheck } from "@tabler/icons-react";
import { useChangePassword } from "../model";

interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
}

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
  const { t } = useLingui();

  const form = useForm<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (v) => (v.length < 1 ? t`Current password is required` : null),
      newPassword: (v) => {
        if (v.length < 8) return t`Password must be at least 8 characters`;
        if (v.length > 128) return t`Password must be at most 128 characters`;
        if (!PASSWORD_PATTERN.test(v))
          return t`Password must contain uppercase, lowercase, digit, and special character`;
        return null;
      },
      confirmPassword: (v, values) => (v !== values.newPassword ? t`Passwords do not match` : null),
    },
  });

  // Reset form whenever the modal opens
  useEffect(() => {
    if (opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const mutation = useChangePassword({ onSuccess: handleClose });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
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
        <Text fw={600} size="md">
          <Trans>Change Password</Trans>
        </Text>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <PasswordInput
            label={t`Current password`}
            placeholder={t`Enter your current password`}
            {...form.getInputProps("currentPassword")}
          />

          <PasswordInput
            label={t`New password`}
            placeholder={t`Enter new password`}
            {...form.getInputProps("newPassword")}
          />

          <PasswordInput
            label={t`Confirm new password`}
            placeholder={t`Repeat new password`}
            {...form.getInputProps("confirmPassword")}
          />

          {/* Policy hint */}
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500}>
              <Trans>Password requirements:</Trans>
            </Text>
            <List
              size="xs"
              c="dimmed"
              spacing={2}
              icon={
                <ThemeIcon size={12} radius="xl" color="gray" variant="transparent">
                  <IconCircleCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <Trans>At least 8 characters, at most 128</Trans>
              </List.Item>
              <List.Item>
                <Trans>Uppercase and lowercase letters</Trans>
              </List.Item>
              <List.Item>
                <Trans>At least one digit</Trans>
              </List.Item>
              <List.Item>
                <Trans>At least one special character</Trans>
              </List.Item>
            </List>
          </Stack>

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
              <Trans>Change password</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
