/**
 * Local field specification for the tenant venue `metadata` document.
 *
 * Field keys preserve the existing metadata row addresses. Card and subgroup
 * values are presentation-only and do not affect persisted metadata.
 */

export type MetadataFieldType =
  | "string"
  | "string_array"
  | "integer"
  | "decimal"
  | "boolean"
  | "enum"
  | "enum_multi"
  | "time"
  /** Repeated `{name, role}` coordinator rows — structured, so it has its own editor. */
  | "contacts"
  /** Repeated structured rows such as rooms, price lines, and technical specs. */
  | "record_array";

export interface MetadataRecordFieldDefinition {
  key: string;
  label: string;
  placeholder?: string;
  type?: "string" | "integer" | "decimal";
  unit?: string;
}

export interface MetadataFieldOption {
  value: string;
  label: string;
}

export interface MetadataFieldDefinition {
  /** Row address: first segment is the `group`, the rest the `field` (`capacity.max_total` → capacity / max_total). */
  key: string;
  label: string;
  type: MetadataFieldType;
  unit?: string;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  options?: MetadataFieldOption[];
  recordFields?: MetadataRecordFieldDefinition[];
  addLabel?: string;
  /** Rendered as a read-only chip; excluded from the edit drawer. */
  readOnly?: boolean;
}

export interface MetadataSectionDefinition {
  key: string;
  label: string;
  /** Logical tab key retained for compatibility with metadata consumers. */
  tab: string;
  /** Presentation card that contains this section without changing its storage address. */
  cardGroup: string;
  /** Optional smaller heading inside the presentation card. */
  subgroup?: string;
  order: number;
  fields: MetadataFieldDefinition[];
}

export interface MetadataTabDefinition {
  key: string;
  label: string;
}

export interface MetadataCardGroupDefinition {
  key: string;
  label: string;
  description: string;
}

/** Presentation groups may combine sections while their storage keys stay unchanged. */
export const METADATA_CARD_GROUPS: MetadataCardGroupDefinition[] = [
  {
    key: "venue",
    label: "The venue",
    description: "How you describe this space to a client.",
  },
  {
    key: "capacity",
    label: "Capacity & layout",
    description: "Numbers and physical detail extracted from the venue file.",
  },
  {
    key: "pricing",
    label: "Pricing & packages",
    description: "Rates, minimums, and what the hire fee covers.",
  },
  {
    key: "catering_technical",
    label: "Catering & technical",
    description: "Kitchen, production, and technical detail for the pitch.",
  },
  {
    key: "logistics",
    label: "Logistics & access",
    description: "Arrival, loading, parking, and event-day constraints.",
  },
  {
    key: "team_notes",
    label: "Notes for your team",
    description: "Internal context that should not appear in a client-facing brief.",
  },
  {
    key: "contacts_online",
    label: "Contacts & online",
    description: "People and public information associated with this venue.",
  },
];

export const METADATA_TABS: MetadataTabDefinition[] = [
  { key: "overview", label: "Overview" },
  { key: "capacity", label: "Capacity" },
  { key: "facilities", label: "Facilities" },
  { key: "logistics", label: "Logistics" },
  { key: "contacts", label: "Contacts" },
  { key: "pricing", label: "Pricing" },
  { key: "online", label: "Online" },
];

// Enum values double as the stored metadata value: the ingestion worker writes
// plain-English wording (not slugs), so the options must match it verbatim.
const VENUE_TYPE_OPTIONS: MetadataFieldOption[] = [
  { value: "Restaurant", label: "Restaurant" },
  { value: "Hotel", label: "Hotel" },
  { value: "Bar or lounge", label: "Bar or lounge" },
  { value: "Rooftop", label: "Rooftop" },
  { value: "Gallery", label: "Gallery" },
  { value: "Warehouse or industrial space", label: "Warehouse or industrial space" },
  { value: "Studio", label: "Studio" },
  { value: "Outdoor garden or terrace", label: "Outdoor garden or terrace" },
  { value: "Town hall or community centre", label: "Town hall or community centre" },
  { value: "Conference centre", label: "Conference centre" },
  { value: "Stadium or arena", label: "Stadium or arena" },
  { value: "Museum", label: "Museum" },
  { value: "Theatre or cinema", label: "Theatre or cinema" },
  { value: "Boat or yacht", label: "Boat or yacht" },
  { value: "Marquee, tipi or barn", label: "Marquee, tipi or barn" },
  { value: "Park, zoo or gardens", label: "Park, zoo or gardens" },
  { value: "Place of worship", label: "Place of worship" },
  { value: "Private members club", label: "Private members club" },
  { value: "Nightclub", label: "Nightclub" },
  { value: "Historic house or estate", label: "Historic house or estate" },
  { value: "Beach or coastal venue", label: "Beach or coastal venue" },
  { value: "Unclassified", label: "Unclassified" },
];

