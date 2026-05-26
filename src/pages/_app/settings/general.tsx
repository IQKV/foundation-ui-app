import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Paper,
  Text,
  Group,
  TextInput,
  Select,
  Button,
  Divider,
  Box,
  Badge,
  Loader,
  Skeleton,
  Alert,
} from "@mantine/core";
import { IconBuilding, IconUser, IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi, localesApi } from "@/shared/api";
import { PageHeader } from "@/shared/ui";
import { useEditProfile, type EditProfileFormValues } from "@/features/edit-profile";

export const Route = createFileRoute("/_app/settings/general")({
  component: GeneralSettingsPage,
});

function GeneralSettingsPage() {
  const { t } = useLingui();

  const {
    data: profile,
    isLoading: profileLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => iamApi.getMe(),
  });

  const { data: locales, isLoading: localesLoading } = useQuery({
    queryKey: ["locales"],
    queryFn: () => localesApi.list(),
    staleTime: Infinity,
  });

  const localeOptions =
    locales?.map((l) => ({
      value: l.code,
      label: l.nativeName ? `${l.name} — ${l.nativeName}` : l.name,
    })) ?? [];

  const form = useForm<EditProfileFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      locale: null,
    },
    validate: {
      firstName: (v) => (v.trim().length < 1 ? t`First name is required` : null),
      lastName: (v) => (v.trim().length < 1 ? t`Last name is required` : null),
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValues({
        firstName: profile.firstName,
        lastName: profile.lastName,
        locale: profile.locale ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const mutation = useEditProfile({
    onSuccess: () => {
      form.resetDirty();
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values);
  });

  if (isError) {
    return (
      <Container size="md">
        <PageHeader title={t`General Settings`} />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t`Failed to load profile`}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch your account details.</Trans>{" "}
          <Text
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Helmet title={pageTitle(t`General Settings`)} />
      <PageHeader
        title={t`General Settings`}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Account Settings</Trans> },
          { label: <Trans>General</Trans> },
        ]}
      />

      <Stack gap="xl">
        {/* Profile Card */}
        <Paper withBorder p="xl" radius="md">
          <Group gap="md" mb="xl">
            <IconUser size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={600}>
              <Trans>Profile Information</Trans>
            </Text>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Group grow>
                <TextInput
                  label={t`First name`}
                  placeholder={t`First name`}
                  disabled={profileLoading}
                  {...form.getInputProps("firstName")}
                />
                <TextInput
                  label={t`Last name`}
                  placeholder={t`Last name`}
                  disabled={profileLoading}
                  {...form.getInputProps("lastName")}
                />
              </Group>

              <TextInput
                label={t`Email`}
                value={profile?.email ?? ""}
                readOnly
                styles={{
                  input: {
                    cursor: "default",
                    color: "var(--mantine-color-gray-6)",
                    background: "var(--mantine-color-gray-0)",
                  },
                }}
                rightSection={
                  <Text size="xs" c="dimmed" pr={4}>
                    <Trans>read-only</Trans>
                  </Text>
                }
                rightSectionWidth={72}
              />

              <Select
                label={t`Language`}
                description={t`Sets your preferred language for notifications and emails.`}
                placeholder={localesLoading ? t`Loading…` : t`Select language`}
                data={localeOptions}
                rightSection={localesLoading ? <Loader size="xs" /> : undefined}
                disabled={localesLoading || profileLoading}
                clearable
                searchable
                {...form.getInputProps("locale")}
              />

              <Divider />

              <Group justify="flex-end">
                <Button
                  type="submit"
                  loading={mutation.isPending}
                  disabled={profileLoading || !form.isDirty()}
                >
                  <Trans>Save changes</Trans>
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {/* Organizations Card */}
        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <IconBuilding size={15} color="var(--mantine-color-gray-6)" />
            <Text fw={600} size="sm">
              <Trans>Organizations</Trans>
            </Text>
            {!profileLoading && (
              <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
                {profile?.organizations?.length ?? 0}
              </Badge>
            )}
          </Group>

          {profileLoading ? (
            <Stack gap={0}>
              {Array.from({ length: 2 }).map((_, i) => (
                <Box
                  key={i}
                  px="md"
                  py="sm"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Group gap="sm">
                    <Skeleton circle height={32} width={32} />
                    <Skeleton height={12} width="40%" radius="sm" />
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : !profile?.organizations || profile.organizations.length === 0 ? (
            <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
              <Trans>You are not a member of any organization.</Trans>
            </Text>
          ) : (
            <Stack gap={0}>
              {profile.organizations.map((orgName) => (
                <Box
                  key={orgName}
                  px="md"
                  py="sm"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Group gap="sm">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--mantine-color-blue-1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
                    </Box>
                    <Text size="sm" fw={500}>
                      {orgName}
                    </Text>
                  </Group>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
