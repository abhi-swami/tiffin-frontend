import { Soup } from "lucide-react";
import { PlaceOrderButton } from "@/components/place-order-button";
import { getTodaysMenu } from "@/lib/menu";

export default async function MenuPage() {
  const items = await getTodaysMenu();
  const tiffinId = items[0]?.tiffin_id;
  console.log("Fetched today's menu items:", items);

  return (
    <section className="relative isolate overflow-hidden px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.22),transparent_62%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="space-y-4">
          <span className="inline-flex w-fit rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
            Today&apos;s tiffin menu
          </span>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Fresh dishes for today
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                These dishes are combined together to form today&apos;s tiffin.
                Browse the full menu below, then place one order for the
                complete tiffin.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.7)]">
                {items.length} dishes in today&apos;s tiffin
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--border-soft)] bg-white/80 px-6 py-12 text-center shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-lg font-semibold text-slate-950">
              We have not decided today&apos;s menu yet.
            </p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              You can come and visit after sometime.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {items.map((item, index) => (
                <article
                  key={`${item.tiffin_id}-${item.id}-${index}`}
                  className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)] backdrop-blur"
                >
                  <div className="border-b border-[color:var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,247,237,0.95),rgba(255,255,255,0.9))] px-6 py-5">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
                      Tiffin plan {item.tiffin_id}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {item.name}
                    </h2>
                  </div>

                  <div className="space-y-5 p-6">
                    <div className="flex gap-4 rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand-deep)]">
                        <Soup className="size-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {item.description}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                            {item.price === null
                              ? "Included"
                              : `Rs. ${item.price}`}
                          </span>
                        </div>
                        {item.image_url ? (
                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            Photo available from API
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-center">
              <PlaceOrderButton tiffinId={tiffinId} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
