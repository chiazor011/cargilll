import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Forgot password state
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const cleanName = name.trim();
      if (isRegister) {
        if (!agreedTerms) {
          setError('You must agree to the Terms of Service to register.');
          setLoading(false);
          return;
        }
        await register(cleanEmail, cleanPassword, cleanName);
        setSuccess('Account created! A welcome email and verification link have been sent.');
      } else {
        await login(cleanEmail, cleanPassword);
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSuccess('If an account exists, a password reset email has been sent.');
    } catch (e: any) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.resetPassword(resetToken, password.trim());
      setSuccess('Password reset successful! You can now log in.');
      setMode('login');
      setPassword('');
    } catch (e: any) {
      setError(e.message || 'Reset failed');
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
          {/* Back to login */}
          {mode !== 'login' && (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="flex items-center gap-1 text-sm text-cargill-green font-semibold mb-4 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to login
            </button>
          )}

          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              {mode === 'login' ? (isRegister ? 'Create Account' : 'Institutional Login') :
               mode === 'forgot' ? 'Reset Password' :
               'Set New Password'}
            </h2>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? (isRegister ? 'Register to start investing in global commodities.' : 'Enter your credentials to access your global portfolio.') :
               mode === 'forgot' ? 'Enter your email to receive a reset link.' :
               'Enter your new password below.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {mode === 'login' && (
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
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                      className="text-xs text-cargill-green hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
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

              {isRegister && (
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="h-4 w-4 text-cargill-green focus:ring-cargill-green border-gray-300 rounded mt-0.5"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                    I agree to the <a href="#" className="text-cargill-green font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-cargill-green font-semibold hover:underline">Privacy Policy</a>.
                  </label>
                </div>
              )}

              {!isRegister && (
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="h-4 w-4 text-cargill-green focus:ring-cargill-green border-gray-300 rounded" />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                    Remember this device
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cargill-green-brand text-white font-semibold py-3.5 rounded-lg text-sm hover:bg-[#0c7036] transition-colors mt-4 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Access Portfolio'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form className="space-y-6" onSubmit={handleForgot}>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cargill-green-brand text-white font-semibold py-3.5 rounded-lg text-sm hover:bg-[#0c7036] transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form className="space-y-6" onSubmit={handleReset}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reset Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                  placeholder="Paste token from email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cargill-green-brand text-white font-semibold py-3.5 rounded-lg text-sm hover:bg-[#0c7036] transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {mode === 'login' && (
            <div className="mt-8 text-center text-sm text-gray-600">
              {isRegister ? (
                <p>Already have an account? <button onClick={() => { setIsRegister(false); setError(''); }} className="text-cargill-green font-semibold hover:underline">Sign in</button></p>
              ) : (
                <p>Need an account? <button onClick={() => { setIsRegister(true); setError(''); }} className="text-cargill-green font-semibold hover:underline">Register</button></p>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-100 pt-6">
            <p>For account assistance, contact your relationship manager or <button onClick={() => window.location.hash = '#support'} className="text-cargill-green underline">support</button>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
