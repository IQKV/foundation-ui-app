import { useState } from "react";
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
  Anchor,
  Center,
  ThemeIcon,
  Divider,
  CopyButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import type { Venue } from "@/entities/venue";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import {
  useVenue,
  ACCENT_GRADIENT,
  SECTION_CARD_STYLES,
  EditVenueModal,
  DeleteVenueModal,
} from "@/features/venue-management";
import { dayjs } from "@/shared/lib/date-utils";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/venues/$venueId")({
  component: VenueDetailPage,
});

// ─── Section card ────────────────────────────────────────────────────────────

interface InfoSectionCardProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

function InfoSectionCard({ title, icon, children, isLoading }: InfoSectionCardProps) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

function VenueDetailPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { venueId } = Route.useParams();
  const { payload } = useSession();
  const authorities = payload?.authorities ?? [];
  const canManage = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deletedVenue, setDeletedVenue] = useState<Venue | null>(null);

  const { data: venue, isLoading, isError, refetch, isFetching } = useVenue(venueId);

  const hasPhoto = Boolean(venue?.primaryPhotoUrl);

  const mapUrl =
    venue?.locationLat && venue?.locationLng
      ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
      : null;

  const handleDeleteSuccess = () => void navigate({ to: "/venues" });

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

          {/* soft gradient rim — replaces the hard border on the hero edge */}
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

        {/* ── Details ──────────────────────────────────────────────────── */}
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
                        <Anchor href={mapUrl} target="_blank" rel="noopener noreferrer" size="sm">
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
                value={venue ? <Text size="sm" ff="monospace">{venue.id}</Text> : null}
              />
              <FieldChip
                label={<Trans>Created</Trans>}
                value={venue?.createdAt ? dayjs(venue.createdAt).format("MMM D, YYYY HH:mm") : null}
              />
              <FieldChip
                label={<Trans>Updated</Trans>}
                value={venue?.updatedAt ? dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm") : null}
              />
            </Stack>
          </InfoSectionCard>
        </Stack>
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
  );
}
