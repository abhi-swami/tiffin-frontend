import { useEffect, useMemo, useState } from "react";
import { Check, CircleAlert, CircleX, Image as ImageIcon, PlusCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItemPayload, MenuItemRecord } from "./types";

type MenuItemFormProps = {
  mode: "create" | "edit";
  initialItem: MenuItemRecord | null;
  onSubmit: (payload: MenuItemPayload) => Promise<void> | void;
  onCancelEdit: () => void;
  isSubmitting: boolean;
  feedback: string;
  feedbackTone: "success" | "error" | "idle";
};

export function MenuItemForm({
  mode,
  initialItem,
  onSubmit,
  onCancelEdit,
  isSubmitting,
  feedback,
  feedbackTone,
}: MenuItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name ?? "");
      setDescription(initialItem.description ?? "");
      setPrice(
        typeof initialItem.price === "number" && !Number.isNaN(initialItem.price)
          ? String(initialItem.price)
          : ""
      );
      setImageUrl(initialItem.image_url ?? "");
      setLocalError("");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setLocalError("");
    }
  }, [initialItem]);

  const hasChanges = useMemo(() => {
    if (!initialItem && mode === "create") {
      return Boolean(name.trim() || description.trim() || price.trim() || imageUrl.trim());
    }

    if (!initialItem) return false;

    return (
      name.trim() !== initialItem.name ||
      description.trim() !== (initialItem.description ?? "") ||
      normalizePrice(price) !== initialItem.price ||
      imageUrl.trim() !== (initialItem.image_url ?? "")
    );
  }, [name, description, price, imageUrl, initialItem, mode]);

  function normalizePrice(raw: string): number | null {
    const value = raw.trim();

    if (!value) {
      return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return NaN;
    }

    return parsed;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    const parsedPrice = normalizePrice(price);

    if (Number.isNaN(parsedPrice)) {
      setLocalError("Price must be a non-negative number or left blank for included.");
      return;
    }

    if (!name.trim()) {
      setLocalError("Name is required.");
      return;
    }

    void onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      image_url: imageUrl.trim() || null,
    });
  }

  const title = mode === "edit" ? "Edit menu item" : "Add a menu item";
  const helper =
    mode === "edit"
      ? "Update the fields and save changes, or cancel to switch back to creating."
      : "Keep it short for smaller screens. Leaving price empty marks it as included.";

  const feedbackToneClass =
    feedbackTone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : feedbackTone === "error"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <form onSubmit={handleSubmit} className="app-panel space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="section-kicker">
            {mode === "edit" ? <Save className="size-3" /> : <PlusCircle className="size-3" />}
            {mode === "edit" ? "Edit mode" : "Create mode"}
          </p>
          <h2 className="mt-2 text-[12px] font-extrabold text-slate-950">{title}</h2>
          <p className="tiny-copy mt-1 text-slate-600">{helper}</p>
        </div>

        {mode === "edit" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
            className="h-8 rounded-[12px] border-[color:var(--line)] bg-white/80 text-[10px]"
          >
            <CircleX className="size-3.5" />
            Cancel
          </Button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="eyebrow">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Mini dal fry"
            className="w-full rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[color:var(--brand-strong)]"
          />
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow">Price (₹)</span>
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Leave empty if included"
            inputMode="decimal"
            className="w-full rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[color:var(--brand-strong)]"
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="eyebrow">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Light lentil curry with jeera tadka and coriander."
            rows={3}
            className="w-full rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[color:var(--brand-strong)]"
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="eyebrow">Image URL (optional)</span>
          <div className="flex items-center gap-2 rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5">
            <ImageIcon className="size-4 text-slate-500" />
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent text-[11px] text-slate-900 outline-none"
            />
          </div>
        </label>
      </div>

      {localError ? (
        <p className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] leading-[1.2] text-rose-700">
          <span className="inline-flex items-center gap-2 font-semibold">
            <CircleAlert className="size-3.5" />
            {localError}
          </span>
        </p>
      ) : null}

      {feedback ? (
        <p className={`rounded-[14px] border px-3 py-2 text-[10px] leading-[1.2] ${feedbackToneClass}`}>
          <span className="inline-flex items-center gap-2 font-semibold">
            {feedbackTone === "success" ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}
            {feedback}
          </span>
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="micro-copy text-slate-600">
          {mode === "edit"
            ? "Saving will update the live menu. Cancel to revert to creating a fresh item."
            : "New items show up immediately in the list below."}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !hasChanges}
            className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-4 text-[10px] text-white hover:bg-[color:var(--brand)] disabled:opacity-60"
          >
            {mode === "edit" ? <Save className="size-3.5" /> : <PlusCircle className="size-3.5" />}
            {isSubmitting ? (mode === "edit" ? "Saving..." : "Adding...") : mode === "edit" ? "Save changes" : "Add item"}
          </Button>

          {mode === "edit" ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onCancelEdit}
              className="h-9 rounded-[14px] border-[color:var(--line)] bg-white/80 px-4 text-[10px]"
            >
              <CircleX className="size-3.5" />
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
