import { Link } from "react-router-dom";

export const SEEN_KEY = "seenWelcome";

const SEKCJE = [
  {
    icon: "🎴",
    title: "Fiszki",
    desc: "Tysiące gotowych słówek w taliach tematycznych. Stwórz też własne talie z prywatnymi słówkami.",
    to: "/fiszki",
    accent: "border-brandPurple",
    bg: "bg-purple-50 dark:bg-white/[0.03]",
  },
  {
    icon: "📚",
    title: "Gramatyka",
    desc: "Czasy, konstrukcje, zasady — wszystko podane prosto i z przykładami.",
    to: "/gramatyka",
    accent: "border-brandEmerald",
    bg: "bg-emerald-50 dark:bg-white/[0.03]",
  },
];

const KROKI = [
  { num: "1", title: "Wybierz talię",  desc: "Gotowe zestawy słówek lub Twoje własne — sam decydujesz, czego się uczysz." },
  { num: "2", title: "Ucz się słówek", desc: 'Klikaj „Znam" lub „Nie znam" — system sam zaplanuje powtórki.' },
  { num: "3", title: "Buduj passę",    desc: "Codzienna nauka, statystyki postępu i punkty XP. Nauka jak gra." },
];

function zapiszWidzial() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

export default function Witaj() {
  return (
    <section className="py-16 fade-up fade-up-1">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full border border-brandPurple/30
                         bg-brandPurple/10 text-brandPurple text-xs font-semibold tracking-wide mb-5">
          Witaj w FishEdu
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Naucz się <span className="text-brandPurple">angielskiego</span>{" "}
          <span className="text-brandYellow">bez nudy</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
          Fiszki, gramatyka i statystyki postępu — wszystko w jednym miejscu.
          Zacznij naukę w mniej niż minutę.
        </p>
      </div>

      <h2 className="text-xl font-black mb-5 text-center">
        Co znajdziesz <span className="text-brandPurple">w środku</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
        {SEKCJE.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            onClick={zapiszWidzial}
            className={`p-6 rounded-2xl border-2 ${s.accent} ${s.bg}
                        no-underline text-inherit
                        transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="text-4xl mb-3">{s.icon}</div>
            <h3 className="text-lg font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-black mb-5 text-center">
        Jak to <span className="text-brandPurple">działa</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {KROKI.map((krok) => (
          <div
            key={krok.num}
            className="p-6 rounded-2xl border-2 border-brandPurple/15
                       bg-purple-50/30 dark:bg-white/[0.02]"
          >
            <div className="w-10 h-10 rounded-full bg-brandPurple text-white text-base font-black
                            flex items-center justify-center mb-3">
              {krok.num}
            </div>
            <h3 className="text-base font-bold mb-2">{krok.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{krok.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border-2 border-brandPurple/25
                      bg-purple-50/50 dark:bg-white/[0.03]
                      px-8 py-10 text-center">
        <h3 className="text-xl font-black mb-3">
          Gotowy <span className="text-brandPurple">zacząć</span>?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
          Twój postęp jest zapisywany lokalnie w tej przeglądarce — wystarczy kliknąć i zaczynamy.
        </p>
        <Link
          to="/fiszki"
          onClick={zapiszWidzial}
          className="inline-block bg-brandPurple text-white text-sm font-bold
                     px-6 py-3 rounded-full tracking-wide
                     hover:scale-[1.02] active:scale-95
                     hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                     transition-all duration-200 no-underline"
        >
          Zacznij naukę →
        </Link>
      </div>
    </section>
  );
}
