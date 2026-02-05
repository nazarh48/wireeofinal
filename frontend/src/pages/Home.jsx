import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService, getImageUrl } from '../services/api';

const HERO_SLIDES = [
  {
    title: 'Professional Electrical Solutions',
    subtitle: 'Advanced electrical automation systems for residential, commercial, and industrial applications',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    gradient: 'from-blue-900 via-indigo-900 to-purple-900'
  },
  {
    title: 'Smart Building Automation',
    subtitle: 'Transform your spaces with intelligent control systems and seamless integration',
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
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/products" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center">
                    Explore Products
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Product Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive electrical solutions designed for every application - from residential homes to industrial facilities.
            </p>
          </div>
          {categoriesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading categories…</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No categories yet. Add categories from the admin dashboard to show them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((cat) => {
                const hasImage = cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/'));
                const imageUrl = hasImage ? (cat.image.startsWith('http') ? cat.image : getImageUrl(cat.image)) : null;
                const colorClass = cat.color || 'from-blue-500 to-blue-600';
                return (
                  <div key={cat._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className={`h-48 relative overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${colorClass}` : ''}`}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : null}
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute bottom-4 left-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${imageUrl ? 'bg-white/20' : 'bg-white/20'}`}>
                          {cat.icon ? <span className="text-2xl">{cat.icon}</span> : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{cat.name}</h3>
                      <p className="text-gray-600 mb-6">{cat.description || (cat.subtitle ? `${cat.subtitle}. ` : '') || 'Explore our range of solutions.'}</p>
                      <Link to="/products" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Explore Range →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-blue-600 mb-8">Why Choose Wireeo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 bg-gray-100 shadow-lg rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Innovative Solutions</h3>
              <p className="text-gray-700">Wireeo offers cutting-edge technology to simplify and enhance your smart building experience.</p>
            </div>
            <div className="p-8 bg-gray-100 shadow-lg rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Seamless Integration</h3>
              <p className="text-gray-700">Our products integrate effortlessly with existing systems, ensuring a smooth transition.</p>
            </div>
            <div className="p-8 bg-gray-100 shadow-lg rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Reliable Support</h3>
              <p className="text-gray-700">Our dedicated support team is here to assist you every step of the way, ensuring your success.</p>
            </div>
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
