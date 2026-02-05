import { useState, useEffect, useRef } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    apiService.solutions
      .list({ status: "active" })
      .then((res) => {
        if (res?.solutions?.length) setSolutions(res.solutions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction) => {
    const itemsToShow = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    const maxIndex = Math.max(0, solutions.length - itemsToShow);
    
    if (direction === 'left') {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Electrical <span className="text-blue-400">Solutions</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Professional electrical automation solutions designed for residential, commercial, and industrial applications.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Solutions Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Solutions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive electrical automation solutions tailored to meet the specific needs of different industries and applications.
            </p>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-500 gap-8"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1))}%)`
                }}
              >
                {(loading ? DEFAULT_SOLUTIONS : solutions).map((solution, index) => {
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
                  return (
                    <div key={id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2">
                      <div className="bg-gray-50 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                        <div className="relative overflow-hidden bg-white h-48">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={solution.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div className="absolute top-4 left-4 text-3xl bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-md">{solution.icon || "📋"}</div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {solution.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">{solution.description}</p>

                          {features.length > 0 && (
                            <ul className="space-y-2 mb-6">
                              {features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}

                          <Link
                            to={`/solutions/${id}`}
                            className="inline-flex items-center text-blue-600 font-semibold hover:underline"
                          >
                            Learn more
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {solutions.length > 3 && (
              <>
                <button 
                  onClick={() => scroll('left')} 
                  disabled={currentIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => scroll('right')} 
                  disabled={currentIndex >= solutions.length - 3}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover how our electrical solutions can enhance your operations and improve efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300">
              View Products
            </Link>
            <Link to="/contact" className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-300">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
