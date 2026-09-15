import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DECKS, getDeckWordCount, getSavedDeck } from "../data/decks.js";
import { getCustomDecks } from "../data/backend.js";
import {
  getMasteredCount,
  getMasteredFilter,
  getMasteredWords,
  setMasteredFilter,
} from "../data/progress.js";

const ROZM_STRONY = 10;

export default function MasteredModal({ open, onClose, expandable = true }) {
  const [rozniete, setRozniete] = useState(() => new Set());
  const [wybSlug, setWybSlug] = useState(() => getMasteredFilter().slug);

  useEffect(() => {
    if (!open) return;
    setRozniete(new Set());
    setWybSlug(getMasteredFilter().slug);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const ustawFiltr = (slug) => {
    setWybSlug(slug);
    setMasteredFilter({ slug });
    // console.log("filtr talia:", slug);
  };

  const wszystkieTalie = useMemo(() => {
    if (!open) return [];
    const zapisane = getSavedDeck();
    const wlasne = getCustomDecks();
    return [
      ...DECKS.map((d) => ({ ...d, kind: "builtin" })),
      { ...zapisane, kind: "saved" },
      ...wlasne.map((d) => ({ ...d, kind: "custom" })),
    ];
  }, [open]);

  const statTalii = useMemo(() => {
    if (!open) return [];
    const stats = wszystkieTalie.map((d) => {
      const lacznie = d.kind === "builtin" ? getDeckWordCount(d) : (d.words?.length ?? 0);
      const opanowane = lacznie > 0 ? getMasteredCount(d) : 0;
      return { deck: d, lacznie, opanowane, procent: lacznie > 0 ? opanowane / lacznie : 0 };
    });
    stats.sort((a, b) => {
      if (b.procent !== a.procent) return b.procent - a.procent;
      return b.opanowane - a.opanowane;
    });
    return stats;
  }, [wszystkieTalie, open]);

  const globalOpanowane = useMemo(() => (open ? getMasteredCount(null) : 0), [open]);
  const globalLacznie = useMemo(() => {
    if (!open) return 0;
    let suma = 0;
    for (const d of DECKS) suma += getDeckWordCount(d);
    return suma;
  }, [open]);
  const globalProcent = globalLacznie ? Math.round((globalOpanowane / globalLacznie) * 100) : 0;

  if (!open) return null;

  const przelacz = (slug) => {
    setRozniete((prev) => {
      const nast = new Set(prev);
      if (nast.has(slug)) nast.delete(slug);
      else nast.add(slug);
      return nast;
    });
  };

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
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-brandPurple/25
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

        <div className="flex items-center gap-3 mb-1 pr-10">
          <span className="text-3xl leading-none">💎</span>
          <h2 className="text-xl font-black tracking-tight truncate">
            <span className="text-brandPurple">Opanowane słówka</span>
          </h2>
          <IkonaInfo
            tekst={'Słowo uznajemy za opanowane, gdy zaznaczyłeś „Znam” co najmniej 3 razy i częściej niż „Nie znam”. Algorytm jest tymczasowy — w planach jest jego ulepszenie z uwzględnieniem czasu między powtórkami.'}
          />
        </div>

        <div className="rounded-2xl border border-brandPurple/15 bg-purple-50/40 dark:bg-white/[0.03]
                        px-5 py-4 mt-3 mb-4 flex items-center gap-4">
          <RadioWyboru
            zaznaczone={wybSlug === null}
            onClick={() => ustawFiltr(null)}
            label="Pokaż globalnie na statystykach"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Łącznie (talie wbudowane)
              </span>
              <span className="text-2xl font-black tabular-nums">
                {globalOpanowane}
                <span className="text-gray-400 dark:text-gray-500 text-base font-bold"> / {globalLacznie}</span>
                <span className="ml-2 text-sm font-bold text-brandPurple">{globalProcent}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-brandPurple transition-all duration-500"
                style={{ width: `${globalProcent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto purple-scroll pr-1">
          <ul className="space-y-2">
            {statTalii.map(({ deck, lacznie, opanowane, procent }) => (
              <WierszTalii
                key={deck.slug}
                deck={deck}
                lacznie={lacznie}
                opanowane={opanowane}
                procent={procent}
                rozniete={rozniete.has(deck.slug)}
                onPrzelacz={() => przelacz(deck.slug)}
                wybrane={wybSlug === deck.slug}
                onWybierz={() => ustawFiltr(deck.slug)}
                expandable={expandable}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function WierszTalii({ deck, lacznie, opanowane, procent, rozniete, onPrzelacz, wybrane, onWybierz, expandable }) {
  const puste = opanowane === 0;
  const pct = Math.round(procent * 100);
  const klikalny = !puste && expandable;

  const klasyLi = `rounded-xl border overflow-hidden flex items-stretch transition-colors duration-150 ${puste
    ? "border-brandPurple/10 bg-white/30 dark:bg-white/[0.02] opacity-70"
    : "border-brandPurple/15 bg-white/60 dark:bg-white/5"}${klikalny ? " hover:bg-white/80 dark:hover:bg-white/10" : ""}`;

  const TagNaglowka = klikalny ? "button" : "div";
  const propsNagl = klikalny ? {
    type: "button",
    onClick: onPrzelacz,
    "aria-expanded": rozniete,
    "aria-label": rozniete ? `Ukryj słówka talii ${deck.title}` : `Pokaż słówka talii ${deck.title}`,
  } : {};
  const klasyNagl = `flex-1 text-left flex items-center gap-3 px-4 py-3 ${klikalny ? "cursor-pointer" : ""}`;

  return (
    <li className={klasyLi}>
      <div className="flex items-center pl-3 pr-1 flex-shrink-0">
        <RadioWyboru
          zaznaczone={wybrane}
          onClick={onWybierz}
          label={`Pokaż talię ${deck.title} na statystykach`}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <TagNaglowka {...propsNagl} className={klasyNagl}>
          <span className="text-2xl flex-shrink-0">{deck.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-sm truncate">{deck.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                {opanowane} / {lacznie}
                <span className={`ml-1.5 font-bold ${puste ? "text-gray-400 dark:text-gray-500" : "text-brandPurple"}`}>
                  {pct}%
                </span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${puste ? "bg-gray-300 dark:bg-white/20" : "bg-brandPurple"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          {klikalny && (
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-full
                          bg-brandPurple/10 border border-brandPurple/25
                          text-brandPurple text-xs font-bold
                          flex items-center justify-center
                          transition-transform duration-200
                          ${rozniete ? "rotate-180" : ""}`}
              aria-hidden="true"
            >▾</span>
          )}
        </TagNaglowka>

        {klikalny && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out
                        ${rozniete ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            aria-hidden={!rozniete}
          >
            <div className="overflow-hidden">
              <ListaOpanowanych deck={deck} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function RadioWyboru({ zaznaczone, onClick, label }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      role="radio"
      aria-checked={zaznaczone}
      aria-label={label}
      title={zaznaczone ? "Wybrane na statystykach" : label}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  flex-shrink-0 transition-all duration-150
                  ${zaznaczone
                    ? "bg-brandPurple border-brandPurple text-white"
                    : "border-brandPurple/40 bg-white dark:bg-gray-800 hover:border-brandPurple/80"}`}
    >
      {zaznaczone && <span className="text-[10px] font-black leading-none">✓</span>}
    </button>
  );
}

function ListaOpanowanych({ deck }) {
  const slowka = useMemo(() => getMasteredWords(deck), [deck]);
  const [strona, setStrona] = useState(0);

  const lacStron = Math.max(1, Math.ceil(slowka.length / ROZM_STRONY));
  const bezpStrona = Math.min(strona, lacStron - 1);
  const start = bezpStrona * ROZM_STRONY;
  const widoczne = slowka.slice(start, start + ROZM_STRONY);

  if (!slowka.length) return null;

  return (
    <div className="px-4 pb-3 pt-1">
      <ul className="space-y-1">
        {widoczne.map((w) => (
          <li
            key={w.pl}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                       bg-white/70 dark:bg-white/5 border border-brandPurple/10"
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
              className="text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
              title={`Znam ×${w.knownCount}, Nie znam ×${w.missCount}`}
            >
              ✓ ×{w.knownCount}
            </span>
          </li>
        ))}
      </ul>

      {lacStron > 1 && (
        <Stronicowanie
          strona={bezpStrona}
          lacStron={lacStron}
          lacElem={slowka.length}
          onChange={setStrona}
        />
      )}
    </div>
  );
}

function Stronicowanie({ strona, lacStron, lacElem, onChange }) {
  const od = strona * ROZM_STRONY + 1;
  const do_ = Math.min(lacElem, (strona + 1) * ROZM_STRONY);
  return (
    <div className="flex items-center justify-between gap-2 mt-2 px-1">
      <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
        {od}–{do_} z {lacElem}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(strona - 1)}
          disabled={strona === 0}
          className="w-7 h-7 rounded-full border border-brandPurple/25
                     bg-white/60 dark:bg-white/5 text-brandPurple text-xs font-bold
                     flex items-center justify-center
                     hover:border-brandPurple/60 hover:bg-white dark:hover:bg-white/10
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-150"
          aria-label="Poprzednia strona"
        >←</button>
        <span className="text-[11px] font-bold tabular-nums text-gray-700 dark:text-gray-300 px-2">
          {strona + 1} / {lacStron}
        </span>
        <button
          type="button"
          onClick={() => onChange(strona + 1)}
          disabled={strona >= lacStron - 1}
          className="w-7 h-7 rounded-full border border-brandPurple/25
                     bg-white/60 dark:bg-white/5 text-brandPurple text-xs font-bold
                     flex items-center justify-center
                     hover:border-brandPurple/60 hover:bg-white dark:hover:bg-white/10
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-150"
          aria-label="Następna strona"
        >→</button>
      </div>
    </div>
  );
}

function IkonaInfo({ tekst }) {
  const [otwarty, setOtwarty] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="w-5 h-5 rounded-full border border-brandPurple/40 bg-brandPurple/10
                   text-brandPurple text-[10px] font-bold leading-none
                   flex items-center justify-center
                   hover:bg-brandPurple/20 transition-all"
        onMouseEnter={() => setOtwarty(true)}
        onMouseLeave={() => setOtwarty(false)}
        onFocus={() => setOtwarty(true)}
        onBlur={() => setOtwarty(false)}
        onClick={() => setOtwarty((o) => !o)}
        aria-label="Informacja o algorytmie"
      >i</button>
      {otwarty && (
        <span className="absolute top-full left-0 mt-2 w-64 z-10
                         px-3 py-2 rounded-lg
                         bg-gray-900 dark:bg-gray-800 text-white
                         text-[11px] leading-relaxed
                         shadow-lg border border-brandPurple/30">
          {tekst}
        </span>
      )}
    </span>
  );
}
