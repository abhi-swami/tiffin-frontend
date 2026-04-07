"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, PackageCheck, ReceiptText } from "lucide-react";
import { Inter } from "next/font/google";

/* ================= TYPES ================= */

type OrderRecord = {
  id: string;
  user_id: string;
  tiffin_id: number;
  order_date: string;
  payment_status: string;
  tiffin: {
    id: number;
    date: string;
    created_at: string;
    items: {
      id: number;
      name: string;
      description: string;
      price: number | null;
      image_url: string | null;
      created_at: string;
      is_deleted: boolean;
    }[];
  };
};

type NextCursor = {
  lastOrderDate: string;
  lastOrderId: string;
};

type OrdersResponse = {
  message: string;
  orders: OrderRecord[];
  hasMore: boolean;
  nextCursor: NextCursor | null;
};

/* ================= API ================= */

async function fetchOrders(cursor?: NextCursor): Promise<OrdersResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
  }

  let url: string = `${baseUrl}/orders`;
  console.log("Fetching orders with cursor:", baseUrl, url);

  if (cursor) {
    const { lastOrderDate, lastOrderId } = cursor;
    url += `?lastOrderDate=${encodeURIComponent(lastOrderDate)}&lastOrderId=${encodeURIComponent(lastOrderId)}`;
  }

  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

/* ================= COMPONENT ================= */

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [message, setMessage] = useState("Fetching your orders...");
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<NextCursor | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);

  /* ================= LOAD ORDERS ================= */

  const loadOrders = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchOrders(nextCursor ?? undefined);
      console.log("nextCursor before update:", nextCursor);

      // append instead of replace
      setOrders((prev) => [...prev, ...(data.orders ?? [])]);
      console.log("Fetched orders:", data.nextCursor);

      setMessage(data.message ?? "Orders");
      setHasMore(data.hasMore ?? false);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [nextCursor, isLoading]);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= INTERSECTION OBSERVER ================= */

  useEffect(() => {
    if (!lastElementRef.current) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadOrders();
        }
      },
      { threshold: 0.8 }
    );

    observerRef.current.observe(lastElementRef.current);

    return () => observerRef.current?.disconnect();
  }, [orders, hasMore, isLoading, loadOrders]);

  const heroCopy = error ?? message;

  /* ================= UI ================= */

  return (
    <section className="page-shell">
      <div className="page-stack">

        {/* HEADER */}
        <div className="app-panel hero-panel order-hero">
          <div className="hero-grid">
            <div className="space-y-2">
              <span className="section-kicker">
                <ReceiptText className="size-3" />
                Orders & reorders
              </span>

              <h1 className="hero-title text-slate-950">
                Phone-first history with quicker scanning.
              </h1>

              <p className="hero-copy">{heroCopy}</p>

              <div className="order-pill-row">
                <span className="pill pill-strong">Infinite scroll intact</span>
                <span className="pill pill-soft">Mobile-first cards</span>
                <span className="pill pill-outline">Quick glance metadata</span>
              </div>
            </div>

            <div className="order-hero-stat">
              <div className="soft-panel">
                <p className="eyebrow">Loaded so far</p>
                <h2 className="stat-number">{orders.length}</h2>
                <p className="micro-copy mt-1 text-ink-soft">
                  More rows appear as soon as you reach the end.
                </p>
              </div>

              <div className="soft-panel">
                <p className="eyebrow">Latest order</p>
                <p className="tiny-copy mt-1 text-slate-700">
                  {orders[0]
                    ? formatDate(orders[0].order_date)
                    : "Waiting for your first order"}
                </p>
                <p className="micro-copy text-ink-soft">
                  {hasMore ? "Keep scrolling to fetch older ones." : "You are caught up for now."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {!orders.length && isInitialized ? (
          <div className="app-panel empty-order">
            <PackageCheck className="size-8 text-[color:var(--brand-strong)]" />
            <h2 className="text-[12px] font-extrabold text-slate-950">No orders yet</h2>
            <p className="tiny-copy text-slate-600">
              Place your first tiffin and it will show up here instantly.
            </p>
          </div>
        ) : (
          <div className="order-rail">
            {orders.map((order, index) => {
              const statusTone = order.payment_status?.toLowerCase() ?? "pending";
              const statusClass =
                statusTone === "paid"
                  ? "order-status is-paid"
                  : statusTone === "failed"
                    ? "order-status is-failed"
                    : "order-status is-pending";

              return (
                <article
                  key={order.id+index}
                  ref={index === orders.length - 1 ? lastElementRef : null}
                  className="app-panel order-card"
                >
                  <div className="order-card__head">
                    <div>
                      <p className="eyebrow">#{order.id.slice(0, 8)}</p>
                      <h3 className="order-card__title">{formatDate(order.order_date)}</h3>
                    </div>

                    <span className={statusClass}>
                      <span className="status-dot" />
                      {order.payment_status || "Pending"}
                    </span>
                  </div>

                  <div className="order-card__meta">
                    <div className="meta-chip">
                      <Clock3 className="size-3" />
                      <span>{formatDate(order.tiffin.date)}</span>
                    </div>
                    <div className="meta-chip">
                      <PackageCheck className="size-3" />
                      <span>{order.tiffin.items.length} items</span>
                    </div>
                    <div className="meta-chip muted">
                      <ReceiptText className="size-3" />
                      <span>Tiffin #{order.tiffin.id}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.tiffin.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="min-w-0">
                          <p className="order-item__title">{item.name}</p>
                          <p className="order-item__desc">
                            {item.description || "No description available."}
                          </p>
                        </div>
                        <span className="order-price">
                          {item.price === null ? "Included" : `₹${item.price}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* LOADER */}
        {isLoading && (
          <div className="app-panel order-loader">
            <span className="loader-dot" />
            <span className="tiny-copy text-slate-700">Loading more orders...</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="app-panel text-center text-red-500">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}

/* ================= HELPERS ================= */

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
