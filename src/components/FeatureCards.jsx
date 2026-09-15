import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const KARTY = [
  {
    icon: "🗂️",
    title: "Fiszki",
    to: "/fiszki",
    desc: "Tysiące gotowych zestawów lub stwórz własne talie dopasowane do Twojego poziomu.",
    accent: "border-brandPurple",
    bg: "bg-purple-50 dark:bg-white/[0.03]",
  },
  {
    icon: "📚",
    title: "Gramatyka",
    to: "/gramatyka",
    desc: "Zasady wytłumaczone prosto i jasno — z interaktywnymi ćwiczeniami na każdym kroku.",
    accent: "border-brandYellow",
    bg: "bg-yellow-50 dark:bg-white/[0.03]",
  },
];

function KartaFunkcji({ icon, title, to, desc, accent, bg, delay }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const t = setTimeout(() => el.classList.add("visible"), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <Link
      ref={ref}
      to={to}
      className={`feature-card fade-up ${delay} p-6 rounded-2xl border-2 ${accent} ${bg}
                  cursor-pointer select-none flex flex-col items-center text-center
                  justify-center gap-3 no-underline text-inherit`}
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </Link>
  );
}

export default function FeatureCards() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-black mb-4 text-center">
        Dlaczego <span className="text-brandPurple">FishEdu?</span>
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-14 max-w-xl mx-auto leading-relaxed">
        Nauka języka nie musi być nudna. Łączymy sprawdzone metody z&nbsp;nowoczesnym designem,
        żebyś robił postępy szybciej — i chętniej wracał po więcej.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
        {KARTY.map((karta, i) => (
          <KartaFunkcji key={karta.title} {...karta} delay={`fade-up-${i + 3}`} />
        ))}
      </div>
    </section>
  );
}
