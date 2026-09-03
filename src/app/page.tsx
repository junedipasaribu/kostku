"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CoverFlowCarousel, 
  CarouselItem, 
  defaultRooms 
} from "@/components/ui/3-d-coverflow-carousel";
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

export default function Home() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const whatsappNumber = "6281234567890"; // Dapat dikonfigurasi via env

  const handleBooking = (roomTitle: string) => {
    const text = encodeURIComponent(
      `Halo Pengelola Kostku, saya tertarik dan ingin menanyakan ketersediaan kamar ${roomTitle}. Bisakah saya jadwalkan survey lokasi?`
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
                KOST<span className="text-[#c5a880]">KU</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                Residence
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
            <Link
              href="/demo"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
            >
              <span>Demo Carousel</span>
            </Link>
            <button
              onClick={() => handleBooking("Umum")}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#c5a880] to-[#a48256] text-black hover:opacity-95 shadow-md shadow-[#c5a880]/25 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Hubungi Pengelola</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#c5a880] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hunian Kost Eksklusif, Tenang & Strategis</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Kenyamanan Rumah, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e7d7c1] via-[#c5a880] to-[#8a6839]">
            Fasilitas Bintang Lima.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Tempat istirahat dan berkarya yang tenang, dilengkapi smart access 24 jam, WiFi kecepatan tinggi, kamar mandi dalam air panas, dan suasana aman.
        </p>

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

      {/* 3. The 3D Coverflow Carousel Component */}
      <section id="kamar" className="relative border-y border-white/5 my-8">
        <CoverFlowCarousel
          items={defaultRooms}
          sectionLabel="PREVIEW TIPE KAMAR PILIHAN"
          autoplay={true}
          autoplayDelay={4500}
          onCtaClick={(item) => handleBooking(`${item.titleLine1} ${item.titleLine2 || ""}`)}
        />
      </section>

      {/* 4. Daftar & Spesifikasi Kamar Lengkap */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pilihan Kamar & Tarif Sewa
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            Semua kamar sudah terisi furnitur lengkap (*fully furnished*). Cukup bawa koper dan nikmati fasilitasnya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Room 1 */}
          <div className="rounded-3xl bg-zinc-900/50 border border-white/10 p-6 flex flex-col justify-between hover:border-[#c5a880]/50 transition-all group">
            <div>
              <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
                  alt="Suite Executive"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#c5a880]/40 text-[#c5a880] text-xs font-bold">
                  Sisa 1 Kamar
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Suite Executive</h3>
              <p className="text-xs text-zinc-400 mt-1">Ukuran 4 x 4.5 Meter • Lantai 2</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">Rp 2.500.000</span>
                <span className="text-xs text-zinc-400">/ bulan</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Springbed Queen Size (160x200)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Smart TV 32" + AC Daikin Inverter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Kamar Mandi Dalam + Water Heater
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Kulkas Pribadi & Balkon
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleBooking("Suite Executive")}
              className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-[#c5a880] hover:text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Booking Kamar Ini</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Room 2 */}
          <div className="relative rounded-3xl bg-zinc-900/80 border-2 border-[#c5a880] p-6 flex flex-col justify-between shadow-2xl shadow-[#c5a880]/10 group">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#c5a880] text-black font-black text-[11px] tracking-widest uppercase">
              Paling Populer
            </div>
            <div>
              <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                <img
                  src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
                  alt="Deluxe Cozy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  Tersedia
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Deluxe Cozy Room</h3>
              <p className="text-xs text-zinc-400 mt-1">Ukuran 3.5 x 4 Meter • Lantai 1 & 2</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">Rp 1.950.000</span>
                <span className="text-xs text-zinc-400">/ bulan</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Springbed Single 120x200
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  AC Inverter 1/2 PK Dingin & Hemat
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Kamar Mandi Dalam + Shower
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Meja Kerja Ergonomis & Lemari 2 Pintu
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleBooking("Deluxe Cozy")}
              className="mt-8 w-full py-3 rounded-xl bg-[#c5a880] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#d6bc96] transition-all flex items-center justify-center gap-2"
            >
              <span>Booking Kamar Ini</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Room 3 */}
          <div className="rounded-3xl bg-zinc-900/50 border border-white/10 p-6 flex flex-col justify-between hover:border-[#c5a880]/50 transition-all group">
            <div>
              <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                <img
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
                  alt="Superior Standard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  Tersedia
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Superior Standard</h3>
              <p className="text-xs text-zinc-400 mt-1">Ukuran 3 x 3.5 Meter • Lantai 1</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">Rp 1.500.000</span>
                <span className="text-xs text-zinc-400">/ bulan</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Kasur Single Tebal + Sprei Baru
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  AC & Ventilasi Jendela Luar
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Kamar Mandi Luar Bersih (2:1)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                  Free Listrik & Akses Dapur Bersama
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleBooking("Superior Standard")}
              className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-[#c5a880] hover:text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Booking Kamar Ini</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Fasilitas Bersama */}
      <section id="fasilitas" className="py-20 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Fasilitas Bersama Terbaik
            </h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base">
              Dirancang untuk menunjang aktivitas kerja, belajar, dan kenyamanan hidup harian Anda.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all">
              <Wifi className="w-8 h-8 text-[#c5a880] mb-4" />
              <h4 className="text-base font-bold text-white">WiFi Super Cepat</h4>
              <p className="text-xs text-zinc-400 mt-2">Koneksi dedicated 100 Mbps tanpa lemot untuk zoom & streaming.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all">
              <ShieldCheck className="w-8 h-8 text-[#c5a880] mb-4" />
              <h4 className="text-base font-bold text-white">Keamanan CCTV 24/7</h4>
              <p className="text-xs text-zinc-400 mt-2">Gerbang akses kartu/fingerprint & pantauan kamera keamanan penuh.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all">
              <Coffee className="w-8 h-8 text-[#c5a880] mb-4" />
              <h4 className="text-base font-bold text-white">Dapur & Kulkas</h4>
              <p className="text-xs text-zinc-400 mt-2">Kompor gas, dispenser air mineral gratis, microwave, dan kulkas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all">
              <Car className="w-8 h-8 text-[#c5a880] mb-4" />
              <h4 className="text-base font-bold text-white">Parkir Beratap</h4>
              <p className="text-xs text-zinc-400 mt-2">Area parkir motor dan mobil yang luas, tertutup, dan aman dari hujan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Tata Tertib & FAQ */}
      <section id="peraturan" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-[#c5a880]" />
            <h3 className="text-2xl font-bold text-white">Tata Tertib & Ketentuan Hunian</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
              <Clock className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Jam Bertamu</p>
                <p className="text-xs text-zinc-400 mt-0.5">Tamu diterima di ruang tamu hingga pukul 22.00 WIB demi ketenangan bersama.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
              <HomeIcon className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Lingkungan Bebas Rokok</p>
                <p className="text-xs text-zinc-400 mt-0.5">Dilarang merokok di dalam kamar ber-AC. Area merokok tersedia di balkon luar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
              <Sparkles className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Pembersihan Rutin</p>
                <p className="text-xs text-zinc-400 mt-0.5">Area umum dibersihkan setiap hari oleh staf kebersihan kost.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
              <CheckCircle2 className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Privasi Terjaga</p>
                <p className="text-xs text-zinc-400 mt-0.5">Suasana kondusif untuk istirahat malam dan bekerja dari kost.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c5a880] flex items-center justify-center text-black font-black text-sm">
              K
            </div>
            <span className="font-bold text-white text-base tracking-wide">
              KOST<span className="text-[#c5a880]">KU</span>
            </span>
            <span className="text-xs text-zinc-500">© 2026 Kostku Residence. All rights reserved.</span>
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
