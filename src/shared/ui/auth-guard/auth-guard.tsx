import { Center, Loader } from "@mantine/core";
import { useSession } from "@/processes/session";

interface AuthGuardProps {
  /** Content to render when the auth check passes. */
  children: React.ReactNode;
  /**
   * When true, also requires the TENANT_OWNER authority.
   * Renders `fallback` (or null) for authenticated non-owners.
   */
  requireOwner?: boolean;
  /**
   * Rendered while the session is loading (silent-refresh in flight).
   * Defaults to a centered Mantine Loader.
   */
  loadingFallback?: React.ReactNode;
  /**
   * Rendered when the user is authenticated but does not meet the authority
   * requirement (e.g. not TENANT_OWNER). Defaults to null (renders nothing).
   */
  fallback?: React.ReactNode;
}

/**
 * Wraps content that requires an authenticated tenant session.
 *
 * - While the silent-refresh is in flight (`isLoading`): renders `loadingFallback`
 *   (default: centered spinner) — prevents flashing unauthorized content.
 * - Not authenticated: renders null (the route guard will redirect; this is a
 *   safety net for in-component use).
 * - Authenticated but `requireOwner` is true and user is not TENANT_OWNER:
 *   renders `fallback` (default: null).
 * - All checks pass: renders `children`.
 *
 * @example — protect a whole section
 * ```tsx
 * <AuthGuard requireOwner>
 *   <DangerZone />
 * </AuthGuard>
 * ```
 *
 * @example — custom loading state
 * ```tsx
 * <AuthGuard loadingFallback={<Skeleton />}>
 *   <ProfileCard />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requireOwner = false,
  loadingFallback,
  fallback = null,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated, isTenantOwner } = useSession();

  if (isLoading) {
    return (
      <>
        {loadingFallback ?? (
          <Center py="xl" data-testid="auth-guard-loader">
            <Loader size="sm" />
          </Center>
        )}
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireOwner && !isTenantOwner) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
