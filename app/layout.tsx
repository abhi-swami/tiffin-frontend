import type { Metadata } from "next";
import { Manrope, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import { cookies } from "next/headers";
import { verifySignedRoleCookie } from "@/utils/role-cookies";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiffin",
  description: "Fresh tiffin delivery with a mobile-first ordering flow.",
};

export default await async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore =await cookies();
  const roleCookie = cookieStore.get("tiffin.role")?.value;

  const role : string | null = await verifySignedRoleCookie(roleCookie);

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          <div className="relative flex min-h-full flex-col">
            <Navbar role={role} />

            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
