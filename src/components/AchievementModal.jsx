import { useEffect } from "react";
import { createPortal } from "react-dom";

const MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function formatujDate(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return `${d.getDate()} ${MIESIACE[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AchievementModal({ open, onClose, achievement }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !achievement) return null;

  const a = achievement;
  const etykietaDate = a.unlockedAt ? formatujDate(a.unlockedAt) : null;
  const procent = a.progress && a.progress.target > 0
    ? Math.min(100, Math.round((a.progress.current / a.progress.target) * 100))
    : null;
  // console.log("odznaka:", a.id, a.unlocked);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md flex flex-col rounded-3xl border border-brandPurple/25
                   bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                   shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15)]
                   px-7 py-7"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full
                     border border-brandPurple/30 bg-brandPurple/10
                     flex items-center justify-center text-sm
                     hover:ring-2 ring-brandPurple/50 transition-all duration-200"
          aria-label="Zamknij"
        >✕</button>

        <div className="text-center mb-4 pr-4">
          <div className={`text-7xl mb-3 ${a.unlocked ? "" : "blur-[2px] opacity-50 grayscale"}`}>
            {a.icon}
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1">{a.title}</h2>
          {a.unlocked ? (
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase
                             px-3 py-1 rounded-full
                             bg-brandYellow/20 text-yellow-700 dark:text-brandYellow border border-brandYellow/40">
              ✓ Zdobyta{etykietaDate ? ` · ${etykietaDate}` : ""}
            </span>
          ) : (
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase
                             px-3 py-1 rounded-full
                             bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-300/50 dark:border-white/10">
              🔒 Niezdobyta
            </span>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-4">
          {a.description}
        </p>

        {!a.unlocked && a.progress && (
          <div className="rounded-2xl border border-brandPurple/20 bg-white/60 dark:bg-white/5 px-5 py-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
                Postęp
              </span>
              <span className="text-sm font-black tabular-nums text-brandPurple">
                {a.progress.current} / {a.progress.target}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-brandPurple transition-all duration-500"
                style={{ width: `${procent}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 tabular-nums">
              {procent}% ukończone
            </div>
          </div>
        )}

        {!a.unlocked && !a.progress && (
          <div className="rounded-2xl border border-dashed border-brandPurple/30
                          bg-white/40 dark:bg-white/[0.02] px-4 py-3 text-center
                          text-xs text-gray-500 dark:text-gray-400">
            Spełnij warunki opisane powyżej, aby zdobyć odznakę.
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full px-4 py-3 rounded-full
                     bg-brandPurple text-white text-sm font-bold tracking-wide
                     hover:scale-[1.02] active:scale-95
                     hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                     transition-all duration-200"
        >
          Zamknij
        </button>
      </div>
    </div>,
    document.body,
  );
}
