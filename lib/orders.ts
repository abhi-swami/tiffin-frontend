import "server-only";
import { cookies } from "next/headers";
import { FetchWrapper } from "@/utils/fetch-wrapper";

export type OrderRecord = {
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

export type OrdersResponse = {
  message: string;
  orders: OrderRecord[];
};

export async function getOrders() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const client = new FetchWrapper(baseUrl);

    return client.get<OrdersResponse>("/orders", {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });
  } catch {
    return {
      message: "Could not fetch orders.",
      orders: [],
    } satisfies OrdersResponse;
  }
}
