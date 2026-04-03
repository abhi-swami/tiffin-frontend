import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPinned,
  ShieldCheck,
  Soup,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Clock3,
    title: "Fast taps",
    copy: "Short paths and compact cards for crowded thumbs.",
  },
  {
    icon: Soup,
    title: "Daily menu",
    copy: "See what matters first without heavy blocks.",
  },
  {
    icon: ShieldCheck,
    title: "OTP login",
    copy: "A cleaner sign-in flow for phone-first users.",
  },
];

export default function Home() {
  return (
    <section className="page-shell">
      <div className="page-stack">
        <div className="app-panel hero-panel">
          <div className="hero-grid">
            <div className="space-y-2">
              <span className="section-kicker">
                <Sparkles className="size-3" />
                New mobile shell
              </span>

              <div className="space-y-2">
                <h1 className="hero-title max-w-xl text-slate-950">
                  Tiny-screen tiffin ordering with a calmer look.
                </h1>
                <p className="hero-copy">
                  The whole interface is rebuilt for phone widths first, starting
                  at 270px and shifting its layout rhythm as each mobile band opens up.
                </p>
              </div>

              <div className="stat-grid">
                <div className="soft-panel">
                  <p className="eyebrow">270-320</p>
                  <p className="tiny-copy mt-1 text-slate-700">
                    Single-column rhythm, icon-led actions, ultra-tight gaps.
                  </p>
                </div>
                <div className="soft-panel">
                  <p className="eyebrow">321-370</p>
                  <p className="tiny-copy mt-1 text-slate-700">
                    Labels open up and cards breathe a little more.
                  </p>
                </div>
                <div className="soft-panel">
                  <p className="eyebrow">371-480</p>
                  <p className="tiny-copy mt-1 text-slate-700">
                    More balanced summaries and two-up support where possible.
                  </p>
                </div>
                <div className="soft-panel">
                  <p className="eyebrow">481-768</p>
                  <p className="tiny-copy mt-1 text-slate-700">
                    Still mobile-first, but more dashboard-like grouping.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-3 text-[10px] text-white hover:bg-[color:var(--brand)]"
                >
                  <Link href="/menu">
                    Browse menu
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-9 rounded-[14px] border-[color:var(--line)] bg-white/75 px-3 text-[10px]"
                >
                  <Link href="/login">OTP login</Link>
                </Button>
              </div>
            </div>

            <div className="mesh-card p-3">
              <div className="relative flex h-full flex-col gap-2">
                <div className="rounded-[14px] bg-white/12 p-2 backdrop-blur-sm">
                  <p className="eyebrow text-white/78">Today&apos;s route</p>
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[12px] font-extrabold tracking-[-0.03em] text-white">
                        Sector 18 lunch
                      </h2>
                      <p className="tiny-copy mt-1 text-white/82">
                        Compact order flow, quick reorder, low-friction review.
                      </p>
                    </div>
                    <MapPinned className="size-4 shrink-0 text-white/80" />
                  </div>
                </div>

                <div className="band-270 rounded-[14px] border border-white/12 bg-black/10 p-2">
                  <p className="eyebrow text-white/74">Smallest band</p>
                  <p className="tiny-copy mt-1 text-white/84">
                    Dock stays icon-first and content stacks cleanly.
                  </p>
                </div>

                <div className="band-321 rounded-[14px] border border-white/12 bg-black/10 p-2">
                  <p className="eyebrow text-white/74">Balanced compact</p>
                  <p className="tiny-copy mt-1 text-white/84">
                    Short labels return and hero blocks gain spacing.
                  </p>
                </div>

                <div className="band-371 rounded-[14px] border border-white/12 bg-black/10 p-2">
                  <p className="eyebrow text-white/74">Expanded phone</p>
                  <p className="tiny-copy mt-1 text-white/84">
                    Two-up summaries and richer helper copy appear.
                  </p>
                </div>

                <div className="band-481 rounded-[14px] border border-white/12 bg-black/10 p-2">
                  <p className="eyebrow text-white/74">Large mobile</p>
                  <p className="tiny-copy mt-1 text-white/84">
                    More editorial grouping while keeping tap-first behavior.
                  </p>
                </div>

                <div className="feature-grid">
                  {highlights.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-[14px] bg-white/10 p-2 backdrop-blur-sm"
                    >
                      <item.icon className="size-3.5 text-white/84" />
                      <h2 className="mt-1.5 text-[11px] font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="tiny-copy mt-1 text-white/80">{item.copy}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-grid">
          {[
            "Cooler aqua-sand palette with softened glass panels.",
            "New font pairing with a sharper, cleaner reading rhythm.",
            "Navbar rebuilt as a floating mobile dock with band-aware labels.",
          ].map((copy) => (
            <div key={copy} className="app-panel">
              <p className="tiny-copy text-slate-700">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
