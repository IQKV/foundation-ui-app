import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Container,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  Button,
  ActionIcon,
  Tooltip,
  Anchor,
  ThemeIcon,
  Divider,
  SegmentedControl,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconBuildingStore,
  IconMapPin,
  IconExternalLink,
  IconLink,
  IconFolder,
  IconLayoutDashboard,
  IconPencil,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import {
  useVenue,
  CompletenessRing,
  overallCompleteness,
  parseMetadata,
} from "@/features/manage-venue";
import { dayjs } from "@/shared/lib/date-utils";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useAiContextActions } from "@/features/ask-ai";
import type { ChatEndpoints } from "@/features/ask-ai";

export const Route = createFileRoute("/_app/venues/$venueId")({
  // `fromUpload` is set when the add flow lands here after importing a document.
  validateSearch: z.object({ fromUpload: z.boolean().optional() }),
  component: VenueOverviewPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function VenueOverviewPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { venueId } = Route.useParams();
  const { fromUpload } = Route.useSearch();
  const queryClient = useQueryClient();

  const VENUE_CHAT_ENDPOINTS: ChatEndpoints = useMemo(
    () => ({
      send: "/v1/catalog/chat",
      sessions: "/v1/catalog/chat/sessions",
      messages: "/v1/catalog/chat/sessions/:sessionId/messages",
      delete: "/v1/catalog/chat/sessions/:sessionId",
    }),
    [],
  );

  useAiContextActions(
    useMemo(
      () => [
        { label: t`Summarise this venue`, message: t`Give me a short summary of this venue.` },
        { label: t`What's missing?`, message: t`Which profile fields are empty or incomplete?` },
        {
          label: t`What documents exist?`,
          message: t`What documents and sources are attached to this venue?`,
        },
      ],
      [t],
    ),
    { endpoints: VENUE_CHAT_ENDPOINTS, venueId },
  );

  const { data: venue, isLoading, isError, refetch, isFetching } = useVenue(venueId);

  // Client-side profile completeness, derived from the raw metadata document.
  const completeness = overallCompleteness(parseMetadata(venue?.metadata ?? null));

  const hasPhoto = Boolean(venue?.primaryPhotoUrl);
  const isMasterLinked = Boolean(venue?.masterVenueId);
  const venueLabel = venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue`;
  const locationLine = [venue?.address, venue?.city].filter(Boolean).join(", ");
  const mapUrl =
    venue?.locationLat != null && venue?.locationLng != null
      ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
      : null;

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageTitle segments={[t`Venues`, t`Venue`]} />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load the venue</Trans>}
          color="red"
          variant="light"
          mt="md"
        >
          <Trans>The venue could not be found or the API is unavailable.</Trans>
          <Group mt="sm">
            <Button
              variant="light"
              color="red"
              size="xs"
              data-testid={TestSelectors.VENUE_DETAIL_ERROR_RETRY_BUTTON}
              onClick={() => void refetch()}
            >
              <Trans>Retry</Trans>
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => void navigate({ to: "/venues" })}
            >
              <Trans>Back to list</Trans>
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <motion.div
      initial={fromUpload ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Container size="100%" px="md" py={0} style={{ maxWidth: 1600 }}>
        <PageTitle segments={[t`Venues`, venueLabel]} />
        <PageHeader
          title={venue ? [venue.name, venue.city].filter(Boolean).join(", ") : <Trans>Venue</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/" },
            { label: <Trans>Venues</Trans>, to: "/venues" },
            { label: venueLabel },
          ]}
          toolbar={
            <Group gap="xs" justify="space-between" wrap="nowrap" style={{ width: "100%" }}>
              <Group gap="xs" wrap="nowrap">
                <Tooltip label={t`Back to list`} withArrow>
                  <ActionIcon
                    data-testid={TestSelectors.VENUE_DETAIL_BACK_BUTTON}
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={t`Back to list`}
                    onClick={() => void navigate({ to: "/venues" })}
                  >
                    <IconArrowLeft size={15} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t`Refresh`} withArrow>
                  <ActionIcon
                    data-testid={TestSelectors.VENUE_DETAIL_REFRESH_BUTTON}
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() =>
                      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] })
                    }
                    loading={isFetching}
                  >
                    <IconRefresh size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <SegmentedControl
                size="sm"
                value="overview"
                data-testid={TestSelectors.VENUE_VIEW_MODE_SWITCHER}
                onChange={(v) => {
                  if (v === "research") {
                    void navigate({ to: "/venues/$venueId/research", params: { venueId } });
                  } else if (v === "files") {
                    void navigate({ to: "/venues/$venueId/files", params: { venueId } });
                  }
                }}
                data={[
                  {
                    value: "overview",
                    label: (
                      <Group gap={6} wrap="nowrap">
                        <IconLayoutDashboard size={14} />
                        <Trans>Overview</Trans>
                      </Group>
                    ),
                  },
                  {
                    value: "research",
                    label: (
                      <Group gap={6} wrap="nowrap">
                        <IconPencil size={14} />
                        <Trans>Research</Trans>
                      </Group>
                    ),
                  },
                  {
                    value: "files",
                    label: (
                      <Group gap={6} wrap="nowrap">
                        <IconFolder size={14} />
                        <Trans>Files</Trans>
                      </Group>
                    ),
                  },
                ]}
              />
            </Group>
          }
        />

        {/* ── Hero: large image + brief information + completeness ─────── */}
        <Paper
          withBorder
          radius="md"
          shadow="sm"
          style={{ overflow: "hidden" }}
          data-testid={TestSelectors.VENUE_DETAIL_HERO}
        >
          <Box style={{ display: "flex", flexWrap: "wrap" }}>
            {/* Image */}
            <Box
              style={{
                position: "relative",
                flex: "1 1 320px",
                minWidth: 0,
                minHeight: 280,
              }}
            >
              {isLoading ? (
                <Skeleton height="100%" radius={0} />
              ) : (
                <>
                  <Box
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: hasPhoto
                        ? `url(${venue!.primaryPhotoUrl}) center/cover no-repeat`
                        : "linear-gradient(135deg, var(--mantine-color-gray-2) 0%, var(--mantine-color-gray-4) 100%)",
                    }}
                  />
                  {!hasPhoto && (
                    <Group
                      justify="center"
                      align="center"
                      style={{ position: "absolute", inset: 0, opacity: 0.25 }}
                    >
                      <IconBuildingStore size={64} color="var(--mantine-color-gray-7)" />
                    </Group>
                  )}
                  <Box
                    style={{
                      position: "absolute",
                      top: "var(--mantine-spacing-sm)",
                      right: "var(--mantine-spacing-sm)",
                    }}
                  >
                    {/* Master linkage is internal system info — subtle backdrop hint, no label. */}
                    <ThemeIcon
                      aria-hidden
                      size={24}
                      radius="xl"
                      variant={isMasterLinked ? "filled" : "light"}
                      color={isMasterLinked ? "blue" : "gray"}
                    >
                      <IconLink size={13} />
                    </ThemeIcon>
                  </Box>
                </>
              )}
            </Box>

            {/* Brief information */}
            <Box style={{ flex: "2 1 420px", minWidth: 0 }}>
              <Stack gap="lg" p="xl" h="100%" justify="space-between">
                <Stack gap="sm">
                  <Group gap="sm" wrap="nowrap">
                    {isLoading ? (
                      <Skeleton height={32} width={220} radius="sm" />
                    ) : (
                      <Text fw={800} size="1.75rem" lh={1.15}>
                        {venue?.name ?? t`Venue`}
                      </Text>
                    )}
                  </Group>

                  {isLoading ? (
                    <Skeleton height={14} width={280} radius="sm" />
                  ) : locationLine ? (
                    <Group gap={6} wrap="nowrap">
                      <IconMapPin size={14} color="var(--mantine-color-gray-5)" />
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {locationLine}
                      </Text>
                      {mapUrl && (
                        <Anchor
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="xs"
                          style={{ flexShrink: 0 }}
                        >
                          <Group gap={3} wrap="nowrap">
                            <IconExternalLink size={11} />
                            <Trans>Maps</Trans>
                          </Group>
                        </Anchor>
                      )}
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      <Trans>No address on record</Trans>
                    </Text>
                  )}

                  {isLoading ? (
                    <Stack gap={8}>
                      {[90, 75, 60].map((w, i) => (
                        <Skeleton key={i} height={13} width={`${w}%`} radius="sm" />
                      ))}
                    </Stack>
                  ) : venue?.description ? (
                    <Text size="sm" c="dimmed" lineClamp={4} style={{ whiteSpace: "pre-line" }}>
                      {venue.description}
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      <Trans>No description available.</Trans>
                    </Text>
                  )}
                </Stack>

                <Stack gap="md">
                  <Divider />
                  <Group justify="space-between" wrap="wrap" gap="md">
                    <Group gap="sm" wrap="nowrap">
                      <CompletenessRing percent={completeness.percent} isLoading={isLoading} />
                      <Stack gap={0}>
                        <Text size="sm" fw={600}>
                          <Trans>Profile completeness</Trans>
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {completeness.filled}/{completeness.total} <Trans>fields filled</Trans>
                        </Text>
                      </Stack>
                    </Group>
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconPencil size={15} />}
                      disabled={!venue}
                      onClick={() =>
                        void navigate({ to: "/venues/$venueId/research", params: { venueId } })
                      }
                    >
                      <Trans>Research & edit</Trans>
                    </Button>
                  </Group>
                  {!isLoading && venue?.updatedAt && (
                    <Text size="xs" c="dimmed">
                      <Trans>Last updated</Trans>{" "}
                      {dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm")}
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* ── Content below the hero is pending discussion. ────────────── */}
      </Container>
    </motion.div>
  );
}
