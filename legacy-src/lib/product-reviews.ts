import productReviewsRaw from "../data/product-reviews.json";

type RawProductReview = {
  id: string;
  product_id: string | null;
  user_name: string;
  user_avatar: string;
  rating: number;
  description: string;
  image: string;
  created_at: string;
  verified_purchase: boolean;
};

export type ProductReview = {
  id: string;
  productId: string | null;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  description: string;
  image: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

const reviews = productReviewsRaw as RawProductReview[];

export function loadProductReviews(productId: string): ProductReview[] {
  const matchedReviews = reviews.filter((review) => review.product_id === productId);
  const source = matchedReviews.length > 0
    ? matchedReviews
    : reviews.filter((review) => review.product_id === null);

  return source.map((review) => ({
    id: review.id,
    productId: review.product_id,
    user: {
      name: review.user_name,
      avatar: review.user_avatar,
    },
    rating: review.rating,
    description: review.description,
    image: review.image,
    createdAt: review.created_at,
    verifiedPurchase: review.verified_purchase,
  }));
}
