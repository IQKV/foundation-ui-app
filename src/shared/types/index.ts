export interface GenericDataResponse<T> {
  data: T;
  errors?: Record<string, string>;
}

// ─── Pagination primitives ────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
