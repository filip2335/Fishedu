import Flashcard from "./Flashcard";

export default function WordOfDay() {
  return (
    <section className="py-20 fade-up fade-up-2">
      <h2 className="text-3xl font-black mb-3 text-center">
        Słowo <span className="text-brandPurple">dnia</span>
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-10">
        Dziś uczymy się słowa powiązanego ze świętem — najedź na fiszkę, by odkryć kontekst.
      </p>
      <div className="max-w-sm mx-auto">
        <Flashcard />
      </div>
    </section>
  );
}
