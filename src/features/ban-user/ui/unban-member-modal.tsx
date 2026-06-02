import { Modal, Stack, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconUserCheck } from "@tabler/icons-react";
import type { TenantMember } from "@/shared/api";
import { useUnbanMember } from "../model";

interface UnbanMemberModalProps {
  member: TenantMember | null;
  tenantKey: string;
  opened: boolean;
  onClose: () => void;
}

export function UnbanMemberModal({ member, tenantKey, opened, onClose }: UnbanMemberModalProps) {
  const { t: _t } = useLingui();

  const displayName = member ? `${member.firstName} ${member.lastName}`.trim() : "";

  const mutation = useUnbanMember({
    userId: member?.id ?? "",
    tenantKey,
    displayName,
    onSuccess: handleClose,
  });

  function handleClose() {
    mutation.reset();
    onClose();
  }

  const handleConfirm = () => {
    mutation.mutate();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Unban Member</Trans>
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
      <Stack gap="md">
        <Alert
          icon={<IconUserCheck size={16} />}
          color="blue"
          variant="light"
          title={<Trans>Restore access</Trans>}
        >
          <Trans>
            Unbanning this member will restore their access to this tenant. They will be able to
            access this tenant again with their existing credentials.
          </Trans>
        </Alert>

        <Divider />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={handleClose} disabled={mutation.isPending}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="blue" loading={mutation.isPending} onClick={handleConfirm}>
            <Trans>Unban member</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
