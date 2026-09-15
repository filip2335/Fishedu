import { useParams } from "react-router-dom";
import { getTense } from "../data/tenses";
import DynamicPlaceholder from "./DynamicPlaceholder";
import BackButton from "../components/BackButton";

const ACCENTS = {
  purple:  { border: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]",  text: "text-brandPurple",  dot: "bg-brandPurple"  },
  yellow:  { border: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]",  text: "text-brandYellow",  dot: "bg-brandYellow"  },
  emerald: { border: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]", text: "text-brandEmerald", dot: "bg-brandEmerald" },
};

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function Czas() {
  const { tense: slug } = useParams();
  const data = getTense(slug);

  // Fallback gdy slug nieznany — placeholder z parent linkiem
  if (!data) {
    return <DynamicPlaceholder kind="gramatyka" />;
  }

  const a = ACCENTS[data.accent] || ACCENTS.purple;

  return (
    <section className="py-12 fade-up fade-up-1">
      {/* Wstecz */}
      <div className="mb-6">
        <BackButton to="/gramatyka" label="Gramatyka" />
      </div>

      {/* Nagłówek */}
      <div className="mb-12">
        <span className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                         bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 mb-3">
          {data.level}
        </span>
        <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${a.text}`}>
          {data.name}
        </h1>
      </div>

      {/* Budowa */}
      <Section title="Budowa">
        <div className={`rounded-2xl border-2 ${a.border} ${a.bg} p-6 space-y-3`}>
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-1">
              Twierdzenie
            </div>
            <code className="text-sm font-mono">{data.formula.affirmative}</code>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-1">
              Przeczenie
            </div>
            <code className="text-sm font-mono">{data.formula.negative}</code>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-1">
              Pytanie
            </div>
            <code className="text-sm font-mono">{data.formula.question}</code>
          </div>
        </div>
      </Section>

      {/* Kiedy używamy */}
      <Section title="Kiedy używamy">
        <ul className="space-y-2">
          {data.useCases.map((u, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Słowa-sygnały */}
      <Section title="Słowa-sygnały">
        <div className="flex flex-wrap gap-2">
          {data.signalWords.map((w) => {
            const en = typeof w === "string" ? w : w.en;
            const pl = typeof w === "string" ? null : w.pl;
            return (
              <span
                key={en}
                className={`relative group text-xs font-semibold px-3 py-1.5 rounded-full
                            border ${a.border} ${a.bg} ${a.text}
                            ${pl ? "cursor-help" : ""}`}
              >
                {en}
                {pl && (
                  <span
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                               px-2 py-1 rounded-md bg-gray-900 text-white text-[11px] font-medium
                               whitespace-nowrap shadow-lg
                               opacity-0 group-hover:opacity-100 transition-opacity duration-150
                               z-10"
                  >
                    {pl}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </Section>

      {/* Przykłady */}
      <Section title="Przykłady">
        <div className="space-y-3">
          {data.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-white/10
                         bg-white dark:bg-white/[0.02] p-4"
            >
              <div className="text-sm font-semibold mb-1">{ex.en}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 italic">{ex.pl}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Częste błędy */}
      <Section title="Częste błędy">
        <ul className="space-y-2">
          {data.commonMistakes.map((m, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-1 text-red-500 flex-shrink-0">⚠</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </Section>

    </section>
  );
}
