import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const cleanName = name.trim();
      if (isRegister) {
        await register(cleanEmail, cleanPassword, cleanName);
      } else {
        await login(cleanEmail, cleanPassword);
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel — Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-cargill-green-dark overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop"
          alt="Field"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cargill-green-dark/90 via-cargill-green-dark/70 to-cargill-green/60" />
        <div className="relative z-10 flex flex-col justify-end p-16 max-w-lg">
          <h2 className="text-4xl font-serif font-bold text-white mb-4 leading-tight">
            Cultivating Returns Since 1865
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Access your institutional portfolio, track commodity positions, and manage allocations across global agricultural markets.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-cargill-beige pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-10 border border-gray-200 shadow-sm rounded-lg">
          <div className="text-center mb-10">
             <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
               {isRegister ? 'Create Account' : 'Institutional Login'}
             </h2>
             <p className="text-gray-500 text-sm">
               {isRegister ? 'Register to start investing in global commodities.' : 'Enter your credentials to access your global portfolio.'}
             </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                placeholder="investor@institution.com"
                required
              />
            </div>
            <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-medium text-gray-700">Password</label>
                 {!isRegister && <a href="#" className="text-xs text-cargill-green hover:underline">Forgot password?</a>}
               </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="h-4 w-4 text-cargill-green focus:ring-cargill-green border-gray-300 rounded" />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cargill-green-brand text-white font-semibold py-3.5 rounded-lg text-sm hover:bg-[#0c7036] transition-colors mt-4 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Access Portfolio'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isRegister ? (
              <p>Already have an account? <button onClick={() => { setIsRegister(false); setError(''); }} className="text-cargill-green font-semibold hover:underline">Sign in</button></p>
            ) : (
              <p>Need an account? <button onClick={() => { setIsRegister(true); setError(''); }} className="text-cargill-green font-semibold hover:underline">Register</button></p>
            )}
          </div>

          <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-100 pt-6">
            <p>For account assistance, contact your relationship manager or <a href="#" className="text-cargill-green underline">support</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
