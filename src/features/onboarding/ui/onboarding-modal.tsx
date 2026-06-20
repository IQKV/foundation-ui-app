import { Modal, Title, Text, Button, List, ThemeIcon, Group, Stack } from "@mantine/core";
import { IconCheck, IconBuilding, IconUser, IconSettings } from "@tabler/icons-react";
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
      // Update the access token in the store to reflect the new onboarding status
      if (accessToken) {
        const decoded = decodeJwt(accessToken);
        if (decoded) {
          // We need to refresh the token or update it, but for now let's just close the modal
          // In a real app, we'd refresh the token or update the payload
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
        <Title order={2}>
          <Trans>Welcome to IQKV!</Trans>
        </Title>
      }
      size="lg"
      centered
      withCloseButton={false}
    >
      <Stack gap="lg">
        <Text size="lg">
          <Trans>Let's get you up and running with a quick guide.</Trans>
        </Text>

        <List
          spacing="md"
          size="md"
          center
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>
            <Text>
              <Trans>
                Create your first{" "}
                <Text component="span" fw={700}>
                  organization
                </Text>{" "}
                to collaborate with your team
              </Trans>
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              <Trans>
                Complete your{" "}
                <Text component="span" fw={700}>
                  profile
                </Text>{" "}
                with your name and avatar
              </Trans>
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              <Trans>
                Explore your{" "}
                <Text component="span" fw={700}>
                  settings
                </Text>{" "}
                to customize your experience
              </Trans>
            </Text>
          </List.Item>
        </List>

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
    </Modal>
  );
}
