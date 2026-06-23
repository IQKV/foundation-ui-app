import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Alert,
  Paper,
  Text,
  Badge,
  Skeleton,
  SimpleGrid,
  Box,
  ThemeIcon,
  Code,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDeviceFloppy,
  IconFileText,
  IconLock,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { cmsApi, localesApi } from "@/shared/api";
import type { CmsPageStatus } from "@/shared/api";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import {
  PageTranslationFields,
  buildPageSchema,
  getEditablePageStatusOptions,
  getPageStatusOptions,
  useUpdatePage,
  EMPTY_TRANSLATION,
} from "@/features/page-admin";
import type { PageFormValues } from "@/features/page-admin";

export const Route = createFileRoute("/_app/cms-pages/$pageId")({
  component: EditCmsPagePage,
});

const STATUS_COLOR: Record<CmsPageStatus, string> = {
  DRAFT: "gray",
  PENDING: "yellow",
  PUBLISHED: "green",
  ARCHIVED: "violet",
};

const EDITABLE_STATUSES: CmsPageStatus[] = ["DRAFT", "PENDING"];

function EditCmsPagePage() {
  const { t } = useLingui();
  const { pageId } = Route.useParams();
  const navigate = useNavigate();
  const { payload, tenantKey } = useSession();
  const authorities = payload?.authorities ?? [];
  const canManage = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");

  // ─── Remote data ────────────────────────────────────────────────────────────
  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tenant", "cms-page", pageId],
    queryFn: () => cmsApi.getPage(pageId),
    enabled: canManage && !!pageId,
  });

  const { data: iamLocales = [] } = useQuery({
    queryKey: ["locales"],
    queryFn: () => localesApi.list(),
    staleTime: Infinity,
  });

  const { data: hierarchyItems = [] } = useQuery({
    queryKey: ["tenant", "cms-pages", "hierarchy"],
    queryFn: () => cmsApi.listPageHierarchy(),
    staleTime: 30_000,
    enabled: canManage,
  });

  // ─── Derived values ─────────────────────────────────────────────────────────
  const defaultLocale = iamLocales.find((loc) => loc.isDefault)?.code;

  const localeOptions = iamLocales.map((loc) => ({
    value: loc.code,
    label: loc.nativeName ? `${loc.nativeName} (${loc.code})` : `${loc.name} (${loc.code})`,
  }));

  // Exclude self from parent options to prevent circular references
  const parentOptions = hierarchyItems
    .filter((p) => p.id !== pageId)
    .map((p) => ({
      value: p.id,
      label: p.title ? `${p.title} — /${p.slug}` : `/${p.slug}`,
    }));

  const isEditable = page != null && EDITABLE_STATUSES.includes(page.status as CmsPageStatus);

  // ─── Form ────────────────────────────────────────────────────────────────────
  const form = useForm<PageFormValues>({
    initialValues: {
      slug: "",
      parentId: null,
      template: null,
      status: "DRAFT",
      translations: [{ ...EMPTY_TRANSLATION, locale: defaultLocale ?? "en-US" }],
    },
    validate: (values) => validateWithZod(buildPageSchema(defaultLocale), values),
  });

  useEffect(() => {
    if (page) {
      form.setValues({
        slug: page.slug,
        parentId: page.parentId ?? null,
        template: page.template ?? null,
        status: EDITABLE_STATUSES.includes(page.status as CmsPageStatus)
          ? (page.status as CmsPageStatus)
          : "DRAFT",
        translations: page.translations.map((tr) => ({
          locale: tr.locale,
          title: tr.title,
          content: tr.content,
          seoTitle: tr.seoTitle ?? null,
          seoDescription: tr.seoDescription ?? null,
          seoOpenGraphTitle: tr.seoOpenGraphTitle ?? null,
          seoOpenGraphDescription: tr.seoOpenGraphDescription ?? null,
          seoCanonicalUrl: tr.seoCanonicalUrl ?? null,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const mutation = useUpdatePage({
    pageId,
    onSuccess: () => void navigate({ to: "/cms-pages" }),
  });

  const hasDefaultLocale = defaultLocale
    ? form.values.translations.some((tr) => tr.locale.toLowerCase() === defaultLocale.toLowerCase())
    : form.values.translations.length > 0;

  const handleSubmit = form.onSubmit((values) => mutation.mutate(values));

  // ─── Derived display values ──────────────────────────────────────────────────
  const defaultTitle =
    page?.translations.find(
      (tr) => tr.locale.toLowerCase() === (defaultLocale ?? "en-us").toLowerCase(),
    )?.title ??
    page?.translations.find((tr) => tr.locale.toLowerCase() === "en-us")?.title ??
    page?.slug ??
    "";

  if (!canManage) {
    return (
      <Container size="xl" py={0}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          <Trans>You do not have permission to manage CMS pages.</Trans>
        </Alert>
      </Container>
    );
  }

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>Edit Page</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/" },
            { label: <Trans>CMS Pages</Trans>, to: "/cms-pages" },
            { label: <Trans>Edit</Trans> },
          ]}
        />
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Box style={{ gridColumn: "span 2" }}>
            <Paper p="lg" shadow="xs">
              <Stack gap="md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={140} radius="sm" />
                ))}
              </Stack>
            </Paper>
          </Box>
          <Stack gap="sm">
            <Skeleton height={100} radius="sm" />
            <Skeleton height={180} radius="sm" />
            <Skeleton height={120} radius="sm" />
          </Stack>
        </SimpleGrid>
      </Container>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────
  if (isError || !page) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>Edit Page</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/" },
            { label: <Trans>CMS Pages</Trans>, to: "/cms-pages" },
            { label: <Trans>Edit</Trans> },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load page</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch the page details.</Trans>{" "}
          <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
            <Trans>Retry</Trans>
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Edit — ${defaultTitle}`)}</title>
      </Helmet>

      <PageHeader
        title={
          <Group gap="sm" align="center">
            <ThemeIcon variant="light" color="indigo" size="md" radius="sm">
              <IconFileText size={16} />
            </ThemeIcon>
            <Text fw={600} size="h4">
              {defaultTitle || <Trans>Edit Page</Trans>}
            </Text>
            <Badge
              variant="light"
              color={STATUS_COLOR[page.status as CmsPageStatus] ?? "gray"}
              size="sm"
              radius="sm"
            >
              {page.status}
            </Badge>
          </Group>
        }
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>CMS Pages</Trans>, to: "/cms-pages" },
          { label: defaultTitle || page.slug },
        ]}
        toolbar={
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={14} />}
            component={Link}
            to="/cms-pages"
          >
            <Trans>Back to list</Trans>
          </Button>
        }
      />

      {!isEditable && (
        <Alert
          icon={<IconLock size={15} />}
          color="blue"
          variant="light"
          mb="md"
          title={<Trans>Read-only</Trans>}
        >
          <Trans>
            Pages with status <strong>{page.status}</strong> cannot be edited.
          </Trans>
        </Alert>
      )}

      <form onSubmit={handleSubmit} data-testid="form--edit-page">
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" style={{ alignItems: "start" }}>
          {/* ─── Main: translations ─────────────────────────────────────── */}
          <Box style={{ gridColumn: "span 2" }}>
            <Paper p="lg" withBorder={false} shadow="xs">
              {mutation.isError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  title={<Trans>Save failed</Trans>}
                  mb="md"
                >
                  <Trans>Could not save the page. Please check the form and try again.</Trans>
                </Alert>
              )}

              {!hasDefaultLocale && isEditable && (
                <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" mb="md">
                  <Trans>
                    A translation for the default locale ({defaultLocale ?? "default"}) is required.
                  </Trans>
                </Alert>
              )}

              <PageTranslationFields
                form={form}
                locales={localeOptions}
                defaultLocale={defaultLocale}
                disabled={!isEditable}
              />
            </Paper>
          </Box>

          {/* ─── Sidebar ─────────────────────────────────────────────────── */}
          <Stack gap="sm">
            {/* Page identity */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.05em">
                  <Trans>Identity</Trans>
                </Text>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    <Trans>Tenant</Trans>
                  </Text>
                  <Badge variant="outline" color="indigo" size="sm" ff="monospace" radius="sm">
                    {tenantKey}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  <Trans>ID</Trans>
                </Text>
                <Code
                  block={false}
                  style={{ fontSize: "var(--mantine-font-size-xs)", wordBreak: "break-all" }}
                >
                  {page.id}
                </Code>
              </Stack>
            </Paper>

            {/* Page settings */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="sm">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.05em">
                  <Trans>Page settings</Trans>
                </Text>

                <TextInput
                  label={t`Slug`}
                  placeholder="about-us"
                  description={t`URL path, e.g. about-us or blog/post`}
                  required
                  size="sm"
                  disabled={!isEditable}
                  data-testid="input--slug"
                  {...form.getInputProps("slug")}
                />

                <Select
                  label={t`Status`}
                  data={isEditable ? getEditablePageStatusOptions() : getPageStatusOptions()}
                  size="sm"
                  disabled={!isEditable}
                  data-testid="input--status"
                  {...form.getInputProps("status")}
                />

                <TextInput
                  label={t`Template`}
                  placeholder={t`e.g. default, landing`}
                  description={t`Optional layout key`}
                  size="sm"
                  disabled={!isEditable}
                  data-testid="input--template"
                  {...form.getInputProps("template")}
                />
              </Stack>
            </Paper>

            {/* Parent page picker */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="sm">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.05em">
                  <Trans>Hierarchy</Trans>
                </Text>

                <Select
                  label={t`Parent page`}
                  placeholder={t`None (top-level)`}
                  description={t`Optional — makes this a child page`}
                  data={parentOptions}
                  value={form.values.parentId ?? null}
                  onChange={(val) => form.setFieldValue("parentId", val ?? null)}
                  searchable
                  clearable
                  size="sm"
                  disabled={!isEditable || parentOptions.length === 0}
                  data-testid="input--parentId"
                />
              </Stack>
            </Paper>

            {/* Actions */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="sm">
                {isEditable && (
                  <Button
                    type="submit"
                    leftSection={<IconDeviceFloppy size={15} />}
                    loading={mutation.isPending}
                    disabled={!hasDefaultLocale}
                    fullWidth
                    data-testid="button--save"
                  >
                    <Trans>Save changes</Trans>
                  </Button>
                )}
                <Button
                  variant="subtle"
                  color="gray"
                  component={Link}
                  to="/cms-pages"
                  disabled={mutation.isPending}
                  fullWidth
                  data-testid="button--cancel"
                >
                  <Trans>Back to list</Trans>
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </SimpleGrid>
      </form>
    </Container>
  );
}
