export default function ServicesSection() {
  const items = [
    {
      title: "Cardiology",
      desc: "Heart checkups, ECG, blood pressure monitoring, and cardiac care.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21s-6.5-4.6-9-8.3C1 9.7 2.4 6.7 5.6 6.2c1.8-.3 3.4.6 4.4 2 1-1.4 2.6-2.3 4.4-2 3.2.5 4.6 3.5 2.6 6.5C18.5 16.4 12 21 12 21z" />
        </svg>
      ),
    },
    {
      title: "Orthopedics",
      desc: "Diagnosis and treatment for bones, joints, muscles, and rehab.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 15l6-6m-3 9l9-9M7 18l10-10" strokeLinecap="round" />
          <circle cx="6.5" cy="17.5" r="1.5" fill="currentColor" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: "Gynecology",
      desc: "Checkups, ultrasound, family planning, and prenatal care.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M12 12v8M12 16h4M12 16H8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Pediatrics",
      desc: "Dedicated care for children: vaccines, growth checks, guidance.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="7" r="3" />
          <circle cx="15" cy="7" r="3" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Our Services</h2>
          <p className="mt-3 text-slate-600">
            Choose the care you need — our team is ready to help.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="
                group rounded-2xl p-6
                bg-white text-slate-900
                border-2 border-emerald-500/80
                shadow-sm transition-all
                hover:bg-emerald-700 hover:text-white hover:shadow-lg
              "
            >
              <div
                className="
                  mb-4 inline-flex items-center justify-center rounded-xl p-3
                  bg-emerald-50 text-emerald-700
                  transition-colors
                  group-hover:bg-white/20 group-hover:text-white
                "
              >
                {icon}
              </div>

              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 group-hover:text-emerald-100">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Button under the cards */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="
              rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold
              shadow hover:bg-emerald-700 focus:outline-none
              focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
            "
          >
            View Staff
          </button>
        </div>
      </div>
    </section>
  );
}
