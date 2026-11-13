import {
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Paper,
  Group,
  Text,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useLingui } from "@lingui/react/macro";
import { IconBuildingStore, IconMapPin } from "@tabler/icons-react";
import { TestSelectors } from "@/shared/lib/test-selectors";
import type { VenueFormValues } from "../model";
import { SECTION_CARD_STYLES } from "./section-accent";

interface VenueFieldsProps {
  form: UseFormReturnType<VenueFormValues>;
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, hint, children }: SectionCardProps) {
  return (
    <Paper shadow="sm" radius="md" p="lg" withBorder styles={SECTION_CARD_STYLES}>
      <Stack gap="lg">
        <Group gap="sm" align="flex-start">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-blue-0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <Stack gap={2}>
            <Text size="md" fw={700} lh={1.2}>
              {title}
            </Text>
            <Text size="xs" c="dimmed" lh={1.45}>
              {hint}
            </Text>
          </Stack>
        </Group>
        <Stack gap="md">{children}</Stack>
      </Stack>
    </Paper>
  );
}

/** Shared create/edit form fields for a tenant venue. */
export function VenueFields({ form }: VenueFieldsProps) {
  const { t } = useLingui();

  return (
    <Stack gap="md">
      <SectionCard
        icon={<IconBuildingStore size={18} color="var(--mantine-color-blue-6)" />}
        title={t`Identity`}
        hint={t`The venue's name and address as it appears in your workspace.`}
      >
        <TextInput
          label={t`Name`}
          withAsterisk
          data-testid={TestSelectors.VENUE_NAME_INPUT}
          {...form.getInputProps("name")}
        />
        <Textarea
          label={t`Description`}
          description={t`Short "About" line shown under the venue's name.`}
          autosize
          minRows={2}
          maxRows={5}
          data-testid={TestSelectors.VENUE_DESCRIPTION_INPUT}
          {...form.getInputProps("description")}
        />
        <TextInput
          label={t`Address`}
          data-testid={TestSelectors.VENUE_ADDRESS_INPUT}
          {...form.getInputProps("address")}
        />
        <TextInput
          label={t`City`}
          data-testid={TestSelectors.VENUE_CITY_INPUT}
          {...form.getInputProps("city")}
        />
      </SectionCard>

      <SectionCard
        icon={<IconMapPin size={18} color="var(--mantine-color-blue-6)" />}
        title={t`Coordinates`}
        hint={t`Decimal lat / lng used for map pins and geo search. Leave blank if unknown.`}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <NumberInput
            label={t`Latitude`}
            data-testid={TestSelectors.VENUE_LATITUDE_INPUT}
            value={form.values.locationLat}
            error={form.errors.locationLat}
            onChange={(value) =>
              form.setFieldValue("locationLat", value === "" ? "" : String(value))
            }
          />
          <NumberInput
            label={t`Longitude`}
            data-testid={TestSelectors.VENUE_LONGITUDE_INPUT}
            value={form.values.locationLng}
            error={form.errors.locationLng}
            onChange={(value) =>
              form.setFieldValue("locationLng", value === "" ? "" : String(value))
            }
          />
        </SimpleGrid>
      </SectionCard>
    </Stack>
  );
}
