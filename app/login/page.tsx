import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <section className="relative isolate overflow-hidden px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(238,108,55,0.22),transparent_62%)] blur-3xl" />
      <div className="mx-auto w-full max-w-6xl">
        <LoginForm />
      </div>
    </section>
  );
}
