"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const timeout = window.setTimeout(onClose, 4000); return () => window.clearTimeout(timeout); }, [onClose]);
  return <div role="status" className="fixed right-5 top-5 z-[60] flex w-[min(32rem,calc(100vw-2.5rem))] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-lg"><CheckCircle2 className="size-5 shrink-0" />{message}<button type="button" onClick={onClose} aria-label="Dismiss notification" className="ml-auto"><X className="size-4" /></button></div>;
}
