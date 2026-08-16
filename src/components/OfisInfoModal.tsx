import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  ShieldCheck,
  Zap,
  Wifi,
  DollarSign,
  Clock,
  CheckCircle2,
  HelpCircle,
  Mail,
  Phone,
  AlertTriangle,
  FileText,
  Lock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Camera,
  Layers,
  Users,
  Compass,
  Star,
  BookOpen
} from 'lucide-react';
import { OfisLogo } from './OfisLogo';
import { useApp } from '../context/AppContext';

export type InfoModalSection =
  | 'about'
  | 'how_it_works'
  | 'why_ofis'
  | 'how_hosting_works'
  | 'creators'
  | 'blog'
  | 'help_centre'
  | 'contact_us'
  | 'report_problem'
  | 'terms'
  | 'privacy'
  | 'refund_policy';

interface OfisInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection: InfoModalSection;
  onNavigateToExplore?: () => void;
  onNavigateToListSpace?: () => void;
  onNavigateToHostHub?: () => void;
}

export const OfisInfoModal: React.FC<OfisInfoModalProps> = ({
  isOpen,
  onClose,
  initialSection,
  onNavigateToExplore,
  onNavigateToListSpace,
  onNavigateToHostHub,
}) => {
  const { showToast, currentUser } = useApp();
  const [currentSection, setCurrentSection] = useState<InfoModalSection>(initialSection);

  // Contact Form State
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Report Form State
  const [reportType, setReportType] = useState('Power or Internet Issue');
  const [spaceNameReport, setSpaceNameReport] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Synchronize initialSection when opened
  React.useEffect(() => {
    if (isOpen) {
      setCurrentSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      showToast('Please fill in your email and message', 'warning');
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      showToast('Support ticket #OFIS-' + Math.floor(1000 + Math.random() * 9000) + ' received. Our team will respond shortly via email.', 'success');
      setContactMessage('');
      onClose();
    }, 700);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails) {
      showToast('Please describe the issue in detail', 'warning');
      return;
    }
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      showToast('Incident report logged. Host and OFIS Operations dispatched immediately.', 'success');
      setReportDetails('');
      onClose();
    }, 700);
  };

  return (
    <div
      id="ofis-info-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="ofis-info-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#121212] border border-[#262626] rounded-3xl shadow-2xl overflow-hidden relative text-left my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-[#161616] border-b border-[#242424] shrink-0">
          <div className="flex items-center gap-3">
            <OfisLogo size="sm" showTagline={false} />
            <div className="h-4 w-px bg-[#333333]" />
            <span className="text-xs font-bold text-[#00C878] uppercase tracking-wider">
              {currentSection.replace(/_/g, ' ')}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-stone-200 text-sm leading-relaxed space-y-6">
          {/* 1. ABOUT OFIS */}
          {currentSection === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">About OFIS</h2>
                <p className="text-[#00C878] text-sm font-semibold mt-1">
                  Nigeria's Physical Space Network
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B]">
                <p className="text-stone-300">
                  OFIS was built to solve a critical infrastructure challenge across Nigeria: high-quality physical workspaces, recording studios, meeting rooms, and production sets exist, but finding, verifying, and booking them with guaranteed power and fast internet has traditionally been fragmented and uncertain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
                  <div className="w-8 h-8 rounded-xl bg-[#063B2A] text-[#00C878] flex items-center justify-center mb-3">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Uninterrupted Operations</h3>
                  <p className="text-xs text-[#9A9A9A]">
                    Every partner space is audited for dual-generator backups, solar inverters, and high-speed fiber or Starlink internet.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
                  <div className="w-8 h-8 rounded-xl bg-[#063B2A] text-[#00C878] flex items-center justify-center mb-3">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white mb-1">On-Demand Flexibility</h3>
                  <p className="text-xs text-[#9A9A9A]">
                    Book by the hour, day, or week. Instant digital door codes and WiFi credentials upon confirmation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToExplore?.();
                  }}
                  className="py-3 px-5 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs flex items-center gap-2 hover:bg-[#00E58B] transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore All Spaces</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. HOW IT WORKS */}
          {currentSection === 'how_it_works' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">How It Works</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Accessing premium workspace and creative studios in 4 straightforward steps.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    num: '01',
                    title: 'Find a space',
                    desc: 'Search verified coworking desks, private offices, podcast suites, or video sets across Lagos, Abuja, Port Harcourt, and Ibadan.',
                    icon: Compass,
                  },
                  {
                    num: '02',
                    title: 'Choose your date and time',
                    desc: 'Select hourly access or full-day booking with transparent pricing in Nigerian Naira (₦).',
                    icon: Clock,
                  },
                  {
                    num: '03',
                    title: 'Book and pay',
                    desc: 'Instant secure checkout via Card, Bank Transfer, Paystack, or Apple Pay with instant confirmation.',
                    icon: DollarSign,
                  },
                  {
                    num: '04',
                    title: 'Check in and use the space',
                    desc: 'Receive your dynamic QR Pass, smart door PIN code, and WiFi password right on your phone.',
                    icon: CheckCircle2,
                  },
                ].map((st) => (
                  <div key={st.num} className="flex gap-4 p-4 rounded-2xl bg-[#171717] border border-[#262626] items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#063B2A] text-[#00C878] flex items-center justify-center font-black text-sm shrink-0">
                      {st.num}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{st.title}</h3>
                      <p className="text-xs text-[#9A9A9A] mt-1">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToExplore?.();
                }}
                className="w-full py-3.5 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#00E58B] transition-all cursor-pointer"
              >
                <span>Start Booking Spaces Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3. WHY OFIS */}
          {currentSection === 'why_ofis' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Why Choose OFIS</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Built specifically for the demands of modern Nigerian creators, remote teams, and businesses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828]">
                  <ShieldCheck className="w-6 h-6 text-[#00C878] mb-2" />
                  <h3 className="font-bold text-white text-sm">100% Verified Spaces</h3>
                  <p className="text-xs text-[#9A9A9A] mt-1">
                    Every location is physically inspected and verified for real photo accuracy, sound levels, and security.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828]">
                  <DollarSign className="w-6 h-6 text-[#00C878] mb-2" />
                  <h3 className="font-bold text-white text-sm">Transparent Naira Pricing</h3>
                  <p className="text-xs text-[#9A9A9A] mt-1">
                    No hidden generator surcharges or surprise booking fees. What you see is what you pay.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828]">
                  <Zap className="w-6 h-6 text-[#00C878] mb-2" />
                  <h3 className="font-bold text-white text-sm">Zero Downtime Guarantee</h3>
                  <p className="text-xs text-[#9A9A9A] mt-1">
                    Automated failover generators and high-bandwidth fiber ensure you never drop a call or lose work.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828]">
                  <Sparkles className="w-6 h-6 text-[#00C878] mb-2" />
                  <h3 className="font-bold text-white text-sm">Instant Access Passes</h3>
                  <p className="text-xs text-[#9A9A9A] mt-1">
                    Seamless contactless check-in with Apple Wallet support and dynamic door keypad codes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. HOW HOSTING WORKS */}
          {currentSection === 'how_hosting_works' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">How Hosting Works</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Turn your vacant desks, meeting rooms, or studio downtime into consistent revenue.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
                  <div className="font-bold text-[#00C878] text-xs uppercase mb-1">1. List in minutes</div>
                  <p className="text-xs text-stone-300">
                    Upload photos, describe your amenities (soundproofing, mics, monitors), and set hourly and daily rates in Naira.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
                  <div className="font-bold text-[#00C878] text-xs uppercase mb-1">2. Control availability</div>
                  <p className="text-xs text-stone-300">
                    Sync with your calendar, set working hours, and block dates whenever your own team needs the space.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
                  <div className="font-bold text-[#00C878] text-xs uppercase mb-1">3. Automated check-in & payouts</div>
                  <p className="text-xs text-stone-300">
                    OFIS handles guest verification, digital door codes, and direct bank payouts to your Nigerian bank account.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToListSpace?.();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs sm:text-sm text-center hover:bg-[#00E58B] transition-all cursor-pointer"
                >
                  List Your Space Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToHostHub?.();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#222222] text-white font-semibold text-xs sm:text-sm text-center hover:bg-[#2A2A2A] transition-all cursor-pointer border border-[#333333]"
                >
                  Go to Host Hub
                </button>
              </div>
            </div>
          )}

          {/* 5. OFIS CREATORS */}
          {currentSection === 'creators' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">OFIS Creators</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Top podcasts, YouTube creators, and photography studios powered by OFIS spaces.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'SoundForge Lagos', type: 'Podcast & Audio Suite', location: 'Victoria Island', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80' },
                  { name: 'Apex Visual Studio', type: '4K Multi-Cam Set', location: 'Lekki Phase 1', img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80' },
                  { name: 'The Cyc Loft', type: 'Fashion & Product Studio', location: 'Ikeja GRA', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80' },
                ].map((cr, idx) => (
                  <div key={idx} className="rounded-2xl bg-[#181818] border border-[#282828] overflow-hidden group">
                    <img src={cr.img} alt={cr.name} className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-3">
                      <div className="font-bold text-white text-xs">{cr.name}</div>
                      <div className="text-[11px] text-[#00C878] mt-0.5">{cr.type}</div>
                      <div className="text-[10px] text-[#9A9A9A] mt-1">{cr.location}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] text-xs text-stone-300">
                Are you a creator or studio owner? Partner with OFIS to list your studio slots during off-peak hours.
              </div>
            </div>
          )}

          {/* 6. OFIS BLOG / INSIGHTS */}
          {currentSection === 'blog' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">OFIS Blog & Insights</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Articles, guides, and intelligence on workspaces, productivity, and studio setups in Nigeria.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'The Real Cost of Power in Nigerian Coworking Spaces (2026 Breakdown)',
                    date: 'August 12, 2026',
                    readTime: '4 min read',
                    category: 'Infrastructure',
                  },
                  {
                    title: 'Acoustic Treatment vs Noise Cancelling: Setting Up a Lagos Podcast Room',
                    date: 'August 04, 2026',
                    readTime: '6 min read',
                    category: 'Creator Studios',
                  },
                  {
                    title: 'How Hybrid Teams in Abuja and Lagos Manage On-Demand Team Offsites',
                    date: 'July 28, 2026',
                    readTime: '5 min read',
                    category: 'Productivity',
                  },
                ].map((post, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#181818] border border-[#282828] hover:border-[#00C878]/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#063B2A] text-[#00C878] font-bold">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-[#888888]">{post.date}</span>
                      <span className="text-[10px] text-[#888888]">• {post.readTime}</span>
                    </div>
                    <h3 className="font-bold text-white text-sm hover:text-[#00C878] transition-colors">
                      {post.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. HELP CENTRE */}
          {currentSection === 'help_centre' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Help Centre & FAQs</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Frequently asked questions about booking, payments, and pass verification.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: 'How do I access the space after booking?',
                    a: 'Once your booking is confirmed, your Digital Pass unlocks immediately with your designated Door Keypad PIN and WiFi credentials.',
                  },
                  {
                    q: 'What happens if the power or internet goes down?',
                    a: 'All OFIS verified spaces maintain automated dual generator backups and secondary cellular/Starlink internet failovers. If an issue occurs, report it immediately in the app for instant resolution or refund.',
                  },
                  {
                    q: 'Can I extend my booking while in the space?',
                    a: 'Yes! Open your active pass in the app and tap "Extend Booking" to add hours instantly in real-time subject to desk availability.',
                  },
                  {
                    q: 'How do host payouts work in Nigeria?',
                    a: 'Host earnings are paid directly via automated bank transfer into any Nigerian commercial bank account on a weekly or instant schedule.',
                  },
                ].map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#171717] border border-[#282828]">
                    <div className="font-bold text-white text-sm mb-1">{faq.q}</div>
                    <div className="text-xs text-[#9A9A9A] leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. CONTACT US */}
          {currentSection === 'contact_us' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Contact OFIS Support</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Our local support team is available 24/7 across Nigeria.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#282828] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#063B2A] text-[#00C878] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#9A9A9A]">Email Support</div>
                    <div className="text-xs font-bold text-white">support@ofis.ng</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#282828] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#063B2A] text-[#00C878] flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#9A9A9A]">WhatsApp Hotline</div>
                    <div className="text-xs font-bold text-white">+234 803 OFIS NG</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-3 bg-[#181818] p-5 rounded-2xl border border-[#282828]">
                <div className="text-xs font-bold text-white mb-2">Send us a direct message</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2D2D2D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none focus:border-[#00C878]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2D2D2D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none focus:border-[#00C878]"
                  />
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="How can we help you today?"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white placeholder-stone-600 outline-none focus:border-[#00C878]"
                />

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingContact ? 'Sending...' : 'Submit Message'}</span>
                </button>
              </form>
            </div>
          )}

          {/* 9. REPORT A PROBLEM */}
          {currentSection === 'report_problem' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Report a Problem</h2>
                <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1">
                  Report space discrepancies, power/internet failure, or payment concerns.
                </p>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3 bg-[#181818] p-5 rounded-2xl border border-[#282828]">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Issue Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2D2D2D] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00C878]"
                  >
                    <option value="Power or Internet Issue">⚡ Power or Internet Issue</option>
                    <option value="Access / Door PIN not working">🔑 Access / Door PIN not working</option>
                    <option value="Noise / Disturbance in space">🔊 Noise / Disturbance in space</option>
                    <option value="Incorrect Space Details">🏢 Incorrect Space Details</option>
                    <option value="Payment / Refund inquiry">💳 Payment / Refund inquiry</option>
                    <option value="Other">Other Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Space Name or Booking Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Greenhouse Studio Lekki or Pass #OFIS-8492"
                    value={spaceNameReport}
                    onChange={(e) => setSpaceNameReport(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2D2D2D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 outline-none focus:border-[#00C878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Description of Issue *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Please explain what happened so our team can resolve it immediately..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2D2D2D] rounded-xl p-3 text-xs text-white placeholder-stone-600 outline-none focus:border-[#00C878]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isSubmittingReport ? 'Dispatching...' : 'Submit Incident Report'}</span>
                </button>
              </form>
            </div>
          )}

          {/* 10. TERMS & CONDITIONS */}
          {currentSection === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-2xl font-bold text-white tracking-tight">Terms & Conditions</h2>
              <p className="text-xs text-[#9A9A9A]">Last updated: August 2026</p>
              
              <div className="space-y-3 text-xs text-stone-300">
                <p>
                  <strong>1. Acceptance of Terms:</strong> By accessing or using the OFIS platform, you agree to comply with and be bound by these Terms of Service.
                </p>
                <p>
                  <strong>2. Space Usage:</strong> Guests must respect space rules, quiet zones, and stated closing hours. Subletting of reserved desks is strictly prohibited.
                </p>
                <p>
                  <strong>3. Host Obligations:</strong> Hosts guarantee accurate representation of listed amenities, power availability, and security measures.
                </p>
              </div>
            </div>
          )}

          {/* 11. PRIVACY POLICY */}
          {currentSection === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-2xl font-bold text-white tracking-tight">Privacy Policy</h2>
              <p className="text-xs text-[#9A9A9A]">Last updated: August 2026</p>
              
              <div className="space-y-3 text-xs text-stone-300">
                <p>
                  <strong>1. Data Collection:</strong> We collect necessary identification data (name, email, phone number) strictly to facilitate pass generation and host verification.
                </p>
                <p>
                  <strong>2. Payment Security:</strong> All transactions are processed through PCI-DSS compliant Nigerian payment gateways (Paystack / Flutterwave). OFIS never stores raw credit card credentials.
                </p>
              </div>
            </div>
          )}

          {/* 12. REFUND POLICY */}
          {currentSection === 'refund_policy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-2xl font-bold text-white tracking-tight">Refund & Cancellation Policy</h2>
              <p className="text-xs text-[#9A9A9A]">Last updated: August 2026</p>
              
              <div className="space-y-3 text-xs text-stone-300">
                <p>
                  <strong>1. Flexible Cancellations:</strong> Full refund for cancellations made at least 2 hours before the scheduled check-in time.
                </p>
                <p>
                  <strong>2. Power / Internet Failure Guarantee:</strong> If a partner space suffers power or internet downtime exceeding 15 minutes without generator failover, guests are eligible for a 100% immediate credit or refund.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
