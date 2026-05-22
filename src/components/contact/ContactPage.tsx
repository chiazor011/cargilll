import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const { isLoggedIn } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoggedIn) {
        await api.createTicket(`Contact: ${firstName} ${lastName}`, message);
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel — Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-cargill-green-dark overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop"
          alt="Agriculture"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cargill-green-dark/90 via-cargill-green-dark/70 to-cargill-green/60" />
        <div className="relative z-10 flex flex-col justify-end p-16 max-w-lg">
          <h2 className="text-4xl font-serif font-bold text-white mb-4 leading-tight">
            Let's Build the Future of Food
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Our institutional team is ready to discuss custom mandates, co-investment opportunities, and sustainable agriculture strategies.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-cargill-beige pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white p-10 border border-gray-200 shadow-sm rounded-lg">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-cargill-green mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Message Sent</h3>
              <p className="text-gray-600">Thank you for reaching out. Our team will get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Contact Us</h2>
                <p className="text-gray-500 text-sm">Get in touch with our institutional investment team.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cargill-green-brand text-white font-bold py-3.5 rounded-md text-[15px] hover:bg-[#0c7036] transition-colors mt-4 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-cargill-green" />
                  <span className="text-xs text-gray-600">support@cargill-institutional.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-cargill-green" />
                  <span className="text-xs text-gray-600">+1 (800) 555-CARG</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-cargill-green" />
                  <span className="text-xs text-gray-600">Live Chat Available</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
