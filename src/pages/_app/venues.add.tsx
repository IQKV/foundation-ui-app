import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { Dropzone } from "@mantine/dropzone";
import {
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
  IconFileText,
  IconPencil,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { PageTitle } from "@/shared/lib/page-title";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useUploadVenueDocument } from "@/features/manage-venue";

export const Route = createFileRoute("/_app/venues/add")({
  component: AddVenuePage,
});

/** 5 MB — mirrors the backend upload policy. */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const STAGE_LABELS: Record<string, string> = {
  "initiating-upload": "Preparing upload…",
  uploading: "Uploading…",
  confirming: "Finalising…",
  processing: "Extracting venue data…",
  done: "Done",
  error: "Failed",
};

/** Formats bytes as a human-readable size string. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AddVenuePage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { stage, progress, venueId, fileName, fileSize, errorMessage, upload, reset } =
    useUploadVenueDocument();

  // ── Elapsed seconds counter during the AI processing stage ──────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedTimer = useInterval(() => setElapsedSeconds((s) => s + 1), 1_000);

  useEffect(() => {
    if (stage === "processing") {
      setElapsedSeconds(0);
      elapsedTimer.start();
    } else {
      elapsedTimer.stop();
    }
    return () => elapsedTimer.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const isActive = stage !== "idle" && stage !== "done" && stage !== "error";
  const isDone = stage === "done";
  const isError = stage === "error";
  const isProcessing = stage === "processing";
  const isUploading = stage === "uploading";

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    await upload(file);
    // Navigation happens via the "View venue" button in done state — no auto-redirect
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
        <Text size="xs" c="dimmed">
          <Trans>Accepted formats: PDF, Word, Excel, CSV, JPEG, PNG, WebP · Max 5 MB</Trans>
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {/* ── File upload option ───────────────────────────────────────── */}
        <Dropzone
          onDrop={(files) => void handleDrop(files)}
          accept={ACCEPTED_TYPES}
          maxSize={MAX_FILE_SIZE}
          disabled={isActive}
          loading={isActive && !isProcessing}
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
            {/* ── Icon area ───────────────────────────────────────────── */}
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

            {/* ── Static description ──────────────────────────────────── */}
            {!isActive && !isDone && !isError && (
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
            )}

            {/* ── File identity — shown once a file is in flight or done ─ */}
            {(isActive || isDone || isError) && fileName && (
              <Group gap={6} justify="center">
                <IconFileText size={14} style={{ opacity: 0.5 }} />
                <Text size="sm" fw={500} lineClamp={1} maw={240}>
                  {fileName}
                </Text>
                {fileSize != null && (
                  <Text size="xs" c="dimmed">
                    {formatBytes(fileSize)}
                  </Text>
                )}
              </Group>
            )}

            {/* ── Active: stage label + progress / AI spinner ─────────── */}
            {isActive && (
              <Stack gap={6} w="100%" maw={300}>
                <Group justify="space-between" gap="xs">
                  <Text size="xs" c="dimmed">
                    {STAGE_LABELS[stage] ?? stage}
                  </Text>
                  {isUploading && (
                    <Badge variant="light" color="blue" size="xs">
                      {progress}%
                    </Badge>
                  )}
                  {isProcessing && (
                    <Group gap={4}>
                      <Badge variant="light" color="violet" size="xs">
                        <Trans>AI</Trans>
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {elapsedSeconds}s
                      </Text>
                    </Group>
                  )}
                </Group>

                {/* Show real progress bar only during byte transfer; pulse otherwise */}
                {isUploading ? (
                  <Progress value={progress} size="sm" radius="xl" color="blue" />
                ) : isProcessing ? (
                  <Progress value={100} animated size="sm" radius="xl" color="violet" />
                ) : (
                  <Progress value={100} animated size="sm" radius="xl" color="blue" />
                )}
              </Stack>
            )}

            {/* ── Done: venue link ─────────────────────────────────────── */}
            {isDone && venueId && (
              <Button
                variant="filled"
                color="green"
                size="sm"
                rightSection={<IconExternalLink size={14} />}
                onClick={() => void navigate({ to: "/venues/$venueId", params: { venueId } })}
              >
                <Trans>View venue</Trans>
              </Button>
            )}

            {/* ── Error: message + retry ───────────────────────────────── */}
            {isError && (
              <Stack gap={6} align="center">
                {errorMessage && (
                  <Text size="xs" c="red" maw={300} ta="center">
                    {errorMessage}
                  </Text>
                )}
                <Button size="xs" variant="light" color="red" onClick={reset}>
                  <Trans>Try again</Trans>
                </Button>
              </Stack>
            )}

            {/* ── Idle: choose file button ─────────────────────────────── */}
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

            {/* Done: also offer a secondary link to add another */}
            {isDone && (
              <Anchor size="xs" c="dimmed" component="button" onClick={reset}>
                <Trans>Upload another file</Trans>
              </Anchor>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
