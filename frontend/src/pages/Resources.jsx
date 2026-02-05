import { useState, useEffect } from "react";
import { apiService, getImageUrl } from "../services/api";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await apiService.pdfMaterials.list({ status: "active" });
        if (res?.materials) {
          setResources(res.materials);
        }
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);
  // Removed hardcoded resources array

  const webinars = [
    {
      title: "Industrial Automation Fundamentals",
      date: "March 15, 2024",
      duration: "45 min",
      description: "Learn the basics of PLC programming, HMI design, and industrial communication protocols.",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Energy Management Systems",
      date: "March 22, 2024",
      duration: "50 min",
      description: "Advanced techniques for monitoring, analyzing, and optimizing energy consumption in facilities.",
      thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Safety Systems Integration",
      date: "March 29, 2024",
      duration: "40 min",
      description: "Best practices for integrating safety controllers, emergency stops, and protective systems.",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2092&q=80')]"
        ></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Resources</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Professional documentation, training materials, and technical support for electrical automation systems.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400 rounded-full opacity-20 animate-float animation-delay-1000"></div>
      </section>

      {/* Downloads Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Technical Documentation</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Download comprehensive guides, manuals, and technical specifications for professional installations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-500">Loading resources...</div>
            ) : resources.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">No resources available at the moment.</div>
            ) : (
              resources.map((resource, index) => (
                <div
                  key={resource._id || index}
                  className={`bg-white rounded-2xl shadow-premium hover-lift p-6 animate-scale-in animation-delay-[${index * 0.1}s]`}
                >
                  {resource.photo && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={getImageUrl(resource.photo)}
                        alt={`${resource.name} thumbnail`}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📄</div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {resource.type || "Guide"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{resource.shortDescription}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>PDF</span>
                    <span>{resource.size}</span>
                  </div>

                  <a
                    href={resource.fileUrl ? getImageUrl(resource.fileUrl) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                </div>
              )))}
          </div>
        </div>
      </section>

      {/* Webinars Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Professional Training</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Expert-led sessions covering advanced electrical automation topics and industry best practices.
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
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
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

                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
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
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
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