"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  PencilLine,
  RefreshCcw,
  ShieldCheck,
  Soup,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number | null;
  image_url?: string | null;
  tiffin_id?: number;
};

type ApiMessageResponse = {
  message?: string;
};

type PageMode = "create" | "view" | "edit";

const TIFFIN_ITEMS_ENDPOINT = "/tiffin-items";
const MENU_ITEMS_ENDPOINT = "/menu-items";

export default function MakeTiffinPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTiffinId, setActiveTiffinId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [mode, setMode] = useState<PageMode>("create");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "idle">(
    "idle"
  );

  useEffect(() => {
    void initializePage();
  }, []);

  const selectedItems = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return items.filter((item) => selectedSet.has(item.id));
  }, [items, selectedIds]);

  async function initializePage(options?: { preserveFeedback?: boolean }) {
    setIsLoading(true);
    setError(null);

    if (!options?.preserveFeedback) {
      setFeedback("");
      setFeedbackTone("idle");
    }

    try {
      const tiffinResponse = await api.get(TIFFIN_ITEMS_ENDPOINT);
      const todaysTiffinItems = normalizeMenuItems(tiffinResponse.data);

      if (todaysTiffinItems.length > 0) {
        setItems(todaysTiffinItems);
        setSelectedIds(todaysTiffinItems.map((item) => item.id));
        setActiveTiffinId(todaysTiffinItems[0]?.tiffin_id ?? null);
        setMode("view");
        return;
      }

      const menuResponse = await api.get(MENU_ITEMS_ENDPOINT);
      const menuItems = normalizeMenuItems(menuResponse.data);
      setItems(menuItems);
      setSelectedIds([]);
      setActiveTiffinId(null);
      setMode("create");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load tiffin items right now."
      );
      setItems([]);
      setSelectedIds([]);
      setActiveTiffinId(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditTiffin() {
    if (isEditLoading) {
      return;
    }

    setIsEditLoading(true);
    setError(null);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      const menuResponse = await api.get(MENU_ITEMS_ENDPOINT);
      const menuItems = normalizeMenuItems(menuResponse.data);
      setItems(menuItems);
      setMode("edit");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load menu items for editing right now."
      );
    } finally {
      setIsEditLoading(false);
    }
  }

  function toggleSelection(itemId: number) {
    if (mode === "view") {
      return;
    }

    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }

  async function handleSubmit() {
    if (selectedIds.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      if (mode === "edit" && !activeTiffinId) {
        throw new Error("Tiffin ID is missing for this update request.");
      }

      const response =
        mode === "edit"
          ? await api.put<ApiMessageResponse>(
              `${TIFFIN_ITEMS_ENDPOINT}/${activeTiffinId}`,
              {
                selected_items: selectedIds,
              }
            )
          : await api.post<ApiMessageResponse>(TIFFIN_ITEMS_ENDPOINT, {
              selected_items: selectedIds,
            });

      setFeedback(
        response.data.message ??
          (mode === "edit"
            ? "Tiffin items updated successfully."
            : "Tiffin created successfully.")
      );
      setFeedbackTone("success");
      await initializePage({ preserveFeedback: true });
    } catch (caughtError) {
      setFeedback(
        caughtError instanceof Error
          ? caughtError.message
          : mode === "edit"
            ? "We could not modify the tiffin right now."
            : "We could not create the tiffin right now."
      );
      setFeedbackTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    mode === "edit"
      ? "Modify today's tiffin"
      : mode === "view"
        ? "Today's tiffin"
        : "Create a new tiffin";

  const description =
    mode === "edit"
      ? "Existing items are already selected. You can add or remove dishes, then save the updated tiffin."
      : mode === "view"
        ? "A tiffin already exists for today. Review the selected dishes or switch to edit mode to modify them."
        : "No tiffin exists for today yet. Select dishes from the menu and create one for today.";

  return (
    <section className="relative isolate overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.22),transparent_62%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:gap-8">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
            <ShieldCheck className="size-4" />
            Admin panel
          </span>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[28rem]">
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm text-slate-600 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.7)]">
                {isLoading ? "Loading items..." : `${items.length} items visible`}
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm text-slate-600 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.7)]">
                {selectedIds.length} selected
              </div>
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={`rounded-[1.5rem] border px-4 py-4 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.45)] ${
              feedbackTone === "success"
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
                : feedbackTone === "error"
                  ? "border-rose-200 bg-rose-50/90 text-rose-700"
                  : "border-white/70 bg-white/80 text-slate-700"
            }`}
          >
            <div className="flex items-start gap-3">
              {feedbackTone === "success" ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              ) : feedbackTone === "error" ? (
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
              ) : null}
              <p className="text-sm leading-7">{feedback}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50/90 p-6 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)] sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">
                  Could not load admin tiffin data
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-700">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {mode === "view" ? "Current tiffin items" : "Available dishes"}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {mode === "view"
                    ? "These dishes are already part of today's tiffin."
                    : "Select or deselect dishes to control what goes into today's tiffin."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void initializePage()}
                  disabled={isLoading || isEditLoading}
                  className="h-11 rounded-2xl border-[color:var(--border-soft)] bg-white/80 px-4"
                >
                  <RefreshCcw
                    className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>

                {mode === "view" ? (
                  <Button
                    type="button"
                    onClick={() => void handleEditTiffin()}
                    disabled={isEditLoading}
                    className="h-11 rounded-2xl bg-[color:var(--brand)] px-4 text-white hover:bg-[color:var(--brand-deep)]"
                  >
                    <PencilLine className="size-4" />
                    {isEditLoading ? "Opening edit..." : "Edit tiffin"}
                  </Button>
                ) : null}
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-52 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/70 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)]"
                  />
                ))}
              </div>
            ) : null}

            {!isLoading && !error && items.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[color:var(--border-soft)] bg-white/80 px-6 py-12 text-center shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)] backdrop-blur">
                <p className="text-lg font-semibold text-slate-950">
                  No menu items are available right now.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Once the backend returns items, this admin page will let you
                  select and submit them.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelection(item.id)}
                      disabled={mode === "view"}
                      className={`flex h-full flex-col rounded-[1.75rem] border p-5 text-left shadow-[0_35px_90px_-55px_rgba(15,23,42,0.55)] transition ${
                        isSelected
                          ? "border-[color:var(--brand)] bg-orange-50/90 ring-2 ring-[color:var(--brand)]/20"
                          : "border-white/70 bg-white/90 hover:border-[color:var(--brand-soft)] hover:bg-white"
                      } ${mode === "view" ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand-deep)]">
                          <Soup className="size-5" />
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                            isSelected
                              ? "bg-[color:var(--brand)] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isSelected ? "Selected" : "Available"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <h3 className="text-lg font-semibold text-slate-950">
                          {item.name}
                        </h3>
                        <p className="text-sm leading-7 text-slate-600">
                          {item.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                          {item.price === null ? "Included" : `Rs. ${item.price}`}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Item #{item.id}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)] backdrop-blur sm:p-6">
              <h2 className="text-xl font-semibold text-slate-950">
                Selected items
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {mode === "edit"
                  ? "Review your updated selection, then save the modified tiffin."
                  : mode === "view"
                    ? "These are the items currently selected for today's tiffin."
                    : "This summary is what will be sent to the backend when you create the tiffin."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Count
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedIds.length}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Pricing
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatSelectionPrice(selectedItems)}
                  </p>
                </div>
              </div>

              <div className="mt-5 max-h-72 space-y-3 overflow-auto pr-1">
                {selectedItems.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border-soft)] px-4 py-6 text-center text-sm leading-7 text-slate-500">
                    No dishes selected yet.
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div
                      key={`summary-${item.id}`}
                      className="rounded-[1.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3"
                    >
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        Item #{item.id}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {mode !== "view" ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => void handleSubmit()}
                  disabled={selectedIds.length === 0 || isSubmitting}
                  className="mt-6 h-12 w-full rounded-2xl bg-[color:var(--brand)] px-5 text-white hover:bg-[color:var(--brand-deep)]"
                >
                  {isSubmitting
                    ? mode === "edit"
                      ? "Modifying items..."
                      : "Creating tiffin..."
                    : mode === "edit"
                      ? "Modify items"
                      : "Create tiffin"}
                </Button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function normalizeMenuItems(data: unknown): MenuItem[] {
  if (Array.isArray(data)) {
    return data as MenuItem[];
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: MenuItem[] }).items;
  }

  return [];
}

function formatSelectionPrice(items: MenuItem[]) {
  const pricedItems = items.filter((item) => typeof item.price === "number");

  if (pricedItems.length === 0) {
    return "Included";
  }

  const total = pricedItems.reduce((sum, item) => sum + (item.price ?? 0), 0);
  return `Rs. ${total}`;
}
