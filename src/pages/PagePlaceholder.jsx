export default function PagePlaceholder({ icon, title, desc }) {
  return (
    <section className="py-24 md:py-32 text-center fade-up fade-up-1">
      {icon && <div className="text-6xl mb-6">{icon}</div>}
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
        <span className="text-brandPurple">{title}</span>
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
        {desc}
      </p>
      <span
        className="inline-block px-5 py-2 rounded-full border border-brandPurple/30
                   bg-brandPurple/10 text-brandPurple text-sm font-semibold tracking-wide"
      >
        Coming soon
      </span>
    </section>
  );
}
