import React, { useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Minus, PiggyBank } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import type { AvailableFund } from '../../types';

const miniChartData = [
  { value: 12 }, { value: 15 }, { value: 13 }, { value: 18 }, { value: 17 }, { value: 20 }, { value: 24 }
];
const miniChartDataDown = [
  { value: 24 }, { value: 20 }, { value: 22 }, { value: 18 }, { value: 15 }, { value: 16 }, { value: 12 }
];

const sectors = [
  { name: 'Grains & Oilseeds', active: true },
  { name: 'Metals', active: false },
  { name: 'Ocean Transportation', active: false },
];

interface MarketsPageProps {
  onNavigate: (path: string) => void;
  onInvest: (fund: AvailableFund) => void;
  availableFunds: AvailableFund[];
}

export default function MarketsPage({ onNavigate, onInvest, availableFunds }: MarketsPageProps) {
  const [activeSector, setActiveSector] = useState('Grains & Oilseeds');

  return (
    <div className="min-h-screen pt-32 pb-16 bg-cargill-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-10 pt-2">
          <h1 className="text-4xl font-bold font-serif text-gray-900 mb-3">Global Market Overview</h1>
          <p className="text-gray-600 text-lg">Real-time insights across major agricultural and industrial commodity sectors.</p>
        </div>

        {/* Sector Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sectors.map((sector) => (
            <button
              key={sector.name}
              onClick={() => setActiveSector(sector.name)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeSector === sector.name
                  ? 'bg-cargill-green-brand text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {sector.name}
            </button>
          ))}
        </div>

        {/* Reports Quick Links */}
        <div className="flex items-center gap-4 mb-10 text-sm">
          <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">Reports</span>
          <a href="#" className="text-cargill-green font-semibold hover:underline flex items-center">
            Market Analysis <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </a>
          <span className="text-gray-200">|</span>
          <a href="#" className="text-cargill-green font-semibold hover:underline flex items-center">
            Trade Documents <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        {/* Header Banner */}
        <div className="relative h-[320px] rounded-xl overflow-hidden mb-10 bg-[#041a1a]">
          <img
            src="https://images.unsplash.com/photo-1577705436329-373809224855?q=80&w=2670&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
            alt="Global Market"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003B2A] to-[#003B2A]/40 mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 p-10 z-10">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider mb-4 border border-white/20">
              Live Markets
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">{activeSector}</h2>
            <p className="text-lg text-white/90 max-w-xl">
              Spot prices, futures curves, and volume data updated in real-time.
            </p>
          </div>
        </div>

        {/* Commodity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white px-6 pb-6 pt-5 border border-gray-200 rounded-xl shadow-sm hover:border-cargill-green-brand transition-all group cursor-pointer overflow-hidden relative hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">Corn Futures</h3>
              <span className="bg-[#e5eed9] text-cargill-green font-semibold text-xs px-2.5 py-1 rounded-md flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +2.4%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$452.25</p>
            <p className="text-sm text-gray-500 mb-4">USD / bu. | CME Group</p>
            <div className="h-16 w-full -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line type="monotone" dataKey="value" stroke="#0f8b44" strokeWidth={2} dot={false} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white px-6 pb-6 pt-5 border border-gray-200 rounded-xl shadow-sm hover:border-gray-400 transition-all group cursor-pointer overflow-hidden relative hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">Soybeans</h3>
              <span className="bg-gray-100 text-gray-600 font-semibold text-xs px-2.5 py-1 rounded-md flex items-center">
                <Minus className="w-3 h-3 mr-1" /> 0.0%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$1,185.50</p>
            <p className="text-sm text-gray-500 mb-4">USD / bu. | CBOT</p>
            <div className="h-16 w-full -mx-2 -mb-2 opacity-50 grayscale">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line type="monotone" dataKey="value" stroke="#6b7280" strokeWidth={2} dot={false} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white px-6 pb-6 pt-5 border border-gray-200 rounded-xl shadow-sm hover:border-red-400 transition-all group cursor-pointer overflow-hidden relative hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">Wheat (SRW)</h3>
              <span className="bg-red-50 text-red-600 font-semibold text-xs px-2.5 py-1 rounded-md flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" /> -1.2%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">$598.75</p>
            <p className="text-sm text-gray-500 mb-4">USD / bu. | CME Group</p>
            <div className="h-16 w-full -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartDataDown}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={false} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Investable Funds Section */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-serif text-gray-900">Investable Funds</h2>
              <p className="text-gray-600 text-sm">Directly invest in our institutional agricultural funds.</p>
            </div>
            <button
              onClick={() => onNavigate('fund')}
              className="text-cargill-green font-semibold text-sm hover:underline flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableFunds.map((fund) => (
              <div key={fund.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 overflow-hidden">
                  <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{fund.sector}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{fund.name}</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-cargill-green bg-cargill-green-light px-2 py-0.5 rounded">+{fund.ytdReturn}% YTD</span>
                    <span className="text-xs text-gray-400">Min ${fund.minInvestment.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => onInvest(fund)}
                    className="w-full bg-cargill-green-brand text-white py-2 rounded-lg text-sm font-bold hover:bg-[#0c7036] transition-colors flex items-center justify-center gap-2"
                  >
                    <PiggyBank className="w-4 h-4" /> Invest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Contracts Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Active Contracts Overview</h2>
            <button className="text-cargill-green font-semibold text-sm hover:underline flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="bg-[#052b14] text-white flex px-6 py-4 font-semibold text-sm">
            <div className="w-[30%]">Commodity</div>
            <div className="w-[20%]">Contract Month</div>
            <div className="w-[20%] text-right">Last Price</div>
            <div className="w-[15%] text-right">Change</div>
            <div className="w-[15%] text-right">Volume</div>
          </div>

          <div className="divide-y divide-gray-100 font-mono text-sm">
            {[
              { name: 'Corn', month: 'Dec 2024', price: '452.25', change: '+10.50', volume: '145,230', isPos: true },
              { name: 'Soybeans', month: 'Nov 2024', price: '1185.50', change: '0.00', volume: '98,412', isPos: false, isNeu: true },
              { name: 'Wheat', month: 'Sep 2024', price: '598.75', change: '-7.25', volume: '65,890', isPos: false },
              { name: 'Soybean Meal', month: 'Dec 2024', price: '345.10', change: '+2.30', volume: '42,150', isPos: true }
            ].map((row, i) => (
              <div key={i} className="flex px-6 py-5 items-center hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-[30%] font-sans font-medium text-gray-900 text-base">{row.name}</div>
                <div className="w-[20%] text-gray-600 font-sans">{row.month}</div>
                <div className="w-[20%] text-right text-gray-800">{row.price}</div>
                <div className={`w-[15%] text-right font-medium ${row.isNeu ? 'text-gray-500' : (row.isPos ? 'text-green-600' : 'text-red-600')}`}>
                  {row.change}
                </div>
                <div className="w-[15%] text-right text-gray-600">{row.volume}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
