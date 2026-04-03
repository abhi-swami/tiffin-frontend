"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
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

  const cleanPhoneNumber = phoneNumber
    .replace(/\D/g, "")
    .slice(0, 10)
    .toString();
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
        response.data.message ??
          "OTP sent. Check your phone and enter the code.",
      );
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(
        getErrorMessage(error, "We could not send the OTP right now."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phonePattern.test(cleanPhoneNumber)) {
      setFeedbackTone("error");
      setFeedback(
        "Phone number looks incomplete. Please review it and try again.",
      );
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
      setFeedback(
        response.data.message ?? "Phone number verified. Redirecting you home.",
      );
      startTransition(() => {
        router.push("/");
      });
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(
        getErrorMessage(error, "OTP verification failed. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)] backdrop-blur">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">
            <ShieldCheck className="size-4" />
            Secure access
          </div>

          <div className="space-y-3">
            <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Login with your phone number and OTP
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              Sign in quickly to manage meal plans, delivery addresses, and
              active subscriptions without remembering a password.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Phone number
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3 shadow-inner shadow-orange-50">
                <span className="text-sm font-semibold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            {otpRequested ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Enter OTP
                </span>
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3 shadow-inner shadow-orange-50">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6 digit code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    className="w-full bg-transparent text-base tracking-[0.35em] text-slate-900 outline-none placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </div>
              </label>
            ) : null}

            {feedback ? (
              <p
                className={`rounded-2xl px-4 py-3 text-sm ${
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 rounded-2xl bg-[color:var(--brand)] px-5 text-white hover:bg-[color:var(--brand-deep)]"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Please wait
                  </>
                ) : otpRequested ? (
                  "Verify OTP"
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
                  className="h-12 rounded-2xl border-[color:var(--border-soft)] bg-transparent px-5"
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

        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_44%),linear-gradient(180deg,#ee6c37_0%,#c74e24_100%)] p-6 text-white sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_54%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="inline-flex w-fit items-center gap-3 rounded-3xl bg-white/12 px-4 py-3 backdrop-blur-sm">
              <Smartphone className="size-5" />
              <span className="text-sm font-medium">OTP-first onboarding</span>
            </div>

            <div className="space-y-4">
              <p className="max-w-xs text-3xl font-semibold leading-tight">
                Faster checkout for repeat customers who just want good food on
                time.
              </p>
              <ul className="space-y-3 text-sm text-orange-50/90">
                <li>Phone-based login with no password fatigue.</li>
                <li>Reusable API client powered by your env base URL.</li>
                <li>Works well for returning customers on mobile.</li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-white/20 bg-black/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-orange-50/85">
                Suggested API endpoints
              </p>
              <p className="mt-2 font-mono text-sm text-white">
                POST /auth/send-otp
              </p>
              <p className="font-mono text-sm text-white">
                POST /auth/verify-otp
              </p>
            </div>
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
