import { useRef, useState } from "react";
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
  Badge,
  Button,
  ActionIcon,
  Popover,
  Tooltip,
  Tabs,
  SimpleGrid,
  Anchor,
  Loader,
  ThemeIcon,
  Divider,
  Collapse,
  Modal,
  ScrollArea,
  Grid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconBuildingStore,
  IconMapPin,
  IconExternalLink,
  IconAdjustments,
  IconCheck,
  IconAlertTriangle,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconPaperclip,
  IconEye,
  IconUpload,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import type { Venue, VenueAsset, VenueAssetPublic, VenueTextContent } from "@/entities/venue";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { catalogApi, venueAssetApi, uploadFileToPresignedUrl } from "@/shared/api";
import {
  useVenue,
  ACCENT_GRADIENT,
  SECTION_CARD_STYLES,
  ASSET_ROW_STYLES,
  EditVenueModal,
  DeleteVenueModal,
  VenueCompletenessCard,
  VenueMetadataSections,
  VenueAiEnrichModal,
  overallCompleteness,
  parseMetadata,
  useVenueEnrichment,
} from "@/features/manage-venue";
import { dayjs } from "@/shared/lib/date-utils";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/venues/$venueId")({
  validateSearch: z.object({ fromUpload: z.boolean().optional() }),
  component: VenueDetailPage,
});

// ─── Section card ─────────────────────────────────────────────────────────────

interface InfoSectionCardProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  /** Number of populated fields — shown as completeness badge when total > 0. */
  filled?: number;
  total?: number;
  isLoading?: boolean;
  children: React.ReactNode;
}

function InfoSectionCard({
  title,
  icon,
  filled,
  total,
  isLoading,
  children,
}: InfoSectionCardProps) {
  const allFilled = filled != null && total != null && filled === total && total > 0;
  return (
    <Paper withBorder radius="md" p="lg" shadow="sm" styles={SECTION_CARD_STYLES}>
      <Group justify="space-between" align="flex-start" mb="sm">
        <Group gap={8}>
          <ThemeIcon size={28} radius="sm" variant="light" color="blue">
            {icon}
          </ThemeIcon>
          <Text size="md" fw={700}>
            {title}
          </Text>
        </Group>
        {filled != null && total != null && total > 0 && (
          <Badge
            variant="light"
            color={allFilled ? "teal" : "gray"}
            size="xs"
            leftSection={
              allFilled ? (
                <IconCheck size={10} style={{ marginTop: 1 }} />
              ) : (
                <IconAlertTriangle size={10} style={{ marginTop: 1 }} />
              )
            }
          >
            {filled}/{total}
          </Badge>
        )}
      </Group>
      <Divider mb="sm" />
      {isLoading ? (
        <Stack gap={8}>
          {[75, 55, 65, 45].map((w, i) => (
            <Skeleton key={i} height={13} width={`${w}%`} radius="sm" />
          ))}
        </Stack>
      ) : (
        children
      )}
    </Paper>
  );
}

function FieldChip({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  const empty = value == null || value === "";
  return (
    <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {label}:
      </Text>
      {empty ? (
        <Text size="sm" c="dimmed" fs="italic">
          —
        </Text>
      ) : (
        <Text size="sm" style={{ wordBreak: "break-word" }}>
          {value}
        </Text>
      )}
    </Group>
  );
}

// ─── Photos tab ───────────────────────────────────────────────────────────────

function PhotosTab({ photos, isLoading }: { photos: VenueAssetPublic[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={130} radius="sm" />
        ))}
      </SimpleGrid>
    );
  }
  if (photos.length === 0) {
    return (
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
      >
        <Stack align="center" gap="sm">
          <IconPhoto size={40} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed">
            <Trans>No photos for this venue.</Trans>
          </Text>
        </Stack>
      </Paper>
    );
  }
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
      {photos.map((photo, i) => (
        <Box key={photo.id} style={{ position: "relative" }}>
          {photo.sourceUrl ? (
            <img
              src={photo.sourceUrl}
              alt={photo.label ?? photo.fileName ?? ""}
              style={{
                width: "100%",
                height: 130,
                objectFit: "cover",
                display: "block",
                borderRadius: "var(--mantine-radius-sm)",
              }}
            />
          ) : (
            <Group
              justify="center"
              align="center"
              style={{
                height: 130,
                background: "var(--mantine-color-gray-1)",
                borderRadius: "var(--mantine-radius-sm)",
              }}
            >
              <IconPhoto size={24} color="var(--mantine-color-gray-4)" />
            </Group>
          )}
          <Box style={{ position: "absolute", top: 6, right: 6 }}>
            <Badge variant="filled" color="dark" size="xs" radius="sm" style={{ opacity: 0.75 }}>
              #{i + 1}
            </Badge>
          </Box>
          {photo.label && (
            <Text size="xs" c="dimmed" lineClamp={1} mt={4}>
              {photo.label}
            </Text>
          )}
        </Box>
      ))}
    </SimpleGrid>
  );
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

