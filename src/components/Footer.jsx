import { Link } from "react-router-dom";

const KOLUMNY = [
  {
    title: "Nauka",
    links: [
      { label: "Fiszki", to: "/fiszki" },
      { label: "Gramatyka", to: "/gramatyka" },
    ],
  },
];

export default function Footer() {
  const rok = new Date().getFullYear();

  return (
    <footer className="focus-hide border-t border-gray-200 dark:border-gray-800 mt-16 text-gray-500 dark:text-gray-400">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <div className="text-xl font-black logo text-brandPurple mb-2">FishEdu</div>
            <p className="text-xs leading-relaxed">
              Naucz się angielskiego przez fiszki i gramatykę.
            </p>
          </div>

          {KOLUMNY.map((kol) => (
            <div key={kol.title}>
              <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 dark:text-gray-200 mb-3">
                {kol.title}
              </h4>
              <ul className="space-y-2">
                {kol.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm hover:text-brandPurple transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-xs text-center md:text-left">© {rok} FishEdu. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
