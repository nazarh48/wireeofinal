const Resources = () => {
  const resources = [
    {
      title: "Installation Guide",
      type: "Technical Guide",
      description: "Comprehensive installation procedures for electrical automation systems, including safety protocols and wiring diagrams.",
      downloadUrl: "#",
      icon: "🔧",
      thumbnail:
        "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "4.2 MB",
      format: "PDF"
    },
    {
      title: "System Configuration Manual",
      type: "Manual",
      description: "Step-by-step configuration guide for control panels, communication protocols, and system integration.",
      downloadUrl: "#",
      icon: "⚙️",
      thumbnail:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "3.8 MB",
      format: "PDF"
    },
    {
      title: "Energy Efficiency Whitepaper",
      type: "Whitepaper",
      description: "Best practices for optimizing energy consumption in electrical automation systems and smart buildings.",
      downloadUrl: "#",
      icon: "⚡",
      thumbnail:
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "2.1 MB",
      format: "PDF"
    },
    {
      title: "Product Compatibility Matrix",
      type: "Reference",
      description: "Complete compatibility guide for WIREEO products, including integration specifications and requirements.",
      downloadUrl: "#",
      icon: "📊",
      thumbnail:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "1.9 MB",
      format: "PDF"
    },
    {
      title: "Automation Templates",
      type: "Templates",
      description: "Pre-configured automation templates for common applications including lighting, HVAC, and security systems.",
      downloadUrl: "#",
      icon: "📈",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "5.3 MB",
      format: "ZIP"
    },
    {
      title: "Troubleshooting Guide",
      type: "Support",
      description: "Comprehensive troubleshooting procedures for common issues, diagnostic tools, and maintenance schedules.",
      downloadUrl: "#",
      icon: "🔍",
      thumbnail:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "3.5 MB",
      format: "PDF"
    }
  ];

  const webinars = [
    {
      title: "System Design Fundamentals",
      date: "March 15, 2024",
      duration: "45 min",
      description: "Learn the fundamentals of electrical automation system design, including load calculations and component selection.",
      thumbnail: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Advanced Control Strategies",
      date: "March 22, 2024",
      duration: "60 min",
      description: "Explore advanced control algorithms, PID tuning, and optimization techniques for industrial applications.",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Safety & Compliance",
      date: "March 29, 2024",
      duration: "40 min",
      description: "Understanding electrical safety standards, compliance requirements, and best practices for safe installations.",
      thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2092&q=80')]"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Resources</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive technical documentation, guides, and training materials for electrical automation professionals.
          </p>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technical Downloads</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access professional documentation, installation guides, and technical specifications for WIREEO products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300">
                {resource.thumbnail && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <img
                      src={resource.thumbnail}
                      alt={`${resource.title} thumbnail`}
                      className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{resource.icon}</div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {resource.type}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{resource.format}</span>
                  <span>{resource.size}</span>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webinars Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technical Training</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional training sessions covering system design, installation, and advanced configuration techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300">
                <div className="relative">
                  <img
                    src={webinar.thumbnail}
                    alt={webinar.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Professional
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {webinar.date}
                    <span className="mx-2">•</span>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {webinar.duration}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{webinar.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{webinar.description}</p>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our technical newsletter for the latest product updates, industry insights, and professional resources.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;