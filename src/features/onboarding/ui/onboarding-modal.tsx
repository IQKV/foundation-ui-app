import {
  Modal,
  Title,
  Text,
  Button,
  List,
  ThemeIcon,
  Group,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";
import { useSession } from "@/processes/session/use-session";
import { useSessionStore, setAccessToken } from "@/processes/session/session.store";
import { decodeJwt } from "@/shared/lib/jwt";

interface OnboardingModalProps {
  opened: boolean;
  onClose: () => void;
}

export function OnboardingModal({ opened, onClose }: OnboardingModalProps) {
  const { t } = useLingui();
  const { payload } = useSession();
  const accessToken = useSessionStore((s) => s.accessToken);

  const completeOnboardingMutation = useMutation({
    mutationFn: () => iamApi.completeOnboarding(),
    onSuccess: () => {
      if (accessToken) {
        const decoded = decodeJwt(accessToken);
        if (decoded) {
          onClose();
        }
      }
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
          <Trans>Welcome to Key Value Platform!</Trans>
        </Title>
      }
      size="xl"
      centered
      withCloseButton={false}
      padding="xl"
    >
      <SimpleGrid cols={2} spacing="xl" verticalSpacing="xl">
        <div>
          <img
            src="/teamwork-innovation.png"
            alt="Teamwork and innovation"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "16px",
            }}
          />
        </div>
        <Stack gap="lg">
          <Text size="lg">
            <Trans>
              Your enterprise-ready microservices foundation for scalable SaaS products.
            </Trans>
          </Text>

          <Title order={4}>
            <Trans>Platform Highlights</Trans>
          </Title>
          <List
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon color="teal" size={20} radius="xl">
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
                <Trans>All the boring stuff is already done—focus on your idea!</Trans>
              </Text>
            </List.Item>
          </List>

          <Title order={4} mt="md">
            <Trans>Inspiration & Tips</Trans>
          </Title>
          <Text size="sm" c="dimmed">
            <Trans>• Focus on your product value—let the platform handle complexity.</Trans>
          </Text>
          <Text size="sm" c="dimmed">
            <Trans>• Invite your team, create your first steps take just a click away!</Trans>
          </Text>
          <Text size="sm" c="dimmed">
            <Trans>• No technical or not—the UI is intuitive for everyone.</Trans>
          </Text>

          <Group justify="flex-end" mt="xl">
            <Button
              size="lg"
              onClick={handleGetStarted}
              loading={completeOnboardingMutation.isPending}
            >
              <Trans>Get Started</Trans>
            </Button>
          </Group>
        </Stack>
      </SimpleGrid>
    </Modal>
  );
}
