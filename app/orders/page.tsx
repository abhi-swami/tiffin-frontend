import { Clock3, PackageCheck, ReceiptText } from "lucide-react";
import { connection } from "next/server";
import { getOrders, type OrderRecord } from "@/lib/orders";

export default async function OrdersPage() {
  await connection();
  const response = await getOrders();
  const orders = response.orders;

  return (
    <section className="relative isolate overflow-hidden px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.22),transparent_62%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="space-y-4">
          <span className="inline-flex w-fit rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
            Order history
          </span>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Your tiffin orders
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {response.message}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.7)]">
              {orders.length} orders found
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-10 text-center shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)]">
            <PackageCheck className="mx-auto size-10 text-[color:var(--brand)]" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              No orders yet
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Once orders are available from the API, they&apos;ll show up here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {orders.map((order) => {
              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)] backdrop-blur"
                >
                  <div className="border-b border-[color:var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,247,237,0.95),rgba(255,255,255,0.9))] px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
                          Order
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                          #{order.id.slice(0, 8)}
                        </h2>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          order.payment_status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                        <Clock3 className="size-4 text-[color:var(--brand)]" />
                        {formatDate(order.order_date)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                        <ReceiptText className="size-4 text-[color:var(--brand)]" />
                        Tiffin #{order.tiffin_id}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 p-6 sm:grid-cols-2">
                    <InfoCard label="Order ID" value={order.id} />
                    <InfoCard label="User ID" value={order.user_id} />
                    <InfoCard label="Tiffin ID" value={String(order.tiffin_id)} />
                    <InfoCard label="Payment Status" value={order.payment_status} />
                    <InfoCard label="Tiffin Date" value={order.tiffin.date} />
                    <InfoCard
                      label="Items in Tiffin"
                      value={String(order.tiffin.items.length)}
                    />
                  </div>

                  <div className="border-t border-[color:var(--border-soft)] px-6 py-5">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Included items
                    </h3>
                    <div className="mt-4 space-y-3">
                      {order.tiffin.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-base font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {item.description}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                              {item.price === null ? "Included" : `Rs. ${item.price}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-all text-sm leading-7 text-slate-700">{value}</p>
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
