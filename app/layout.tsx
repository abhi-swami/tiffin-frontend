import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiffin",
  description: "Fresh tiffin delivery with quick phone and OTP sign in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          <div className="relative flex min-h-full flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
