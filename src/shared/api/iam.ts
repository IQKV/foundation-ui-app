import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IamUserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";
export type IamTenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type IamUserSortField = "email" | "firstName" | "lastName" | "updatedAt" | "createdAt";
export type IamTenantSortField = "name" | "tenantKey" | "updatedAt" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface CountResponse {
  total: number;
}

export interface IamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: IamUserStatus;
  emailVerified: boolean;
  organizations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ListIamUsersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: IamUserStatus;
  sortBy?: IamUserSortField;
  sortDir?: SortDirection;
}

export interface IamTenant {
  id: string;
  tenantKey: string;
  name: string;
  status: IamTenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListIamTenantsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: IamTenantStatus;
  sortBy?: IamTenantSortField;
  sortDir?: SortDirection;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const iamApi = {
  countUsers: () => httpClient.get<CountResponse>("/v1/iam/admin/users/count").then((r) => r.data),

  listUsers: (params: ListIamUsersParams = {}) =>
    httpClient.get<PagedResponse<IamUser>>("/v1/iam/admin/users", { params }).then((r) => r.data),

  getUser: (id: string) => httpClient.get<IamUser>(`/v1/iam/admin/users/${id}`).then((r) => r.data),

  updateUser: (id: string, data: Partial<Pick<IamUser, "firstName" | "lastName" | "status">>) =>
    httpClient.patch<IamUser>(`/v1/iam/admin/users/${id}`, data).then((r) => r.data),

  deleteUser: (id: string) => httpClient.delete(`/v1/iam/admin/users/${id}`),

  countTenants: () =>
    httpClient.get<CountResponse>("/v1/iam/admin/tenants/count").then((r) => r.data),

  listTenants: (params: ListIamTenantsParams = {}) =>
    httpClient
      .get<PagedResponse<IamTenant>>("/v1/iam/admin/tenants", { params })
      .then((r) => r.data),

  getTenant: (tenantKey: string) =>
    httpClient.get<IamTenant>(`/v1/iam/admin/tenants/${tenantKey}`).then((r) => r.data),

  updateTenant: (tenantKey: string, data: Partial<Pick<IamTenant, "name" | "status">>) =>
    httpClient.patch<IamTenant>(`/v1/iam/admin/tenants/${tenantKey}`, data).then((r) => r.data),

  deleteTenant: (tenantKey: string) => httpClient.delete(`/v1/iam/admin/tenants/${tenantKey}`),
};
