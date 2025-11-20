// src/utils/qr.ts
export function qrImageUrl(payload: string, size = 240) {
  const encoded = encodeURIComponent(payload);
  // public QR image generator (no dependency). Change provider if you prefer.
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}
