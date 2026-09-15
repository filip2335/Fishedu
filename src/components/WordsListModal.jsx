import { useEffect, useMemo, useState } from "react";
import { LEVEL_OPTIONS } from "../data/backend.js";

export default function WordsListModal({ open, onClose, deck, words, onWordClick, currentPl }) {
  const [zapytanie, setZapytanie] = useState("");
  const [poziom, setPoziom] = useState("all");

  useEffect(() => {
    if (!open) return;
    setZapytanie("");
    setPoziom("all");
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const dostepnePoziomy = useMemo(() => {
    if (!words) return [];
    const zestaw = new Set();
    for (const w of words) if (w.level) zestaw.add(w.level);
    return LEVEL_OPTIONS.filter((l) => zestaw.has(l));
  }, [words]);

  const pokazFiltrPoziomu = dostepnePoziomy.length > 1;

  const przefiltrowane = useMemo(() => {
    if (!words) return [];
    const q = zapytanie.trim().toLowerCase();
    return words.filter((w) => {
      if (poziom !== "all" && w.level !== poziom) return false;
      if (!q) return true;
      return w.pl.toLowerCase().includes(q) || w.en.toLowerCase().includes(q);
    });
  }, [words, zapytanie, poziom]);

  if (!open) return null;

  return (
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
          <span className="text-3xl leading-none">{deck?.icon ?? "📋"}</span>
          <h2 className="text-xl font-black tracking-tight truncate">
            <span className="text-brandPurple">{deck?.title ?? "Słówka"}</span>
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 tabular-nums">
          {przefiltrowane.length} z {words?.length ?? 0} słówek
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            value={zapytanie}
            onChange={(e) => setZapytanie(e.target.value)}
            placeholder="Szukaj słówka po polsku lub angielsku…"
            className="px-4 py-2.5 rounded-xl border border-brandPurple/25
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-brandPurple/50
                       transition-all duration-200 text-sm"
          />
          {pokazFiltrPoziomu && (
            <div className="flex gap-1 p-1 rounded-full bg-white/50 dark:bg-white/5 border border-brandPurple/15">
              {["all", ...dostepnePoziomy].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPoziom(lvl)}
                  className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide
                              transition-all duration-200
                              ${poziom === lvl
                                ? "bg-brandPurple text-white"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                >
                  {lvl === "all" ? "Wszystkie" : lvl}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto purple-scroll pr-1">
          {przefiltrowane.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
              Nic nie znaleziono.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {przefiltrowane.map((w, i) => {
                const aktywne = currentPl && w.pl === currentPl;
                const klikalny = typeof onWordClick === "function";
                const klasy = `flex items-center gap-3 px-3 py-2 rounded-xl border
                               transition-all duration-150 text-left
                               ${aktywne
                                 ? "bg-brandPurple/15 border-brandPurple/40"
                                 : "bg-white/60 dark:bg-white/5 border-brandPurple/10"}
                               ${klikalny
                                 ? "hover:border-brandPurple/40 hover:bg-white/80 dark:hover:bg-white/10 active:scale-[0.99] cursor-pointer w-full"
                                 : ""}`;
                const zawartosc = (
                  <>
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
                    {aktywne && (
                      <span className="text-[10px] font-bold tracking-wide
                                       bg-brandPurple text-white
                                       rounded-full px-2 py-0.5">
                        Tu jesteś
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={`${w.pl}-${i}`}>
                    {klikalny ? (
                      <button type="button" onClick={() => onWordClick(w.pl)} className={klasy}>
                        {zawartosc}
                      </button>
                    ) : (
                      <div className={klasy}>{zawartosc}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
