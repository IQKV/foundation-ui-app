import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
  TextInput,
  ActionIcon,
  Tooltip,
  Box,
  Paper,
  Skeleton,
  Alert,
  Anchor,
  Badge,
  Select,
  CloseButton,
  SimpleGrid,
  Card,
  Pagination,
  SegmentedControl,
  Center,
  ThemeIcon,
  Divider,
  Menu,
  Checkbox,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import {
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconBuildingStore,
  IconLayoutList,
  IconLayoutGrid,
  IconMapPin,
  IconExternalLink,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconX,
  IconSparkles,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import type { Venue } from "@/entities/venue";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { dayjs } from "@/shared/lib/date-utils";
import { catalogApi } from "@/shared/api";
import type { SemanticSearchFilters } from "@/shared/api";
import { EditVenueModal, DeleteVenueModal, BulkDeleteVenuesModal } from "@/features/manage-venue";
import {
  VenueSemanticSearchWidget,
  SemanticSearchFiltersSummary,
} from "@/features/venue-semantic-search";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/venues/")({
  component: VenuesPage,
});

const PAGE_SIZE = 20;

/** Blue→cyan accent shared by the card, row and sidebar borders. */
const ACCENT_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-blue-4) 0%, var(--mantine-color-cyan-4) 100%)";

/**
 * Narrows the list-vs-semantic union: only the semantic-search response carries the
 * AI-derived filters, so the presence of the property is the discriminator.
 */
function hasAppliedFilters(value: unknown): value is { appliedFilters: SemanticSearchFilters } {
  return typeof value === "object" && value !== null && "appliedFilters" in value;
}

// ── Venue thumbnail ───────────────────────────────────────────────────────────

function VenueThumbnail({
  url,
  name,
  height = 148,
}: {
  url: string | null;
  name: string;
  height?: number;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: "100%", height, objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <Group
      justify="center"
      align="center"
      style={{ height, background: "var(--mantine-color-gray-1)" }}
    >
      <ThemeIcon size={40} radius="xl" variant="light" color="gray">
        <IconBuildingStore size={22} />
      </ThemeIcon>
    </Group>
  );
}

// ── Grid card ─────────────────────────────────────────────────────────────────

interface VenueCardProps {
  venue: Venue;
  selected: boolean;
  canManage: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function VenueCard({
  venue,
  selected,
  canManage,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
}: VenueCardProps) {
  const { t } = useLingui();
  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      data-selected={selected || undefined}
      onClick={onView}
      style={{ position: "relative", cursor: "pointer" }}
      styles={{
        root: {
          overflow: "hidden",
          transition: "box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            padding: 1,
            background: ACCENT_GRADIENT,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0,
            transition: "opacity 180ms ease",
            pointerEvents: "none",
          },
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 16px 32px -16px rgba(34,139,230,0.55)",
          },
          "&:hover::after": { opacity: 1 },
          "&[data-selected]": {
            borderColor: "var(--mantine-color-blue-5)",
            boxShadow: "0 0 0 2px rgba(34,139,230,0.3)",
          },
          "&[data-selected]::after": { opacity: 1 },
        },
      }}
    >
      <Card.Section style={{ cursor: "pointer" }}>
        <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} height={148} />
      </Card.Section>

      {/* selection + master-linked badge overlay */}
      {canManage && (
        <Box
          style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Group gap={6} wrap="nowrap">
            <Checkbox
              size="xs"
              checked={selected}
              onChange={onToggleSelect}
              aria-label={t`Select venue`}
              data-testid={TestSelectors.VENUE_SELECT_CHECKBOX(venue.id)}
            />
            {venue.masterVenueId && (
              <Badge variant="light" color="indigo" size="xs" tt="none">
                <Trans>Master linked</Trans>
              </Badge>
            )}
          </Group>
        </Box>
      )}

      {/* dots menu */}
      {canManage && (
        <Box
          style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="white"
                size="sm"
                radius="sm"
                style={{ boxShadow: "var(--mantine-shadow-xs)" }}
              >
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={13} />}
                data-testid={TestSelectors.VENUE_VIEW_BUTTON(venue.id)}
                onClick={onView}
              >
                {t`View record`}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={13} />}
                data-testid={TestSelectors.VENUE_EDIT_BUTTON(venue.id)}
                onClick={onEdit}
              >
                {t`Edit record`}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={13} />}
                data-testid={TestSelectors.VENUE_DELETE_BUTTON(venue.id)}
                onClick={onDelete}
              >
                {t`Delete`}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      )}

      <Stack gap={6} mt="xs">
        <Text
          fw={600}
          size="sm"
          lineClamp={2}
          lh={1.3}
          styles={{
            root: { cursor: "pointer", "&:hover": { color: "var(--mantine-color-blue-6)" } },
          }}
        >
          {venue.name}
        </Text>
        {(venue.city ?? venue.address) && (
          <Group gap={4} wrap="nowrap">
            <IconMapPin size={12} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {venue.city
                ? `${venue.city}${venue.address ? ` · ${venue.address}` : ""}`
                : venue.address}
            </Text>
          </Group>
        )}
        {!canManage && venue.masterVenueId && (
          <Badge variant="outline" color="indigo" size="xs" tt="none">
            <Trans>Master linked</Trans>
          </Badge>
        )}
        <Text size="xs" c="dimmed" style={{ marginLeft: "auto" }}>
          {dayjs(venue.updatedAt).format("MMM D, YYYY")}
        </Text>
      </Stack>
    </Card>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────

