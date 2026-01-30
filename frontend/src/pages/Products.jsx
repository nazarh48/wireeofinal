import { useState } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">Products</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Browse ready-to-use products or customize your smart home setup.
          </p>
        </div>

        {/* Product Menu Options */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-premium p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Select Product Type</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Standard Products */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab('standard')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard Products</h3>
                  <p className="text-gray-600 mb-4">Browse ready-to-use smart home devices with full specifications</p>
                  <span className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
                    Browse Products →
                  </span>
                </div>
              </div>

              {/* Configurable Products */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:border-green-300 transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab('configurable')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Custom Setup</h3>
                  <p className="text-gray-600 mb-4">Configure your smart home system and save multiple setups</p>
                  <span className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors">
                    Configure Products →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on selection */}
        {activeTab === 'standard' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Link
                to="/products/browse"
                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Browse All Standard Products
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'configurable' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <Link
                to="/products/ranges"
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Configuring Products
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;