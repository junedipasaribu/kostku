"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Palette, RotateCcw, X } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

const colorPresets = [
  { label: "Biru", value: "#2563eb" },
  { label: "Teal", value: "#0f766e" },
  { label: "Hijau", value: "#15803d" },
  { label: "Ungu", value: "#7e22ce" },
  { label: "Merah bata", value: "#b4534b" },
  { label: "Emas", value: "#c5a880" },
];

export function BackgroundPicker({
  className = "",
  compact = false,
  placement = "bottom",
}: {
  className?: string;
  compact?: boolean;
  placement?: "top" | "bottom";
}) {
  const { backgroundColor, setBackgroundColor, resetBackgroundColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const pickerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Pilih warna latar"
        aria-expanded={isOpen}
        aria-controls={pickerId}
        title="Pilih warna latar"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Palette className="h-4 w-4 shrink-0" />
        {!compact && <span className="text-xs font-semibold">Warna latar</span>}
      </button>

      {isOpen && (
        <div
          id={pickerId}
          role="dialog"
          aria-label="Pengaturan warna latar"
          className={`absolute right-0 z-[90] w-72 rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 shadow-2xl ${placement === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Warna latar</h2>
              <p className="mt-0.5 text-[11px] text-zinc-400">Dipadukan dengan tema agar teks terbaca.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup pemilih warna" className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <label htmlFor={`${pickerId}-color`} className="text-xs font-medium text-zinc-300">Pilih warna sendiri</label>
            <input
              id={`${pickerId}-color`}
              type="color"
              value={backgroundColor ?? "#283548"}
              onChange={(event) => setBackgroundColor(event.target.value)}
              aria-label="Warna latar kustom"
              className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 p-1"
            />
          </div>

          <p className="mb-2 text-[11px] font-medium text-zinc-400">Warna pilihan</p>
          <div className="grid grid-cols-6 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                title={preset.label}
                aria-label={`Pilih warna ${preset.label}`}
                aria-pressed={backgroundColor?.toLowerCase() === preset.value}
                onClick={() => setBackgroundColor(preset.value)}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${backgroundColor?.toLowerCase() === preset.value ? "border-white ring-2 ring-blue-400" : "border-white/30"}`}
                style={{ backgroundColor: preset.value }}
              />
            ))}
          </div>

          <button type="button" onClick={resetBackgroundColor} className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" /> Kembalikan warna tema
          </button>
        </div>
      )}
    </div>
  );
}
