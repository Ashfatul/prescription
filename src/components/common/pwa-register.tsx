"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after window load to not impact initial hydration or LCP
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Optional: Listen for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("[PWA] New clinic portal version available.");
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn("[PWA] ServiceWorker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

  return null;
}
