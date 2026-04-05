import { PencilLine, Soup, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItemRecord } from "./types";

type MenuItemCardProps = {
  item: MenuItemRecord;
  onEdit: (item: MenuItemRecord) => void;
  onDelete: (item: MenuItemRecord) => void;
  isDeleting?: boolean;
};

export function MenuItemCard({ item, onEdit, onDelete, isDeleting }: MenuItemCardProps) {
  return (
    <article className="app-panel flex h-full flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]">
            <Soup className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="eyebrow">Item #{item.id}</p>
            <h3 className="mt-1 truncate text-[11px] font-extrabold text-slate-950">
              {item.name}
            </h3>
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
          Image URL saved
        </p>
      ) : null}

      <div className="mt-1 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEdit(item)}
          className="h-8 rounded-[12px] border-[color:var(--line)] bg-white/80 text-[10px]"
        >
          <PencilLine className="size-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onDelete(item)}
          disabled={isDeleting}
          className="h-8 rounded-[12px] border border-rose-200 bg-rose-50 text-[10px] text-rose-700 hover:bg-rose-100"
        >
          <Trash2 className="size-3.5" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}
