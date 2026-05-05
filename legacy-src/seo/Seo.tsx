import { useLocation } from "@solidjs/router";
import { createEffect } from "solid-js";
import { applySeoMeta } from "./document-head";
import { resolveSeoMeta } from "./resolve-seo";
import type { SeoMeta } from "./types";

type SeoProps = {
  meta: SeoMeta;
};

export function Seo(props: SeoProps) {
  const location = useLocation();

  createEffect(() => {
    applySeoMeta(resolveSeoMeta(props.meta, location.pathname));
  });

  return null;
}
