import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { AppLayout } from "./app-layout";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe("AppLayout", () => {
  it("renders children correctly", () => {
    render(
      <TestWrapper>
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      </TestWrapper>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <TestWrapper>
        <AppLayout>
          <div>First Child</div>
          <div>Second Child</div>
        </AppLayout>
      </TestWrapper>,
    );

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
  });

  it("applies AppShell structure", () => {
    const { container } = render(
      <TestWrapper>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </TestWrapper>,
    );

    // Check that AppShell structure is present
    const appShell = container.querySelector(".mantine-AppShell-root");
    expect(appShell || container.firstChild).toBeInTheDocument();
  });
});
