'use client';

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  Home,
  LogIn,
  LogOut,
  MenuSquare,
  Package,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "./auth-provider";

type NavLink = {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
};

const guestLinks: NavLink[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: Home },
  { href: "/menu", label: "Menu", shortLabel: "Menu", icon: MenuSquare },
  { href: "/login", label: "Login", shortLabel: "Login", icon: LogIn },
];

const userLinks: NavLink[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: Home },
  { href: "/menu", label: "Menu", shortLabel: "Menu", icon: MenuSquare },
  { href: "/orders", label: "Orders", shortLabel: "Orders", icon: Package },
  { href: "/profile", label: "Profile", shortLabel: "Profile", icon: UserRound },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const navLinks = user?.id ? userLinks : guestLinks;

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
    <>
      <header className="sticky top-0 z-40 border-b border-white/45 bg-[rgba(255,251,246,0.72)] backdrop-blur-2xl">
        <div className="page-shell pb-2">
          <div className="app-panel px-2 py-2 md:px-3">
            <div className="flex items-center justify-between gap-2 md:hidden">
              <Link href="/" className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-brand-gradient text-[10px] font-extrabold tracking-[0.24em] text-white shadow-[0_18px_32px_-24px_rgba(21,105,118,0.95)]">
                  TF
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-extrabold tracking-[-0.03em] text-slate-950">
                    Tiffin Drift
                  </span>
                  <span className="block truncate text-[9px] leading-[1.1] text-slate-500">
                  Pocket-sized ordering
                  </span>
                </span>
              </Link>
            </div>

            <div className="mt-2 hidden items-center gap-3 md:flex">
              <Link href="/" className="flex min-w-0 items-center gap-3 pr-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-brand-gradient text-[12px] font-extrabold tracking-[0.24em] text-white shadow-[0_18px_32px_-24px_rgba(21,105,118,0.95)]">
                  TF
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Tiffin Drift
                  </span>
                  <span className="block truncate text-[13px] leading-[1.15] text-slate-500">
                    Pocket-sized ordering
                  </span>
                </span>
              </Link>

              <nav className="flex flex-1 items-center gap-1 rounded-full border border-[color:var(--line)] bg-white/85 p-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
                        isActive
                          ? "bg-[color:var(--brand-strong)] text-white"
                          : "text-slate-600 hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand-strong)]"
                      }`}
                    >
                      <link.icon className="size-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="ml-auto flex items-center gap-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-[color:var(--surface-strong)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-strong)]">
                  <Sparkles className="size-3.5" />
                  Mobile tuned
                </div>

                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition hover:text-[color:var(--brand-strong)]"
                >
                  Quick order
                  <ChevronRight className="size-4" />
                </Link>

                {user?.id ? (
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    className="inline-flex h-10 items-center gap-1 rounded-full border border-[color:var(--line)] bg-white px-4 text-[12px] font-semibold text-slate-700 transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="size-4" />
                    {isLoggingOut ? "Logging out" : "Logout"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {logoutError ? (
            <p className="px-1 pt-1 text-[10px] leading-[1.15] text-rose-600">
              {logoutError}
            </p>
          ) : null}
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 md:hidden">
        <div className="mx-auto w-full max-w-xl">
          <nav className="app-panel flex items-center gap-1 rounded-[22px] px-1 py-1 shadow-[0_24px_48px_-34px_rgba(17,35,61,0.75)]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-justify flex min-w-0 flex-1 items-center gap-2 rounded-[16px] px-1.5 py-2 transition ${
                    isActive
                      ? "bg-[color:var(--brand-strong)] text-white shadow-[0_18px_30px_-24px_rgba(20,95,112,0.95)]"
                      : "text-slate-600"
                  }`}
                >
                  <span className="nav-icon-box inline-flex shrink-0 items-center justify-center rounded-[12px] bg-white/12">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="nav-label truncate text-[9px] font-semibold leading-none">
                    {link.shortLabel}
                  </span>
                </Link>
              );
            })}

            {user?.id ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[color:var(--line)] text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Logout"
              >
                <LogOut className="size-3.5" />
              </button>
            ) : null}
          </nav>

          <div className="mt-1 flex items-center justify-between px-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Band-aware mobile dock
            </p>
            <p className="band-270 text-[8px] text-slate-400">270-320</p>
            <p className="band-321 text-[8px] text-slate-400">321-370</p>
            <p className="band-371 text-[8px] text-slate-400">371-480</p>
            <p className="band-481 text-[8px] text-slate-400">481+</p>
          </div>
        </div>
      </div>
    </>
  );
}
