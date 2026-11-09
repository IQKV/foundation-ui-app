import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useBulkDeleteVenues } from "../model";

interface BulkDeleteVenuesModalProps {
  ids: string[];
  opened: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function BulkDeleteVenuesModal({ ids, opened, onClose, onDeleted }: BulkDeleteVenuesModalProps) {
  const mutation = useBulkDeleteVenues({
    onSuccess: () => {
      onDeleted?.();
      onClose();
    },
  });

  const countLabel = `${ids.length} venue${ids.length === 1 ? "" : "s"}`;

  const handleConfirm = () => {
    if (ids.length > 0) {
      mutation.mutate(ids);
    }
  };

  function handleClose() {
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="md">
          <Trans>Delete Venues</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md" data-testid={TestSelectors.BULK_DELETE_VENUES_MODAL}>
        {mutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Delete failed</Trans>}
          >
            <Trans>Could not delete the selected venues. Please try again.</Trans>
          </Alert>
        )}

        <Text size="sm">
          <Trans>
            Are you sure you want to delete <strong>{countLabel}</strong>? This action cannot be
            undone.
          </Trans>
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleClose}
            disabled={mutation.isPending}
            data-testid={TestSelectors.BUTTON("cancel")}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="red"
            loading={mutation.isPending}
            onClick={handleConfirm}
            data-testid={TestSelectors.VENUE_BULK_DELETE_CONFIRM_BUTTON}
          >
            <Trans>Delete</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
