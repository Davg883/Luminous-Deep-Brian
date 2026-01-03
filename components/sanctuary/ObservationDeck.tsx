import React from 'react';

export function ObservationDeck({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full h-full min-h-[60vh] z-30 pointer-events-none">
            {/* 
         The label acts as a visual anchor and ensures 
         the div has a minimum presence in the layout 
       */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
                <h2 className="text-[12rem] font-mono leading-none tracking-tighter">
                    A.I. VISUAL<br />CORTEX
                </h2>
            </div>

            {/* Content layer (Enabled pointer events for buttons) */}
            <div className="relative z-10 pointer-events-auto h-full w-full">
                {children}
            </div>
        </div>
    );
}
