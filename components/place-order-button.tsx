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
    <div className="flex flex-col items-center gap-3">
      <Button
        type="button"
        size="lg"
        disabled={!tiffinId || isSubmitting}
        className="h-12 rounded-2xl bg-[color:var(--brand)] px-8 text-white hover:bg-[color:var(--brand-deep)]"
        onClick={handlePlaceOrder}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Placing order
          </>
        ) : (
          <>
            Place order
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      {errorMessage ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
