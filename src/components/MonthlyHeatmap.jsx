import { useMemo, useState } from "react";

const NAZWY_MIES = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
const NAZWY_MIES_PELNE = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];
const NAZWY_DNI = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

function dataISO(rok, mies, dzien) {
  return `${rok}-${String(mies + 1).padStart(2, "0")}-${String(dzien).padStart(2, "0")}`;
}

export function buildYearByMonth(dziennaM, rok) {
  const dzis = new Date();
  const kluczzDzis = dataISO(dzis.getFullYear(), dzis.getMonth(), dzis.getDate());
  const celRok = rok ?? dzis.getFullYear();
  const miesiace = [];
  for (let m = 0; m < 12; m++) {
    miesiace.push(zbudujBlokMiesiaca(celRok, m, dziennaM, kluczzDzis));
  }
  return miesiace;
}

function zbudujBlokMiesiaca(rok, mies, dziennaM, kluczzDzis) {
  const ileDni = new Date(rok, mies + 1, 0).getDate();
  const pierwszyDzien = (new Date(rok, mies, 1).getDay() + 6) % 7; // pn=0
  const komorki = [];
  for (let i = 0; i < pierwszyDzien; i++) komorki.push(null);
  for (let d = 1; d <= ileDni; d++) {
    const iso = dataISO(rok, mies, d);
    const wprzyszl = iso > kluczzDzis;
    const wpis = dziennaM[iso];
    komorki.push({
      date: iso,
      xp: wpis?.xp ?? 0,
      known: wpis?.known ?? 0,
      unknown: wpis?.unknown ?? 0,
      future: wprzyszl,
    });
  }
  while (komorki.length % 7 !== 0) komorki.push(null);
  const tygodnie = [];
  for (let c = 0; c < komorki.length; c += 7) {
    tygodnie.push(komorki.slice(c, c + 7));
  }
  return { rok, mies, tygodnie };
}

function formatujDatePL(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${NAZWY_MIES_PELNE[d.getMonth()]} ${d.getFullYear()} · ${NAZWY_DNI[d.getDay()]}`;
}

export default function MonthlyHeatmap({ dailyMap, year, compact = false }) {
  const miesiace = useMemo(() => buildYearByMonth(dailyMap || {}, year), [dailyMap, year]);
  const [hover, setHover] = useState(null);

  const maks = useMemo(() => {
    let m = 1;
    for (const blok of miesiace) {
      for (const tydz of blok.tygodnie) {
        for (const kom of tydz) {
          if (kom && kom.xp > m) m = kom.xp;
        }
      }
    }
    return m;
  }, [miesiace]);

  const klasaIntensywnosci = (kom) => {
    if (!kom) return "bg-transparent";
    if (kom.future || kom.xp <= 0) return "bg-gray-200 dark:bg-white/5";
    const t = kom.xp / maks;
    if (t < 0.25) return "bg-brandPurple/20";
    if (t < 0.5)  return "bg-brandPurple/40";
    if (t < 0.75) return "bg-brandPurple/70";
    return "bg-brandPurple";
  };

  const onWejscie = (kom, e) => { if (kom) setHover({ kom, x: e.clientX, y: e.clientY }); };
  const onRuch    = (kom, e) => { if (kom) setHover({ kom, x: e.clientX, y: e.clientY }); };
  const onWyjscie = () => setHover(null);

  const rozmiarKom = compact ? "w-2.5 h-2.5" : "w-3 h-3";
  const odstepWew  = compact ? "gap-0.5" : "gap-1";
  const odstepMies = compact ? "gap-2" : "gap-3";

  return (
    <div className="relative">
      <div className={`grid grid-cols-3 sm:grid-cols-6 ${odstepMies}`}>
        {miesiace.map(({ rok, mies, tygodnie }) => (
          <div key={`${rok}-${mies}`} className="flex flex-col gap-1 items-center">
            <div className="text-[10px] font-bold tracking-wide
                            text-gray-500 dark:text-gray-400 mb-0.5">
              {NAZWY_MIES[mies]}
            </div>
            <div className={`flex ${odstepWew}`}>
              {tygodnie.map((tydz, wi) => (
                <div key={wi} className={`flex flex-col ${odstepWew}`}>
                  {tydz.map((kom, di) => (
                    <div
                      key={di}
                      onMouseEnter={(e) => onWejscie(kom, e)}
                      onMouseMove={(e) => onRuch(kom, e)}
                      onMouseLeave={onWyjscie}
                      className={`${rozmiarKom} rounded-sm transition-all duration-150
                                  ${klasaIntensywnosci(kom)}
                                  ${kom ? "hover:ring-2 hover:ring-brandPurple hover:scale-125 cursor-pointer relative z-[1]" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <PasekLegendy maks={maks} setHover={setHover} />

      {hover && <TooltipHeatmapy x={hover.x} y={hover.y} kom={hover.kom} tekst={hover.tekst} />}
    </div>
  );
}

