import { useEffect } from "react";
import { Modal, Stack, Group, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import type { Venue } from "@/entities/venue";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { TestSelectors } from "@/shared/lib/test-selectors";
import {
  useUpdateVenue,
  buildVenueSchema,
  emptyVenueFormValues,
  toVenueFormValues,
} from "../model";
import type { VenueFormValues } from "../model";
import { VenueFields } from "./venue-fields";

interface EditVenueModalProps {
  venue: Venue | null;
  opened: boolean;
  onClose: () => void;
}

export function EditVenueModal({ venue, opened, onClose }: EditVenueModalProps) {
  const form = useForm<VenueFormValues>({
    initialValues: emptyVenueFormValues(),
    validate: (values) => validateWithZod(buildVenueSchema(), values),
  });

  useEffect(() => {
    if (venue) {
      form.setValues(toVenueFormValues(venue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue]);

  const mutation = useUpdateVenue({ venueId: venue?.id ?? "", onSuccess: handleClose });

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
            <Trans>Edit Venue</Trans>
          </Text>
          {venue && (
            <Text size="xs" c="dimmed">
              <Trans>ID: {venue.id}</Trans>
            </Text>
          )}
        </Stack>
      }
      size="xl"
      centered
    >
      <form onSubmit={handleSubmit} data-testid={TestSelectors.EDIT_VENUE_MODAL}>
        <Stack gap="md">
          {mutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={<Trans>Failed to update venue</Trans>}
            >
              <Trans>Please check the form and try again.</Trans>
            </Alert>
          )}

          <VenueFields form={form} />

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
              type="submit"
              loading={mutation.isPending}
              data-testid={TestSelectors.VENUE_EDIT_SAVE_BUTTON}
            >
              <Trans>Save changes</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
