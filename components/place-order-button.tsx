"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

type PlaceOrderButtonProps = {
  tiffinId?: number;
};

export function PlaceOrderButton({ tiffinId }: PlaceOrderButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePlaceOrder() {
    if (!tiffinId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post(
        "/new-order",
        { tiffin_id: tiffinId },
        { withCredentials: true }
      );

      router.push("/orders");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data;

        if (
          apiMessage &&
          typeof apiMessage === "object" &&
          "message" in apiMessage &&
          typeof apiMessage.message === "string"
        ) {
          setErrorMessage(apiMessage.message);
        } else if (typeof apiMessage === "string" && apiMessage.trim()) {
          setErrorMessage(apiMessage);
        } else {
          setErrorMessage("We could not place the order right now.");
        }
      } else {
        setErrorMessage("We could not place the order right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="eyebrow text-[color:var(--brand-strong)]">Ready to order</p>
        <p className="tiny-copy text-slate-600">
          Place today&apos;s tiffin in one quick step.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={!tiffinId || isSubmitting}
        className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-4 text-[10px] text-white hover:bg-[color:var(--brand)]"
        onClick={handlePlaceOrder}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-3.5 animate-spin" />
            Placing
          </>
        ) : (
          <>
            Place order
            <ArrowRight className="size-3.5" />
          </>
        )}
      </Button>

      {errorMessage ? (
        <p className="rounded-[14px] bg-rose-50 px-3 py-2 text-[10px] leading-[1.15] text-rose-700 sm:ml-auto">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
