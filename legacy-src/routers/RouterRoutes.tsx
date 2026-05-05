import { Route } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import { Seo } from "../seo/Seo";
import { ProtectedRoute, PublicRoute } from "./RouteGuards";
import { fallbackRoute, protectedRoutes, publicRoutes } from "./routes";

export function RouterRoutes() {
  return (
    <>
      {publicRoutes.map((route) => (
        <Route
          path={route.path}
          component={() => (
            <PublicRoute>
              <Seo meta={route.seo} />
              <Dynamic component={route.component} />
            </PublicRoute>
          )}
        />
      ))}
      {protectedRoutes.map((route) => (
        <Route
          path={route.path}
          component={() => (
            <ProtectedRoute>
              <Seo meta={route.seo} />
              <Dynamic component={route.component} />
            </ProtectedRoute>
          )}
        />
      ))}
      <Route
        path={fallbackRoute.path}
        component={() => (
          <>
            <Seo meta={fallbackRoute.seo} />
            <Dynamic component={fallbackRoute.component} />
          </>
        )}
      />
    </>
  );
}
