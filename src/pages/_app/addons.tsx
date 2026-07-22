import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/addons")({
  component: AddonsRootPage,
});

function AddonsRootPage() {
  return <Outlet />;
}
