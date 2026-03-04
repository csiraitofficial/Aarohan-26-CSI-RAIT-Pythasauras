import { useEffect, useMemo, useSyncExternalStore } from "react";

type ThemeMode = "system" | "light" | "dark";

type ThemeSnapshot = {
  mode: ThemeMode;
  resolved: "light" | "dark";
};

const storageKey = "robobuddy.theme";

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(storageKey);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

function writeStoredMode(mode: ThemeMode) {
  window.localStorage.setItem(storageKey, mode);
}

function getSystemPrefersDark(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}

function getSnapshot(): ThemeSnapshot {
  const mode = readStoredMode();
  const sysDark = getSystemPrefersDark();
  const resolved = mode === "system" ? (sysDark ? "dark" : "light") : mode;
  return { mode, resolved };
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey) callback();
  };

  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener("storage", onStorage);
  mql.addEventListener("change", callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    mql.removeEventListener("change", callback);
  };
}

export function useTheme() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => ({ mode: "system", resolved: "light" }));

  useEffect(() => {
    const root = document.documentElement;
    const shouldBeDark = snap.resolved === "dark";
    root.classList.toggle("dark", shouldBeDark);
    root.style.colorScheme = snap.resolved;
  }, [snap.resolved]);

  const api = useMemo(() => {
    function setMode(mode: ThemeMode) {
      writeStoredMode(mode);
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
    }

    function toggle() {
      const next: ThemeMode = snap.resolved === "dark" ? "light" : "dark";
      setMode(next);
    }

    return {
      mode: snap.mode,
      resolved: snap.resolved,
      setMode,
      toggle,
    } as const;
  }, [snap.mode, snap.resolved]);

  return api;
}
