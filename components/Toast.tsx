"use client";

import { useEffect } from "react";

export interface ToastState {
  msg: string;
  kind?: "ok" | "err";
}

export default function Toast({
  toast,
  onClose,
  timeout = 3200,
}: {
  toast: ToastState | null;
  onClose: () => void;
  timeout?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, timeout);
    return () => clearTimeout(t);
  }, [toast, onClose, timeout]);

  if (!toast) return null;
  return <div className={`toast ${toast.kind ?? ""}`}>{toast.msg}</div>;
}
