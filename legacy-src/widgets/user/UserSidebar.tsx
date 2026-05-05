import { A, useLocation, useNavigate } from "@solidjs/router";
import { For } from "solid-js";
import { Icon } from "solid-heroicons";
import {
  arrowLeftOnRectangle,
  circleStack,
  cog,
  currencyDollar,
  heart,
  home,
  lockClosed,
  megaphone,
  receiptPercent,
} from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import { authStore, clearStoredAuthTokens } from "../../stores/auth-store";

const navigation = [
  { id: 1, title: "Home", href: "/user/", icon: home },
  { id: 2, title: "Order", href: "/user/order/", icon: receiptPercent },
  { id: 3, title: "Reseller", href: "/user/reseller", icon: currencyDollar },
  { id: 4, title: "Wholesale", href: "/user/wholesale", icon: circleStack },
  { id: 5, title: "Affiliate", href: "/user/affiliate", icon: megaphone },
  { id: 6, title: "Wishlist", href: "/user/wishlist", icon: heart },
  { id: 7, title: "Setting", href: "/user/setting/", icon: cog },
  { id: 8, title: "Password", href: "/user/password/", icon: lockClosed },
  { id: 9, title: "Log Out", href: "/logout", icon: arrowLeftOnRectangle },
];

function normalizePath(pathname: string) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function UserSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (href: string) => normalizePath(location.pathname) === normalizePath(href);
  const handleLogout = () => {
    clearStoredAuthTokens();
    authStore.getState().signOut();
    toast.success("Logged out successfully.");
    void navigate("/login", { replace: true });
  };

  return (
    <>
      <aside class="w-full border-r border-gray-200 lg:w-52 lg:flex-shrink-0 lg:bg-white">
        <nav class="hidden flex-col text-[13px] text-gray-900 lg:flex">
          <For each={navigation}>
            {(item) => (
              <SidebarItem
                href={item.href}
                icon={item.icon}
                title={item.title}
                active={isActive(item.href)}
                onLogout={item.href === "/logout" ? handleLogout : undefined}
              />
            )}
          </For>
        </nav>
      </aside>

      <div class="sticky top-12 z-20 space-y-6 bg-white px-4 pb-4 lg:hidden">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex gap-3 overflow-x-auto">
            <For each={navigation}>
              {(item) => (
                <MobileSidebarItem
                  href={item.href}
                  title={item.title}
                  active={isActive(item.href)}
                  onLogout={item.href === "/logout" ? handleLogout : undefined}
                />
              )}
            </For>
          </nav>
        </div>
      </div>
    </>
  );
}

function SidebarItem(props: {
  href: string;
  icon: (typeof navigation)[number]["icon"];
  title: string;
  active: boolean;
  onLogout?: () => void;
}) {
  const className = `flex items-center gap-3 px-4 py-3.5 text-left hover:text-slate-950 focus:text-slate-950 ${
    props.active ? "text-[#8e208c]" : "text-gray-700"
  }`;
  const content = (
    <>
      <span class="flex w-5 items-start">
        <Icon
          path={props.icon}
          class={`mr-5 h-6 w-6 flex-shrink-0 ${
            props.active ? "text-[#8e208c]" : "text-gray-400"
          }`}
          aria-hidden="true"
        />
      </span>
      <span>{props.title}</span>
    </>
  );

  return props.onLogout ? (
    <button type="button" class={className} onClick={props.onLogout}>
      {content}
    </button>
  ) : (
    <A href={props.href} class={className}>
      {content}
    </A>
  );
}

function MobileSidebarItem(props: {
  href: string;
  title: string;
  active: boolean;
  onLogout?: () => void;
}) {
  const className = `mb-3 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
    props.active
      ? "border-purple-500 text-purple-600"
      : "border-transparent text-gray-700 hover:border-gray-300"
  }`;

  return props.onLogout ? (
    <button type="button" class={className} onClick={props.onLogout}>
      {props.title}
    </button>
  ) : (
    <A href={props.href} class={className}>
      {props.title}
    </A>
  );
}
