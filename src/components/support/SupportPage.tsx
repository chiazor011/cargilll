import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { MessageSquare, Mail, Phone, ChevronDown, ChevronUp, Send, Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: string;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

const FAQS = [
  {
    question: 'What is the minimum deposit?',
    answer: 'The minimum deposit is $1,000. Our Starter Agriculture Fund also begins at $1,000, making it accessible for new institutional investors.',
  },
  {
    question: 'How long do withdrawals take?',
    answer: 'Withdrawals require manual admin approval for security. Typically, approved withdrawals are processed within 24-48 hours after approval.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept cryptocurrency (Bitcoin, Ethereum, USDT ERC20/TRC20) and traditional bank transfers (Wire and ACH).',
  },
  {
    question: 'Do I need to verify my email?',
    answer: 'Yes, email verification is required for full platform access. You will receive a verification link upon registration.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'On the login page, click "Forgot password?" and enter your email. You will receive a secure reset link valid for 1 hour.',
  },
  {
    question: 'What are the investment tiers?',
    answer: 'Starter Fund: $1,000. Biofuels & Cocoa: $10,000. Global Wheat: $25,000. Sustainable Harvest: $50,000 (max $100,000).',
  },
];

export default function SupportPage() {
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'history'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isLoggedIn && activeTab === 'history') {
      loadTickets();
    }
  }, [isLoggedIn, activeTab]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.myTickets();
      setTickets(data.tickets || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await api.createTicket(ticketSubject, ticketMessage);
      setSuccess('Support ticket submitted successfully. Our team will get back to you shortly.');
      setTicketSubject('');
      setTicketMessage('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: React.ReactNode }> = {
      open: { color: 'bg-amber-50 text-amber-700', icon: <Clock className="w-3 h-3 mr-1" /> },
      in_progress: { color: 'bg-blue-50 text-blue-700', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
      resolved: { color: 'bg-green-50 text-green-700', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      closed: { color: 'bg-gray-100 text-gray-600', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    };
    const s = map[status] || map.open;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
        {s.icon} {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-cargill-beige">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Help Center & Support</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Find answers to common questions or reach out to our institutional support team.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {[
            { id: 'faq', label: 'FAQ', icon: MessageSquare },
            { id: 'ticket', label: 'Submit Ticket', icon: Ticket },
            ...(isLoggedIn ? [{ id: 'history', label: 'My Tickets', icon: Clock }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setError(''); setSuccess(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cargill-green-brand text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {FAQS.map((faq, i) => (
                <div key={i} className="p-6">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-bold text-gray-900 text-sm">{faq.question}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {openFaq === i && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Ticket Tab */}
        {activeTab === 'ticket' && (
          <div className="max-w-xl mx-auto">
            {!isLoggedIn && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
                Please sign in to submit a support ticket.
              </div>
            )}
            {isLoggedIn && (
              <form onSubmit={submitTicket} className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
                {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">{success}</div>}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                    placeholder="e.g., Deposit not reflecting"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Message</label>
                  <textarea
                    rows={5}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cargill-green-brand text-white font-bold py-3 rounded-lg hover:bg-[#0c7036] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'history' && isLoggedIn && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">My Support Tickets</h2>
            </div>
            {loading && <p className="p-8 text-center text-sm text-gray-500">Loading...</p>}
            {!loading && tickets.length === 0 && (
              <div className="p-12 text-center">
                <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-bold">No tickets yet</p>
                <p className="text-sm text-gray-400">Submit a ticket and it will appear here.</p>
              </div>
            )}
            <div className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <div key={t.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{t.subject}</h3>
                    {statusBadge(t.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{t.message}</p>
                  {t.adminReply && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Team Reply</p>
                      <p className="text-sm text-gray-700">{t.adminReply}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Submitted {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Methods */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
            <Mail className="w-8 h-8 text-cargill-green mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">Email Support</h3>
            <p className="text-sm text-gray-500">support@cargill-institutional.com</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
            <Phone className="w-8 h-8 text-cargill-green mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">Phone</h3>
            <p className="text-sm text-gray-500">+1 (800) 555-CARG</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
            <MessageSquare className="w-8 h-8 text-cargill-green mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">Live Chat</h3>
            <p className="text-sm text-gray-500">Use the floating chatbot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
