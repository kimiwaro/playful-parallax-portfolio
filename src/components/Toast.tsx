import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastKind = "info" | "success" | "error";
type ToastItem = { id: string; message: string; kind: ToastKind; ttl?: number };

type ToastApi = {
  success: (msg: string, ttl?: number) => void;
  error: (msg: string, ttl?: number) => void;
  info: (msg: string, ttl?: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "info", ttl = 2500) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((s) => [...s, { id, message, kind, ttl }]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      success: (m: string, ttl?: number) => push(m, "success", ttl),
      error: (m: string, ttl?: number) => push(m, "error", ttl),
      info: (m: string, ttl?: number) => push(m, "info", ttl),
    }),
    [push]
  );

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, t.ttl ?? 2500)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-24 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`max-w-xs w-full rounded-md px-3 py-2 text-sm shadow-md ${
              t.kind === "success" ? "bg-green-600" : t.kind === "error" ? "bg-red-600" : "bg-slate-800"
            } text-white`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
