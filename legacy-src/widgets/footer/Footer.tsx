import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Icon } from "solid-heroicons";
import {
  chevronLeft,
  envelope,
  mapPin,
  phone,
} from "solid-heroicons/outline";
import { loadFooterContent } from "../../lib/footer";
import { theme } from "../../lib/theme";

const footer = loadFooterContent();

export function Footer() {
  return (
    <footer
      class="mt-10 hidden w-full overflow-hidden bg-white md:block"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" class="sr-only">
        Footer
      </h2>

      <div class={`${theme.container} py-8 lg:pt-14`}>
        <div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div class="space-y-4">
            <div class="flex h-10 items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8e208c] text-base font-black text-white">
                O
              </span>
              <div>
                <p class="text-lg font-black uppercase tracking-[0.18em] text-[#8e208c]">
                  {footer.brand.name}
                </p>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
                  lifestyle store
                </p>
              </div>
            </div>

            <div>
              <p class="font-medium leading-6 text-slate-700">
                {footer.brand.tagline}
              </p>
              <p class="mt-1 text-sm leading-6 text-slate-500">
                {footer.brand.description}
              </p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold leading-6 text-slate-900">
              Popular
            </h3>
            <ul role="list" class="mt-4 space-y-3 text-sm">
              <For each={footer.popular_links}>
                {(item) => (
                  <li>
                    <A
                      href={item.href}
                      class="group flex w-full cursor-pointer px-1 text-sm text-slate-500 transition-all duration-150 hover:text-slate-900"
                    >
                      <Icon
                        path={chevronLeft}
                        class="h-4 w-4 transition-all duration-300 group-hover:rotate-180"
                        aria-hidden="true"
                      />
                      <span class="ml-2 line-clamp-2 text-slate-600 transition-all duration-300 group-hover:ml-5">
                        {item.title}
                      </span>
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold leading-6 text-slate-900">
              Quick Links
            </h3>
            <ul role="list" class="mt-4 space-y-3 text-sm">
              <For each={footer.important_links}>
                {(item) => (
                  <li>
                    <A
                      href={item.href}
                      class="text-slate-500 transition hover:text-slate-900"
                    >
                      {item.title}
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold leading-6 text-slate-900">
              Address
            </h3>
            <div class="my-4 space-y-3 text-sm font-normal text-slate-500">
              <div class="flex flex-wrap gap-1">
                <p class="flex items-center gap-1.5">
                  <Icon path={mapPin} class="h-4 w-4" aria-hidden="true" />
                  <span>Head Office:</span>
                </p>
                <span>{footer.contact.head_office}</span>
              </div>

              <a
                class="flex flex-wrap gap-1 text-slate-500 transition hover:text-slate-900"
                href={`tel:${footer.contact.phone}`}
              >
                <p class="flex items-center gap-1.5">
                  <Icon path={phone} class="h-4 w-4" aria-hidden="true" />
                  <span>Phone:</span>
                </p>
                {footer.contact.phone}
              </a>

              <a
                class="flex flex-wrap gap-1 text-slate-500 transition hover:text-slate-900"
                href={`mailto:${footer.contact.email}`}
              >
                <p class="flex items-center gap-1.5">
                  <Icon path={envelope} class="h-4 w-4" aria-hidden="true" />
                  <span>Email:</span>
                </p>
                {footer.contact.email}
              </a>
            </div>

            <div class="flex space-x-6">
              <For each={footer.social_links}>
                {(item) => (
                  <a
                    href={item.href}
                    class="text-slate-400 transition hover:text-slate-500"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span class="sr-only">{item.title}</span>
                    <SocialIcon icon={item.icon} class="h-6 w-6" />
                  </a>
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-between border-t border-slate-900/10 pt-8 text-sm">
          <p class="text-xs leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} {footer.bottom_bar.copyright_name}
            . All rights reserved.
          </p>
          <a
            href={footer.bottom_bar.developed_by_href}
            target="_blank"
            rel="noreferrer"
            class="font-bold text-red-500"
          >
            {footer.bottom_bar.developed_by_label}
          </a>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon(props: {
  icon: "facebook" | "instagram" | "twitter" | "youtube";
  class?: string;
}) {
  const classes = props.class ?? "h-6 w-6";

  if (props.icon === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" class={classes} aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
      </svg>
    );
  }

  if (props.icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" class={classes} aria-hidden="true">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.9 4.9 0 0 1 1.772 1.153 4.9 4.9 0 0 1 1.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.9 4.9 0 0 1-1.772-1.153 4.9 4.9 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427A4.9 4.9 0 0 1 3.678 3.68a4.9 4.9 0 0 1 1.772-1.153c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63ZM12 6.865a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27Zm0 1.802a3.333 3.333 0 1 1 0 6.666 3.333 3.333 0 0 1 0-6.666Zm5.338-3.205a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
      </svg>
    );
  }

  if (props.icon === "twitter") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" class={classes} aria-hidden="true">
        <path d="M13.982 10.622 20.54 3h-1.554l-5.694 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378Zm-2.128 2.474-.697-.997-5.543-7.93h2.387l4.473 6.4.697.996 5.815 8.32h-2.387l-4.742-6.79Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" class={classes} aria-hidden="true">
      <path d="M19.812 5.418a2.5 2.5 0 0 1 1.768 1.768C22 8.746 22 12 22 12s0 3.255-.42 4.814a2.5 2.5 0 0 1-1.768 1.768C18.255 19 12 19 12 19s-6.255 0-7.814-.418A2.5 2.5 0 0 1 2.418 16.814C2 15.255 2 12 2 12s0-3.254.418-4.814a2.5 2.5 0 0 1 1.768-1.768C5.745 5 12 5 12 5s6.255 0 7.812.418ZM10 15l5.194-3L10 9v6Z" />
    </svg>
  );
}
