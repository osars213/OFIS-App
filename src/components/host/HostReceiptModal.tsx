import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2, ShieldCheck, Calendar, Clock, CreditCard } from 'lucide-react';
import { HostPayout, Booking } from '../../types';

interface HostReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout?: HostPayout | null;
  booking?: Booking | null;
}

export const HostReceiptModal: React.FC<HostReceiptModalProps> = ({
  isOpen,
  onClose,
  payout,
  booking
}) => {
  if (!isOpen || (!payout && !booking)) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/csv receipt for immediate offline access
    const receiptData = payout 
      ? `OFIS 2.0 OFFICIAL PAYOUT RECEIPT\nReference: ${payout.reference}\nAmount: NGN ${(payout.amountNgn || 0).toLocaleString()}\nBank: ${payout.bankName}\nAccount: ${payout.accountNumber}\nStatus: ${(payout.status || '').toUpperCase()}\nDate: ${payout.createdAt}\nOFIS Technologies Ltd - 100% Verified NIP Settlement`
      : booking 
      ? `OFIS 2.0 BOOKING INVOICE & RECEIPT\nBooking ID: ${booking.id}\nSpace: ${booking.spaceTitle}\nGuest: ${booking.userName} (${booking.userEmail})\nDate: ${booking.date} (${booking.startTime})\nTotal: NGN ${(booking.totalAmount || 0).toLocaleString()}\nPayment: ${(booking.paymentMethod || '').toUpperCase()} (${booking.paymentReference})\nStatus: ${(booking.status || '').toUpperCase()}\nPass Code: ${booking.digitalPassCode}`
      : '';

    const blob = new Blob([receiptData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = payout ? `OFIS-Payout-${payout.reference}.txt` : `OFIS-Invoice-${booking?.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1F2937] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-mono font-bold">
              ₦
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">
                {payout ? 'Official Payout Receipt' : 'Booking Transaction Invoice'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {payout ? `Ref: ${payout.reference}` : `Booking Ref: ${booking?.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable / Formatted Receipt Card */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] space-y-4 font-mono text-xs">
          
          {/* OFIS Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3 text-[11px]">
            <div>
              <span className="font-extrabold text-[#0F766E] dark:text-[#14B8A6] tracking-widest text-sm">OFIS 2.0</span>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] text-[10px]">Workspace Host & Property Settlement</p>
            </div>
            <div className="text-right text-[#6B7280] dark:text-[#9CA3AF]">
              <div>{new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <span className="px-1.5 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] text-[9px] font-bold">
                ✓ VERIFIED NIP
              </span>
            </div>
          </div>

          {/* Body Content */}
          {payout && (
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Settlement Amount:</span>
                <span className="text-base font-bold text-[#0F766E] dark:text-[#14B8A6]">₦{(payout.amountNgn || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Recipient Bank:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB] font-medium">{payout.bankName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">NUBAN Account:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB] font-medium">•••• •••• {payout.accountNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Account Name:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB] font-medium">{payout.accountName || 'WorkHub Africa Ltd'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Transaction Ref:</span>
                <span className="text-[#374151] dark:text-[#D1D5DB]">{payout.reference}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Settlement Status:</span>
                <span className="px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] font-bold text-[10px] uppercase">
                  {payout.status}
                </span>
              </div>
            </div>
          )}

          {booking && (
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Workspace Hub:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB] font-semibold truncate max-w-[200px]">{booking.spaceTitle}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Guest Name:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB]">{booking.userName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Reservation Schedule:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB]">{booking.date} • {booking.startTime} ({booking.durationHours}h)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Gross Paid:</span>
                <span className="text-base font-bold text-[#0F766E] dark:text-[#14B8A6]">₦{(booking.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Payment Method:</span>
                <span className="text-[#111827] dark:text-[#F9FAFB] uppercase">{booking.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Digital Pass Code:</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] text-[#0F766E] dark:text-[#14B8A6] font-bold">
                  {booking.digitalPassCode}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 text-[10px] text-[#6B7280] dark:text-[#9CA3AF] text-center border-t border-[#E5E7EB] dark:border-[#374151]">
            Thank you for partnering with OFIS 2.0 Nigeria. 100% Secured Escrow &amp; Instant Payouts.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Download .txt Receipt</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0B625C] text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
};
