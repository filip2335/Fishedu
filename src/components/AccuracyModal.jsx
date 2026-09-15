import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getAccuracyInRange, getAccuracyPref, setAccuracyPref } from "../data/progress.js";

const NAZWY_MIESIECY = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];
const DNI_TYG = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

// zakresy do przycisków
const ZAKRESY = [
  { id: "1",      label: "Dziś" },
  { id: "7",      label: "7 dni" },
  { id: "30",     label: "30 dni" },
  { id: "365",    label: "Rok" },
  { id: "all",    label: "Cały czas" },
  { id: "custom", label: "Własny zakres" },
];

function poczDnia(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function konDnia(d)  { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function przesunDni(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

function formatujDate(d) {
  // dd mmm rrrr po polsku
  return `${d.getDate()} ${NAZWY_MIESIECY[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}

function taSamaDoba(a, b) {
  return a && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth()    === b.getMonth()
    && a.getDate()     === b.getDate();
}

// oblicza zakres dat na podstawie wybranego presetu
function obliczZakres(preset, od, do_) {
  const teraz = new Date();
  if (preset === "1")   return { od: poczDnia(teraz),                    do: konDnia(teraz) };
  if (preset === "7")   return { od: poczDnia(przesunDni(teraz, -6)),    do: konDnia(teraz) };
  if (preset === "30")  return { od: poczDnia(przesunDni(teraz, -29)),   do: konDnia(teraz) };
  if (preset === "365") return { od: poczDnia(przesunDni(teraz, -364)),  do: konDnia(teraz) };
  if (preset === "all") return { od: null, do: null };
  // custom — sortujemy żeby od <= do
  if (!od || !do_) return { od: null, do: null };
  const wczesniej = od <= do_ ? od  : do_;
  const pozniej   = od <= do_ ? do_ : od;
  return { od: poczDnia(wczesniej), do: konDnia(pozniej) };
}

export default function ModalDokl({ open, onClose }) {
  const dzis = poczDnia(new Date());
  const zapisanyPref = getAccuracyPref();

  // stan początkowy z localStorage
  const [wybranyZakres, ustawZakres] = useState(zapisanyPref.preset || "30");
  const [dataOd, ustawOd] = useState(
    zapisanyPref.customFrom != null
      ? poczDnia(new Date(zapisanyPref.customFrom))
      : przesunDni(dzis, -30)
  );
  const [dataDo, ustawDo] = useState(
    zapisanyPref.customTo != null
      ? poczDnia(new Date(zapisanyPref.customTo))
      : dzis
  );

  useEffect(() => {
    if (!open) return;
    // odświeżamy z prefa bo mogło się zmienić z innego miejsca
    const p = getAccuracyPref();
    ustawZakres(p.preset || "30");
    if (p.customFrom != null) ustawOd(poczDnia(new Date(p.customFrom)));
    if (p.customTo   != null) ustawDo(poczDnia(new Date(p.customTo)));

    document.body.style.overflow = "hidden";
    const escHandler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", escHandler);
    return () => {
      window.removeEventListener("keydown", escHandler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function zmienZakres(id) {
    ustawZakres(id);
    if (id === "custom") {
      setAccuracyPref({ preset: "custom", customFrom: dataOd?.getTime() ?? null, customTo: dataDo?.getTime() ?? null });
    } else {
      setAccuracyPref({ preset: id });
    }
    // console.log("zmieniono zakres na:", id);
  }

  function zmienOd(d) {
    ustawOd(d);
    if (wybranyZakres === "custom")
      setAccuracyPref({ preset: "custom", customFrom: d?.getTime() ?? null, customTo: dataDo?.getTime() ?? null });
  }

  function zmienDo(d) {
    ustawDo(d);
    if (wybranyZakres === "custom")
      setAccuracyPref({ preset: "custom", customFrom: dataOd?.getTime() ?? null, customTo: d?.getTime() ?? null });
  }

  const zakres = useMemo(
    () => obliczZakres(wybranyZakres, dataOd, dataDo),
    [wybranyZakres, dataOd, dataDo]
  );

  const { accuracy, total, correct } = useMemo(() => {
    if (!open) return { accuracy: null, total: 0, correct: 0 };
    const wynik = getAccuracyInRange(zakres.od?.getTime(), zakres.do?.getTime());
    // console.log("wynik dokładności:", wynik);
    return wynik;
  }, [open, zakres]);

  if (!open) return null;

  const etykietaZakresu = wybranyZakres === "all"
    ? "od początku"
    : `${formatujDate(zakres.od)} – ${formatujDate(zakres.do)}`;

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
                   px-7 py-7 overflow-y-auto purple-scroll"
      >
        <button
          onClick={onClose}
          aria-label="Zamknij"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-brandPurple/30 bg-brandPurple/10
                     flex items-center justify-center text-sm hover:ring-2 ring-brandPurple/50 transition-all duration-200"
        >✕</button>

        <div className="flex items-center gap-3 mb-1 pr-10">
          <span className="text-3xl leading-none">🎯</span>
          <h2 className="text-xl font-black tracking-tight truncate">
            <span className="text-brandPurple">Dokładność</span>
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Procent poprawnych odpowiedzi w wybranym zakresie czasu.
        </p>

        {/* przyciski zakresów */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {ZAKRESY.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => zmienZakres(z.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                wybranyZakres === z.id
                  ? "bg-brandPurple text-white shadow-sm"
                  : "border border-brandPurple/25 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-brandPurple/50"
              }`}
            >{z.label}</button>
          ))}
        </div>

        {wybranyZakres === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Kalendarz etyk="Od" wybrana={dataOd} druga={dataDo} onWybor={zmienOd} />
            <Kalendarz etyk="Do" wybrana={dataDo} druga={dataOd} onWybor={zmienDo} />
          </div>
        )}

        <div className="rounded-2xl border-2 border-brandPurple/20
                        bg-gradient-to-br from-purple-50 to-yellow-50
                        dark:from-white/[0.05] dark:to-white/[0.02]
                        px-6 py-6 text-center">
          {accuracy === null ? (
            <>
              <div className="text-5xl mb-3">🤷</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brak odpowiedzi w tym zakresie.</p>
            </>
          ) : (
            <>
              <div className="text-5xl font-black tabular-nums text-brandPurple">{Math.round(accuracy * 100)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 tabular-nums">{correct} poprawnych z {total} odpowiedzi</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{etykietaZakresu}</div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// mini kalendarz do wyboru daty — używany tylko przy zakresie custom
function Kalendarz({ etyk, wybrana, druga, onWybor }) {
  const dzis = poczDnia(new Date());
  const [widok, ustawWidok] = useState({
    r: (wybrana || dzis).getFullYear(),
    m: (wybrana || dzis).getMonth(),
  });

  // jak zmienia się data z zewnątrz to przewijamy widok
  useEffect(() => {
    if (!wybrana) return;
    ustawWidok({ r: wybrana.getFullYear(), m: wybrana.getMonth() });
  }, [wybrana]);

  const ileDni = new Date(widok.r, widok.m + 1, 0).getDate();
  // przesuniecie — pn=0, nd=6
  const przesun = (new Date(widok.r, widok.m, 1).getDay() + 6) % 7;

  const komorki = [];
  for (let i = 0; i < przesun; i++) komorki.push(null);
  for (let d = 1; d <= ileDni; d++) komorki.push(new Date(widok.r, widok.m, d));
  while (komorki.length % 7 !== 0) komorki.push(null);

  // wyznaczamy lo/hi do podświetlania zakresu
  const lo = wybrana && druga ? (wybrana <= druga ? wybrana : druga) : null;
  const hi = wybrana && druga ? (wybrana <= druga ? druga : wybrana) : null;

  const prev = () => ustawWidok((v) => v.m === 0
    ? { r: v.r - 1, m: 11 }
    : { r: v.r,     m: v.m - 1 });

  const next = () => ustawWidok((v) => v.m === 11
    ? { r: v.r + 1, m: 0 }
    : { r: v.r,     m: v.m + 1 });

  return (
    <div className="rounded-2xl border border-brandPurple/20 bg-white/60 dark:bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{etyk}</span>
        <span className="text-xs font-bold tabular-nums">{wybrana ? formatujDate(wybrana) : "—"}</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prev} aria-label="Poprzedni miesiąc"
          className="w-7 h-7 rounded-full border border-brandPurple/25 bg-white/60 dark:bg-white/5
                     text-brandPurple text-xs font-bold flex items-center justify-center
                     hover:border-brandPurple/60 transition-all duration-150"
        >←</button>
        <span className="text-xs font-bold capitalize">{NAZWY_MIESIECY[widok.m]} {widok.r}</span>
        <button type="button" onClick={next} aria-label="Następny miesiąc"
          className="w-7 h-7 rounded-full border border-brandPurple/25 bg-white/60 dark:bg-white/5
                     text-brandPurple text-xs font-bold flex items-center justify-center
                     hover:border-brandPurple/60 transition-all duration-150"
        >→</button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DNI_TYG.map((d) => (
          <div key={d} className="text-[9px] font-bold text-gray-400 dark:text-gray-500 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {komorki.map((d, i) => {
          if (!d) return <div key={i} className="h-7" />;
          const zaznaczona = taSamaDoba(d, wybrana);
          const wPrzyszlosci = d > dzis;
          const wZakresie = lo && hi && d >= lo && d <= hi && !zaznaczona;
          return (
            <button
              key={i}
              type="button"
              disabled={wPrzyszlosci}
              onClick={() => onWybor(poczDnia(d))}
              className={`h-7 w-full text-[11px] font-bold tabular-nums rounded-md transition-all duration-150 ${
                zaznaczona   ? "bg-brandPurple text-white" :
                wZakresie    ? "bg-brandPurple/15 text-brandPurple" :
                wPrzyszlosci ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" :
                               "hover:bg-brandPurple/10 text-gray-700 dark:text-gray-300"
              }`}
            >{d.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
}
