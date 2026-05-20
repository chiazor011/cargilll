import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Bitcoin, Copy, Check, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

interface CryptoOption {
  id: string;
  name: string;
  address: string;
  network: string;
  color: string;
}

interface CryptoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string, details: string) => void;
  currentBalance: number;
}

export default function CryptoDepositModal({ isOpen, onClose, onDeposit, currentBalance }: CryptoDepositModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [step, setStep] = useState<'form' | 'address' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.cryptoAddresses()
      .then(data => {
        if (data.addresses && data.addresses.length > 0) {
          setCryptoOptions(data.addresses);
          setSelectedCrypto(data.addresses[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const isValid = !isNaN(parsedAmount) && parsedAmount >= 1000;
  const crypto = cryptoOptions.find(c => c.id === selectedCrypto);

  const handleSubmit = () => {
    if (!isValid || !crypto) return;
    if (step === 'form') {
      setStep('address');
    } else if (step === 'address') {
      onDeposit(parsedAmount, crypto.id, crypto.address);
      setStep('success');
    }
  };

  const handleClose = () => {
    setAmount('');
    setSelectedCrypto('btc');
    setStep('form');
    setCopied(false);
    onClose();
  };

  const copyAddress = () => {
    if (!crypto) return;
    navigator.clipboard.writeText(crypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Crypto Deposit</h2>
              <p className="text-xs text-gray-400">Current balance: ${currentBalance.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-cargill-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading wallet addresses...</p>
          </div>
        ) : (
          <>
            {step === 'form' && (
              <div className="p-6 space-y-6">
                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Network Verification Required</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Only send crypto on the specified network. Sending on the wrong network will result in permanent loss.
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="10,000"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum deposit: $1,000</p>
                </div>

                {/* Crypto Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Select Cryptocurrency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {cryptoOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCrypto(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          selectedCrypto === c.id
                            ? 'border-cargill-green-brand bg-cargill-green-light/30'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: c.color + '20' }}>
                          <Bitcoin className="w-4 h-4" style={{ color: c.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{c.name}</p>
                          <p className="text-[10px] text-gray-400">{c.network}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'address' && crypto && (
              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Send exactly <span className="font-bold text-gray-900">${parsedAmount.toLocaleString()}</span> equivalent in {crypto.name}</p>
                  <p className="text-xs text-gray-400">Deposit will be credited after 3-6 network confirmations</p>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-3">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <Bitcoin className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 text-center">
                    Deposit Address ({crypto.network})
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-xs font-mono text-gray-700 truncate">
                      {crypto.address}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-3 bg-cargill-green-light rounded-lg hover:bg-cargill-green-light/50 transition-colors shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-cargill-green" /> : <Copy className="w-4 h-4 text-cargill-green" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs text-gray-600">
                  <p>• Minimum confirmations required: <span className="font-bold">3</span></p>
                  <p>• Expected confirmation time: <span className="font-bold">10-60 minutes</span></p>
                  <p>• Transaction status will appear as <span className="font-bold text-amber-600">Pending</span> until confirmed</p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cargill-green-light flex items-center justify-center mx-auto">
                  <ArrowDownLeft className="w-8 h-8 text-cargill-green-brand" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Deposit Pending</h3>
                <p className="text-gray-600 text-sm">
                  Your deposit of ${parsedAmount.toLocaleString()} is being processed. Funds will be available after network confirmation and admin approval.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-cargill-green-brand text-white font-bold py-3 rounded-lg hover:bg-[#0c7036] transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {(step === 'form' || step === 'address') && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                {step === 'address' && (
                  <button
                    onClick={() => setStep('form')}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || cryptoOptions.length === 0}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                    isValid && cryptoOptions.length > 0
                      ? 'bg-cargill-green-brand text-white hover:bg-[#0c7036]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step === 'form' ? 'Continue' : 'I Have Sent the Funds'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
