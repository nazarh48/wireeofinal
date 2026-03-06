import { useState } from 'react';
import { apiService } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      await apiService.contact.submit(formData);
      setSubmitStatus({ type: 'success', message: 'Your message has been sent successfully. We will get back to you soon.' });
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: "🏢",
      title: "Headquarters",
      details: ["WIREEO Technologies", "Industrial District, Building 5", "Tech City, TC 12345"]
    },
    {
      icon: "📞",
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543 (Technical)"]
    },
    {
      icon: "📧",
      title: "Email",
      details: ["info@wireeo.com", "technical@wireeo.com"]
    },
    {
      icon: "🕰️",
      title: "Business Hours",
      details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM", "24/7 Emergency Support"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }} aria-hidden="true"></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Us</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get in touch with our electrical automation experts for technical consultation and project support.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Message</span></h2>
              <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mb-6 rounded-full" />
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Your company or organization"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us about your electrical automation project requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:scale-105'}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {submitStatus.message && (
                  <div className={`mt-4 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Project?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our electrical automation experts are here to help you design and implement the perfect solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
              Download Catalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;