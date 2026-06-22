import {
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Text,
  Box,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { UseFormReturnType } from "@mantine/form";
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { EMPTY_TRANSLATION } from "../model";
import type { PageFormValues } from "../model";
import { RichContentEditor } from "./rich-content-editor";

interface LocaleOption {
  value: string;
  label: string;
}

interface PageTranslationFieldsProps {
  form: UseFormReturnType<PageFormValues>;
  locales: LocaleOption[];
  defaultLocale?: string;
  disabled?: boolean;
}

function SeoSection({
  form,
  index,
  disabled,
}: {
  form: UseFormReturnType<PageFormValues>;
  index: number;
  disabled?: boolean;
}) {
  const { t } = useLingui();
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Box>
      <UnstyledButton
        onClick={toggle}
        style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}
      >
        <Text size="xs" c="dimmed" fw={500}>
          <Trans>SEO fields</Trans>
        </Text>
        {opened ? (
          <IconChevronUp size={12} color="gray" />
        ) : (
          <IconChevronDown size={12} color="gray" />
        )}
      </UnstyledButton>
      <Collapse expanded={opened}>
        <Stack gap="xs">
          <TextInput
            label={t`SEO title`}
            placeholder={t`Override page title for search engines`}
            size="sm"
            disabled={disabled}
            {...form.getInputProps(`translations.${index}.seoTitle`)}
          />
          <Textarea
            label={t`SEO description`}
            placeholder={t`Meta description for search engines`}
            size="sm"
            minRows={2}
            autosize
            disabled={disabled}
            {...form.getInputProps(`translations.${index}.seoDescription`)}
          />
          <TextInput
            label={t`OG title`}
            placeholder={t`Open Graph title`}
            size="sm"
            disabled={disabled}
            {...form.getInputProps(`translations.${index}.seoOpenGraphTitle`)}
          />
          <Textarea
            label={t`OG description`}
            placeholder={t`Open Graph description`}
            size="sm"
            minRows={2}
            autosize
            disabled={disabled}
            {...form.getInputProps(`translations.${index}.seoOpenGraphDescription`)}
          />
          <TextInput
            label={t`Canonical URL`}
            placeholder="https://example.com/page"
            size="sm"
            disabled={disabled}
            {...form.getInputProps(`translations.${index}.seoCanonicalUrl`)}
          />
        </Stack>
      </Collapse>
    </Box>
  );
}

export function PageTranslationFields({
  form,
  locales,
  defaultLocale,
  disabled,
}: PageTranslationFieldsProps) {
  const { t } = useLingui();

  const usedLocales = form.values.translations.map((tr) => tr.locale);
  const availableLocales = locales.filter((loc) => !usedLocales.includes(loc.value));

  const handleAddTranslation = () => {
    const nextLocale = availableLocales[0]?.value ?? "";
    form.insertListItem("translations", { ...EMPTY_TRANSLATION, locale: nextLocale });
  };

  const handleRemoveTranslation = (index: number) => {
    form.removeListItem("translations", index);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={600}>
          <Trans>Translations</Trans>
        </Text>
        {!disabled && (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={13} />}
            onClick={handleAddTranslation}
            disabled={availableLocales.length === 0}
          >
            <Trans>Add locale</Trans>
          </Button>
        )}
      </Group>

      {form.values.translations.map((_, index) => {
        const currentLocale = form.values.translations[index].locale;
        const isDefault = defaultLocale
          ? currentLocale.toLowerCase() === defaultLocale.toLowerCase()
          : true;
        const otherUsedLocales = form.values.translations
          .filter((_, i) => i !== index)
          .map((tr) => tr.locale);
        const localeOptions = locales.filter((loc) => !otherUsedLocales.includes(loc.value));
        const contentInputProps = form.getInputProps(`translations.${index}.content`);

        return (
          <Box
            key={index}
            p="md"
            style={{
              border: `1px solid ${isDefault ? "var(--mantine-color-blue-3)" : "var(--mantine-color-gray-2)"}`,
              borderRadius: "var(--mantine-radius-sm)",
              background: isDefault ? "var(--mantine-color-blue-0)" : undefined,
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <Select
                  size="xs"
                  style={{ width: 260 }}
                  data={localeOptions}
                  disabled={isDefault || disabled}
                  description={isDefault ? t`Default locale — required` : t`Optional translation`}
                  {...form.getInputProps(`translations.${index}.locale`)}
                />
                {!isDefault && !disabled && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => handleRemoveTranslation(index)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Group>

              <TextInput
                label={t`Title`}
                placeholder={t`Page title`}
                size="sm"
                required={isDefault}
                disabled={disabled}
                {...form.getInputProps(`translations.${index}.title`)}
              />

              <RichContentEditor
                label={t`Content`}
                value={contentInputProps.value as string | null | undefined}
                onChange={(html) => form.setFieldValue(`translations.${index}.content`, html)}
                error={contentInputProps.error as string | null | undefined}
                required={isDefault}
                disabled={disabled}
              />

              <SeoSection form={form} index={index} disabled={disabled} />
            </Stack>
          </Box>
        );
      })}

      {form.values.translations.length === 0 && (
        <Text size="xs" c="dimmed">
          <Trans>No translations added. At least the default locale is required.</Trans>
        </Text>
      )}
    </Stack>
  );
}
