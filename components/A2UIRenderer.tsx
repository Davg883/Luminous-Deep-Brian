"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ComponentRegistry } from "./registry";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function A2UIRenderer({ roomId, onChangeRoom }: { roomId: string, onChangeRoom?: (id: string) => void }) {
    const roomState = useQuery(api.roomState.getRoomState, { roomId });
    const saveState = useMutation(api.roomState.persistRoomUpdate);
    const [activeUI, setActiveUI] = useState<{ comp: string, props: any } | null>(null);

    // LOOP BREAKER: Track the last seen state to prevent re-render spirals
    const lastStateId = useRef<string | null>(null);

    // 1. Rehydrate from Convex (Long-term Memory)
    useEffect(() => {
        if (roomState?.activeComponent && roomState?.componentProps) {
            const stateId = `${roomState.activeComponent}-${roomState.lastUpdated}`;

            // Only update if the data is ACTUALLY new
            if (stateId !== lastStateId.current) {
                lastStateId.current = stateId;
                setActiveUI({
                    comp: roomState.activeComponent,
                    props: JSON.parse(roomState.componentProps)
                });
            }
        } else if (!roomState) {
            // Only clear if the DB is explicitly empty
            setActiveUI(null);
            lastStateId.current = null;
        }
    }, [roomState]);

    // 2. The Master Tool: update_room_ui
    useCopilotAction({
        name: "update_room_ui",
        description: "The universal tool for movement, visual manifestation, and mission updates. Use 'objective' and 'status' to update the HUD.",
        parameters: [
            { name: "component", type: "string", enum: ["BunkerTerminal", "ArtifactCard", "SystemAlert"], required: true },
            { name: "props", type: "object", required: true },
            { name: "newRoomId", type: "string", required: true },
            { name: "objective", type: "string", required: false, description: "Short mission goal (e.g., 'ANALYZING LEDGER')" },
            { name: "status", type: "string", required: false, description: "System status (e.g., 'SYSTEM: BUSY')" },
        ],
        handler: async ({ component, props, newRoomId, objective, status }) => {
            // Logic for room switching
            if (newRoomId !== roomId && onChangeRoom) {
                onChangeRoom(newRoomId);
            }

            // Logic for visual manifestation
            setActiveUI({ comp: component, props });

            // Persist to Sovereign Memory
            await saveState({
                roomId: newRoomId,
                component,
                props: JSON.stringify(props),
                objective,
                status
            });
        },
    });

    // 3. Make the current room state readable to Brian
    useCopilotReadable({
        description: "The user's current location and the state of the room's displays.",
        value: { roomId, activeUI },
    });

    if (!activeUI) return null;

    const Component = ComponentRegistry[activeUI.comp];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={lastStateId.current}
                initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative z-40 w-full max-w-3xl"
            >
                {Component ? <Component {...activeUI.props} /> : null}
            </motion.div>
        </AnimatePresence>
    );
}
