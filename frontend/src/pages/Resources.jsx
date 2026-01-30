const Resources = () => {
  const resources = [
    {
      title: "Getting Started Guide",
      type: "Guide",
      description: "A simple walkthrough to connect devices, set up rooms, and build your first smart-home routines.",
      downloadUrl: "#",
      icon: "📋",
      thumbnail:
        "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "2.4 MB",
      format: "PDF"
    },
    {
      title: "Smart Home Security Basics",
      type: "Whitepaper",
      description: "Practical tips for safer device setup, access control, and account protection.",
      downloadUrl: "#",
      icon: "🔒",
      thumbnail:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "1.8 MB",
      format: "PDF"
    },
    {
      title: "Energy-Saving Checklist",
      type: "Checklist",
      description: "Quick actions and settings to reduce power usage with lighting, climate, and scheduling.",
      downloadUrl: "#",
      icon: "⚡",
      thumbnail:
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "856 KB",
      format: "PDF"
    },
    {
      title: "Device Compatibility Guide",
      type: "Guide",
      description: "Understand common device types, pairing steps, and how to plan a reliable smart-home setup.",
      downloadUrl: "#",
      icon: "🔌",
      thumbnail:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "3.2 MB",
      format: "PDF"
    },
    {
      title: "Automation Templates Pack",
      type: "Template",
      description: "Ready-to-use routines for morning, night, away mode, and room-based controls.",
      downloadUrl: "#",
      icon: "🧩",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "4.1 MB",
      format: "ZIP"
    },
    {
      title: "Troubleshooting Handbook",
      type: "Guide",
      description: "Common fixes for connectivity, device pairing, and automation rules that don’t trigger.",
      downloadUrl: "#",
      icon: "⚙️",
      thumbnail:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
      size: "2.9 MB",
      format: "PDF"
    }
  ];

  const webinars = [
    {
      title: "First Setup Walkthrough",
      date: "March 15, 2024",
      duration: "25 min",
      description: "Learn how to add devices, create rooms, and set quick actions in minutes.",
      thumbnail: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Scenes & Scheduling",
      date: "March 22, 2024",
      duration: "35 min",
      description: "Build routines for lighting, shading, climate, and ventilation using simple triggers.",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Energy Optimization",
      date: "March 29, 2024",
      duration: "30 min",
      description: "Practical tips to reduce energy usage with automation and smart defaults.",
      thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2092&q=80')]"
        ></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Resources & <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Downloads</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Guides, templates, and quick tutorials to help you set up and use smart-home automation with confidence.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-400 rounded-full opacity-20 animate-float animation-delay-1000"></div>
      </section>

      {/* Downloads Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Free Downloads</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Download starter guides and templates you can customize for your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-premium hover-lift p-6 animate-scale-in animation-delay-[${index * 0.1}s]`}
              >
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
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    {resource.type}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{resource.format}</span>
                  <span>{resource.size}</span>
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
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
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Quick Tutorials</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Short sessions that cover the essentials: setup, scenes, and energy savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-premium hover-lift overflow-hidden animate-scale-in animation-delay-[${index * 0.1}s]`}
              >
                <div className="relative">
                  <img
                    src={webinar.thumbnail}
                    alt={webinar.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Live
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

                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Subscribe to our newsletter for the latest insights, trends, and exclusive content delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto animate-fade-in-up animation-delay-400">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
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