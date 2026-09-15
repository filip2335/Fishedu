import { useState, useMemo } from "react";
import TenseSummaryModal from "../components/TenseSummaryModal";
import { getTense } from "../data/tenses";

const AKCENTY = {
  purple:  { border: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]",  text: "text-brandPurple"  },
  yellow:  { border: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]",  text: "text-brandYellow"  },
  emerald: { border: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]", text: "text-brandEmerald" },
};

const GRUPY_CZASOW = [
  { key: "past",    label: "Czas przeszły"     },
  { key: "present", label: "Czas teraźniejszy" },
  { key: "future",  label: "Czas przyszły"     },
];

const CZASY = [
  { title: "Present Simple",             slug: "present-simple",             accent: "purple",  group: "present" },
  { title: "Present Continuous",         slug: "present-continuous",         accent: "yellow",  group: "present" },
  { title: "Present Perfect",            slug: "present-perfect",            accent: "emerald", group: "present" },
  { title: "Present Perfect Continuous", slug: "present-perfect-continuous", accent: "yellow",  group: "present" },
  { title: "Past Simple",                slug: "past-simple",                accent: "emerald", group: "past"    },
  { title: "Past Continuous",            slug: "past-continuous",            accent: "purple",  group: "past"    },
  { title: "Past Perfect",               slug: "past-perfect",               accent: "yellow",  group: "past"    },
  { title: "Past Perfect Continuous",    slug: "past-perfect-continuous",    accent: "purple",  group: "past"    },
  { title: "Future Simple",              slug: "future-simple",              accent: "emerald", group: "future"  },
  { title: "Future Continuous",          slug: "future-continuous",          accent: "purple",  group: "future"  },
  { title: "Future Perfect",             slug: "future-perfect",             accent: "yellow",  group: "future"  },
  { title: "Future Perfect Continuous",  slug: "future-perfect-continuous",  accent: "emerald", group: "future"  },
];

function KartaCzasu({ t, przyciemniona = false, onOtworz }) {
  const a = AKCENTY[t.accent];
  return (
    <button
      type="button"
      onClick={() => onOtworz(t.slug)}
      className={`p-6 rounded-2xl border-2 ${a.border} ${a.bg}
                  cursor-pointer select-none flex flex-col items-center text-center
                  justify-center gap-2 no-underline text-inherit min-h-[120px] w-full
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                  ${przyciemniona ? "opacity-50 hover:opacity-100" : ""}`}
    >
      <h3 className={`text-base font-bold ${a.text}`}>{t.title}</h3>
    </button>
  );
}

export default function Gramatyka() {
  const [aktGrupa, setAktGrupa] = useState(null);
  const [zapytanie, setZapytanie] = useState("");
  const [modalSlug, setModalSlug] = useState(null);
  const modalCzas = modalSlug ? getTense(modalSlug) : null;

  const trimZap = zapytanie.trim().toLowerCase();
  const szuka = trimZap.length > 0;

  const { pasujace, pozostale } = useMemo(() => {
    if (szuka) {
      const dopasowane = CZASY.filter((t) => t.title.toLowerCase().includes(trimZap));
      return { pasujace: dopasowane, pozostale: [] };
    }
    if (!aktGrupa) return { pasujace: CZASY, pozostale: [] };
    const pasujace = CZASY.filter((t) => t.group === aktGrupa);
    const pozostale = CZASY.filter((t) => t.group !== aktGrupa);
    return { pasujace, pozostale };
  }, [aktGrupa, trimZap, szuka]);

  const etykietaGrupy = GRUPY_CZASOW.find((g) => g.key === aktGrupa)?.label;

  return (
    <section className="py-20 fade-up fade-up-1">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span className="text-brandPurple">Gramatyka</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
          Zasady wytłumaczone prosto i jasno — z interaktywnymi ćwiczeniami na każdym kroku.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-6 relative">
        <input
          type="text"
          value={zapytanie}
          onChange={(e) => setZapytanie(e.target.value)}
          placeholder="🔍 Szukaj czasu..."
          className="w-full px-4 py-2.5 pl-4 pr-9 rounded-full
                     border border-brandPurple/25
                     bg-white/60 dark:bg-white/5 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-brandPurple/50 focus:border-brandPurple/50
                     transition-all duration-200"
        />
        {zapytanie && (
          <button
            type="button"
            onClick={() => setZapytanie("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                       text-gray-400 hover:text-brandPurple hover:bg-brandPurple/10
                       flex items-center justify-center text-sm
                       transition-all duration-150"
            aria-label="Wyczyść wyszukiwarkę"
          >✕</button>
        )}
      </div>

      <div className={`flex flex-wrap justify-center gap-2 mb-12 ${szuka ? "opacity-40 pointer-events-none" : ""}`}>
        {GRUPY_CZASOW.map((g) => {
          const aktywna = aktGrupa === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setAktGrupa(aktywna ? null : g.key)}
              disabled={szuka}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider
                          border transition-all duration-200 ${
                aktywna
                  ? "bg-brandPurple text-white border-brandPurple shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
                  : "bg-transparent text-gray-700 dark:text-white/80 border-brandPurple/30 hover:border-brandPurple/60"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {!szuka && aktGrupa && (
        <h2 className="text-sm font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-4">
          {etykietaGrupy}
        </h2>
      )}

      {szuka && pasujace.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nie znaleziono czasu pasującego do <span className="font-bold text-gray-900 dark:text-gray-100">"{zapytanie}"</span>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {pasujace.map((t) => (
            <KartaCzasu key={t.slug} t={t} onOtworz={setModalSlug} />
          ))}
        </div>
      )}

      {!szuka && pozostale.length > 0 && (
        <>
          <h2 className="text-sm font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mt-12 mb-4">
            Pozostałe czasy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {pozostale.map((t) => (
              <KartaCzasu key={t.slug} t={t} onOtworz={setModalSlug} przyciemniona />
            ))}
          </div>
        </>
      )}

      <TenseSummaryModal
        open={!!modalCzas}
        onClose={() => setModalSlug(null)}
        tense={modalCzas}
        slug={modalSlug}
      />
    </section>
  );
}
