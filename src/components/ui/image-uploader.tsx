"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Check } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  presetFallback?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  presetFallback,
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 5MB.");
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          setIsUploading(false);
          return;
        }
      }

      const data = await res.json().catch(() => null);
      setErrorMsg(data?.error ?? "Gagal mengunggah foto. Silakan coba lagi.");
      setIsUploading(false);
    } catch {
      setErrorMsg("Gagal menghubungi server untuk mengunggah foto.");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    if (file) void processFile(file).finally(() => { input.value = ""; });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 group">
          <div className="h-44 w-full relative">
            <img
              src={value}
              alt="Foto Kamar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto</span>
              </button>

              {presetFallback && (
                <button
                  type="button"
                  onClick={() => onChange(presetFallback)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900/90 text-zinc-300 font-medium text-xs hover:text-white transition-colors"
                >
                  Reset Default
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px] truncate max-w-[240px]">
              {value.startsWith("/uploads") || value.startsWith("/api/uploads/rooms/") ? "✓ Tersimpan di server" : "✓ Foto kamar siap"}
            </span>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-white underline hover:text-zinc-300"
            >
              Ubah File
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragOver
              ? "border-white bg-zinc-900/60"
              : "border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-900/30"
          }`}
        >
          {isUploading ? (
            <div className="py-4 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-xs text-zinc-300">Mengunggah gambar...</span>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Klik untuk pilih foto langsung dari perangkat
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Atau seret & lepas file gambar ke area ini (JPG, PNG, WEBP max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-rose-400 mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
