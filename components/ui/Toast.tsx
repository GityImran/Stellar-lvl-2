"use client";

import { useToast } from "@/lib/toast-context";
import { CheckCircle2, XCircle, AlertCircle, Loader2, X, ExternalLink } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border-4 border-blue-200 rounded-3xl p-4 shadow-[4px_4px_0_0_rgba(191,219,254,1)] flex items-start gap-3 animate-[fadeSlideIn_0.3s_ease-out] pointer-events-auto"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === "success" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            {toast.type === "error" && <XCircle className="w-6 h-6 text-red-500" />}
            {toast.type === "info" && <AlertCircle className="w-6 h-6 text-blue-400" />}
            {toast.type === "loading" && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-sm font-black text-blue-950 uppercase tracking-wider">{toast.title}</h4>
            {toast.message && <p className="text-xs font-bold text-blue-500 mt-1 leading-relaxed">{toast.message}</p>}
            {toast.link && (
              <a
                href={toast.link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-lg border border-blue-100"
              >
                {toast.link.label} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-blue-300 hover:text-blue-600 transition-colors p-1.5 rounded-xl hover:bg-blue-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
