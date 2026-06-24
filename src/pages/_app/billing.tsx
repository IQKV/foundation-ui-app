import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Text,
  Paper,
  Group,
  ThemeIcon,
  Title,
  Divider,
  Alert,
} from "@mantine/core";
import { IconCreditCard, IconInfoCircle, IconPackage } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { isSingleTenantMode } from "@/app/config";
import {
  BillingPortalButton,
  CurrentSubscription,
  PlanList,
  BillingInfo,
  RefundList,
  useActiveSubscription,
  useCreateCheckoutSession,
  useBillingSettings,
  isBillingSettingsNotFound,
} from "@/features/manage-billing";
import type { Plan } from "@/shared/api";
import { TestSelectors } from "@/shared/lib/test-selectors";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_app/billing")({
  component: BillingPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function BillingPage() {
  const { t } = useLingui();
  const { tenantKey, isTenantOwner, isPersonalWorkspace } = useSession();
  const { data: subscription } = useActiveSubscription(tenantKey);
  const { mutate: createCheckout, isPending: isCreatingCheckout } =
    useCreateCheckoutSession(tenantKey);

  const {
    data: billingSettings,
    error: billingSettingsError,
    isLoading: isBillingSettingsLoading,
  } = useBillingSettings(tenantKey);

  const handleSelectPlan = (plan: Plan) => {
    if (!isTenantOwner) return;

    createCheckout({
      planCode: plan.planCode,
      successUrl: window.location.href,
      cancelUrl: window.location.href,
    });
  };

  // In single tenant mode, don't show personal workspace message - we should have billing
  if (!isSingleTenantMode && isPersonalWorkspace) {
    return (
      <Container size="md" data-testid={TestSelectors.PAGE("billing")}>
        <Helmet title={pageTitle(t`Billing`)} />
        <PageHeader title={t`Billing`} />
        <Stack gap="xl">
          <Paper withBorder p="xl" radius="md">
            <Stack gap="md">
              <Title order={3}>
                <Trans>Personal Workspace</Trans>
              </Title>
              <Text size="sm" c="dimmed">
                <Trans>
                  Your personal workspace doesn't require a subscription. Upgrade to an organization
                  workspace to access additional features and team collaboration.
                </Trans>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" data-testid={TestSelectors.PAGE("billing")}>
      <Helmet title={pageTitle(t`Billing`)} />
      <PageHeader title={t`Billing`} />

      <Stack gap="xl">
        <CurrentSubscription tenantKey={isSingleTenantMode ? undefined : tenantKey} />

        {isTenantOwner && (
          <>
            <Divider
              label={
                <Group gap="xs">
                  <IconPackage size={16} />
                  <Text fw={500}>
                    <Trans>Available Plans</Trans>
                  </Text>
                </Group>
              }
              labelPosition="left"
            />

            <PlanList
              currentPlanId={subscription?.planId}
              onSelect={handleSelectPlan}
              selectingPlanId={isCreatingCheckout ? "all" : undefined} // Simplification
            />

            <BillingInfo tenantKey={isSingleTenantMode ? undefined : tenantKey} />

            <RefundList tenantKey={isSingleTenantMode ? undefined : tenantKey} />

            {isBillingSettingsLoading && (
              <Paper withBorder p="xl" radius="md">
                <Text c="dimmed">
                  <Trans>Loading billing information…</Trans>
                </Text>
              </Paper>
            )}

            {!isBillingSettingsLoading && billingSettings && (
              <Paper withBorder p="xl" radius="md">
                <Group align="flex-start" wrap="nowrap" gap="lg">
                  <ThemeIcon size={48} radius="md" variant="light" color="blue">
                    <IconCreditCard size={28} />
                  </ThemeIcon>

                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Title order={3}>
                      <Trans>Billing Portal</Trans>
                    </Title>
                    <Text size="sm" c="dimmed">
                      <Trans>
                        Manage your billing information, view invoice history, and update your
                        payment methods directly via our secure Stripe Customer Portal.
                      </Trans>
                    </Text>

                    <Group mt="md">
                      <BillingPortalButton
                        tenantKey={isSingleTenantMode ? undefined : tenantKey}
                        size="md"
                      />
                    </Group>
                  </Stack>
                </Group>
              </Paper>
            )}

            {!isBillingSettingsLoading &&
              (isBillingSettingsNotFound(billingSettingsError) || !billingSettings) && (
                <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                  <Stack gap="sm">
                    <Text fw={500}>
                      <Trans>Billing Portal Unavailable</Trans>
                    </Text>
                    <Text size="sm">
                      <Trans>
                        To access the billing portal, please complete your billing settings setup.
                      </Trans>
                    </Text>
                  </Stack>
                </Alert>
              )}

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
          </>
        )}
      </Stack>
    </Container>
  );
}
