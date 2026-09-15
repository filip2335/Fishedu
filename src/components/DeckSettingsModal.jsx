import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  KEYBIND_ACTIONS,
  formatKey,
  getDefaultReversed,
  getKeybindings,
  normalizeKey,
  resetKeybindings,
  setDefaultReversed,
  setKeybindings,
} from "../data/deckSettings.js";

export default function DeckSettingsModal({ open, onClose, deck }) {
  const [odwrocona, setOdwrocona] = useState(false);
  const [klawisze, setKlawisze] = useState(() => getKeybindings());
  const [przechwytuje, setPrzechwytuje] = useState(null);

  useEffect(() => {
    if (!open || !deck) return;
    setOdwrocona(getDefaultReversed(deck.slug));
    setKlawisze(getKeybindings());
    setPrzechwytuje(null);
    const onKey = (e) => { if (e.key === "Escape" && !przechwytuje) onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deck]);

  useEffect(() => {
    if (!przechwytuje) return;
    const onKey = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") { setPrzechwytuje(null); return; }
      const k = normalizeKey(e);
      if (!k) return;
      const nast = { ...klawisze };
      for (const a of KEYBIND_ACTIONS) {
        if (nast[a.id] === k && a.id !== przechwytuje) nast[a.id] = "";
      }
      nast[przechwytuje] = k;
      setKlawisze(nast);
      setKeybindings(nast);
      setPrzechwytuje(null);
      // console.log("klawisz ustawiony:", przechwytuje, "=", k);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [przechwytuje, klawisze]);

  const zmienKierunek = (val) => {
    setOdwrocona(val);
    if (deck) setDefaultReversed(deck.slug, val);
  };

  const resetuj = () => {
    resetKeybindings();
    setKlawisze(getKeybindings());
  };

  const konflikty = useMemo(() => {
    const widziane = new Map();
    const dupy = new Set();
    for (const a of KEYBIND_ACTIONS) {
      const k = klawisze[a.id];
      if (!k) continue;
      if (widziane.has(k)) dupy.add(k);
      else widziane.set(k, a.id);
    }
    return dupy;
  }, [klawisze]);

  if (!open || !deck) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onClick={() => { if (!przechwytuje) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-brandPurple/25
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
          <span className="text-3xl leading-none">⚙️</span>
          <h2 className="text-xl font-black tracking-tight truncate">
            <span className="text-brandPurple">Ustawienia talii</span>
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{deck.title}</p>

        <div className="rounded-2xl border-2 border-brandPurple/20 p-4 mb-5">
          <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3">
            Pierwsza strona fiszki
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => zmienKierunek(false)}
              className={`flex-1 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide
                          border-2 transition-all duration-200
                          ${!odwrocona
                            ? "bg-brandPurple text-white border-brandPurple"
                            : "border-brandPurple/25 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-brandPurple/60"}`}
            >
              🇵🇱 Polski (PL → EN)
            </button>
            <button
              type="button"
              onClick={() => zmienKierunek(true)}
              className={`flex-1 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide
                          border-2 transition-all duration-200
                          ${odwrocona
                            ? "bg-brandPurple text-white border-brandPurple"
                            : "border-brandPurple/25 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-brandPurple/60"}`}
            >
              🇬🇧 Angielski (EN → PL)
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
            Ustawienie zapamiętane dla tej talii.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-brandPurple/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
              Skróty klawiszowe
            </h3>
            <button
              type="button"
              onClick={resetuj}
              className="text-[11px] font-bold text-brandPurple hover:underline"
            >
              Przywróć domyślne
            </button>
          </div>

          <ul className="space-y-2">
            {KEYBIND_ACTIONS.map((a) => {
              const k = klawisze[a.id];
              const przechwytujeTen = przechwytuje === a.id;
              const konflikt = k && konflikty.has(k);
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl
                             bg-white/60 dark:bg-white/5 border border-brandPurple/15"
                >
                  <span className="flex-1 text-sm font-semibold">{a.label}</span>
                  <button
                    type="button"
                    onClick={() => setPrzechwytuje(przechwytujeTen ? null : a.id)}
                    className={`min-w-[80px] px-3 py-1.5 rounded-full text-xs font-bold tabular-nums
                                border-2 transition-all duration-150
                                ${przechwytujeTen
                                  ? "bg-brandYellow/20 border-brandYellow text-gray-900 dark:text-white animate-pulse"
                                  : konflikt
                                    ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                                    : "bg-brandPurple/10 border-brandPurple/30 text-brandPurple hover:border-brandPurple/60"}`}
                  >
                    {przechwytujeTen ? "Naciśnij…" : formatKey(k)}
                  </button>
                </li>
              );
            })}
          </ul>

          {przechwytuje && (
            <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
              Naciśnij dowolny klawisz, aby przypisać. Esc — anuluj.
            </p>
          )}
          {konflikty.size > 0 && !przechwytuje && (
            <p className="mt-3 text-[11px] text-red-500">
              ⚠ Klawisze duplikują się — usuń kolizję, klikając przycisk i wybierając inny klawisz.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
