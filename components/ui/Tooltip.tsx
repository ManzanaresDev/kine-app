// src/components/ui/Tooltip.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  function updateCoords() {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  return (
    <div
      ref={ref}
      className="relative flex items-center"
      onMouseEnter={() => {
        updateCoords();
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] px-2 py-1 rounded-md bg-stone-800 text-white text-[11px] whitespace-nowrap pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{ left: coords.x, top: coords.y - 6 }}
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
          </div>,
          document.body,
        )}
    </div>
  );
}
