import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Anchor,
  Badge,
  Box,
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
  useMantineColorScheme,
} from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { Dropzone } from "@mantine/dropzone";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconExternalLink,
  IconFileText,
  IconPencil,
  IconSparkles,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Card shadows reused from the semantic-search widget so the upload/processing card
// shares the same "alive" choreography while work is in flight.
const REST_SHADOW = "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)";
const ACTIVE_SHADOW = "0 8px 24px rgba(34,139,230,0.22), 0 2px 6px rgba(34,139,230,0.14)";

function AddVenuePage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const reduceMotion = useReducedMotion();

  const { stage, progress, venueId, fileName, fileSize, errorMessage, upload, reset } =
    useUploadVenueDocument();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedTimer = useInterval(() => setElapsedSeconds((s) => s + 1), 1_000);
  // isExiting drives the framer-motion exit animation before navigate
  const [isExiting, setIsExiting] = useState(false);
  const exitTargetRef = useRef<string | null>(null);
  // Controls inside the zone open the picker through this, because the zone's own
  // click handler deliberately ignores clicks that land on a button.
  const openFileDialogRef = useRef<(() => void) | null>(null);

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
  // Only run the looping card choreography while work is in flight and motion is allowed.
  const isAnimating = isActive && !reduceMotion;

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    await upload(file);
  };

  /** Scale + fade the dropzone out, then navigate with fromUpload flag. */
  const handleViewVenue = (id: string) => {
    exitTargetRef.current = id;
    setIsExiting(true);
    setTimeout(() => {
      void navigate({
        to: "/venues/$venueId",
        params: { venueId: id },
        search: { fromUpload: true },
      });
    }, 380);
  };

  // ── Dynamic dropzone appearance ───────────────────────────────────────────
  const dropzoneGradient = isProcessing
    ? dark
      ? "linear-gradient(135deg,#1a1b2e 0%,#1e1a36 50%,#1a2436 100%)"
      : "linear-gradient(135deg,#f0f1ff 0%,#f5f0ff 50%,#eef4ff 100%)"
    : isDone
      ? dark
        ? "linear-gradient(135deg,#0f2318 0%,#0d2520 100%)"
        : "linear-gradient(135deg,#f0fff4 0%,#e6ffed 100%)"
      : isError
        ? dark
          ? "linear-gradient(135deg,#2b1515 0%,#231111 100%)"
          : "linear-gradient(135deg,#fff5f5 0%,#ffe8e8 100%)"
        : isActive
          ? dark
            ? "linear-gradient(135deg,#161c2e 0%,#1a2140 100%)"
            : "linear-gradient(135deg,#f0f3ff 0%,#e8edff 100%)"
          : "none";

  const dropzoneBorder = isProcessing
    ? "rgba(91,107,245,0.6)"
    : isDone
      ? "rgba(47,158,68,0.6)"
      : isError
        ? "rgba(224,49,49,0.5)"
        : isActive
          ? "rgba(91,107,245,0.4)"
          : dark
            ? "rgba(255,255,255,0.12)"
            : "rgba(0,0,0,0.12)";

  return (
    <Container size="lg" py="xl">
      <PageTitle segments={[t`Add a venue`, t`Venues`]} />

      <Button
        variant="subtle"
        color="gray"
        size="sm"
        px={0}
        leftSection={<IconArrowLeft size={14} />}
        data-testid={TestSelectors.VENUES_ADD_BACK_BUTTON}
        onClick={() => void navigate({ to: "/venues" })}
        mb="md"
      >
        <Trans>Back to list</Trans>
      </Button>

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

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" style={{ alignItems: "stretch" }}>
        {/* ── File upload card — exits on navigate ─────────────────────── */}
        <AnimatePresence mode="wait">
          {!isExiting ? (
            <motion.div
              key="dropzone-card"
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                boxShadow: isAnimating ? [REST_SHADOW, ACTIVE_SHADOW, REST_SHADOW] : REST_SHADOW,
              }}
              exit={{ opacity: 0, scale: 0.94, y: -10 }}
              transition={{
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1],
                boxShadow: isAnimating
                  ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4, ease: "easeOut" },
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "var(--mantine-radius-lg)",
              }}
            >
              <Dropzone
                onDrop={(files) => void handleDrop(files)}
                accept={ACCEPTED_TYPES}
                maxSize={MAX_FILE_SIZE}
                disabled={isActive}
                loading={false}
                maxFiles={1}
                openRef={openFileDialogRef}
                // The zone's built-in handler opens the picker for any click that
                // bubbles into it; this one only reacts to the zone itself, so
                // buttons such as "View venue" never open the file dialog.
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button, a, input, label")) return;
                  openFileDialogRef.current?.();
                }}
                data-testid={TestSelectors.VENUES_ADD_CHOOSE_FILE}
                styles={{
                  root: {
                    borderRadius: "var(--mantine-radius-lg)",
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: dropzoneBorder,
                    padding: "var(--mantine-spacing-xl)",
                    minHeight: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: dropzoneGradient,
                    transition: "border-color 0.3s, background 0.4s",
                    cursor: isActive ? "default" : "pointer",
                    overflow: "hidden",
                    position: "relative",
                    flex: 1,
                  },
                }}
              >
                {/* Flowing gradient accent bar on the left edge */}
                <motion.div
                  animate={
                    isAnimating
                      ? { backgroundPosition: ["0% 0%", "0% 200%"] }
                      : { backgroundPosition: "0% 0%" }
                  }
                  transition={
                    isAnimating
                      ? { duration: 2.2, repeat: Infinity, ease: "linear" }
                      : { duration: 0.6, ease: "easeOut" }
                  }
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 4,
                    zIndex: 1,
                    backgroundImage:
                      "linear-gradient(180deg, var(--mantine-color-blue-filled) 0%, var(--mantine-color-cyan-filled) 50%, var(--mantine-color-blue-filled) 100%)",
                    backgroundSize: "100% 200%",
                  }}
                />

                {/* Light sweep that travels across the card while work is running */}
                {isAnimating && (
                  <motion.div
                    initial={{ x: "-150%" }}
                    animate={{ x: "400%" }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 0.3,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: "35%",
                      zIndex: 0,
                      pointerEvents: "none",
                      background:
                        "linear-gradient(90deg, transparent, rgba(34,139,230,0.12), transparent)",
                    }}
                  />
                )}

                <Stack
                  align="center"
                  gap="md"
                  ta="center"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  {/* Icons */}
                  <Dropzone.Accept>
                    <ThemeIcon
                      size={64}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: "blue", to: "indigo" }}
                    >
                      <IconUpload size={30} />
                    </ThemeIcon>
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <ThemeIcon
                      size={64}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: "red.5", to: "red.7" }}
                    >
                      <IconX size={30} />
                    </ThemeIcon>
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    {isDone ? (
                      <ThemeIcon
                        size={64}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: "teal", to: "green" }}
                        style={{ boxShadow: "0 0 20px rgba(47,158,68,0.35)" }}
                      >
                        <IconCheck size={30} />
                      </ThemeIcon>
                    ) : isError ? (
                      <ThemeIcon
                        size={64}
                        radius="xl"
                        variant="light"
                        color="red"
                        style={{ boxShadow: "0 0 16px rgba(224,49,49,0.25)" }}
                      >
                        <IconAlertCircle size={30} />
                      </ThemeIcon>
                    ) : isProcessing ? (
                      <motion.div
                        animate={
                          isAnimating
                            ? { rotate: [0, 14, -8, 0], scale: [1, 1.18, 1] }
                            : { rotate: 0, scale: 1 }
                        }
                        transition={
                          isAnimating
                            ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                            : { type: "spring", stiffness: 400, damping: 20 }
                        }
                        style={{ display: "inline-flex" }}
                      >
                        <ThemeIcon
                          size={64}
                          radius="xl"
                          variant="gradient"
                          gradient={{ from: "#5b6bf5", to: "#8b5cf6" }}
                          style={{ boxShadow: "0 0 24px rgba(91,107,245,0.4)" }}
                        >
                          <IconSparkles size={30} />
                        </ThemeIcon>
                      </motion.div>
                    ) : isActive ? (
                      <ThemeIcon
                        size={64}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: "blue", to: "indigo" }}
                        style={{ boxShadow: "0 0 20px rgba(59,78,240,0.3)" }}
                      >
                        <IconUpload size={30} />
                      </ThemeIcon>
                    ) : (
                      <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                        <IconFileText size={30} />
                      </ThemeIcon>
                    )}
                  </Dropzone.Idle>

                  {/* Idle description */}
                  {!isActive && !isDone && !isError && (
                    <Stack gap={6}>
                      <Text fw={700} size="md">
                        <Trans>Drop a venue file to structure it</Trans>
                      </Text>
                      <Text size="sm" c="dimmed" maw={340}>
                        <Trans>
                          Floor plans, capacity sheets, rate cards or brochures — PDF, image or
                          spreadsheet. We read capacity, pricing, catering and technical detail into
                          the library.
                        </Trans>
                      </Text>
                    </Stack>
                  )}

                  {/* File identity chip */}
                  {(isActive || isDone || isError) && fileName && (
                    <Box
                      style={{
                        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                        borderRadius: "var(--mantine-radius-sm)",
                        padding: "6px 12px",
                      }}
                    >
                      <Group gap={6} justify="center">
                        <IconFileText size={13} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <Text size="sm" fw={500} lineClamp={1} maw={220}>
                          {fileName}
                        </Text>
                        {fileSize != null && (
                          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                            {formatBytes(fileSize)}
                          </Text>
                        )}
                      </Group>
                    </Box>
                  )}

                  {/* Progress area */}
                  {isActive && (
                    <Stack gap={8} w="100%" maw={300}>
                      <Group justify="space-between" gap="xs">
                        <Text
                          size="xs"
                          c={isProcessing ? "violet.4" : "dimmed"}
                          fw={isProcessing ? 600 : 400}
                        >
                          {STAGE_LABELS[stage] ?? stage}
                        </Text>
                        <Group gap={6}>
                          {isUploading && (
                            <Badge variant="light" color="blue" size="xs">
                              {progress}%
                            </Badge>
                          )}
                          {isProcessing && (
                            <>
                              <Badge
                                variant="gradient"
                                gradient={{ from: "#5b6bf5", to: "#8b5cf6" }}
                                size="xs"
                              >
                                AI
                              </Badge>
                              <Text
                                size="xs"
                                c="dimmed"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                {elapsedSeconds}s
                              </Text>
                            </>
                          )}
                        </Group>
                      </Group>

                      {isUploading ? (
                        <Progress
                          value={progress}
                          size="md"
                          radius="xl"
                          color="blue"
                          style={{ boxShadow: "0 0 8px rgba(59,78,240,0.3)" }}
                        />
                      ) : isProcessing ? (
                        <Box
                          style={{
                            height: 6,
                            borderRadius: 999,
                            overflow: "hidden",
                            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                          }}
                        >
                          <motion.div
                            animate={
                              reduceMotion
                                ? { backgroundPosition: "0% 50%" }
                                : {
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                  }
                            }
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{
                              height: "100%",
                              width: "100%",
                              background: "linear-gradient(90deg,#5b6bf5,#8b5cf6,#3b82f6,#5b6bf5)",
                              backgroundSize: "200% 100%",
                              borderRadius: 999,
                              boxShadow: "0 0 10px rgba(91,107,245,0.5)",
                            }}
                          />
                        </Box>
                      ) : (
                        <Progress value={100} animated size="md" radius="xl" color="blue" />
                      )}
                    </Stack>
                  )}

                  {/* Done: view venue */}
                  {isDone && venueId && (
                    <Button
                      variant="gradient"
                      gradient={{ from: "teal", to: "green", deg: 135 }}
                      size="sm"
                      rightSection={<IconExternalLink size={14} />}
                      style={{ boxShadow: "0 4px 16px rgba(47,158,68,0.3)" }}
                      onClick={() => handleViewVenue(venueId)}
                    >
                      <Trans>View venue</Trans>
                    </Button>
                  )}

                  {/* Error: reason + retry */}
                  {isError && (
                    <Stack gap={6} align="center">
                      {errorMessage && (
                        <Text size="xs" c="red.4" maw={300} ta="center">
                          {errorMessage}
                        </Text>
                      )}
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        onClick={reset}
                        style={{ boxShadow: "0 2px 8px rgba(224,49,49,0.2)" }}
                      >
                        <Trans>Try again</Trans>
                      </Button>
                    </Stack>
                  )}

                  {/* Idle: choose file */}
                  {!isActive && !isDone && !isError && (
                    <Button
                      variant="gradient"
                      gradient={{ from: "blue", to: "indigo", deg: 135 }}
                      leftSection={<IconUpload size={14} />}
                      size="sm"
                      onClick={() => openFileDialogRef.current?.()}
                      style={{ boxShadow: "0 4px 16px rgba(59,78,240,0.3)" }}
                    >
                      <Trans>Choose a file</Trans>
                    </Button>
                  )}
                </Stack>
              </Dropzone>
            </motion.div>
          ) : (
            // Placeholder keeps the grid stable while exit plays
            <div style={{ minHeight: 320 }} />
          )}
        </AnimatePresence>

        {/* ── Manual entry card ─────────────────────────────────────────── */}
        <Paper
          withBorder
          radius="lg"
          p="xl"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
            background: dark
              ? "linear-gradient(135deg,#1a2436 0%,#1e2744 100%)"
              : "linear-gradient(135deg,#ffffff 0%,#f8f9ff 100%)",
            boxShadow: dark
              ? "0 2px 16px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 2px 16px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.8)",
            borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }}
        >
          <Stack gap="md">
            <ThemeIcon
              size={48}
              radius="xl"
              variant="light"
              color="gray"
              style={{
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <IconPencil size={22} />
            </ThemeIcon>

            <Stack gap={6}>
              <Text fw={700} size="md">
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
                style={{
                  boxShadow: dark
                    ? "0 1px 4px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "0 1px 4px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <Trans>Start from a blank venue</Trans>
              </Button>
            </Group>

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
