import React from 'react';
import { ArrowDown, ArrowUpRight, ArrowRight, Leaf, Droplets, Sprout, Users } from 'lucide-react';
import type { AvailableFund } from '../../types';

interface FundPageProps {
  onNavigate: (path: string) => void;
  onInvest: (fund: AvailableFund) => void;
  availableFunds: AvailableFund[];
}

export default function FundPage({ onNavigate, onInvest, availableFunds }: FundPageProps) {
  const harvestFund = availableFunds.find(f => f.id === 'fund-harvest') || availableFunds[0];

  return (
    <div className="flex flex-col bg-cargill-beige min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[650px] h-[75vh] bg-cargill-green-dark overflow-hidden flex items-end">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#052b14] via-[#052b14]/90 to-transparent z-10 w-full h-full"></div>
          <img
            src={harvestFund.image}
            alt="Sustainability"
            className="w-full h-full object-cover object-center opacity-60 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 pt-32">
           <div className="max-w-[700px]">
             <span className="border border-white/40 text-white/90 text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider mb-8 inline-block">
               Impact Fund Series
             </span>
             <h1 className="text-5xl font-serif font-bold text-white mb-6">{harvestFund.name}</h1>
             <p className="text-lg text-white/90 mb-10 leading-relaxed font-light">
               Investing in the transition to a more resilient, equitable, and decarbonized agricultural future. A core strategy for institutional portfolios seeking measurable real-world impact alongside long-term capital appreciation.
             </p>
             <div className="flex gap-4">
               <button
                 onClick={() => onInvest(harvestFund)}
                 className="bg-cargill-green-brand text-white px-8 py-3.5 font-bold text-[15px] rounded-md hover:bg-[#0c7036] transition-colors flex items-center shadow-md"
               >
                 Invest Now <ArrowRight className="w-5 h-5 ml-2" />
               </button>
               <button className="bg-transparent border border-white text-white px-8 py-3.5 font-bold text-[15px] rounded-md hover:bg-white/10 transition-colors flex items-center">
                 Download Prospectus <ArrowDownIcon className="w-5 h-5 ml-2" />
               </button>
             </div>
           </div>
        </div>
      </section>

      {/* Overview & Impact */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Fund Overview & Impact</h2>
            <p className="text-gray-600 max-w-2xl leading-relaxed text-lg">
              The Sustainable Harvest Fund allocates capital to agricultural enterprises demonstrating clear pathways to carbon reduction, biodiversity enhancement, and improved farmer livelihoods.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Big Impact Metric */}
             <div className="lg:col-span-2 bg-white p-8 border border-gray-200 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Decarbonization Impact</h4>
                  <div className="flex justify-between items-start">
                     <div>
                       <div className="flex items-baseline mb-4">
                         <span className="text-6xl font-bold text-cargill-green-brand mr-3">2.4M</span>
                         <span className="text-gray-500 font-medium">Metric Tons CO2e</span>
                       </div>
                       <p className="text-gray-600 leading-relaxed max-w-sm">
                         Cumulative greenhouse gas emissions reduced or sequestered across portfolio holdings since fund inception, independently verified by third-party auditors.
                       </p>
                     </div>
                     <ArrowDownIcon className="w-16 h-16 text-gray-200" />
                  </div>
                </div>
                <button className="text-cargill-green-dark font-bold text-sm mt-8 flex items-center hover:underline">
                  View Carbon Methodology <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
             </div>

             {/* Small Stats Stats */}
             <div className="flex flex-col gap-8">
               <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
                  <h4 className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    AUM <BankIcon className="w-5 h-5 text-gray-400" />
                  </h4>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{harvestFund.aum}</div>
                  <div className="text-cargill-green border border-cargill-green-light bg-[#f8fdf1] px-3 py-1.5 text-sm font-bold inline-flex items-center rounded-md">
                    +{harvestFund.ytdReturn}% YTD
                  </div>
               </div>
               <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
                  <h4 className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Target Yield <ChartIcon className="w-5 h-5 text-gray-400" />
                  </h4>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{harvestFund.targetYield}%</div>
                  <div className="text-gray-500 text-xs flex items-center">
                    <InfoIcon className="w-3 h-3 mr-1" /> Net of fees
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* All Available Funds */}
      <section className="py-20 bg-cargill-beige">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-end justify-between mb-12">
             <div>
               <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Available Funds</h2>
               <p className="text-gray-600 max-w-xl">Invest across our suite of institutional-grade agricultural funds.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {availableFunds.map((fund) => (
               <div key={fund.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                 <div className="h-48 overflow-hidden">
                   <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 </div>
                 <div className="p-6">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{fund.sector}</span>
                     <span className="text-[10px] font-bold text-cargill-green bg-cargill-green-light px-2 py-0.5 rounded">+{fund.ytdReturn}% YTD</span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">{fund.name}</h3>
                   <p className="text-sm text-gray-600 mb-4">{fund.description}</p>
                   <div className="flex items-center justify-between">
                     <div className="text-sm text-gray-500">
                       Min: <span className="font-bold text-gray-900">${fund.minInvestment.toLocaleString()}</span>
                     </div>
                     <button
                       onClick={() => onInvest(fund)}
                       className="bg-cargill-green-brand text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#0c7036] transition-colors flex items-center"
                     >
                       Invest <ArrowRight className="w-4 h-4 ml-1" />
                     </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>
    </div>
  );
}

function ArrowRightIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>;
}
function ArrowDownIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
}
function BankIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>;
}
function ChartIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>;
}
function InfoIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
}
