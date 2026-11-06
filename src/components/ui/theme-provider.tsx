"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";
type ThemeContextValue = {
  theme: Theme;
  backgroundColor: string | null;
  toggleTheme: () => void;
  setBackgroundColor: (color: string) => void;
  resetBackgroundColor: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  backgroundColor: null,
  toggleTheme: () => undefined,
  setBackgroundColor: () => undefined,
  resetBackgroundColor: () => undefined,
});

function validBackgroundColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function applyDocumentPreferences(theme: Theme, backgroundColor: string | null) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (backgroundColor) {
    root.dataset.customBackground = "true";
    root.style.setProperty("--user-background", backgroundColor);
  } else {
    delete root.dataset.customBackground;
    root.style.removeProperty("--user-background");
  }
}

function readGuestPreferences(): { theme: Theme; backgroundColor: string | null } {
  const savedTheme = window.localStorage.getItem("kostku-theme");
  const savedBackground = window.localStorage.getItem("kostku-background");
  return {
    theme: savedTheme === "light" ? "light" : "dark",
    backgroundColor: validBackgroundColor(savedBackground) ? savedBackground : null,
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [backgroundColor, setBackgroundColorState] = useState<string | null>(null);
  const userId = useRef<string | null>(null);

  const hydratePreferences = useCallback(async () => {
    let sessionUser: { id?: string; preferredTheme?: string | null; preferredBackground?: string | null } | null = null;
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.user && typeof payload.user === "object") sessionUser = payload.user;
    } catch {
      // Guest preferences remain available when the session endpoint cannot be reached.
    }

    if (sessionUser?.id) {
      userId.current = sessionUser.id;
      const accountTheme = window.localStorage.getItem(`kostku-theme:${sessionUser.id}`);
      const accountBackground = window.localStorage.getItem(`kostku-background:${sessionUser.id}`);
      const nextTheme: Theme = sessionUser.preferredTheme === "light" || sessionUser.preferredTheme === "dark"
        ? sessionUser.preferredTheme
        : accountTheme === "light" ? "light" : accountTheme === "dark" ? "dark" : "dark";
      const nextBackground = validBackgroundColor(sessionUser.preferredBackground)
        ? sessionUser.preferredBackground
        : validBackgroundColor(accountBackground) ? accountBackground : null;
      setTheme(nextTheme);
      setBackgroundColorState(nextBackground);
      applyDocumentPreferences(nextTheme, nextBackground);
      return;
    }

    userId.current = null;
    const guest = readGuestPreferences();
    setTheme(guest.theme);
    setBackgroundColorState(guest.backgroundColor);
    applyDocumentPreferences(guest.theme, guest.backgroundColor);
  }, []);

  useEffect(() => {
    const handleSessionChanged = () => { void hydratePreferences(); };
    void hydratePreferences();
    window.addEventListener("kostku:session-changed", handleSessionChanged);
    return () => window.removeEventListener("kostku:session-changed", handleSessionChanged);
  }, [hydratePreferences]);

  const savePreferences = useCallback((nextTheme: Theme, nextBackground: string | null) => {
    setTheme(nextTheme);
    setBackgroundColorState(nextBackground);
    applyDocumentPreferences(nextTheme, nextBackground);

    const activeUserId = userId.current;
    if (activeUserId) {
      const themeKey = `kostku-theme:${activeUserId}`;
      const backgroundKey = `kostku-background:${activeUserId}`;
      window.localStorage.setItem(themeKey, nextTheme);
      if (nextBackground) window.localStorage.setItem(backgroundKey, nextBackground);
      else window.localStorage.removeItem(backgroundKey);
      void fetch("/api/auth/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextTheme, backgroundColor: nextBackground }),
      }).catch(() => undefined);
      return;
    }

    window.localStorage.setItem("kostku-theme", nextTheme);
    if (nextBackground) window.localStorage.setItem("kostku-background", nextBackground);
    else window.localStorage.removeItem("kostku-background");
  }, []);

  const toggleTheme = useCallback(() => {
    savePreferences(theme === "dark" ? "light" : "dark", backgroundColor);
  }, [backgroundColor, savePreferences, theme]);

  const setBackgroundColor = useCallback((color: string) => {
    if (validBackgroundColor(color)) savePreferences(theme, color);
  }, [savePreferences, theme]);

  const resetBackgroundColor = useCallback(() => {
    savePreferences(theme, null);
  }, [savePreferences, theme]);

  return (
    <ThemeContext.Provider value={{ theme, backgroundColor, toggleTheme, setBackgroundColor, resetBackgroundColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
