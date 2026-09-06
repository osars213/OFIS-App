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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-mono font-bold">
              ₦
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">
                {payout ? 'Official Payout Receipt' : 'Booking Transaction Invoice'}
              </h3>
              <p className="text-xs text-[#718079]">
                {payout ? `Ref: ${payout.reference}` : `Booking Ref: ${booking?.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable / Formatted Receipt Card */}
        <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#232D28] space-y-4 font-mono text-xs">
          
          {/* OFIS Header */}
          <div className="flex items-center justify-between border-b border-[#1E2522] pb-3 text-[11px]">
            <div>
              <span className="font-extrabold text-[#00C878] tracking-widest text-sm">OFIS 2.0</span>
              <p className="text-[#718079] text-[10px]">Workspace Host & Property Settlement</p>
            </div>
            <div className="text-right text-[#718079]">
              <div>{new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <span className="px-1.5 py-0.5 rounded bg-[#00C878]/15 text-[#00C878] text-[9px] font-bold">
                ✓ VERIFIED NIP
              </span>
            </div>
          </div>

          {/* Body Content */}
          {payout && (
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Settlement Amount:</span>
                <span className="text-base font-bold text-[#00C878]">₦{(payout.amountNgn || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Recipient Bank:</span>
                <span className="text-[#F2F2F2]">{payout.bankName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">NUBAN Account:</span>
                <span className="text-[#F2F2F2]">•••• •••• {payout.accountNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Account Name:</span>
                <span className="text-[#F2F2F2]">{payout.accountName || 'WorkHub Africa Ltd'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Transaction Ref:</span>
                <span className="text-[#9EABA3]">{payout.reference}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#718079]">Settlement Status:</span>
                <span className="px-2 py-0.5 rounded bg-[#00C878]/20 text-[#00C878] font-bold text-[10px] uppercase">
                  {payout.status}
                </span>
              </div>
            </div>
          )}

          {booking && (
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Workspace Hub:</span>
                <span className="text-[#F2F2F2] font-semibold truncate max-w-[200px]">{booking.spaceTitle}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Guest Name:</span>
                <span className="text-[#F2F2F2]">{booking.userName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Reservation Schedule:</span>
                <span className="text-[#F2F2F2]">{booking.date} • {booking.startTime} ({booking.durationHours}h)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Gross Paid:</span>
                <span className="text-base font-bold text-[#00C878]">₦{(booking.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E2522]">
                <span className="text-[#718079]">Payment Method:</span>
                <span className="text-[#F2F2F2] uppercase">{booking.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#718079]">Digital Pass Code:</span>
                <span className="px-2 py-0.5 rounded bg-[#18201B] border border-[#232D28] text-[#00C878] font-bold">
                  {booking.digitalPassCode}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 text-[10px] text-[#718079] text-center border-t border-[#1E2522]">
            Thank you for partnering with OFIS 2.0 Nigeria. 100% Secured Escrow & Instant Payouts.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-bold text-[#F2F2F2] flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00C878]" />
            <span>Download .txt Receipt</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
};
