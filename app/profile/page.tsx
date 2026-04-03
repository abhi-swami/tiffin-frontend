import { UserCircle2 } from "lucide-react";
import { connection } from "next/server";
import { ProfileEditor } from "@/components/profile-editor";
import { getProfile } from "@/lib/profile";

export default async function ProfilePage() {
  await connection();
  const response = await getProfile();
  const profile = response.profile[0] ?? null;

  return (
    <section className="relative isolate overflow-hidden px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.22),transparent_62%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="space-y-4">
          <span className="inline-flex w-fit rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
            Account profile
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your profile
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              A cleaner view of your personal account details.
            </p>
          </div>
        </div>

        {!profile ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-10 text-center shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)]">
            <UserCircle2 className="mx-auto size-10 text-[color:var(--brand)]" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              No profile data available
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Once the backend returns profile data, it will appear here
              automatically.
            </p>
          </div>
        ) : (
          <ProfileEditor profile={profile} />
        )}
      </div>
    </section>
  );
}
