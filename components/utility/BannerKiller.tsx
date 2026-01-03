"use client";

import { useEffect } from "react";

/**
 * BannerKiller - Nuclear Option with MutationObserver
 * V3.0: Watches DOM for any CopilotKit elements and removes them instantly
 */
export function BannerKiller() {
    useEffect(() => {
        // Nuclear nuke function
        const nuke = () => {
            // 1. Standard DOM cleanup
            const elements = document.querySelectorAll("div, span, p");
            elements.forEach((el) => {
                const text = el.textContent || "";
                const className = typeof el.className === "string" ? el.className : "";
                if (text.includes("CopilotKit v1.50") ||
                    text.includes("CopilotKit") ||
                    className.includes("copilotKit")) {
                    el.remove();
                }
            });

            const popup = document.querySelector(".copilotKitPopup");
            if (popup) {
                popup.remove();
            }

            // 2. Shadow DOM Search
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.shadowRoot) {
                    el.shadowRoot.querySelectorAll('.copilotKitPopup, .copilotKitButton, div, span, p').forEach(shadowEl => {
                        const text = shadowEl.textContent || "";
                        const className = typeof (shadowEl as any).className === "string" ? (shadowEl as any).className : "";
                        if (
                            text.includes("CopilotKit v1.50") ||
                            text.includes("CopilotKit") ||
                            className.includes("copilotKit") ||
                            className.includes("copilotKitPopup") ||
                            className.includes("copilotKitButton")
                        ) {
                            shadowEl.remove();
                        }
                    });
                }
            });
        };

        // Initial nuke
        nuke();

        // 3. MUTATION OBSERVER - Kill on birth
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        const text = el.textContent || "";
                        const className = typeof (el as any).className === "string" ? (el as any).className : "";

                        // Kill immediately if it matches
                        if (
                            text.includes("CopilotKit v1.50") ||
                            text.includes("CopilotKit") ||
                            className.includes("copilotKit") ||
                            className.includes("copilotKitPopup") ||
                            className.includes("copilotKitButton")
                        ) {
                            console.log('[BannerKiller] NEUTRALIZED:', el);
                            el.remove();
                        }

                        // Check all children recursively
                        const children = el.querySelectorAll("*");
                        children.forEach((child) => {
                            const childText = child.textContent || "";
                            const childClass = typeof (child as any).className === "string" ? (child as any).className : "";
                            if (
                                childText.includes("CopilotKit v1.50") ||
                                childText.includes("CopilotKit") ||
                                childClass.includes("copilotKit")
                            ) {
                                console.log('[BannerKiller] NEUTRALIZED CHILD:', child);
                                child.remove();
                            }
                        });
                    }
                });
            });
        });

        // Watch the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Fallback interval for extra safety
        const interval = setInterval(nuke, 1000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    return null;
}
