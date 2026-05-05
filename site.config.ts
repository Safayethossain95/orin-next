const DEFAULT_THEME_KEY = "orin";
const DEFAULT_THEME_VERSION = "0.0.0";
const DEFAULT_LATEST_ALIAS = "latest";
const DEFAULT_CDN_URL = "https://bponixbkt.sgp1.cdn.digitaloceanspaces.com";
// const DEFAULT_GRAPHQL_SCHEMA_URL = "http://dev12.local:8079/graphql";
const DEFAULT_GRAPHQL_SCHEMA_URL = "https://api.bponiplus.com/graphql";

function readEnvValue(key: string) {
  const metaEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as ImportMeta & { env?: Record<string, unknown> }).env
      : undefined;
  const metaValue = metaEnv?.[key];

  if (typeof metaValue === "string" && metaValue.length > 0) {
    return metaValue;
  }

  const processEnv =
    typeof globalThis === "object" && "process" in globalThis
      ? (
          globalThis as {
            process?: { env?: Record<string, string | undefined> };
          }
        ).process?.env
      : undefined;
  const processValue = processEnv?.[key];

  if (typeof processValue === "string" && processValue.length > 0) {
    return processValue;
  }

  return undefined;
}

const envOr = (key: string, fallback: string) => readEnvValue(key) ?? fallback;
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

function buildThemeCdnUrl(
  cdnUrl: string,
  themeKey: string,
  themeVersion: string,
) {
  return `${trimTrailingSlash(cdnUrl)}/themes/${themeKey}/${themeVersion}/`;
}

export const siteConfig = {
  app: {
    key: envOr("THEME_KEY", DEFAULT_THEME_KEY),
    version: envOr("THEME_VERSION", DEFAULT_THEME_VERSION),
    latestAlias: envOr("LATEST_ALIAS", DEFAULT_LATEST_ALIAS),
  },
  vite: {
    graphqlSchemaUrl: envOr(
      "VITE_GRAPHQL_SCHEMA_URL",
      DEFAULT_GRAPHQL_SCHEMA_URL,
    ),
    devBasePath: envOr("VITE_DEV_BASE_PATH", "/"),
    cdnUrl: envOr(
      "VITE_CDN_URL",
      buildThemeCdnUrl(
        envOr("SPACE_CDN_URL", DEFAULT_CDN_URL),
        envOr("THEME_KEY", DEFAULT_THEME_KEY),
        envOr("THEME_VERSION", DEFAULT_THEME_VERSION),
      ),
    ),
  },
  deploy: {
    provider: envOr("DEPLOY_PROVIDER", "digitalocean"),
    bucket: envOr("THEME_BUCKET", "bponixbkt"),
    region: envOr("DEPLOY_REGION", "sgp1"),
    cdnUrl: envOr("SPACE_CDN_URL", DEFAULT_CDN_URL),
  },
} as const;

export function getSiteConfigEnv() {
  return {
    THEME_KEY: siteConfig.app.key,
    THEME_VERSION: siteConfig.app.version,
    LATEST_ALIAS: siteConfig.app.latestAlias,
    THEME_BUILD_COMMAND: envOr("THEME_BUILD_COMMAND", "bun run build"),
    THEME_BUILD_DIR: envOr("THEME_BUILD_DIR", "dist"),
    THEME_EXPORT_NAME: envOr("THEME_EXPORT_NAME", "mount"),
    THEME_IS_DEFAULT: envOr("THEME_IS_DEFAULT", "0"),
    THEME_PATH_PREFIX: envOr("THEME_PATH_PREFIX", "themes"),
    THEME_SOURCE: envOr("THEME_SOURCE", "web/apps/themes"),
    DEPLOY_PROVIDER: siteConfig.deploy.provider,
    THEME_BUCKET: siteConfig.deploy.bucket,
    DEPLOY_REGION: siteConfig.deploy.region,
    SPACE_CDN_URL: siteConfig.deploy.cdnUrl,
    VITE_GRAPHQL_SCHEMA_URL: siteConfig.vite.graphqlSchemaUrl,
    VITE_DEV_BASE_PATH: siteConfig.vite.devBasePath,
    VITE_CDN_URL: siteConfig.vite.cdnUrl,
  };
}

export default siteConfig;
