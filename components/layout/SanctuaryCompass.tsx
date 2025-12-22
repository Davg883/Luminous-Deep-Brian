"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import RoomSelector from "@/components/narrative/RoomSelector";

export default function SanctuaryCompass() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="glass-morphic p-4 rounded-full text-white/80 hover:text-white hover:scale-110 transition-all duration-500 shadow-2xl border border-white/10 group"
                    aria-label="Open Sanctuary Map"
                >
                    <Compass strokeWidth={1} className="w-6 h-6 animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]" />
                </button>
            </div>
            {/* The Journey Map Overlay */}
            <RoomSelector isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
