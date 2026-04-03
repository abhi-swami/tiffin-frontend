import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="relative isolate overflow-hidden px-5 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-8 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.24),transparent_65%)] blur-3xl" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
              Fresh meals, simpler sign-in
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                A tiffin experience built for fast repeat orders.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Customers can log in with their phone number and OTP, check meal plans, and place their next order in a few taps.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-2xl bg-[color:var(--brand)] px-6 text-white hover:bg-[color:var(--brand-deep)]"
              >
                <Link href="/login">
                  Open login
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl border-[color:var(--border-soft)] bg-transparent px-6"
              >
                <Link href="/login">Try phone OTP flow</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] bg-[linear-gradient(160deg,rgba(255,247,237,0.98),rgba(255,255,255,0.78))] p-5">
            {[
              {
                icon: Soup,
                title: "Home-style menu",
                copy: "Daily thalis, mini meals, and subscription packs for workdays.",
              },
              {
                icon: Clock3,
                title: "Quick checkout",
                copy: "Phone-first authentication keeps returning customers moving fast.",
              },
              {
                icon: ShieldCheck,
                title: "Secure access",
                copy: "OTP verification keeps sign-in lightweight without traditional passwords.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-white bg-white/80 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]"
              >
                <item.icon className="size-5 text-[color:var(--brand)]" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
