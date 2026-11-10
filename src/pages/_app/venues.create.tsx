import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Button, Group, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { useCreateVenue, buildVenueSchema, emptyVenueFormValues } from "@/features/manage-venue";
import type { VenueFormValues } from "@/features/manage-venue";
import { VenueFields } from "@/features/manage-venue";

export const Route = createFileRoute("/_app/venues/create")({
  component: CreateVenuePage,
});

function CreateVenuePage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  const form = useForm<VenueFormValues>({
    initialValues: emptyVenueFormValues(),
    validate: (values) => validateWithZod(buildVenueSchema(), values),
  });

  const mutation = useCreateVenue({
    onSuccess: () => void navigate({ to: "/venues/" }),
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values);
  });

  const handleBack = () => void navigate({ to: "/venues/add" });

  return (
    <Container size="md" py="xl">
      <PageTitle segments={[t`New venue`, t`Venues`]} />

      <Stack gap={4} mb="xl">
        <Text size="xs" fw={600} tt="uppercase" c="red.6" style={{ letterSpacing: "0.07em" }}>
          <Trans>Add to catalog</Trans>
        </Text>
        <Title order={1} fw={700} size="h1">
          <Trans>New venue</Trans>
        </Title>
        <Text c="dimmed" size="sm" mt={2}>
          <Trans>Fill in the details below. You can add photos and files after saving.</Trans>
        </Text>
      </Stack>

      <form onSubmit={handleSubmit} data-testid={TestSelectors.VENUES_CREATE_PAGE}>
        <Stack gap="lg">
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

          <Group justify="space-between" mt="md">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={14} />}
              onClick={handleBack}
              disabled={mutation.isPending}
              data-testid={TestSelectors.VENUES_CREATE_BACK_BUTTON}
            >
              <Trans>Back</Trans>
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              data-testid={TestSelectors.VENUES_CREATE_SUBMIT_BUTTON}
            >
              <Trans>Create venue</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
