import { useEffect, useRef } from "react";

/**
 * Props:
 *   open        – boolean
 *   title       – string
 *   message     – string | node
 *   confirmLabel – string (default "Confirm")
 *   cancelLabel  – string (default "Cancel")
 *   variant      – "danger" | "default"
 *   onConfirm   – () => void
 *   onCancel    – () => void
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClasses =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
      : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200/80 overflow-hidden">
        <div className="p-6">
          {title && (
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-slate-900 mb-2"
            >
              {title}
            </h2>
          )}
          {message && (
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
