import { useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  SimpleGrid,
  Anchor,
  Loader,
  ThemeIcon,
  Divider,
  Modal,
  ScrollArea,
  Grid,
  TextInput,
  Select,
  SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconRefresh,
  IconBuildingStore,
  IconMapPin,
  IconExternalLink,
  IconCheck,
  IconAlertTriangle,
  IconTrash,
  IconPhoto,
  IconPaperclip,
  IconEye,
  IconUpload,
  IconFileText,
  IconFolder,
  IconSearch,
  IconMaximize,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import type { Venue, VenueAsset, VenueAssetPublic, VenueTextContent } from "@/entities/venue";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { catalogApi, venueAssetApi, uploadFileToPresignedUrl } from "@/shared/api";
import { useVenue } from "@/features/manage-venue";
import { dayjs } from "@/shared/lib/date-utils";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/venues_/$venueId/files")({
  component: VenueFilesPage,
});

// ─── Types ───────────────────────────────────────────────────────────────────

type FileTypeFilter = "all" | "photos" | "documents" | "sources";

interface AssetPreview {
  name: string;
  url: string | null;
  contentType: string | null;
  sizeBytes: number | null;
}

// ─── Preview tokens (mirrors venues.$venueId.tsx) ────────────────────────────

const PREVIEW_TOKENS = {
  border: "var(--mantine-color-gray-3)",
  borderSubtle: "var(--mantine-color-gray-2)",
  accentText: "var(--mantine-color-blue-8)",
  accentTile: "color-mix(in oklab, var(--mantine-color-blue-6) 12%, transparent)",
  canvas: "color-mix(in oklab, var(--mantine-color-gray-1) 55%, var(--app-surface-bg))",
  radius: 7,
  radiusL: 10,
} as const;

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