function VenueRow({
  venue,
  selected,
  canManage,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
}: VenueCardProps) {
  const { t } = useLingui();
  const hasCoordinates = venue.locationLat != null && venue.locationLng != null;
  const coordinates = hasCoordinates ? `${venue.locationLat}, ${venue.locationLng}` : null;
  const mapUrl = hasCoordinates
    ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
    : null;
  const locationLine = [venue.address, venue.city].filter(Boolean).join(", ");

  return (
    <Card
      padding={0}
      radius="md"
      withBorder
      data-selected={selected || undefined}
      onClick={onView}
      style={{ display: "flex", flexDirection: "row", cursor: "pointer" }}
      styles={{
        root: {
          overflow: "hidden",
          position: "relative",
          transition: "box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 4,
            background: ACCENT_GRADIENT,
            opacity: 0.55,
            transition: "opacity 180ms ease",
            pointerEvents: "none",
          },
          "&:hover": {
            transform: "translateX(2px)",
            borderColor: "var(--mantine-color-blue-3)",
            boxShadow: "0 12px 28px -18px rgba(34,139,230,0.6)",
          },
          "&:hover::before": { opacity: 1 },
          "&[data-selected]": {
            borderColor: "var(--mantine-color-blue-5)",
            boxShadow: "0 0 0 2px rgba(34,139,230,0.3)",
          },
          "&[data-selected]::before": { opacity: 1 },
        },
      }}
    >
      <Box style={{ flexShrink: 0, width: 140, overflow: "hidden" }}>
        <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} height={110} />
      </Box>

      <Group
        gap="md"
        align="center"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "var(--mantine-spacing-md) var(--mantine-spacing-lg)",
        }}
      >
        <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text
              fw={700}
              size="md"
              lineClamp={1}
              styles={{
                root: { cursor: "pointer", "&:hover": { color: "var(--mantine-color-blue-6)" } },
              }}
            >
              {venue.name}
            </Text>
            {venue.masterVenueId && (
              <Badge variant="outline" color="indigo" size="xs" tt="none" style={{ flexShrink: 0 }}>
                <Trans>Master linked</Trans>
              </Badge>
            )}
          </Group>

          <Group gap={4} wrap="nowrap">
            <IconMapPin size={13} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
            {locationLine ? (
              <Text size="sm" lineClamp={1}>
                {locationLine}
              </Text>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">
                <Trans>No address on record</Trans>
              </Text>
            )}
          </Group>

          <Group gap={8} wrap="wrap">
            <Group gap={4} wrap="nowrap">
              <Text size="xs" c="dimmed">
                <Trans>Coordinates</Trans>:
              </Text>
              {coordinates ? (
                <>
                  <Text size="xs" ff="monospace">
                    {coordinates}
                  </Text>
                  {mapUrl && (
                    <Anchor
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={3} wrap="nowrap">
                        <IconExternalLink size={11} />
                        <Trans>Maps</Trans>
                      </Group>
                    </Anchor>
                  )}
                </>
              ) : (
                <Text size="xs" c="dimmed" fs="italic">
                  —
                </Text>
              )}
            </Group>
            <Text size="xs" c="dimmed" ff="monospace" lineClamp={1} style={{ minWidth: 0 }}>
              {venue.id}
            </Text>
          </Group>
        </Stack>

        <Divider orientation="vertical" />

        <Stack gap={8} style={{ flexShrink: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text size="xs" c="dimmed" w={56}>
              <Trans>Updated</Trans>
            </Text>
            <Text size="sm" fw={500}>
              {dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm")}
            </Text>
          </Group>
          <Group gap={8} wrap="nowrap">
            <Text size="xs" c="dimmed" w={56}>
              <Trans>Created</Trans>
            </Text>
            <Text size="sm" fw={500}>
              {dayjs(venue.createdAt).format("MMM D, YYYY HH:mm")}
            </Text>
          </Group>
        </Stack>
      </Group>

      {canManage && (
        <Stack
          justify="flex-start"
          align="center"
          py="sm"
          px="xs"
          style={{
            flexShrink: 0,
            borderLeft: "1px solid var(--mantine-color-default-border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            size="sm"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={t`Select venue`}
            data-testid={TestSelectors.VENUE_SELECT_CHECKBOX(venue.id)}
          />
          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="md" color="gray">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={13} />}
                data-testid={TestSelectors.VENUE_VIEW_BUTTON(venue.id)}
                onClick={onView}
              >
                {t`View record`}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={13} />}
                data-testid={TestSelectors.VENUE_EDIT_BUTTON(venue.id)}
                onClick={onEdit}
              >
                {t`Edit record`}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={13} />}
                data-testid={TestSelectors.VENUE_DELETE_BUTTON(venue.id)}
                onClick={onDelete}
              >
                {t`Delete`}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Stack>
      )}
    </Card>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card padding="sm" radius="md" withBorder>
      <Card.Section>
        <Skeleton height={148} />
      </Card.Section>
      <Stack gap={6} mt="xs">
        <Skeleton height={14} width="80%" />
        <Skeleton height={12} width="40%" />
        <Skeleton height={12} width="60%" />
      </Stack>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <Card
      padding={0}
      radius="md"
      withBorder
      style={{ display: "flex", flexDirection: "row", overflow: "hidden" }}
    >
      <Skeleton height={110} width={140} radius={0} style={{ flexShrink: 0 }} />
      <Group
        gap="md"
        align="center"
        style={{ flex: 1, padding: "var(--mantine-spacing-md) var(--mantine-spacing-lg)" }}
      >
        <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
          <Skeleton height={18} width="55%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={13} width="70%" />
        </Stack>
        <Stack gap={8} style={{ flexShrink: 0, width: 200 }}>
          <Skeleton height={16} width={150} />
          <Skeleton height={16} width={150} />
        </Stack>
      </Group>
    </Card>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  search: string;
  cityFilter: string | null;
  cityOptions: { value: string; label: string }[];
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onCityChange: (v: string | null) => void;
  onReset: () => void;
}

function FilterSidebar({
  search,
  cityFilter,
  cityOptions,
  hasActiveFilters,
  onSearchChange,
  onCityChange,
  onReset,
}: FilterSidebarProps) {
  const { t } = useLingui();
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        width: 220,
        flexShrink: 0,
        position: "sticky",
        top: 16,
        alignSelf: "flex-start",
      }}
      styles={{
        root: {
          overflow: "hidden",
          transition: "border-color 180ms ease, box-shadow 180ms ease",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: ACCENT_GRADIENT,
            pointerEvents: "none",
          },
          "&:focus-within": {
            borderColor: "var(--mantine-color-blue-4)",
            boxShadow: "0 10px 26px -20px rgba(34,139,230,0.65)",
          },
        },
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" mb={2}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.06em" }}>
            <Trans>Filters</Trans>
          </Text>
          {hasActiveFilters && (
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              data-testid={TestSelectors.VENUES_CLEAR_FILTERS_BUTTON}
              onClick={onReset}
            >
              <IconX size={11} />
            </ActionIcon>
          )}
        </Group>

        <TextInput
          placeholder={t`Name or city…`}
          leftSection={<IconSearch size={13} />}
          value={search}
          data-testid={TestSelectors.VENUES_SEARCH_INPUT}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="xs"
          rightSection={
            search ? (
              <CloseButton
                size="xs"
                data-testid={TestSelectors.VENUES_SEARCH_CLEAR_BUTTON}
                onClick={() => onSearchChange("")}
              />
            ) : null
          }
        />

        <Divider />

        <Stack gap={4}>
          <Text size="xs" fw={600} c="dimmed">
            <Trans>City</Trans>
          </Text>
          <Select
            data-testid={TestSelectors.VENUES_CITY_FILTER_SELECT}
            placeholder={t`All cities`}
            data={cityOptions}
            value={cityFilter}
            onChange={onCityChange}
            searchable
            clearable
            size="xs"
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";

function VenuesPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { payload, isTenantOwner, tenantKey } = useSession();
  const canManage = isTenantOwner;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [semanticQuery, setSemanticQuery] = useState("");

  const isSemanticSearchActive = semanticQuery.trim().length > 0;

  const hasActiveFilters = debouncedSearch !== "" || cityFilter !== null;
  // Covers semantic search too, so a zero-result AI query shows "no match" copy
  // rather than the "add your first venue" onboarding state.
  const isSearching = hasActiveFilters || isSemanticSearchActive;

  const [storedViewMode, setStoredViewMode] = useLocalStorage<ViewMode>({
    key: "iqkv_venues_view_mode",
    defaultValue: "grid",
    getInitialValueInEffect: false,
  });
  const viewMode: ViewMode = storedViewMode === "list" ? "list" : "grid";

  // ── Sort order ──────────────────────────────────────────────────────────────
  type SortOrder = "recent" | "name_asc" | "name_desc";
  const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
    { value: "recent", label: t`Recently Added` },
    { value: "name_asc", label: t`Name A → Z` },
    { value: "name_desc", label: t`Name Z → A` },
  ];
  const [storedSortOrder, setStoredSortOrder] = useLocalStorage<SortOrder>({
    key: "iqkv_venues_sort_order",
    defaultValue: "recent",
    getInitialValueInEffect: false,
  });
  const sortOrder: SortOrder =
    storedSortOrder === "name_asc" || storedSortOrder === "name_desc" ? storedSortOrder : "recent";
  const sortParams =
    sortOrder === "name_asc"
      ? { sortBy: "name" as const, sortDir: "asc" as const }
      : sortOrder === "name_desc"
        ? { sortBy: "name" as const, sortDir: "desc" as const }
        : {};

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [bulkDeleteOpened, { open: openBulkDelete, close: closeBulkDelete }] = useDisclosure(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["tenant", "venues", page, debouncedSearch, cityFilter, semanticQuery, sortOrder],
    queryFn: () => {
      if (isSemanticSearchActive) {
        return catalogApi.semanticSearch({
          q: semanticQuery,
          city: cityFilter || undefined,
          limit: PAGE_SIZE,
        });
      }
      return catalogApi.listVenues({
        search: debouncedSearch || undefined,
        city: cityFilter || undefined,
        limit: PAGE_SIZE,
        offset,
        ...sortParams,
      });
    },
  });

  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  // Only the semantic-search response carries the AI-derived filters; the plain list response
  // does not, so narrow on the property rather than asserting the type.
  const appliedFilters =
    isSemanticSearchActive && hasAppliedFilters(data) ? data.appliedFilters : null;
  const totalPages = isSemanticSearchActive ? 1 : Math.ceil(totalElements / PAGE_SIZE);
  const rangeStart = totalElements === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, totalElements);

  // Bulk selection is scoped to the current page: it covers only the rows
  // already loaded, and is reset whenever the page or the filters change.
  const selectedCount = selectedIds.size;
  const allOnPageSelected = items.length > 0 && items.every((v) => selectedIds.has(v.id));
  const someOnPageSelected = items.some((v) => selectedIds.has(v.id));

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, debouncedSearch, cityFilter, semanticQuery]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = items.length > 0 && items.every((v) => prev.has(v.id));
      return allSelected ? new Set() : new Set(items.map((v) => v.id));
    });
  };

  // shortcut: city options come from the loaded page only (no city-list endpoint); upgrade when one exists.
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    items.forEach((v) => {
      if (v.city) cities.add(v.city);
    });
    if (cityFilter) cities.add(cityFilter);
    return [...cities].sort().map((c) => ({ value: c, label: c }));
  }, [items, cityFilter]);

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    openEdit();
  };
  const handleDelete = (venue: Venue) => {
    setSelectedVenue(venue);
    openDelete();
  };
  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setSelectedVenue(null), 300);
  };
  const handleCloseDelete = () => {
    closeDelete();
    setTimeout(() => setSelectedVenue(null), 300);
  };
  const handleBulkDeleted = () => {
    setSelectedIds(new Set());
  };
  const handleReset = () => {
    setSearch("");
    setCityFilter(null);
    setSemanticQuery("");
    setPage(1);
  };

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Venues`]} />
      <PageHeader
        title={<Trans>Venues</Trans>}
        breadcrumbs={[{ label: <Trans>Home</Trans>, to: "/" }, { label: <Trans>Venues</Trans> }]}
        toolbar={
          canManage ? (
            <Button
              leftSection={<IconPlus size={14} />}
              size="sm"
              data-testid={TestSelectors.VENUES_NEW_BUTTON}
              onClick={() => void navigate({ to: "/venues/add" })}
            >
              <Trans>New venue</Trans>
            </Button>
          ) : undefined
        }
      />

      {tenantKey && (
        <Group gap="xs" mb="md">
          <Text size="xs" c="dimmed">
            <Trans>Workspace:</Trans>
          </Text>
          <Badge variant="outline" color="indigo" size="sm" ff="monospace" radius="sm">
            {tenantKey}
          </Badge>
        </Group>
      )}

      {isError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load venues</Trans>}
          color="red"
          variant="light"
          mb="md"
        >
          <Trans>Could not fetch venues from the API.</Trans>{" "}
          <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
            <Trans>Retry</Trans>
          </Button>
        </Alert>
      )}

      <VenueSemanticSearchWidget
        onSearch={setSemanticQuery}
        onClear={() => setSemanticQuery("")}
        isSearching={isFetching && isSemanticSearchActive}
      />

      {isSemanticSearchActive && (
        <SemanticSearchFiltersSummary
          filters={appliedFilters}
          onClear={() => setSemanticQuery("")}
        />
      )}

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <FilterSidebar
          search={search}
          cityFilter={cityFilter}
          cityOptions={cityOptions}
          hasActiveFilters={isSearching}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onCityChange={(v) => {
            setCityFilter(v);
            setPage(1);
          }}
          onReset={handleReset}
        />

        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          {/* toolbar */}
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="nowrap">
              {canManage && !isLoading && items.length > 0 && (
                <Checkbox
                  size="xs"
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected && !allOnPageSelected}
                  onChange={handleToggleSelectAll}
                  aria-label={t`Select all venues on this page`}
                  data-testid={TestSelectors.VENUES_SELECT_ALL_CHECKBOX}
                />
              )}
              <Text fw={600} size="sm">
                <Trans>Venues</Trans>
              </Text>
              {!isLoading && (
                <Badge
                  variant="light"
                  color="gray"
                  size="sm"
                  radius="sm"
                  data-testid={TestSelectors.VENUES_TOTAL_COUNT}
                >
                  {totalElements}
                </Badge>
              )}
              {!isLoading && isSemanticSearchActive && (
                <Badge
                  variant="light"
                  color="blue"
                  size="xs"
                  leftSection={<IconSparkles size={10} />}
                >
                  <Trans>AI Ranked</Trans>
                </Badge>
              )}
            </Group>

            {totalPages > 1 && items.length > 10 && (
              <Group gap={4} align="center" style={{ flex: 1, justifyContent: "center" }}>
                {!isLoading && totalElements > 0 && (
                  <Text size="xs" c="dimmed" lh={1}>
                    <Trans>
                      Showing {rangeStart}–{rangeEnd} of {totalElements}
                    </Trans>
                  </Text>
                )}
                <Pagination
                  withPages={false}
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                  size="xs"
                />
              </Group>
            )}

            <Group gap="xs" style={{ marginLeft: "auto" }}>
              {canManage && selectedCount > 0 && (
                <>
                  <Text size="xs" c="dimmed">
                    <Trans>{selectedCount} selected</Trans>
                  </Text>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    data-testid={TestSelectors.VENUES_BULK_DELETE_BUTTON}
                    onClick={openBulkDelete}
                  >
                    <Trans>Delete selected</Trans>
                  </Button>
                  <Tooltip label={t`Clear selection`} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={t`Clear selection`}
                      data-testid={TestSelectors.VENUES_CLEAR_SELECTION_BUTTON}
                      onClick={() => setSelectedIds(new Set())}
                    >
                      <IconX size={15} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
              <Tooltip label={t`Refresh`} withArrow>
                <ActionIcon
                  data-testid={TestSelectors.VENUES_REFRESH_BUTTON}
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => void refetch()}
                  loading={isFetching}
                >
                  <IconRefresh size={15} />
                </ActionIcon>
              </Tooltip>
              <SegmentedControl
                size="xs"
                value={viewMode}
                onChange={(v) => setStoredViewMode(v as ViewMode)}
                data={[
                  {
                    value: "grid",
                    label: (
                      <Tooltip label={t`Grid view`} withArrow>
                        <Center>
                          <IconLayoutGrid size={14} />
                        </Center>
                      </Tooltip>
                    ),
                  },
                  {
                    value: "list",
                    label: (
                      <Tooltip label={t`List view`} withArrow>
                        <Center>
                          <IconLayoutList size={14} />
                        </Center>
                      </Tooltip>
                    ),
                  },
                ]}
              />
              <Select
                data={SORT_OPTIONS}
                value={sortOrder}
                onChange={(v) => {
                  if (v) setStoredSortOrder(v as SortOrder);
                }}
                size="xs"
                w={140}
                allowDeselect={false}
                disabled={isSemanticSearchActive}
              />
            </Group>
          </Group>

          {/* results */}
          {isLoading ? (
            viewMode === "grid" ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </SimpleGrid>
            ) : (
              <Stack gap="xs">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </Stack>
            )
          ) : items.length === 0 && !isError ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                  <IconBuildingStore size={24} />
                </ThemeIcon>
                <Text c="dimmed" size="sm">
                  {isSearching ? (
                    <Trans>No venues match your filters</Trans>
                  ) : (
                    <Trans>No venues yet — add your first one</Trans>
                  )}
                </Text>
                {isSearching ? (
                  <Button variant="light" color="gray" size="sm" onClick={handleReset}>
                    <Trans>Clear filters</Trans>
                  </Button>
                ) : canManage ? (
                  <Button
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    size="sm"
                    onClick={() => void navigate({ to: "/venues/add" })}
                  >
                    <Trans>New venue</Trans>
                  </Button>
                ) : null}
              </Stack>
            </Center>
          ) : viewMode === "grid" ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {items.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  selected={selectedIds.has(venue.id)}
                  canManage={canManage}
                  onToggleSelect={() => handleToggleSelect(venue.id)}
                  onView={() =>
                    void navigate({
                      to: "/venues/$venueId",
                      params: { venueId: venue.id },
                    })
                  }
                  onEdit={() => handleEdit(venue)}
                  onDelete={() => handleDelete(venue)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Stack gap="xs">
              {items.map((venue) => (
                <VenueRow
                  key={venue.id}
                  venue={venue}
                  selected={selectedIds.has(venue.id)}
                  canManage={canManage}
                  onToggleSelect={() => handleToggleSelect(venue.id)}
                  onView={() =>
                    void navigate({
                      to: "/venues/$venueId",
                      params: { venueId: venue.id },
                    })
                  }
                  onEdit={() => handleEdit(venue)}
                  onDelete={() => handleDelete(venue)}
                />
              ))}
            </Stack>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="sm">
              <Pagination total={totalPages} value={page} onChange={setPage} size="sm" withEdges />
            </Group>
          )}

          {!isLoading && totalElements > 0 && (
            <Text size="xs" c="dimmed" ta="center">
              <Trans>
                Showing {rangeStart}–{rangeEnd} of {totalElements}
              </Trans>
            </Text>
          )}
        </Stack>
      </Group>

      {canManage && (
        <>
          <EditVenueModal venue={selectedVenue} opened={editOpened} onClose={handleCloseEdit} />
          <DeleteVenueModal
            venue={selectedVenue}
            opened={deleteOpened}
            onClose={handleCloseDelete}
          />
          <BulkDeleteVenuesModal
            ids={[...selectedIds]}
            opened={bulkDeleteOpened}
            onClose={closeBulkDelete}
            onDeleted={handleBulkDeleted}
          />
        </>
      )}
    </Container>
  );
}
