import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Stack,
  Button,
  Group,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconFileText, IconPencil, IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { notifications } from "@mantine/notifications";
import { PageTitle } from "@/shared/lib/page-title";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/venues/add")({
  component: AddVenuePage,
});

function AddVenuePage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <PageTitle segments={[t`Add a venue`, t`Venues`]} />

      <Stack gap={4} mb="xl">
        <Text size="xs" fw={600} tt="uppercase" c="red.6" style={{ letterSpacing: "0.07em" }}>
          <Trans>Add to catalog</Trans>
        </Text>
        <Title order={1} fw={700} size="h1">
          <Trans>Add a venue</Trans>
        </Title>
        <Text c="dimmed" size="sm" mt={2}>
          <Trans>
            Upload the venue's own document and we'll structure it — or enter the details by hand.
          </Trans>
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {/* ── File upload option ───────────────────────────────────────── */}
        <Dropzone
          onDrop={(files) => {
            // shortcut: file processing not yet wired to backend; show feedback for now
            notifications.show({
              title: t`File received`,
              message: files[0]?.name ?? t`Your file`,
              color: "blue",
            });
          }}
          accept={[
            "application/pdf",
            "image/*",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
          ]}
          data-testid={TestSelectors.VENUES_ADD_CHOOSE_FILE}
          styles={{
            root: {
              borderRadius: "var(--mantine-radius-md)",
              borderStyle: "dashed",
              borderWidth: 1.5,
              padding: "var(--mantine-spacing-xl)",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <Stack align="center" gap="md" ta="center">
            <Dropzone.Accept>
              <ThemeIcon size={56} radius="xl" variant="light" color="blue">
                <IconUpload size={28} />
              </ThemeIcon>
            </Dropzone.Accept>
            <Dropzone.Reject>
              <ThemeIcon size={56} radius="xl" variant="light" color="red">
                <IconX size={28} />
              </ThemeIcon>
            </Dropzone.Reject>
            <Dropzone.Idle>
              <ThemeIcon size={56} radius="xl" variant="light" color="gray">
                <IconFileText size={28} />
              </ThemeIcon>
            </Dropzone.Idle>

            <Stack gap={6}>
              <Text fw={600} size="md">
                <Trans>Drop a venue file to structure it</Trans>
              </Text>
              <Text size="sm" c="dimmed" maw={340}>
                <Trans>
                  Floor plans, capacity sheets, rate cards or brochures — PDF, image or spreadsheet.
                  We read capacity, pricing, catering and technical detail into the library.
                </Trans>
              </Text>
            </Stack>

            <Button
              variant="default"
              leftSection={<IconPhoto size={14} />}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Trans>Choose a file</Trans>
            </Button>
          </Stack>
        </Dropzone>

        {/* ── Manual entry option ──────────────────────────────────────── */}
        <Paper
          withBorder
          radius="md"
          p="xl"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Stack gap="md">
            <ThemeIcon size={40} radius="xl" variant="light" color="gray">
              <IconPencil size={20} />
            </ThemeIcon>

            <Stack gap={6}>
              <Text fw={600} size="md">
                <Trans>Or enter it yourself</Trans>
              </Text>
              <Text size="sm" c="dimmed" maw={300}>
                <Trans>
                  Faster when you already know the space — you can add the venue file later.
                </Trans>
              </Text>
            </Stack>

            <Group>
              <Button
                variant="default"
                size="sm"
                data-testid={TestSelectors.VENUES_ADD_BLANK_BUTTON}
                onClick={() => void navigate({ to: "/venues/create" })}
              >
                <Trans>Start from a blank venue</Trans>
              </Button>
            </Group>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
