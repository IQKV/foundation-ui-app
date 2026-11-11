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
  Progress,
  Badge,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
  IconFileText,
  IconPencil,
  IconUpload,
  IconX,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useUploadVenueDocument } from "@/features/manage-venue";

export const Route = createFileRoute("/_app/venues/add")({
  component: AddVenuePage,
});

const STAGE_LABELS = {
  idle: "",
  "initiating-upload": "Preparing upload…",
  uploading: "Uploading…",
  confirming: "Finalising…",
  processing: "Extracting venue data…",
  done: "Done",
  error: "Failed",
} as const;

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function AddVenuePage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { stage, progress, venueId, upload, reset } = useUploadVenueDocument();

  const isActive = stage !== "idle" && stage !== "done" && stage !== "error";
  const isDone = stage === "done";
  const isError = stage === "error";

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const resultVenueId = await upload(file);
    if (resultVenueId) {
      void navigate({ to: "/venues/$venueId", params: { venueId: resultVenueId } });
    }
    // null result (timeout or error) — stay on the page so user can retry
  };

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
          onDrop={(files) => void handleDrop(files)}
          accept={ACCEPTED_TYPES}
          disabled={isActive}
          loading={isActive}
          maxFiles={1}
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
              {isDone ? (
                <ThemeIcon size={56} radius="xl" variant="light" color="green">
                  <IconCheck size={28} />
                </ThemeIcon>
              ) : isError ? (
                <ThemeIcon size={56} radius="xl" variant="light" color="red">
                  <IconAlertCircle size={28} />
                </ThemeIcon>
              ) : (
                <ThemeIcon size={56} radius="xl" variant="light" color="gray">
                  <IconFileText size={28} />
                </ThemeIcon>
              )}
            </Dropzone.Idle>

            <Stack gap={6}>
              <Text fw={600} size="md">
                <Trans>Drop a venue file to structure it</Trans>
              </Text>
              <Text size="sm" c="dimmed" maw={340}>
                <Trans>
                  Floor plans, capacity sheets, rate cards or brochures — PDF, image or
                  spreadsheet. We read capacity, pricing, catering and technical detail into the
                  library.
                </Trans>
              </Text>
            </Stack>

            {/* Progress feedback */}
            {isActive && (
              <Stack gap={6} w="100%" maw={300}>
                <Group justify="space-between" gap="xs">
                  <Text size="xs" c="dimmed">
                    {STAGE_LABELS[stage]}
                  </Text>
                  {stage === "uploading" && (
                    <Badge variant="light" color="blue" size="xs">
                      {progress}%
                    </Badge>
                  )}
                  {stage === "processing" && (
                    <Badge variant="light" color="violet" size="xs">
                      <Trans>AI</Trans>
                    </Badge>
                  )}
                </Group>
                <Progress
                  value={stage === "uploading" ? progress : 100}
                  animated={stage !== "uploading"}
                  size="sm"
                  radius="xl"
                  color={stage === "processing" ? "violet" : "blue"}
                />
              </Stack>
            )}

            {isError && (
              <Button size="xs" variant="light" color="red" onClick={reset}>
                <Trans>Try again</Trans>
              </Button>
            )}

            {!isActive && !isDone && !isError && (
              <Button variant="default" leftSection={<IconUpload size={14} />} size="sm">
                <Trans>Choose a file</Trans>
              </Button>
            )}
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
                disabled={isActive}
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
