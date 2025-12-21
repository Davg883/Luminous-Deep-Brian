"use client";

import { useState, useEffect, RefObject } from "react";

/**
 * Calculates the proximity of the mouse to the center of a target element.
 * @param ref Reference to the DOM element
 * @param radius The distance (px) at which proximity starts to be detected (returns > 0)
 * @returns A value between 0 (far) and 1 (center)
 */
export function useMouseProximity(ref: RefObject<HTMLElement | null>, radius: number = 300) {
    const [proximity, setProximity] = useState(0);

    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
            const element = ref.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const x = clientX - (rect.left + rect.width / 2);
            const y = clientY - (rect.top + rect.height / 2);

            // Calculate distance to center
            const distance = Math.hypot(x, y);

            // Normalize: 1 at center, 0 at radius distance
            const value = Math.max(0, 1 - distance / radius);

            // Optimize updates - round to 2 decimals to avoid excessive renders if needed, 
            // but for smooth animation usually raw is fine or used in useMotionValue.
            // For React state, let's keep it raw but maybe we want to use RAF if performance hits.
            setProximity(value);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [ref, radius]);

    return proximity;
}
