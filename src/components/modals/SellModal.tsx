import React, { useState } from 'react';
import { X, ArrowUpRight, AlertTriangle } from 'lucide-react';
import type { Holding } from '../../types';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSell: (holding: Holding, amount: number) => void;
  holding?: Holding | null;
}

export default function SellModal({ isOpen, onClose, onSell, holding }: SellModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  if (!isOpen || !holding) return null;

  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const maxSell = holding.currentValue;
  const isValid = !isNaN(parsedAmount) && parsedAmount >= 1000 && parsedAmount <= maxSell;

  const handleSubmit = () => {
    if (!isValid) return;
    if (step === 'form') {
      setStep('confirm');
    } else if (step === 'confirm') {
      onSell(holding, parsedAmount);
      setStep('success');
    }
  };

  const handleClose = () => {
    setAmount('');
    setStep('form');
    onClose();
  };

  const percentOptions = [25, 50, 75, 100];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sell Position</h2>
              <p className="text-xs text-gray-400">{holding.fundName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Current Value</span>
                <span className="font-bold text-gray-900">${holding.currentValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">YTD Return</span>
                <span className={`font-bold ${holding.ytdReturn >= 0 ? 'text-cargill-green' : 'text-red-500'}`}>
                  {holding.ytdReturn >= 0 ? '+' : ''}{holding.ytdReturn}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Amount to Sell
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder={maxSell.toLocaleString()}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {percentOptions.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount(Math.round((maxSell * pct) / 100).toString())}
                    className="flex-1 py-1.5 text-xs font-bold rounded-md border border-gray-200 hover:border-cargill-green-brand hover:text-cargill-green-brand transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum sell: $1,000 | Available: ${maxSell.toLocaleString()}</p>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Selling may trigger capital gains tax. Consult your tax advisor.
              </p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fund</span>
                <span className="font-bold text-gray-900">{holding.fundName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sell Amount</span>
                <span className="font-bold text-gray-900">${parsedAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Cash Added to Balance</span>
                <span className="font-bold text-cargill-green">${parsedAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cargill-green-light flex items-center justify-center mx-auto">
              <ArrowUpRight className="w-8 h-8 text-cargill-green-brand" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sale Confirmed</h3>
            <p className="text-gray-600 text-sm">
              ${parsedAmount.toLocaleString()} has been liquidated and added to your cash balance.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-cargill-green-brand text-white font-bold py-3 rounded-lg hover:bg-[#0c7036] transition-colors"
            >
              Done
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
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                isValid
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 'form' ? 'Continue' : 'Confirm Sale'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
