import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService, getImageUrl } from '../services/api';

// Hero carousel: PDF content + images from assets/Home (picture_1_1, picture_1_2, picture_1_3)
// Use underscore filenames in public/assets/Home/ so they load reliably
const HERO_IMAGES = {
  slide1: '/assets/Home/picture_1_1.png',
  slide2: '/assets/Home/picture_1_2.png',
  slide3: '/assets/Home/picture_1_3.png',
};

const HERO_SLIDES = [
  {
    title: 'Where Premium KNX Devices Power Modern Hospitality',
    subtitle: 'Engineered and manufactured by Wireeo, our KNX equipment combines architectural design with structured engineering logic. Built for integrators. Optimized for hotels. Designed for long-term performance.',
    primaryCta: { to: '/products', label: 'Explore Products' },
    secondaryCta: { to: '/solutions', label: 'Discover Hospitality' },
    image: HERO_IMAGES.slide1,
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
  },
  {
    title: 'ActivLine — Universal KNX Control for Premium Environments',
    subtitle: 'Engineered around a structured KNX architecture, ActivLine devices are suitable for both high-end residential projects and premium hospitality deployments, ensuring consistent behavior, integration flexibility, and long-term reliability.',
    primaryCta: { to: '/products', label: 'Explore ActivLine' },
    secondaryCta: { to: '/products/ranges', label: 'Configure a Device' },
    image: HERO_IMAGES.slide2,
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
  },
  {
    title: 'ActivTouch — Refined Interaction Across Premium Spaces',
    subtitle: 'ActivTouch panels deliver intuitive KNX control through a clean, architectural interface. Designed and manufactured by Wireeo, the range is suitable for luxury residences and high-end hospitality projects where design integrity and technical reliability are equally essential. Behind the minimalist surface stands a disciplined engineering platform ensuring predictable performance and seamless KNX integration.',
    primaryCta: { to: '/products', label: 'Discover ActivTouch' },
    secondaryCta: { to: '/products/ranges', label: 'Configure a Device' },
    image: HERO_IMAGES.slide3,
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
  },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

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
      {/* Hero Carousel — text left, image right; background image at low opacity + same image on right */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background: current slide image at low opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${HERO_SLIDES[currentSlide].image})`,
            opacity: 0.22,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        <div className="relative container mx-auto px-4 py-16 md:py-24 z-10 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left: text */}
              <div className="order-2 lg:order-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                  {HERO_SLIDES[currentSlide].title}
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={HERO_SLIDES[currentSlide].primaryCta.to}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 text-center shadow-lg"
                  >
                    {HERO_SLIDES[currentSlide].primaryCta.label}
                  </Link>
                  <Link
                    to={HERO_SLIDES[currentSlide].secondaryCta.to}
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 text-center"
                  >
                    {HERO_SLIDES[currentSlide].secondaryCta.label}
                  </Link>
                </div>
              </div>
              {/* Right: slide image */}
              <div className="order-1 lg:order-2 relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-800/50 aspect-[4/3] max-h-[420px] flex items-center justify-center">
                  <img
                    key={currentSlide}
                    src={HERO_SLIDES[currentSlide].image}
                    alt={HERO_SLIDES[currentSlide].title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setCurrentSlide(index);
                if (slideInterval.current) clearInterval(slideInterval.current);
                slideInterval.current = setInterval(() => {
                  setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
                }, 5000);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Complexity, Simplified — WHITE SECTION */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Complexity, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">Simplified.</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-cyan-600 mx-auto mb-8 rounded-full" />
            </div>

            <div className="space-y-6 mb-16">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-200">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center">
                  Wireeo designs and manufactures premium KNX devices that transform
                  system complexity into <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">structured, intuitive control</span>.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="group bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl p-8 border border-teal-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    Through <span className="font-bold text-teal-700">disciplined engineering</span>, modular product architecture, and refined
                    interaction design, we make advanced KNX functionality feel natural.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-8 border border-cyan-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    Without compromising <span className="font-bold text-cyan-700">performance or reliability</span>, deployed in luxury residences
                    and high-end hospitality projects worldwide.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-14 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-full blur-3xl" aria-hidden="true" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full" />
                  <h3 className="text-3xl md:text-4xl font-bold mx-6">Who We Are</h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full" />
                </div>

                <div className="space-y-6 text-center max-w-4xl mx-auto">
                  <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                    Wireeo is a <span className="text-teal-400 font-bold">European manufacturer</span> of premium KNX devices, created for
                    projects where reliability, consistency, and design integrity are essential.
                  </p>
                  
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Every product is developed around a <span className="text-white font-bold">structured engineering logic</span> — ensuring
                    predictable integration, long-term serviceability, and architectural coherence
                    across environments.
                  </p>
                  
                  <div className="pt-8 mt-8 border-t border-gray-700">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                      We do not build generic automation tools.
                    </p>
                    <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent mt-2">
                      We engineer devices meant to endure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories — BLACK SECTION */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Categories</span></h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A suite of innovative products designed to transform your building automation experience
            </p>
          </div>
          {categoriesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading solutions…</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No solutions available yet. Add product categories from the admin dashboard.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {(showAllCategories ? categories : categories.slice(0, 4)).map((cat, index) => {
                const hasImage = cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/'));
                const imageUrl = hasImage ? (cat.image.startsWith('http') ? cat.image : getImageUrl(cat.image)) : null;
                const iconColors = [
                  { from: 'from-teal-500', to: 'to-teal-600', bg: 'bg-teal-500/10', border: 'border-teal-500/30', hover: 'hover:border-teal-400' },
                  { from: 'from-cyan-500', to: 'to-cyan-600', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', hover: 'hover:border-cyan-400' },
                ];
                const colors = iconColors[index % iconColors.length];

                return (
                  <Link
                    to="/products"
                    key={cat._id}
                    className={`group block bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border ${colors.border} ${colors.hover}`}
                  >
                    {imageUrl ? (
                      <div className="h-56 relative overflow-hidden bg-gray-900">
                        <img
                          src={imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className={`h-56 bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20" />
                        <svg className="w-20 h-20 text-white opacity-90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-start mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        {cat.description || cat.subtitle || 'Discover our innovative solutions for modern building automation.'}
                      </p>
                      <span className="text-teal-400 font-bold group-hover:text-teal-300 transition-colors inline-flex items-center">
                        Learn More
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {categories.length > 4 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="group bg-gray-700/50 hover:bg-gray-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 border-2 border-gray-600 hover:border-teal-500 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {showAllCategories ? (
                    <>
                      Show Less
                      <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Show All {categories.length} Categories
                      <svg className="w-6 h-6 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* Personalization, Structured — WHITE SECTION */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Personalization, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Structured.</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-cyan-600 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Wireeo products are designed to adapt to refined interiors through controlled
              customization options — without compromising engineering integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-14">
            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="inline-block px-4 py-1.5 bg-teal-600 text-white rounded-full text-sm font-bold mb-5 shadow">STEP 1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Select the Device</h3>
              <p className="text-gray-700 leading-relaxed">
                Choose the appropriate ActivLine, ActivTouch, or ActivEntry model for your
                project. Each product is engineered as part of a coherent KNX ecosystem.
              </p>
            </div>
            <div className="group bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 border-2 border-cyan-200 shadow-lg hover:shadow-2xl hover:border-cyan-300 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="inline-block px-4 py-1.5 bg-cyan-600 text-white rounded-full text-sm font-bold mb-5 shadow">STEP 2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalize with Precision</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Use the Graphic Product Configurator to define:
              </p>
              <ul className="text-gray-700 space-y-2 list-none">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2 font-bold">•</span>
                  <span>Laser engraving for ActivLine</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2 font-bold">•</span>
                  <span>Custom backgrounds for ActivTouch and ActivEntry</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2 font-bold">•</span>
                  <span>Icon selection and layout personalization</span>
                </li>
              </ul>
            </div>
            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="inline-block px-4 py-1.5 bg-teal-600 text-white rounded-full text-sm font-bold mb-5 shadow">STEP 3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Validate & Specify</h3>
              <p className="text-gray-700 leading-relaxed">
                Generate a configuration summary and integrate the selected device into your
                project documentation. What you configure is exactly what gets manufactured.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products/ranges" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-10 py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 shadow-lg hover:shadow-xl">
              Configure a Product
            </Link>
            <Link to="/products" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-4 rounded-xl font-bold text-lg text-center transition-all duration-300">
              Explore Product Ranges
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Wireeo? — BLACK SECTION */}
      <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Wireeo?</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Because premium environments require more than devices.
              They require engineering discipline, architectural consistency, and long-term reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700 hover:border-teal-500/50 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-teal-400 tracking-wider mb-4">ENGINEERED, NOT ASSEMBLED</div>
              <h3 className="text-2xl font-bold text-white mb-4">Structured Product Architecture</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Wireeo devices are developed around proprietary hardware platforms and
                disciplined KNX communication models. Each range follows a coherent engineering logic, ensuring predictable system
                behavior and project continuity.
              </p>
              <Link to="/products" className="text-teal-400 font-bold hover:text-teal-300 transition-colors inline-flex items-center group">
                Explore Our Products
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700 hover:border-cyan-500/50 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-xs font-bold text-cyan-400 tracking-wider mb-4">DESIGNED TO BELONG</div>
              <h3 className="text-2xl font-bold text-white mb-4">Architectural Integration</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Our products are created with refined proportions, premium materials, and
                controlled personalization options — allowing seamless integration into luxury
                residences and high-end hospitality interiors.
              </p>
              <Link to="/products" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors inline-flex items-center group">
                Discover ActivLine & ActivTouch
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700 hover:border-teal-500/50 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-teal-400 tracking-wider mb-4">BUILT FOR PROFESSIONAL WORKFLOWS</div>
              <h3 className="text-2xl font-bold text-white mb-4">Reliable Integration & Documentation</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Wireeo devices are KNX-based and designed for professional installations,
                supported by structured documentation and consistent object mapping.
                Engineered for integrators. Trusted in premium projects.
              </p>
              <Link to="/resources" className="text-teal-400 font-bold hover:text-teal-300 transition-colors inline-flex items-center group">
                View Technical Resources
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products/ranges" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-10 py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 shadow-lg hover:shadow-xl">
              Configure a Product
            </Link>
            <Link to="/products" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-4 rounded-xl font-bold text-lg text-center transition-all duration-300">
              Explore Product Ranges
            </Link>
          </div>
        </div>
      </section>

      {/* Applications & Industries — WHITE SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Applications & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Industries</span></h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-cyan-600 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Wireeo devices are designed for premium environments where architectural
              clarity, engineering discipline, and energy efficiency must coexist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="group bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl p-8 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-teal-700 mb-3 text-center">Luxury Residential</h3>
              <p className="text-sm text-gray-600 mb-3 text-center font-semibold">Refined KNX control for private residences</p>
              <p className="text-gray-700 leading-relaxed">
                Architectural devices designed to integrate seamlessly into high-end villas and
                apartments, delivering structured KNX performance, intuitive control, and
                optimized energy management.
              </p>
            </div>
            <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-8 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-cyan-700 mb-3 text-center">Hospitality</h3>
              <p className="text-sm text-gray-600 mb-3 text-center font-semibold">Engineered consistency for hotels</p>
              <p className="text-gray-700 leading-relaxed">
                A structured KNX device portfolio optimized for guest rooms and hotel
                environments, ensuring operational reliability, visual coherence, and energy-
                efficient room control strategies.
              </p>
            </div>
            <div className="group bg-gradient-to-br from-teal-50 to-cyan-100/50 rounded-2xl p-8 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-teal-700 mb-3 text-center">Premium Commercial</h3>
              <p className="text-sm text-gray-600 mb-3 text-center font-semibold">Professional-grade control for refined spaces</p>
              <p className="text-gray-700 leading-relaxed">
                Suitable for executive offices and high-end developments requiring
                architectural consistency, dependable KNX integration, and efficient system
                management.
              </p>
            </div>
            <div className="group bg-gradient-to-br from-cyan-50 to-teal-100/50 rounded-2xl p-8 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-cyan-700 mb-3 text-center">Energy Efficiency</h3>
              <p className="text-sm text-gray-600 mb-3 text-center font-semibold">Intelligent Control. Measurable Impact.</p>
              <p className="text-gray-700 leading-relaxed">
                Wireeo KNX devices enable structured management of lighting, climate, and
                access logic — reducing unnecessary consumption while maintaining user
                comfort. Through disciplined system behavior and predictable interaction models,
                buildings remain both intelligent and energy-aware.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — BLACK SECTION */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            Ready to Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Next Project?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-8 rounded-full" />
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Choose KNX devices designed to integrate naturally into refined spaces —
            built with engineering discipline and long-term reliability.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/products"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-12 py-5 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-teal-500/50 hover:scale-105"
            >
              View Product Ranges
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-12 py-5 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105"
            >
              Talk to Wireeo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
