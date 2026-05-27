function Features() {
  const items = [
    {
      title: "Living Documentation",
      desc: "AI evolves your docs automatically. Each screen recording and knowledge session refines existing guides instead of creating new scattered files.",
    },
    {
      title: "Tacit Knowledge Capture", 
      desc: "Extract the 'why' behind decisions through guided exit interviews, email analysis, and workflow demonstrations that reveal hidden insights.",
    },
    {
      title: "Intelligent Onboarding",
      desc: "New hires learn from an AI agent trained on your departing employees' actual experience, reducing time-to-productivity by weeks.",
    },
  ];

  return (
    <section className="relative py-24 bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 mb-4">
            Why Alunyte
          </span>
          <h2 className="text-4xl font-semibold leading-tight sm:text-5xl text-slate-900">
            Turn employee transitions into{' '}
            <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              competitive advantages
            </span>
          </h2>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            Stop losing critical knowledge when employees leave. Capture, preserve, and transfer institutional expertise automatically.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Feature number with blue accent */}
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-semibold text-lg mb-4 shadow-lg shadow-sky-500/25">
                {index + 1}
              </div>
              
              {/* Feature content */}
              <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-sky-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.desc}
              </p>

              {/* Subtle hover effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-50/0 via-sky-50/50 to-cyan-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
