import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles,
  ArrowUpRight,
  Receipt,
  Globe,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Check,
  X,
  MapPin,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../mockData';

export const AdminPlatformDashboard: React.FC = () => {
  const {
    spaces,
    bookings,
    formatPriceNaira,
    showToast,
  } = useApp();

  const [activeOpsTab, setActiveOpsTab] = useState<'transactions' | 'verification' | 'disputes' | 'analytics'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');

  const totalGrossNaira = bookings.reduce((sum, b) => sum + (b.totalAmount), 0) || 12450000;
  const totalCommissionNaira = bookings.reduce((sum, b) => sum + (b.platformCommissionFee), 0) || 622500;
  const totalHostPayoutsNaira = totalGrossNaira - totalCommissionNaira;
  const totalSuccessfulReservations = bookings.length || 184;

  // Verification requests mock queue
  const [verificationRequests, setVerificationRequests] = useState([
    {
      id: 'VER-001',
      spaceName: 'The Cube Hub – Lekki Phase 1',
      hostName: 'Babajide Cole',
      city: 'Lagos',
      category: 'Creator & Podcast Studio',
      submittedDate: '2 hours ago',
      documents: ['CAC Reg Certificate', 'Dual Generator Proof (50kVA)', 'High-Res Studio Photos'],
      status: 'pending',
    },
    {
      id: 'VER-002',
      spaceName: 'Zenith Tech Lounge – Maitama',
      hostName: 'Fatima Aliyu',
      city: 'Abuja',
      category: 'Meeting & Boardrooms',
      submittedDate: '5 hours ago',
      documents: ['Business Tenancy Agreement', 'Starlink 350Mbps Speedtest', 'Security Compliance'],
      status: 'pending',
    },
    {
      id: 'VER-003',
      spaceName: 'Port Harcourt Creator Loft',
      hostName: 'Tamuno Briggs',
      city: 'Port Harcourt',
      category: 'Photography & Cyclorama Studio',
      submittedDate: '1 day ago',
      documents: ['Equipment Serial Logs', 'Acoustic Test Results'],
      status: 'verified',
    },
  ]);

  const handleApproveVerification = (id: string, spaceName: string) => {
    setVerificationRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: 'verified' } : req))
    );
    showToast(`Space "${spaceName}" verified and activated for instant online booking!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                OFIS Ops & Marketplace Control
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#063B2A] text-[#00C878] border border-[#00C878]/30">
                Paystack Gateway & Escrow 🇳🇬
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#9A9A9A] mt-1 font-normal">
              Nigerian physical-space transaction volume, transparent 5% platform fee, automated host settlements, and space verification queue.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#171717] p-1.5 rounded-2xl border border-[#282828] text-xs font-bold">
            <span className="px-3 py-1 bg-[#063B2A] text-[#00C878] rounded-xl border border-[#00C878]/30">
              OFIS Fee: 5.0%
            </span>
            <span className="px-2 text-[#9A9A9A]">Instant Paystack split</span>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Platform Volume */}
          <div className="p-5 rounded-3xl bg-[#171717] border border-[#262626] shadow-lg space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Gross Volume (GMV)</span>
              <Globe className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {formatPriceNaira(totalGrossNaira)}
            </div>
            <div className="text-[11px] text-[#00C878] flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Across {spaces.length} Nigerian spaces
            </div>
          </div>

          {/* Retained Platform Commission */}
          <div className="p-5 rounded-3xl bg-[#063B2A] border border-[#00C878]/30 text-white shadow-lg space-y-1">
            <div className="flex items-center justify-between text-[#00C878] text-xs font-bold uppercase tracking-wider">
              <span>Platform Fee (5%)</span>
              <Percent className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#00C878]">
              {formatPriceNaira(totalCommissionNaira)}
            </div>
            <div className="text-[11px] text-stone-300">
              OFIS marketplace infrastructure revenue
            </div>
          </div>

          {/* Space Owners Payouts */}
          <div className="p-5 rounded-3xl bg-[#171717] border border-[#262626] shadow-lg space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Host Disbursements (95%)</span>
              <Building2 className="w-4 h-4 text-[#D6A83A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {formatPriceNaira(totalHostPayoutsNaira)}
            </div>
            <div className="text-[11px] text-[#D6A83A] font-semibold">
              Direct Nigerian bank settlement
            </div>
          </div>

          {/* Total Reservations */}
          <div className="p-5 rounded-3xl bg-[#171717] border border-[#262626] shadow-lg space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Confirmed Passes</span>
              <Receipt className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalSuccessfulReservations}
            </div>
            <div className="text-[11px] text-[#00C878]">
              Instant QR & Turnstile Passes
            </div>
          </div>
        </div>

        {/* Ops Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#262626] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveOpsTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeOpsTab === 'transactions'
                ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                : 'text-[#9A9A9A] hover:text-white hover:bg-[#202020]'
            }`}
          >
            Transaction Ledger ({bookings.length})
          </button>

          <button
            onClick={() => setActiveOpsTab('verification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeOpsTab === 'verification'
                ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                : 'text-[#9A9A9A] hover:text-white hover:bg-[#202020]'
            }`}
          >
            Verification Queue ({verificationRequests.filter(v => v.status === 'pending').length} Pending)
          </button>

          <button
            onClick={() => setActiveOpsTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeOpsTab === 'analytics'
                ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                : 'text-[#9A9A9A] hover:text-white hover:bg-[#202020]'
            }`}
          >
            City Analytics & Power Health
          </button>
        </div>

        {/* Tab 1: Global Transaction Stream Table */}
        {activeOpsTab === 'transactions' && (
          <div className="p-6 rounded-3xl bg-[#171717] border border-[#282828] shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-black text-base text-white">Platform Transaction Ledger</h3>
              <span className="text-xs text-[#00C878] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
                Live Paystack & Flutterwave Webhooks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] text-[#9A9A9A] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Transaction</th>
                    <th className="py-3 px-3">Coworker</th>
                    <th className="py-3 px-3">Space & Pod</th>
                    <th className="py-3 px-3">Gross Total</th>
                    <th className="py-3 px-3 font-bold text-[#00C878]">OFIS Fee (5%)</th>
                    <th className="py-3 px-3 text-white font-bold">Host Payout (95%)</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {(bookings || []).map(b => (
                    <tr key={b.id} className="hover:bg-[#1E1E1E] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#00C878]">
                        TXN-{b.id}
                      </td>
                      <td className="py-3 px-3 font-medium text-white">
                        {b.coworkerName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-stone-200">{b.spaceName}</span>
                        <span className="font-mono text-[#00C878] ml-1.5 font-bold">({b.deskCode})</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white font-mono">
                        {formatPriceNaira(b.totalAmount)}
                      </td>
                      <td className="py-3 px-3 font-bold font-mono text-[#00C878]">
                        +{formatPriceNaira(b.platformCommissionFee)}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-300 font-mono">
                        {formatPriceNaira(b.hostNetPayout || b.totalAmount * 0.95)}
                      </td>
                      <td className="py-3 px-3 capitalize text-[#9A9A9A]">
                        {b.paymentMethod ? b.paymentMethod.replace('_', ' ') : 'Card (Paystack)'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00C878] bg-[#063B2A] px-2 py-0.5 rounded-full border border-[#00C878]/30">
                          <CircleDot className="w-2.5 h-2.5 fill-[#00C878]" /> Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Space Verification Queue */}
        {activeOpsTab === 'verification' && (
          <div className="p-6 rounded-3xl bg-[#171717] border border-[#282828] shadow-lg space-y-4">
            <h3 className="font-black text-base text-white">Host Space Verification & Compliance Queue</h3>
            <p className="text-xs text-[#9A9A9A]">
              Review proof of 24/7 generator backup, Starlink internet speeds, CAC registration, and physical room photos before public listing.
            </p>

            <div className="space-y-3 mt-4">
              {(verificationRequests || []).map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#1E1E1E] border border-[#2C2C2C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#00C878] font-bold">{req.id}</span>
                      <h4 className="font-bold text-sm text-white">{req.spaceName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#282828] text-stone-300">
                        {req.city}
                      </span>
                    </div>
                    <div className="text-xs text-[#9A9A9A]">
                      Host: <span className="text-white font-semibold">{req.hostName}</span> • Type: {req.category} • Submitted: {req.submittedDate}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(req.documents || []).map((doc, idx) => (
                        <span key={idx} className="text-[10px] bg-[#141414] text-[#D6A83A] px-2 py-0.5 rounded border border-[#D6A83A]/30 flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {req.status === 'verified' ? (
                      <span className="text-xs font-bold text-[#00C878] bg-[#063B2A] px-3 py-1.5 rounded-xl border border-[#00C878]/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Live
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveVerification(req.id, req.spaceName)}
                        className="px-4 py-2 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 text-[#0D0D0D]" />
                        <span>Approve & Verify</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: City Analytics & Power Health */}
        {activeOpsTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#171717] border border-[#282828] shadow-lg space-y-4">
              <h3 className="font-black text-base text-white">Top Nigerian Space Hubs by Demand</h3>
              <div className="space-y-3">
                {[
                  { city: 'Lagos (Lekki, VI, Yaba, Ikeja)', share: '62%', count: '24 Spaces', gmv: '₦7.8M GMV' },
                  { city: 'Abuja (Maitama, Wuse II, CBD)', share: '21%', count: '9 Spaces', gmv: '₦2.6M GMV' },
                  { city: 'Port Harcourt (GRA Phase 2)', share: '10%', count: '4 Spaces', gmv: '₦1.2M GMV' },
                  { city: 'Ibadan (Old Bodija)', share: '7%', count: '3 Spaces', gmv: '₦850K GMV' },
                ].map((hub, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1F1F1F] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{hub.city}</div>
                      <div className="text-[#9A9A9A] text-[11px]">{hub.count} • {hub.gmv}</div>
                    </div>
                    <span className="font-mono font-bold text-[#00C878] bg-[#063B2A] px-2 py-1 rounded-lg">
                      {hub.share}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#171717] border border-[#282828] shadow-lg space-y-4">
              <h3 className="font-black text-base text-white">Live Infrastructure Uptime Index</h3>
              <div className="space-y-3">
                {[
                  { name: '24/7 Power Availability (Gen + Solar Inverter)', uptime: '99.8%', status: 'Optimal' },
                  { name: 'Starlink & Fiber Internet Latency (<35ms)', uptime: '99.4%', status: 'Optimal' },
                  { name: 'Smart Lock & Keyless Turnstile PINs', uptime: '100.0%', status: 'Active' },
                  { name: 'Paystack Automated Payout Webhook Gateway', uptime: '99.9%', status: 'Operational' },
                ].map((infra, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1F1F1F] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                      <span className="font-semibold text-stone-200">{infra.name}</span>
                    </div>
                    <span className="font-mono font-black text-[#00C878]">{infra.uptime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
