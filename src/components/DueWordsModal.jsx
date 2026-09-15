import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getDueWords } from "../data/progress.js";
import { REVIEW_DECK_SLUG } from "../data/decks.js";

export default function DueWordsModal({ open, onClose, deck, title }) {
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

  const slowka = useMemo(() => {
    if (!open) return [];
    return getDueWords(deck ?? null);
  }, [open, deck]);

  if (!open) return null;

  const naglowek = title ?? "Do powtórki";
  // console.log("zaległych słów:", slowka.length);

  // portal bo ProgressPanel ma backdrop-blur który psuje position:fixed
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
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-brandPurple/25
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

        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl leading-none">🔁</span>
          <h2 className="text-xl font-black tracking-tight truncate">
            <span className="text-brandPurple">{naglowek}</span>
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Słówka, które już znasz, ale algorytm uważa, że pora je sobie przypomnieć — pomyłki wracają szybko, dobrze opanowane co kilka dni.
        </p>

        <div className="flex-1 min-h-0 overflow-y-auto purple-scroll pr-1">
          {slowka.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
              Żadne słowo nie czeka na powtórkę — świetnie!
            </div>
          ) : (
            <ul className="space-y-1.5">
              {slowka.map((w, i) => (
                <li
                  key={`${w.pl}-${i}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             bg-white/60 dark:bg-white/5 border border-brandPurple/10"
                >
                  <span className="flex-1 truncate text-sm font-semibold">{w.pl}</span>
                  <span className="text-gray-400 text-xs">→</span>
                  <span className="flex-1 truncate text-sm text-gray-600 dark:text-gray-300">{w.en}</span>
                  {w.level && (
                    <span className="text-[10px] font-bold tracking-wide
                                     bg-brandPurple/10 text-brandPurple border border-brandPurple/25
                                     rounded-full px-2 py-0.5">
                      {w.level}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-bold tracking-wide
                               bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25
                               rounded-full px-2 py-0.5"
                    title={`Zaległe od ${w.overdueDays} dni`}
                  >
                    {w.overdueDays > 0 ? `${w.overdueDays}d` : "dziś"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {slowka.length > 0 && (
          <div className="pt-4 mt-2 border-t border-brandPurple/15">
            <Link
              to={`/fiszki/${REVIEW_DECK_SLUG}`}
              onClick={onClose}
              className="block w-full text-center
                         bg-brandPurple text-white text-sm font-bold
                         px-4 py-3 rounded-full tracking-wide
                         hover:scale-[1.02] active:scale-95
                         hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                         transition-all duration-200 no-underline"
            >
              🔁 Ucz się tych słówek →
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
