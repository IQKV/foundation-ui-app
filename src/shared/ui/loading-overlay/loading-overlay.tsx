import {
  Center,
  Loader,
  LoadingOverlay as MantineLoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import { t } from "@lingui/core/macro";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  zIndex?: number;
}

export function LoadingOverlay({ visible, message, zIndex = 1000 }: LoadingOverlayProps) {
  const resolvedMessage = message ?? t`Loading...`;
  if (!visible) {
    return null;
  }

  return (
    <MantineLoadingOverlay
      visible={visible}
      zIndex={zIndex}
      overlayProps={{ blur: 2 }}
      loaderProps={{
        children: (
          <Center>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              {resolvedMessage && (
                <Text size="sm" c="dimmed">
                  {resolvedMessage}
                </Text>
              )}
            </Stack>
          </Center>
        ),
      }}
      data-testid={TestSelectors.LOADING_OVERLAY}
    />
  );
}
