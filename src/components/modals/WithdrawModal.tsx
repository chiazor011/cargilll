import React, { useState } from 'react';
import { X, ArrowUpRight, Landmark, Banknote, Bitcoin, AlertTriangle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, method: string, destination: string) => void;
  currentBalance: number;
}

export default function WithdrawModal({ isOpen, onClose, onWithdraw, currentBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('wire');
  const [destination, setDestination] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const isValid = !isNaN(parsedAmount) && parsedAmount >= 1000 && parsedAmount <= currentBalance;
  const destValid = destination.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid || !destValid) return;
    if (step === 'form') {
      setStep('confirm');
    } else if (step === 'confirm') {
      onWithdraw(parsedAmount, method, destination.trim());
      setStep('success');
    }
  };

  const handleClose = () => {
    setAmount('');
    setMethod('wire');
    setDestination('');
    setStep('form');
    onClose();
  };

  const methods = [
    { id: 'wire', name: 'Wire Transfer', icon: Landmark, desc: '1-2 business days', placeholder: 'Bank account number & routing' },
    { id: 'ach', name: 'ACH Transfer', icon: Banknote, desc: '3-5 business days', placeholder: 'Bank account number & routing' },
    { id: 'crypto', name: 'Crypto Withdrawal', icon: Bitcoin, desc: '10-60 minutes', placeholder: 'Wallet address (BTC / USDT / ETH)' },
  ];

  const selectedMethod = methods.find(m => m.id === method);

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
              <h2 className="text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-xs text-gray-400">Available: ${currentBalance.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Withdraw Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder="25,000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum: $1,000 | Available: ${currentBalance.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                Transfer Method
              </label>
              <div className="space-y-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                      method === m.id
                        ? 'border-cargill-green-brand bg-cargill-green-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <m.icon className={`w-5 h-5 ${method === m.id ? 'text-cargill-green-brand' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                    {method === m.id && (
                      <div className="w-4 h-4 rounded-full bg-cargill-green-brand flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={selectedMethod?.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm font-bold"
              />
              <p className="text-xs text-gray-400 mt-1">
                {method === 'crypto'
                  ? 'Double-check the address. Crypto transactions cannot be reversed.'
                  : 'Enter your linked bank account details.'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Admin Approval Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  All withdrawals require manual admin approval for security. Funds will remain in your account until approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">${parsedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900">{selectedMethod?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Destination</span>
                <span className="font-bold text-gray-900 font-mono text-xs truncate max-w-[150px]">{destination}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Remaining Balance</span>
                <span className="font-bold text-cargill-green">${currentBalance.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-700">
                Your balance will not change until an admin approves this withdrawal. You may cancel pending withdrawals from your portfolio.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cargill-green-light flex items-center justify-center mx-auto">
              <ArrowUpRight className="w-8 h-8 text-cargill-green-brand" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Withdrawal Submitted</h3>
            <p className="text-gray-600 text-sm">
              ${parsedAmount.toLocaleString()} withdrawal is pending admin approval. Funds remain in your account until approved.
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
              disabled={!isValid || !destValid}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                isValid && destValid
                  ? 'bg-cargill-green-brand text-white hover:bg-[#0c7036]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 'form' ? 'Continue' : 'Confirm Withdrawal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
