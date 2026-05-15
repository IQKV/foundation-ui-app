import { AuthGuard } from "./auth-guard";

interface TenantOwnerOnlyProps {
  children: React.ReactNode;
  /** Rendered for authenticated non-owners. Defaults to null. */
  fallback?: React.ReactNode;
}

/**
 * Renders `children` only for users with the TENANT_OWNER authority.
 * Shows a spinner while the session is loading, renders `fallback` (default: null)
 * for authenticated non-owners.
 *
 * Thin convenience wrapper around `<AuthGuard requireOwner>`.
 *
 * @example — hide a button from non-owners
 * ```tsx
 * <TenantOwnerOnly>
 *   <Button color="red">Delete workspace</Button>
 * </TenantOwnerOnly>
 * ```
 *
 * @example — show different UI per role
 * ```tsx
 * <TenantOwnerOnly fallback={<MemberView />}>
 *   <OwnerView />
 * </TenantOwnerOnly>
 * ```
 */
export function TenantOwnerOnly({ children, fallback }: TenantOwnerOnlyProps) {
  return (
    <AuthGuard requireOwner fallback={fallback}>
      {children}
    </AuthGuard>
  );
}
