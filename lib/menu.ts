import "server-only";
import { FetchWrapper } from "@/utils/fetch-wrapper";

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  tiffin_id: number;
};

export async function getTodaysMenu() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
  }

  const client = new FetchWrapper(baseUrl);
  return client.get<MenuItem[]>("/menu", {
    cache: "no-store",
  });
}