const CATERING_POLICY_OPTIONS: MetadataFieldOption[] = [
  { value: "In-house catering only", label: "In-house catering only" },
  { value: "External catering only", label: "External catering only" },
  {
    value: "In-house and external catering both allowed",
    label: "In-house and external catering both allowed",
  },
  { value: "Catering not specified", label: "Catering not specified" },
];

export const METADATA_SECTIONS: MetadataSectionDefinition[] = [
  {
    key: "venue_profile",
    label: "Profile details",
    tab: "overview",
    cardGroup: "venue",
    subgroup: "Profile",
    order: 0,
    fields: [
      {
        key: "profile.category",
        label: "Category",
        type: "enum",
        options: VENUE_TYPE_OPTIONS,
      },
      { key: "profile.country", label: "Country", type: "string" },
      { key: "profile.positioning_line", label: "Positioning line", type: "string" },
      {
        key: "profile.search_tags",
        label: "Search tags",
        type: "string_array",
        hint: "Comma separated — used to find this venue later.",
      },
    ],
  },
  {
    key: "basic",
    label: "Basic info",
    tab: "overview",
    cardGroup: "venue",
    subgroup: "Description & discovery",
    order: 1,
    fields: [
      {
        key: "location_notes",
        label: "Location notes",
        type: "string",
        placeholder: "Walking distance from transport, freight access…",
        hint: "Context not captured by the address.",
      },
      {
        key: "amenities",
        label: "Amenities",
        type: "string_array",
        placeholder: "Rooftop terrace, Built-in bar, Green room",
        hint: "Free-text tags shown in search results.",
      },
    ],
  },
  {
    key: "venue_type",
    label: "Additional venue types",
    tab: "overview",
    cardGroup: "venue",
    subgroup: "Additional categories",
    order: 2,
    fields: [
      {
        key: "venue_type",
        label: "Additional venue types",
        type: "enum_multi",
        options: VENUE_TYPE_OPTIONS,
      },
    ],
  },
  {
    key: "restrictions",
    label: "Restrictions",
    tab: "overview",
    cardGroup: "venue",
    subgroup: "Restrictions",
    order: 3,
    fields: [
      {
        key: "restrictions",
        label: "Restrictions",
        type: "string_array",
        placeholder: "No open flame, No confetti, No outside alcohol",
        hint: "Hard restrictions that may block event planning.",
      },
    ],
  },
  {
    key: "cap_total",
    label: "Total capacity",
    tab: "capacity",
    cardGroup: "capacity",
    subgroup: "Overall capacity",
    order: 1,
    fields: [
      {
        key: "capacity.max_total",
        label: "Maximum capacity",
        type: "integer",
        unit: "guests",
        min: 1,
        hint: "Maximum headcount across all configurations.",
      },
    ],
  },
  {
    key: "cap_configs",
    label: "Configuration breakdown",
    tab: "capacity",
    cardGroup: "capacity",
    subgroup: "Configurations",
    order: 2,
    fields: [
      {
        key: "capacity.configurations.banquet",
        label: "Banquet / seated dinner",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.theater",
        label: "Theatre / lecture",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.classroom",
        label: "Classroom",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.cocktail",
        label: "Cocktail / standing",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.conference",
        label: "Conference / boardroom",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.seated",
        label: "Seated",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.standing",
        label: "Standing",
        type: "integer",
        unit: "guests",
        min: 1,
      },
    ],
  },
  {
    key: "room_areas",
    label: "Rooms & areas",
    tab: "capacity",
    cardGroup: "capacity",
    subgroup: "Rooms & areas",
    order: 3,
    fields: [
      {
        key: "capacity.rooms",
        label: "Rooms & areas",
        type: "record_array",
        addLabel: "Add a room",
        recordFields: [
          { key: "name", label: "Room name", placeholder: "Main floor" },
          { key: "seated", label: "Seated", type: "integer", placeholder: "300" },
          { key: "standing", label: "Standing", type: "integer", placeholder: "800" },
          { key: "notes", label: "Notes", placeholder: "Uncolumned, 9 m clearance" },
        ],
      },
    ],
  },
  {
    key: "floor_access",
    label: "Floor plan & access",
    tab: "capacity",
    cardGroup: "capacity",
    subgroup: "Floor plan & access",
    order: 4,
    fields: [
      {
        key: "capacity.floor_plan_access",
        label: "Floor plan & access",
        type: "string",
        hint: "Vehicle access, loading, and floor-plan constraints.",
      },
    ],
  },
  {
    key: "catering",
    label: "Catering",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "Catering & bar",
    order: 1,
    fields: [
      {
        key: "catering.policy",
        label: "Catering policy",
        type: "enum",
        options: CATERING_POLICY_OPTIONS,
      },
      {
        key: "catering.notes",
        label: "Catering & bar",
        type: "string",
        hint: "Kitchen facilities, alcohol permissions, and service arrangements.",
      },
      { key: "catering.kosher_available", label: "Kosher available", type: "boolean" },
      { key: "catering.halal_available", label: "Halal available", type: "boolean" },
      { key: "catering.vegan_available", label: "Vegan menu available", type: "boolean" },
    ],
  },
  {
    key: "catering_formats",
    label: "Catering formats",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "Catering formats",
    order: 2,
    fields: [
      {
        key: "catering.formats",
        label: "Catering formats",
        type: "string_array",
        placeholder: "Food trucks, Seated dinner, Open bar",
      },
    ],
  },
  {
    key: "av",
    label: "AV & technology",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "AV & technology",
    order: 3,
    fields: [
      { key: "av_tech.built_in_av", label: "Built-in AV system", type: "boolean" },
      {
        key: "av_tech.projector_lumens",
        label: "Projector brightness",
        type: "integer",
        unit: "lm",
        min: 0,
      },
      { key: "av_tech.screens", label: "Number of screens", type: "integer", min: 0 },
      {
        key: "av_tech.rigging_points",
        label: "Rigging points",
        type: "boolean",
        hint: "Structural anchor points for hanging lights or décor.",
      },
      {
        key: "av_tech.internet_bandwidth_mbps",
        label: "Internet bandwidth",
        type: "integer",
        unit: "Mbps",
        min: 0,
      },
    ],
  },
  {
    key: "technical",
    label: "Technical notes & specifications",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "Technical notes & specifications",
    order: 4,
    fields: [
      {
        key: "technical.notes",
        label: "Technical notes",
        type: "string",
        hint: "Production capabilities, restrictions, and supplier arrangements.",
      },
      {
        key: "technical.specifications",
        label: "Technical specifications",
        type: "record_array",
        addLabel: "Add a specification",
        recordFields: [
          { key: "name", label: "Specification", placeholder: "Clearance" },
          { key: "value", label: "Details", placeholder: "9 m under trusses" },
        ],
      },
    ],
  },
  {
    key: "accessibility",
    label: "Accessibility",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "Accessibility",
    order: 5,
    fields: [
      { key: "accessibility.ada_compliant", label: "ADA / wheelchair compliant", type: "boolean" },
      { key: "accessibility.elevator_access", label: "Elevator access", type: "boolean" },
      { key: "accessibility.accessible_restrooms", label: "Accessible restrooms", type: "boolean" },
      {
        key: "accessibility.wheelchair_stage_access",
        label: "Wheelchair stage access",
        type: "boolean",
      },
    ],
  },
  {
    key: "outdoor",
    label: "Outdoor space",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "Outdoor space",
    order: 6,
    fields: [
      { key: "outdoor_space.available", label: "Outdoor space available", type: "boolean" },
      { key: "outdoor_space.covered", label: "Covered / sheltered", type: "boolean" },
      { key: "outdoor_space.sqm", label: "Outdoor area", type: "integer", unit: "m²", min: 0 },
    ],
  },
  {
    key: "exclusivity",
    label: "Exclusivity",
    tab: "facilities",
    cardGroup: "catering_technical",
    subgroup: "Exclusivity",
    order: 7,
    fields: [
      { key: "exclusivity.exclusive_use", label: "Exclusive use available", type: "boolean" },
      {
        key: "exclusivity.shared_space",
        label: "Shared space (concurrent events)",
        type: "boolean",
      },
    ],
  },
  {
    key: "logistics",
    label: "Logistics",
    tab: "logistics",
    cardGroup: "logistics",
    subgroup: "Logistics",
    order: 1,
    fields: [
      {
        key: "logistics.load_in_access",
        label: "Load-in access",
        type: "string",
        placeholder: "Freight elevator, ground-floor rear access…",
      },
      {
        key: "logistics.parking_spaces",
        label: "Parking spaces",
        type: "integer",
        unit: "spaces",
        min: 0,
      },
      { key: "logistics.valet_available", label: "Valet available", type: "boolean" },
      {
        key: "logistics.curfew_time",
        label: "Noise curfew",
        type: "time",
        hint: "Latest time amplified activity is permitted (24-hour HH:mm).",
      },
      {
        key: "logistics.setup_hours_before",
        label: "Setup time",
        type: "decimal",
        unit: "hours before event",
        min: 0,
      },
      {
        key: "logistics.teardown_hours_after",
        label: "Teardown time",
        type: "decimal",
        unit: "hours after event",
        min: 0,
      },
    ],
  },
  {
    key: "team_notes",
    label: "Team notes",
    tab: "overview",
    cardGroup: "team_notes",
    subgroup: "Team notes",
    order: 4,
    fields: [
      {
        key: "team.notes",
        label: "Notes for your team",
        type: "string",
        hint: "Internal context for colleagues, not the client-facing pitch.",
      },
    ],
  },
  {
    key: "contacts",
    label: "Contacts",
    tab: "contacts",
    cardGroup: "contacts_online",
    subgroup: "Contacts",
    order: 1,
    fields: [
      {
        key: "contacts",
        label: "Contacts",
        type: "contacts",
        hint: "Venue coordinators and sales managers.",
      },
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    tab: "pricing",
    cardGroup: "pricing",
    subgroup: "Pricing",
    order: 1,
    fields: [
      {
        key: "pricing.minimum_spend",
        label: "Minimum spend",
        type: "decimal",
        hint: "Minimum F&B or hire spend required to book the space.",
      },
      {
        key: "pricing.currency",
        label: "Currency",
        type: "string",
        placeholder: "USD",
        hint: "ISO 4217 currency code.",
      },
      {
        key: "pricing.rental_fee_indicative",
        label: "Hire from",
        type: "decimal",
        min: 0,
        hint: "Indicative starting hire fee — not a confirmed quote.",
      },
      {
        key: "pricing.price_lines",
        label: "Price lines",
        type: "record_array",
        addLabel: "Add a price line",
        recordFields: [
          { key: "name", label: "Price line", placeholder: "Main floor, exclusive" },
          { key: "amount", label: "Amount", type: "decimal", placeholder: "4200" },
          { key: "unit", label: "Unit", placeholder: "per day" },
        ],
      },
      {
        key: "pricing.commercial_terms",
        label: "Commercial terms",
        type: "string",
        hint: "Deposits, inclusions, setup, breakdown, and cancellation terms.",
      },
    ],
  },
  {
    key: "social",
    label: "Social & maps",
    tab: "online",
    cardGroup: "contacts_online",
    subgroup: "Social & maps",
    order: 1,
    fields: [
      { key: "social.instagram_handle", label: "Instagram", type: "string", placeholder: "@venue" },
      {
        key: "social.google_place_id",
        label: "Google Place ID",
        type: "string",
        placeholder: "ChIJ…",
        hint: "Used to pull live ratings and the map pin.",
      },
    ],
  },
  {
    key: "ratings",
    label: "Ratings",
    tab: "online",
    cardGroup: "contacts_online",
    subgroup: "Ratings",
    order: 2,
    fields: [
      {
        key: "ratings.google_rating",
        label: "Google rating",
        type: "decimal",
        min: 0,
        max: 5,
        hint: "0.0 – 5.0.",
      },
      {
        key: "ratings.google_review_count",
        label: "Google review count",
        type: "integer",
        min: 0,
      },
    ],
  },
];
