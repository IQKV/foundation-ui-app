import { t } from "@lingui/core/macro";

/** One selectable assistant persona; `id` is the key sent with a turn, `null` for the base assistant. */
export interface AiPersona {
  id: string | null;
  label: string;
}

/**
 * Personas the backend can apply. Must stay in step with
 * `iqkv.catalog.venue-ask.personas`; a key the server does not know falls back to the base
 * assistant, so drift is graceful rather than an error.
 *
 * Built by a factory so the `t` macros capture the active locale (per i18n conventions).
 */
export function getPersonas(): AiPersona[] {
  return [
    { id: null, label: t`Default` },
    { id: "concierge", label: t`Concierge` },
    { id: "compliance", label: t`Compliance` },
  ];
}
