import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const KOLOR_AKCENTU = {
  purple:  { text: "text-brandPurple",  border: "border-brandPurple/30",  bg: "bg-purple-50 dark:bg-purple-900/15"   },
  yellow:  { text: "text-brandYellow",  border: "border-brandYellow/40",  bg: "bg-yellow-50 dark:bg-yellow-900/15"   },
  emerald: { text: "text-brandEmerald", border: "border-brandEmerald/40", bg: "bg-emerald-50 dark:bg-emerald-900/15" },
};

const EMOJI_GRUPY = {
  past:    "⏪",
  present: "⏺️",
  future:  "⏩",
};

function wykryjGrupe(slug) {
  if (!slug) return "present";
  if (slug.startsWith("past"))   return "past";
  if (slug.startsWith("future")) return "future";
  return "present";
}

export default function TenseSummaryModal({ open, onClose, tense, slug }) {
  const navigate = useNavigate();

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

  if (!open || !tense) return null;

  const akcent = KOLOR_AKCENTU[tense.accent] || KOLOR_AKCENTU.purple;
  const emoji = EMOJI_GRUPY[wykryjGrupe(slug)];
  const przyklad = tense.examples?.[0];
  const wgTypu = tense.byType;

  const idzPelna = () => {
    onClose();
    navigate(`/gramatyka/${slug}`);
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

        <div className="flex items-center gap-3 mb-2 pr-10">
          <span className="text-3xl leading-none">{emoji}</span>
          <h2 className={`text-2xl font-black tracking-tight ${akcent.text}`}>
            {tense.name}
          </h2>
          {tense.level && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                             bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
              {tense.level}
            </span>
          )}
        </div>

        {tense.shortDescription && (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
            {tense.shortDescription}
          </p>
        )}

        {wgTypu ? (
          <div className="space-y-3 mb-5">
            {[
              { key: "affirmative", label: "Twierdzenie" },
              { key: "question",    label: "Pytanie"     },
              { key: "negative",    label: "Przeczenie"  },
            ].map(({ key, label }) => {
              const item = wgTypu[key];
              if (!item) return null;
              return (
                <div
                  key={key}
                  className={`rounded-2xl border-2 ${akcent.border} ${akcent.bg} px-5 py-4`}
                >
                  <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
                    {label}
                  </div>
                  {item.formula && (
                    <div className={`text-sm font-bold ${akcent.text} font-mono leading-relaxed mb-2`}>
                      {item.formula}
                    </div>
                  )}
                  {item.example && (
                    <>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.example.en}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {item.example.pl}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {tense.formula?.affirmative && (
              <div className={`rounded-2xl border-2 ${akcent.border} ${akcent.bg} px-5 py-4 mb-5`}>
                <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Wzór (zdanie twierdzące)
                </div>
                <div className={`text-sm font-bold ${akcent.text} font-mono leading-relaxed`}>
                  {tense.formula.affirmative}
                </div>
              </div>
            )}

            {przyklad && (
              <div className="rounded-2xl border border-brandPurple/20 bg-white/60 dark:bg-white/5 px-5 py-4 mb-5">
                <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Przykład
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {przyklad.en}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {przyklad.pl}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-full
                       border-2 border-brandPurple/25 bg-white/60 dark:bg-white/5
                       text-gray-700 dark:text-gray-200 text-sm font-bold tracking-wide
                       hover:border-brandPurple/60 transition-all duration-200"
          >
            Zamknij
          </button>
          <button
            type="button"
            onClick={idzPelna}
            className="flex-1 px-4 py-3 rounded-full
                       bg-brandPurple text-white text-sm font-bold tracking-wide
                       hover:scale-[1.02] active:scale-95
                       hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                       transition-all duration-200"
          >
            Zobacz pełną lekcję →
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
