import { useState } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const productCategories = [
    {
      id: 'automation',
      title: 'Building Automation',
      subtitle: 'Smart Building Solutions',
      description: 'Complete HVAC, lighting, and security control systems for modern buildings',
      icon: '🏢',
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      products: ['BMS Controllers', 'Smart Thermostats', 'Lighting Control', 'Access Systems'],
      features: ['Energy Optimization', 'Remote Monitoring', 'Predictive Maintenance', 'Integration Ready']
    },
    {
      id: 'industrial',
      title: 'Industrial Control',
      subtitle: 'Process Automation',
      description: 'Advanced PLCs, motor drives, and process automation for manufacturing excellence',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      products: ['PLC Systems', 'VFDs', 'HMI Panels', 'Industrial Sensors'],
      features: ['High Performance', 'Robust Design', 'Scalable Architecture', 'Real-time Control']
    },
    {
      id: 'power',
      title: 'Power Distribution',
      subtitle: 'Electrical Infrastructure',
      description: 'Reliable switchgear, transformers, and distribution panels for critical applications',
      icon: '⚡',
      color: 'from-indigo-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      products: ['Distribution Panels', 'Circuit Breakers', 'Power Meters', 'Surge Protection'],
      features: ['High Reliability', 'Safety Certified', 'Load Management', 'Smart Monitoring']
    },
    {
      id: 'safety',
      title: 'Safety & Protection',
      subtitle: 'Critical Safety Systems',
      description: 'Comprehensive fire alarm, emergency lighting, and safety control solutions',
      icon: '🛡️',
      color: 'from-red-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      products: ['Fire Alarm Systems', 'Emergency Lighting', 'Safety Relays', 'Gas Detection'],
      features: ['Code Compliant', '24/7 Monitoring', 'Fail-Safe Design', 'Quick Response']
    },
    {
      id: 'energy',
      title: 'Energy Management',
      subtitle: 'Smart Energy Solutions',
      description: 'Advanced metering, monitoring, and optimization for maximum efficiency',
      icon: '📊',
      color: 'from-green-500 to-green-600',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      products: ['Smart Meters', 'Energy Analyzers', 'Load Management', 'Solar Inverters'],
      features: ['Real-time Analytics', 'Cost Optimization', 'Demand Response', 'Sustainability']
    },
    {
      id: 'communication',
      title: 'Communication Systems',
      subtitle: 'Network Infrastructure',
      description: 'Robust networking, protocols, and connectivity for seamless integration',
      icon: '📡',
      color: 'from-cyan-500 to-cyan-600',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      products: ['Ethernet Switches', 'Protocol Converters', 'Wireless Modules', 'Fiber Systems'],
      features: ['High Bandwidth', 'Secure Communication', 'Protocol Support', 'Redundancy']
    }
  ];

  const featuredProducts = [
    {
      name: 'WIREEO PLC-5000 Series',
      category: 'Industrial Control',
      price: 'From $2,499',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['High-speed processing', 'Modular design', 'Industrial grade'],
      badge: 'Best Seller'
    },
    {
      name: 'Smart Energy Meter Pro',
      category: 'Energy Management',
      price: 'From $899',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Real-time monitoring', 'IoT connectivity', 'Advanced analytics'],
      badge: 'New'
    },
    {
      name: 'Safety Controller SIL3',
      category: 'Safety Systems',
      price: 'From $1,299',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['SIL3 certified', 'Redundant design', 'Diagnostic functions'],
      badge: 'Certified'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Electrical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automation</span> Products
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional-grade electrical automation solutions for industrial, commercial, and infrastructure applications worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link
                to="/products/ranges"
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Go to Tabbed Ranges
              </Link>
              <button 
                onClick={() => setActiveTab('catalog')}
                className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Browse Catalog
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold rounded-lg transition-all duration-300"
              >
                Custom Solutions
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full animate-pulse animation-delay-1000"></div>
      </section>

      {/* Product Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive range of electrical automation solutions designed for professional applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCategories.map((category, index) => (
              <div
                key={category.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                      {category.icon}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-sm font-medium opacity-90">{category.subtitle}</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{category.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {category.products.slice(0, 2).map((product, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {product}
                        </span>
                      ))}
                      {category.products.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          +{category.products.length - 2} more
                        </span>
                      )}
                    </div>
                    
                    {activeCategory === category.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                        <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {category.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and innovative electrical automation solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.badge === 'Best Seller' ? 'bg-orange-100 text-orange-800' :
                      product.badge === 'New' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {product.badge}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-medium mb-1">{product.category}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-4">{product.price}</div>
                  
                  <div className="space-y-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Need Custom Solutions?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Our engineering team can design and manufacture custom electrical automation solutions tailored to your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link to="/products/ranges" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
              Go to Tabbed Ranges
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Request Quote
            </Link>
            <Link to="/resources" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold rounded-lg transition-all duration-300">
              Download Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;