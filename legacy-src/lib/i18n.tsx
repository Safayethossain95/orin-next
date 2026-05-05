import {
  createContext,
  createEffect,
  createSignal,
  onMount,
  useContext,
  type JSX,
} from "solid-js";

export type Locale = "en" | "bn";

type TranslationParams = Record<string, string | number>;
type TranslationDictionary = Record<string, Record<Locale, string>>;

type I18nContextValue = {
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
};

export const languages: { id: number; code: Locale; name: string }[] = [
  { id: 1, code: "en", name: "EN" },
  { id: 2, code: "bn", name: "BN" },
];

const STORAGE_KEY = "orin.locale";

const translations: TranslationDictionary = {
  "nav.searchPlaceholder": { en: "Search...", bn: "খুঁজুন..." },
  "nav.search": { en: "Search", bn: "খুঁজুন" },
  "nav.wishlist": { en: "Wishlist", bn: "ইচ্ছেতালিকা" },
  "nav.cart": { en: "Cart", bn: "কার্ট" },
  "nav.login": { en: "Login", bn: "লগইন" },
  "nav.register": { en: "Register", bn: "রেজিস্ট্রেশন" },
  "nav.account": { en: "Account", bn: "অ্যাকাউন্ট" },
  "nav.myAccount": { en: "My Account", bn: "আমার অ্যাকাউন্ট" },
  "nav.openSidebar": { en: "Open sidebar", bn: "সাইডবার খুলুন" },
  "nav.closeSidebar": { en: "Close sidebar", bn: "সাইডবার বন্ধ করুন" },
  "nav.mobileNavigation": { en: "Mobile navigation", bn: "মোবাইল নেভিগেশন" },
  "nav.categories": { en: "Categories", bn: "ক্যাটাগরি" },
  "nav.newProduct": { en: "New Product", bn: "নতুন পণ্য" },
  "nav.more": { en: "More", bn: "আরও" },
  "nav.language": { en: "Language", bn: "ভাষা" },
  "nav.home": { en: "Home", bn: "হোম" },
  "nav.brand": { en: "Brand", bn: "ব্র্যান্ড" },
  "nav.brands": { en: "Brands", bn: "ব্র্যান্ডসমূহ" },
  "nav.collection": { en: "Collection", bn: "কালেকশন" },
  "nav.collections": { en: "Collections", bn: "কালেকশনসমূহ" },
  "nav.flashSale": { en: "Flash Sale", bn: "ফ্ল্যাশ সেল" },
  "nav.campaign": { en: "Campaign", bn: "ক্যাম্পেইন" },
  "nav.community": { en: "Community", bn: "কমিউনিটি" },
  "nav.curatedStore": {
    en: "curated everyday store",
    bn: "নির্বাচিত দৈনন্দিন স্টোর",
  },

  "filter.priceRange": { en: "Price Range", bn: "মূল্য সীমা" },
  "filter.min": { en: "Min", bn: "সর্বনিম্ন" },
  "filter.max": { en: "Max", bn: "সর্বোচ্চ" },
  "filter.apply": { en: "Apply", bn: "প্রয়োগ করুন" },
  "filter.clear": { en: "Clear", bn: "মুছুন" },
  "filter.feature": { en: "Feature", bn: "ফিচার" },
  "filter.sortBy": { en: "Sort by:", bn: "সাজান:" },
  "filter.default": { en: "Default", bn: "ডিফল্ট" },
  "filter.mostPopular": { en: "Most Popular", bn: "সবচেয়ে জনপ্রিয়" },
  "filter.highestRating": { en: "Highest Rating", bn: "সর্বোচ্চ রেটিং" },
  "filter.lowestPrice": { en: "Lowest Price", bn: "কম দাম" },
  "filter.highestPrice": { en: "Highest Price", bn: "বেশি দাম" },

  "pagination.showing": {
    en: "Showing {start} - {end} of {total} items",
    bn: "{total}টির মধ্যে {start} - {end} দেখানো হচ্ছে",
  },
  "pagination.itemsPerPage": { en: "Items per page", bn: "প্রতি পেজে আইটেম" },
  "pagination.prev": { en: "Prev", bn: "পূর্ববর্তী" },
  "pagination.next": { en: "Next", bn: "পরবর্তী" },

  "checkout.emptyCart": { en: "Your cart is empty", bn: "আপনার কার্ট খালি" },
  "checkout.emptyCartDescription": {
    en: "Add products from the homepage to unlock the full two-step checkout flow.",
    bn: "সম্পূর্ণ দুই ধাপের চেকআউট শুরু করতে হোমপেজ থেকে পণ্য যোগ করুন।",
  },
  "checkout.productsAppearHere": {
    en: "Products added from the homepage will appear here.",
    bn: "হোমপেজ থেকে যোগ করা পণ্য এখানে দেখা যাবে।",
  },
  "checkout.browseProducts": { en: "Browse products", bn: "পণ্য দেখুন" },
  "checkout.shoppingBag": {
    en: "Shopping bag ({count} items)",
    bn: "শপিং ব্যাগ ({count}টি আইটেম)",
  },
  "checkout.total": { en: "Total {amount}", bn: "মোট {amount}" },
  "checkout.cartProducts": { en: "Cart Products", bn: "কার্টের পণ্য" },
  "checkout.cartProductsHint": {
    en: "Adjust quantity or remove items before checkout.",
    bn: "চেকআউটের আগে পরিমাণ পরিবর্তন করুন বা পণ্য সরান।",
  },
  "checkout.clearAll": { en: "Clear all", bn: "সব মুছুন" },
  "checkout.sku": { en: "SKU {id}", bn: "এসকেইউ {id}" },
  "checkout.remove": { en: "Remove", bn: "সরান" },
  "checkout.cartCleared": { en: "Cart cleared.", bn: "কার্ট মুছে ফেলা হয়েছে।" },
  "checkout.cartQuantityUpdated": {
    en: "Cart quantity updated.",
    bn: "কার্টের পরিমাণ আপডেট হয়েছে।",
  },
  "checkout.removedFromCart": {
    en: "{name} removed from cart.",
    bn: "{name} কার্ট থেকে সরানো হয়েছে।",
  },
  "checkout.shippingAddress": { en: "Shipping address", bn: "শিপিং ঠিকানা" },
  "checkout.shippingAddressHint": {
    en: "Confirm the delivery information before moving to payment.",
    bn: "পেমেন্টে যাওয়ার আগে ডেলিভারির তথ্য নিশ্চিত করুন।",
  },
  "checkout.phoneNumber": { en: "Phone number", bn: "ফোন নম্বর" },
  "checkout.fullName": { en: "Full name", bn: "পূর্ণ নাম" },
  "checkout.address": { en: "Address", bn: "ঠিকানা" },
  "checkout.fullNamePlaceholder": {
    en: "Your full name",
    bn: "আপনার পূর্ণ নাম",
  },
  "checkout.addressPlaceholder": {
    en: "Write your full delivery address",
    bn: "আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন",
  },
  "checkout.phoneRequired": {
    en: "Phone number is required",
    bn: "ফোন নম্বর প্রয়োজন",
  },
  "checkout.phoneInvalid": {
    en: "Please enter a valid phone number",
    bn: "সঠিক ফোন নম্বর লিখুন",
  },
  "checkout.nameRequired": { en: "Name is required", bn: "নাম প্রয়োজন" },
  "checkout.nameTooShort": {
    en: "Name must be at least 3 characters",
    bn: "নাম অন্তত ৩ অক্ষরের হতে হবে",
  },
  "checkout.addressRequired": {
    en: "Address is required",
    bn: "ঠিকানা প্রয়োজন",
  },
  "checkout.addressTooShort": {
    en: "Please provide detailed address",
    bn: "অনুগ্রহ করে বিস্তারিত ঠিকানা দিন",
  },
  "checkout.summary": { en: "Checkout Summary", bn: "চেকআউট সারাংশ" },
  "checkout.step": { en: "Step {step}/2", bn: "ধাপ {step}/২" },
  "checkout.subTotal": { en: "Sub Total", bn: "সাবটোটাল" },
  "checkout.deliveryCharge": { en: "Delivery Charge", bn: "ডেলিভারি চার্জ" },
  "checkout.selectShipping": { en: "Select shipping", bn: "শিপিং নির্বাচন করুন" },
  "checkout.discount": { en: "Discount", bn: "ডিসকাউন্ট" },
  "checkout.payable": { en: "Payable", bn: "পরিশোধযোগ্য" },
  "checkout.saving": {
    en: "You are saving {amount} on this order",
    bn: "এই অর্ডারে আপনি {amount} সাশ্রয় করছেন",
  },
  "checkout.goBackAddress": {
    en: "Go back to address step",
    bn: "ঠিকানা ধাপে ফিরে যান",
  },
  "checkout.submitting": { en: "Submitting order...", bn: "অর্ডার জমা হচ্ছে..." },
  "checkout.confirm": { en: "Confirm | {amount}", bn: "নিশ্চিত করুন | {amount}" },
  "checkout.termsAgreement": {
    en: "I agree to {siteName}'s terms and conditions.",
    bn: "{siteName} এর শর্তাবলীতে সম্মতি প্রদান করছি।",
  },
  "checkout.terms": { en: "Terms and conditions", bn: "শর্তাবলী" },
  "checkout.continueShipping": {
    en: "Continue to shipping",
    bn: "শিপিংয়ে এগিয়ে যান",
  },
  "checkout.nextStepHint": {
    en: "The next step will open shipping, payment and promo selection.",
    bn: "পরবর্তী ধাপে শিপিং, পেমেন্ট এবং প্রোমো নির্বাচন খুলবে।",
  },
  "checkout.requiredAddress": {
    en: "Required address fields must be completed.",
    bn: "প্রয়োজনীয় ঠিকানার ঘরগুলো পূরণ করতে হবে।",
  },
  "checkout.optionsReady": {
    en: "Shipping and payment options are ready.",
    bn: "শিপিং এবং পেমেন্ট অপশন প্রস্তুত।",
  },
  "checkout.shippingPaymentRequired": {
    en: "Shipping and payment must be selected before confirming.",
    bn: "নিশ্চিত করার আগে শিপিং এবং পেমেন্ট নির্বাচন করতে হবে।",
  },
  "checkout.submitFailed": {
    en: "Checkout submit failed.",
    bn: "চেকআউট জমা ব্যর্থ হয়েছে।",
  },
  "checkout.orderSubmitted": {
    en: "Order submitted successfully.",
    bn: "অর্ডার সফলভাবে জমা হয়েছে।",
  },
  "checkout.promoCode": { en: "Promo code", bn: "প্রোমো কোড" },
  "checkout.availableCoupons": {
    en: "Available coupons",
    bn: "উপলব্ধ কুপন",
  },
  "checkout.enterPromoCode": {
    en: "Enter promo code",
    bn: "প্রোমো কোড লিখুন",
  },
  "checkout.apply": { en: "Apply", bn: "প্রয়োগ করুন" },
  "checkout.enterCouponCode": {
    en: "Enter a coupon code.",
    bn: "একটি কুপন কোড লিখুন।",
  },
  "checkout.invalidCouponCode": {
    en: "This coupon code is not valid.",
    bn: "এই কুপন কোডটি সঠিক নয়।",
  },
  "checkout.couponApplied": {
    en: "Coupon applied successfully.",
    bn: "কুপন সফলভাবে প্রয়োগ হয়েছে।",
  },
  "checkout.shipping": { en: "Shipping", bn: "শিপিং" },
  "checkout.shippingHint": {
    en: "Choose the delivery method for this order.",
    bn: "এই অর্ডারের ডেলিভারি পদ্ধতি নির্বাচন করুন।",
  },
  "checkout.shippingSelected": {
    en: "{title} shipping selected.",
    bn: "{title} শিপিং নির্বাচন করা হয়েছে।",
  },
  "checkout.payment": { en: "Payment", bn: "পেমেন্ট" },
  "checkout.paymentHint": {
    en: "Choose how you want to complete the payment.",
    bn: "কীভাবে পেমেন্ট সম্পন্ন করবেন তা নির্বাচন করুন।",
  },
  "checkout.paymentSelected": {
    en: "{title} payment selected.",
    bn: "{title} পেমেন্ট নির্বাচন করা হয়েছে।",
  },
  "checkout.standardDelivery": {
    en: "Standard Delivery",
    bn: "স্ট্যান্ডার্ড ডেলিভারি",
  },
  "checkout.standardDeliveryDescription": {
    en: "Delivered within 2-3 working days inside major cities.",
    bn: "প্রধান শহরগুলোতে ২-৩ কর্মদিবসের মধ্যে ডেলিভারি।",
  },
  "checkout.etaTwoThreeDays": { en: "2-3 days", bn: "২-৩ দিন" },
  "checkout.expressDelivery": {
    en: "Express Delivery",
    bn: "এক্সপ্রেস ডেলিভারি",
  },
  "checkout.expressDeliveryDescription": {
    en: "Priority handling for urgent household and gadget orders.",
    bn: "জরুরি গৃহস্থালি ও গ্যাজেট অর্ডারের জন্য অগ্রাধিকার সেবা।",
  },
  "checkout.etaTwentyFourHours": { en: "24 hours", bn: "২৪ ঘণ্টা" },
  "checkout.cashOnDelivery": {
    en: "Cash on Delivery",
    bn: "ক্যাশ অন ডেলিভারি",
  },
  "checkout.cashOnDeliveryNote": {
    en: "Pay in cash after the parcel reaches your doorstep.",
    bn: "পার্সেল হাতে পাওয়ার পর নগদ পেমেন্ট করুন।",
  },
  "checkout.onlinePayment": { en: "Online Payment", bn: "অনলাইন পেমেন্ট" },
  "checkout.onlinePaymentNote": {
    en: "Cards, mobile banking and wallet checkout supported.",
    bn: "কার্ড, মোবাইল ব্যাংকিং ও ওয়ালেট পেমেন্ট সমর্থিত।",
  },
  "checkout.launchVoucher": { en: "Launch voucher", bn: "লঞ্চ ভাউচার" },
  "checkout.freeDeliveryCoupon": {
    en: "Free delivery coupon",
    bn: "ফ্রি ডেলিভারি কুপন",
  },

  "brand.title": { en: "Brands", bn: "ব্র্যান্ডসমূহ" },
  "brand.loadingTitle": { en: "Loading brands...", bn: "ব্র্যান্ড লোড হচ্ছে..." },
  "brand.loadingCopy": {
    en: "Fetching the latest store brands.",
    bn: "স্টোরের সর্বশেষ ব্র্যান্ড আনা হচ্ছে।",
  },
  "brand.empty": {
    en: "No brands are available right now.",
    bn: "এই মুহূর্তে কোনো ব্র্যান্ড নেই।",
  },
  "brand.loadError": {
    en: "Brands could not be loaded. Please try again later.",
    bn: "ব্র্যান্ড লোড করা যায়নি। পরে আবার চেষ্টা করুন।",
  },
  "brand.loadingDetailTitle": {
    en: "Loading brand...",
    bn: "ব্র্যান্ড লোড হচ্ছে...",
  },
  "brand.loadingDetailCopy": {
    en: "Fetching the latest brand details.",
    bn: "সর্বশেষ ব্র্যান্ড তথ্য আনা হচ্ছে।",
  },
  "brand.notFound": { en: "Brand not found", bn: "ব্র্যান্ড পাওয়া যায়নি" },
  "brand.browseBrands": { en: "Browse brands", bn: "ব্র্যান্ড দেখুন" },
  "brand.noProducts": {
    en: "No Products Available",
    bn: "কোনো পণ্য নেই",
  },
  "brand.noProductsDescription": {
    en: "This brand does not have any active products yet.",
    bn: "এই ব্র্যান্ডে এখনো কোনো সক্রিয় পণ্য নেই।",
  },

  "collection.all": { en: "All Collections", bn: "সব কালেকশন" },
  "collection.loading": {
    en: "Loading collection {number}",
    bn: "কালেকশন {number} লোড হচ্ছে",
  },
  "collection.noneFound": {
    en: "No collections found",
    bn: "কোনো কালেকশন পাওয়া যায়নি",
  },
  "collection.noneFoundDescription": {
    en: "There are no active collections available right now.",
    bn: "এই মুহূর্তে কোনো সক্রিয় কালেকশন নেই।",
  },
  "collection.browseCollections": {
    en: "Browse collections",
    bn: "কালেকশন দেখুন",
  },
  "collection.unableToLoad": {
    en: "Unable to load collection",
    bn: "কালেকশন লোড করা যায়নি",
  },
  "collection.notFound": {
    en: "Collection not found",
    bn: "কালেকশন পাওয়া যায়নি",
  },
  "collection.loadError": {
    en: "Unable to load collection details.",
    bn: "কালেকশন তথ্য লোড করা যায়নি।",
  },
  "collection.noProductsDescription": {
    en: "This collection does not have any active products yet.",
    bn: "এই কালেকশনে এখনো কোনো সক্রিয় পণ্য নেই।",
  },
};

const I18nContext = createContext<I18nContextValue>();

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "bn";
}

function formatTranslation(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
  );
}

export function I18nProvider(props: { children: JSX.Element }) {
  const [locale, setLocaleSignal] = createSignal<Locale>("en");

  const setLocale = (nextLocale: Locale) => {
    setLocaleSignal(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  };

  onMount(() => {
    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(storedLocale)) {
      setLocaleSignal(storedLocale);
    }
  });

  createEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale();
    }
  });

  const t = (key: string, params?: TranslationParams) => {
    const value = translations[key]?.[locale()] ?? translations[key]?.en ?? key;
    return formatTranslation(value, params);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {props.children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
