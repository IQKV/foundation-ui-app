import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";
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
  Collapse,
  UnstyledButton,
  Badge,
  Avatar,
  TextInput as MantineTextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  IconFileText,
  IconPhoto,
  IconPaperclip,
  IconFocus,
  IconActivity,
  IconBolt,
  IconSparkles,
  IconUpload,
  IconCheck,
  IconAlertTriangle,
  IconChevronDown,
  IconPin,
  IconPinFilled,
  IconTrash,
  IconPlus,
  IconX,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import {
  useVenue,
  CompletenessRing,
  overallCompleteness,
  parseMetadata,
  METADATA_SECTIONS,
  resolveFieldValue,
  isFieldEmpty,
} from "@/features/manage-venue";
import type { MetadataDocument, MetadataFieldDefinition } from "@/features/manage-venue";
import {
  catalogApi,
  venueAssetApi,
  venueSmartNoteApi,
  iamApi,
  uploadFileToPresignedUrl,
} from "@/shared/api";
import type { VenueSmartNote, UserPublicProfile } from "@/shared/api";
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

  const [uploadingAsset, setUploadingAsset] = useState(false);
  const assetFileInputRef = useRef<HTMLInputElement>(null);
  const [metaExpanded, { toggle: toggleMeta }] = useDisclosure(false);

  const handleUploadAsset = async (file: File) => {
    setUploadingAsset(true);
    try {
      const init = await venueAssetApi.initiateUpload(venueId, {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      await uploadFileToPresignedUrl(init.presignedUploadUrl, file, () => {});
      await venueAssetApi.confirmUpload(venueId, init.assetId, {
        objectKey: init.objectKey,
        fileName: file.name,
        assetType: file.type.startsWith("image/") ? "PHOTO" : "DOCUMENT",
      });
      await queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] });
      notifications.show({
        message: t`Asset uploaded.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : t`Could not upload the asset.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setUploadingAsset(false);
      if (assetFileInputRef.current) assetFileInputRef.current.value = "";
    }
  };

  // ── Overview counts ──────────────────────────────────────────────────────────
  const { data: assetCountData } = useQuery({
    queryKey: ["tenant", "venue", venueId, "assets", "count"],
    queryFn: () => catalogApi.countVenueAssets(venueId),
  });
  const { data: sourceCountData } = useQuery({
    queryKey: ["tenant", "venue", venueId, "sources", "count"],
    queryFn: () => catalogApi.countVenueTextContents(venueId),
  });

  const photoCount = assetCountData?.photos ?? 0;
  const sourceCount = sourceCountData?.total ?? 0;
  const assetCount = assetCountData?.total ?? 0;
  const countsLoading = !assetCountData || !sourceCountData;

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
                    <Group
                      gap={0}
                      wrap="nowrap"
                      style={{
                        border: "1px solid var(--mantine-color-default-border)",
                        borderRadius: "var(--mantine-radius-sm)",
                        overflow: "hidden",
                      }}
                    >
                      <Button
                        variant="subtle"
                        color="gray"
                        size="sm"
                        radius={0}
                        leftSection={<IconSparkles size={15} />}
                        disabled={!venue}
                        onClick={() =>
                          void navigate({ to: "/venues/$venueId/research", params: { venueId } })
                        }
                      >
                        <Trans>Fill with AI</Trans>
                      </Button>
                      <Divider orientation="vertical" />
                      <Button
                        variant="subtle"
                        color="gray"
                        size="sm"
                        radius={0}
                        leftSection={<IconUpload size={15} />}
                        disabled={!venue}
                        loading={uploadingAsset}
                        data-testid={TestSelectors.VENUE_DETAIL_ASSET_UPLOAD_BUTTON}
                        onClick={() => assetFileInputRef.current?.click()}
                      >
                        <Trans>Upload asset</Trans>
                      </Button>
                      <input
                        ref={assetFileInputRef}
                        type="file"
                        hidden
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0];
                          if (file) void handleUploadAsset(file);
                        }}
                      />
                    </Group>
                  </Group>
                  <Group gap="lg" wrap="wrap">
                    <Group gap={6} wrap="nowrap">
                      <ThemeIcon size={20} radius="sm" variant="light" color="blue">
                        <IconFileText size={12} />
                      </ThemeIcon>
                      {countsLoading ? (
                        <Skeleton height={14} width={40} radius="sm" />
                      ) : (
                        <Text size="xs" c="dimmed">
                          {sourceCount} <Trans>sources</Trans>
                        </Text>
                      )}
                    </Group>
                    <Group gap={6} wrap="nowrap">
                      <ThemeIcon size={20} radius="sm" variant="light" color="violet">
                        <IconPhoto size={12} />
                      </ThemeIcon>
                      {countsLoading ? (
                        <Skeleton height={14} width={40} radius="sm" />
                      ) : (
                        <Text size="xs" c="dimmed">
                          {photoCount} <Trans>photos</Trans>
                        </Text>
                      )}
                    </Group>
                    <Group gap={6} wrap="nowrap">
                      <ThemeIcon size={20} radius="sm" variant="light" color="teal">
                        <IconPaperclip size={12} />
                      </ThemeIcon>
                      {countsLoading ? (
                        <Skeleton height={14} width={40} radius="sm" />
                      ) : (
                        <Text size="xs" c="dimmed">
                          {assetCount} <Trans>assets</Trans>
                        </Text>
                      )}
                    </Group>
                    <Group gap={6} wrap="nowrap">
                      <ThemeIcon size={20} radius="sm" variant="light" color="green">
                        <IconFocus size={12} />
                      </ThemeIcon>
                      {isLoading ? (
                        <Skeleton height={14} width={40} radius="sm" />
                      ) : (
                        <Text size="xs" c="dimmed">
                          {completeness.percent}% <Trans>complete</Trans>
                        </Text>
                      )}
                    </Group>
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

          {/* ── Expandable metadata section ──────────────────────────────── */}
          <Divider />
          <UnstyledButton
            onClick={toggleMeta}
            disabled={!venue}
            style={{ width: "100%", padding: "var(--mantine-spacing-xs) var(--mantine-spacing-md)" }}
          >
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600} c="dimmed">
                <Trans>All metadata</Trans>
              </Text>
              <IconChevronDown
                size={16}
                color="var(--mantine-color-dimmed)"
                style={{
                  transform: metaExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease",
                }}
              />
            </Group>
          </UnstyledButton>
          <Collapse expanded={metaExpanded}>
            <Box p="md" pt={0}>
              <VenueMetadataReadOnly metadata={parseMetadata(venue?.metadata ?? null)} />
            </Box>
          </Collapse>
        </Paper>

        {/* ── Dashboard: main stream + right rail ──────────────────────────── */}
        <Box
          mt="md"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: "var(--mantine-spacing-md)",
          }}
        >
          {/* Main column */}
          <Stack gap="md">
            <DashboardCard
              icon={<IconFocus size={18} />}
              title={<Trans>Today's focus</Trans>}
              subtitle={<Trans>Items that need attention for this venue</Trans>}
            >
              <FocusListPlaceholder />
            </DashboardCard>

            <DashboardCard
              icon={<IconActivity size={18} />}
              title={<Trans>Venue notes</Trans>}
              subtitle={<Trans>Latest changes on this venue</Trans>}
            >
              <VenueSmartNotesCard venueId={venueId} />
            </DashboardCard>
          </Stack>

          {/* Right rail */}
          <Stack gap="md">
            <DashboardCard
              icon={<IconBolt size={18} />}
              title={<Trans>Quick actions</Trans>}
            >
              <Button
                variant="light"
                color="gray"
                fullWidth
                leftSection={<IconFolder size={16} />}
                onClick={() =>
                  void navigate({ to: "/venues/$venueId/files", params: { venueId } })
                }
              >
                <Trans>Manage files</Trans>
              </Button>
            </DashboardCard>
          </Stack>
        </Box>
      </Container>
    </motion.div>
  );
}

