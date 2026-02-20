import { Link } from 'react-router-dom';

const About = () => {
  const approachPillars = [
    {
      title: "Design-Led Hardware",
      description: "Devices created to integrate naturally into refined interiors."
    },
    {
      title: "Structured KNX Architecture",
      description: "Predictable communication logic and integration stability."
    },
    {
      title: "Hospitality Specialization",
      description: "A complete ecosystem dedicated to modern hotel infrastructure."
    },
    {
      title: "Controlled Personalization",
      description: "Customization within disciplined production parameters."
    }
  ];

  const values = [
    {
      title: "Innovation",
      subtitle: "Innovation with Purpose",
      description: "We innovate where it matters — in hardware architecture, system logic, and hospitality workflows. Every Wireeo product is developed in-house, with a focus on long-term relevance rather than short-term trends. Innovation is not decoration. It is structured progress.",
      icon: "1"
    },
    {
      title: "KNX Standard",
      subtitle: "Committed to Open KNX Architecture",
      description: "We build on the KNX standard to ensure interoperability, scalability, and long-term project viability. Certified architecture and disciplined object structure guarantee predictable integration in professional environments. Standards are not limitations. They are foundations.",
      icon: "2"
    },
    {
      title: "Passion",
      subtitle: "Engineering Driven by Passion",
      description: "Behind every device stands a team committed to precision and refinement. From mechanical detailing to firmware logic, passion translates into measurable quality. We care about how it works — and how it belongs.",
      icon: "3"
    },
    {
      title: "Rigor",
      subtitle: "Rigor in Every Layer",
      description: "Engineering discipline defines our process. Controlled production parameters, structured configuration logic, and manufacturing precision ensure consistency across projects. Nothing is accidental. Everything is engineered.",
      icon: "4"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-400 mb-4">About Wireeo</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Engineering Discipline.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Architectural Clarity.</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Wireeo is a European manufacturer of premium KNX devices, designed for luxury residential and hospitality environments.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                We develop and manufacture structured hardware platforms that combine architectural design with disciplined engineering logic — ensuring reliability, consistency, and long-term project viability.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mt-8"></div>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src="/assets/About/Picture4_1.jpg"
                alt="Wireeo smart control panel in hospitality setting"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Wireeo was founded with a clear objective: to create KNX equipment that respects both architecture and engineering.
                </p>
                <p>
                  From mechanical structure and electronic design to firmware logic and cloud integration, every component is developed with control and precision.
                </p>
                <p className="font-medium text-gray-800">
                  We do not assemble generic solutions.<br />
                  We engineer coherent systems.
                </p>
              </div>
            </div>
            <div>
              <img
                src="/assets/About/Picture4_2.png"
                alt="Wireeo smart switch on refined interior"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Approach</h2>
              <div className="space-y-6">
                {approachPillars.map((pillar, index) => (
                  <div key={index} className="border-l-4 border-emerald-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{pillar.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="/assets/About/Picture4_3.png"
                alt="Wireeo control panel in modern environment"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that drive our commitment to excellence in KNX and hospitality solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg text-center transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{value.title}</h3>
                <p className="text-sm font-medium text-emerald-600 mb-4">{value.subtitle}</p>
                <p className="text-gray-600 leading-relaxed text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              To engineer KNX devices and hospitality ecosystems that bring structure to complexity — enabling professionals to design intelligent spaces with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-block text-center"
              >
                Explore Our Products
              </Link>
              <Link
                to="/solutions"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 inline-block text-center"
              >
                Discover Wireeo Hospitality
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
