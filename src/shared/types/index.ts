export interface GenericDataResponse<T> {
  data: T;
  errors?: Record<string, string>;
}
