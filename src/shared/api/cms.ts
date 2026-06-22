import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface ListCmsPageParams {
  limit?: number;
  offset?: number;
}

// ─── Tenant-scoped CMS API ────────────────────────────────────────────────────
// Endpoints live at /v1/cms/tenant/pages — tenant context comes from the JWT
// tenant_id claim (set by TenantExtractionFilter); no tenantKey in the path.

export const cmsApi = {
  listPages: (params: ListCmsPageParams = {}) =>
    httpClient
      .get<CmsPageSummaryListResponse>("/v1/cms/tenant/pages", { params })
      .then((r) => r.data),

  getPage: (id: string) =>
    httpClient.get<CmsPage>(`/v1/cms/tenant/pages/${id}`).then((r) => r.data),

  createPage: (data: CreateCmsPageRequest) =>
    httpClient.post<CmsPage>("/v1/cms/tenant/pages", data).then((r) => r.data),

  updatePage: (id: string, data: UpdateCmsPageRequest) =>
    httpClient.put<CmsPage>(`/v1/cms/tenant/pages/${id}`, data).then((r) => r.data),

  deletePage: (id: string) => httpClient.delete(`/v1/cms/tenant/pages/${id}`),

  listPageHierarchy: () =>
    httpClient.get<CmsPageHierarchyItem[]>("/v1/cms/tenant/pages/hierarchy").then((r) => r.data),
};
