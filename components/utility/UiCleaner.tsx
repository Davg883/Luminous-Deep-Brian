"use client";

import { useEffect } from "react";

export function UiCleaner() {
  useEffect(() => {
    const interval = setInterval(() => {
      const candidates = Array.from(document.querySelectorAll("div"));
      candidates.forEach((el) => {
        const classMatch = el.className?.toString().includes("copilotKitPopup");
        const textMatch = el.textContent?.includes("CopilotKit");
        if (classMatch || textMatch) {
          el.remove();
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return null;
}
