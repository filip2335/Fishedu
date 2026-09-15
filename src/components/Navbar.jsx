import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Fiszki", to: "/fiszki" },
  { label: "Gramatyka", to: "/gramatyka" },
  { label: "Statystyki", to: "/statystyki" },
];

export default function Navbar({ dark, setDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="focus-hide fixed top-8 left-0 right-0 z-50 flex flex-col items-center px-4">
      <nav
        className={`
          w-full max-w-4xl flex items-center justify-between gap-4
          rounded-full px-6 py-2.5
          border border-brandPurple/20
          backdrop-blur-xl transition-all duration-300
          ${dark
            ? (scrolled
                ? "bg-black/70 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.18)]"
                : "bg-black/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]")
            : (scrolled
                ? "bg-white/70 shadow-[0_8px_24px_rgba(15,23,42,0.08),0_0_0_1px_rgba(139,92,246,0.18)]"
                : "bg-white/50 shadow-[0_4px_16px_rgba(15,23,42,0.06)]")
          }
        `}
      >
        <Link
          to="/"
          className="logo flex items-center gap-0.5 text-xl font-black tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-brandPurple">Fish</span>
          <span className="text-brandYellow">Edu</span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className={`text-sm font-semibold hover:text-brandPurple transition-colors duration-200 tracking-wide ${dark ? "text-white/70" : "text-gray-700"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-full border border-brandPurple/30 bg-brandPurple/10
                       flex items-center justify-center text-base
                       hover:ring-2 ring-brandPurple/50 transition-all duration-200"
            aria-label="Przełącz motyw"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 rounded-full border border-brandPurple/30 bg-brandPurple/10
                       flex items-center justify-center transition-all duration-200
                       hover:ring-2 ring-brandPurple/50"
            aria-label="Menu"
          >
            <svg className={`w-4 h-4 ${dark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className={`md:hidden mt-2 w-full max-w-4xl
                     rounded-2xl border border-brandPurple/20 backdrop-blur-xl
                     px-6 py-4 flex flex-col gap-3
                     ${dark
                       ? "bg-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                       : "bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"}`}
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`text-sm font-semibold hover:text-brandPurple transition-colors ${dark ? "text-white/75" : "text-gray-700"}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
