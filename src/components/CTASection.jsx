import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-28 text-center fade-up fade-up-5">
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-5 leading-tight">
          Gotowy na <span className="text-brandPurple">szybkie efekty?</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-base mb-10 leading-relaxed">
          Dołącz do tysięcy osób, które uczą się języków przez zabawę —
          bez nudy, bez stresu, w&nbsp;swoim tempie.
        </p>
        <Link
          to="/fiszki"
          className="inline-block bg-brandPurple text-white font-bold py-3.5 px-10 rounded-full
                     text-sm uppercase tracking-wider shadow-lg
                     hover:scale-105 active:scale-95
                     hover:shadow-[0_8px_30px_rgba(139,92,246,0.45)]
                     transition-all duration-200 no-underline"
        >
          Zacznij naukę za darmo →
        </Link>
      </div>
    </section>
  );
}
