import React from 'react';
import { Search, Bell, User, LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onLogout: () => void;
}

export default function Layout({ children, activePath, onNavigate, isLoggedIn, isAdmin = false, onLogout }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = isLoggedIn
    ? [
        { name: 'Markets', path: 'markets' },
        { name: 'Portfolio', path: 'portfolio' },
        { name: 'Sustainability', path: 'fund' },
        ...(isAdmin ? [{ name: 'Admin', path: 'admin' }] : []),
      ]
    : [
        { name: 'Markets', path: 'markets' },
        { name: 'Investments', path: 'landing' },
        { name: 'Sustainability', path: 'fund' },
      ];

  const allPaths = [...navLinks, { name: 'Support', path: 'support' }, { name: 'Contact', path: 'contact' }];

  const isActive = (link: { name: string; path: string }) => {
    if (activePath === link.path) return true;
    if (activePath === 'landing' && link.name === 'Investments') return true;
    if (activePath === 'portfolio' && link.name === 'Portfolio') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-cargill-beige flex flex-col font-sans">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 px-6 md:px-0">
        <nav className="bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 rounded-lg w-full lg:w-[65%] max-w-6xl transition-all h-16 md:h-20 flex items-center px-6 sm:px-10">
          <div className="flex justify-between items-center w-full">
            {/* Logo area */}
            <div
              className="flex items-center cursor-pointer flex-shrink-0"
              onClick={() => onNavigate(isLoggedIn ? 'portfolio' : 'landing')}
            >
              <img
                src="/cargill+logo+2.png"
                alt="Cargill"
                className="h-8 md:h-11 mt-0.5"
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex flex-1 justify-center items-center space-x-10 h-full">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`h-full flex items-center text-[13px] font-bold uppercase tracking-widest transition-all ${
                    isActive(link)
                      ? 'text-cargill-green-brand scale-105'
                      : 'text-gray-500 hover:text-cargill-gray-dark'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Right Icons */}
            <div className="hidden lg:flex items-center space-x-5 text-cargill-green">
              <button
                onClick={() => onNavigate('support')}
                className="text-[13px] font-bold uppercase tracking-widest text-gray-500 hover:text-cargill-gray-dark transition-colors"
              >
                Support
              </button>
              <div className="w-px h-6 bg-gray-100"></div>
              <button
                onClick={() => onNavigate('contact')}
                className="text-[13px] font-bold uppercase tracking-widest text-gray-500 hover:text-cargill-gray-dark transition-colors"
              >
                Contact
              </button>
              <div className="w-px h-6 bg-gray-100"></div>
              {isLoggedIn && (
                <>
                  <button className="hover:opacity-75 transition-opacity">
                    <Search className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="hover:opacity-75 transition-opacity relative">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-cargill-green-brand rounded-md"></span>
                  </button>
                  <div className="w-px h-6 bg-gray-200"></div>
                </>
              )}
              {isLoggedIn ? (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-gray-500 hover:text-cargill-green-brand transition-colors"
                  title="Log out"
                >
                  <div className="bg-gray-100 rounded-md p-2.5 border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors">
                    <LogOut className="w-4 h-4 text-cargill-gray-dark" />
                  </div>
                  <span className="text-[13px] font-bold uppercase tracking-widest hidden xl:inline">Log Out</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 text-gray-500 hover:text-cargill-green-brand transition-colors"
                >
                  <div className="bg-gray-100 rounded-md p-2.5 border border-gray-200 shadow-sm">
                    <User className="w-4 h-4 text-cargill-gray-dark" />
                  </div>
                  <span className="text-[13px] font-bold uppercase tracking-widest hidden xl:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-cargill-green p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white/98 backdrop-blur-xl border border-gray-100 px-6 py-8 space-y-6 absolute top-[110%] left-0 right-0 shadow-2xl rounded-lg mx-4">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { onNavigate(link.path); setIsMenuOpen(false); }}
                  className={`flex items-center w-full text-xl font-bold border-b border-gray-50 pb-4 ${
                    isActive(link) ? 'text-cargill-green-brand' : 'text-gray-800'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => { onNavigate('support'); setIsMenuOpen(false); }}
                className="flex items-center w-full text-xl font-bold text-gray-800 border-b border-gray-50 pb-4"
              >
                Support
              </button>
              <button
                onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }}
                className="flex items-center w-full text-xl font-bold text-gray-800 border-b border-gray-50 pb-4"
              >
                Contact
              </button>
              {isLoggedIn ? (
                <button
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="flex items-center w-full text-xl font-bold text-red-600 pt-2"
                >
                  <div className="bg-red-50 rounded-md p-3 mr-4">
                    <LogOut className="w-6 h-6" />
                  </div>
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => { onNavigate('login'); setIsMenuOpen(false); }}
                  className="flex items-center w-full text-xl font-bold text-cargill-green-brand pt-2"
                >
                  <div className="bg-green-50 rounded-md p-3 mr-4">
                    <User className="w-6 h-6" />
                  </div>
                  Sign In / Register
                </button>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#e9ece3] text-cargill-gray-dark pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="md:w-1/3">
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center">
                  <span className="italic text-cargill-gray-dark tracking-tight font-serif text-3xl">Cargill</span>
                </h1>
              </div>
              <p className="text-sm font-medium mb-8 max-w-sm">
                Providing institutional investors with robust, data-driven strategies in global agricultural markets.
              </p>
              <p className="text-xs text-gray-500">
                © 2024 Cargill, Incorporated. All Rights Reserved. Institutional Investment Services.
              </p>
            </div>

            <div className="md:w-2/3 grid grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="flex flex-col space-y-4 text-sm">
                 <h4 className="font-bold mb-2 uppercase text-xs tracking-wider">Legal</h4>
                 <a href="#" className="hover:underline">Regulatory Disclosures</a>
                 <a href="#" className="hover:underline">Privacy Policy</a>
                 <a href="#" className="hover:underline">Terms of Service</a>
               </div>
               <div className="flex flex-col space-y-4 text-sm">
                 <h4 className="font-bold mb-2 uppercase text-xs tracking-wider">Connect</h4>
                 <button onClick={() => onNavigate('support')} className="text-left hover:underline">Help Center</button>
                 <button onClick={() => onNavigate('contact')} className="text-left hover:underline">Contact Support</button>
               </div>
               <div className="flex flex-col space-y-4 text-sm">
                 <h4 className="font-bold mb-2 uppercase text-xs tracking-wider">Account</h4>
                 {isLoggedIn ? (
                   <button onClick={onLogout} className="text-left hover:underline text-red-600">Log Out</button>
                 ) : (
                   <button onClick={() => onNavigate('login')} className="text-left hover:underline text-cargill-green">Sign In</button>
                 )}
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
