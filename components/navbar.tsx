'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./auth-provider";

const unautherised = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/login", label: "Login" },
];

const autherised = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/orders", label: "Orders" },
];

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const navLinks = user?.id ? autherised : unautherised;

  console.log("Navbar render - user:", user);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("We could not log you out right now. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[color:var(--surface)]/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-sm font-bold tracking-[0.28em] text-white shadow-[0_14px_30px_-18px_rgba(210,90,45,0.95)]">
              TF
            </span>
            <span className="flex flex-col">
              <span className="font-semibold tracking-tight text-slate-950">
                Tiffin Daily
              </span>
              <span className="text-xs text-slate-500">
                Home-style meals, delivered warm
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white/75 p-1 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.3)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand-deep)]"
              >
                {link.label}
              </Link>
            ))}

            {user?.id ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            ) : null}
          </nav>
        </div>

        {logoutError ? (
          <p className="text-sm text-rose-600">{logoutError}</p>
        ) : null}
      </div>
    </header>
  );
}
