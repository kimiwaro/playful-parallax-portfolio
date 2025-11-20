// src/components/ShareModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { qrImageUrl } from "../utils/qr";
import { useToast } from "./Toast";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
};

export default function ShareModal({ open, onClose, url, title = "Share" }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    setTimeout(() => inputRef.current?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevActive?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    // Try local asset first, fallback to generated QR
    const local = "/assets/qr-share.png";
    const img = new Image();
    img.onload = () => setQrSrc(local);
    img.onerror = () => setQrSrc(qrImageUrl(url, 320));
    img.src = local;
  }, [url]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md mx-4 md:mx-0 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="share-modal-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              Share this demo with others — scan or copy the link.
            </p>
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="ml-auto rounded-md p-2 bg-white/6 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/70">Share link</label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                readOnly
                value={url}
                className="flex-1 px-3 py-2 rounded-md bg-black/20 text-white text-sm"
                aria-label="Share URL"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(url).then(
                    () => toast.success("Link copied to clipboard"),
                    () => toast.error("Copy failed")
                  );
                }}
                className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm"
              >
                Copy
              </button>
            </div>

            <div className="mt-2 text-xs text-white/60">
              Tip: open on mobile and use Export PNG in the editor to save an avatar.
            </div>
          </div>

          <div className="flex flex-col items-center">
            <img
              src={qrSrc}
              alt="QR code for share link"
              className="w-44 h-44 rounded-md bg-white/6 object-cover"
              width={176}
              height={176}
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-sm text-indigo-300 hover:underline"
            >
              Open link
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
