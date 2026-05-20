import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Landmark, Banknote, Copy, Check, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

interface BankDetail {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swift: string;
  address: string;
  timeframe: string;
}

interface BankDetailsResponse {
  wire?: BankDetail;
  ach?: BankDetail;
}

interface BankDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string, details: string) => void;
  currentBalance: number;
}

export default function BankDepositModal({ isOpen, onClose, onDeposit, currentBalance }: BankDepositModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'wire' | 'ach'>('wire');
  const [step, setStep] = useState<'form' | 'instructions' | 'success'>('form');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetailsResponse>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.bankDetails()
      .then(data => {
        setBankDetails(data);
        if (data.wire) setMethod('wire');
        else if (data.ach) setMethod('ach');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const isValid = !isNaN(parsedAmount) && parsedAmount >= 1000;
  const details = bankDetails[method];
  const referenceCode = `CGI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleSubmit = () => {
    if (!isValid) return;
    if (step === 'form') {
      setStep('instructions');
    } else if (step === 'instructions') {
      onDeposit(parsedAmount, method, referenceCode);
      setStep('success');
    }
  };

  const handleClose = () => {
    setAmount('');
    setMethod('wire');
    setStep('form');
    setCopiedField(null);
    onClose();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
    >
      {copiedField === field ? <Check className="w-3.5 h-3.5 text-cargill-green" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );

  const DetailRow = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-900 font-mono">{value}</span>
        <CopyButton text={value} field={field} />
      </div>
    </div>
  );

  const methodEntries = Object.entries(bankDetails).filter(([, d]) => d) as [string, BankDetail][];
  const methodLabels: Record<string, { name: string; icon: typeof Landmark; timeframe: string }> = {
    wire: { name: 'Wire Transfer', icon: Landmark, timeframe: bankDetails.wire?.timeframe || '1-2 business days' },
    ach: { name: 'ACH Transfer', icon: Banknote, timeframe: bankDetails.ach?.timeframe || '3-5 business days' },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bank Deposit</h2>
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
            <p className="text-sm text-gray-500">Loading bank details...</p>
          </div>
        ) : (
          <>
            {step === 'form' && (
              <div className="p-6 space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Deposit Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="50,000"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum deposit: $1,000</p>
                </div>

                {/* Method */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Transfer Method
                  </label>
                  <div className="space-y-2">
                    {methodEntries.map(([key]) => {
                      const meta = methodLabels[key];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setMethod(key as 'wire' | 'ach')}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                            method === key
                              ? 'border-cargill-green-brand bg-cargill-green-light/30'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${method === key ? 'text-cargill-green-brand' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{meta.name}</p>
                            <p className="text-xs text-gray-400">{meta.timeframe}</p>
                          </div>
                          {method === key && (
                            <div className="w-4 h-4 rounded-full bg-cargill-green-brand flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 'instructions' && details && (
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Reference Code Required</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Include the reference code below in your transfer memo to ensure proper crediting. Deposits without a reference code may be delayed.
                    </p>
                  </div>
                </div>

                {/* Reference Code */}
                <div className="bg-cargill-green-light/30 border border-cargill-green/20 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Reference Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold font-mono text-cargill-green-dark tracking-wider">{referenceCode}</code>
                    <CopyButton text={referenceCode} field="reference" />
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Bank Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <DetailRow label="Bank Name" value={details.bankName} field="bankName" />
                    <DetailRow label="Account Name" value={details.accountName} field="accountName" />
                    <DetailRow label="Account Number" value={details.accountNumber} field="accountNumber" />
                    <DetailRow label="Routing Number" value={details.routingNumber} field="routing" />
                    <DetailRow label="SWIFT/BIC" value={details.swift} field="swift" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs text-gray-600">
                  <p>• Processing time: <span className="font-bold">{details.timeframe}</span></p>
                  <p>• Status will show as <span className="font-bold text-amber-600">Pending</span> until admin approval</p>
                  <p>• You will receive an email confirmation once credited</p>
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
                  Your deposit of ${parsedAmount.toLocaleString()} has been submitted. Please complete the bank transfer with reference code <span className="font-mono font-bold text-cargill-green">{referenceCode}</span>.
                </p>
                <p className="text-xs text-gray-400">
                  Funds will be available after admin verification.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-cargill-green-brand text-white font-bold py-3 rounded-lg hover:bg-[#0c7036] transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {(step === 'form' || step === 'instructions') && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                {step === 'instructions' && (
                  <button
                    onClick={() => setStep('form')}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || !details}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                    isValid && details
                      ? 'bg-cargill-green-brand text-white hover:bg-[#0c7036]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step === 'form' ? 'Continue' : 'I Have Initiated the Transfer'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
