import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KostProvider } from "@/lib/kost-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kostku Residence - Sistem Operasional & Hunian Kost Eksklusif",
  description: "Website dan portal manajemen 1 gedung kosan modern: status kamar, data penyewa, deposit, pembayaran tagihan, dan laporan fasilitas.",
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
        <KostProvider>{children}</KostProvider>
      </body>
    </html>
  );
}