// ─── Read-only metadata panel ─────────────────────────────────────────────────

function formatValue(def: MetadataFieldDefinition, value: unknown): string | null {
  if (isFieldEmpty(value)) return null;
  if (def.type === "boolean") return null; // handled separately
  if (def.type === "enum") {
    return def.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  if (def.type === "enum_multi") {
    const list = Array.isArray(value) ? value : [];
    return list.map((v) => def.options?.find((o) => o.value === v)?.label ?? String(v)).join(", ");
  }
  if (def.type === "contacts") {
    const rows = Array.isArray(value) ? value : [];
    return rows
      .map((r) => {
        if (r !== null && typeof r === "object") {
          const { name, role } = r as Record<string, unknown>;
          return [name, role].filter(Boolean).join(" · ");
        }
        return String(r);
      })
      .filter(Boolean)
      .join("; ");
  }
  if (def.type === "record_array") {
    const rows = Array.isArray(value) ? value : [];
    if (rows.length === 0) return null;
    return rows
      .map((r) => {
        if (r !== null && typeof r === "object") {
          return (def.recordFields ?? [])
            .map((f) => {
              const v = (r as Record<string, unknown>)[f.key];
              if (v == null || v === "") return null;
              return f.unit ? `${v} ${f.unit}` : String(v);
            })
            .filter(Boolean)
            .join(" · ");
        }
        return String(r);
      })
      .filter(Boolean)
      .join("; ");
  }
  if (Array.isArray(value)) return value.join(", ");
  if (def.unit) return `${String(value)} ${def.unit}`;
  return String(value);
}

function VenueMetadataReadOnly({ metadata }: { metadata: MetadataDocument | null }) {
  if (!metadata) return null;
  return (
    <Stack gap="md">
      {METADATA_SECTIONS.map((section) => {
        const rows = section.fields
          .filter((f) => f.type !== "boolean" || Boolean(resolveFieldValue(metadata, f)))
          .map((f) => ({ f, label: f.label, value: f.type === "boolean" ? true : formatValue(f, resolveFieldValue(metadata, f)) }))
          .filter((r) => r.value !== null);

        if (rows.length === 0) return null;

        return (
          <Box key={section.key}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={6} style={{ letterSpacing: "0.07em" }}>
              {section.subgroup ?? section.label}
            </Text>
            <Stack gap={4}>
              {rows.map(({ f, label, value }) => (
                <Group key={f.key} gap={6} wrap="nowrap" align="flex-start">
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0, minWidth: 140 }} lineClamp={1}>
                    {label}
                  </Text>
                  <Text size="xs" fw={500} style={{ wordBreak: "break-word" }}>
                    {f.type === "boolean" ? "✓" : String(value)}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>
        );
      }).filter(Boolean)}
    </Stack>
  );
}

// ─── Dashboard building blocks ────────────────────────────────────────────────

interface DashboardCardProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

function DashboardCard({ icon, title, subtitle, children }: DashboardCardProps) {
  return (
    <Paper withBorder radius="md" shadow="sm" p="lg">
      <Group gap="xs" mb="md" align="flex-start">
        {icon && (
          <ThemeIcon variant="light" color="gray" size={32} radius="md">
            {icon}
          </ThemeIcon>
        )}
        <Stack gap={0}>
          <Text fw={700} size="md">
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
      </Group>
      {children}
    </Paper>
  );
}

function FocusListPlaceholder() {
  return (
    <Stack gap="sm">
      {[0, 1, 2].map((i) => (
        <Group key={i} gap="sm" align="flex-start" p="sm" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-sm)" }}>
          <Skeleton height={20} width={20} radius="sm" />
          <Stack gap={4} style={{ flex: 1 }}>
            <Skeleton height={14} width="60%" radius="sm" />
            <Skeleton height={12} width="40%" radius="sm" />
          </Stack>
          <Skeleton height={20} width={56} radius="sm" />
        </Group>
      ))}
    </Stack>
  );
}

// ─── NOTE_COLORS: 3 swatches — white, soft teal, soft yellow ──────────────────
const NOTE_COLORS = [
  { value: "#ffffff", label: "White" },
  { value: "#e6f7f5", label: "Teal" },
  { value: "#fff9c4", label: "Yellow" },
] as const;

type NoteColor = (typeof NOTE_COLORS)[number]["value"];

/** Strip HTML tags to plain text for the list preview. */
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

// ─── Colour swatch picker ─────────────────────────────────────────────────────

function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: NoteColor;
  onChange: (c: NoteColor) => void;
}) {
  return (
    <Group gap={6}>
      {NOTE_COLORS.map((c) => (
        <UnstyledButton
          key={c.value}
          aria-label={c.label}
          onClick={() => onChange(c.value)}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: c.value,
            border:
              value === c.value
                ? "2px solid var(--mantine-color-teal-6)"
                : "2px solid var(--mantine-color-default-border)",
            flexShrink: 0,
          }}
        />
      ))}
    </Group>
  );
}

