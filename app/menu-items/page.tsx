"use client";

import { useEffect, useMemo, useState } from "react";
import { ChefHat, Filter, ListChecks, RefreshCcw, Sparkles } from "lucide-react";
import axios from "axios";
import { MenuItemCard } from "@/components/menu-items/menu-item-card";
import { MenuItemForm } from "@/components/menu-items/menu-item-form";
import type { MenuItemPayload, MenuItemRecord } from "@/components/menu-items/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/axios";

type ApiMessageResponse = {
  message?: string;
};

const MENU_ITEMS_ENDPOINT = "/menu-items";

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [activeItem, setActiveItem] = useState<MenuItemRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "idle">("idle");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MenuItemRecord | null>(null);

  useEffect(() => {
    void loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        String(item.id).includes(term)
    );
  }, [items, search]);

  const pricedItems = items.filter((item) => typeof item.price === "number");
  const pricedTotal = pricedItems.reduce((sum, item) => sum + (item.price ?? 0), 0);

  async function loadItems() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<MenuItemRecord[] | { items: MenuItemRecord[] }>(
        MENU_ITEMS_ENDPOINT
      );
      console.log("Raw API response for menu items:", response.data);
      setItems(normalizeMenuItems(response.data));
    } catch (caughtError) {
      setItems([]);
      setError(getErrorMessage(caughtError, "Unable to load menu items right now."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(payload: MenuItemPayload) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      const response = activeItem
        ? await api.put<ApiMessageResponse>(`${MENU_ITEMS_ENDPOINT}/${activeItem.id}`, payload)
        : await api.post<ApiMessageResponse>(MENU_ITEMS_ENDPOINT, payload);

      setFeedback(
        response.data.message ??
          (activeItem ? "Menu item updated successfully." : "Menu item created successfully.")
      );
      setFeedbackTone("success");
      setActiveItem(null);
      setEditModalOpen(false);
      await loadItems();
    } catch (caughtError) {
      setFeedback(
        getErrorMessage(
          caughtError,
          activeItem ? "We could not update this item." : "We could not create the item."
        )
      );
      setFeedbackTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(item: MenuItemRecord) {
    if (deletingId) return;

    setDeletingId(item.id);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      const response = await api.delete<ApiMessageResponse>(`${MENU_ITEMS_ENDPOINT}/${item.id}`);
      setFeedback(response.data.message ?? "Menu item deleted.");
      setFeedbackTone("success");
      if (activeItem?.id === item.id) {
        setActiveItem(null);
        setEditModalOpen(false);
      }
      await loadItems();
    } catch (caughtError) {
      setFeedback(getErrorMessage(caughtError, "We could not delete this item."));
      setFeedbackTone("error");
    } finally {
      setDeletingId(null);
      setDeleteItem(null);
    }
  }

  function handleEdit(item: MenuItemRecord) {
    setActiveItem(item);
    setEditModalOpen(true);
    setFeedback("");
    setFeedbackTone("idle");
  }

  function handleCancelEdit() {
    setActiveItem(null);
    setEditModalOpen(false);
    setFeedback("");
    setFeedbackTone("idle");
  }

  function handleDeleteClick(item: MenuItemRecord) {
    setDeleteItem(item);
  }

  function confirmDelete() {
    if (deleteItem) {
      void handleDelete(deleteItem);
    }
  }

  return (
    <section className="page-shell">
      <div className="page-stack">
        <div className="app-panel hero-panel">
          <div className="hero-grid">
            <div className="space-y-2">
              <span className="section-kicker">
                <ChefHat className="size-3" />
                Menu admin
              </span>
              <h1 className="hero-title text-slate-950">
                Mobile-first menu builder with live CRUD.
              </h1>
              <p className="hero-copy">
                Manage dishes in tight panels, optimized for thumbs first. Use the form to create or
                edit items, then swipe through cards to tweak or delete.
              </p>

              <div className="stat-grid">
                <div className="soft-panel">
                  <p className="eyebrow">Total items</p>
                  <h2 className="mt-1 text-[12px] font-extrabold text-slate-950">
                    {isLoading ? "..." : items.length}
                  </h2>
                </div>
                <div className="soft-panel">
                  <p className="eyebrow">Priced items</p>
                  <p className="tiny-copy mt-1 text-slate-700">
                    {isLoading ? "..." : `${pricedItems.length} · Rs. ${pricedTotal}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="app-panel">
                <div className="flex items-center gap-2">
                  <ListChecks className="size-4 text-[color:var(--brand-strong)]" />
                  <div>
                    <p className="eyebrow">Workflow</p>
                    <p className="tiny-copy text-slate-700">
                      Create or edit, then refresh cards below to see changes instantly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => void loadItems()}
                  disabled={isLoading}
                  className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-3 text-[10px] text-white hover:bg-[color:var(--brand)]"
                >
                  <RefreshCcw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={() => setCreateModalOpen(true)}
                  className="h-9 rounded-[14px] border-[color:var(--line)] bg-white/80 px-3 text-[10px]"
                >
                  <Sparkles className="size-3.5" />
                  New item mode
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={createModalOpen} onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) {
            setFeedback("");
            setFeedbackTone("idle");
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new menu item.
              </DialogDescription>
            </DialogHeader>
            <MenuItemForm
              mode="create"
              initialItem={null}
              onSubmit={(payload) => {
                handleSubmit(payload).then(() => {
                  setCreateModalOpen(false);
                });
              }}
              onCancelEdit={() => setCreateModalOpen(false)}
              isSubmitting={isSubmitting}
              feedback={feedback}
              feedbackTone={feedbackTone}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={editModalOpen} onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setActiveItem(null);
            setFeedback("");
            setFeedbackTone("idle");
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the fields and save changes.
              </DialogDescription>
            </DialogHeader>
            {activeItem && (
              <MenuItemForm
                mode="edit"
                initialItem={activeItem}
                onSubmit={handleSubmit}
                onCancelEdit={handleCancelEdit}
                isSubmitting={isSubmitting}
                feedback={feedback}
                feedbackTone={feedbackTone}
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="app-panel flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[12px] font-extrabold text-slate-950">Menu items</h2>
              <p className="tiny-copy mt-1 text-slate-600">
                Search by name, description, or id. Tap a card to edit or delete.
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
              <Filter className="size-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter items..."
                className="w-48 bg-transparent text-[11px] text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="menu-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-(--panel-radius) border border-white/65 bg-white/60"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !filteredItems.length ? (
          <div className="app-panel text-center">
            <h2 className="text-[12px] font-extrabold text-slate-950">No menu items found.</h2>
            <p className="tiny-copy mt-1 text-slate-600">
              Try clearing the search or add a new dish using the form above.
            </p>
          </div>
        ) : null}

        {!isLoading && filteredItems.length > 0 ? (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                isDeleting={deletingId === item.id}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function normalizeMenuItems(data: MenuItemRecord[] | { items: MenuItemRecord[] }): MenuItemRecord[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data;

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    if (
      apiMessage &&
      typeof apiMessage === "object" &&
      "message" in apiMessage &&
      typeof apiMessage.message === "string"
    ) {
      return apiMessage.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
