import React from 'react';

export default function ContactPage() {
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
            Let’s Build the Future of Food
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Our institutional team is ready to discuss custom mandates, co-investment opportunities, and sustainable agriculture strategies.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-cargill-beige pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white p-10 border border-gray-200 shadow-sm rounded-lg">
          <div className="text-center mb-10">
             <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Contact Us</h2>
             <p className="text-gray-500 text-sm">Get in touch with our institutional investment team.</p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full bg-cargill-green-brand text-white font-bold py-3.5 rounded-md text-[15px] hover:bg-[#0c7036] transition-colors mt-4 shadow-sm"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
