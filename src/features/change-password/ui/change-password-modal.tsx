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
import { useChangePassword, buildChangePasswordSchema } from "../model";
import type { ChangePasswordFormValues } from "../model";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
  const { t } = useLingui();

  const form = useForm<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => validateWithZod(buildChangePasswordSchema(), values),
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
