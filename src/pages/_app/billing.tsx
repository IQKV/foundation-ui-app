import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Text, Paper, Group, ThemeIcon, Title } from "@mantine/core";
import { IconCreditCard, IconInfoCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader, TenantOwnerOnly } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { BillingPortalButton } from "@/features/manage-billing";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_app/billing")({
  component: BillingPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function BillingPage() {
  const { t } = useLingui();
  const { tenantKey } = useSession();

  return (
    <TenantOwnerOnly>
      <Container size="md">
        <Helmet title={pageTitle(t`Billing`)} />
        <PageHeader title={t`Billing`} />

        <Stack gap="xl">
          <Paper withBorder p="xl" radius="md">
            <Group align="flex-start" wrap="nowrap" gap="lg">
              <ThemeIcon size={48} radius="md" variant="light" color="blue">
                <IconCreditCard size={28} />
              </ThemeIcon>

              <Stack gap="xs" style={{ flex: 1 }}>
                <Title order={3}>
                  <Trans>Subscription & Invoices</Trans>
                </Title>
                <Text size="sm" c="dimmed">
                  <Trans>
                    Manage your billing information, view invoice history, and update your payment
                    methods directly via our secure Stripe Customer Portal.
                  </Trans>
                </Text>

                <Group mt="md">
                  <BillingPortalButton tenantKey={tenantKey ?? undefined} size="md" />
                </Group>
              </Stack>
            </Group>
          </Paper>

          <Paper withBorder p="md" radius="md" bg="var(--mantine-color-blue-light)">
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <IconInfoCircle size={18} color="var(--mantine-color-blue-filled)" />
              <Text size="xs" c="blue">
                <Trans>
                  Your payment information is securely processed by Stripe. We do not store your
                  credit card details on our servers.
                </Trans>
              </Text>
            </Group>
          </Paper>
        </Stack>
      </Container>
    </TenantOwnerOnly>
  );
}
