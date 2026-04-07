import { NextCursor, OrdersResponse } from "./order-types";

export async function fetchAdminOrders(
  status: string,
  cursor?: NextCursor
): Promise<OrdersResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
  }

  let url = `${baseUrl}/admin-orders/${status}`;

  if (cursor) {
    url += `?lastOrderDate=${encodeURIComponent(cursor.lastOrderDate)}&lastOrderId=${encodeURIComponent(
      cursor.lastOrderId
    )}`;
  }

  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