function PasekLegendy({ maks, setHover }) {
  const p1 = Math.max(1, Math.floor(0.25 * maks));
  const p2 = Math.max(p1 + 1, Math.floor(0.5 * maks));
  const p3 = Math.max(p2 + 1, Math.floor(0.75 * maks));
  const probki = [
    { cls: "bg-gray-200 dark:bg-white/5",  txt: "Brak aktywności (0 XP)" },
    { cls: "bg-brandPurple/20",            txt: maks <= 1 ? "Najmniejsza aktywność" : `1–${p1} XP w ciągu dnia` },
    { cls: "bg-brandPurple/40",            txt: maks <= 1 ? "Niewielka aktywność"   : `${p1 + 1}–${p2} XP w ciągu dnia` },
    { cls: "bg-brandPurple/70",            txt: maks <= 1 ? "Sporo aktywności"      : `${p2 + 1}–${p3} XP w ciągu dnia` },
    { cls: "bg-brandPurple",               txt: maks <= 1 ? "Najwięcej aktywności"  : `≥${p3 + 1} XP w ciągu dnia` },
  ];
  const onW = (t, e) => setHover({ tekst: t, kom: null, x: e.clientX, y: e.clientY });
  const onR = (t, e) => setHover({ tekst: t, kom: null, x: e.clientX, y: e.clientY });
  const onL = () => setHover(null);
  return (
    <div className="flex justify-end items-center gap-2 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
      <span>mniej</span>
      {probki.map((s, i) => (
        <span
          key={i}
          onMouseEnter={(e) => onW(s.txt, e)}
          onMouseMove={(e) => onR(s.txt, e)}
          onMouseLeave={onL}
          className={`w-3 h-3 rounded-sm ${s.cls} cursor-help hover:ring-2 hover:ring-brandPurple transition-all duration-150`}
        />
      ))}
      <span>więcej</span>
    </div>
  );
}

function TooltipHeatmapy({ x, y, kom, tekst }) {
  const PAD = 14, W = 220, H = 60;
  let left = x + PAD;
  let top  = y - H - PAD;
  if (typeof window !== "undefined") {
    if (left + W > window.innerWidth) left = x - W - PAD;
    if (top < 0) top = y + PAD;
  }
  if (!kom && tekst) {
    return (
      <div
        className="fixed pointer-events-none z-[120]
                   px-3 py-2 rounded-lg
                   bg-gray-900 dark:bg-gray-800 text-white
                   text-[11px] leading-relaxed
                   shadow-lg border border-brandPurple/30"
        style={{ left, top, width: W }}
      >
        <div className="text-gray-100">{tekst}</div>
      </div>
    );
  }
  const etykietaDate = formatujDatePL(kom.date);
  const etykietaXP = kom.future
    ? "Ten dzień jeszcze nie nadszedł"
    : kom.xp > 0
      ? `${kom.xp} XP (${kom.known} znam · ${kom.unknown} nie znam)`
      : "Brak aktywności";
  return (
    <div
      className="fixed pointer-events-none z-[120]
                 px-3 py-2 rounded-lg
                 bg-gray-900 dark:bg-gray-800 text-white
                 text-[11px] leading-relaxed
                 shadow-lg border border-brandPurple/30"
      style={{ left, top, width: W }}
    >
      <div className="font-bold tracking-tight">{etykietaDate}</div>
      <div className="text-gray-300 dark:text-gray-400 mt-0.5">{etykietaXP}</div>
    </div>
  );
}
