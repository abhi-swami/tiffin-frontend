"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CalendarDays, Camera, Phone, Save, UserCircle2 } from "lucide-react";
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
    <article className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/92 shadow-[0_45px_120px_-65px_rgba(15,23,42,0.75)] backdrop-blur">
      <div className="relative overflow-hidden bg-[linear-gradient(145deg,rgba(255,247,237,0.98),rgba(255,255,255,0.9))] px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.18),transparent_68%)] blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="size-24 rounded-[2rem] object-cover shadow-[0_22px_50px_-30px_rgba(238,108,55,0.65)]"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-[2rem] bg-[color:var(--brand-soft)] text-3xl font-semibold text-[color:var(--brand-deep)] shadow-[0_22px_50px_-30px_rgba(238,108,55,0.65)]">
                  {avatarLabel}
                </div>
              )}

              <label className="absolute -bottom-2 -right-2 flex size-10 cursor-pointer items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white shadow-[0_18px_40px_-24px_rgba(238,108,55,0.75)] transition hover:bg-[color:var(--brand-deep)]">
                <Camera className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">
                Personal account
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {[firstName, lastName].filter(Boolean).join(" ") || "Tiffin user"}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Update your personal details here. Your mobile number stays
                locked for security.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.55)]">
              <Phone className="size-4 text-[color:var(--brand)]" />
              {profile.phone}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.55)]">
              <CalendarDays className="size-4 text-[color:var(--brand)]" />
              Joined {formatDate(profile.created_at)}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
              className="w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[color:var(--brand)]"
            />
          </Field>

          <Field label="Last name">
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
              className="w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[color:var(--brand)]"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[color:var(--brand)]"
            />
          </Field>

          <Field label="Mobile number">
            <div className="flex items-center rounded-[1.5rem] border border-[color:var(--border-soft)] bg-slate-100 px-4 py-3 text-sm text-slate-500">
              {profile.phone}
            </div>
          </Field>
        </div>

        {feedback ? (
          <p
            className={`rounded-[1.5rem] px-4 py-3 text-sm leading-7 ${
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
            className="h-12 rounded-2xl bg-[color:var(--brand)] px-6 text-white hover:bg-[color:var(--brand-deep)]"
          >
            <Save className="size-4" />
            {isSubmitting ? "Saving profile..." : "Save changes"}
          </Button>
        </div>
      </form>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
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
