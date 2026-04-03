const ROLE_COOKIE_SECRET = process.env.ROLE_COOKIE_SECRET;

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  if (!ROLE_COOKIE_SECRET) {
    throw new Error("ROLE_COOKIE_SECRET is not defined");
  }

  cachedKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ROLE_COOKIE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return cachedKey;
}

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(value: string) {
  const key = await getKey(); // ✅ reused key

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return toBase64Url(signature);
}

export async function verifySignedRoleCookie(
  cookieValue: string | undefined
) {
  if (!cookieValue) return null;

  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const role = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);

  const expectedSignature = await sign(role);

  if (signature !== expectedSignature) {
    return null;
  }

  return role;
}