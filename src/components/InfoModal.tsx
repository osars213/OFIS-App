import React, { useState } from 'react';
import { 
  X, 
  Info, 
  HelpCircle, 
  Headphones, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Handshake, 
  Star, 
  Share2, 
  Check, 
  Copy, 
  Send,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { OFISWordmark } from './OFISWordmark';

export type InfoModalTab = 
  | 'about' 
  | 'faq' 
  | 'help' 
  | 'support' 
  | 'report' 
  | 'privacy' 
  | 'terms' 
  | 'partner' 
  | 'rate' 
  | 'share';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoModalTab;
  onBecomeHost?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
  onBecomeHost
}) => {
  const [activeTab, setActiveTab] = useState<InfoModalTab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Support & report form states
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Keep active tab in sync when initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setSupportSubmitted(false);
      setRatingSubmitted(false);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportMessage('');
      setSupportName('');
      setSupportEmail('');
    }, 500);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSubmitted(true);
  };

  const faqs = [
    {
      q: "How does OFIS instant workspace pass work?",
      a: "Browse verified spaces across Lagos, Abuja, Port Harcourt and Ibadan. Select your preferred desk, private office, or meeting room, choose the hours or days needed, and unlock access instantly with Paystack or your OFIS wallet."
    },
    {
      q: "Are the electricity and high-speed internet guaranteed?",
      a: "Yes! Every verified space on OFIS is audited for 24/7 power redundancy (diesel generator, solar inverters) and verified high-speed fiber or Starlink WiFi connections before listing."
    },
    {
      q: "Can I extend my pass if my meeting or workday runs late?",
      a: "Absolutely. Tap on your active pass in 'My Bookings' and select '+30 mins', '+1 hour', or extended daily add-ons for instant continuation without changing desks."
    },
    {
      q: "How do refunds and cancellations work?",
      a: "Flexible bookings cancelled more than 2 hours before check-in receive an instant 100% refund directly to your OFIS wallet balance."
    },
    {
      q: "How can space owners and hubs list on OFIS?",
      a: "Click 'Become a Host' or 'Partner With OFIS'. Complete the simple onboarding form with your location, amenities, and hourly rates. Our local operations team inspects and approves hubs within 24 hours."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between bg-[#FFF9F4] dark:bg-[#07383D] shrink-0">
          <div className="flex items-center space-x-3">
            <OFISWordmark size="sm" />
            <span className="text-[#FFA987]">|</span>
            <span className="text-xs font-bold text-[#12383B] dark:text-[#B8D1D0] uppercase tracking-wider">
              {activeTab === 'about' && 'About OFIS'}
              {activeTab === 'faq' && 'Frequently Asked Questions'}
              {activeTab === 'help' && 'Help Centre'}
              {activeTab === 'support' && 'Contact Support'}
              {activeTab === 'report' && 'Report a Problem'}
              {activeTab === 'privacy' && 'Privacy Policy'}
              {activeTab === 'terms' && 'Terms of Service'}
              {activeTab === 'partner' && 'Partner With OFIS'}
              {activeTab === 'rate' && 'Rate OFIS'}
              {activeTab === 'share' && 'Share OFIS'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Header */}
        <div className="px-6 py-2.5 bg-[#F3F6F5] dark:bg-[#0B4A50] border-b border-[#E2ECEB] dark:border-[#166D74] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'about', label: 'About', icon: Info },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'help', label: 'Help Centre', icon: Headphones },
            { id: 'support', label: 'Support', icon: Mail },
            { id: 'partner', label: 'Partner', icon: Handshake },
            { id: 'report', label: 'Report', icon: AlertTriangle },
            { id: 'rate', label: 'Rate App', icon: Star },
            { id: 'share', label: 'Share', icon: Share2 },
            { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
            { id: 'terms', label: 'Terms', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as InfoModalTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white dark:bg-[#07383D] text-[#006B70] dark:text-[#28D2CB] border border-[#E2ECEB] dark:border-[#166D74] shadow-xs' 
                    : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#E2ECEB] dark:hover:bg-[#105A60]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#12383B] dark:text-[#B8D1D0] leading-relaxed">
          
          {/* 1. ABOUT OFIS */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-3">
                <h3 className="text-base font-bold text-[#12383B] dark:text-white">
                  Powering Nigeria's Next Generation of Creators &amp; Builders
                </h3>
                <p>
                  OFIS is Nigeria’s on-demand workspace network. We connect remote professionals, startups, creators, and distributed teams with verified, reliable workspaces equipped with guaranteed 24/7 power, ultra-fast internet, and inspiring community environments.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-center">
                    <p className="text-lg font-bold text-[#006B70] dark:text-[#28D2CB]">100%</p>
                    <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Verified Hubs</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-center">
                    <p className="text-lg font-bold text-[#006B70] dark:text-[#28D2CB]">4 Cities</p>
                    <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Lagos, ABJ, PH, IB</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-center">
                    <p className="text-lg font-bold text-[#006B70] dark:text-[#28D2CB]">24/7</p>
                    <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Power Uptime</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-center">
                    <p className="text-lg font-bold text-[#006B70] dark:text-[#28D2CB]">Instant</p>
                    <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Digital Passes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D7A7D] dark:text-[#B8D1D0]">Our Promise</h4>
                <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  No hidden subscription lock-ins. Pay only for the hours or days you use with transparent pricing in Naira.
                </p>
              </div>
            </div>
          )}

          {/* 2. FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-[#12383B] dark:text-white hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0] transition-transform ${isOpen ? 'rotate-180 text-[#14BEB8]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#5D7A7D] dark:text-[#B8D1D0] border-t border-[#E2ECEB] dark:border-[#166D74] pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. HELP CENTRE */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFA987]/20 text-[#FFA987] flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#12383B] dark:text-white">Check-in Assistance</h4>
                  <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                    Show your digital pass QR code at the reception desk of any verified OFIS hub for immediate entry.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFA987]/20 text-[#FFA987] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#12383B] dark:text-white">Payment &amp; Wallet Security</h4>
                  <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                    All transactions are encrypted and secured via Paystack and verified bank integrations.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFA987]/10 dark:bg-[#0B4A50] border border-[#FFA987]/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#12383B] dark:text-white">Need immediate live agent help?</h4>
                  <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Our Lagos support desk is active 8:00 AM – 9:00 PM WAT.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className="px-3 py-1.5 rounded-xl bg-[#14BEB8] text-white text-xs font-bold hover:bg-[#0EA8A2] transition-colors cursor-pointer shadow-sm"
                >
                  Contact Us
                </button>
              </div>
            </div>
          )}

          {/* 4. CONTACT SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              {supportSubmitted ? (
                <div className="p-6 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#FFA987]/40 text-center space-y-2 animate-in fade-in">
                  <div className="w-10 h-10 rounded-full bg-[#FFA987]/20 text-[#FFA987] flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#12383B] dark:text-white">Support Message Dispatched!</h4>
                  <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                    Your ticket (#OFIS-{Math.floor(100000 + Math.random() * 900000)}) has been received. Our support team will reply to your email within 30 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSupportSubmitted(false)}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#12383B] dark:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#12383B] dark:text-[#B8D1D0] mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        placeholder="e.g. Tunde Balogun"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:border-[#14BEB8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#12383B] dark:text-[#B8D1D0] mb-1">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="tunde@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:border-[#14BEB8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#12383B] dark:text-[#B8D1D0] mb-1">How can we help you today?</label>
                    <textarea
                      required
                      rows={3}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe your issue or booking question..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:border-[#14BEB8] focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Support Request</span>
                  </button>
                </form>
              )}

              <div className="pt-3 border-t border-[#E2ECEB] dark:border-[#166D74] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>support@ofis.ng</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>+234 (0) 700 6347 6447</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. PARTNER WITH OFIS / BECOME A HOST */}
          {activeTab === 'partner' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-3">
                <div className="flex items-center space-x-2 text-[#006B70] dark:text-[#28D2CB]">
                  <Handshake className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-[#12383B] dark:text-white">Monetize Your Extra Desk &amp; Office Capacity</h3>
                </div>
                <p className="text-xs">
                  Join over 120+ leading coworking hubs, corporate incubators, and creative studios in Nigeria. List your spaces with automated access control, instant daily settlements, and verified professional guests.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2 text-xs text-[#12383B] dark:text-white">
                    <Check className="w-4 h-4 text-[#FFA987]" />
                    <span>0% signup fee &amp; free high-resolution space photography</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[#12383B] dark:text-white">
                    <Check className="w-4 h-4 text-[#FFA987]" />
                    <span>Automated next-day direct bank payouts via Paystack</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[#12383B] dark:text-white">
                    <Check className="w-4 h-4 text-[#FFA987]" />
                    <span>Smart dynamic pricing and surge occupancy algorithms</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onBecomeHost) onBecomeHost();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <Building2 className="w-4 h-4" />
                  <span>List Your Space Now</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. REPORT A PROBLEM */}
          {activeTab === 'report' && (
            <div className="space-y-3">
              <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                Found an issue with a workspace, internet speed discrepancy, or app bug? Let us know and our engineering team will address it promptly.
              </p>
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#12383B] dark:text-[#B8D1D0] mb-1">Issue Category</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:border-[#14BEB8] focus:outline-none">
                    <option>Internet Speed / Connectivity Issue</option>
                    <option>Power / Inverter Outage at Space</option>
                    <option>Check-in QR Code Scanner Issue</option>
                    <option>Payment / Wallet Debit Error</option>
                    <option>Host Amenities Inaccuracy</option>
                    <option>Other Feedback / Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#12383B] dark:text-[#B8D1D0] mb-1">Details &amp; Space Name (if applicable)</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details of the problem..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:border-[#14BEB8] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#FFA987] hover:bg-[#FF9870] text-[#12383B] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Submit Problem Report</span>
                </button>
              </form>
            </div>
          )}

          {/* 7. RATE THE APP */}
          {activeTab === 'rate' && (
            <div className="space-y-4 text-center">
              {ratingSubmitted ? (
                <div className="p-6 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#14BEB8]/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB] flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#12383B] dark:text-white">Thank you for your rating!</h4>
                  <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                    Your review helps us improve the OFIS experience for creators across Africa.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[#12383B] dark:text-white">How was your experience with OFIS?</h3>
                    <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">Tap the stars below to rate the app.</p>
                  </div>

                  <div className="flex items-center justify-center space-x-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`w-7 h-7 ${
                            star <= rating 
                              ? 'text-[#FFA987] fill-[#FFA987]' 
                              : 'text-[#E2ECEB] dark:text-[#166D74]'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you love or how we can improve..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:border-[#14BEB8] focus:outline-none resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                  >
                    Submit Rating
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 8. SHARE OFIS */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB] flex items-center justify-center mx-auto">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#12383B] dark:text-white">Invite Friends &amp; Earn Free Passes</h3>
                <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  Share OFIS with colleagues and remote teams. When they book their first pass, you both get ₦5,000 credit in your OFIS wallet.
                </p>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    readOnly
                    value="https://ofis.ng/invite/PRO-DESK-2026"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-mono text-[#006B70] dark:text-[#28D2CB] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">OFIS Data Protection & Privacy Notice</h4>
              <p>
                OFIS Nigeria respects the privacy of our members and hosts. We collect minimal identification details (name, email, phone number) purely to facilitate workspace check-ins, security verification at host premises, and receipt dispatch.
              </p>
              <h5 className="font-bold text-[#111827] dark:text-[#F9FAFB]">1. Location Data</h5>
              <p>
                We use geolocation solely to display nearby coworking hubs and calculate travel directions. Your location is never sold to third parties.
              </p>
              <h5 className="font-bold text-[#111827] dark:text-[#F9FAFB]">2. Payment Information</h5>
              <p>
                Payment card details are tokenized and processed via Paystack (PCI-DSS compliant). OFIS does not store raw credit card numbers.
              </p>
            </div>
          )}

          {/* 10. TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <h4 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">OFIS Platform Terms of Service</h4>
              <p>
                By booking or hosting workspaces on OFIS, you agree to maintain professional conduct, respect host premises, and abide by occupancy guidelines.
              </p>
              <h5 className="font-bold text-[#111827] dark:text-[#F9FAFB]">1. Pass Validity</h5>
              <p>
                All digital passes are valid strictly for the booked duration and space tier. Overstaying beyond booked hours without extending will trigger standard hourly overstay charges.
              </p>
              <h5 className="font-bold text-[#111827] dark:text-[#F9FAFB]">2. Power & Internet Standards</h5>
              <p>
                All verified hosts are committed to 99.8% power and connectivity uptime during official hub working hours.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
