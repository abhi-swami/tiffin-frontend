"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminOrderCard } from "@/components/admin-orders/order-card";
import { OrderEmptyState } from "@/components/admin-orders/empty-state";
import { OrderStatusTabs } from "@/components/admin-orders/order-status-tabs";
import { fetchAdminOrders } from "@/components/admin-orders/order-fetcher";
import { statusTabs, OrderRecord, NextCursor } from "@/components/admin-orders/order-types";

interface AdminOrdersPageProps {
  status: string;
}

export function AdminOrdersPage({ status }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [message, setMessage] = useState("Fetching orders...");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<NextCursor | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const loadOrders = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAdminOrders(status, nextCursor ?? undefined);
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
  }, [status, nextCursor, isLoading]);

  useEffect(() => {
    setOrders([]);
    setNextCursor(null);
    setHasMore(false);
    setError(null);
    setMessage("Fetching orders...");
    setIsInitialized(false);
  }, [status]);

  useEffect(() => {
    loadOrders();
  }, []);

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

  const activeTabLabel =
    statusTabs.find((tab) => tab.key === status)?.label ?? "To Be Delivered";
  const heroCopy = error ?? message;

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="space-y-4">
            <OrderStatusTabs activeStatus={status} />

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Admin Orders</h1>
              <p className="text-sm text-slate-600">{heroCopy}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {activeTabLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                Infinite scroll
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                Live feed
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Loaded orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
            <p className="text-xs text-slate-600 mt-1">
              Scroll down to load more
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Latest order</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {orders[0] ? formatDate(orders[0].order_date) : "No orders yet"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {hasMore ? "More available" : "All loaded"}
            </p>
          </div>
        </div>

        {/* Orders List */}
        {!orders.length && isInitialized ? (
          <OrderEmptyState
            title="No orders in this tab"
            description="This status has no orders yet. Switch tabs or refresh when new orders arrive."
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={order.id} ref={index === orders.length - 1 ? lastElementRef : null}>
                <AdminOrderCard order={order} />
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
            <div className="inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2"></div>
            <span className="text-sm text-slate-600">Loading more orders...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
