"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  KeyRound,
  LoaderCircle,
  MoveRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

type OtpResponse = {
  message?: string;
};

type VerifyOtpResponse = {
  message?: string;
  token?: string;
};

const phonePattern = /^\d{10}$/;
const otpPattern = /^\d{4,6}$/;

export function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<
    "default" | "success" | "error"
  >("default");

  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "").slice(0, 10);
  const cleanOtp = otp.replace(/\D/g, "").slice(0, 6);

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phonePattern.test(cleanPhoneNumber)) {
      setFeedbackTone("error");
      setFeedback("Enter a valid 10-digit phone number to receive your OTP.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const response = await api.post<OtpResponse>("/auth/send-otp", {
        phone: cleanPhoneNumber,
      });

      setOtpRequested(true);
      setFeedbackTone("success");
      setFeedback(
        response.data.message ?? "OTP sent. Check your phone and enter the code."
      );
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(getErrorMessage(error, "We could not send the OTP right now."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phonePattern.test(cleanPhoneNumber)) {
      setFeedbackTone("error");
      setFeedback("Phone number looks incomplete. Please review it and try again.");
      return;
    }

    if (!otpPattern.test(cleanOtp)) {
      setFeedbackTone("error");
      setFeedback("Enter the 4 to 6 digit OTP that was sent to your phone.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const response = await api.post<VerifyOtpResponse>(
        "/auth/verify-otp",
        {
          phone: cleanPhoneNumber,
          otp: cleanOtp,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      await refreshUser();
      setFeedbackTone("success");
      setFeedback(response.data.message ?? "Phone number verified. Redirecting you home.");

      startTransition(() => {
        router.push("/");
      });
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(getErrorMessage(error, "OTP verification failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="hero-grid">
      <div className="app-panel hero-panel">
        <div className="space-y-2">
          <span className="section-kicker">
            <ShieldCheck className="size-3" />
            OTP access
          </span>

          <div className="space-y-2">
            <h1 className="hero-title max-w-xl text-slate-950">
              Login that behaves better on tiny phones.
            </h1>
            <p className="hero-copy">
              Short labels, cleaner fields, and fewer visual distractions make the
              flow feel lighter from 270px upward.
            </p>
          </div>

          <div className="stat-grid">
            <div className="soft-panel">
              <p className="eyebrow">Step 1</p>
              <p className="tiny-copy mt-1 text-slate-700">
                Enter your 10-digit phone number.
              </p>
            </div>
            <div className="soft-panel">
              <p className="eyebrow">Step 2</p>
              <p className="tiny-copy mt-1 text-slate-700">
                Verify the OTP and return to ordering.
              </p>
            </div>
          </div>

          <form
            className="space-y-2"
            onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}
          >
            <label className="block space-y-1.5">
              <span className="eyebrow">Phone number</span>
              <div className="flex items-center gap-2 rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5">
                <Smartphone className="size-3.5 shrink-0 text-[color:var(--brand-strong)]" />
                <span className="text-[10px] font-semibold text-slate-500">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="w-full bg-transparent text-[11px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            {otpRequested ? (
              <label className="block space-y-1.5">
                <span className="eyebrow">OTP code</span>
                <div className="flex items-center gap-2 rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5">
                  <KeyRound className="size-3.5 shrink-0 text-[color:var(--brand-strong)]" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="4 to 6 digits"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    className="w-full bg-transparent text-[11px] text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>
            ) : null}

            {feedback ? (
              <p
                className={`rounded-[14px] px-3 py-2 text-[10px] leading-[1.15] ${
                  feedbackTone === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : feedbackTone === "error"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {feedback}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-4 text-[10px] text-white hover:bg-[color:var(--brand)]"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Please wait
                  </>
                ) : otpRequested ? (
                  <>
                    Verify OTP
                    <MoveRight className="size-3.5" />
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              {otpRequested ? (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-9 rounded-[14px] border-[color:var(--line)] bg-white/75 px-4 text-[10px]"
                  onClick={() => {
                    setOtpRequested(false);
                    setOtp("");
                    setFeedback("");
                    setFeedbackTone("default");
                  }}
                >
                  Edit number
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="mesh-card p-3">
        <div className="relative flex h-full flex-col gap-2">
          <div className="rounded-[14px] bg-white/12 p-2 backdrop-blur-sm">
            <p className="eyebrow text-white/78">270-320px</p>
            <p className="tiny-copy mt-1 text-white/85">
              Inputs stay stacked, copy stays brief, actions stay thumb friendly.
            </p>
          </div>

          <div className="rounded-[14px] bg-white/12 p-2 backdrop-blur-sm">
            <p className="eyebrow text-white/78">321-480px</p>
            <p className="tiny-copy mt-1 text-white/85">
              Better rhythm, clearer grouping, and more support copy.
            </p>
          </div>

          <div className="mt-auto rounded-[16px] border border-white/18 bg-black/10 p-2">
            <p className="eyebrow text-white/78">Why it feels cleaner</p>
            <ul className="mt-2 space-y-1 text-[10px] leading-[1.14] text-white/84">
              <li>One clear action per step</li>
              <li>Shorter helper text</li>
              <li>Smaller but steadier spacing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
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

  return fallbackMessage;
}
