"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CalendarDays, Camera, Phone, Save } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import type { ProfileRecord } from "@/lib/profile";

type ProfileEditorProps = {
  profile: ProfileRecord;
};

type UpdateProfileResponse = {
  message?: string;
};

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profile.profile_image ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "idle">(
    "idle"
  );

  const avatarLabel = useMemo(() => {
    if (previewUrl) {
      return null;
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (fullName) {
      return fullName
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
    }

    return profile.phone.slice(-2);
  }, [firstName, lastName, previewUrl, profile.phone]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setFeedback("");
    setFeedbackTone("idle");

    if (!file) {
      setPreviewUrl(profile.profile_image ?? "");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setFeedbackTone("idle");

    try {
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("email", email.trim());

      if (selectedImage) {
        formData.append("profile_image", selectedImage);
      }

      const response = await api.put<UpdateProfileResponse>("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshUser();
      router.refresh();

      setFeedback(response.data.message ?? "Profile updated successfully.");
      setFeedbackTone("success");
    } catch (error) {
      setFeedback(getErrorMessage(error, "We could not update your profile."));
      setFeedbackTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="app-panel hero-panel overflow-hidden">
      <div className="hero-grid">
        <div className="mesh-card p-3">
          <div className="relative flex h-full flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-[16px] object-cover shadow-[0_20px_40px_-30px_rgba(14,74,88,0.8)]"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[16px] bg-white/18 text-[12px] font-extrabold text-white shadow-[0_20px_40px_-30px_rgba(14,74,88,0.8)]">
                    {avatarLabel}
                  </div>
                )}

                <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-[12px] bg-white text-[color:var(--brand-strong)] shadow-[0_16px_24px_-18px_rgba(255,255,255,0.85)] transition hover:bg-[color:var(--brand-soft)]">
                  <Camera className="size-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="min-w-0">
                <p className="eyebrow text-white/72">Personal account</p>
                <h2 className="mt-1 text-[12px] font-extrabold tracking-[-0.03em] text-white">
                  {[firstName, lastName].filter(Boolean).join(" ") || "Tiffin user"}
                </h2>
                <p className="tiny-copy mt-1 text-white/82">
                  Keep your details current. Your phone number stays locked.
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <div className="rounded-[14px] bg-white/12 px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10px] text-white/88">
                  <Phone className="size-3.5" />
                  {profile.phone}
                </div>
              </div>
              <div className="rounded-[14px] bg-white/12 px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10px] text-white/88">
                  <CalendarDays className="size-3.5" />
                  Joined {formatDate(profile.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="First name">
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[color:var(--brand-strong)]"
              />
            </Field>

            <Field label="Last name">
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last name"
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[color:var(--brand-strong)]"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-[color:var(--brand-strong)]"
              />
            </Field>

            <Field label="Mobile number">
              <div className="flex items-center rounded-[14px] border border-[color:var(--line)] bg-slate-100 px-3 py-2.5 text-[11px] text-slate-500">
                {profile.phone}
              </div>
            </Field>
          </div>

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

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-9 rounded-[14px] bg-[color:var(--brand-strong)] px-4 text-[10px] text-white hover:bg-[color:var(--brand)]"
            >
              <Save className="size-3.5" />
              {isSubmitting ? "Saving" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

function formatDate(value: ProfileRecord["created_at"]) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
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
