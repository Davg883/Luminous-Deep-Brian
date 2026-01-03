"use client";

import { motion } from "framer-motion";

interface ChoiceCardProps {
  question?: string;
  options?: string[];
}

export function ChoiceCard({
  question = "Clarify selection",
  options = [],
}: ChoiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="relative rounded-lg border border-slate-600/60 bg-black/70 p-5 text-slate-200 shadow-2xl"
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400/70">
        Disambiguation
      </div>
      <div className="mt-3 font-serif text-xl text-slate-100">{question}</div>
      <div className="mt-4 space-y-2 text-sm text-slate-300">
        {options.length > 0 ? (
          options.map((option, idx) => (
            <div
              key={`${option}-${idx}`}
              className="rounded border border-slate-700/60 bg-slate-900/40 px-3 py-2"
            >
              {option}
            </div>
          ))
        ) : (
          <div className="rounded border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-slate-400">
            No options supplied.
          </div>
        )}
      </div>
    </motion.div>
  );
}
