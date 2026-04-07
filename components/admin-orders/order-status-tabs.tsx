"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { statusTabs } from "./order-types";

interface OrderStatusTabsProps {
  activeStatus: string;
}

export function OrderStatusTabs({ activeStatus }: OrderStatusTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {statusTabs.map((tab) => {
        const isActive = tab.key === activeStatus;
        return (
          <Link key={tab.key} href={`/admin-orders/${tab.key}`} className="flex-shrink-0">
            <Button
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50 border-slate-200"
              )}
            >
              <span>{tab.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