/** Content types the preview modal can render inline. */
function isPreviewable(contentType: string | null): boolean {
  return (
    Boolean(contentType) && (contentType!.startsWith("image/") || contentType === "application/pdf")
  );
}

/**
 * Design tokens for the asset preview dialog: a hairline-framed card with a
 * 7px radius, a soft shadow, an accent-tinted icon tile and a quiet canvas
 * behind the rendered object.
 */
const PREVIEW_TOKENS = {
  border: "var(--mantine-color-gray-3)",
  borderSubtle: "var(--mantine-color-gray-2)",
  accentText: "var(--mantine-color-blue-8)",
  /** accent at 12% over transparent — the tile behind the loading icon */
  accentTile: "color-mix(in oklab, var(--mantine-color-blue-6) 12%, transparent)",
  /** neutral canvas behind the object, quieter than the dialog chrome */
  canvas: "color-mix(in oklab, var(--mantine-color-gray-1) 55%, var(--app-surface-bg))",
  radius: 7,
  radiusL: 10,
} as const;

/** Dialog chrome: hairline frame, rounded corners and a header rule. */
const PREVIEW_MODAL_STYLES = {
  content: {
    borderRadius: PREVIEW_TOKENS.radiusL,
    border: `1px solid ${PREVIEW_TOKENS.border}`,
    boxShadow: "0 16px 40px rgba(17,28,43,0.18), 0 2px 8px rgba(17,28,43,0.08)",
    overflow: "hidden",
  },
  header: {
    padding: "10px 16px",
    borderBottom: `1px solid ${PREVIEW_TOKENS.borderSubtle}`,
    background: "var(--app-surface-bg)",
  },
  title: { fontWeight: 700, fontSize: "var(--mantine-font-size-md)" },
  body: { padding: 0 },
} as const;

/** The panel that holds the rendered object. */
const PREVIEW_SURFACE_STYLES = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 320,
  overflow: "hidden",
  border: `1px solid ${PREVIEW_TOKENS.border}`,
  borderRadius: PREVIEW_TOKENS.radius,
  background: "var(--app-surface-bg)",
} as const;

/** The 56px accent tile of the loading / empty state. */
const PREVIEW_ICON_TILE_STYLES = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 56,
  height: 56,
  borderRadius: PREVIEW_TOKENS.radius,
  background: PREVIEW_TOKENS.accentTile,
  color: PREVIEW_TOKENS.accentText,
} as const;

