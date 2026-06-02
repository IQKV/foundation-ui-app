import { Modal, Stack, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans } from "@lingui/react/macro";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { TenantMember } from "@/shared/api";
import { useTransferOwnership } from "../model";

interface TransferOwnershipModalProps {
  member: TenantMember | null;
  tenantKey: string;
  opened: boolean;
  onClose: () => void;
}

export function TransferOwnershipModal({
  member,
  tenantKey,
  opened,
  onClose,
}: TransferOwnershipModalProps) {
  const form = useForm({
    initialValues: {},
  });

  const displayName = member ? `${member.firstName} ${member.lastName}`.trim() : "";

  const mutation = useTransferOwnership({
    userId: member?.id ?? "",
    tenantKey,
    displayName,
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit(() => {
    mutation.mutate();
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
            <Trans>Transfer Ownership</Trans>
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
            color="yellow"
            variant="light"
            title={<Trans>Are you sure?</Trans>}
          >
            <Trans>
              Transferring ownership will make {displayName} the new Tenant Owner. You will become a
              Member of this tenant and lose all owner permissions. This action cannot be undone by
              you — only the new owner can transfer ownership back.
            </Trans>
          </Alert>

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
            <Button type="submit" color="yellow" loading={mutation.isPending}>
              <Trans>Transfer ownership</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
