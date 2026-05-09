import {
  Center,
  Loader,
  LoadingOverlay as MantineLoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  zIndex?: number;
}

export function LoadingOverlay({
  visible,
  message = "Loading...",
  zIndex = 1000,
}: LoadingOverlayProps) {
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
              {message && (
                <Text size="sm" c="dimmed">
                  {message}
                </Text>
              )}
            </Stack>
          </Center>
        ),
      }}
    />
  );
}
