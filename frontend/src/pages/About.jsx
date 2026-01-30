const About = () => {
  const stats = [
    { number: "50K+", label: "Homes Connected" },
    { number: "3", label: "App Versions" },
    { number: "10+", label: "Years Experience" },
    { number: "98%", label: "User Satisfaction" }
  ];

  const values = [
    {
      title: "Innovation",
      description: "We develop cutting-edge smart home technology that adapts to your lifestyle.",
      icon: "💡"
    },
    {
      title: "Reliability",
      description: "Built for consistent performance you can trust every day.",
      icon: "⭐"
    },
    {
      title: "User Focus",
      description: "Simple, intuitive interfaces designed for everyone.",
      icon: "🏠"
    },
    {
      title: "Efficiency",
      description: "Smart automation that saves energy and reduces costs.",
      icon: "⚡"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]"
        ></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Wireeo</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 animate-fade-in-up animation-delay-200">
              Building smart-home experiences that simplify daily life—control, comfort, and clarity in one place.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto animate-scale-in animation-delay-400"></div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2014, we started with a simple vision: make home automation accessible to everyone.
                </p>
                <p>
                  Today, we help thousands of homeowners create smarter, more efficient living spaces through intuitive technology.
                </p>
                <p>
                  Our focus on innovation, reliability, and user experience drives everything we do.
                </p>
              </div>
            </div>
            <div className="animate-fade-in-right">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Smart Home Technology"
                  className="rounded-2xl shadow-premium-lg hover-lift"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 animate-float"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-900 to-emerald-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center animate-scale-in animation-delay-[${index * 0.1}s]`}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              The principles that shape how we design simple, reliable smart-home technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={`bg-white p-8 rounded-2xl shadow-premium hover-lift text-center animate-scale-in animation-delay-[${index * 0.1}s]`}
              >
                <div className="text-6xl mb-4 animate-bounce">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 animate-fade-in-up">Our Mission</h2>
            <p className="text-xl text-gray-300 mb-8 animate-fade-in-up animation-delay-200 leading-relaxed">
              To make smart home automation simple, accessible, and beneficial for everyone. We believe technology should enhance your life, not complicate it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Download Apps
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                Get Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;