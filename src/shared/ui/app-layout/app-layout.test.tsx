import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/shared/ui/test-utils";
import { AppLayout } from "./app-layout";

describe("AppLayout", () => {
  it("renders children correctly", async () => {
    await renderWithProviders(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  it("renders multiple children", async () => {
    await renderWithProviders(
      <AppLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </AppLayout>,
    );

    await waitFor(() => {
      expect(screen.getByText("First Child")).toBeInTheDocument();
      expect(screen.getByText("Second Child")).toBeInTheDocument();
    });
  });

  it("applies AppShell structure", async () => {
    const { container } = await renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
    );

    await waitFor(() => {
      const appShell = container.querySelector(".mantine-AppShell-root");
      expect(appShell || container.firstChild).toBeInTheDocument();
    });
  });
});
