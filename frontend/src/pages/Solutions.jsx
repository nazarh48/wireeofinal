import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, getImageUrl } from "../services/api";

const DEFAULT_SOLUTIONS = [
  { _id: "1", title: "Building Automation", description: "Comprehensive control systems for lighting, HVAC, and security integration in commercial and residential buildings.", icon: "🏢", features: ["Centralized Control", "Energy Management", "Security Integration", "Remote Monitoring"], image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
  { _id: "2", title: "Industrial Control", description: "Advanced automation solutions for manufacturing processes, motor control, and industrial safety systems.", icon: "⚙️", features: ["Process Control", "Motor Protection", "Safety Systems", "Data Analytics"], image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
  { _id: "3", title: "Power Distribution", description: "Reliable electrical distribution systems with advanced protection and monitoring capabilities.", icon: "⚡", features: ["Load Management", "Fault Protection", "Power Quality", "Grid Integration"], image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
  { _id: "4", title: "Smart Infrastructure", description: "Intelligent systems for smart cities, transportation, and public infrastructure management.", icon: "🌐", features: ["IoT Integration", "Cloud Connectivity", "Predictive Maintenance", "Real-time Analytics"], image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
  { _id: "5", title: "Energy Management", description: "Optimize energy consumption with intelligent monitoring and automated control systems.", icon: "🔋", features: ["Consumption Monitoring", "Peak Load Management", "Renewable Integration", "Cost Optimization"], image: "https://images.unsplash.com/photo-1556912173-0a0227a79832?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
  { _id: "6", title: "Safety & Protection", description: "Comprehensive electrical safety solutions including circuit protection and emergency systems.", icon: "🛡️", features: ["Circuit Protection", "Emergency Systems", "Arc Fault Detection", "Ground Fault Protection"], image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Electrical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Solutions</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional electrical automation solutions designed for residential, commercial, and industrial applications.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive electrical automation solutions tailored to meet the specific needs of different industries and applications.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(loading ? DEFAULT_SOLUTIONS : solutions).map((solution, index) => {
              const imgSrc = solution.image?.startsWith("http") ? solution.image : getImageUrl(solution.image || "");
              const features = Array.isArray(solution.features) ? solution.features : [];
              const id = solution._id || solution.id || index;
              return (
                <div key={id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden group transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={solution.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4 text-4xl">{solution.icon || "📋"}</div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {solution.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>

                    {features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Key Features</h4>
                        <ul className="space-y-2">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link
                      to={`/solutions/${id}`}
                      className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover how our electrical solutions can enhance your operations and improve efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center">
              View Products
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;