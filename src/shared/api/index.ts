// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";
export { iamApi } from "./iam";
export type {
  IamUser,
  IamUserStatus,
  IamUserSortField,
  SortDirection,
  PagedResponse,
  ListIamUsersParams,
} from "./iam";
