import { Sparkles, Soup } from "lucide-react";
import { PlaceOrderButton } from "@/components/place-order-button";
import { getTodaysMenu } from "@/lib/menu";

export default async function MenuPage() {
  const items = await getTodaysMenu();
  const tiffinId = items[0]?.tiffin_id;

  return (
    <section className="page-shell">
      <div className="page-stack">
        <div className="app-panel hero-panel">
          <div className="hero-grid">
            <div className="space-y-2">
              <span className="section-kicker">
                <Sparkles className="size-3" />
                Today&apos;s tiffin
              </span>
              <h1 className="hero-title text-slate-950">Fresh dishes, less clutter.</h1>
              <p className="hero-copy">
                The menu now reads like a tighter mobile catalog with cleaner price tags
                and smaller text blocks for thumb-first browsing.
              </p>
            </div>

            <div className="stat-grid">
              <div className="soft-panel">
                <p className="eyebrow">Dishes</p>
                <h2 className="mt-1 text-[12px] font-extrabold text-slate-950">
                  {items.length}
                </h2>
              </div>
              <div className="soft-panel">
                <p className="eyebrow">Flow</p>
                <p className="tiny-copy mt-1 text-slate-700">
                  One full tiffin order in a single step.
                </p>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="app-panel text-center">
            <h2 className="text-[12px] font-extrabold text-slate-950">
              Today&apos;s menu is not ready yet.
            </h2>
            <p className="tiny-copy mt-1 text-slate-600">
              Visit again shortly and the dishes will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="menu-grid">
              {items.map((item, index) => (
                <article
                  key={`${item.tiffin_id}-${item.id}-${index}`}
                  className="app-panel flex h-full flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]">
                        <Soup className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="eyebrow">Tiffin #{item.tiffin_id}</p>
                        <h2 className="mt-1 truncate text-[11px] font-bold text-slate-950">
                          {item.name}
                        </h2>
                      </div>
                    </div>

                    <span className="rounded-full bg-[color:var(--surface-strong)] px-2 py-1 text-[9px] font-semibold text-slate-700">
                      {item.price === null ? "Included" : `Rs. ${item.price}`}
                    </span>
                  </div>

                  <p className="tiny-copy text-slate-600">
                    {item.description || "No description available."}
                  </p>

                  {item.image_url ? (
                    <p className="micro-copy mt-auto font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Photo available from API
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="app-panel">
              <PlaceOrderButton tiffinId={tiffinId} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
