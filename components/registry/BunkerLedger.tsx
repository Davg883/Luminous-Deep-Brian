"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type BunkerLedgerProps = {
  entryId?: string;
  date?: string;
  amountGBP?: number;
  allocation?: string;
  verifiedBy?: string;
  signedAt?: number;
  signedBy?: string;
};

export function BunkerLedger({
  entryId,
  date = "UNKNOWN DATE",
  amountGBP = 0,
  allocation = "UNASSIGNED",
  verifiedBy = "Julian",
  signedAt,
  signedBy,
}: BunkerLedgerProps) {
  const [signed, setSigned] = useState(Boolean(signedAt));
  const [isSigning, setIsSigning] = useState(false);
  const signEntry = useMutation(api.ledger.signEntry);

  const formattedAmount = `£${amountGBP.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleSign = async () => {
    if (!entryId || signed || isSigning) return;
    setIsSigning(true);
    try {
      await signEntry({ entryId });
      setSigned(true);
      window.dispatchEvent(
        new CustomEvent("sanctuary:chat", {
          detail: {
            role: "assistant",
            content:
              "Signature verified, OPR. This allocation is now an immutable part of the Seaview Archive. The fibre-optic lines are carrying your neural signature to the lithic substrate.",
          },
        })
      );
    } catch (error) {
      console.warn("[BunkerLedger] Failed to sign ledger entry:", error);
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    if (signedAt) {
      setSigned(true);
    }
  }, [signedAt]);

  return (
    <div className="relative w-full max-w-3xl rounded-md border border-amber-200/30 bg-gradient-to-br from-[#2a2217] via-[#3b2f1f] to-[#1f1911] p-6 text-amber-100/90 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 rounded-md border border-amber-200/10" />

      <div className="flex items-center justify-between border-b border-amber-200/20 pb-3 text-[11px] uppercase tracking-[0.35em] text-amber-200/70">
        <span>Seaview Ledger</span>
        <span>Brass Seal</span>
      </div>

      <div className="mt-4 rounded-md bg-[rgba(12,9,6,0.6)] p-4 shadow-inner">
        <div className="font-serif text-2xl text-amber-100/95">Bunker Ledger</div>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-amber-200/60">
          Sovereign Allocation Record
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-serif">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60">Date</div>
            <div className="mt-1 text-lg text-amber-100/90">{date}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60">Amount (GBP)</div>
            <div className="mt-1 text-lg text-amber-100/90">{formattedAmount}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60">Allocation</div>
            <div className="mt-1 text-lg text-amber-100/90">{allocation}</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-amber-200/20 pt-3 text-xs uppercase tracking-[0.3em] text-amber-200/70">
          <span>Verified</span>
          <span className="rounded border border-amber-200/30 px-3 py-1 text-[10px] tracking-[0.35em] text-amber-200/80">
            JULIAN APPROVAL
          </span>
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-amber-200/60">
          {signed ? signedBy || verifiedBy : verifiedBy}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-amber-200/20 pt-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
            Neural Link
          </span>
          <button
            type="button"
            onClick={handleSign}
            disabled={!entryId || signed || isSigning}
            className="rounded border border-amber-200/40 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-amber-100/90 transition hover:border-amber-200/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sign With Neural Link
          </button>
        </div>
      </div>

      <AnimatePresence>
        {signed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="absolute right-8 top-20 rounded border-2 border-red-700/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.4em] text-red-400 shadow-[0_0_20px_rgba(185,28,28,0.35)] -rotate-12"
          >
            ETCHED IN CANON
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
