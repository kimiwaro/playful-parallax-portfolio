// src/components/CharacterEditor.tsx
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
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        // Optional: fill background to avoid transparent PNG
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
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
          },
          "image/png",
        );
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
      // keep console info for debugging
      // eslint-disable-next-line no-console
      console.error("Export failed", err);
      toast.error("Export failed. Try again in the browser.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopySvg = async () => {
    if (!svgRef.current) return;
    try {
      const s = new XMLSerializer().serializeToString(svgRef.current);
      if (!navigator.clipboard?.writeText) {
        toast.error("Clipboard API not available");
        return;
      }
      await navigator.clipboard.writeText(s);
      toast.success("SVG copied to clipboard");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Copy failed", err);
      toast.error("Copy failed");
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
        <g stroke="#111827" strokeWidth="6" fill="none">
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
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Head</span>
            <div className="inline-flex gap-2">
              <button
                aria-pressed={head === "circle"}
                onClick={() => setHead("circle")}
                className={`px-3 py-1 rounded ${head === "circle" ? "bg-indigo-600 text-white" : "bg-white/6 hover:bg-white/10"}`}
              >
                Circle
              </button>
              <button
                aria-pressed={head === "square"}
                onClick={() => setHead("square")}
                className={`px-3 py-1 rounded ${head === "square" ? "bg-indigo-600 text-white" : "bg-white/6 hover:bg-white/10"}`}
              >
                Square
              </button>
              <button
                aria-pressed={head === "triangle"}
                onClick={() => setHead("triangle")}
                className={`px-3 py-1 rounded ${head === "triangle" ? "bg-indigo-600 text-white" : "bg-white/6 hover:bg-white/10"}`}
              >
                Triangle
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="head-color" className="text-sm font-medium">
              Color
            </label>
            <input
              id="head-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Pick head color"
              className="w-10 h-8 p-0 border-0 bg-transparent"
            />
            <div className="ml-2 text-sm text-white/70">{color.toUpperCase()}</div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="accessory" className="text-sm font-medium">
              Accessory
            </label>
           <select
           id="accessory"
           value={accessory}
           onChange={(e) => setAccessory(e.target.value as any)}
           className="px-3 py-1 rounded bg-black text-white border border-white/20"
           aria-label="Accessory"
           >
           <option value="none">None</option>
           <option value="hat">Hat</option>
           <option value="glasses">Glasses</option>
           </select>

          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={busy}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
            >
              {busy ? "Exporting..." : "Export PNG"}
            </button>

            <button
              onClick={handleCopySvg}
              className="px-4 py-2 rounded-md bg-white/6 hover:bg-white/10"
            >
              Copy SVG
            </button>

            <button
              onClick={() => {
                // quick randomize for fun/demo
                setHead((h) => {
                  const opts: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];
                  return opts[(opts.indexOf(h) + 1) % opts.length];
                });
                setAccessory((a) => {
                  const opts: ("none" | "hat" | "glasses")[] = ["none", "hat", "glasses"];
                  return opts[(opts.indexOf(a) + 1) % opts.length];
                });
                toast.info("Randomized character");
              }}
              className="px-3 py-2 rounded-md bg-white/6 hover:bg-white/10 text-sm"
              aria-label="Randomize character"
            >
              Randomize
            </button>
          </div>

          <p className="mt-2 text-xs text-white/60">Tip: use Export PNG to save for sharing or demo slides.</p>
        </div>

        {/* Preview column */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[360px] h-[270px] rounded-lg border border-white/8 bg-[rgba(0,0,0,0.12)] flex items-center justify-center">
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
              <g>
                {headElement}
                {accessoryElement}
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
              onClick={handleCopySvg}
              className="px-4 py-2 rounded-md bg-white/6 hover:bg-white/10"
            >
              Copy SVG
            </button>
          </div>

          <p className="mt-3 text-xs text-white/60">Tip: export or copy the SVG to customize further.</p>
        </div>
      </div>
    </div>
  );
}
