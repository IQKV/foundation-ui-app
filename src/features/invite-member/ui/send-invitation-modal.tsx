import { Modal, Stack, TextInput, Select, Group, Button, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { getAuthorityOptions, useSendInvitation, buildSendInvitationSchema } from "../model";
import type { SendInvitationFormValues } from "../model";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

interface SendInvitationModalProps {
  tenantKey: string;
  opened: boolean;
  onClose: () => void;
}

export function SendInvitationModal({ tenantKey, opened, onClose }: SendInvitationModalProps) {
  const { t } = useLingui();

  const form = useForm<SendInvitationFormValues>({
    initialValues: { email: "", authority: "MEMBER" },
    validate: (values) => validateWithZod(buildSendInvitationSchema(), values),
  });

  const mutation = useSendInvitation({ tenantKey, onSuccess: handleClose });

  const handleSubmit = form.onSubmit((values) => mutation.mutate(values));

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
          <Trans>Invite member</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t`Email address`}
            placeholder={t`colleague@example.com`}
            type="email"
            {...form.getInputProps("email")}
          />

          <Select
            label={t`Role`}
            data={getAuthorityOptions()}
            description={t`TENANT_OWNER cannot be granted via invitation`}
            {...form.getInputProps("authority")}
          />

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
              <Trans>Send invitation</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
