import { t } from "@lingui/core/macro";
import type { CmsPageStatus } from "@/shared/api";
import { z } from "zod";

export function buildPageTranslationSchema() {
  return z.object({
    locale: z.string().min(1, t`Locale is required`),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    seoOpenGraphTitle: z.string().nullable().optional(),
    seoOpenGraphDescription: z.string().nullable().optional(),
    seoCanonicalUrl: z.string().nullable().optional(),
  });
}

export function buildPageSchema(defaultLocale?: string) {
  return z.object({
    slug: z
      .string()
      .min(1, t`Slug is required`)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
        t`Slug must be lowercase alphanumeric with hyphens (e.g. about-us or blog/post-title)`,
      ),
    parentId: z
      .string()
      .uuid(t`Must be a valid UUID`)
      .nullable()
      .optional(),
    template: z.string().nullable().optional(),
    status: z.string() as z.ZodType<CmsPageStatus>,
    translations: z
      .array(buildPageTranslationSchema())
      .min(1, t`At least one translation is required`)
      .superRefine((translations, ctx) => {
        translations.forEach((tr, index) => {
          const isDefault = defaultLocale
            ? tr.locale.toLowerCase() === defaultLocale.toLowerCase()
            : true;
          if (isDefault) {
            if (!tr.title || tr.title.trim() === "") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [index, "title"],
                message: t`Title is required for the default locale`,
              });
            }
            if (!tr.content || tr.content.trim() === "") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [index, "content"],
                message: t`Content is required for the default locale`,
              });
            }
          }
        });
      }),
  });
}

export type PageTranslationFormValues = z.infer<ReturnType<typeof buildPageTranslationSchema>>;
export type PageFormValues = z.infer<ReturnType<typeof buildPageSchema>>;

export const PAGE_STATUS_OPTIONS: { value: CmsPageStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export function getPageStatusOptions(): { value: CmsPageStatus; label: string }[] {
  return [
    { value: "DRAFT", label: t`Draft` },
    { value: "PENDING", label: t`Pending` },
    { value: "PUBLISHED", label: t`Published` },
    { value: "ARCHIVED", label: t`Archived` },
  ];
}

export function getEditablePageStatusOptions(): { value: CmsPageStatus; label: string }[] {
  return [
    { value: "DRAFT", label: t`Draft` },
    { value: "PENDING", label: t`Pending` },
  ];
}

export const EMPTY_TRANSLATION: PageTranslationFormValues = {
  locale: "",
  title: "",
  content: "",
  seoTitle: null,
  seoDescription: null,
  seoOpenGraphTitle: null,
  seoOpenGraphDescription: null,
  seoCanonicalUrl: null,
};
