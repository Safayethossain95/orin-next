import type { JSX } from "solid-js";
import { theme } from "../../lib/theme";

type SectionHeaderProps = {
  title: string;
  copy: string;
  centerContent?: JSX.Element;
  actionHref?: string;
};

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <div class={`${theme.sectionHeader} grid gap-3 grid-cols-3 justify-between`}>
      <div class="min-w-0">
        <h2 class={theme.sectionTitle}>{props.title}</h2>
        <p class={theme.sectionCopy}>{props.copy}</p>
      </div>
      <div>

      {props.centerContent ? (
        <div class="hidden items-center justify-center lg:flex">{props.centerContent}</div>
      ) : null}
      </div>
      <div class="flex items-center justify-end">

      <a href={props.actionHref ?? "#"} class={theme.action}>
        View all
      </a>
      </div>
    </div>
  );
}
