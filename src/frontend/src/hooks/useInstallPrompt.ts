import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UseInstallPromptReturn {
  canInstall: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
  isInstalled: boolean;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const isInstalled =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setDeferredPrompt(null);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!deferredPrompt) return "unavailable";

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }

    return outcome;
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    install,
    isInstalled,
  };
}
