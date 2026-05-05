import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container py-16">
      <div className="surface bg-white p-8 text-center">
        <h1 className="text-3xl font-black">Page not found</h1>
        <Link href="/" className="mt-5 inline-flex bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">
          Back to home
        </Link>
      </div>
    </main>
  );
}
