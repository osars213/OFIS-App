import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Download, 
  Sparkles,
  CreditCard,
  History
} from 'lucide-react';
import { HostPayout } from '../../types';
import { useApp } from '../../context/AppContext';
import { HostReceiptModal } from './HostReceiptModal';

export const HostPayoutsTab: React.FC = () => {
  const { 
    currentUser, 
    hostPayouts, 
    setIsHostPayoutModalOpen, 
    formatPrice 
  } = useApp();

  const [selectedReceiptPayout, setSelectedReceiptPayout] = useState<HostPayout | null>(null);

  const availableBalance = currentUser.walletBalanceNgn || 420000;
  const lifetimeCompleted = hostPayouts
    .filter(p => p.status === 'completed')
    .reduce((acc, p) => acc + p.amountNgn, 2450000);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Payout Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Host Earnings & Bank Settlements</h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Direct NIP bank transfers, real-time escrow settlements, and official payment receipts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#0F766E] hover:bg-[#0D625C] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout (₦)</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Available for Withdrawal */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#0F766E]/40 space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#0F766E] dark:text-[#14B8A6]">
            ₦{(availableBalance || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Cleared & ready for instant bank transfer</p>
        </div>

        {/* Pending Settlement */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>In Escrow (Active Bookings)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#111827] dark:text-[#F9FAFB]">
            ₦140,000
          </div>
          <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Releases immediately upon guest check-in</p>
        </div>

        {/* Lifetime Earnings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Lifetime Payouts</span>
            <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#111827] dark:text-[#F9FAFB]">
            ₦{(lifetimeCompleted || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-[#0F766E] dark:text-[#14B8A6] font-semibold">100% On-time NIP clearance</p>
        </div>

      </div>

      {/* Payout Ledger & Invoices Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Disbursement History & Receipts</h3>
          </div>
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{hostPayouts.length} recorded settlements</span>
        </div>

        {hostPayouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            No payout requests made yet. When you withdraw earnings, full transaction receipts will be logged here.
          </div>
        ) : (
          <div className="space-y-3">
            {hostPayouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#0F766E]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-mono font-bold shrink-0">
                    ₦
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono font-bold text-[#111827] dark:text-[#F9FAFB]">
                        ₦{(payout.amountNgn || 0).toLocaleString()}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        payout.status === 'completed'
                          ? 'bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] border border-[#0F766E]/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {payout.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                      {payout.bankName} ••••• {payout.accountNumber.slice(-4)} ({payout.accountName})
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono mt-0.5">
                      Ref: {payout.reference} • Date: {payout.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptPayout(payout)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] border border-[#E5E7EB] dark:border-[#374151] flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <HostReceiptModal
        isOpen={Boolean(selectedReceiptPayout)}
        onClose={() => setSelectedReceiptPayout(null)}
        payout={selectedReceiptPayout}
      />

    </div>
  );
};
