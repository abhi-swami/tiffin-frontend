import { UserCircle2 } from "lucide-react";
import { connection } from "next/server";
import { ProfileEditor } from "@/components/profile-editor";
import { getProfile } from "@/lib/profile";

export default async function ProfilePage() {
  await connection();
  const response = await getProfile();
  const profile = response.profile[0] ?? null;

  return (
    <section className="page-shell">
      <div className="page-stack max-w-5xl">
        <div className="space-y-2">
          <span className="section-kicker">Account profile</span>
          <div>
            <h1 className="hero-title text-slate-950">Your profile.</h1>
            <p className="hero-copy mt-1 max-w-2xl">
              Cleaner cards, tighter forms, and smaller content blocks for phones first.
            </p>
          </div>
        </div>

        {!profile ? (
          <div className="app-panel text-center">
            <UserCircle2 className="mx-auto size-8 text-[color:var(--brand)]" />
            <h2 className="mt-2 text-[12px] font-extrabold text-slate-950">
              No profile data available
            </h2>
            <p className="tiny-copy mt-1 text-slate-600">
              Once the backend returns profile data, it will appear here automatically.
            </p>
          </div>
        ) : (
          <ProfileEditor profile={profile} />
        )}
      </div>
    </section>
  );
}
