import { Modal, Title, Text, Button, List, ThemeIcon, Group, Stack, Grid } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { iamApi, authApi } from "@/shared/api";
import { setTokens, getIsPersonalWorkspace, useSession } from "@/processes/session";
import { isSingleTenantMode } from "@/app/config";
import { onboardingWelcome } from "@/app/config/runtime-env";

interface OnboardingModalProps {
  opened: boolean;
  onClose: () => void;
}

function MultiTenantOnboardingContent() {
  return (
    <Stack gap="lg">
      <Text size="lg">
        <Trans>Your enterprise-ready microservices foundation for scalable SaaS products.</Trans>
      </Text>

      <Title order={4}>
        <Trans>Platform Highlights</Trans>
      </Title>
      <List
        spacing="sm"
        size="sm"
        icon={
          <ThemeIcon color="violet" size={20} radius="xl">
            <IconCheck size={14} />
          </ThemeIcon>
        }
      >
        <List.Item>
          <Text>
            <Trans>Create, manage & invite teams to your workspace</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>Set up subscriptions & billing instantly</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>Send email verifications, password resets & invitations</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>Track all activity with built-in audit trails</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>Manage user roles, permissions & access</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>All the boring stuff is already done — focus on your idea!</Trans>
          </Text>
        </List.Item>
      </List>

      <Title order={4} mt="md">
        <Trans>Tips</Trans>
      </Title>
      <Text size="sm" c="dimmed">
        <Trans>• Focus on your product value — let the platform handle complexity.</Trans>
      </Text>
      <Text size="sm" c="dimmed">
        <Trans>• Invite your team — your first steps are just a click away!</Trans>
      </Text>
      <Text size="sm" c="dimmed">
        <Trans>• No technical background needed — our intuitive UI is designed for everyone.</Trans>
      </Text>
    </Stack>
  );
}

function SingleTenantOnboardingContent() {
  return (
    <Stack gap="lg">
      <Text size="lg">
        <Trans>Welcome! Your account is ready — start using the app right away.</Trans>
      </Text>

      <Title order={4}>
        <Trans>What you can do</Trans>
      </Title>
      <List
        spacing="sm"
        size="sm"
        icon={
          <ThemeIcon color="blue" size={20} radius="xl">
            <IconCheck size={14} />
          </ThemeIcon>
        }
      >
        <List.Item>
          <Text>
            <Trans>Update your profile and preferences in account settings</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>Manage your subscription and billing when you are ready</Trans>
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            <Trans>Secure your account with a strong password and notifications</Trans>
          </Text>
        </List.Item>
      </List>

      <Title order={4} mt="md">
        <Trans>Tips</Trans>
      </Title>
      <Text size="sm" c="dimmed">
        <Trans>• Everything is set up for you — no workspace or organization setup needed.</Trans>
      </Text>
      <Text size="sm" c="dimmed">
        <Trans>• Explore settings anytime to customize your experience.</Trans>
      </Text>
    </Stack>
  );
}

export function OnboardingModal({ opened, onClose }: OnboardingModalProps) {
  const { t } = useLingui();
  const { tenantKey } = useSession();

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      await iamApi.completeOnboarding();
      const fresh = await authApi.exchangeTenant(tenantKey!);
      setTokens(fresh.accessToken, fresh.refreshToken, fresh.tenantKey, getIsPersonalWorkspace());
    },
    onSuccess: () => {
      onClose();
    },
  });

  const handleGetStarted = () => {
    completeOnboardingMutation.mutate();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={2} ta="center">
          {isSingleTenantMode ? <Trans>Welcome!</Trans> : <>{onboardingWelcome}</>}
        </Title>
      }
      size="75%"
      centered
      withCloseButton={false}
      padding="xl"
    >
      <Grid gap="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <img
            src="/teamwork-innovation.png"
            alt={t`Welcome illustration`}
            style={{
              width: "100%",
              maxWidth: "350px",
              height: "auto",
              objectFit: "contain",
              borderRadius: "16px",
              margin: "0 auto",
              display: "block",
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          {isSingleTenantMode ? (
            <SingleTenantOnboardingContent />
          ) : (
            <MultiTenantOnboardingContent />
          )}

          <Group justify="flex-end" mt="xl">
            <Button
              size="lg"
              onClick={handleGetStarted}
              loading={completeOnboardingMutation.isPending}
            >
              <Trans>Get Started</Trans>
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
