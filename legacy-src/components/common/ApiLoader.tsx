type ApiLoaderProps = {
  title?: string;
  copy?: string;
  class?: string;
};

export function ApiLoader(props: ApiLoaderProps) {
  return (
    <section
      class={`flex min-h-[calc(100vh-190px)] w-full items-center justify-center bg-white px-6 py-16 ${
        props.class ?? ""
      }`}
      role="status"
      aria-live="polite"
    >
      <div class="flex w-full max-w-sm flex-col items-center text-center">
        <div class="relative h-16 w-16">
          <div class="absolute inset-0 rounded-full border-4 border-purple-100" />
          <div class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#8e208c]" />
          <div class="absolute inset-3 rounded-full bg-[#8e208c]/10" />
        </div>

        <h2 class="mt-5 text-base font-semibold text-slate-900">
          {props.title ?? "Loading content"}
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          {props.copy ?? "Please wait while we prepare the latest store data."}
        </p>

      
      </div>
    </section>
  );
}
