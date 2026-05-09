import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IamUserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

export type IamUserSortField = "email" | "firstName" | "lastName" | "updatedAt" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface IamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: IamUserStatus;
  emailVerified: boolean;
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
  sortBy?: IamUserSortField;
  sortDir?: SortDirection;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const iamApi = {
  listUsers: (params: ListIamUsersParams = {}) =>
    httpClient.get<PagedResponse<IamUser>>("/v1/iam/admin/users", { params }).then((r) => r.data),

  getUser: (id: string) => httpClient.get<IamUser>(`/v1/iam/admin/users/${id}`).then((r) => r.data),

  updateUser: (id: string, data: Partial<Pick<IamUser, "firstName" | "lastName" | "status">>) =>
    httpClient.patch<IamUser>(`/v1/iam/admin/users/${id}`, data).then((r) => r.data),

  deleteUser: (id: string) => httpClient.delete(`/v1/iam/admin/users/${id}`),
};
