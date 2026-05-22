import React, { useState } from 'react';
import { X, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import type { AvailableFund, Holding } from '../../types';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvest: (fund: AvailableFund, amount: number) => void;
  currentBalance: number;
  fund?: AvailableFund | null;
  existingHolding?: Holding | null;
}

export default function InvestModal({ isOpen, onClose, onInvest, currentBalance, fund, existingHolding }: InvestModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  if (!isOpen || !fund) return null;

  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const minInvestment = existingHolding ? 1000 : fund.minInvestment;
  const maxInvestment = fund.maxInvestment;
  const isValid = !isNaN(parsedAmount) && parsedAmount >= minInvestment && parsedAmount <= currentBalance && (!maxInvestment || parsedAmount <= maxInvestment);

  const handleSubmit = () => {
    if (!isValid) return;
    if (step === 'form') {
      setStep('confirm');
    } else if (step === 'confirm') {
      onInvest(fund, parsedAmount);
      setStep('success');
    }
  };

  const handleClose = () => {
    setAmount('');
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="relative h-32 overflow-hidden">
          <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/20">
              {fund.sector}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{fund.name}</h2>
          </div>
          <button onClick={handleClose} className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-5">
            {/* Fund stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">YTD</p>
                <p className="text-lg font-bold text-cargill-green">+{fund.ytdReturn}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Yield</p>
                <p className="text-lg font-bold text-gray-900">{fund.targetYield}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AUM</p>
                <p className="text-lg font-bold text-gray-900">{fund.aum}</p>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                {existingHolding ? 'Additional Investment' : 'Investment Amount'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder={minInvestment.toLocaleString()}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">
                  Min: ${minInvestment.toLocaleString()}
                  {maxInvestment && ` | Max: $${maxInvestment.toLocaleString()}`}
                </p>
                <button
                  onClick={() => setAmount(maxInvestment && maxInvestment < currentBalance ? maxInvestment.toString() : currentBalance.toString())}
                  className="text-xs text-cargill-green font-bold hover:underline"
                >
                  Max
                </button>
              </div>
            </div>

            {existingHolding && (
              <div className="bg-cargill-green-light/30 rounded-lg p-3 text-sm">
                <span className="text-gray-600">Current holding: </span>
                <span className="font-bold text-gray-900">${existingHolding.currentValue.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fund</span>
                <span className="font-bold text-gray-900">{fund.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">${parsedAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Cash Remaining</span>
                <span className="font-bold text-cargill-green">${(currentBalance - parsedAmount).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Investments are subject to market risk. Returns are not guaranteed.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cargill-green-light flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-cargill-green-brand" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Investment Confirmed</h3>
            <p className="text-gray-600 text-sm">
              ${parsedAmount.toLocaleString()} invested in {fund.name}.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-cargill-green-brand text-white font-bold py-3 rounded-lg hover:bg-[#0c7036] transition-colors"
            >
              View Portfolio
            </button>
          </div>
        )}

        {(step === 'form' || step === 'confirm') && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            {step === 'confirm' && (
              <button
                onClick={() => setStep('form')}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-cargill-green-brand text-white hover:bg-[#0c7036]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 'form' ? 'Review Investment' : 'Confirm Investment'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
