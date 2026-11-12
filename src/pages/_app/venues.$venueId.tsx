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
  Tooltip,
  Tabs,
  SimpleGrid,
  Anchor,
  Loader,
  ThemeIcon,
  Divider,
  CopyButton,
  Collapse,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconBuildingStore,
  IconMapPin,
  IconExternalLink,
  IconAdjustments,
  IconLink,
  IconCheck,
  IconAlertTriangle,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconDatabase,
  IconPaperclip,
  IconEye,
  IconUpload,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import type { Venue, VenueAsset, VenueAssetPublic } from "@/entities/venue";
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
  VenueMetadataSections,
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
  // `url === null` while the presigned URL is still being minted.
  const [preview, setPreview] = useState<{
    name: string;
    url: string | null;
    contentType: string | null;
    sizeBytes: number | null;
  } | null>(null);

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
                  {isPreviewable(asset.contentType) && (
                    <Button
                      size="compact-sm"
                      variant="subtle"
                      leftSection={<IconEye size={14} />}
                      style={{ flexShrink: 0 }}
                      onClick={() => void openPreview(asset, name)}
                    >
                      <Trans>Preview</Trans>
                    </Button>
                  )}
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

// ─── Tab label styles — mirrors bigTabStyles in admin ────────────────────────

const bigTabStyles = {
  tab: {
    fontSize: "var(--mantine-font-size-lg)",
    fontWeight: 600,
    padding: "var(--mantine-spacing-md) var(--mantine-spacing-xl)",
  },
};

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

  const queryClient = useQueryClient();
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  const { data: venue, isLoading, isError, refetch, isFetching } = useVenue(venueId);

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
      <Container size="xl" py={0}>
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
                    <Trans>Edit</Trans>
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

        <Stack gap="md">
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <Box
            style={{
              position: "relative",
              borderRadius: "var(--mantine-radius-lg)",
              overflow: "hidden",
            }}
            data-testid={TestSelectors.VENUE_DETAIL_HERO}
          >
            <Box
              style={{
                height: 300,
                background: hasPhoto
                  ? `url(${venue!.primaryPhotoUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, var(--mantine-color-gray-2) 0%, var(--mantine-color-gray-4) 100%)",
                position: "relative",
              }}
            >
              {isLoading && <Skeleton height={300} radius={0} />}

              {!isLoading && !hasPhoto && (
                <Group justify="center" align="center" style={{ height: "100%", opacity: 0.2 }}>
                  <IconBuildingStore size={96} color="var(--mantine-color-gray-7)" />
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
                    padding:
                      "var(--mantine-spacing-xl) var(--mantine-spacing-xl) var(--mantine-spacing-lg)",
                  }}
                >
                  <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
                    <Stack gap={6}>
                      {venue?.masterVenueId && (
                        <Badge
                          variant="filled"
                          color="indigo"
                          size="sm"
                          tt="none"
                          style={{
                            background: hasPhoto ? "rgba(255,255,255,0.2)" : undefined,
                            backdropFilter: "blur(4px)",
                            width: "fit-content",
                          }}
                        >
                          <Group gap={4} wrap="nowrap">
                            <IconLink size={11} />
                            <Trans>Master linked</Trans>
                          </Group>
                        </Badge>
                      )}
                      <Text
                        fw={800}
                        style={{
                          color: hasPhoto ? "#ffffff" : "var(--mantine-color-dark-9)",
                          lineHeight: 1.15,
                          letterSpacing: "-0.02em",
                          textShadow: hasPhoto ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                          fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        }}
                        data-testid={TestSelectors.VENUE_DETAIL_NAME}
                      >
                        {venue?.name}
                      </Text>

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
                  </Group>
                </Box>
              )}
            </Box>

            {/* soft gradient rim */}
            <Box
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "var(--mantine-radius-lg)",
                padding: 1,
                background: ACCENT_GRADIENT,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                opacity: 0.75,
                pointerEvents: "none",
              }}
            />
          </Box>

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
              {canManage && venue && (
                <Tabs.Tab
                  value="metadata"
                  leftSection={<IconDatabase size={20} />}
                  styles={bigTabStyles}
                >
                  <Trans>Metadata</Trans>
                </Tabs.Tab>
              )}
            </Tabs.List>

            {/* ── Details tab ──────────────────────────────────────────────── */}
            <Tabs.Panel value="details">
              <Stack gap="xs" pt="sm">
                <Divider
                  label={
                    <Text
                      size="xs"
                      fw={700}
                      tt="uppercase"
                      c="dimmed"
                      style={{ letterSpacing: "0.07em" }}
                    >
                      <Trans>Location</Trans>
                    </Text>
                  }
                  labelPosition="left"
                  my="sm"
                />

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

                <Divider
                  label={
                    <Text
                      size="xs"
                      fw={700}
                      tt="uppercase"
                      c="dimmed"
                      style={{ letterSpacing: "0.07em" }}
                    >
                      <Trans>Relations</Trans>
                    </Text>
                  }
                  labelPosition="left"
                  my="sm"
                />

                <InfoSectionCard
                  title={<Trans>Master catalog link</Trans>}
                  icon={<IconLink size={14} />}
                  filled={venue?.masterVenueId ? 1 : 0}
                  total={1}
                  isLoading={isLoading}
                >
                  {venue?.masterVenueId ? (
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
                        <Trans>Master venue</Trans>:
                      </Text>
                      <Badge variant="light" color="indigo" size="sm" ff="monospace" tt="none">
                        {venue.masterVenueId}
                      </Badge>
                      <CopyButton value={venue.masterVenueId} timeout={2000}>
                        {({ copied, copy }) => (
                          <ActionIcon
                            color={copied ? "teal" : "gray"}
                            variant="subtle"
                            size="sm"
                            onClick={copy}
                            aria-label={t`Copy master venue id`}
                          >
                            {copied ? <IconCheck size={13} /> : <IconLink size={13} />}
                          </ActionIcon>
                        )}
                      </CopyButton>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      <Trans>Not linked to a master catalog record.</Trans>
                    </Text>
                  )}
                </InfoSectionCard>

                <Divider
                  label={
                    <Text
                      size="xs"
                      fw={700}
                      tt="uppercase"
                      c="dimmed"
                      style={{ letterSpacing: "0.07em" }}
                    >
                      <Trans>Record</Trans>
                    </Text>
                  }
                  labelPosition="left"
                  my="sm"
                />

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

            {/* ── Metadata tab (TENANT_OWNER / ADMIN only) ─────────────────── */}
            {canManage && venue && (
              <Tabs.Panel value="metadata" pt="sm">
                <Stack gap="md">
                  <VenueMetadataSections
                    venueId={venueId}
                    metadata={venue.metadata ?? null}
                    isLoading={isLoading}
                  />

                  {/* Raw JSON fallback — read-only, collapsible */}
                  <Paper withBorder radius="md" p="lg" shadow="sm" styles={SECTION_CARD_STYLES}>
                    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
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
              </Tabs.Panel>
            )}
          </Tabs>
        </Stack>

        {canManage && (
          <>
            <EditVenueModal venue={venue ?? null} opened={editOpened} onClose={closeEdit} />
            <DeleteVenueModal
              venue={deletedVenue}
              opened={deleteOpened}
              onClose={closeDelete}
              onDeleted={handleDeleteSuccess}
            />
          </>
        )}
      </Container>
    </motion.div>
  );
}
