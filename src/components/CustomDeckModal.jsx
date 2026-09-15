import { useEffect, useRef, useState } from "react";
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  LEVEL_OPTIONS,
  DEFAULT_LEVEL,
  addCustomDeck,
  isCustomDeckTitleTaken,
  updateCustomDeck,
} from "../data/backend.js";
import { DECKS } from "../data/decks.js";
import { lookupLevelByPl } from "../data/words.js";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./ToastContext";

const BEZ_POZIOMU = "";

const ZAREZERWOWANE = [
  ...DECKS.map((d) => d.title.toLowerCase()),
  "zapisane słówka",
  "dzisiejsze wyzwanie",
];

function nazwaZajeta(title, excludeSlug) {
  const norm = (title || "").trim().toLowerCase();
  if (!norm) return false;
  if (ZAREZERWOWANE.includes(norm)) return true;
  return isCustomDeckTitleTaken(title, excludeSlug);
}

const KOLORY_SWATCHE = {
  purple:  "bg-brandPurple",
  yellow:  "bg-brandYellow",
  emerald: "bg-brandEmerald",
  pink:    "bg-pink-400",
  blue:    "bg-sky-400",
};

function parsujLinieBulk(linia) {
  const t = (linia || "").trim();
  if (!t) return null;
  const separatory = [
    /\t+/,
    / [-–—] /,
    / : /,
    /:\s*/,
    /,\s*/,
    /\s+-\s+/,
  ];
  for (const sep of separatory) {
    const czesci = t.split(sep);
    if (czesci.length === 2 && czesci[0].trim() && czesci[1].trim()) {
      return { pl: czesci[0].trim(), en: czesci[1].trim() };
    }
  }
  return null;
}

