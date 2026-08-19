"use client";

import { useMemo } from "react";
import { generateQRMatrix } from "@/lib/qrGenerator";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export default function QRCodeDisplay({
  value,
  size = 180,
  className = "",
  darkColor = "#0f172a",
  lightColor = "#ffffff",
}: QRCodeDisplayProps) {
  const matrix = useMemo(() => {
    if (!value) return null;
    try {
      return generateQRMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 text-[12px] rounded-lg p-2 ${className}`}>
        Invalid QR Data
      </div>
    );
  }

  const count = matrix.length;

  return (
    <div className={`relative overflow-hidden rounded-xl p-2.5 bg-white shadow-md inline-block ${className}`}>
      <svg
        viewBox={`0 0 ${count} ${count}`}
        className="w-full h-full"
        style={{ width: size, height: size }}
        shapeRendering="crispEdges"
      >
        <rect width={count} height={count} fill={lightColor} />
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect key={`${r}-${c}`} x={c} y={r} width={1.02} height={1.02} fill={darkColor} />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
