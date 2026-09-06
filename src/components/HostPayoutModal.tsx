import React, { useState } from 'react';
import { X, Building2, Check, ArrowRight, Wallet, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NIGERIAN_BANKS = [
  'Access Bank PLC',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank PLC',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank PLC',
  'Fidelity Bank PLC',
  'Wema Bank / ALAT',
];

export const HostPayoutModal: React.FC = () => {
  const { 
    isHostPayoutModalOpen, 
    setIsHostPayoutModalOpen, 
    currentUser, 
    requestHostPayout 
  } = useApp();

  const availableBalance = currentUser.walletBalanceNgn || 420000;

  const [amount, setAmount] = useState(150000);
  const [bankName, setBankName] = useState('Access Bank PLC');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(currentUser.company || currentUser.name);
  const [isSuccess, setIsSuccess] = useState(false);
  const [payoutRef, setPayoutRef] = useState('');
  const [error, setError] = useState('');

  if (!isHostPayoutModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      setError(`Amount exceeds your available wallet balance (₦${(availableBalance || 0).toLocaleString()}).`);
      return;
    }
    if (accountNumber.trim().length !== 10) {
      setError('Nigerian NUBAN account number must be 10 digits.');
      return;
    }

    const payout = requestHostPayout({
      amountNgn: Number(amount),
      bankName,
      accountNumber,
      accountName,
    });

    setPayoutRef(payout.reference);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError('');
    setIsHostPayoutModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F2F2F2]">Host Earnings & Bank Payout</h3>
              <p className="text-xs text-[#718079]">Direct NIP settlement to your Nigerian corporate account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#00C878]/15 text-[#00C878] flex items-center justify-center mx-auto ring-4 ring-[#00C878]/20">
              <Check className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#F2F2F2]">Payout Request Dispatched!</h4>
              <p className="text-xs text-[#9EABA3]">
                ₦{(amount || 0).toLocaleString()} is being settled to {bankName} ({accountNumber}).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs font-mono text-[#718079] inline-block">
              Settlement Reference: <span className="text-[#00C878] font-bold">{payoutRef}</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Balance Overview */}
            <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#718079]">Available Host Balance</span>
                <div className="text-2xl font-extrabold text-[#00C878] font-mono">
                  ₦{(availableBalance || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#00C878]/15 text-[#00C878] font-semibold">
                  Zero Fee NIP Transfer
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Withdrawal Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#00C878] font-bold text-xs">₦</span>
                <input
                  type="number"
                  min="5000"
                  max={availableBalance}
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Bank Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Receiving Nigerian Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Account Number & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00C878]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center space-x-2 text-[11px] text-[#718079]">
              <ShieldCheck className="w-4 h-4 text-[#00C878] shrink-0" />
              <span>Instant direct deposit via CBN NIP settlement switch. Typically arrives in 60 seconds.</span>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E2522]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Confirm Payout of ₦{(amount || 0).toLocaleString()}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
