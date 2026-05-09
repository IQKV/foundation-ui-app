import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ListUsersParams {
  page?: number;
  size?: number;
  search?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const iamAdminApi = {
  listUsers: (params: ListUsersParams = {}) =>
    httpClient.get<PagedResponse<AdminUser>>("/v1/iam/admin/users", { params }).then((r) => r.data),

  getUser: (id: string) =>
    httpClient.get<AdminUser>(`/v1/iam/admin/users/${id}`).then((r) => r.data),

  updateUser: (
    id: string,
    data: Partial<Pick<AdminUser, "firstName" | "lastName" | "email" | "status">>,
  ) => httpClient.patch<AdminUser>(`/v1/iam/admin/users/${id}`, data).then((r) => r.data),

  deleteUser: (id: string) => httpClient.delete(`/v1/iam/admin/users/${id}`),
};
