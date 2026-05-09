import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { LoadingOverlay } from "./loading-overlay";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe("LoadingOverlay", () => {
  it("renders nothing when not visible", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible={false} />
      </TestWrapper>,
    );

    // When not visible, the component returns null but Mantine may inject styles
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("renders loading overlay when visible", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible />
      </TestWrapper>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays custom message when provided", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible message="Please wait..." />
      </TestWrapper>,
    );

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("displays default message when no message provided", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible />
      </TestWrapper>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("accepts custom zIndex prop", () => {
    const { container } = render(
      <TestWrapper>
        <LoadingOverlay visible zIndex={9999} />
      </TestWrapper>,
    );

    const overlay = container.querySelector('[class*="overlay"]');
    expect(overlay).toBeInTheDocument();
  });

  it("renders without message when empty string provided", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible message="" />
      </TestWrapper>,
    );

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
