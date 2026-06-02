import { useEffect } from "react";
import { Modal, Stack, Textarea, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { TenantMember } from "@/shared/api";
import { useBanMember } from "../model";

interface BanMemberModalProps {
  member: TenantMember | null;
  tenantKey: string;
  opened: boolean;
  onClose: () => void;
}

interface BanMemberFormValues {
  reason?: string;
  expiresAt?: Date | null;
}

export function BanMemberModal({ member, tenantKey, opened, onClose }: BanMemberModalProps) {
  const { t } = useLingui();

  const form = useForm<BanMemberFormValues>({
    initialValues: {
      reason: "",
      expiresAt: undefined,
    },
  });

  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened, form]);

  const displayName = member ? `${member.firstName} ${member.lastName}`.trim() : "";

  const mutation = useBanMember({
    userId: member?.id ?? "",
    tenantKey,
    displayName,
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
            <Trans>Ban Member</Trans>
          </Text>
          {member && (
            <Text size="xs" c="dimmed">
              {displayName} &middot; {member.email}
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Are you sure?</Trans>}
          >
            <Trans>
              Banning this member will immediately invalidate all their active sessions, revoke
              their access to this tenant, and send them a notification email. They will not be able
              to access this tenant again until unbanned.
            </Trans>
          </Alert>

          <Textarea
            label={t`Reason (optional)`}
            placeholder={t`Provide a reason for the ban…`}
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps("reason")}
          />

          <DateTimePicker
            label={t`Expires at (optional)`}
            placeholder={t`Pick a date and time`}
            valueFormat="YYYY-MM-DD HH:mm"
            clearable
            {...form.getInputProps("expiresAt")}
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
            <Button type="submit" color="red" loading={mutation.isPending}>
              <Trans>Ban member</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
