import type { MenuData } from "../../lib/home";
import { CategoryMenuBar } from "./CategoryMenuBar";
import { MainHeader } from "./MainHeader";

type NavBarProps = {
  menu: MenuData;
};

export function NavBar(props: NavBarProps) {
  return (
    <>
      <MainHeader menu={props.menu} />
      <div class="hidden lg:block">
        <CategoryMenuBar links={props.menu.primaryLinks} />
      </div>
    </>
  );
}
