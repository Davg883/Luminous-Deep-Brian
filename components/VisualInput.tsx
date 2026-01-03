"use client";
import { useState, useRef } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { ScanEye, Loader2 } from "lucide-react";

const stripCodeFences = (text: string) => text.replace(/```json|```/g, "").trim();

type VisualInputProps = {
  roomId: string;
  onChangeRoom?: (roomId: string) => void;
};

export function VisualInput({ roomId, onChangeRoom }: VisualInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // 1. Backend Actions
  const analyseVisual = useAction(api.brian.analyseVisual);
  const generateA2UI = useAction(api.brian.generateA2UI);
  const updateRoom = useMutation(api.roomState.persistRoomUpdate);
  const logSpend = useMutation(api.ledger.logSpend);
  
  const { appendMessage } = useCopilotChat();
  const currentRoomId = roomId || "control_room";

  const downscaleImage = (file: File) =>
    new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const attempts = [
          { maxSize: 1024, quality: 0.75 },
          { maxSize: 768, quality: 0.6 },
          { maxSize: 512, quality: 0.5 },
        ];
        const maxBytes = 4.5 * 1024 * 1024;
        let lastBase64 = "";
        for (const attempt of attempts) {
          const scale = Math.min(1, attempt.maxSize / Math.max(img.width, img.height));
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", attempt.quality);
          const base64 = dataUrl.split(",")[1] || "";
          lastBase64 = base64;
          const estimatedBytes = Math.floor((base64.length * 3) / 4);
          if (estimatedBytes <= maxBytes) {
            resolve({ base64, mimeType: "image/jpeg" });
            return;
          }
        }
        resolve({ base64: lastBase64, mimeType: "image/jpeg" });
      };
      img.onerror = () => reject(new Error("Image load failed"));
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = ((onload) => () => {
        URL.revokeObjectURL(objectUrl);
        onload();
      })(img.onload);
      img.onerror = ((onerror) => () => {
        URL.revokeObjectURL(objectUrl);
        onerror?.(new Event("error"));
      })(img.onerror);
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);

    try {
      const { base64: cleanBase64, mimeType } = await downscaleImage(file);

      // A. Gemini Vision Analysis
      const result = await analyseVisual({
        imageBase64: cleanBase64,
        mimeType,
      });

      // B. Parse & Format
      const data = result?.environmentalIntelligence || null;
      
      // C. Determine Room (Vibe Check)
      let targetRoom = currentRoomId;
      let vibeMsg = "VIBE DETECTED: UNCHANGED";

        // D. Lore lookup removed for deterministic HUD formatting.

        const parseFailed = !data || typeof data !== "object";
        const alignmentScore = typeof (data as any)?.alignment_score === "number" ? (data as any).alignment_score : null;
        const roomVibe = typeof (data as any)?.room_vibe === "string" ? (data as any).room_vibe : null;
        const telemetryLines = Array.isArray((data as any)?.telemetry_lines) ? (data as any).telemetry_lines : null;
        const scanTarget = typeof (data as any)?.scan_target === "string" ? (data as any).scan_target : "UNKNOWN TARGET";
        const verdict = typeof (data as any)?.verdict === "string" ? (data as any).verdict : "NO VERDICT";
        const documentDetected = Boolean((data as any)?.document_detected);
        const merchant = typeof (data as any)?.merchant === "string" ? (data as any).merchant : null;
        const total = typeof (data as any)?.total === "string" ? (data as any).total : null;
        const documentDate = typeof (data as any)?.date === "string" ? (data as any).date : null;
        const category = typeof (data as any)?.category === "string" ? (data as any).category : null;

        const terminalLines = !parseFailed && telemetryLines
          ? [
              `SCAN TARGET: ${scanTarget}`,
              `ALIGNMENT: ${alignmentScore ?? "N/A"}%`,
              `VERDICT: ${verdict}`,
              `--------------------------------`,
              ...telemetryLines,
              `--------------------------------`,
              `ROOM VIBE: ${roomVibe || targetRoom}`,
            ]
          : [
              ">> ENCRYPTION ERROR",
              ">> RETRY SCAN",
            ];

        const resolvedRoom = roomVibe || targetRoom;

        if (documentDetected && total) {
          const amountMatch = total.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
          const amountGBP = amountMatch ? Number(amountMatch[1]) : 0;
          const allocation = category || merchant || "Uncategorised";
          const date = documentDate || new Date().toISOString().slice(0, 10);
          const scanId = `scan-${Date.now()}`;
          const ledgerProps = {
            date,
            amountGBP,
            allocation,
            verifiedBy: "Julian",
          };

          window.dispatchEvent(
            new CustomEvent("sanctuary:projection", {
              detail: { component: "BunkerLedger", props: ledgerProps },
            })
          );

          await updateRoom({
            roomId: resolvedRoom,
            component: "BunkerLedger",
            props: JSON.stringify(ledgerProps),
          });

          await logSpend({
            date: ledgerProps.date,
            amountGBP: ledgerProps.amountGBP,
            allocation: ledgerProps.allocation,
            merchant,
            scanId,
            verifiedBy: ledgerProps.verifiedBy,
          });

          window.dispatchEvent(
            new CustomEvent("sanctuary:chat", {
              detail: {
                role: "assistant",
                content: ">> FINANCIAL DATA EXTRACTED. LEDGER UPDATED.",
              },
            })
          );

          if (appendMessage) {
            await appendMessage(
              new TextMessage({
                role: MessageRole.User,
                content: "SYSTEM: Financial document ingested. Ledger updated.",
              })
            );
          }

          return;
        }

        const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

        // F. A2UI Interpretation (Bespoke Rendering)
        let component = "CortexArtifact";
        const header =
          alignmentScore !== null && alignmentScore < 50
            ? "VISUAL CORTEX: DIVERGENCE DETECTED"
            : alignmentScore !== null && alignmentScore >= 80
              ? "VISUAL CORTEX: SYNCED"
              : "VISUAL CORTEX: ACTIVE";

        const glitchLevel =
          alignmentScore !== null && alignmentScore < 50 ? 0.8 : 0;

        const artifactContent = [
          verdict,
          "",
          `Alignment: ${alignmentScore ?? "N/A"}%`,
          `Telemetry: ${telemetryLines ? telemetryLines.join(" | ") : "N/A"}`,
        ].join("\n");

        let props: Record<string, unknown> = {
          title: scanTarget,
          content: artifactContent,
          type: alignmentScore !== null && alignmentScore < 50 ? "Signal" : "Reflection",
          imageUrl,
          caption: scanTarget,
          persistImage: false,
        };

        const normalizeA2UIPayload = (
          payload: { component?: string; props?: unknown } | null | undefined
        ) => {
          if (!payload || typeof payload !== "object") return null;
          let nextProps: any = (payload as any).props;
          if (typeof nextProps === "string") {
            try {
              nextProps = JSON.parse(nextProps);
            } catch {
              nextProps = {};
            }
          }
          if (nextProps && typeof nextProps === "object" && "ui_data" in nextProps) {
            const uiData = (nextProps as any).ui_data;
            if (typeof uiData === "string") {
              try {
                nextProps = JSON.parse(uiData);
              } catch {
                nextProps = {};
              }
            } else if (uiData && typeof uiData === "object") {
              nextProps = uiData;
            }
          }

          const nextComponent = (payload as any).component;
          if (nextComponent === "BunkerTerminal") {
            const resolvedHeader =
              typeof nextProps?.header === "string" ? nextProps.header : header;
            const parsedLines = Array.isArray(nextProps?.lines)
              ? nextProps.lines
              : typeof nextProps?.lines === "string"
                ? nextProps.lines.split("\n").filter(Boolean)
                : [];
            const resolvedLines = parsedLines.length > 0 ? parsedLines : terminalLines;
            const resolvedGlitch =
              typeof nextProps?.glitchLevel === "number" ? nextProps.glitchLevel : glitchLevel;
            const preferArtifact = alignmentScore === null || alignmentScore >= 50;
            if (preferArtifact) {
              return {
                component: "CortexArtifact",
                props: {
                  title: scanTarget,
                  content: [
                    verdict,
                    "",
                    `Alignment: ${alignmentScore ?? "N/A"}%`,
                    `Telemetry: ${telemetryLines ? telemetryLines.join(" | ") : "N/A"}`,
                  ].join("\n"),
                  type: "Reflection",
                  imageUrl,
                  caption: scanTarget,
                  persistImage: false,
                },
              };
            }
            return {
              component: "BunkerTerminal",
              props: { header: resolvedHeader, lines: resolvedLines, glitchLevel: resolvedGlitch },
            };
          }

          if (nextComponent === "ArtifactCard") {
            const title =
              typeof nextProps?.title === "string" ? nextProps.title : scanTarget;
            const content =
              typeof nextProps?.content === "string" ? nextProps.content : artifactContent;
            const type =
              ["Myth", "Signal", "Reflection"].includes(nextProps?.type)
                ? nextProps.type
                : alignmentScore !== null && alignmentScore < 50
                  ? "Signal"
                  : "Reflection";
            return {
              component: "CortexArtifact",
              props: { title, content, type, imageUrl, caption: scanTarget, persistImage: false },
            };
          }

          return null;
        };

        try {
          const instruction = [
            "Generate a single A2UI payload for the Visual Cortex window.",
            "Use only BunkerTerminal or ArtifactCard.",
            "Return JSON only.",
            "Telemetry:",
            terminalLines.join("\n"),
          ].join("\n");

          const a2uiResult = await generateA2UI({
            instruction,
            targetRoom: resolvedRoom,
          });

          let payload = (a2uiResult as { a2uiPayload?: any; rawResponse?: string })?.a2uiPayload;
          const rawResponse = (a2uiResult as { rawResponse?: string })?.rawResponse;
          if (!payload && rawResponse) {
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                payload = JSON.parse(jsonMatch[0]);
              } catch (parseError) {
                console.warn("A2UI JSON parse failed.", parseError);
              }
            }
          }
          const normalized = normalizeA2UIPayload(payload);
          if (normalized) {
            component = normalized.component;
            props = normalized.props;
          }
        } catch (error) {
          console.warn("A2UI generation failed, falling back to terminal.", error);
        }

        if (resolvedRoom !== currentRoomId && onChangeRoom) {
          onChangeRoom(resolvedRoom);
        }

        window.dispatchEvent(
          new CustomEvent("sanctuary:scan-lock", { detail: { durationMs: 12000 } })
        );
        window.dispatchEvent(
          new CustomEvent("sanctuary:projection", {
            detail: { component, props },
          })
        );

        await updateRoom({
          roomId: resolvedRoom,
          component,
          props: JSON.stringify(props),
        });

      // G. Narrative Backup
      if (appendMessage) {
        await appendMessage(
          new TextMessage({
            role: MessageRole.User,
            content: `SYSTEM: Visual scan complete. Vibe: ${targetRoom}. Telemetry displayed on HUD.`
          })
        );
      }
    } catch (error) {
      console.error("Vision Error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={analyzing}
        className="fixed bottom-24 right-8 z-50 flex items-center gap-2 px-4 py-3 bg-cyan-950/80 border border-cyan-500/30 rounded-full text-cyan-400 font-mono text-xs hover:bg-cyan-900/80 transition-all backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.1)] group"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>PROCESSING...</span>
          </>
        ) : (
          <>
            <ScanEye className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>INITIATE SCAN</span>
          </>
        )}
      </button>
    </>
  );
}
