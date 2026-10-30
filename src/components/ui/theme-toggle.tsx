"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "terang" : "gelap";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Ganti ke tema ${nextTheme}`}
      title={`Ganti ke tema ${nextTheme}`}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white ${className}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className={`text-xs font-semibold ${compact ? "hidden sm:inline" : ""}`}>
        {theme === "dark" ? "Tema terang" : "Tema gelap"}
      </span>
    </button>
  );
}
