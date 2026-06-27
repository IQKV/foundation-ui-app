import { httpClient } from "./http-client";
import type {
  CmsPage,
  CmsPageStatus,
  CmsPageSummary,
  CmsPageSummaryListResponse,
  CmsPageTranslation,
  CmsPageTranslationRequest,
  CmsPageHierarchyItem,
  CreateCmsPageRequest,
  UpdateCmsPageRequest,
  ListCmsPageParams,
} from "@/entities/cms-page";

// Re-export entity types so existing imports from "@/shared/api" keep working.
export type {
  CmsPage,
  CmsPageStatus,
  CmsPageSummary,
  CmsPageSummaryListResponse,
  CmsPageTranslation,
  CmsPageTranslationRequest,
  CmsPageHierarchyItem,
  CreateCmsPageRequest,
  UpdateCmsPageRequest,
  ListCmsPageParams,
};

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
