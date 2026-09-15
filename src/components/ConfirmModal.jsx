import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Potwierdź",
  cancelLabel = "Anuluj",
  variant = "default",
  icon,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
      else if (e.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const niebezp = variant === "danger";
  const domyslnaIkona = niebezp ? "⚠️" : "❓";
  const klasyPrzycisku = niebezp
    ? "bg-red-500 hover:shadow-[0_4px_20px_rgba(239,68,68,0.45)]"
    : "bg-brandPurple hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border border-brandPurple/25
                   bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                   shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15)]
                   px-7 py-8 text-center"
      >
        <div className="text-5xl mb-3">{icon ?? domyslnaIkona}</div>
        <h2 className="text-xl font-black mb-2">{title}</h2>
        {message && (
          <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            {message}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-full border-2 border-brandPurple/25
                       text-gray-700 dark:text-gray-200 text-sm font-bold tracking-wide
                       hover:bg-brandPurple/5 active:scale-95
                       transition-all duration-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`flex-1 text-white text-sm font-bold
                        px-4 py-3 rounded-full tracking-wide
                        hover:scale-[1.02] active:scale-95
                        transition-all duration-200
                        ${klasyPrzycisku}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
