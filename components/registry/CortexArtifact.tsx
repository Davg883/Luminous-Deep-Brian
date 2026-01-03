"use client";

import { motion } from "framer-motion";
import { ArtifactCard } from "./ArtifactCard";
import { ImagePanel } from "./ImagePanel";

interface CortexArtifactProps {
  title?: string;
  content?: string;
  type?: "Myth" | "Signal" | "Reflection";
  imageUrl?: string;
  caption?: string;
  persistImage?: boolean;
}

export function CortexArtifact({
  title = "Unknown Artefact",
  content = "The archive data is being retrieved...",
  type = "Reflection",
  imageUrl = "",
  caption,
}: CortexArtifactProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start"
    >
      <div className="w-full">
        {imageUrl ? (
          <ImagePanel title="Visual Capture" imageUrl={imageUrl} caption={caption} />
        ) : (
          <div className="rounded-lg border border-slate-700/60 bg-black/70 px-4 py-6 text-xs text-slate-400">
            IMAGE FEED UNAVAILABLE
          </div>
        )}
      </div>
      <ArtifactCard title={title} content={content} type={type} />
    </motion.div>
  );
}
