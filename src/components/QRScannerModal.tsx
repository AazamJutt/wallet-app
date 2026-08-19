"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "./icons";

interface QRScannerModalProps {
  onScan: (scannedText: string) => void;
  onClose: () => void;
}

export default function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setErrorMsg("Camera access is not supported on this browser.");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Use native BarcodeDetector API if available
        if ("BarcodeDetector" in window) {
          // @ts-expect-error - BarcodeDetector is a web API in modern browsers
          const detector = new window.BarcodeDetector({ formats: ["qr_code", "aztec", "code_128", "pdf417"] });
          const scanLoop = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  onScan(barcodes[0].rawValue);
                  return;
                }
              } catch {
                // Ignore detection frame errors
              }
            }
            animationFrameId = requestAnimationFrame(scanLoop);
          };
          scanLoop();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setErrorMsg("Unable to access camera. Please allow camera permissions or enter data below.");
      }
    }

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 ring-1 ring-white/20 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-[16px] font-bold text-white">Scan QR Code</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 active:scale-95"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Video Viewfinder */}
        <div className="relative aspect-square w-full overflow-hidden bg-black">
          {errorMsg ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white/70">
              <p className="text-[14px] text-amber-300 mb-2">{errorMsg}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="h-full w-full object-cover" playsInline />
              {/* Scanning Target Box */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-56 w-56 rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] animate-pulse relative">
                  <div className="absolute -top-1 -left-1 h-5 w-5 border-t-4 border-l-4 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 h-5 w-5 border-t-4 border-r-4 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-emerald-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Manual Payload Entry */}
        <form onSubmit={handleManualSubmit} className="p-4 flex flex-col gap-2">
          <p className="text-[12px] text-white/50 text-center">Or paste / type QR code payload:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g. TICKET-98742"
              className="flex-1 rounded-xl bg-white/10 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none ring-1 ring-white/15 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-[14px] font-bold text-slate-950 active:scale-95 disabled:opacity-40"
            >
              Use
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
