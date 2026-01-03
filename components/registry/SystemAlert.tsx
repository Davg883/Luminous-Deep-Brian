"use client";

import { motion } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

interface SystemAlertProps {
    message?: string;
    severity?: "warning" | "critical";
    showRestoreFeed?: boolean;
}

/**
 * SystemAlert — The Glitch Gate
 * 
 * A red-tinted "Signal Lost" style alert used for system
 * interruptions, paywalls, and critical notifications.
 * Integrates with Stripe for payment recovery.
 * 
 * Seaview Aesthetic:
 * - Palette: Deep crimson, emergency amber
 * - Effect: Glitch text, pulsing border
 * - Voice: Julian (CTO) — terse, operational
 */
export function SystemAlert({
    message = "A system anomaly has been detected.",
    severity = "warning",
    showRestoreFeed = false
}: SystemAlertProps) {
    const createSession = useAction(api.stripe.createCheckoutSession);
    const [loading, setLoading] = useState(false);

    const handleRestoreFeed = async () => {
        setLoading(true);
        try {
            const returnUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : undefined;
            const { url } = await createSession({
                priceId: "price_1SjhYIFkJMEwhRrU1cDkQVMI",
                mode: "payment",
                returnUrl
            });
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Uplink establishment failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const colourScheme = severity === "critical"
        ? { border: "border-red-900", text: "text-red-600", bg: "bg-red-950/20", glow: "shadow-[0_0_30px_rgba(220,38,38,0.2)]" }
        : { border: "border-amber-900", text: "text-amber-600", bg: "bg-amber-950/20", glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]" };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`relative border-2 ${colourScheme.border} ${colourScheme.bg} ${colourScheme.glow} p-6 overflow-hidden`}
        >
            {/* Glitch Scanline Animation */}
            <motion.div
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`absolute left-0 right-0 h-px ${severity === "critical" ? "bg-red-500/50" : "bg-amber-500/50"}`}
            />

            {/* Header */}
            <motion.div
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className={`${colourScheme.text} font-mono font-bold uppercase text-xl mb-2 tracking-wider`}
            >
                SIGNAL INTERRUPTED
            </motion.div>

            {/* Message */}
            <p className={`${severity === "critical" ? "text-red-800/80" : "text-amber-800/80"} font-mono text-sm mb-4`}>
                {message}
            </p>

            {/* Restore Feed Button */}
            {showRestoreFeed && (
                <button
                    onClick={handleRestoreFeed}
                    disabled={loading}
                    className={`
            group relative px-6 py-2 
            ${severity === "critical" ? "bg-red-950/30 border-red-900 text-red-500 hover:bg-red-900/40" : "bg-amber-950/30 border-amber-900 text-amber-500 hover:bg-amber-900/40"} 
            border font-mono text-xs uppercase tracking-wider
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    {loading ? "ESTABLISHING UPLINK..." : "[ RESTORE FEED ]"}
                </button>
            )}

            {/* Corner Decorations */}
            <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${colourScheme.border}`} />
            <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${colourScheme.border}`} />
            <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${colourScheme.border}`} />
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${colourScheme.border}`} />
        </motion.div>
    );
}
