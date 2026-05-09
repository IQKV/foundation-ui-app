import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/shared/ui";

export const Route = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});
