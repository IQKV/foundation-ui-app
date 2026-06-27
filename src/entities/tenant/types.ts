export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface Tenant {
  id: string;
  tenantKey: string;
  name: string;
  status: TenantStatus;
  isPersonal: boolean;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateTenantRequest {
  name: string;
}

export interface CreateTenantResponse {
  id: string;
  tenantKey: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantRequest {
  name: string;
}

export interface UpdateTenantStatusRequest {
  status: TenantStatus;
}
