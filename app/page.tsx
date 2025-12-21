"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SceneStage from "@/components/narrative/SceneStage";
import Atmosphere from "@/components/layout/Atmosphere";
import TheDock from "@/components/layout/TheDock";

export default function Home() {
    const scene = useQuery(api.public.scenes.getScene, { slug: "home" });

    if (!scene) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-sand">
                <div className="w-8 h-8 border-2 border-driftwood/20 border-t-driftwood rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="relative w-full h-screen overflow-hidden">
            <Atmosphere domain="home" />

            <SceneStage mediaUrl={scene.backgroundMediaUrl}>
            </SceneStage>

            {/* The Arrival Line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <h1 className="font-serif text-2xl md:text-3xl text-driftwood opacity-60 italic tracking-widest text-center max-w-2xl leading-relaxed animate-in fade-in duration-1000 slide-in-from-bottom-4">
                    "You’ve arrived at a place where intelligence slows down enough to be understood."
                </h1>
            </div>

            <TheDock />
        </main>
    );
}
