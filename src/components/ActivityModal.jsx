import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import MonthlyHeatmap from "./MonthlyHeatmap";
import { getProgress, getStreak } from "../data/progress.js";

export default function ActivityModal({ open, onClose }) {
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

  const podsumowanie = useMemo(() => {
    if (!open) return null;
    const stan = getProgress();
    const seria = getStreak();
    const dziennaM = stan.daily || {};
    const rok = new Date().getFullYear();
    let aktDni = 0;
    let lacXP = 0;
    for (const [iso, d] of Object.entries(dziennaM)) {
      if (!iso.startsWith(`${rok}-`)) continue;
      if ((d.xp || 0) > 0) {
        aktDni += 1;
        lacXP += d.xp || 0;
      }
    }
    // console.log("aktDni:", aktDni, "lacXP:", lacXP);
    return { dziennaM, aktDni, lacXP, seria, rok };
  }, [open]);

  if (!open || !podsumowanie) return null;

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
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-brandPurple/25
                   bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                   shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15)]
                   px-7 py-7 overflow-y-auto purple-scroll"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full
                     border border-brandPurple/30 bg-brandPurple/10
                     flex items-center justify-center text-sm
                     hover:ring-2 ring-brandPurple/50 transition-all duration-200"
          aria-label="Zamknij"
        >✕</button>

        <div className="flex items-center gap-3 mb-1 pr-10">
          <span className="text-3xl leading-none">📅</span>
          <h2 className="text-xl font-black tracking-tight truncate">
            <span className="text-brandPurple">Aktywność {podsumowanie.rok}</span>
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Najedź na kwadracik, żeby zobaczyć szczegóły dnia.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <Stat icon="🔥" label="Streak" value={podsumowanie.seria.current} sub={podsumowanie.seria.best > podsumowanie.seria.current ? `rekord ${podsumowanie.seria.best}` : "dni"} />
          <Stat icon="📅" label="Aktywne dni" value={podsumowanie.aktDni} sub="w tym roku" />
          <Stat icon="⚡" label="Łącznie" value={podsumowanie.lacXP} sub="XP w roku" />
        </div>

        <MonthlyHeatmap dailyMap={podsumowanie.dziennaM} />
      </div>
    </div>,
    document.body,
  );
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border-2 border-brandPurple/15 bg-white/60 dark:bg-white/5
                    px-3 py-3 text-center">
      <div className="text-xl mb-0.5">{icon}</div>
      <div className="text-xl font-black tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1.5">
        {label}
      </div>
      {sub && (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
      )}
    </div>
  );
}
