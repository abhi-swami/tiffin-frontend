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
      ? "Existing items are already selected. Add or remove dishes, then save the update."
      : mode === "view"
        ? "A tiffin already exists for today. Review the selected dishes or switch to edit mode."
        : "No tiffin exists for today yet. Select dishes from the menu and create one.";

  return (
    <section className="page-shell">
      <div className="page-stack">
        <div className="app-panel hero-panel">
          <div className="hero-grid">
            <div className="space-y-2">
              <span className="section-kicker">
                <ShieldCheck className="size-3" />
                Admin panel
              </span>
              <h1 className="hero-title text-slate-950">{title}</h1>
              <p className="hero-copy max-w-2xl">{description}</p>
            </div>

            <div className="stat-grid">
              <div className="soft-panel">
                <p className="eyebrow">Visible items</p>
                <h2 className="mt-1 text-[12px] font-extrabold text-slate-950">
                  {isLoading ? "..." : items.length}
                </h2>
              </div>
              <div className="soft-panel">
                <p className="eyebrow">Selected</p>
                <h2 className="mt-1 text-[12px] font-extrabold text-slate-950">
                  {selectedIds.length}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={`app-panel ${
              feedbackTone === "success"
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
                : feedbackTone === "error"
                  ? "border-rose-200 bg-rose-50/90 text-rose-700"
                  : "text-slate-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {feedbackTone === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : feedbackTone === "error" ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              ) : null}
              <p className="tiny-copy">{feedback}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="app-panel border-rose-200 bg-rose-50/90">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
              <div>
                <h2 className="text-[12px] font-extrabold text-slate-950">
                  Could not load admin tiffin data
                </h2>
                <p className="tiny-copy mt-1 text-slate-700">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-2">
            <div className="app-panel flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[12px] font-extrabold text-slate-950">
                  {mode === "view" ? "Current tiffin items" : "Available dishes"}
                </h2>
                <p className="tiny-copy mt-1 text-slate-600">
                  {mode === "view"
                    ? "These dishes are already part of today's tiffin."
                    : "Tap any card to add or remove it from the tiffin."}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void initializePage()}
                  disabled={isLoading || isEditLoading}
                  className="h-9 rounded-[14px] border-[color:var(--line)] bg-white/80 px-3 text-[10px]"
                >
                  <RefreshCcw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                {mode === "view" ? (
                  <Button
                    type="button"
                    onClick={() => void handleEditTiffin()}
                    disabled={isEditLoading}
                    className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-3 text-[10px] text-white hover:bg-[color:var(--brand)]"
                  >
                    <PencilLine className="size-3.5" />
                    {isEditLoading ? "Opening..." : "Edit tiffin"}
                  </Button>
                ) : null}
              </div>
            </div>

            {isLoading ? (
              <div className="menu-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-[var(--panel-radius)] border border-white/65 bg-white/60"
                  />
                ))}
              </div>
            ) : null}

            {!isLoading && !error && items.length === 0 ? (
              <div className="app-panel text-center">
                <h2 className="text-[12px] font-extrabold text-slate-950">
                  No menu items are available right now.
                </h2>
                <p className="tiny-copy mt-1 text-slate-600">
                  Once the backend returns items, this page will let you select and submit them.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && items.length > 0 ? (
              <div className="menu-grid">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelection(item.id)}
                      disabled={mode === "view"}
                      className={`app-panel flex h-full flex-col gap-2 text-left transition ${
                        isSelected
                          ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]/35 ring-2 ring-[color:var(--brand)]/18"
                          : "hover:border-[color:var(--brand-soft)] hover:bg-white/90"
                      } ${mode === "view" ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]">
                            <Soup className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-[11px] font-extrabold text-slate-950">
                              {item.name}
                            </h3>
                            <p className="eyebrow mt-1">Item #{item.id}</p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${
                            isSelected
                              ? "bg-[color:var(--brand-strong)] text-white"
                              : "bg-[color:var(--surface)] text-slate-600"
                          }`}
                        >
                          {isSelected ? "Selected" : "Available"}
                        </span>
                      </div>

                      <p className="tiny-copy text-slate-600">
                        {item.description || "No description provided."}
                      </p>

                      <div className="mt-auto flex flex-wrap gap-2">
                        <span className="rounded-full bg-[color:var(--surface)] px-2 py-1 text-[9px] font-semibold text-slate-700">
                          {item.price === null ? "Included" : `Rs. ${item.price}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="app-panel">
              <h2 className="text-[12px] font-extrabold text-slate-950">Selected items</h2>
              <p className="tiny-copy mt-1 text-slate-600">
                {mode === "edit"
                  ? "Review your updated selection, then save the modified tiffin."
                  : mode === "view"
                    ? "These are the items currently selected for today's tiffin."
                    : "This summary is what will be sent when you create the tiffin."}
              </p>

              <div className="stat-grid mt-2">
                <div className="soft-panel">
                  <p className="eyebrow">Count</p>
                  <h3 className="mt-1 text-[12px] font-extrabold text-slate-950">
                    {selectedIds.length}
                  </h3>
                </div>
                <div className="soft-panel">
                  <p className="eyebrow">Pricing</p>
                  <h3 className="mt-1 text-[12px] font-extrabold text-slate-950">
                    {formatSelectionPrice(selectedItems)}
                  </h3>
                </div>
              </div>

              <div className="mt-2 max-h-72 space-y-2 overflow-auto pr-1">
                {selectedItems.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-[color:var(--line)] px-3 py-4 text-center text-[10px] leading-[1.15] text-slate-500">
                    No dishes selected yet.
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div key={`summary-${item.id}`} className="soft-panel">
                      <p className="text-[11px] font-bold text-slate-900">{item.name}</p>
                      <p className="eyebrow mt-1">Item #{item.id}</p>
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
                  className="mt-3 h-9 w-full rounded-[14px] bg-[color:var(--brand-strong)] px-4 text-[10px] text-white hover:bg-[color:var(--brand)]"
                >
                  {isSubmitting
                    ? mode === "edit"
                      ? "Modifying..."
                      : "Creating..."
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
