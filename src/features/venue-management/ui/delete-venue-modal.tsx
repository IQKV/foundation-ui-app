import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import type { Venue } from "@/entities/venue";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useDeleteVenue } from "../model";

interface DeleteVenueModalProps {
  venue: Venue | null;
  opened: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteVenueModal({ venue, opened, onClose, onDeleted }: DeleteVenueModalProps) {
  const mutation = useDeleteVenue({
    onSuccess: () => {
      onDeleted?.();
      onClose();
    },
  });

  const handleConfirm = () => {
    if (venue) {
      mutation.mutate(venue.id);
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
          <Trans>Delete Venue</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md" data-testid={TestSelectors.DELETE_VENUE_MODAL}>
        {mutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Delete failed</Trans>}
          >
            <Trans>Could not delete the venue. Please try again.</Trans>
          </Alert>
        )}

        <Text size="sm">
          <Trans>
            Are you sure you want to delete <strong>{venue?.name ?? ""}</strong>? This action cannot
            be undone.
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
            data-testid={TestSelectors.VENUE_DELETE_CONFIRM_BUTTON}
          >
            <Trans>Delete</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
