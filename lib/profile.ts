import "server-only";
import { cookies } from "next/headers";
import { FetchWrapper } from "@/utils/fetch-wrapper";

export type ProfileRecord = {
  id: string;
  phone: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: number;
  profile_image: string | null;
  created_at: string;
};

export type ProfileResponse = {
  profile: ProfileRecord[];
};

export async function getProfile() {
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

    return client.get<ProfileResponse>("/profile", {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });
  } catch {
    return {
      profile: [],
    } satisfies ProfileResponse;
  }
}
