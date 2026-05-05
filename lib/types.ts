export type Product = {
  id: string | number;
  hid?: string;
  slug?: string;
  title?: string;
  name?: string;
  brand?: string;
  translation?: string;
  thumbnail?: string;
  image?: string;
  price: number;
  compare_price?: number;
  comparePrice?: number;
  original_price?: number;
  flashPrice?: number;
  currency?: string;
  rating?: number;
  rating_total?: number;
  quantity?: number;
  is_continue_selling?: boolean;
  isContinueSelling?: boolean;
  sold_count?: number;
  category_id?: number;
  sub_category_id?: number;
  sub_sub_category_id?: number;
  badge?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};
