import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { screen } from "@testing-library/react";
import { useForm } from "@mantine/form";
import { renderWithProviders, TestSelectors } from "@/shared/ui/test-utils";
import { emptyVenueFormValues } from "../model";
import type { VenueFormValues } from "../model";
import { VenueFields } from "./venue-fields";

// VenueFields branches on the workspace type, which it reads from the session store.
const useSessionMock = vi.hoisted(() => vi.fn());
vi.mock("@/processes/session", () => ({ useSession: useSessionMock }));

// jsdom has no document.fonts; Mantine's autosize Textarea reads it on mount.
beforeAll(() => {
  if (!document.fonts) {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { addEventListener: () => {}, removeEventListener: () => {} },
    });
  }
});

function VenueFieldsHarness() {
  const form = useForm<VenueFormValues>({ initialValues: emptyVenueFormValues() });
  return <VenueFields form={form} />;
}

describe("VenueFields visibility", () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue({ isPersonalWorkspace: false });
  });

  it("disables the visibility choice in a personal workspace", async () => {
    useSessionMock.mockReturnValue({ isPersonalWorkspace: true });

    await renderWithProviders(<VenueFieldsHarness />);

    expect(screen.getByTestId(TestSelectors.VENUE_VISIBILITY_INPUT)).toBeDisabled();
  });

  it("lets the caller pick public or private in an organization workspace", async () => {
    await renderWithProviders(<VenueFieldsHarness />);

    expect(screen.getByTestId(TestSelectors.VENUE_VISIBILITY_INPUT)).toBeEnabled();
  });
});
