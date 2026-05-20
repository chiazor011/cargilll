import React from 'react';
import { ArrowRight, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const mockChartData = [
  { value: 400 },
  { value: 430 },
  { value: 410 },
  { value: 470 },
  { value: 460 },
  { value: 520 },
  { value: 550 },
];

export default function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[850px] h-[90vh] overflow-hidden flex items-center bg-cargill-green-dark">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-cargill-green-dark via-cargill-green-dark/60 to-transparent z-10 w-full h-full"></div>
          <img 
            src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2672&auto=format&fit=crop" 
            alt="Agriculture Background" 
            className="w-full h-full object-cover object-center scale-110"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Organic Wave Overlays */}
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none h-48 md:h-80">
          {/* Layer 3 (Back - Light Green) - broad sweeping swell */}
          <svg className="absolute bottom-0 w-full h-[130%] opacity-20" preserveAspectRatio="none" viewBox="0 0 1440 320">
             <path fill="#8DC63F" d="M0,80 C240,180 480,20 720,100 C960,180 1200,40 1440,120 L1440,320 L0,320 Z"></path>
          </svg>
          {/* Layer 2 (Middle - Cargill Green) - deeper curve */}
          <svg className="absolute bottom-0 w-full h-[95%] opacity-40" preserveAspectRatio="none" viewBox="0 0 1440 320">
             <path fill="#0f8b44" d="M0,160 C320,60 640,240 960,140 C1120,80 1280,200 1440,180 L1440,320 L0,320 Z"></path>
          </svg>
          {/* Layer 1 (Front - Transition to White) - most dramatic crest */}
          <svg className="absolute bottom-[-1px] w-full h-[70%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
             <path fill="#ffffff" d="M0,220 C360,120 720,280 1080,180 C1260,130 1350,170 1440,220 L1440,320 L0,320 Z"></path>
          </svg>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-24 md:pb-0 md:pt-36">
          <div className="max-w-[700px]">
            <div className="bg-cargill-green-light text-cargill-green-dark font-bold px-3 py-1.5 rounded-md inline-block text-xs mb-6 uppercase tracking-widest shadow-sm">
              Institutional Asset Management
            </div>
            <h1 className="text-5xl md:text-[64px] font-bold text-white leading-[1.05] mb-6 tracking-tight">
              Invest in the Future of Global Agriculture
            </h1>
            <p className="text-lg text-white/90 leading-relaxed mb-10 font-normal max-w-[600px]">
              Leverage over a century of agricultural commodity expertise. We provide institutional investors with unparalleled access, insight, and stability in global food and agriculture markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate('login')}
                className="bg-cargill-green-brand text-white px-8 py-3.5 font-bold text-[15px] hover:bg-[#0c7036] transition-colors flex items-center justify-center rounded-md shadow-md"
              >
                Open an Account <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button 
                onClick={() => onNavigate('markets')}
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 font-bold text-[15px] hover:bg-white/20 transition-colors flex items-center justify-center rounded-md"
              >
                Explore Market Data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="md:pl-8 first:pl-0 pt-6 md:pt-0 border-l-2 border-transparent hover:border-cargill-green-brand transition-colors pl-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Assets Under Management</p>
              <p className="text-[44px] font-bold text-gray-900">$42.5B</p>
            </div>
            <div className="md:pl-8 pt-6 md:pt-0 border-l-2 border-transparent hover:border-cargill-green-brand transition-colors pl-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Global Markets</p>
              <p className="text-[44px] font-bold text-gray-900">125+</p>
            </div>
            <div className="md:pl-8 pt-6 md:pt-0 border-l-2 border-transparent hover:border-cargill-green-brand transition-colors pl-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Years of Expertise</p>
              <p className="text-[44px] font-bold text-gray-900">159</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farm to Market Value Chain */}
      <section className="bg-white py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold text-cargill-green-brand uppercase tracking-widest mb-3">Farm to Fork Infrastructure</h2>
              <h3 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                Owning the physical assets that move the world's food.
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed font-light mb-8">
                We invest across the entire agricultural supply chain. From origination and processing to logistics and distribution, your capital supports the crucial infrastructure that ensures food security and stable returns.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Grain Elevators & Inland Terminals',
                  'Deep-water Port Facilities',
                  'Processing & Crush Plants',
                  'Regenerative Agriculture Tech'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-800 font-medium">
                    <div className="w-2 h-2 bg-cargill-green-brand rounded-md mr-4"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onNavigate('login')}
                className="text-white bg-cargill-green px-8 py-3.5 rounded-md font-bold hover:bg-cargill-green-dark transition-colors inline-block"
              >
                Partner with us today
              </button>
            </div>
            <div className="relative h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2643&auto=format&fit=crop" 
                alt="Grain Terminal" 
                className="w-full h-full object-cover rounded-lg shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-lg border border-gray-100 rounded-lg">
                <p className="text-sm font-bold text-gray-900 mb-1">Global Logistics Capacity</p>
                <p className="text-3xl font-bold text-cargill-green">50M+ Tons</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Investment Pillars */}
      <section className="bg-cargill-beige py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Strategic Investment Pillars</h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              Diversify your portfolio with tangible assets backed by global demand and rigorous risk management protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Pillar Card */}
            <div className="bg-white p-10 shadow-sm border border-gray-100 rounded-lg flex flex-col justify-between">
              <div>
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-md uppercase tracking-wider mb-6 inline-block">Core Strategy</span>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 max-w-sm">Global Reach & Supply Chain Resiliency</h3>
                  <Globe className="w-16 h-16 text-gray-200" strokeWidth={1} />
                </div>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  Invest in the infrastructure that feeds the world. Our unparalleled supply chain visibility allows for proactive risk management and opportunistic asset allocation across diverse geographies.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('fund')}
                className="text-cargill-green-brand font-semibold text-sm flex items-center mt-12 hover:underline"
              >
                Explore Infrastructure Funds <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Two stacked cards */}
            <div className="flex flex-col gap-8">
              {/* Data Table Card */}
              <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-6 flex justify-between items-center">
                  Commodity Index <TrendingUp className="w-5 h-5 text-cargill-green-brand" />
                </h4>
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Global Ag Index</span>
                    <span className="font-mono text-gray-900 font-bold text-lg">1,245.50 <span className="text-green-500 text-sm ml-2">↗ +2.4%</span></span>
                  </div>
                </div>
                <div className="h-32 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData}>
                      <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0f8b44" 
                        strokeWidth={3} 
                        dot={false}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <button 
                  onClick={() => onNavigate('markets')}
                  className="w-full mt-6 bg-transparent border border-gray-200 text-gray-600 font-bold py-3 text-sm hover:bg-gray-50 transition-colors rounded-md"
                >
                  View Full Market Data
                </button>
              </div>

              {/* Sustainability Card */}
              <div className="bg-cargill-green-brand text-white p-8 rounded-lg shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
                <div className="z-10 relative">
                  <div className="mb-4 text-green-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3">Sustainable Growth</h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-6">
                    Integrating ESG principles into agricultural investments to ensure long-term yield and environmental stewardship.
                  </p>
                  <button 
                    onClick={() => onNavigate('fund')}
                    className="text-white font-semibold flex items-center text-sm hover:underline"
                  >
                    Read Impact Report <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
