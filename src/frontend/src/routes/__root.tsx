import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isShared = pathname.startsWith("/shared/");

  if (isShared) {
    return <Outlet />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
