import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

const FunctionsCategory = ({ title, items }) => {
  return (
    <div className="bg-white rounded-2xl shadow-premium hover-lift p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
          {items.length} items
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start text-sm text-gray-700">
            <svg
              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SolutionPage = () => {
  const features = [
    {
      title: "Lighting",
      description:
        "Set scenes, adjust brightness, and control zones with quick actions that fit your routine.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2a7 7 0 00-4 12.74V17a2 2 0 002 2h4a2 2 0 002-2v-2.26A7 7 0 0012 2zm-2 20h4"
          />
        </svg>
      ),
    },
    {
      title: "Shading systems",
      description:
        "Open, close, and schedule blinds or curtains for comfort, privacy, and daylight control.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v16M12 4v16M16 4v16" />
        </svg>
      ),
    },
    {
      title: "Heating / Cooling",
      description:
        "Manage temperature by room, set targets, and keep your home comfortable throughout the day.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14a2 2 0 104 0V7a2 2 0 10-4 0v7z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l1.5 1.5M16.5 16.5L18 18" />
        </svg>
      ),
    },
    {
      title: "Parameters Views",
      description:
        "See key values at a glance—status, modes, sensors, and room-by-room summaries in one place.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3h8v6h-8V3zM3 17h8v4H3v-4z" />
        </svg>
      ),
    },
    {
      title: "Universal orders",
      description:
        "Trigger common actions fast: all off, away mode, night mode, and custom global commands.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      ),
    },
    {
      title: "Ventilation systems",
      description:
        "Control airflow and quality settings, run timers, and manage ventilation based on comfort needs.",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h10a4 4 0 110 8H7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h8" />
        </svg>
      ),
    },
  ];

  const functionsByCategory = [
    {
      title: "LIGHTING",
      items: ["Turn on/off by room", "Dim level control", "Scene presets (e.g., Relax/Work)", "All lights off"],
    },
    {
      title: "HEATING / COOLING",
      items: ["Set target temperature", "Switch mode (Heat/Cool/Auto)", "Schedule by time", "Eco mode toggle"],
    },
    {
      title: "VENTILATION SYSTEM",
      items: ["Fan speed control", "Timer run (15/30/60 min)", "Air quality boost", "Night quiet mode"],
    },
    {
      title: "GENERAL ACTIONS",
      items: ["Away mode", "Night mode", "All devices off", "Quick favorites"],
    },
    {
      title: "SCENARIOS",
      items: ["Morning routine", "Arrive home routine", "Movie night scene", "Sleep scene"],
    },
    {
      title: "INFO AND WARNINGS",
      items: ["Open window detected", "Device offline notice", "Low battery warning", "System status overview"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]"
        ></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            What can <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Wireeo</span> do
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Wireeo will become the ideal interface for you!
          </p>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-400 rounded-full opacity-20 animate-float animation-delay-1000"></div>
      </section>

      {/* Description */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 animate-fade-in-up">A smart interface for daily life</h2>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-200">
              Wireeo is designed to simplify how you control and monitor home systems. It brings key actions,
              device status, and automation into one clean experience—so you can manage comfort, lighting, and
              airflow quickly, whether you&apos;re at home or away.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid 2x3 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Short, direct controls for the systems you use most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Paragraph */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-premium-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Communication objects</h3>
            <p className="text-gray-600 leading-relaxed">
              Wireeo organizes devices and controls as communication objects—simple building blocks that represent
              rooms, zones, sensors, and actions. This structure helps keep the interface clear while still supporting
              powerful automation: quick commands, grouped actions, and scenario-based control.
            </p>
          </div>
        </div>
      </section>

      {/* Functions Table / Structured List */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Functions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Example actions and controls (placeholders you can replace later).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {functionsByCategory.map((c) => (
              <FunctionsCategory key={c.title} title={c.title} items={c.items} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">Note</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Some advanced functions may be available only in Wireeo Pro. Availability can also depend on the devices
            installed in your home and the selected app version.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link
              to="/products"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Products
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionPage;

