"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import { data } from "@/lib/data";

export default function UserDashboardPage() {
  const { user, isChecking } = useAuth();

  if (isChecking) {
    return <main className="container py-12 text-sm font-semibold text-slate-600">Checking session...</main>;
  }

  if (!user) {
    return (
      <main className="container py-12">
        <div className="surface bg-white p-6">
          <h1 className="text-2xl font-black">Login required</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in with ecom-bkend to access the dashboard.</p>
          <Link href="/login" className="mt-5 inline-flex bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-black">Welcome, {user.name}</h1>
      <p className="mt-1 text-sm text-slate-600">{user.email}</p>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Total Purchase", data.userDashboard.customer.total_purchase],
          ["Balance", data.userDashboard.customer.total_balance],
          ["Reward Points", data.userDashboard.customer.total_reward_points],
          ["Pending Orders", data.userDashboard.customer.orders_pending],
          ["Delivered", data.userDashboard.customer.orders_delivered],
          ["Returned", data.userDashboard.customer.orders_returned],
        ].map(([key, value]) => (
          <div key={key} className="surface bg-white p-5">
            <p className="text-xs font-black uppercase text-slate-500">{key}</p>
            <p className="mt-2 text-2xl font-black text-[var(--brand)]">{String(value)}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 surface bg-white p-5">
        <h2 className="font-black">Recent Orders</h2>
        <div className="mt-4 grid gap-3">
          {data.userDashboard.orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
              <span className="font-bold">{order.order_id}</span>
              <span className="text-slate-600">{order.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