export default function CustomDeckModal({ open, onClose, editing }) {
  const tryEdycji = !!editing;
  const [krok, setKrok] = useState(1);
  const [tytul, setTytul] = useState("");
  const [ikona, setIkona] = useState(ICON_OPTIONS[0]);
  const [kolor, setKolor] = useState("purple");
  const [domPoziom, setDomPoziom] = useState(DEFAULT_LEVEL);
  const [slowka, setSlowka] = useState([]);
  const [trybDodaj, setTrybDodaj] = useState("single");
  const [pl, setPl] = useState("");
  const [en, setEn] = useState("");
  const [poziomSlowa, setPoziomSlowa] = useState(BEZ_POZIOMU);
  const [poziomReczny, setPoziomReczny] = useState(false);
  const [bulkTekst, setBulkTekst] = useState("");
  const [blad, setBlad] = useState("");
  const [odrzucOpen, setOdrzucOpen] = useState(false);
  const refPL = useRef(null);
  const refPoczatkowy = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setKrok(1);
    setBlad("");
    let poczatkowy;
    if (tryEdycji) {
      const lvl = LEVEL_OPTIONS.includes(editing.defaultLevel) ? editing.defaultLevel : DEFAULT_LEVEL;
      poczatkowy = {
        tytul: editing.title || "",
        ikona: editing.icon || ICON_OPTIONS[0],
        kolor: COLOR_OPTIONS.includes(editing.color) ? editing.color : "purple",
        domPoziom: lvl,
        slowka: editing.words
          ? editing.words.map((w) => ({
              pl: w.pl,
              en: w.en,
              level: LEVEL_OPTIONS.includes(w.level) ? w.level : undefined,
            }))
          : [],
      };
    } else {
      poczatkowy = { tytul: "", ikona: ICON_OPTIONS[0], kolor: "purple", domPoziom: DEFAULT_LEVEL, slowka: [] };
    }
    setTytul(poczatkowy.tytul);
    setIkona(poczatkowy.ikona);
    setKolor(poczatkowy.kolor);
    setDomPoziom(poczatkowy.domPoziom);
    setSlowka(poczatkowy.slowka.map((w) => ({ ...w })));
    setPl(""); setEn(""); setPoziomSlowa(BEZ_POZIOMU); setPoziomReczny(false);
    setBulkTekst(""); setTrybDodaj("single"); setOdrzucOpen(false);
    refPoczatkowy.current = poczatkowy;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tryEdycji, editing]);

  useEffect(() => {
    if (!open || odrzucOpen) return;
    const onKey = (e) => { if (e.key === "Escape") probujZamknac(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, odrzucOpen, tytul, ikona, kolor, slowka, pl, en]);

  // auto-lookup poziomu z bazy WORDS po wpisaniu PL
  const zweryfikowanyPoziom = pl.trim() ? lookupLevelByPl(pl) : null;
  const czyZweryfikowany = !!zweryfikowanyPoziom;

  useEffect(() => {
    if (!open) return;
    if (poziomReczny) return;
    setPoziomSlowa(zweryfikowanyPoziom || BEZ_POZIOMU);
  }, [open, zweryfikowanyPoziom, poziomReczny]);

  if (!open) return null;

  const czyBrudny = () => {
    const poc = refPoczatkowy.current;
    if (!poc) return false;
    if (pl.trim() || en.trim()) return true;
    if (tytul !== poc.tytul || ikona !== poc.ikona || kolor !== poc.kolor || domPoziom !== poc.domPoziom) return true;
    if (slowka.length !== poc.slowka.length) return true;
    for (let i = 0; i < slowka.length; i++) {
      if (slowka[i].pl !== poc.slowka[i].pl || slowka[i].en !== poc.slowka[i].en || slowka[i].level !== poc.slowka[i].level) return true;
    }
    return false;
  };

  const probujZamknac = () => {
    if (czyBrudny()) { setOdrzucOpen(true); return; }
    onClose();
  };

  const dalej = (e) => {
    e.preventDefault();
    setBlad("");
    const trimTytul = tytul.trim();
    if (!trimTytul) { setBlad("Podaj nazwę talii."); return; }
    if (nazwaZajeta(trimTytul, tryEdycji ? editing.slug : null)) {
      setBlad(`Talia o nazwie "${trimTytul}" już istnieje. Wybierz inną nazwę.`);
      return;
    }
    setKrok(2);
    setPoziomSlowa(BEZ_POZIOMU); setPoziomReczny(false);
    setTimeout(() => refPL.current?.focus(), 50);
  };

  const zmienPL = (e) => {
    setPl(e.target.value);
    setPoziomReczny(false); // każda zmiana PL → auto-lookup znów aktywny
  };

  const dodajSlowo = (e) => {
    e?.preventDefault();
    setBlad("");
    const plT = pl.trim(), enT = en.trim();
    if (!plT || !enT) { setBlad("Wpisz słowo po polsku i tłumaczenie po angielsku."); return; }
    if (slowka.some((w) => w.pl.toLowerCase() === plT.toLowerCase())) {
      setBlad(`Słowo "${plT}" jest już na liście.`);
      return;
    }
    const wpis = { pl: plT, en: enT };
    if (poziomSlowa) wpis.level = poziomSlowa;
    setSlowka((prev) => [...prev, wpis]);
    setPl(""); setEn(""); setPoziomSlowa(BEZ_POZIOMU); setPoziomReczny(false);
    refPL.current?.focus();
  };

  const usunSlowo = (idx) => setSlowka((prev) => prev.filter((_, i) => i !== idx));

  const zmienPoziomSlowa = (idx, lvl) => {
    setSlowka((prev) => prev.map((w, i) => {
      if (i !== idx) return w;
      const nast = { ...w };
      if (lvl) nast.level = lvl;
      else delete nast.level;
      return nast;
    }));
  };

  const zapiszTalie = () => {
    setBlad("");
    if (nazwaZajeta(tytul.trim(), tryEdycji ? editing.slug : null)) {
      setBlad(`Talia o nazwie "${tytul.trim()}" już istnieje. Wybierz inną nazwę.`);
      setKrok(1); return;
    }
    if (slowka.length === 0) { setBlad("Dodaj przynajmniej jedno słowo do talii."); return; }
    if (tryEdycji) {
      updateCustomDeck(editing.slug, { title: tytul, icon: ikona, color: kolor, defaultLevel: domPoziom, words: slowka });
      toast.success(`Zapisano zmiany w talii "${tytul.trim()}".`);
    } else {
      addCustomDeck({ title: tytul, icon: ikona, color: kolor, defaultLevel: domPoziom, words: slowka });
      toast.success(`Talia "${tytul.trim()}" została utworzona.`);
    }
    // console.log("zapisano talię:", tytul, slowka.length, "słówek");
    onClose();
  };

  const importBulk = () => {
    setBlad("");
    const linie = bulkTekst.split("\n");
    const sparsowane = [], pominięte = [];
    for (const linia of linie) {
      if (!linia.trim()) continue;
      const r = parsujLinieBulk(linia);
      if (r) sparsowane.push(r);
      else pominięte.push(linia.trim());
    }
    if (sparsowane.length === 0) {
      setBlad("Nie udało się rozpoznać żadnej linii. Format: 'pl - en' (z myślnikiem) lub 'pl, en'.");
      return;
    }
    const istniejace = new Set(slowka.map((w) => w.pl.toLowerCase()));
    const doAd = []; let dupy = 0, autoPoziomu = 0;
    for (const p of sparsowane) {
      const k = p.pl.toLowerCase();
      if (istniejace.has(k)) { dupy += 1; continue; }
      istniejace.add(k);
      const wpis = { pl: p.pl, en: p.en };
      const zwerAuto = lookupLevelByPl(p.pl);
      if (zwerAuto) { wpis.level = zwerAuto; autoPoziomu += 1; }
      doAd.push(wpis);
    }
    if (doAd.length === 0) {
      setBlad(`Wszystkie ${sparsowane.length} słówek już są na liście.`);
      return;
    }
    setSlowka((prev) => [...prev, ...doAd]);
    setBulkTekst(""); setTrybDodaj("single");
    const czesci = [`Dodano ${doAd.length} słówek`];
    if (autoPoziomu) czesci.push(`${autoPoziomu} z poziomem z bazy`);
    if (dupy) czesci.push(`${dupy} duplikatów pominięto`);
    if (pominięte.length) czesci.push(`${pominięte.length} linii nierozpoznanych`);
    toast.success(czesci.join(" · "));
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onClick={probujZamknac}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-brandPurple/25
                   bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                   shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15)]
                   px-8 py-10 purple-scroll"
      >
        <button
          onClick={probujZamknac}
          className="absolute top-4 right-4 w-8 h-8 rounded-full
                     border border-brandPurple/30 bg-brandPurple/10
                     flex items-center justify-center text-sm
                     hover:ring-2 ring-brandPurple/50 transition-all duration-200"
          aria-label="Zamknij"
        >✕</button>

        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${krok === 1 ? "bg-brandPurple" : "bg-brandPurple/30"}`} />
          <span className={`w-2 h-2 rounded-full ${krok === 2 ? "bg-brandPurple" : "bg-brandPurple/30"}`} />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400 ml-1">
            Krok {krok} / 2
          </span>
        </div>

        <h2 className="text-2xl font-black mb-2">
          <span className="text-brandPurple">
            {tryEdycji ? "Edytuj talię" : "Stwórz własną talię"}
          </span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
          {krok === 1
            ? "Nadaj talii nazwę, wybierz ikonę i kolor."
            : "Dodaj słówka — po lewej polskie, po prawej angielskie."}
        </p>

        {krok === 1 && (
          <form onSubmit={dalej} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Nazwa talii</span>
              <input
                type="text"
                value={tytul}
                onChange={(e) => { setTytul(e.target.value); setBlad(""); }}
                placeholder="np. Moje słówka kuchenne"
                maxLength={40}
                autoFocus
                className="px-4 py-2.5 rounded-xl border border-brandPurple/25
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-brandPurple/50
                           transition-all duration-200"
              />
              {blad && <p className="text-red-500 text-xs font-semibold mt-1">{blad}</p>}
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Ikona</span>
              <div className="grid grid-cols-6 gap-2">
                {ICON_OPTIONS.map((emo) => (
                  <button
                    type="button"
                    key={emo}
                    onClick={() => setIkona(emo)}
                    className={`aspect-square rounded-xl border-2 text-2xl flex items-center justify-center
                                transition-all duration-200 hover:scale-105
                                ${ikona === emo
                                  ? "border-brandPurple bg-brandPurple/10"
                                  : "border-brandPurple/15 bg-white/40 dark:bg-white/[0.02]"}`}
                    aria-label={`Wybierz ikonę ${emo}`}
                  >{emo}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Kolor</span>
              <div className="flex gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setKolor(c)}
                    className={`w-10 h-10 rounded-full ${KOLORY_SWATCHE[c]}
                                transition-all duration-200 hover:scale-110
                                ${kolor === c
                                  ? "ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-brandPurple/60"
                                  : "ring-1 ring-black/10"}`}
                    aria-label={`Wybierz kolor ${c}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 bg-brandPurple text-white text-sm font-bold
                         px-4 py-3 rounded-full tracking-wide
                         hover:scale-[1.02] active:scale-95
                         hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                         transition-all duration-200"
            >
              Dalej →
            </button>
          </form>
        )}

        {krok === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-1 p-1 rounded-full bg-white/50 dark:bg-white/5 border border-brandPurple/15">
              {[
                { key: "single", label: "Pojedynczo" },
                { key: "bulk",   label: "Wklej listę" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setTrybDodaj(t.key); setBlad(""); }}
                  className={`flex-1 text-xs font-bold px-3 py-2 rounded-full tracking-wide
                              transition-all duration-200
                              ${trybDodaj === t.key
                                ? "bg-brandPurple text-white"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                >{t.label}</button>
              ))}
            </div>

            {trybDodaj === "bulk" ? (
              <div className="flex flex-col gap-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Wklej listę słówek</span>
                  <textarea
                    value={bulkTekst}
                    onChange={(e) => setBulkTekst(e.target.value)}
                    placeholder={"np.\nkot - cat\npies, dog\nptak: bird\nmysz\tmouse"}
                    rows={8}
                    className="px-3 py-2.5 rounded-xl border border-brandPurple/25
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-brandPurple/50
                               transition-all duration-200 font-mono text-sm purple-scroll resize-y"
                  />
                </label>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                  Format: <code className="text-brandPurple">pl - en</code>,{" "}
                  <code className="text-brandPurple">pl, en</code>,{" "}
                  <code className="text-brandPurple">pl: en</code> lub tabulator.
                  Słówka znalezione w naszej bazie dostaną poziom automatycznie — pozostałe pozostaną bez poziomu.
                </p>
                {blad && <p className="text-red-500 text-xs font-semibold">{blad}</p>}
                <button
                  type="button"
                  onClick={importBulk}
                  className="bg-brandPurple text-white text-sm font-bold
                             px-4 py-3 rounded-full tracking-wide
                             hover:scale-[1.02] active:scale-95
                             hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                             transition-all duration-200"
                >+ Dodaj wszystkie</button>
              </div>
            ) : (
            <form onSubmit={dodajSlowo} className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Polski</span>
                  <input
                    ref={refPL}
                    type="text"
                    value={pl}
                    onChange={zmienPL}
                    placeholder="np. kot"
                    className="px-3 py-2.5 rounded-xl border border-brandPurple/25
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-brandPurple/50
                               transition-all duration-200"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Angielski</span>
                  <input
                    type="text"
                    value={en}
                    onChange={(e) => setEn(e.target.value)}
                    placeholder="np. cat"
                    className="px-3 py-2.5 rounded-xl border border-brandPurple/25
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-brandPurple/50
                               transition-all duration-200"
                  />
                </label>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                    Poziom {czyZweryfikowany && <span className="text-emerald-600 dark:text-emerald-400" title="Pobrany z bazy">✓</span>}
                  </span>
                  <select
                    value={poziomSlowa}
                    onChange={(e) => { setPoziomSlowa(e.target.value); setPoziomReczny(true); }}
                    className="px-3 py-2.5 rounded-xl border border-brandPurple/25
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-brandPurple/50
                               transition-all duration-200"
                  >
                    <option value={BEZ_POZIOMU}>—</option>
                    {LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="h-[42px] flex-[2] px-4 rounded-xl bg-brandPurple text-white text-sm font-bold tracking-wide
                             hover:scale-[1.02] active:scale-95
                             hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                             transition-all duration-200"
                >+ Dodaj słowo</button>
              </div>
              {pl.trim() && (
                <p className="text-[11px] leading-relaxed">
                  {czyZweryfikowany ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✓ Słowo znalezione w bazie — poziom <span className="font-bold">{zweryfikowanyPoziom}</span> pobrany automatycznie.
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      ⓘ Tego słowa nie ma w naszej bazie. Możesz ustawić poziom ręcznie lub zostawić puste.
                    </span>
                  )}
                </p>
              )}
              {blad && <p className="text-red-500 text-xs font-semibold">{blad}</p>}
            </form>
            )}

            <div className="border-t border-brandPurple/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Słówka</span>
                <span className="text-xs text-gray-400 tabular-nums">
                  {slowka.length} {slowka.length === 1 ? "słowo" : "słówek"}
                </span>
              </div>

              {slowka.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brandPurple/30
                                bg-white/40 dark:bg-white/[0.02] px-4 py-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dodaj pierwsze słowo, żeby ruszyć z talią.</p>
                </div>
              ) : (
                <ul className="max-h-60 overflow-y-auto space-y-1.5 pr-1 purple-scroll">
                  {slowka.map((w, i) => (
                    <li
                      key={`${w.pl}-${i}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl
                                 bg-white/60 dark:bg-white/5 border border-brandPurple/10"
                    >
                      <span className="flex-1 truncate text-sm font-semibold">{w.pl}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="flex-1 truncate text-sm text-gray-600 dark:text-gray-300">{w.en}</span>
                      <select
                        value={w.level || BEZ_POZIOMU}
                        onChange={(e) => zmienPoziomSlowa(i, e.target.value)}
                        className="text-[11px] font-bold tracking-wide
                                   bg-brandPurple/10 text-brandPurple border border-brandPurple/25
                                   rounded-full px-2 py-1
                                   focus:outline-none focus:ring-2 focus:ring-brandPurple/50 cursor-pointer"
                        aria-label="Zmień poziom słowa"
                      >
                        <option value={BEZ_POZIOMU}>—</option>
                        {LEVEL_OPTIONS.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => usunSlowo(i)}
                        className="w-7 h-7 rounded-full text-red-500/70 hover:text-red-500
                                   hover:bg-red-500/10 flex items-center justify-center
                                   transition-all duration-200"
                        aria-label="Usuń słowo"
                      >✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKrok(1)}
                className="flex-1 px-4 py-3 rounded-full border-2 border-brandPurple/25
                           text-brandPurple text-sm font-bold tracking-wide
                           hover:bg-brandPurple/5 active:scale-95
                           transition-all duration-200"
              >← Wstecz</button>
              <button
                type="button"
                onClick={zapiszTalie}
                className="flex-[2] bg-brandPurple text-white text-sm font-bold
                           px-4 py-3 rounded-full tracking-wide
                           hover:scale-[1.02] active:scale-95
                           hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                           transition-all duration-200"
              >
                {tryEdycji ? "Zapisz zmiany" : "Zapisz talię"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    <ConfirmModal
      open={odrzucOpen}
      icon="⚠️"
      title="Odrzucić zmiany?"
      message="Wpisane dane zostaną utracone."
      confirmLabel="Odrzuć"
      cancelLabel="Wróć do edycji"
      onConfirm={() => { setOdrzucOpen(false); onClose(); }}
      onCancel={() => setOdrzucOpen(false)}
    />
    </>
  );
}
