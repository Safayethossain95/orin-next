import { Icon } from "solid-heroicons";
import { star as starOutline } from "solid-heroicons/outline";
import { star as starSolid } from "solid-heroicons/solid";
import { For, Show, createMemo, createSignal } from "solid-js";
import { toast } from "../../components/common/Toast";
import {
  loadProductReviews,
  type ProductReview,
} from "../../lib/product-reviews";

type ProductReviewsProps = {
  productId: string;
};

const ratingLabels: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=f3f4f6&color=374151`;
}

function getRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const diffSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(diffSeconds / unit.seconds);

    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

function StarRow(props: { rating: number; sizeClass?: string }) {
  const sizeClass = () => props.sizeClass ?? "h-3 w-3";

  return (
    <div class="flex text-yellow-400">
      <For each={[1, 2, 3, 4, 5]}>
        {(index) => (
          <Icon
            path={index <= Math.floor(props.rating) ? starSolid : starOutline}
            class={`${sizeClass()} ${
              index <= Math.floor(props.rating) ? "text-yellow-400" : "text-gray-200"
            }`}
            aria-hidden="true"
          />
        )}
      </For>
    </div>
  );
}

function RatingBreakdownStar(props: { index: number; averageRating: number }) {
  const fillWidth = createMemo(() => {
    if (props.averageRating >= props.index) {
      return "100%";
    }

    if (props.averageRating >= props.index - 0.5) {
      return "50%";
    }

    return "0%";
  });

  return (
    <div class="relative h-4 w-4">
      <Icon path={starOutline} class="absolute inset-0 h-full w-full text-gray-200" />
      <div class="absolute inset-0 overflow-hidden" style={{ width: fillWidth() }}>
        <Icon path={starSolid} class="h-full w-full text-yellow-400" />
      </div>
    </div>
  );
}

export function ProductReviews(props: ProductReviewsProps) {
  const [reviews, setReviews] = createSignal<ProductReview[]>(
    loadProductReviews(props.productId),
  );
  const [isWritingReview, setIsWritingReview] = createSignal(false);
  const [rating, setRating] = createSignal(5);
  const [hoverRating, setHoverRating] = createSignal(0);
  const [description, setDescription] = createSignal("");
  const [visibleCount, setVisibleCount] = createSignal(3);

  const averageRating = createMemo(() => {
    if (reviews().length === 0) {
      return "0.0";
    }

    const total = reviews().reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews().length).toFixed(1);
  });
  const numericAverageRating = createMemo(() => Number(averageRating()));
  const visibleReviews = createMemo(() => reviews().slice(0, visibleCount()));
  const hasMoreReviews = createMemo(() => visibleCount() < reviews().length);

  const getPercentage = (starCount: number) => {
    if (reviews().length === 0) {
      return 0;
    }

    const count = reviews().filter(
      (review) => Math.round(review.rating) === starCount,
    ).length;

    return Math.round((count / reviews().length) * 100);
  };

  const resetForm = () => {
    setDescription("");
    setRating(5);
    setHoverRating(0);
  };

  const toggleReviewForm = () => {
    setIsWritingReview((value) => {
      if (value) {
        resetForm();
      }

      return !value;
    });
  };

  const submitReview = () => {
    if (!description().trim()) {
      toast.error("Please write a comment.");
      return;
    }

    const nextReview: ProductReview = {
      id: `local-review-${Date.now()}`,
      productId: props.productId,
      user: {
        name: "You",
        avatar: "",
      },
      rating: rating(),
      description: description().trim(),
      image: "",
      createdAt: new Date().toISOString(),
      verifiedPurchase: false,
    };

    setReviews((current) => [nextReview, ...current]);
    setVisibleCount((current) => Math.max(current, 3));
    setIsWritingReview(false);
    resetForm();
    toast.success("Review posted.");
  };

  return (
    <div class="mx-auto mt-8 w-full">
      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <div class="sticky top-6 rounded-sm border border-gray-200 bg-white p-5">
            <h3 class="mb-4 text-sm font-bold text-gray-900">Customer Reviews</h3>

            <div class="mb-5 flex items-end gap-3">
              <span class="text-4xl font-bold leading-none tracking-tight text-gray-900">
                {averageRating()}
              </span>
              <div class="mb-1 flex flex-col">
                <div class="mb-1 flex text-yellow-400">
                  <For each={[1, 2, 3, 4, 5]}>
                    {(index) => (
                      <RatingBreakdownStar
                        index={index}
                        averageRating={numericAverageRating()}
                      />
                    )}
                  </For>
                </div>
                <span class="text-[11px] font-medium text-gray-500">
                  {reviews().length} total ratings
                </span>
              </div>
            </div>

            <div class="mb-6 space-y-2">
              <For each={[5, 4, 3, 2, 1]}>
                {(starCount) => (
                  <div class="flex items-center text-[11px]">
                    <span class="w-3 font-medium text-gray-500">{starCount}</span>
                    <Icon path={starOutline} class="mx-1 h-3 w-3 text-gray-300" />
                    <div class="mx-2 h-1.5 flex-1 overflow-hidden rounded-sm bg-gray-100">
                      <div
                        class="h-full rounded-sm bg-yellow-400"
                        style={{ width: `${getPercentage(starCount)}%` }}
                      />
                    </div>
                    <span class="w-7 text-right tabular-nums text-gray-400">
                      {getPercentage(starCount)}%
                    </span>
                  </div>
                )}
              </For>
            </div>

            <div class="border-t border-gray-100 pt-4">
              <h4 class="mb-1 text-sm font-semibold text-gray-900">
                Review this product
              </h4>
              <p class="mb-3 text-[11px] text-gray-500">
                Share your thoughts with others.
              </p>
              <button
                type="button"
                onClick={toggleReviewForm}
                class="w-full rounded-sm border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                {isWritingReview() ? "Close Review Form" : "Write a Customer Review"}
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-8">
          <Show when={isWritingReview()}>
            <div class="mb-8 rounded-sm border border-gray-200 bg-gray-50/50 p-5">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-sm font-bold text-gray-900">Add Your Review</h3>
              </div>

              <div class="mb-4">
                <label class="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Your Rating
                </label>
                <div class="flex items-center gap-1">
                  <For each={[1, 2, 3, 4, 5]}>
                    {(index) => (
                      <button
                        type="button"
                        class="relative h-6 w-6 cursor-pointer"
                        onMouseEnter={() => setHoverRating(index)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(index)}
                        aria-label={`${index} star rating`}
                      >
                        <Icon path={starOutline} class="h-full w-full text-gray-300" />
                        <Show when={index <= (hoverRating() || rating())}>
                          <Icon
                            path={starSolid}
                            class="absolute inset-0 h-full w-full text-yellow-400"
                          />
                        </Show>
                      </button>
                    )}
                  </For>
                  <span class="ml-2 text-xs font-medium text-gray-900">
                    {ratingLabels[hoverRating() || rating()]}
                  </span>
                </div>
              </div>

              <div class="mb-4">
                <label class="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Your Feedback
                </label>
                <textarea
                  value={description()}
                  onInput={(event) => setDescription(event.currentTarget.value)}
                  rows="4"
                  class="block w-full resize-none rounded-sm border border-gray-300 bg-white p-3 text-sm placeholder-gray-400 outline-none transition focus:border-gray-400"
                  placeholder="What did you like or dislike?"
                />
              </div>

              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={toggleReviewForm}
                  class="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  class="rounded-sm bg-gray-900 px-6 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </Show>

          <div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 class="text-sm font-bold text-gray-900">
              Top Reviews
              <span class="ml-1 text-xs font-normal text-gray-400">
                ({reviews().length})
              </span>
            </h3>
          </div>

          <div class="space-y-6">
            <Show
              when={visibleReviews().length > 0}
              fallback={
                <div class="py-10 text-center">
                  <p class="text-xs text-gray-500">No reviews yet.</p>
                </div>
              }
            >
              <For each={visibleReviews()}>
                {(review) => (
                  <div class="group flex gap-4">
                    <div class="shrink-0">
                      <img
                        src={review.user.avatar || avatarUrl(review.user.name)}
                        class="h-8 w-8 rounded-sm bg-gray-100 object-cover"
                        alt={review.user.name}
                      />
                    </div>

                    <div class="flex-1 border-b border-gray-100 pb-6 last:border-0">
                      <div class="mb-1.5 flex items-center justify-between">
                        <p class="text-xs font-bold text-gray-900">
                          {review.user.name}
                        </p>
                        <span class="text-[10px] text-gray-400">
                          {getRelativeTime(review.createdAt)}
                        </span>
                      </div>

                      <div class="mb-2 flex items-center gap-2">
                        <StarRow rating={review.rating} />
                        <Show when={review.verifiedPurchase}>
                          <span class="text-[10px] font-medium text-green-600">
                            Verified Purchase
                          </span>
                        </Show>
                      </div>

                      <p class="mb-3 text-sm leading-relaxed text-gray-600">
                        {review.description}
                      </p>

                      <Show when={review.image}>
                        {(image) => (
                          <button
                            type="button"
                            class="mb-3 block"
                            onClick={() => window.open(image(), "_blank")}
                          >
                            <img
                              src={image()}
                              class="h-14 w-auto rounded-sm border border-gray-200 transition-opacity hover:opacity-80"
                              alt="Review attachment"
                            />
                          </button>
                        )}
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </Show>

            <Show when={hasMoreReviews()}>
              <div class="pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 3)}
                  class="w-full rounded-sm border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Load More Reviews
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
