export type CmsPageStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";

export interface CmsPageTranslation {
  locale: string;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOpenGraphTitle: string | null;
  seoOpenGraphDescription: string | null;
  seoCanonicalUrl: string | null;
}

export interface CmsPage {
  id: string;
  slug: string;
  parentId: string | null;
  template: string | null;
  status: CmsPageStatus;
  createdAt: string;
  updatedAt: string;
  translations: CmsPageTranslation[];
}

/** Lightweight summary row returned by the list endpoint (en-US fallback title included). */
export interface CmsPageSummary {
  id: string;
  slug: string;
  parentId: string | null;
  template: string | null;
  status: CmsPageStatus;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsPageSummaryListResponse {
  items: CmsPageSummary[];
  totalElements: number;
}

export interface CmsPageHierarchyItem {
  id: string;
  slug: string;
  parentId: string | null;
  title: string | null;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CmsPageTranslationRequest {
  locale: string;
  title: string;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOpenGraphTitle?: string | null;
  seoOpenGraphDescription?: string | null;
  seoCanonicalUrl?: string | null;
}

export interface CreateCmsPageRequest {
  slug: string;
  parentId?: string | null;
  template?: string | null;
  status: CmsPageStatus;
  translations: CmsPageTranslationRequest[];
}

export interface UpdateCmsPageRequest {
  slug: string;
  parentId?: string | null;
  template?: string | null;
  status: CmsPageStatus;
  translations: CmsPageTranslationRequest[];
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ListCmsPageParams {
  limit?: number;
  offset?: number;
}