// ─── Note editor panel ────────────────────────────────────────────────────────

interface NoteEditorProps {
  initialTitle: string;
  initialContent: string;
  initialColor: NoteColor;
  isNew: boolean;
  isSaving: boolean;
  onSave: (title: string, content: string, color: NoteColor) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function NoteEditor({
  initialTitle,
  initialContent,
  initialColor,
  isNew,
  isSaving,
  onSave,
  onCancel,
  onDelete,
}: NoteEditorProps) {
  const { t } = useLingui();
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState<NoteColor>(initialColor);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: initialContent || "",
  });

  // sync content when switching notes
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  return (
    <Paper
      withBorder
      radius="md"
      shadow="sm"
      style={{ background: color, overflow: "hidden" }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        px="md"
        py="xs"
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      >
        <Text size="xs" fw={700} tt="uppercase" c="teal.7" style={{ letterSpacing: "0.08em" }}>
          {isNew ? <Trans>New note</Trans> : <Trans>Editing note</Trans>}
        </Text>
        <Group gap={4}>
          {!isNew && onDelete && (
            <Tooltip label={t`Delete note`} withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                aria-label={t`Delete note`}
                onClick={onDelete}
              >
                <IconTrash size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          <ActionIcon variant="subtle" color="gray" size="sm" aria-label={t`Close`} onClick={onCancel}>
            <IconX size={15} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack gap={0} p="md" pb="xs">
        {/* Title */}
        <MantineTextInput
          variant="unstyled"
          fw={700}
          size="md"
          placeholder={t`Title`}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          style={{ marginBottom: 4 }}
        />

        {/* Tiptap editor */}
        <RichTextEditor
          editor={editor}
          styles={{
            root: { border: "none", background: "transparent" },
            toolbar: { background: "transparent", borderBottom: "1px solid var(--mantine-color-default-border)", paddingBottom: 4, marginBottom: 4 },
            content: { background: "transparent", minHeight: 100, fontSize: "var(--mantine-font-size-sm)" },
          }}
        >
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>

        {/* Colour picker */}
        <Group justify="space-between" align="center" mt="xs">
          <ColorSwatchPicker value={color} onChange={setColor} />
        </Group>
      </Stack>

      {/* Footer */}
      <Divider />
      <Group justify="space-between" px="md" py="sm">
        <Button variant="subtle" color="gray" size="xs" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          size="xs"
          color="teal"
          loading={isSaving}
          onClick={() => onSave(title, editor?.getHTML() ?? "", color)}
        >
          <Trans>Save note</Trans>
        </Button>
      </Group>
    </Paper>
  );
}

// ─── Smart notes list card ────────────────────────────────────────────────────

function VenueSmartNotesCard({ venueId }: { venueId: string }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  // null = nothing open; "new" = new note form; uuid = editing that note
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "smart-notes"],
    queryFn: () => venueSmartNoteApi.list(venueId, { direction: "DESC" }),
  });

  const rawNotes = data?.items ?? [];
  // pinned notes first, then sort unpinned by date (direction controlled by sortAsc)
  const notes = [...rawNotes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return sortAsc ? -diff : diff;
  });

  // Bulk-fetch author profiles for all unique author ids in one request.
  const authorIds = useMemo(
    () => [...new Set(rawNotes.map((n) => n.authorId))],
    [rawNotes],
  );
  const { data: profilesData } = useQuery({
    queryKey: ["iam", "user-profiles", authorIds],
    queryFn: () => iamApi.getUserProfiles(authorIds),
    enabled: authorIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const profilesMap = useMemo(() => {
    const map = new Map<string, UserPublicProfile>();
    profilesData?.forEach((p) => map.set(p.id, p));
    return map;
  }, [profilesData]);

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      title,
      content,
      color,
    }: {
      id: string | null;
      title: string;
      content: string;
      color: string;
    }) =>
      id
        ? venueSmartNoteApi.patch(id, { title, content, color })
        : venueSmartNoteApi.create({ venueId, title, content, color }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId, "smart-notes"] });
      setOpenId(null);
    },
    onError: (err) =>
      notifications.show({
        message: err instanceof Error ? err.message : t`Could not save note.`,
        color: "red",
      }),
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      venueSmartNoteApi.setPinned(id, pinned),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId, "smart-notes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => venueSmartNoteApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId, "smart-notes"] });
      setOpenId(null);
    },
    onError: (err) =>
      notifications.show({
        message: err instanceof Error ? err.message : t`Could not delete note.`,
        color: "red",
      }),
  });

  if (isLoading) {
    return (
      <Stack gap={0}>
        {[0, 1, 2].map((i) => (
          <Group key={i} gap="sm" py="sm" style={{ borderBottom: i < 2 ? "1px solid var(--mantine-color-default-border)" : undefined }}>
            <Skeleton height={14} width="60%" radius="sm" />
          </Group>
        ))}
      </Stack>
    );
  }

  const editingNote = openId && openId !== "new" ? notes.find((n) => n.id === openId) : null;

  return (
    <Stack gap={0}>
      {/* Editor — shown at the top when creating/editing */}
      {openId && (
        <Box mb="sm">
          <NoteEditor
            key={openId} // remount when switching notes
            initialTitle={editingNote?.title ?? ""}
            initialContent={editingNote?.content ?? ""}
            initialColor={
              (editingNote?.color as NoteColor | null | undefined) ?? NOTE_COLORS[0].value
            }
            isNew={openId === "new"}
            isSaving={saveMutation.isPending}
            onSave={(title, content, color) =>
              saveMutation.mutate({ id: openId === "new" ? null : openId, title, content, color })
            }
            onCancel={() => setOpenId(null)}
            onDelete={
              editingNote
                ? () => deleteMutation.mutate(editingNote.id)
                : undefined
            }
          />
        </Box>
      )}

      {/* Note list */}
      {notes.length === 0 && !openId && (
        <Text size="sm" c="dimmed" fs="italic" py="sm">
          <Trans>No notes yet. Add the first one below.</Trans>
        </Text>
      )}

      {/* Sort order control — shown only when there are unpinned notes */}
      {notes.some((n) => !n.pinned) && (
        <Group justify="flex-end" mb={4}>
          <Tooltip label={sortAsc ? t`Oldest first — click for newest first` : t`Newest first — click for oldest first`} withArrow>
            <UnstyledButton
              onClick={() => setSortAsc((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--mantine-color-dimmed)" }}
              aria-label={sortAsc ? t`Sort newest first` : t`Sort oldest first`}
            >
              {sortAsc ? <IconSortAscending size={12} /> : <IconSortDescending size={12} />}
              <Text size="xs" c="dimmed">{sortAsc ? <Trans>Oldest first</Trans> : <Trans>Newest first</Trans>}</Text>
            </UnstyledButton>
          </Tooltip>
        </Group>
      )}

      {notes.map((note, idx) => {
        const bg = (note.color as NoteColor | null) ?? "#ffffff";
        const preview = stripHtml(note.content);
        const tags = note.tags ?? [];
        const isEditing = openId === note.id;
        const author = profilesMap.get(note.authorId);

        return (
          <Box
            key={note.id}
            style={{
              borderBottom:
                idx < notes.length - 1
                  ? "1px solid var(--mantine-color-default-border)"
                  : undefined,
              background: bg,
              borderRadius: idx === 0 ? "var(--mantine-radius-sm) var(--mantine-radius-sm) 0 0" : idx === notes.length - 1 ? "0 0 var(--mantine-radius-sm) var(--mantine-radius-sm)" : undefined,
              paddingLeft: "var(--mantine-spacing-sm)",
              paddingRight: "var(--mantine-spacing-sm)",
              opacity: isEditing ? 0.5 : 1,
              transition: "opacity 150ms",
            }}
            py="sm"
          >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" c="dimmed" ff="monospace">
                  {dayjs(note.updatedAt).format("MMM D, YYYY")}
                </Text>
                {note.title && (
                  <Text fw={700} size="sm" lineClamp={1}>
                    {note.title}
                  </Text>
                )}
                {preview && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {preview}
                  </Text>
                )}
                {tags.length > 0 && (
                  <Group gap={4} mt={2} wrap="wrap">
                    {tags.map((tag) => (
                      <Badge key={tag} size="xs" variant="light" color="gray" radius="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </Group>
                )}
                <Text size="xs" c="dimmed">
                  {dayjs(note.updatedAt).format("h:mm A")}
                </Text>
                {/* Author indicator */}
                <Group gap={4} align="center" mt={2}>
                  <Tooltip
                    label={
                      author
                        ? `${author.firstName} ${author.lastName}`
                        : note.authorId.slice(0, 8)
                    }
                    withArrow
                    position="bottom"
                  >
                    <Avatar
                      src={author?.avatarUrl ?? null}
                      size={16}
                      radius="xl"
                      color="teal"
                      style={{ cursor: "default" }}
                    >
                      {author
                        ? `${author.firstName[0] ?? ""}${author.lastName[0] ?? ""}`.toUpperCase()
                        : "?"}
                    </Avatar>
                  </Tooltip>
                  {author && (
                    <Text size="xs" c="dimmed">
                      {author.firstName} {author.lastName}
                    </Text>
                  )}
                </Group>
              </Stack>

              <Group gap={4} style={{ flexShrink: 0 }}>
                <Tooltip label={note.pinned ? t`Unpin` : t`Pin`} withArrow>
                  <ActionIcon
                    variant="subtle"
                    color={note.pinned ? "teal" : "gray"}
                    size="xs"
                    aria-label={note.pinned ? t`Unpin note` : t`Pin note`}
                    loading={pinMutation.isPending}
                    onClick={() => pinMutation.mutate({ id: note.id, pinned: !note.pinned })}
                  >
                    {note.pinned ? <IconPinFilled size={12} /> : <IconPin size={12} />}
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t`Edit`} withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    aria-label={t`Edit note`}
                    onClick={() => setOpenId(isEditing ? null : note.id)}
                  >
                    <IconPencil size={12} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>
        );
      })}

      {/* New note row */}
      {!openId && (
        <UnstyledButton
          mt="xs"
          onClick={() => setOpenId("new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "var(--mantine-spacing-xs) 0",
            color: "var(--mantine-color-dimmed)",
          }}
          aria-label={t`Add a new note`}
        >
          <IconPlus size={14} />
          <Text size="xs" c="dimmed">
            <Trans>New note</Trans>
          </Text>
        </UnstyledButton>
      )}
    </Stack>
  );
}
