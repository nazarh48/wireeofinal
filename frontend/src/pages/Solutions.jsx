import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, getImageUrl } from "../services/api";

const DEFAULT_SOLUTIONS = [
  {
    _id: "1",
    category: "Smart Buildings",
    title: "Building Automation",
    description: "Comprehensive control systems for lighting, HVAC, and security integration in commercial and residential buildings.",
    icon: "🏢",
    features: ["Centralized Control", "Energy Management", "Security Integration"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    _id: "2",
    category: "Industrial",
    title: "Industrial Control",
    description: "Advanced automation solutions for manufacturing processes, motor control, and industrial safety systems.",
    icon: "⚙️",
    features: ["Process Control", "Motor Protection", "Safety Systems"],
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    _id: "3",
    category: "Energy",
    title: "Power Distribution",
    description: "Reliable electrical distribution systems with advanced protection and monitoring capabilities.",
    icon: "⚡",
    features: ["Load Management", "Fault Protection", "Power Quality"],
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    _id: "4",
    category: "Infrastructure",
    title: "Smart Infrastructure",
    description: "Intelligent systems for smart cities, transportation, and public infrastructure management.",
    icon: "🌐",
    features: ["IoT Integration", "Cloud Connectivity", "Predictive Maintenance"],
    image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    _id: "5",
    category: "Energy",
    title: "Energy Management",
    description: "Optimize energy consumption with intelligent monitoring and automated control systems.",
    icon: "🔋",
    features: ["Consumption Monitoring", "Peak Load Management", "Renewable Integration"],
    image: "https://images.unsplash.com/photo-1556912173-0a0227a79832?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    _id: "6",
    category: "Safety",
    title: "Safety & Protection",
    description: "Comprehensive electrical safety solutions including circuit protection and emergency systems.",
    icon: "🛡️",
    features: ["Circuit Protection", "Emergency Systems", "Arc Fault Detection"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
];

const Solutions = () => {
  const [solutions, setSolutions] = useState(DEFAULT_SOLUTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.solutions
      .list({ status: "active" })
      .then((res) => {
        if (res?.solutions?.length) setSolutions(res.solutions);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section with Enhanced Design */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white pt-32 pb-32 md:pt-40 md:pb-40 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-black opacity-40" />
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white mb-8 shadow-lg">
              <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Innovative Solutions</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Solutions
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
              Discover comprehensive electrical automation solutions designed for modern residential, commercial, and industrial applications.
            </p>

            {/* Optional CTA Button */}
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#solutions" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:scale-105 transform">
                <span>Explore All Solutions</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section */}
      <section id="solutions" className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Solutions
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of electrical automation solutions tailored to your specific needs
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading solutions…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {solutions.map((solution, index) => {
                const rawImage = solution.image || (Array.isArray(solution.images) && solution.images[0] ? (solution.images[0]?.url ?? solution.images[0]) : "");
                const imgSrc = typeof rawImage === "string" && rawImage.startsWith("http") ? rawImage : getImageUrl(rawImage || "");
                let features = [];
                if (Array.isArray(solution.features)) features = solution.features;
                else if (typeof solution.features === "string" && solution.features.trim()) {
                  try {
                    const parsed = JSON.parse(solution.features);
                    features = Array.isArray(parsed) ? parsed : [solution.features];
                  } catch {
                    features = solution.features.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
                  }
                }
                const id = solution._id || solution.id || index;
                const category = solution.category || "Solutions";

                // Icon colors cycling through blue, purple, indigo (matching Home theme)
                const iconColors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-indigo-500 to-indigo-600'
                ];
                const iconColor = iconColors[index % iconColors.length];

                return (
                  <Link
                    key={id}
                    to={`/solutions/${id}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 no-underline"
                    aria-label={`View details for ${solution.title}`}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[16/9]">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={solution.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${iconColor}`}>
                          <span className="text-8xl text-white opacity-80">{solution.icon || "📋"}</span>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-5 left-5">
                        <span className={`inline-block text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${iconColor} backdrop-blur-sm px-4 py-2 rounded-full shadow-lg`}>
                          {category}
                        </span>
                      </div>

                      {/* Hover Icon */}
                      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-6 md:p-7">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {solution.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {solution.description}
                      </p>

                      {/* Features List */}
                      {features.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${iconColor} flex-shrink-0 flex items-center justify-center shadow-sm`}>
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        <span>Learn More</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Enhanced Design */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Space?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover how our electrical solutions can enhance your operations, improve efficiency, and create smarter environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg transition-all shadow-lg hover:scale-105 transform">
              <span>Explore Products</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-all">
              <span>Contact Our Team</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
