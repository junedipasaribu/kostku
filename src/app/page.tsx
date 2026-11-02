"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  CoverFlowCarousel,
  type CarouselItem,
} from "@/components/ui/3-d-coverflow-carousel";
import type { BuildingInfo, RoomData } from "@/lib/data";
import {
  Wifi,
  Tv,
  Wind,
  ShieldCheck,
  Coffee,
  Car,
  Sparkles,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  User,
  HelpCircle,
  Home as HomeIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  const [site, setSite] = useState<{ building: Pick<BuildingInfo, "name" | "tagline" | "address" | "ownerPhone" | "rules" | "sharedFacilities"> | null; rooms: RoomData[] }>({ building: null, rooms: [] });
  const whatsappNumber = site.building?.ownerPhone ?? "";

  useEffect(() => {
    fetch("/api/public/site", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload) return;
        setSite({ building: payload.building ?? null, rooms: Array.isArray(payload.rooms) ? payload.rooms as RoomData[] : [] });
      })
      .catch(() => undefined);
  }, []);

  const carouselItems = useMemo<CarouselItem[]>(() => site.rooms.map((room) => ({
    tag: `KAMAR ${room.roomNumber}`,
    titleLine1: room.type.toUpperCase(),
    titleLine2: room.size || undefined,
    desc: room.facilities.join(", "),
    img: room.image,
    ctaText: "Tanya Kamar",
  })), [site.rooms]);

  const handleBooking = (roomTitle: string) => {
    if (!whatsappNumber) return;
    const text = encodeURIComponent(
      `Halo Pengelola ${site.building?.name || "kost"}, saya tertarik dan ingin menanyakan ketersediaan ${roomTitle}. Bisakah saya menjadwalkan survei lokasi?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#090807] text-zinc-100 selection:bg-[#c5a880] selection:text-black">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090807]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#8a6839] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#c5a880]/20">
              K
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white">
                {site.building?.name || "Kostku"}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#kamar" className="hover:text-[#c5a880] transition-colors">Tipe Kamar</a>
            <a href="#fasilitas" className="hover:text-[#c5a880] transition-colors">Fasilitas</a>
            <a href="#peraturan" className="hover:text-[#c5a880] transition-colors">Tata Tertib</a>
            <a href="#lokasi" className="hover:text-[#c5a880] transition-colors">Lokasi</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle compact className="px-2.5 sm:px-3" />
            <Link
              href="/portal"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portal Penghuni</span>
            </Link>
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#c5a880] hover:bg-[#d6bc96] text-black shadow-md shadow-[#c5a880]/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dashboard Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#c5a880] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{site.building?.tagline || "Informasi kamar dan hunian"}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Hunian Nyaman, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e7d7c1] via-[#c5a880] to-[#8a6839]">
            Informasi Terpercaya.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Informasi tarif, fasilitas, dan ketersediaan kamar dikelola langsung oleh pengelola kost.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#kamar"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c5a880] to-[#a48256] text-black font-extrabold text-sm uppercase tracking-wider hover:opacity-95 shadow-lg shadow-[#c5a880]/20 transition-all flex items-center gap-2"
          >
            <span>Lihat Kamar Pilihan</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Login Penghuni & Admin</span>
          </Link>
        </div>

        {/* Quick Highlights / Badges */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl font-black text-[#c5a880]">100 Mbps</span>
            <p className="text-xs text-zinc-400 mt-1">Dedicated Fiber Optic</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl font-black text-[#c5a880]">24 Jam</span>
            <p className="text-xs text-zinc-400 mt-1">CCTV & Akses Mandiri</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl font-black text-[#c5a880]">Water Heater</span>
            <p className="text-xs text-zinc-400 mt-1">Kamar Mandi Dalam</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl font-black text-[#c5a880]">Parkir Luas</span>
            <p className="text-xs text-zinc-400 mt-1">Mobil & Motor Beratap</p>
          </div>
        </div>
      </section>

      {/* Katalog kamar berasal dari data kamar yang tersedia di database. */}
      <section id="kamar" className="relative border-y border-white/5 my-8">
        {carouselItems.length > 0 ? (
          <CoverFlowCarousel
            items={carouselItems}
            sectionLabel="KAMAR TERSEDIA"
            autoplay={carouselItems.length > 1}
            onCtaClick={(item) => handleBooking(item.titleLine1)}
          />
        ) : (
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-white">Kamar tersedia</h2>
            <p className="mt-3 text-sm text-zinc-400">Belum ada kamar yang dipublikasikan. Silakan hubungi pengelola untuk informasi.</p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Pilihan Kamar & Tarif Sewa</h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">Tarif, fasilitas, dan ketersediaan mengikuti data terbaru dari pengelola.</p>
        </div>
        {site.rooms.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {site.rooms.map((room) => (
              <article key={room.id} className="rounded-3xl bg-zinc-900/50 border border-white/10 p-6 flex flex-col hover:border-[#c5a880]/50 transition-all group">
                <div className="relative h-56 rounded-2xl overflow-hidden mb-5 bg-zinc-950">
                  {room.image && <img src={room.image} alt={`Kamar ${room.roomNumber}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold">Tersedia</span>
                </div>
                <h3 className="text-xl font-bold text-white">{room.type} · Kamar {room.roomNumber}</h3>
                <p className="text-xs text-zinc-400 mt-1">{room.size || "Ukuran belum dicatat"} · Lantai {room.floor}</p>
                <p className="mt-4 text-2xl font-black text-white">Rp {room.priceMonthly.toLocaleString("id-ID")} <span className="text-xs font-normal text-zinc-400">/ bulan</span></p>
                <ul className="mt-5 space-y-2 text-xs text-zinc-300">
                  {room.facilities.map((facility) => <li key={facility} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#c5a880]" />{facility}</li>)}
                </ul>
                <button onClick={() => handleBooking(`Kamar ${room.roomNumber} (${room.type})`)} disabled={!whatsappNumber} className="mt-7 w-full py-3 rounded-xl bg-[#c5a880] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#d6bc96] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  <span>Tanya kamar ini</span><ArrowUpRight className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-zinc-400">Daftar kamar tersedia akan tampil di sini.</p>
        )}
      </section>
      {site.building?.sharedFacilities?.length ? (
        <section id="fasilitas" className="py-20 bg-zinc-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Fasilitas Bersama</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {site.building.sharedFacilities.map((facility) => (
                <div key={facility} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <CheckCircle2 className="w-7 h-7 text-[#c5a880] mb-4" />
                  <h3 className="text-base font-bold text-white">{facility}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {site.building?.rules?.length ? (
        <section id="peraturan" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-[#c5a880]" />
              <h2 className="text-2xl font-bold text-white">Tata Tertib Kost</h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
              {site.building.rules.map((rule) => <li key={rule} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]"><CheckCircle2 className="w-5 h-5 text-[#c5a880] shrink-0" /><span>{rule}</span></li>)}
            </ul>
          </div>
        </section>
      ) : null}

      {site.building?.address ? (
        <section id="lokasi" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <MapPin className="mx-auto mb-3 h-6 w-6 text-[#c5a880]" />
          <h2 className="text-xl font-bold text-white">Lokasi</h2>
          <p className="mt-2 text-sm text-zinc-400">{site.building.address}</p>
        </section>
      ) : null}
      {/* 7. Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c5a880] flex items-center justify-center text-black font-black text-sm">
              K
            </div>
            <span className="font-bold text-white text-base tracking-wide">
              {site.building?.name || "Kostku"}
            </span>
            <span className="text-xs text-zinc-500">© {new Date().getFullYear()} {site.building?.name || "Kostku"}</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href="/demo" className="hover:text-white transition-colors">
              Carousel Demo
            </Link>
            <button
              onClick={() => handleBooking("Pertanyaan Umum")}
              className="hover:text-[#c5a880] transition-colors"
            >
              WhatsApp Pengelola
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
