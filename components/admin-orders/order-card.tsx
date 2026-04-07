import { OrderRecord } from "./order-types";
import { cn } from "@/lib/utils";
import { Copy, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminOrderCardProps {
  order: OrderRecord;
}

export function AdminOrderCard({ order }: AdminOrderCardProps) {
  const [copied, setCopied] = useState(false);

  const statusTone = order.payment_status?.toLowerCase() ?? "pending";
  const statusClass = cn(
    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
    statusTone === "paid"
      ? "bg-emerald-100 text-emerald-900"
      : statusTone === "failed"
      ? "bg-rose-100 text-rose-900"
      : "bg-amber-100 text-amber-900"
  );

  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.user.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Header with Order ID and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">#{order.id.slice(0, 8)}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-600">{formatDate(order.order_date)}</span>
        </div>
        <span className={statusClass}>{order.payment_status || "Pending"}</span>
      </div>

      {/* User Details */}
      <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600">
              {order.user.first_name[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{order.user.first_name}</p>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {order.user.phone}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyPhoneNumber}
          className="h-8 w-8 p-0"
        >
          <Copy className={cn("w-4 h-4", copied && "text-green-600")} />
        </Button>
      </div>

      {/* Tiffin Details */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
       
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Items</p>
          <p className="text-sm font-medium text-slate-900">{order.tiffin.items.length}</p>
        </div>
      
      </div>

      {/* Items List - Compact */}
      <div className="space-y-2">
        {order.tiffin.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
            
            </div>
            <span className="text-sm font-medium text-slate-700 ml-2">
              {item.price === null ? "" : `₹${item.price}`}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}
