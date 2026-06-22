import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import type { CmsPageSummary } from "@/shared/api";
import { useDeletePage } from "../model";

interface DeletePageModalProps {
  page: CmsPageSummary | null;
  opened: boolean;
  onClose: () => void;
}

export function DeletePageModal({ page, opened, onClose }: DeletePageModalProps) {
  const mutation = useDeletePage({ onSuccess: onClose });

  const displayName = page?.title ?? page?.slug ?? page?.id ?? "";

  const handleConfirm = () => {
    if (page) mutation.mutate(page.id);
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
          <Trans>Delete Page</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md" data-testid="modal--delete-page">
        {mutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Delete failed</Trans>}
          >
            <Trans>Could not delete the page. It may be published.</Trans>
          </Alert>
        )}

        <Text size="sm">
          <Trans>
            Are you sure you want to delete <strong>{displayName}</strong>? This action cannot be
            undone.
          </Trans>
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleClose}
            disabled={mutation.isPending}
            data-testid="button--cancel"
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="red"
            loading={mutation.isPending}
            onClick={handleConfirm}
            data-testid="button--delete"
          >
            <Trans>Delete</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
