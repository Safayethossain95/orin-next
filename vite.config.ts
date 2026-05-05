import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import solid from "vite-plugin-solid";

import { siteConfig } from "./site.config";

const resolveAppPath = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));
const DEFAULT_DEV_PORT = 3014;
const localDevCors = {
  origin: [
    /^https?:\/\/localhost(?::\d+)?$/,
    /^https?:\/\/[^/]+\.localhost(?::\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
    /^https?:\/\/0\.0\.0\.0(?::\d+)?$/,
    /^https?:\/\/\[::1\](?::\d+)?$/,
  ],
  credentials: true,
};

function toNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function orinThemeManifestPlugin(): Plugin {
  return {
    name: "orin-theme-manifest",
    apply: "build",
    closeBundle() {
      const distDir = resolveAppPath("./dist");
      const assetsDir = join(distDir, "assets");
      const css = existsSync(assetsDir)
        ? readdirSync(assetsDir)
            .filter((fileName) => fileName.endsWith(".css"))
            .sort()
            .map((fileName) => `assets/${fileName}`)
        : [];

      const manifest = {
        id: siteConfig.app.key,
        version: siteConfig.app.version,
        framework: "solid",
        clientEntry: "remote-entry.js",
        css,
        hydrateExport: "mount",
        routeMode: "spa",
      };

      writeFileSync(
        join(distDir, "manifest.json"),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
    },
  };
}

export default defineConfig(({ command }) => {
  const graphqlSchemaUrl =
    process.env.VITE_GRAPHQL_SCHEMA_URL ||
    process.env.GRAPHQL_SCHEMA ||
    siteConfig.vite.graphqlSchemaUrl ||
    // "http://dev12.local:8079/graphql";
    "https://api.bponiplus.com/graphql";
  const graphqlProxyTarget = new URL(graphqlSchemaUrl).origin;
  const devPort = toNumber(process.env.PORT) ?? DEFAULT_DEV_PORT;
  const publicHost = process.env.VITE_PUBLIC_HOST?.trim() || "localhost";
  const publicProtocol = process.env.VITE_PUBLIC_PROTOCOL?.trim() || "http";
  const serverOrigin = `${publicProtocol}://${publicHost}:${devPort}`;

  return {
    base:
      command === "serve"
        ? siteConfig.vite.devBasePath
        : siteConfig.vite.cdnUrl,
    define: {
      __bponix_GRAPHQL_SCHEMA_URL__: JSON.stringify(
        command === "serve" ? "/api/graphql" : graphqlSchemaUrl,
      ),
    },
    envDir: false,
    plugins: [solid(), tailwindcss(), orinThemeManifestPlugin()],
    resolve: {
      alias: {
        "@repo/graphql": resolveAppPath(
          "../../../packages/graphql/src/index.ts",
        ),
      },
    },
    server: {
      host: "0.0.0.0",
      port: devPort,
      strictPort: true,
      allowedHosts: ["localhost", ".localhost", "127.0.0.1", publicHost],
      origin: serverOrigin,
      cors: localDevCors,
      hmr: {
        protocol: publicProtocol === "https" ? "wss" : "ws",
        host: publicHost,
        clientPort: devPort,
      },
      proxy: {
        "/api/graphql": {
          target: graphqlProxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: () => "/graphql",
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: devPort,
      strictPort: true,
    },
    build: {
      rollupOptions: {
        preserveEntrySignatures: "exports-only",
        input: {
          app: resolveAppPath("./index.html"),
          "remote-entry": resolveAppPath("./src/theme-entry.tsx"),
        },
        output: {
          entryFileNames: (chunkInfo) =>
            chunkInfo.name === "remote-entry"
              ? "remote-entry.js"
              : "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  };
});
