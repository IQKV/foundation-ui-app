import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Container, Title, Text, Button, Stack, Alert, Code } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback, showErrorDetails = import.meta.env.DEV } = this.props;
      const { error, errorInfo } = this.state;

      if (fallback) {
        return fallback(error, errorInfo!, this.handleRetry);
      }

      return (
        <Container size="sm" py="xl">
          <Stack gap="lg" align="center">
            <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />
            <Stack gap="sm" align="center">
              <Title order={2} ta="center">
                Something went wrong
              </Title>
              <Text size="lg" c="dimmed" ta="center">
                {error.message}
              </Text>
            </Stack>
            <Button leftSection={<IconRefresh size="1rem" />} onClick={this.handleRetry}>
              Try Again
            </Button>
            {showErrorDetails && errorInfo && (
              <Alert variant="light" color="gray" style={{ width: "100%" }}>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Error Details (Development)
                  </Text>
                  <Code block>{error.message}</Code>
                  <Code block style={{ fontSize: "0.75rem" }}>
                    {errorInfo.componentStack}
                  </Code>
                </Stack>
              </Alert>
            )}
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => setError(null), []);
  const captureError = React.useCallback((error: Error) => setError(error), []);

  React.useEffect(() => {
    if (error) throw error;
  }, [error]);

  return { captureError, resetError };
}
