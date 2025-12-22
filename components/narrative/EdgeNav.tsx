"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Order: Home -> Workshop -> Lounge -> Study -> Kitchen -> Boathouse -> Luminous Deep
const SEQUENCE = ["home", "workshop", "lounge", "study", "kitchen", "boathouse", "luminous-deep"];

const LABELS: Record<string, string> = {
    home: "THE ARRIVAL",
    workshop: "THE WORKBENCH",
    lounge: "THE HEARTH",
    study: "THE STUDY",
    kitchen: "THE GALLEY",
    boathouse: "THE ANCHORAGE",
    "luminous-deep": "THE DEEP"
};

export default function EdgeNav({ currentSlug }: { currentSlug: string }) {
    const router = useRouter();
    // Normalize slug logic (handle 'seagrove' alias to home if needed, but sticking to SEQUENCE)
    const normalizedSlug = currentSlug === "" ? "home" : currentSlug;
    const currentIndex = SEQUENCE.indexOf(normalizedSlug);

    // If not in sequence, default to no nav
    if (currentIndex === -1) return null;

    const prevSlug = currentIndex > 0 ? SEQUENCE[currentIndex - 1] : null;
    const nextSlug = currentIndex < SEQUENCE.length - 1 ? SEQUENCE[currentIndex + 1] : null;

    return (
        <>
            {/* Left Edge (Previous) */}
            {prevSlug && (
                <div
                    className="fixed top-0 left-0 bottom-0 w-24 z-40 flex items-center justify-start group cursor-pointer pl-6"
                    onClick={() => router.push(`/${prevSlug === 'home' ? '' : prevSlug}`)}
                >
                    {/* Gradient Hint */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-transparent group-hover:from-black/10 transition-all duration-700 pointer-events-none" />

                    {/* Content */}
                    <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out flex flex-col items-center gap-2 relative z-10 text-driftwood/60 group-hover:text-sea dark:text-white/40 dark:group-hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-rl] rotate-180">
                            To {LABELS[prevSlug]}
                        </span>
                    </div>
                </div>
            )}

            {/* Right Edge (Next) */}
            {nextSlug && (
                <div
                    className="fixed top-0 right-0 bottom-0 w-24 z-40 flex items-center justify-end group cursor-pointer pr-6"
                    onClick={() => router.push(`/${nextSlug}`)}
                >
                    {/* Gradient Hint */}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/0 to-transparent group-hover:from-black/10 transition-all duration-700 pointer-events-none" />

                    {/* Content */}
                    <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out flex flex-col items-center gap-2 relative z-10 text-driftwood/60 group-hover:text-sea dark:text-white/40 dark:group-hover:text-white">
                        <ChevronRight className="w-6 h-6" />
                        <span className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-rl]">
                            To {LABELS[nextSlug]}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}
