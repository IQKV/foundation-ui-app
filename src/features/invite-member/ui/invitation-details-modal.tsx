import { Modal, Stack, TextInput, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import dayjs from "dayjs";
import type { Invitation } from "@/shared/api";
import { InvitationStatusBadge } from "@/shared/ui";
import { useRevokeInvitation } from "../model";

interface InvitationDetailsModalProps {
  invitation: Invitation | null;
  tenantKey: string;
  opened: boolean;
  onClose: () => void;
}

export function InvitationDetailsModal({
  invitation,
  tenantKey,
  opened,
  onClose,
}: InvitationDetailsModalProps) {
  const { t } = useLingui();

  const revokeMutation = useRevokeInvitation({
    tenantKey,
    invitationId: invitation?.invitationId ?? "",
    email: invitation?.email ?? "",
    onSuccess: handleClose,
  });

  const isPending = invitation?.status === "PENDING";

  function handleClose() {
    revokeMutation.reset();
    onClose();
  }

  const readOnly = {
    input: {
      cursor: "default",
      color: "var(--mantine-color-gray-6)",
      background: "var(--mantine-color-gray-0)",
    },
  } as const;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="md">
          <Trans>Invitation details</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      {invitation && (
        <Stack gap="md">
          <TextInput label={t`Email`} value={invitation.email} readOnly styles={readOnly} />

          <TextInput label={t`Role`} value={invitation.authority} readOnly styles={readOnly} />

          <Stack gap={4}>
            <Text size="sm" fw={500}>
              <Trans>Status</Trans>
            </Text>
            <InvitationStatusBadge status={invitation.status} />
          </Stack>

          <TextInput
            label={t`Expires`}
            value={dayjs(invitation.expiresAt).format("MMM D, YYYY HH:mm")}
            readOnly
            styles={readOnly}
          />

          <TextInput
            label={t`Sent`}
            value={dayjs(invitation.createdAt).format("MMM D, YYYY HH:mm")}
            readOnly
            styles={readOnly}
          />

          {isPending && (
            <Alert color="blue" variant="light">
              <Trans>Revoking this invitation will prevent the recipient from accepting it.</Trans>
            </Alert>
          )}

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={revokeMutation.isPending}
            >
              <Trans>Close</Trans>
            </Button>
            {isPending && (
              <Button
                color="red"
                variant="light"
                loading={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate()}
              >
                <Trans>Revoke</Trans>
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
