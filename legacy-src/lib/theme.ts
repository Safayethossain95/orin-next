export const theme = {
  container: "mx-auto w-full max-w-[1280px] px-4 sm:px-5 lg:px-6",
  page: "min-h-screen bg-[#f3f4f8] text-slate-900",
  card: " border border-[#ece7f5] bg-white shadow-[0_10px_30px_rgba(58,19,91,0.05)]",
  sectionHeader:
    "flex items-center justify-between gap-3 border-b border-[#f1ecf7] px-4 py-3 sm:px-5",
  sectionTitle:
    "text-[15px] font-bold uppercase tracking-[0.18em] text-[#8e208c]",
  sectionCopy: "text-xs text-slate-500",
  pill: "inline-flex items-center rounded-full border border-[#eadcf1] bg-[#fbf8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8e208c]",
  action:
    "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8e208c] transition hover:text-[#641661]",
  buttonPrimary:
    "inline-flex items-center justify-center rounded-full bg-[#8e208c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741972]",
  buttonSecondary:
    "inline-flex items-center justify-center rounded-full border border-[#d9c2e7] bg-white px-5 py-2.5 text-sm font-semibold text-[#8e208c] transition hover:border-[#8e208c]",
  authPage: "min-h-screen bg-white text-slate-900",
  authHeaderSearch:
    "flex w-full items-center gap-3 rounded-md border border-[#b72c97] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400",
  authCard:
    "w-full max-w-[400px] overflow-hidden border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]",
  authCardSection: "border-t border-slate-200 px-5 py-5",
  authInput:
    "h-9 w-full border-none bg-white px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-0 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]",
  authPrimaryButton:
    "inline-flex h-11 w-full items-center justify-center bg-[#a11b8f] px-4 text-base font-medium text-white transition hover:bg-[#86177a] disabled:cursor-not-allowed disabled:opacity-60",
  authSecondaryButton:
    "inline-flex h-11 w-full items-center justify-center bg-[#eef1ff] px-4 text-base font-medium text-[#3b47d1] transition hover:bg-[#e3e8ff]",
  categoryPage: {
    surface:
      "w-full min-h-[80vh] overflow-hidden rounded-sm bg-white px-2 pb-10 md:mt-4 md:px-4",
    titleWrap: "px-4",
    title: "mb-4 mt-4 text-lg font-bold text-slate-900 md:text-2xl",
    browserGrid:
      "grid grid-cols-[100px_minmax(0,1fr)] gap-1 md:grid-cols-[150px_minmax(0,1fr)]",
    railWrap: "h-full justify-self-center",
    rail: "sticky top-14 flex h-full min-h-[calc(100vh-115px)] max-h-[calc(100vh-115px)] flex-col gap-5 overflow-y-auto pr-2 md:pr-4 lg:max-h-[calc(100vh-260px)]",
    railButton:
      "flex w-[80px] flex-col items-center gap-0.5 text-left md:w-full",
    railCard: "w-full rounded-sm border p-2 shadow-sm transition duration-150",
    railCardActive: "border-red-100 bg-red-100 hover:bg-red-100",
    railCardInactive: "border-gray-100 bg-[#f8f7f5] hover:bg-amber-50",
    railImage: "h-20 max-h-28 w-full object-cover md:h-24",
    railLabel:
      "truncate pt-2 text-center text-xs font-medium text-gray-900 md:text-sm",
    content: "h-full border-l-2 border-gray-100 pl-2",
    tileGrid:
      "grid h-fit grid-cols-3 gap-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    tileLink: "flex min-w-0 flex-col items-center gap-0.5",
    tileImageFrame:
      "rounded-full bg-[#f8f7f5] p-1.5 transition duration-300 hover:bg-green-100",
    tileImage: "h-12 w-12 rounded-full object-cover md:h-20 md:w-20",
    tileLabel:
      "max-w-full truncate text-center text-xs font-medium leading-5 !text-[#21201f] md:text-sm md:font-semibold",
  },
  categoryFilter: {
    main: "pb-[60px] sm:px-0 sm:pt-4 md:pt-0",
    wrap: "mx-auto flex w-full max-w-7xl px-0 pb-5 sm:px-4",
    layout: "relative flex w-full gap-5",
    content:
      "w-full min-h-[calc(100vh-94px)] md:mt-4 md:min-h-[calc(100vh-99px)] md:overflow-hidden lg:min-h-[calc(100vh-136px)]",
    sidebar:
      "sticky top-[63px] z-40 mt-4 hidden h-[calc(100vh-99px)] min-w-[200px] max-w-[200px] overflow-visible rounded-sm bg-white md:block md:min-w-[250px] md:max-w-[250px] lg:h-[calc(100vh-136px)] mr-3",
    sidebarSection: "px-4 pt-2 mt-2",
    sidebarTitle: "border-b mb-4",
    sidebarTitleText: "pb-2 uppercase text-gray-600",
    sidebarInput:
      "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none",
    sidebarApply:
      "w-full rounded bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700",
    sidebarClear:
      "w-full rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition hover:bg-gray-400",
    sidebarMenu:
      "relative min-w-[200px] max-w-[200px] p-4 md:min-w-[250px] md:max-w-[250px]",
    flyout:
      "absolute left-[100%] top-0 z-40 min-h-[calc(100vh-280px)] max-h-[calc(100vh-320px)] w-full overflow-hidden rounded-sm bg-white p-2 shadow-xl hover:overflow-y-auto lg:max-h-[calc(100vh-356px)]",
    flyoutSecond:
      "absolute left-[200%] top-0 z-40 min-h-[calc(100vh-280px)] max-h-[calc(100vh-320px)] w-full overflow-hidden rounded-sm bg-white p-2 shadow-xl hover:overflow-y-auto lg:max-h-[calc(100vh-356px)]",
    sidebarList:
      "max-h-[calc(100vh-320px)] overflow-hidden rounded-sm bg-white hover:overflow-y-auto lg:max-h-[calc(100vh-356px)]",
    sidebarRow:
      "flex w-full cursor-pointer items-center justify-between rounded-sm transition-all hover:bg-green-50",
    sidebarRowInner: "flex w-full items-center p-2",
    sidebarImage: "h-5 w-5 rounded-full object-cover",
    sidebarFlyoutImage: "h-6 w-6 rounded-full object-cover",
    sidebarLabel:
      "ml-3 truncate text-left text-sm font-medium leading-4 text-gray-700 hover:text-gray-900",
    topPanel: "mb-2 bg-white p-4 md:mb-4",
    cover: "mb-2 h-32 w-full rounded-sm border object-cover md:mb-4 md:h-60",
    topTitle: "hidden text-base font-bold sm:block md:text-2xl",
    chipStrip:
      "flex flex-nowrap items-center gap-5 overflow-x-auto whitespace-nowrap p-2 pr-2 md:pt-4",
    chip: "rounded-sm border bg-white px-2 py-1 text-sm transition-all sm:px-3 sm:py-2",
    chipActive: "bg-green-100",
    chipShadow:
      "rounded-sm px-2 py-1 text-sm shadow-[0px_1px_6px_rgba(0,0,0,0.2)] transition-all sm:px-3 sm:py-2",
    sortBar:
      "flex items-center justify-between rounded-sm border border-gray-200 bg-white p-2",
    sortTitle: "text-base font-medium md:text-xl",
    sortButton:
      "flex cursor-pointer items-center gap-2 rounded-sm bg-gray-100 px-2 py-1.5 text-xs transition-all hover:bg-gray-200 md:px-4 md:py-2 md:text-sm lg:text-base",
    sortMenu:
      "absolute right-0 top-8 z-10 mt-2 min-w-[150px] origin-top-right rounded-sm bg-white p-2 text-sm shadow-lg focus:outline-none md:p-3 lg:text-base",
    sortItem:
      "w-full px-3 py-1 text-left text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    sortItemActive: "rounded-sm bg-gray-100 text-gray-900",
    productGrid:
      "relative mt-4 grid grid-cols-2 gap-2 pb-8 md:grid-cols-3 md:gap-3 md:rounded-sm md:pb-12  xl:grid-cols-5",
    productCard:
      "relative flex w-full cursor-pointer flex-col justify-between overflow-hidden rounded-sm border border-gray-50 bg-white transition-colors duration-300 hover:border-gray-200",
    productImageWrap: "relative p-2.5",
    productImage:
      "aspect-square h-full max-h-[215px] w-full rounded-sm bg-white object-contain",
    productPrice: "text-base font-semibold text-[#fc5230]",
    productCompare:
      "relative ml-2 text-xs font-normal text-gray-900 after:absolute after:right-0 after:top-[7px] after:block after:h-px after:w-full after:-rotate-3 after:bg-[#fc5230]",
    productTitle:
      "line-clamp-1 text-sm font-normal leading-5 text-gray-900 md:line-clamp-2 md:min-h-[40px]",
    productActions:
      "flex items-center overflow-hidden rounded-sm border border-gray-50 bg-[#8e208c]/10 text-gray-700 transition-all duration-300",
    productIconButton:
      "flex h-9 w-10 items-center justify-center border-gray-50 transition-all hover:bg-[#8e208c]/20 sm:h-10 sm:w-12",
    productBuyButton:
      "flex-1 py-2 text-center text-xs font-medium transition-all hover:bg-[#8e208c]/20 sm:text-sm",
    empty:
      "flex h-[50vh] flex-col items-center justify-center border border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-20 text-center",
  },
} as const;

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}
