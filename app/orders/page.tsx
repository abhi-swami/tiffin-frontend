"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, PackageCheck, ReceiptText } from "lucide-react";

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

  let url:string = `${baseUrl}/orders`;
  console.log("Fetching orders with cursor:", baseUrl,url);

  if (cursor) {
    const {lastOrderDate, lastOrderId} = cursor;
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
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  /* ================= LOAD ORDERS ================= */

  const loadOrders = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchOrders(nextCursor ?? undefined);

      // ✅ append instead of replace
      setOrders((prev) => [...prev, ...(data.orders ?? [])]);

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
      { threshold: 1 }
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
        <div className="app-panel hero-panel">
          <div className="hero-grid">
            <div>
              <span className="section-kicker">
                <ReceiptText className="size-3" />
                Order history
              </span>

              <h1 className="hero-title text-slate-950">
                Compact order snapshots.
              </h1>

              <p className="hero-copy">{heroCopy}</p>
            </div>

            <div className="soft-panel">
              <p className="eyebrow">Orders</p>
              <h2 className="mt-1 text-[12px] font-extrabold">
                {orders.length}
              </h2>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {!orders.length && isInitialized ? (
          <div className="app-panel text-center">
            <PackageCheck className="mx-auto size-8" />
            <h2>No orders yet</h2>
          </div>
        ) : (
          <div className="order-grid">
            {orders.map((order, index) => (
              <div
                key={order.id}
                ref={index === orders.length - 1 ? lastElementRef : null}
                className="app-panel"
              >
                <h3>#{order.id.slice(0, 8)}</h3>
                <p>{formatDate(order.order_date)}</p>

                <div>
                  {order.tiffin.items.map((item) => (
                    <div key={item.id}>
                      <p>{item.name}</p>
                      <p>
                        {item.price === null
                          ? "Included"
                          : `₹${item.price}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOADER */}
        {isLoading && (
          <div className="app-panel text-center">
            Loading...
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