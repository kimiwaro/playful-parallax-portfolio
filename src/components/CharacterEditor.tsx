import React, { useRef, useState } from "react";
import { useToast } from "./Toast";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * Small helper to convert an inline SVG element to a PNG and trigger download.
 * Keeps dependencies minimal (no external libs).
 */
async function exportSvgToPng(svgEl: SVGSVGElement, filename = "character.png") {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  // Use same dimensions as the SVG viewBox if present, fallback to 800x600
  const viewBox = svgEl.getAttribute("viewBox");
  let width = 800;
  let height = 600;
  if (viewBox) {
    const parts = viewBox.split(" ").map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      width = parts[2];
      height = parts[3];
    }
  } else {
    const w = svgEl.getAttribute("width");
    const h = svgEl.getAttribute("height");
    if (w && h) {
      width = parseInt(w, 10) || width;
      height = parseInt(h, 10) || height;
    }
  }

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        // Optional: fill background to avoid transparent PNG (change as needed)
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to export image"));
            return;
          }
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(link.href);
          URL.revokeObjectURL(url);
          resolve();
        }, "image/png");
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export default function CharacterEditor() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [head, setHead] = useState<"circle" | "square" | "triangle">("circle");
  const [color, setColor] = useState<string>("#7c3aed");
  const [accessory, setAccessory] = useState<"none" | "hat" | "glasses">("none");
  const [busy, setBusy] = useState(false);

  const reduced = usePrefersReducedMotion();
  const toast = useToast();

  const handleExport = async () => {
    if (!svgRef.current) return;
    setBusy(true);
    try {
      await exportSvgToPng(svgRef.current, "playful-character.png");
      toast.success("Export complete");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed. Try again in the browser.");
    } finally {
      setBusy(false);
    }
  };

  const headElement = (() => {
    switch (head) {
      case "circle":
        return <circle cx="200" cy="130" r="70" fill={color} />;
      case "square":
        return <rect x="130" y="60" width="140" height="140" rx="20" fill={color} />;
      case "triangle":
        return <path d="M200 50 L270 200 L130 200 Z" fill={color} />;
    }
  })();

  const accessoryElement = (() => {
    if (accessory === "hat") {
      return (
        <g transform="translate(0,-10)">
          <rect x="130" y="40" width="140" height="28" rx="8" fill="#111827" />
          <rect x="150" y="20" width="100" height="40" rx="18" fill="#111827" opacity="0.95" />
        </g>
      );
    }
    if (accessory === "glasses") {
      return (
        <g stroke="#111827" strokeWidth="6" fill="none" transform="translate(0,0)">
          <circle cx="160" cy="130" r="28" fill="#ffffff" opacity="0.08" />
          <circle cx="240" cy="130" r="28" fill="#ffffff" opacity="0.08" />
          <path d="M188 130 L212 130" stroke="#111827" strokeWidth="4" />
        </g>
      );
    }
    return null;
  })();

  return (
    <div className="rounded-xl p-4 bg-[rgba(255,255,255,0.04)] border border-white/8 backdrop-blur-md">
      <h3 className="text-lg font-semibold">Character editor</h3>
      <p className="text-sm text-white/80 mt-1">Quickly compose a character and export as PNG.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Head shape</label>
          <div className="mt-2 inline-flex gap-2" role="tablist" aria-label="Head shape">
            <button
              className={`px-3 py-1 rounded-md ${head === "circle" ? "bg-white/10" : "bg-white/4"}`}
              onClick={() => setHead("circle")}
              aria-pressed={head === "circle"}
            >
              Circle
            </button>
            <button
              className={`px-3 py-1 rounded-md ${head === "square" ? "bg-white/10" : "bg-white/4"}`}
              onClick={() => setHead("square")}
              aria-pressed={head === "square"}
            >
              Square
            </button>
            <button
              className={`px-3 py-1 rounded-md ${head === "triangle" ? "bg-white/10" : "bg-white/4"}`}
              onClick={() => setHead("triangle")}
              aria-pressed={head === "triangle"}
            >
              Triangle
            </button>
          </div>

          <label className="block text-sm font-medium mt-4">Primary color</label>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Color palette">
            {["#7c3aed", "#06B6D4", "#f59e0b", "#ef4444"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ background: c }}
                aria-checked={color === c}
                className={`w-8 h-8 rounded-full ring-2 ${color === c ? "ring-white/60" : "ring-white/10"}`}
                title={c}
              />
            ))}
          </div>

          <label className="block text-sm font-medium mt-4">Accessory</label>
          <div className="mt-2 inline-flex gap-2" role="radiogroup" aria-label="Accessory">
            <button
              className={`px-3 py-1 rounded-md ${accessory === "none" ? "bg-white/10" : "bg-white/4"}`}
              onClick={() => setAccessory("none")}
              aria-pressed={accessory === "none"}
            >
              None
            </button>
            <button
              className={`px-3 py-1 rounded-md ${accessory === "hat" ? "bg-white/10" : "bg-white/4"}`}
              onClick={() => setAccessory("hat")}
              aria-pressed={accessory === "hat"}
            >
              Hat
            </button>
            <button
              className={`px-3 py-1 rounded-md ${accessory === "glasses" ? "bg-white/10" : "bg-white/4"}`}
              onClick={() => setAccessory("glasses")}
              aria-pressed={accessory === "glasses"}
            >
              Glasses
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-[360px] h-[270px] rounded-lg border border-white/8 bg-[rgba(0,0,0,0.12)] flex items-center justify-center"
            aria-hidden="false"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 400 300"
              width="320"
              height="240"
              role="img"
              aria-label="Character preview"
              className={`transform ${reduced ? "" : "transition-transform duration-500 ease-out"}`}
            >
              <rect width="100%" height="100%" fill="transparent" />
              <g transform="translate(0,0)">
                {headElement}
                {accessoryElement}
                {/* simple shine */}
                <ellipse cx="280" cy="50" rx="50" ry="20" fill="#ffffff" opacity="0.06" />
                <g transform="translate(200,210)" opacity="0.12">
                  <rect x="-80" y="0" width="160" height="30" rx="12" fill="#000000" />
                </g>
              </g>
            </svg>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleExport}
              disabled={busy}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
            >
              {busy ? "Exporting..." : "Export PNG"}
            </button>
            <button
              onClick={() => {
                // quick copy of SVG markup to clipboard
                if (!svgRef.current) return;
                const s = new XMLSerializer().serializeToString(svgRef.current);
                navigator.clipboard?.writeText(s).then(
                  () => toast.success("SVG copied to clipboard"),
                  () => toast.error("Copy failed")
                );
              }}
              className="px-4 py-2 rounded-md bg-white/6 hover:bg-white/10"
            >
              Copy SVG
            </button>
          </div>

          <p className="mt-3 text-xs text-white/60">Tip: use Export PNG to save for sharing or demo slides.</p>
        </div>
      </div>
    </div>
  );
}