function AssetsTab({
  venueId,
  assets,
  isLoading,
}: {
  venueId: string;
  assets: VenueAsset[];
  isLoading: boolean;
}) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<{
    name: string;
    url: string | null;
    contentType: string | null;
    sizeBytes: number | null;
  } | null>(null);
  // Track which asset's delete popover is open
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => venueAssetApi.deleteAsset(venueId, assetId),
    onSuccess: () => {
      setDeletingId(null);
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] });
      notifications.show({
        message: t`Asset deleted.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    },
    onError: (err) => {
      notifications.show({
        message: err instanceof Error ? err.message : t`Could not delete the asset.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    },
  });

  const openPreview = async (asset: VenueAsset, name: string) => {
    setPreview({ name, url: null, contentType: asset.contentType, sizeBytes: asset.sizeBytes });
    try {
      const result = await venueAssetApi.previewUrl(venueId, asset.id);
      setPreview((current) =>
        current ? { ...current, url: result.url, contentType: result.contentType } : current,
      );
    } catch {
      setPreview(null);
      notifications.show({
        message: t`Could not load the preview.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : assets.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          radius="md"
          style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
        >
          <Stack align="center" gap="sm">
            <IconPaperclip size={40} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed">{t`No assets for this venue.`}</Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap={6}>
          {assets.map((asset) => {
            const name = asset.label ?? asset.fileName ?? asset.id;
            return (
              <Paper key={asset.id} withBorder p="sm" radius="md" styles={ASSET_ROW_STYLES}>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon
                      size={32}
                      radius="sm"
                      variant="light"
                      color="gray"
                      style={{ flexShrink: 0 }}
                    >
                      <IconPaperclip size={16} />
                    </ThemeIcon>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {asset.assetType}
                        {asset.contentType ? ` · ${asset.contentType}` : ""}
                        {asset.sizeBytes != null
                          ? ` · ${Math.round(asset.sizeBytes / 1024)} KB`
                          : ""}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                    {isPreviewable(asset.contentType) && (
                      <Button
                        size="compact-sm"
                        variant="subtle"
                        leftSection={<IconEye size={14} />}
                        onClick={() => void openPreview(asset, name)}
                      >
                        <Trans>Preview</Trans>
                      </Button>
                    )}
                    <Popover
                      opened={deletingId === asset.id}
                      onClose={() => setDeletingId(null)}
                      position="left"
                      withArrow
                      shadow="md"
                      width={200}
                    >
                      <Popover.Target>
                        <Tooltip label={t`Delete asset`} withArrow>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            aria-label={t`Delete asset`}
                            loading={deleteMutation.isPending && deletingId === asset.id}
                            onClick={() => setDeletingId(asset.id)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Stack gap={8}>
                          <Text size="sm" fw={600}>
                            <Trans>Delete asset?</Trans>
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {name}
                          </Text>
                          <Group gap={6} justify="flex-end">
                            <Button
                              size="compact-xs"
                              variant="subtle"
                              color="gray"
                              onClick={() => setDeletingId(null)}
                            >
                              <Trans>Cancel</Trans>
                            </Button>
                            <Button
                              size="compact-xs"
                              color="red"
                              loading={deleteMutation.isPending}
                              onClick={() => deleteMutation.mutate(asset.id)}
                            >
                              <Trans>Delete</Trans>
                            </Button>
                          </Group>
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={preview !== null}
        onClose={() => setPreview(null)}
        size="xl"
        centered
        styles={PREVIEW_MODAL_STYLES}
        title={
          preview && (
            <Stack gap={0}>
              <Text fw={700} size="sm" lineClamp={1}>
                {preview.name}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {preview.contentType ?? t`File`}
              </Text>
            </Stack>
          )
        }
      >
        {preview && (
          <Box>
            {/* Meta strip: the content-type chip and size, plus a way to the raw file. */}
            <Group
              gap="sm"
              px="md"
              py={8}
              wrap="nowrap"
              justify="space-between"
              style={{ borderBottom: `1px solid ${PREVIEW_TOKENS.borderSubtle}` }}
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <Badge variant="light" color="blue" radius="sm" size="sm">
                  {preview.contentType?.split("/").pop()?.toUpperCase() ?? t`File`}
                </Badge>
                {preview.sizeBytes != null && (
                  <Text size="xs" c="dimmed">
                    {Math.round(preview.sizeBytes / 1024)} KB
                  </Text>
                )}
              </Group>
              {preview.url && (
                <Anchor
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  size="xs"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <IconExternalLink size={13} />
                  <Trans>Open</Trans>
                </Anchor>
              )}
            </Group>

            {/* The sunken canvas that holds the rendered object. */}
            <Box p="md" style={{ background: PREVIEW_TOKENS.canvas }}>
              <Box style={PREVIEW_SURFACE_STYLES}>
                {!preview.url ? (
                  <Stack align="center" gap="sm" py="xl">
                    <Box style={PREVIEW_ICON_TILE_STYLES}>
                      <IconPhoto size={26} />
                    </Box>
                    <Loader size="sm" />
                    <Text size="xs" c="dimmed">
                      <Trans>Preparing the preview…</Trans>
                    </Text>
                  </Stack>
                ) : preview.contentType === "application/pdf" ? (
                  <iframe
                    src={preview.url}
                    title={preview.name}
                    style={{ width: "100%", height: "72vh", border: 0, display: "block" }}
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "72vh",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Modal>
    </>
  );
}

// ─── Sources tab ─────────────────────────────────────────────────────────────

/** Collapse whitespace so a text chunk renders as a single readable line. */
function sourceLabel(content: string): string {
  return content.trim().replace(/\s+/g, " ");
}

/** Text variant of the preview surface — full width and top-aligned instead of centred. */
const PREVIEW_TEXT_SURFACE_STYLES = {
  ...PREVIEW_SURFACE_STYLES,
  alignItems: "stretch",
  justifyContent: "flex-start",
  padding: "var(--mantine-spacing-md)",
} as const;

function SourcesTab({ sources, isLoading }: { sources: VenueTextContent[]; isLoading: boolean }) {
  const { t } = useLingui();
  const [preview, setPreview] = useState<VenueTextContent | null>(null);

  return (
    <>
      {isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : sources.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          radius="md"
          style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
        >
          <Stack align="center" gap="sm">
            <IconFileText size={40} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed">{t`No sources for this venue.`}</Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap={6}>
          {sources.map((source) => (
            <Paper key={source.id} withBorder p="sm" radius="md" styles={ASSET_ROW_STYLES}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <ThemeIcon
                    size={32}
                    radius="sm"
                    variant="light"
                    color="gray"
                    style={{ flexShrink: 0 }}
                  >
                    <IconFileText size={16} />
                  </ThemeIcon>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {sourceLabel(source.content)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {source.content.length} <Trans>characters</Trans>
                      {` · ${dayjs(source.createdAt).format("MMM D, YYYY HH:mm")}`}
                    </Text>
                  </Stack>
                </Group>
                <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Button
                    size="compact-sm"
                    variant="subtle"
                    leftSection={<IconEye size={14} />}
                    onClick={() => setPreview(source)}
                  >
                    <Trans>Preview</Trans>
                  </Button>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <Modal
        opened={preview !== null}
        onClose={() => setPreview(null)}
        size="xl"
        centered
        styles={PREVIEW_MODAL_STYLES}
        title={
          preview && (
            <Stack gap={0}>
              <Text fw={700} size="sm" lineClamp={1}>
                {sourceLabel(preview.content)}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {dayjs(preview.createdAt).format("MMM D, YYYY HH:mm")}
              </Text>
            </Stack>
          )
        }
      >
        {preview && (
          <Box>
            {/* Meta strip: the content kind and its size, mirroring the asset dialog. */}
            <Group
              gap="sm"
              px="md"
              py={8}
              wrap="nowrap"
              justify="space-between"
              style={{ borderBottom: `1px solid ${PREVIEW_TOKENS.borderSubtle}` }}
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <Badge variant="light" color="blue" radius="sm" size="sm">
                  <Trans>Text</Trans>
                </Badge>
                <Text size="xs" c="dimmed">
                  {preview.content.length} <Trans>characters</Trans>
                </Text>
              </Group>
            </Group>

            {/* The sunken canvas that holds the rendered chunk. */}
            <Box p="md" style={{ background: PREVIEW_TOKENS.canvas }}>
              <Box style={PREVIEW_TEXT_SURFACE_STYLES}>
                <ScrollArea.Autosize mah="72vh" style={{ width: "100%" }}>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {preview.content}
                  </Text>
                </ScrollArea.Autosize>
              </Box>
            </Box>
          </Box>
        )}
      </Modal>
    </>
  );
}

// ─── Tab label styles — mirrors bigTabStyles in admin ────────────────────────

const bigTabStyles = {
  tab: {
    fontSize: "var(--mantine-font-size-lg)",
    fontWeight: 600,
    padding: "var(--mantine-spacing-md) var(--mantine-spacing-xl)",
  },
};

// ─── Quality control bar — slim banner at the top of the right column ─────────

// ─── Page ─────────────────────────────────────────────────────────────────────

function VenueDetailPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { venueId } = Route.useParams();
  const { fromUpload } = Route.useSearch();
  const { payload, isTenantOwner } = useSession();
  const canManage = isTenantOwner;

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deletedVenue, setDeletedVenue] = useState<Venue | null>(null);
  const [rawJsonOpened, { toggle: toggleRawJson }] = useDisclosure(false);
  const [aiEnrichOpened, { open: openAiEnrich, close: closeAiEnrich }] = useDisclosure(false);

  const enrichment = useVenueEnrichment(venueId);

  const queryClient = useQueryClient();
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  const { data: venue, isLoading, isError, refetch, isFetching } = useVenue(venueId);

  // Client-side profile completeness, derived from the raw metadata document.
  const completeness = overallCompleteness(parseMetadata(venue?.metadata ?? null));

  // Photos come from the tenant venue asset photos endpoint.
  // Fetched unconditionally for this venue once the venue is loaded.
  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "photos"],
    queryFn: () => catalogApi.listVenueAssetPhotos(venueId),
    enabled: Boolean(venue),
  });

  const photos = photosData?.items ?? [];

  // All assets (photos and attachments) come from the venue assets endpoint.
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "assets"],
    queryFn: () => catalogApi.listVenueAssets(venueId),
    enabled: Boolean(venue),
  });

  const assets = assetsData?.items ?? [];

  // Text-content rows (extracted source chunks) linked to the venue.
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "sources"],
    queryFn: () => catalogApi.listVenueTextContents(venueId),
    enabled: Boolean(venue),
  });

  const sources = sourcesData?.items ?? [];

  const hasPhoto = Boolean(venue?.primaryPhotoUrl);

  const mapUrl =
    venue?.locationLat && venue?.locationLng
      ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
      : null;

  const handleDeleteSuccess = () => void navigate({ to: "/venues" });

  /** Initiate → PUT to MinIO → confirm, then refresh the venue's asset queries. */
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
        message:
          err instanceof Error ? err.message : t`Could not upload the asset. Please try again.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setUploadingAsset(false);
      if (assetFileInputRef.current) assetFileInputRef.current.value = "";
    }
  };

  // Completeness counts for section cards
  const locationFilled = [venue?.address, venue?.city, venue?.locationLat].filter(Boolean).length;

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
        <PageTitle
          segments={[
            t`Venues`,
            venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue`,
          ]}
        />
        <PageHeader
          title={<Trans>Venue</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/" },
            { label: <Trans>Venues</Trans>, to: "/venues" },
            { label: venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue` },
          ]}
          toolbar={
            <Group gap="xs">
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
                  onClick={() => void refetch()}
                  loading={isFetching}
                >
                  <IconRefresh size={15} />
                </ActionIcon>
              </Tooltip>
              {canManage && (
                <>
                  <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconEdit size={15} />}
                    disabled={!venue}
                    data-testid={TestSelectors.VENUE_DETAIL_EDIT_BUTTON}
                    onClick={openEdit}
                  >
                    <Trans>Edit Manually</Trans>
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
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
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    leftSection={<IconTrash size={15} />}
                    disabled={!venue}
                    data-testid={TestSelectors.VENUE_DETAIL_DELETE_BUTTON}
                    onClick={() => {
                      setDeletedVenue(venue ?? null);
                      openDelete();
                    }}
                  >
                    <Trans>Delete</Trans>
                  </Button>
                </>
              )}
            </Group>
          }
        />

        <Grid gap="lg">
          {/* ── Left column: profile + info cards ──────────────────────── */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md">
              {/* Profile card */}
              <Paper
                withBorder
                radius="md"
                shadow="sm"
                style={{ overflow: "hidden" }}
                styles={SECTION_CARD_STYLES}
                data-testid={TestSelectors.VENUE_DETAIL_HERO}
              >
                <Box style={{ position: "relative", height: 160 }}>
                  <Box
                    style={{
                      height: "100%",
                      background: hasPhoto
                        ? `url(${venue!.primaryPhotoUrl}) center/cover no-repeat`
                        : "linear-gradient(135deg, var(--mantine-color-gray-2) 0%, var(--mantine-color-gray-4) 100%)",
                    }}
                  />
                  {isLoading && <Skeleton height={160} radius={0} />}
                  {!isLoading && !hasPhoto && (
                    <Group
                      justify="center"
                      align="center"
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.2,
                      }}
                    >
                      <IconBuildingStore size={64} color="var(--mantine-color-gray-7)" />
                    </Group>
                  )}
                  {!isLoading && (
                    <Box
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: hasPhoto
                          ? "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 50%, transparent 100%)"
                          : "linear-gradient(to top, rgba(0,0,0,0.08) 0%, transparent 60%)",
                      }}
                    />
                  )}
                  {!isLoading && (
                    <Box
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "var(--mantine-spacing-md)",
                      }}
                    >
                      <Stack gap={4}>
                        <Group gap="sm" align="center" wrap="nowrap">
                          <Text
                            fw={800}
                            style={{
                              color: hasPhoto ? "#ffffff" : "var(--mantine-color-dark-9)",
                              lineHeight: 1.15,
                              letterSpacing: "-0.02em",
                              textShadow: hasPhoto ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                              fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                            }}
                            data-testid={TestSelectors.VENUE_DETAIL_NAME}
                          >
                            {venue?.name}
                          </Text>
                        </Group>
                        {(venue?.address || venue?.city) && (
                          <Group gap={5} wrap="nowrap">
                            <IconMapPin
                              size={13}
                              color={
                                hasPhoto ? "rgba(255,255,255,0.75)" : "var(--mantine-color-gray-6)"
                              }
                            />
                            <Text
                              size="sm"
                              style={{
                                color: hasPhoto
                                  ? "rgba(255,255,255,0.85)"
                                  : "var(--mantine-color-gray-7)",
                              }}
                              data-testid={TestSelectors.VENUE_DETAIL_CITY}
                            >
                              {[venue?.address, venue?.city].filter(Boolean).join(", ")}
                            </Text>
                          </Group>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>

                {/* soft gradient rim */}
                <Box
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "var(--mantine-radius-md)",
                    padding: 1,
                    background: ACCENT_GRADIENT,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    opacity: 0.75,
                    pointerEvents: "none",
                  }}
                />
              </Paper>

              {/* Quality control — detailed completeness breakdown */}
              <VenueCompletenessCard completeness={completeness} isLoading={isLoading} />

              {/* Location */}
              <InfoSectionCard
                title={<Trans>Address & coordinates</Trans>}
                icon={<IconMapPin size={14} />}
                filled={locationFilled}
                total={3}
                isLoading={isLoading}
              >
                <Stack gap={6}>
                  <FieldChip label={<Trans>Address</Trans>} value={venue?.address} />
                  <FieldChip label={<Trans>City</Trans>} value={venue?.city} />
                  <FieldChip
                    label={<Trans>Coordinates</Trans>}
                    value={
                      venue?.locationLat && venue?.locationLng ? (
                        <Group gap={6} wrap="nowrap">
                          <Text size="sm">
                            {String(venue.locationLat)}, {String(venue.locationLng)}
                          </Text>
                          {mapUrl && (
                            <Anchor
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="sm"
                            >
                              <Group gap={3} wrap="nowrap">
                                <IconExternalLink size={11} />
                                <Trans>Maps</Trans>
                              </Group>
                            </Anchor>
                          )}
                        </Group>
                      ) : null
                    }
                  />
                </Stack>
              </InfoSectionCard>

              {/* Record */}
              <InfoSectionCard
                title={<Trans>Identifiers & timestamps</Trans>}
                icon={<IconAdjustments size={14} />}
                isLoading={isLoading}
              >
                <Stack gap={6}>
                  <FieldChip
                    label={<Trans>Venue ID</Trans>}
                    value={
                      venue ? (
                        <Text size="sm" ff="monospace">
                          {venue.id}
                        </Text>
                      ) : null
                    }
                  />
                  <FieldChip
                    label={<Trans>Created</Trans>}
                    value={
                      venue?.createdAt ? dayjs(venue.createdAt).format("MMM D, YYYY HH:mm") : null
                    }
                  />
                  <FieldChip
                    label={<Trans>Updated</Trans>}
                    value={
                      venue?.updatedAt ? dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm") : null
                    }
                  />
                </Stack>
              </InfoSectionCard>
            </Stack>
          </Grid.Col>

          {/* ── Right column: tabs ─────────────────────────────────────── */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="md">
              {/* Fill with AI — sticky at column top, clears the drawer trigger zone */}
              {canManage && venue && completeness.percent < 100 && (
                <Box style={{ position: "sticky", top: 16, zIndex: 100 }}>
                  <Button
                    size="sm"
                    variant="gradient"
                    gradient={{ from: "violet", to: "blue" }}
                    leftSection={<IconSparkles size={15} />}
                    radius="xl"
                    onClick={openAiEnrich}
                    aria-label={t`Fill with AI`}
                  >
                    <Trans>Fill with AI</Trans>
                  </Button>
                </Box>
              )}
              {/* ── Tabs — mirrors admin VenueProfileWidget tab structure ─────── */}
              <Tabs defaultValue="details" keepMounted={false}>
                <Tabs.List
                  styles={{
                    list: {
                      gap: 8,
                      borderBottomWidth: 2,
                    },
                  }}
                >
                  <Tabs.Tab
                    value="details"
                    leftSection={<IconAdjustments size={20} />}
                    styles={bigTabStyles}
                  >
                    <Trans>Details</Trans>
                  </Tabs.Tab>
                  {venue && (
                    <Tabs.Tab
                      value="photos"
                      leftSection={<IconPhoto size={20} />}
                      styles={bigTabStyles}
                      rightSection={
                        !photosLoading && photos.length > 0 ? (
                          <Badge size="xl" variant="filled" color="blue" circle>
                            {photos.length}
                          </Badge>
                        ) : undefined
                      }
                    >
                      <Trans>Photos</Trans>
                    </Tabs.Tab>
                  )}
                  {venue && (
                    <Tabs.Tab
                      value="assets"
                      leftSection={<IconPaperclip size={20} />}
                      styles={bigTabStyles}
                      rightSection={
                        !assetsLoading && assets.length > 0 ? (
                          <Badge size="xl" variant="filled" color="blue" circle>
                            {assets.length}
                          </Badge>
                        ) : undefined
                      }
                    >
                      <Trans>Assets</Trans>
                    </Tabs.Tab>
                  )}
                  {venue && (
                    <Tabs.Tab
                      value="sources"
                      leftSection={<IconFileText size={20} />}
                      styles={bigTabStyles}
                      rightSection={
                        !sourcesLoading && sources.length > 0 ? (
                          <Badge size="xl" variant="filled" color="blue" circle>
                            {sources.length}
                          </Badge>
                        ) : undefined
                      }
                    >
                      <Trans>Sources</Trans>
                    </Tabs.Tab>
                  )}
                </Tabs.List>

                {/* ── Details tab ──────────────────────────────────────────────── */}
                <Tabs.Panel value="details">
                  <Stack gap="md" pt="sm">
                    {/* ── Metadata (TENANT_OWNER / ADMIN only) ───────────────── */}
                    {canManage && venue && (
                      <>
                        <Divider
                          label={
                            <Text
                              size="xs"
                              fw={700}
                              tt="uppercase"
                              c="dimmed"
                              style={{ letterSpacing: "0.07em" }}
                            >
                              <Trans>Metadata</Trans>
                            </Text>
                          }
                          labelPosition="left"
                          my="sm"
                        />

                        <Stack gap="md">
                          <VenueMetadataSections
                            venueId={venueId}
                            metadata={venue.metadata ?? null}
                            isLoading={isLoading}
                            suggestions={enrichment.pendingPatches}
                            onAcceptSuggestion={(s) =>
                              enrichment.applyPatches([s], venue.metadata ?? null)
                            }
                            onDismissSuggestion={(s) => enrichment.dismissPatch(s)}
                          />

                          {/* Raw JSON fallback — read-only, collapsible */}
                          <Paper
                            withBorder
                            radius="md"
                            p="lg"
                            shadow="sm"
                            styles={SECTION_CARD_STYLES}
                          >
                            <Group
                              justify="space-between"
                              align="flex-start"
                              wrap="nowrap"
                              gap="md"
                            >
                              <Group gap={8}>
                                <ThemeIcon size={28} radius="sm" variant="light" color="gray">
                                  <IconPaperclip size={14} />
                                </ThemeIcon>
                                <Stack gap={0}>
                                  <Text size="md" fw={700}>
                                    <Trans>Raw JSON document</Trans>
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    <Trans>Read-only view of the full metadata string.</Trans>
                                  </Text>
                                </Stack>
                              </Group>
                              <Button
                                variant="subtle"
                                color="gray"
                                size="compact-sm"
                                style={{ flexShrink: 0 }}
                                onClick={toggleRawJson}
                              >
                                {rawJsonOpened ? t`Hide raw JSON` : t`Show raw JSON`}
                              </Button>
                            </Group>
                            <Collapse expanded={rawJsonOpened}>
                              <Divider my="sm" />
                              {isLoading ? (
                                <Skeleton height={120} radius="sm" />
                              ) : (
                                <Box
                                  component="pre"
                                  style={{
                                    margin: 0,
                                    padding: "var(--mantine-spacing-sm)",
                                    background: "var(--mantine-color-gray-0)",
                                    borderRadius: "var(--mantine-radius-sm)",
                                    fontFamily: "var(--mantine-font-family-monospace)",
                                    fontSize: "var(--mantine-font-size-xs)",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                    overflowY: "auto",
                                    maxHeight: 400,
                                  }}
                                >
                                  {(() => {
                                    if (!venue.metadata) return t`— no metadata —`;
                                    try {
                                      return JSON.stringify(JSON.parse(venue.metadata), null, 2);
                                    } catch {
                                      return venue.metadata;
                                    }
                                  })()}
                                </Box>
                              )}
                            </Collapse>
                          </Paper>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Tabs.Panel>

                {/* ── Photos tab ───────────────────────────── */}
                {venue && (
                  <Tabs.Panel value="photos" pt="sm">
                    <PhotosTab photos={photos} isLoading={photosLoading} />
                  </Tabs.Panel>
                )}

                {/* ── Assets tab ───────────────────────────── */}
                {venue && (
                  <Tabs.Panel value="assets" pt="sm">
                    <AssetsTab venueId={venueId} assets={assets} isLoading={assetsLoading} />
                  </Tabs.Panel>
                )}

                {/* ── Sources tab ──────────────────────────── */}
                {venue && (
                  <Tabs.Panel value="sources" pt="sm">
                    <SourcesTab sources={sources} isLoading={sourcesLoading} />
                  </Tabs.Panel>
                )}
              </Tabs>
            </Stack>
          </Grid.Col>
        </Grid>

        {canManage && (
          <>
            <EditVenueModal venue={venue ?? null} opened={editOpened} onClose={closeEdit} />
            <DeleteVenueModal
              venue={deletedVenue}
              opened={deleteOpened}
              onClose={closeDelete}
              onDeleted={handleDeleteSuccess}
            />
            <VenueAiEnrichModal
              opened={aiEnrichOpened}
              onClose={closeAiEnrich}
              enrichment={enrichment}
              currentMetadata={venue?.metadata ?? null}
            />
          </>
        )}
      </Container>
    </motion.div>
  );
}
