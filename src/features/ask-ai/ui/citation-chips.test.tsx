import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/shared/ui/test-utils";
import type { VenueChatSource } from "@/shared/api";
import { CitationChips } from "./citation-chips";

const SOURCE: VenueChatSource = {
  sourceTextId: "11111111-1111-1111-1111-111111111111",
  assetId: null,
  label: "Parking note",
  snippet: "Two levels of parking.",
  similarity: 0.9,
};

describe("CitationChips", () => {
  it("renders nothing when there are no sources", async () => {
    await renderWithProviders(<CitationChips sources={[]} onOpen={vi.fn()} />);

    expect(screen.queryByTestId("ai-citations")).not.toBeInTheDocument();
  });

  it("opens the clicked source", async () => {
    const onOpen = vi.fn();
    await renderWithProviders(<CitationChips sources={[SOURCE]} onOpen={onOpen} />);

    await userEvent.click(screen.getByTestId("ai-citation"));

    expect(onOpen).toHaveBeenCalledWith(SOURCE.sourceTextId);
  });
});
