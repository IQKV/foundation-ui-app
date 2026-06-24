import { Container, Stack, Grid, Card, Text, Button, Group, Title } from "@mantine/core";
import { IconHeadset, IconUsers, IconFolder } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import {
  EntitlementsProvider,
  EntitlementsCard,
  FeatureGate,
  useHasFeature,
  useQuota,
} from "@/features/manage-billing";
import { BILLING_FEATURES } from "@/app/config";

// Example component showing how to use feature checks
function ExampleFeatureUsage() {
  const hasPrioritySupport = useHasFeature(BILLING_FEATURES.PRIORITY_SUPPORT);
  const maxUsers = useQuota("maxUsers");
  const maxProjects = useQuota("maxProjects");

  return (
    <Card withBorder p="md">
      <Stack gap="sm">
        <Title order={4}>
          <Trans>Feature Usage Examples</Trans>
        </Title>

        <Text size="sm" c="dimmed">
          <Trans>Current plan limits:</Trans>
        </Text>

        <Group gap="xl">
          <Text size="sm">
            <Trans>Priority Support:</Trans> {hasPrioritySupport ? "✅" : "❌"}
          </Text>
          <Text size="sm">
            <Trans>Max Users:</Trans> {maxUsers === 0 ? "Unlimited" : maxUsers}
          </Text>
          <Text size="sm">
            <Trans>Max Projects:</Trans> {maxProjects === 0 ? "Unlimited" : maxProjects}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}

// Example of feature-gated components
function ExampleFeatureGates() {
  return (
    <Stack gap="md">
      <Title order={4}>
        <Trans>Feature Gate Examples</Trans>
      </Title>

      {/* Priority Support Feature Gate — checks features map by code */}
      <FeatureGate
        feature={BILLING_FEATURES.PRIORITY_SUPPORT}
        showUpgradePrompt
        fallback={
          <Card withBorder p="md" style={{ opacity: 0.6 }}>
            <Group>
              <IconHeadset size={20} />
              <Text c="dimmed">
                <Trans>Priority Support (Upgrade Required)</Trans>
              </Text>
            </Group>
          </Card>
        }
      >
        <Card withBorder p="md" style={{ borderColor: "var(--mantine-color-green-6)" }}>
          <Group>
            <IconHeadset size={20} />
            <Text fw={500}>
              <Trans>Priority Support Available</Trans>
            </Text>
            <Button size="xs" variant="light" color="green">
              <Trans>Contact Support</Trans>
            </Button>
          </Group>
        </Card>
      </FeatureGate>

      {/* User Management — quota check via useQuota, not FeatureGate */}
      <Card withBorder p="md">
        <Group justify="space-between">
          <Group>
            <IconUsers size={20} />
            <Text>
              <Trans>Team Management</Trans>
            </Text>
          </Group>
          <Button size="xs" variant="outline">
            <Trans>Invite Members</Trans>
          </Button>
        </Group>
      </Card>

      {/* Project Management — quota check via useQuota, not FeatureGate */}
      <Card withBorder p="md">
        <Group justify="space-between">
          <Group>
            <IconFolder size={20} />
            <Text>
              <Trans>Project Management</Trans>
            </Text>
          </Group>
          <Button size="xs" variant="outline">
            <Trans>Create Project</Trans>
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}

/**
 * Example page demonstrating billing entitlements integration.
 *
 * This shows how to:
 * 1. Wrap your app/routes with EntitlementsProvider
 * 2. Display current plan information with EntitlementsCard
 * 3. Use FeatureGate to conditionally render UI behind a feature-map code
 * 4. Use useHasFeature(code) for boolean feature-map checks
 * 5. Use useQuota(field) for typed quota fields (maxUsers, maxProjects)
 */
export function BillingExamplePage() {
  return (
    <EntitlementsProvider>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <div>
            <Title order={2} mb="md">
              <Trans>Billing Integration Example</Trans>
            </Title>
            <Text c="dimmed">
              <Trans>
                This page demonstrates how to integrate the billing entitlements API for plan-based
                feature access control in your React application.
              </Trans>
            </Text>
          </div>

          <Grid>
            <Grid.Col span={12}>
              <EntitlementsCard />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ExampleFeatureUsage />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ExampleFeatureGates />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </EntitlementsProvider>
  );
}