const PREVIEW_TEXT_SURFACE_STYLES = {
  ...PREVIEW_SURFACE_STYLES,
  alignItems: "stretch",
  justifyContent: "flex-start",
  padding: "var(--mantine-spacing-md)",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPreviewable(contentType: string | null): boolean {
  return (
    Boolean(contentType) && (contentType!.startsWith("image/") || contentType === "application/pdf")
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function contentTypeLabel(contentType: string | null): string {
  if (!contentType) return "File";
  return contentType.split("/").pop()?.toUpperCase() ?? "File";
}

/** Collapse whitespace so a text chunk renders as a single readable line. */
function sourceLabel(content: string): string {
  return content.trim().replace(/\s+/g, " ");
}

// ─── Venue brief sidebar ─────────────────────────────────────────────────────

function VenueBrief({ venue, isLoading }: { venue: Venue | undefined; isLoading: boolean }) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const hasPhoto = Boolean(venue?.primaryPhotoUrl);

  return (
    <Paper withBorder radius="md" shadow="sm" style={{ overflow: "hidden" }}>
      <Box style={{ position: "relative", height: 140 }}>
        {isLoading ? (
          <Skeleton height={140} radius={0} />
        ) : (
          <>
            <Box
              style={{
                height: "100%",
                background: hasPhoto
                  ? `url(${venue!.primaryPhotoUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, var(--mantine-color-gray-2) 0%, var(--mantine-color-gray-4) 100%)",
              }}
            />
            {!hasPhoto && (
              <Group
                justify="center"
                align="center"
                style={{ position: "absolute", inset: 0, opacity: 0.2 }}
              >
                <IconBuildingStore size={48} color="var(--mantine-color-gray-7)" />
              </Group>
            )}
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
              }}
            />
            <Box style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12 }}>
              <Text fw={800} size="lg" style={{ color: "#fff", lineHeight: 1.2 }} lineClamp={2}>
                {venue?.name ?? t`Venue`}
              </Text>
              {(venue?.address || venue?.city) && (
                <Group gap={4} wrap="nowrap" mt={2}>
                  <IconMapPin size={12} color="rgba(255,255,255,0.8)" />
                  <Text size="xs" style={{ color: "rgba(255,255,255,0.85)" }} lineClamp={1}>
                    {[venue?.address, venue?.city].filter(Boolean).join(", ")}
                  </Text>
                </Group>
              )}
            </Box>
          </>
        )}
      </Box>

      <Box p="sm">
        {venue?.description ? (
          <Text size="xs" c="dimmed" lineClamp={4} style={{ whiteSpace: "pre-line" }}>
            {venue.description}
          </Text>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            <Trans>No description available.</Trans>
          </Text>
        )}
      </Box>
    </Paper>
  );
}

// ─── File type navigation ────────────────────────────────────────────────────

const FILE_TYPE_OPTIONS: { value: FileTypeFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All files", icon: <IconFolder size={16} /> },
  { value: "photos", label: "Photos", icon: <IconPhoto size={16} /> },
  { value: "documents", label: "Documents", icon: <IconPaperclip size={16} /> },
  { value: "sources", label: "Sources", icon: <IconFileText size={16} /> },
];

function FileTypeNav({
  active,
  counts,
  onSelect,
}: {
  active: FileTypeFilter;
  counts: Record<FileTypeFilter, number>;
  onSelect: (value: FileTypeFilter) => void;
}) {
  return (
    <Paper withBorder radius="md" p="xs" shadow="sm">
      <Stack gap={2}>
        {FILE_TYPE_OPTIONS.map((opt) => {
          const isActive = active === opt.value;
          return (
            <Group
              key={opt.value}
              justify="space-between"
              wrap="nowrap"
              px={8}
              py={8}
              style={{
                borderRadius: "var(--mantine-radius-sm)",
                cursor: "pointer",
                background: isActive ? "var(--mantine-color-blue-light)" : "transparent",
                transition: "background 0.15s",
              }}
              onClick={() => onSelect(opt.value)}
            >
              <Group gap={8} wrap="nowrap">
                <ThemeIcon
                  size={24}
                  radius="sm"
                  variant={isActive ? "filled" : "light"}
                  color={isActive ? "blue" : "gray"}
                >
                  {opt.icon}
                </ThemeIcon>
                <Text size="sm" fw={isActive ? 600 : 400}>
                  {opt.label}
                </Text>
              </Group>
              <Badge
                size="xs"
                variant={isActive ? "filled" : "light"}
                color={isActive ? "blue" : "gray"}
                circle
              >
                {counts[opt.value]}
              </Badge>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
}

// ─── Stats cards ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Paper withBorder radius="md" p="md" shadow="sm">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.05em" }}>
            {label}
          </Text>
          <Text fw={800} size="xl">
            {value}
          </Text>
        </Stack>
        <ThemeIcon size={40} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

// ─── Photos section ──────────────────────────────────────────────────────────

function PhotosSection({
  photos,
  masterPhotos,
  isLoading,
  onPreview,
}: {
  photos: VenueAssetPublic[];
  masterPhotos: VenueAssetPublic[];
  isLoading: boolean;
  onPreview: (photo: VenueAssetPublic) => void;
}) {
  const { t } = useLingui();

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={140} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (photos.length === 0 && masterPhotos.length === 0) {
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
    <Stack gap="md">
      {photos.length > 0 && (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
          {photos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} index={i} onPreview={onPreview} />
          ))}
        </SimpleGrid>
      )}
      {masterPhotos.length > 0 && (
        <Stack gap="sm">
          <Group gap="xs">
            <Divider size="md" color="gray.5" style={{ flex: 1 }} />
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              <Trans>From master catalog</Trans>
            </Text>
            <Divider size="md" color="gray.5" style={{ flex: 1 }} />
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
            {masterPhotos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} onPreview={onPreview} />
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Stack>
  );
}

function PhotoCard({
  photo,
  index,
  onPreview,
}: {
  photo: VenueAssetPublic;
  index: number;
  onPreview: (photo: VenueAssetPublic) => void;
}) {
  const { t } = useLingui();
  return (
    <Paper withBorder radius="md" p="xs" shadow="sm" style={{ overflow: "hidden" }}>
      <Box style={{ position: "relative" }}>
        {photo.sourceUrl ? (
          <img
            src={photo.sourceUrl}
            alt={photo.label ?? photo.fileName ?? ""}
            style={{
              width: "100%",
              height: 140,
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
              height: 140,
              background: "var(--mantine-color-gray-1)",
              borderRadius: "var(--mantine-radius-sm)",
            }}
          >
            <IconPhoto size={24} color="var(--mantine-color-gray-4)" />
          </Group>
        )}
        {photo.sourceUrl && (
          <ActionIcon
            size="sm"
            variant="filled"
            color="dark"
            radius="sm"
            aria-label={t`Open larger preview`}
            onClick={() => onPreview(photo)}
            style={{ position: "absolute", top: 6, right: 6, opacity: 0.85 }}
          >
            <IconMaximize size={14} />
          </ActionIcon>
        )}
        <Badge
          variant="filled"
          color="dark"
          size="xs"
          radius="sm"
          style={{ position: "absolute", top: 6, left: 6, opacity: 0.75 }}
        >
          #{index + 1}
        </Badge>
      </Box>
      {photo.label && (
        <Text size="xs" c="dimmed" lineClamp={1} mt={6}>
          {photo.label}
        </Text>
      )}
    </Paper>
  );
}

// ─── Documents section ───────────────────────────────────────────────────────

function DocumentsSection({
  documents,
  isLoading,
  onPreview,
  onDelete,
  deletingId,
  isDeleting,
}: {
  documents: VenueAsset[];
  isLoading: boolean;
  onPreview: (asset: VenueAsset) => void;
  onDelete: (asset: VenueAsset) => void;
  deletingId: string | null;
  isDeleting: boolean;
}) {
  const { t } = useLingui();

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={110} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (documents.length === 0) {
    return (
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
      >
        <Stack align="center" gap="sm">
          <IconPaperclip size={40} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed">{t`No documents for this venue.`}</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
      {documents.map((asset) => {
        const name = asset.label ?? asset.fileName ?? asset.id;
        return (
          <Paper
            key={asset.id}
            withBorder
            radius="md"
            p="sm"
            shadow="sm"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <Group wrap="nowrap" justify="space-between" align="flex-start">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon
                  size={36}
                  radius="md"
                  variant="light"
                  color="blue"
                  style={{ flexShrink: 0 }}
                >
                  <IconPaperclip size={18} />
                </ThemeIcon>
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {name}
                  </Text>
                  <Group gap={6} wrap="nowrap">
                    <Badge variant="light" color="blue" size="xs" radius="sm">
                      {contentTypeLabel(asset.contentType)}
                    </Badge>
                    {asset.sizeBytes != null && (
                      <Text size="xs" c="dimmed">
                        {formatBytes(asset.sizeBytes)}
                      </Text>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Group>

            <Group gap={4} justify="flex-end" wrap="nowrap" style={{ marginTop: "auto" }}>
              {isPreviewable(asset.contentType) && (
                <Button
                  size="compact-sm"
                  variant="subtle"
                  leftSection={<IconEye size={14} />}
                  onClick={() => onPreview(asset)}
                >
                  <Trans>Preview</Trans>
                </Button>
              )}
              <Tooltip label={t`Delete document`} withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  aria-label={t`Delete document`}
                  loading={isDeleting && deletingId === asset.id}
                  onClick={() => onDelete(asset)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}

// ─── Sources section ─────────────────────────────────────────────────────────

const SOURCE_PREVIEW_CHARS = 240;

function SourcesSection({
  sources,
  isLoading,
  onPreview,
}: {
  sources: VenueTextContent[];
  isLoading: boolean;
  onPreview: (source: VenueTextContent) => void;
}) {
  const { t } = useLingui();

  if (isLoading) {
    return (
      <Stack gap="sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={100} radius="md" />
        ))}
      </Stack>
    );
  }

  if (sources.length === 0) {
    return (
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
      >
        <Stack align="center" gap="sm">
          <IconFileText size={40} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed">{t`No text sources for this venue.`}</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      {sources.map((source) => {
        const title = source.label ?? sourceLabel(source.content);
        const preview = source.content.slice(0, SOURCE_PREVIEW_CHARS);
        const hasMore = source.content.length > SOURCE_PREVIEW_CHARS;
        return (
          <Paper key={source.id} withBorder radius="md" p="sm" shadow="sm">
            <Group justify="space-between" wrap="nowrap" align="flex-start" mb={6}>
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon
                  size={32}
                  radius="sm"
                  variant="light"
                  color="violet"
                  style={{ flexShrink: 0 }}
                >
                  <IconFileText size={16} />
                </ThemeIcon>
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {title}
                  </Text>
                  <Group gap={6} wrap="nowrap">
                    <Text size="xs" c="dimmed">
                      {source.content.length} <Trans>characters</Trans>
                    </Text>
                    <Text size="xs" c="dimmed">
                      · {dayjs(source.createdAt).format("MMM D, YYYY HH:mm")}
                    </Text>
                  </Group>
                </Stack>
              </Group>
              <Button
                size="compact-sm"
                variant="subtle"
                leftSection={<IconEye size={14} />}
                onClick={() => onPreview(source)}
                style={{ flexShrink: 0 }}
              >
                <Trans>Read</Trans>
              </Button>
            </Group>
            <Text
              size="xs"
              c="dimmed"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {preview}
              {hasMore ? "…" : ""}
            </Text>
          </Paper>
        );
      })}
    </Stack>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A-Z" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

function VenueFilesPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { venueId } = Route.useParams();
  const { isTenantOwner } = useSession();
  const canManage = isTenantOwner;

  const [activeType, setActiveType] = useState<FileTypeFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const [assetPreview, setAssetPreview] = useState<AssetPreview | null>(null);
  const [photoPreview, setPhotoPreview] = useState<VenueAssetPublic | null>(null);
  const [sourcePreview, setSourcePreview] = useState<VenueTextContent | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: venue, isLoading, isError, refetch, isFetching } = useVenue(venueId);

  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "photos"],
    queryFn: () => catalogApi.listVenueAssetPhotos(venueId),
    enabled: Boolean(venue),
  });
  const photos = photosData?.items ?? [];

  const { data: masterPhotosData, isLoading: masterPhotosLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "master-photos"],
    queryFn: () => catalogApi.listVenueMasterPhotos(venueId),
    enabled: Boolean(venue?.masterVenueId),
  });
  const masterPhotos = masterPhotosData?.items ?? [];

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "assets"],
    queryFn: () => catalogApi.listVenueAssets(venueId),
    enabled: Boolean(venue),
  });
  const assets = assetsData?.items ?? [];
  const documents = useMemo(() => assets.filter((a) => a.assetType !== "PHOTO"), [assets]);

  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["tenant", "venue", venueId, "sources"],
    queryFn: () => catalogApi.listVenueTextContents(venueId),
    enabled: Boolean(venue),
  });
  const sources = sourcesData?.items ?? [];

  const counts: Record<FileTypeFilter, number> = {
    all: photos.length + masterPhotos.length + documents.length + sources.length,
    photos: photos.length + masterPhotos.length,
    documents: documents.length,
    sources: sources.length,
  };

  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => venueAssetApi.deleteAsset(venueId, assetId),
    onSuccess: () => {
      setDeleteConfirmId(null);
      setDeletingId(null);
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] });
      notifications.show({
        message: t`Document deleted.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    },
    onError: (err) => {
      notifications.show({
        message: err instanceof Error ? err.message : t`Could not delete the document.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    },
  });

  const openAssetPreview = async (asset: VenueAsset) => {
    const name = asset.label ?? asset.fileName ?? asset.id;
    setAssetPreview({
      name,
      url: null,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes,
    });
    try {
      const result = await venueAssetApi.previewUrl(venueId, asset.id);
      setAssetPreview((current) =>
        current ? { ...current, url: result.url, contentType: result.contentType } : current,
      );
    } catch {
      setAssetPreview(null);
      notifications.show({
        message: t`Could not load the preview.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const handleUploadAsset = async (file: File) => {
    setUploading(true);
    try {
      const init = await venueAssetApi.initiateUpload(venueId, {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      await uploadFileToPresignedUrl(init.presignedUploadUrl, file, () => {});
      const isDocument = !file.type.startsWith("image/");
      await venueAssetApi.confirmUpload(venueId, init.assetId, {
        objectKey: init.objectKey,
        fileName: file.name,
        assetType: isDocument ? "DOCUMENT" : "PHOTO",
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
      setUploading(false);
      if (assetFileInputRef.current) assetFileInputRef.current.value = "";
    }
  };

  // Search + sort filtering helpers
  const searchLower = search.trim().toLowerCase();

  const filterByName = <
    T extends { label?: string | null; fileName?: string | null; name?: string },
  >(
    items: T[],
    getName: (item: T) => string,
  ) => {
    if (!searchLower) return items;
    return items.filter((item) => getName(item).toLowerCase().includes(searchLower));
  };

  const sortAssets = <
    T extends { createdAt: string; label?: string | null; fileName?: string | null },
  >(
    items: T[],
    getName: (item: T) => string,
  ) => {
    const copy = [...items];
    if (sort === "newest") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else if (sort === "oldest")
      copy.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    else copy.sort((a, b) => getName(a).localeCompare(getName(b)));
    return copy;
  };

  const sortSources = (items: VenueTextContent[]) => {
    const copy = [...items];
    if (sort === "newest") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else if (sort === "oldest")
      copy.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    else
      copy.sort((a, b) =>
        (a.label ?? sourceLabel(a.content)).localeCompare(b.label ?? sourceLabel(b.content)),
      );
    return copy;
  };

  const visiblePhotos = sortAssets(
    filterByName(photos, (p) => p.label ?? p.fileName ?? p.id),
    (p) => p.label ?? p.fileName ?? p.id,
  );
  const visibleMasterPhotos = sortAssets(
    filterByName(masterPhotos, (p) => p.label ?? p.fileName ?? p.id),
    (p) => p.label ?? p.fileName ?? p.id,
  );
  const visibleDocuments = sortAssets(
    filterByName(documents, (a) => a.label ?? a.fileName ?? a.id),
    (a) => a.label ?? a.fileName ?? a.id,
  );
  const visibleSources = sortSources(
    filterByName(sources, (s) => s.label ?? sourceLabel(s.content)),
  );

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageTitle segments={[t`Venues`, t`Files`]} />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load the venue</Trans>}
          color="red"
          variant="light"
          mt="md"
        >
          <Trans>The venue could not be found or the API is unavailable.</Trans>
          <Group mt="sm">
            <Button variant="light" color="red" size="xs" onClick={() => void refetch()}>
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

  const sectionLoading = {
    photos: photosLoading || masterPhotosLoading,
    documents: assetsLoading,
    sources: sourcesLoading,
  };

  return (
    <Container size="100%" px="md" py={0} style={{ maxWidth: 1600 }}>
      <PageTitle
        segments={[
          t`Venues`,
          venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue`,
          t`Files`,
        ]}
      />
      <PageHeader
        title={venue ? [venue.name, venue.city].filter(Boolean).join(", ") : <Trans>Venue</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Venues</Trans>, to: "/venues" },
          { label: venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue` },
        ]}
        toolbar={
          <Group gap="xs" justify="space-between" wrap="nowrap" style={{ width: "100%" }}>
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <SegmentedControl
                size="sm"
                value="files"
                data-testid={TestSelectors.VENUE_VIEW_MODE_SWITCHER}
                onChange={(v) => {
                  if (v === "profile") {
                    void navigate({ to: "/venues/$venueId", params: { venueId } });
                  }
                }}
                data={[
                  {
                    value: "profile",
                    label: (
                      <Group gap={6} wrap="nowrap">
                        <IconBuildingStore size={14} />
                        <Trans>Venue Profile</Trans>
                      </Group>
                    ),
                  },
                  {
                    value: "files",
                    label: (
                      <Group gap={6} wrap="nowrap">
                        <IconFolder size={14} />
                        <Trans>File Manager</Trans>
                      </Group>
                    ),
                  },
                ]}
              />
              <Tooltip label={t`Refresh`} withArrow>
                <ActionIcon
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
              <TextInput
                placeholder={t`Search files…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                size="sm"
                style={{ maxWidth: 320, flex: 1 }}
                data-testid={TestSelectors.VENUE_FILES_SEARCH_INPUT}
              />
              <Select
                value={sort}
                onChange={(v) => setSort((v as SortOption) ?? "newest")}
                data={SORT_OPTIONS as unknown as { value: string; label: string }[]}
                size="sm"
                w={160}
                allowDeselect={false}
                comboboxProps={{ withinPortal: true }}
              />
            </Group>
            {canManage && (
              <Button
                variant="light"
                size="sm"
                leftSection={<IconUpload size={15} />}
                loading={uploading}
                onClick={() => assetFileInputRef.current?.click()}
                data-testid={TestSelectors.VENUE_FILES_UPLOAD_BUTTON}
              >
                <Trans>Upload file</Trans>
              </Button>
            )}
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
        }
      />

      <Grid gap="lg">
        {/* ── Left sidebar: venue brief + type nav ──────────────────── */}
        <Grid.Col span={{ base: 12, lg: 3 }}>
          <Stack gap="md" style={{ position: "sticky", top: 16 }}>
            <VenueBrief venue={venue} isLoading={isLoading} />
            <FileTypeNav active={activeType} counts={counts} onSelect={setActiveType} />
          </Stack>
        </Grid.Col>

        {/* ── Right column: stats + content ─────────────────────────── */}
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack gap="md">
            {/* Stats row */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
              <StatCard
                label={t`Total files`}
                value={counts.all}
                icon={<IconFolder size={20} />}
                color="gray"
              />
              <StatCard
                label={t`Photos`}
                value={counts.photos}
                icon={<IconPhoto size={20} />}
                color="blue"
              />
              <StatCard
                label={t`Documents`}
                value={counts.documents}
                icon={<IconPaperclip size={20} />}
                color="violet"
              />
              <StatCard
                label={t`Sources`}
                value={counts.sources}
                icon={<IconFileText size={20} />}
                color="green"
              />
            </SimpleGrid>

            {/* Content sections */}
            {(activeType === "all" || activeType === "photos") && (
              <FileSection
                title={t`Photos`}
                icon={<IconPhoto size={16} />}
                count={visiblePhotos.length + visibleMasterPhotos.length}
                color="blue"
              >
                <PhotosSection
                  photos={visiblePhotos}
                  masterPhotos={visibleMasterPhotos}
                  isLoading={sectionLoading.photos}
                  onPreview={setPhotoPreview}
                />
              </FileSection>
            )}

            {(activeType === "all" || activeType === "documents") && (
              <FileSection
                title={t`Documents`}
                icon={<IconPaperclip size={16} />}
                count={visibleDocuments.length}
                color="violet"
              >
                <DocumentsSection
                  documents={visibleDocuments}
                  isLoading={sectionLoading.documents}
                  onPreview={openAssetPreview}
                  onDelete={(asset) => setDeleteConfirmId(asset.id)}
                  deletingId={deleteConfirmId}
                  isDeleting={deleteMutation.isPending}
                />
              </FileSection>
            )}

            {(activeType === "all" || activeType === "sources") && (
              <FileSection
                title={t`Sources`}
                icon={<IconFileText size={16} />}
                count={visibleSources.length}
                color="green"
              >
                <SourcesSection
                  sources={visibleSources}
                  isLoading={sectionLoading.sources}
                  onPreview={setSourcePreview}
                />
              </FileSection>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Photo preview modal */}
      <Modal
        opened={photoPreview !== null}
        onClose={() => setPhotoPreview(null)}
        size="xl"
        centered
        styles={PREVIEW_MODAL_STYLES}
        title={
          photoPreview && (
            <Text fw={700} size="sm" lineClamp={1}>
              {photoPreview.label ?? photoPreview.fileName ?? t`Photo`}
            </Text>
          )
        }
      >
        {photoPreview?.sourceUrl && (
          <Box p="md" style={{ background: PREVIEW_TOKENS.canvas }}>
            <Box style={PREVIEW_SURFACE_STYLES}>
              <img
                src={photoPreview.sourceUrl}
                alt={photoPreview.label ?? photoPreview.fileName ?? ""}
                style={{ maxWidth: "100%", maxHeight: "72vh", display: "block" }}
              />
            </Box>
          </Box>
        )}
      </Modal>

      {/* Asset (document) preview modal */}
      <Modal
        opened={assetPreview !== null}
        onClose={() => setAssetPreview(null)}
        size="xl"
        centered
        styles={PREVIEW_MODAL_STYLES}
        title={
          assetPreview && (
            <Stack gap={0}>
              <Text fw={700} size="sm" lineClamp={1}>
                {assetPreview.name}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {assetPreview.contentType ?? t`File`}
              </Text>
            </Stack>
          )
        }
      >
        {assetPreview && (
          <Box>
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
                  {contentTypeLabel(assetPreview.contentType)}
                </Badge>
                {assetPreview.sizeBytes != null && (
                  <Text size="xs" c="dimmed">
                    {formatBytes(assetPreview.sizeBytes)}
                  </Text>
                )}
              </Group>
              {assetPreview.url && (
                <Anchor
                  href={assetPreview.url}
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
            <Box p="md" style={{ background: PREVIEW_TOKENS.canvas }}>
              <Box style={PREVIEW_SURFACE_STYLES}>
                {!assetPreview.url ? (
                  <Stack align="center" gap="sm" py="xl">
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        borderRadius: PREVIEW_TOKENS.radius,
                        background: PREVIEW_TOKENS.accentTile,
                        color: PREVIEW_TOKENS.accentText,
                      }}
                    >
                      <IconPhoto size={26} />
                    </Box>
                    <Loader size="sm" />
                    <Text size="xs" c="dimmed">
                      <Trans>Preparing the preview…</Trans>
                    </Text>
                  </Stack>
                ) : assetPreview.contentType === "application/pdf" ? (
                  <iframe
                    src={assetPreview.url}
                    title={assetPreview.name}
                    style={{ width: "100%", height: "72vh", border: 0, display: "block" }}
                  />
                ) : (
                  <img
                    src={assetPreview.url}
                    alt={assetPreview.name}
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

      {/* Source text preview modal */}
      <Modal
        opened={sourcePreview !== null}
        onClose={() => setSourcePreview(null)}
        size="xl"
        centered
        styles={PREVIEW_MODAL_STYLES}
        title={
          sourcePreview && (
            <Stack gap={0}>
              <Text fw={700} size="sm" lineClamp={1}>
                {sourcePreview.label ?? sourceLabel(sourcePreview.content)}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {dayjs(sourcePreview.createdAt).format("MMM D, YYYY HH:mm")}
              </Text>
            </Stack>
          )
        }
      >
        {sourcePreview && (
          <Box>
            <Group
              gap="sm"
              px="md"
              py={8}
              wrap="nowrap"
              justify="space-between"
              style={{ borderBottom: `1px solid ${PREVIEW_TOKENS.borderSubtle}` }}
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <Badge variant="light" color="green" radius="sm" size="sm">
                  <Trans>Text</Trans>
                </Badge>
                <Text size="xs" c="dimmed">
                  {sourcePreview.content.length} <Trans>characters</Trans>
                </Text>
              </Group>
            </Group>
            <Box p="md" style={{ background: PREVIEW_TOKENS.canvas }}>
              <Box style={PREVIEW_TEXT_SURFACE_STYLES}>
                <ScrollArea.Autosize mah="72vh" style={{ width: "100%" }}>
                  <Text
                    size="sm"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}
                  >
                    {sourcePreview.content}
                  </Text>
                </ScrollArea.Autosize>
              </Box>
            </Box>
          </Box>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        opened={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        size="sm"
        centered
        withCloseButton={false}
      >
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" size="lg">
              <IconTrash size={20} />
            </ThemeIcon>
            <Text fw={700}>
              <Trans>Delete this document?</Trans>
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            <Trans>This action cannot be undone.</Trans>
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={() => setDeleteConfirmId(null)}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (deleteConfirmId) {
                  setDeletingId(deleteConfirmId);
                  deleteMutation.mutate(deleteConfirmId);
                }
              }}
            >
              <Trans>Delete</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

// ─── File section wrapper ────────────────────────────────────────────────────

function FileSection({
  title,
  icon,
  count,
  color,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Paper withBorder radius="md" p="md" shadow="sm">
      <Group justify="space-between" mb="sm">
        <Group gap={8}>
          <ThemeIcon size={26} radius="sm" variant="light" color={color}>
            {icon}
          </ThemeIcon>
          <Text fw={700} size="md">
            {title}
          </Text>
          <Badge variant="light" color={color} size="sm" circle>
            {count}
          </Badge>
        </Group>
      </Group>
      <Divider mb="sm" />
      {children}
    </Paper>
  );
}
