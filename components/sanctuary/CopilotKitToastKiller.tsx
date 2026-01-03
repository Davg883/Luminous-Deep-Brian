"use client";

import { useEffect } from "react";

export function CopilotKitToastKiller() {
  useEffect(() => {
    const interval = setInterval(() => {
      const toasts = document.querySelectorAll('div[class*="copilotKit-"]');
      toasts.forEach((el) => {
        if (el.textContent?.includes("v1.50")) {
          el.remove();
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
