import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KostProvider } from "@/lib/kost-context";
import { ThemeProvider } from "@/components/ui/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kostku | Manajemen Hunian",
  description: "Sistem manajemen hunian kost untuk pengelola dan penghuni.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090807] text-zinc-100">
        <ThemeProvider>
          <KostProvider>{children}</KostProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
