import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService, getImageUrl } from '../services/api';

const HERO_SLIDES = [
  {
    title: 'Where Professional KNX Meets Modern Io',
    subtitle: 'Expert-Driven Solutions for Installers and Integrators. We streamline the industrial strength of KNX with the ease of modern IoT, making your smart building projects faster, smarter, and more reliable.',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    gradient: 'from-blue-900 via-indigo-900 to-purple-900'
  },
  {
    title: 'Smart Building Automation',
    subtitle: 'Transform your spaces with intelligent control systems and seamless integration. Our solutions are designed to enhance energy efficiency, improve security, and provide unparalleled convenience for modern living and working environments.',
    details: 'With cutting-edge technology and user-friendly interfaces, our smart building automation systems are tailored to meet the unique needs of every client. Experience the future of intelligent spaces today.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    gradient: 'from-purple-900 via-blue-900 to-indigo-900'
  },
  {
    title: 'Industrial Excellence',
    subtitle: 'Powering industries with reliable, cutting-edge electrical solutions worldwide',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    gradient: 'from-indigo-900 via-purple-900 to-blue-900'
  }
];

const TESTIMONIALS = [
  { name: "John D.", role: "System Integrator", image: "https://randomuser.me/api/portraits/men/32.jpg", text: "Wireeo has completely transformed the way we manage our building systems. The integration was seamless and the support team is fantastic!" },
  { name: "Sarah L.", role: "Property Developer", image: "https://randomuser.me/api/portraits/women/44.jpg", text: "The Universal KNX Bridge by Wireeo is a game-changer for our projects. It has made our work so much easier and more efficient." },
  { name: "Emily R.", role: "Home Owner", image: "https://randomuser.me/api/portraits/women/68.jpg", text: "I love how easy it is to control everything in my home with Wireeo's HyperVisu. It's user-friendly and reliable." },
  { name: "Michael T.", role: "Electrical Engineer", image: "https://randomuser.me/api/portraits/men/45.jpg", text: "Outstanding products and exceptional technical support. Wireeo has become our go-to solution for all automation projects." },
  { name: "Lisa M.", role: "Facility Manager", image: "https://randomuser.me/api/portraits/women/55.jpg", text: "The energy savings we've achieved with Wireeo's solutions have exceeded our expectations. Highly recommended!" }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideInterval.current);
  }, []);

  useEffect(() => {
    apiService.categories
      .list({ status: 'active' })
      .then((res) => setCategories(res?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}></div>
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className={`absolute inset-0 bg-cover bg-center opacity-30 bg-[url('${slide.image}')]`}></div>
          </div>
        ))}

        <div className="relative container mx-auto px-4 py-32 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                  {HERO_SLIDES[currentSlide].title.split(' ').slice(0, -2).join(' ')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {HERO_SLIDES[currentSlide].title.split(' ').slice(-2).join(' ')}
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
                {HERO_SLIDES[currentSlide].details && (
                  <p className="text-lg md:text-xl text-gray-400 mb-8">
                    {HERO_SLIDES[currentSlide].details}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/products" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center">
                    Get Started Learning
                  </Link>
                  <Link to="/solutions" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 text-center">
                    View Solutions
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">25+</div>
                      <div className="text-sm text-gray-300">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">10K+</div>
                      <div className="text-sm text-gray-300">Projects Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-400">500+</div>
                      <div className="text-sm text-gray-300">Product Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">24/7</div>
                      <div className="text-sm text-gray-300">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                clearInterval(slideInterval.current);
                slideInterval.current = setInterval(() => {
                  setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
                }, 5000);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Complexity Simplified Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Complexity, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Simplified.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our intuitive platform brings the full capabilities of the KNX ecosystem to your fingertips, letting you design, configure, and deploy smart building solutions with ease. Whether you're an integrator, architect, or facility manager, Wireeo empowers you to create intelligent spaces that are as simple to manage as they are powerful.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-blue-100">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Who we are?</h3>
            <p className="text-gray-700 leading-relaxed">
              Wireeo is a family-friendly business dedicated to simplifying and enhancing the world of building automation. With a deep understanding of the KNX ecosystem and a passion for innovation, we've built a suite of tools and solutions that bridge the gap between professional-grade functionality and user-friendly design. Our mission is to make smart building technology accessible, reliable, and scalable for everyone—from individual homeowners to large-scale commercial projects.
            </p>
          </div>
        </div>
      </section>

      {/* Our Solutions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A suite of innovative products designed to transform your building automation experience
            </p>
          </div>
          {categoriesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading solutions…</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No solutions available yet. Add product categories from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((cat, index) => {
                const hasImage = cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/'));
                const imageUrl = hasImage ? (cat.image.startsWith('http') ? cat.image : getImageUrl(cat.image)) : null;

                // Icon colors cycling through blue, purple, indigo
                const iconColors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-indigo-500 to-indigo-600'
                ];
                const iconColor = iconColors[index % iconColors.length];

                return (
                  <Link
                    to="/products"
                    key={cat._id}
                    className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    {imageUrl ? (
                      <div className="h-56 relative overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className={`h-56 bg-gradient-to-br ${iconColor} flex items-center justify-center`}>
                        <svg className="w-20 h-20 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {cat.description || cat.subtitle || 'Discover our innovative solutions for modern building automation.'}
                      </p>
                      <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors inline-flex items-center">
                        Learn More
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Ready to Build Smarter Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
            alt="Modern workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-indigo-900/95"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Smarter?</span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Getting started with Wireeo is simple. Follow these three easy steps to bring your building automation project to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="group relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="inline-block px-4 py-1 bg-cyan-400/20 rounded-full mb-4">
                    <span className="text-cyan-300 font-semibold text-sm">STEP 1</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">System Designer</h3>
                  <p className="text-blue-100 leading-relaxed text-lg">
                    Use our intuitive system designer to plan and configure your KNX installation with ease. Drag, drop, and customize to match your exact requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="inline-block px-4 py-1 bg-purple-400/20 rounded-full mb-4">
                    <span className="text-purple-300 font-semibold text-sm">STEP 2</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Project Template</h3>
                  <p className="text-blue-100 leading-relaxed text-lg">
                    Choose from our library of pre-built templates or create your own. Save time and ensure consistency across all your projects.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="inline-block px-4 py-1 bg-indigo-400/20 rounded-full mb-4">
                    <span className="text-indigo-300 font-semibold text-sm">STEP 3</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Deploy & Support</h3>
                  <p className="text-blue-100 leading-relaxed text-lg">
                    Review your configuration, place your order, and receive everything you need to complete your installation quickly and efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/products" className="group relative bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl text-center overflow-hidden">
              <span className="relative z-10">Get Started Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/contact" className="group relative border-2 border-white text-white hover:bg-white hover:text-blue-900 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl text-center">
              <span className="relative z-10">Contact Sales</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-blue-600 mb-8 text-center">What Our Clients Say About Wireeo</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}>
                {TESTIMONIALS.map((testimonial, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-4">
                    <div className="p-8 bg-white shadow-lg rounded-xl">
                      <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mx-auto mb-4" />
                      <p className="text-gray-700 italic text-center mb-4">"{testimonial.text}"</p>
                      <h4 className="font-bold text-lg text-blue-600 text-center">- {testimonial.name}, {testimonial.role}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-6">Join the Wireeo Community</h2>
          <p className="mb-8 text-lg">Be part of a growing network of professionals and enthusiasts shaping the future of smart buildings with Wireeo.</p>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-200 transition duration-300">Sign Up Now</button>
        </div>
      </section>

      {/* Why Choose Wireeo Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">Wireeo?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of innovation, reliability, and support that sets us apart in building automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Innovative Solutions Card */}
            <Link to="/products" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 min-h-[500px]">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Innovation and technology"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/85 to-purple-800/90 group-hover:from-blue-700/95 group-hover:via-blue-800/90 group-hover:to-purple-900/95 transition-all duration-500"></div>
              </div>
              <div className="relative p-8 h-full flex flex-col justify-end">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
                    <span className="text-white font-semibold text-sm">CUTTING EDGE</span>
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">Innovative Solutions</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Wireeo offers cutting-edge technology to simplify and enhance your smart building experience. Our advanced automation systems leverage the latest IoT innovations to deliver unmatched performance and reliability.
                </p>
                <div className="mt-6 flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>Explore Technology</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Seamless Integration Card */}
            <Link to="/products" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 min-h-[500px]">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Integration and connectivity"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-700/85 to-pink-800/90 group-hover:from-purple-700/95 group-hover:via-purple-800/90 group-hover:to-pink-900/95 transition-all duration-500"></div>
              </div>
              <div className="relative p-8 h-full flex flex-col justify-end">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
                    <span className="text-white font-semibold text-sm">COMPATIBLE</span>
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">Seamless Integration</h3>
                <p className="text-purple-100 text-lg leading-relaxed">
                  Our products integrate effortlessly with existing systems, ensuring a smooth transition. Compatible with KNX, Modbus, BACnet, and other industry-standard protocols, Wireeo solutions work harmoniously with your current infrastructure.
                </p>
                <div className="mt-6 flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>View Integrations</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Reliable Support Card */}
            <Link to="/contact" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 min-h-[500px]">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Support and collaboration"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-indigo-700/85 to-blue-800/90 group-hover:from-indigo-700/95 group-hover:via-indigo-800/90 group-hover:to-blue-900/95 transition-all duration-500"></div>
              </div>
              <div className="relative p-8 h-full flex flex-col justify-end">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
                    <span className="text-white font-semibold text-sm">24/7 AVAILABLE</span>
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">Reliable Support</h3>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  Our dedicated support team is here to assist you every step of the way, ensuring your success. With 24/7 technical assistance, comprehensive documentation, and expert training programs, we're committed to your long-term satisfaction.
                </p>
                <div className="mt-6 flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>Contact Support</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Applications & Industries</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our electrical solutions power diverse industries and applications worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Residential</h3>
              <p className="text-gray-400">Smart home automation and electrical systems</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Commercial</h3>
              <p className="text-gray-400">Office buildings and retail spaces</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Industrial</h3>
              <p className="text-gray-400">Manufacturing and heavy industry</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Infrastructure</h3>
              <p className="text-gray-400">Power distribution and utilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Electrical Systems?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who trust WIREEO for their electrical automation needs. Get expert consultation and premium solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Consultation
            </Link>
            <Link to="/products" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
