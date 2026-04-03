import { Clock3, PackageCheck, ReceiptText } from "lucide-react";
import { connection } from "next/server";
import { getOrders, type OrderRecord } from "@/lib/orders";

export default async function OrdersPage() {
  await connection();
  const response = await getOrders();
  const orders = response.orders;

  return (
    <section className="page-shell">
      <div className="page-stack">
        <div className="app-panel hero-panel">
          <div className="hero-grid">
            <div className="space-y-2">
              <span className="section-kicker">
                <ReceiptText className="size-3" />
                Order history
              </span>
              <h1 className="hero-title text-slate-950">Compact order snapshots.</h1>
              <p className="hero-copy">{response.message}</p>
            </div>

            <div className="stat-grid">
              <div className="soft-panel">
                <p className="eyebrow">Orders</p>
                <h2 className="mt-1 text-[12px] font-extrabold text-slate-950">
                  {orders.length}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="app-panel text-center">
            <PackageCheck className="mx-auto size-8 text-[color:var(--brand-strong)]" />
            <h2 className="mt-2 text-[12px] font-extrabold text-slate-950">
              No orders yet
            </h2>
            <p className="tiny-copy mt-1 text-slate-600">
              Once orders are available from the API, they&apos;ll appear here automatically.
            </p>
          </div>
        ) : (
          <div className="order-grid">
            {orders.map((order) => (
              <article key={order.id} className="app-panel flex flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="eyebrow">Order</p>
                    <h2 className="mt-1 text-[12px] font-extrabold text-slate-950">
                      #{order.id.slice(0, 8)}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                      order.payment_status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--surface)] px-2 py-1 text-[9px] text-slate-600">
                    <Clock3 className="size-3 text-[color:var(--brand-strong)]" />
                    {formatDate(order.order_date)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--surface)] px-2 py-1 text-[9px] text-slate-600">
                    <ReceiptText className="size-3 text-[color:var(--brand-strong)]" />
                    Tiffin #{order.tiffin_id}
                  </span>
                </div>

                <div className="stat-grid">
                  <InfoCard label="Order ID" value={order.id} />
                  <InfoCard label="User ID" value={order.user_id} />
                  <InfoCard label="Items" value={String(order.tiffin.items.length)} />
                </div>

                <div className="soft-panel space-y-2">
                  <p className="eyebrow">Included items</p>

                  {order.tiffin.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[12px] border border-[color:var(--line)] bg-white/82 px-2 py-2"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-bold text-slate-900">{item.name}</p>
                          <span className="rounded-full bg-[color:var(--surface)] px-2 py-1 text-[9px] font-semibold text-slate-700">
                            {item.price === null ? "Included" : `Rs. ${item.price}`}
                          </span>
                        </div>
                        <p className="tiny-copy text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-panel">
      <p className="eyebrow">{label}</p>
      <p className="tiny-copy mt-1 break-all text-slate-700">{value}</p>
    </div>
  );
}

function formatDate(value: OrderRecord["order_date"]) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
