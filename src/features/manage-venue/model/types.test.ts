import { describe, expect, it } from "vitest";
import type { Venue } from "@/entities/venue";
import { buildVenueSchema, emptyVenueFormValues, toVenueFormValues, toWriteRequest } from "./types";

const PRIVATE_VENUE: Venue = {
  id: "v1",
  name: "Grand Hall",
  description: null,
  address: null,
  city: null,
  locationLat: null,
  locationLng: null,
  masterVenueId: null,
  visibility: "PRIVATE",
  metadata: null,
  primaryPhotoUrl: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("venue visibility mapping", () => {
  it("defaults new venues to PUBLIC", () => {
    expect(emptyVenueFormValues().visibility).toBe("PUBLIC");
  });

  it("carries a venue's visibility through the form and the write request", () => {
    const values = toVenueFormValues(PRIVATE_VENUE);
    expect(values.visibility).toBe("PRIVATE");
    expect(toWriteRequest(values).visibility).toBe("PRIVATE");
  });

  it("rejects an unknown visibility value", () => {
    const result = buildVenueSchema().safeParse({
      ...emptyVenueFormValues(),
      visibility: "SECRET",
    });
    expect(result.success).toBe(false);
  });
});
