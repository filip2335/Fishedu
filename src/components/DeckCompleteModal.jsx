import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function DeckCompleteModal({
  open,
  onClose,
  deck,
  known,
  unknown,
  knownWords = [],
  unknownWords = [],
  onRestart,
}) {
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

  if (!open) return null;

  const lacznie = known + unknown;
  const dokladnosc = lacznie > 0 ? Math.round((known / lacznie) * 100) : 0;
  // console.log("sesja done:", known, unknown, dokladnosc + "%");

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

        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-black tracking-tight">
            <span className="text-brandPurple">Talia ukończona!</span>
          </h2>
          {deck && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{deck.title}</p>
          )}
        </div>

        <div className="rounded-2xl border-2 border-brandPurple/20
                        bg-gradient-to-br from-purple-50 to-yellow-50
                        dark:from-white/[0.05] dark:to-white/[0.02]
                        px-6 py-5 text-center mb-5">
          <div className="text-5xl font-black tabular-nums text-brandPurple">{dokladnosc}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-widest uppercase font-bold">
            Dokładność
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 tabular-nums">
            {known} poprawnych z {lacznie}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl border-2 border-emerald-500/30
                          bg-emerald-50 dark:bg-emerald-900/15
                          px-4 py-4 text-center">
            <div className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">{known}</div>
            <div className="text-[11px] mt-1 font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">✓ Znanych</div>
          </div>
          <div className="rounded-2xl border-2 border-gray-400/30
                          bg-gray-50 dark:bg-white/5
                          px-4 py-4 text-center">
            <div className="text-2xl font-black tabular-nums text-gray-700 dark:text-gray-300">{unknown}</div>
            <div className="text-[11px] mt-1 font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">✗ Nieznanych</div>
          </div>
        </div>

        {(knownWords.length > 0 || unknownWords.length > 0) && (
          <div className="space-y-3 mb-5">
            {unknownWords.length > 0 && (
              <details className="rounded-2xl border border-gray-400/25 bg-white/60 dark:bg-white/5 px-3 py-2">
                <summary className="cursor-pointer text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-400 select-none">
                  Słówka do powtórki ({unknownWords.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {unknownWords.map((w, i) => (
                    <li key={`u-${i}`} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate font-semibold">{w.pl}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="flex-1 truncate text-gray-600 dark:text-gray-300">{w.en}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {knownWords.length > 0 && (
              <details className="rounded-2xl border border-emerald-500/20 bg-white/60 dark:bg-white/5 px-3 py-2">
                <summary className="cursor-pointer text-xs font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 select-none">
                  Słówka, które znałeś ({knownWords.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {knownWords.map((w, i) => (
                    <li key={`k-${i}`} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate font-semibold">{w.pl}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="flex-1 truncate text-gray-600 dark:text-gray-300">{w.en}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
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
          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="flex-1 px-4 py-3 rounded-full
                         bg-brandPurple text-white text-sm font-bold tracking-wide
                         hover:scale-[1.02] active:scale-95
                         hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                         transition-all duration-200"
            >
              🔁 Powtórz talię
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
