import { t } from "@lingui/core/macro";
import { z } from "zod";
import type { Venue } from "@/entities/venue";
import type { VenueWriteRequest } from "@/shared/api";

/** Numeric text field that accepts an empty value (→ null) or a finite number. */
const optionalNumeric = (message: string) =>
  z.string().refine((value) => value.trim() === "" || Number.isFinite(Number(value)), message);

export function buildVenueSchema() {
  return z.object({
    name: z.string().min(1, t`Name is required`),
    description: z.string(),
    address: z.string(),
    city: z.string(),
    locationLat: optionalNumeric(t`Latitude must be a number`),
    locationLng: optionalNumeric(t`Longitude must be a number`),
    // Empty means "not linked"; otherwise a master-catalog venue UUID.
    masterVenueId: z
      .string()
      .refine(
        (value) =>
          value.trim() === "" ||
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim()),
        t`Must be a valid UUID`,
      ),
  });
}

export type VenueFormValues = z.infer<ReturnType<typeof buildVenueSchema>>;

export function emptyVenueFormValues(): VenueFormValues {
  return {
    name: "",
    description: "",
    address: "",
    city: "",
    locationLat: "",
    locationLng: "",
    masterVenueId: "",
  };
}

export function toVenueFormValues(venue: Venue): VenueFormValues {
  return {
    name: venue.name,
    description: venue.description ?? "",
    address: venue.address ?? "",
    city: venue.city ?? "",
    locationLat: venue.locationLat === null ? "" : String(venue.locationLat),
    locationLng: venue.locationLng === null ? "" : String(venue.locationLng),
    masterVenueId: venue.masterVenueId ?? "",
  };
}

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

function toOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function toWriteRequest(values: VenueFormValues): VenueWriteRequest {
  return {
    name: values.name.trim(),
    description: toOptionalString(values.description),
    address: toOptionalString(values.address),
    city: toOptionalString(values.city),
    locationLat: toOptionalNumber(values.locationLat),
    locationLng: toOptionalNumber(values.locationLng),
    // shortcut: free-text master venue id, upgrade to an autocomplete when master-catalog browse lands
    masterVenueId: toOptionalString(values.masterVenueId),
  };
}
