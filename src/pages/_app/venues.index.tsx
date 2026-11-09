import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
} from "@mantine/core";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import {
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconBuildingStore,
  IconLayoutList,
  IconLayoutGrid,
  IconMapPin,
  IconExternalLink,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import type { Venue } from "@/entities/venue";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { dayjs } from "@/shared/lib/date-utils";
import { useVenues } from "@/features/venue-management";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/venues/")({
  component: VenuesPage,
});

const PAGE_SIZE = 20;

/** Blue→cyan accent shared by the card, row and sidebar borders. */
const ACCENT_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-blue-4) 0%, var(--mantine-color-cyan-4) 100%)";

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

function VenueCard({ venue, onView }: { venue: Venue; onView: () => void }) {
  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
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
        },
      }}
    >
      <Card.Section style={{ cursor: "pointer" }}>
        <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} height={148} />
      </Card.Section>

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
        {venue.masterVenueId && (
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

function VenueRow({ venue, onView }: { venue: Venue; onView: () => void }) {
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
              <IconRefresh size={11} />
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
  const { tenantKey } = useSession();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  const hasActiveFilters = debouncedSearch !== "" || cityFilter !== null;

  const [storedViewMode, setStoredViewMode] = useLocalStorage<ViewMode>({
    key: "iqkv_venues_view_mode",
    defaultValue: "grid",
    getInitialValueInEffect: false,
  });
  const viewMode: ViewMode = storedViewMode === "list" ? "list" : "grid";

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, refetch, isFetching } = useVenues({
    search: debouncedSearch || undefined,
    city: cityFilter || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const rangeStart = totalElements === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, totalElements);

  // shortcut: city options come from the loaded page only (no city-list endpoint); upgrade when one exists.
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    items.forEach((v) => {
      if (v.city) cities.add(v.city);
    });
    if (cityFilter) cities.add(cityFilter);
    return [...cities].sort().map((c) => ({ value: c, label: c }));
  }, [items, cityFilter]);

  const handleReset = () => {
    setSearch("");
    setCityFilter(null);
    setPage(1);
  };

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Venues`]} />
      <PageHeader
        title={<Trans>Venues</Trans>}
        breadcrumbs={[{ label: <Trans>Home</Trans>, to: "/" }, { label: <Trans>Venues</Trans> }]}
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

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <Group align="flex-start" gap="lg" wrap="nowrap">
        <FilterSidebar
          search={search}
          cityFilter={cityFilter}
          cityOptions={cityOptions}
          hasActiveFilters={hasActiveFilters}
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
            </Group>

            <Group gap="xs" style={{ marginLeft: "auto" }}>
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
                  {hasActiveFilters ? (
                    <Trans>No venues match your filters</Trans>
                  ) : (
                    <Trans>No venues yet</Trans>
                  )}
                </Text>
                {hasActiveFilters && (
                  <Button variant="light" color="gray" size="sm" onClick={handleReset}>
                    <Trans>Clear filters</Trans>
                  </Button>
                )}
              </Stack>
            </Center>
          ) : viewMode === "grid" ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {items.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onView={() =>
                    void navigate({
                      to: "/venues/$venueId",
                      params: { venueId: venue.id },
                    })
                  }
                />
              ))}
            </SimpleGrid>
          ) : (
            <Stack gap="xs">
              {items.map((venue) => (
                <VenueRow
                  key={venue.id}
                  venue={venue}
                  onView={() =>
                    void navigate({
                      to: "/venues/$venueId",
                      params: { venueId: venue.id },
                    })
                  }
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
    </Container>
  );
}
