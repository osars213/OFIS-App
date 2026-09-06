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
          <h2 className="text-xl font-bold text-[#F2F2F2]">Host Earnings & Bank Settlements</h2>
          <p className="text-xs text-[#718079]">
            Direct NIP bank transfers, real-time escrow settlements, and official payment receipts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#00C878]/15 cursor-pointer active:scale-95 transition-all"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout (₦)</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Available for Withdrawal */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#00C878]/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-[#00C878]" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#00C878]">
            ₦{(availableBalance || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-[#9EABA3]">Cleared & ready for instant bank transfer</p>
        </div>

        {/* Pending Settlement */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>In Escrow (Active Bookings)</span>
            <Clock className="w-4 h-4 text-[#E0A82E]" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#F2F2F2]">
            ₦140,000
          </div>
          <p className="text-[10px] text-[#718079]">Releases immediately upon guest check-in</p>
        </div>

        {/* Lifetime Earnings */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>Lifetime Payouts</span>
            <ShieldCheck className="w-4 h-4 text-[#00C878]" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-[#F2F2F2]">
            ₦{(lifetimeCompleted || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-[#00C878] font-semibold">100% On-time NIP clearance</p>
        </div>

      </div>

      {/* Payout Ledger & Invoices Table */}
      <div className="p-6 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#00C878]" />
            <h3 className="text-sm font-bold text-[#F2F2F2]">Disbursement History & Receipts</h3>
          </div>
          <span className="text-xs text-[#718079]">{hostPayouts.length} recorded settlements</span>
        </div>

        {hostPayouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#718079]">
            No payout requests made yet. When you withdraw earnings, full transaction receipts will be logged here.
          </div>
        ) : (
          <div className="space-y-3">
            {hostPayouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] hover:border-[#2A3630] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-mono font-bold shrink-0">
                    ₦
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono font-bold text-[#F2F2F2]">
                        ₦{(payout.amountNgn || 0).toLocaleString()}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        payout.status === 'completed'
                          ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30'
                          : 'bg-[#E0A82E]/15 text-[#E0A82E] border border-[#E0A82E]/30'
                      }`}>
                        {payout.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#718079] mt-0.5">
                      {payout.bankName} ••••• {payout.accountNumber.slice(-4)} ({payout.accountName})
                    </div>
                    <div className="text-[10px] text-[#9EABA3] font-mono mt-0.5">
                      Ref: {payout.reference} • Date: {payout.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptPayout(payout)}
                    className="px-3 py-1.5 rounded-xl bg-[#141816] hover:bg-[#232D28] text-xs font-semibold text-[#00C878] border border-[#232D28] flex items-center space-x-1.5 cursor-pointer transition-colors"
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
