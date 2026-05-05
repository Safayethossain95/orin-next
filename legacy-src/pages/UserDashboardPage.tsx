import { useLocation } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import {
  loadUserDashboardData,
  resolveUserSection,
} from "../lib/user-dashboard";
import { loadUserAffiliateData } from "../lib/user-affiliate";
import { loadUserWholesaleData } from "../lib/user-wholesale";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";
import { UserDashboard } from "../widgets/user/UserDashboard";
import { UserAffiliate } from "../widgets/user/UserAffiliate";
import { UserPasswordForm, UserSettingForm } from "../widgets/user/UserForms";
import { UserSidebar } from "../widgets/user/UserSidebar";
import {
  UserOrderList,
  UserResellerOrderList,
} from "../widgets/user/UserTables";
import { UserWholesale } from "../widgets/user/UserWholesale";
import { UserWishlistGrid } from "../widgets/user/UserWishlistGrid";

const menu = loadMenuData();
const dashboardData = loadUserDashboardData();
const affiliateData = loadUserAffiliateData();
const wholesaleData = loadUserWholesaleData();

export function UserDashboardPage() {
  const location = useLocation();
  const section = () => resolveUserSection(location.pathname);

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class="mx-auto max-w-7xl pb-12.5 pt-12 sm:px-4 md:pt-0">
        <div class="bg-white  sm:mt-10 sm:rounded-xl">
          <div class="flex w-full py-8 flex-col gap-5 lg:min-h-[70vh] lg:flex-row xl:min-h-207.5">
            <UserSidebar />

            <div class="flex w-full grow flex-col overflow-auto px-4 pb-4 lg:grow-0 lg:pr-10">
              <Switch>
                <Match when={section() === "dashboard"}>
                  <UserDashboard data={dashboardData} />
                </Match>
                <Match when={section() === "order"}>
                  <UserOrderList />
                </Match>
                <Match when={section() === "reseller"}>
                  <UserResellerOrderList />
                </Match>
                <Match when={section() === "wholesale"}>
                  <UserWholesale data={wholesaleData} />
                </Match>
                <Match when={section() === "affiliate"}>
                  <UserAffiliate data={affiliateData} />
                </Match>
                <Match when={section() === "wishlist"}>
                  <UserWishlistGrid data={dashboardData} />
                </Match>
                <Match when={section() === "setting"}>
                  <UserSettingForm data={dashboardData} />
                </Match>
                <Match when={section() === "password"}>
                  <UserPasswordForm />
                </Match>
              </Switch>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
