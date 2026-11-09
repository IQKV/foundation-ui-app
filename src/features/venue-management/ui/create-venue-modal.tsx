import { Modal, Stack, Group, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useCreateVenue, buildVenueSchema, emptyVenueFormValues } from "../model";
import type { VenueFormValues } from "../model";
import { VenueFields } from "./venue-fields";

interface CreateVenueModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateVenueModal({ opened, onClose }: CreateVenueModalProps) {
  const form = useForm<VenueFormValues>({
    initialValues: emptyVenueFormValues(),
    validate: (values) => validateWithZod(buildVenueSchema(), values),
  });

  const mutation = useCreateVenue({ onSuccess: handleClose });

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
        <Text fw={600} size="md">
          <Trans>Create Venue</Trans>
        </Text>
      }
      size="xl"
      centered
    >
      <form onSubmit={handleSubmit} data-testid={TestSelectors.CREATE_VENUE_MODAL}>
        <Stack gap="md">
          {mutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={<Trans>Failed to create venue</Trans>}
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
              data-testid={TestSelectors.VENUE_CREATE_SUBMIT_BUTTON}
            >
              <Trans>Create venue</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
