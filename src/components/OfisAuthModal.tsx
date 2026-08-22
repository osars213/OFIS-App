import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Phone, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ofisWordmark from '../assets/ofis-wordmark.png';

export const OfisAuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, updateCurrentUser, showToast } = useApp();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '+234 803 456 7890');
  const [email, setEmail] = useState(currentUser.email || 'tunde@ofis.ng');
  const [name, setName] = useState(currentUser.name || 'Tunde Adebayo');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      phone: phoneNumber,
    });
    showToast(`Signed in securely as ${name}`);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <img src={ofisWordmark} alt="OFIS" className="h-7 w-auto object-contain" />
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#F2F2F2]">Sign in to your OFIS account</h3>
          <p className="text-xs text-[#9EABA3]">Access your saved workspaces, digital access passes, and booking receipts.</p>
        </div>

        {/* Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-[#1A201D] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              authMethod === 'phone'
                ? 'bg-[#00C878] text-[#0D0D0D]'
                : 'text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            WhatsApp / Phone SMS
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              authMethod === 'email'
                ? 'bg-[#00C878] text-[#0D0D0D]'
                : 'text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            Work Email
          </button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-3.5">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#9EABA3]">Your Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
            />
          </div>

          {authMethod === 'phone' ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Phone Number (Nigeria)</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 absolute left-3 text-[#00C878]" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#9EABA3]">Corporate or Personal Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-[#00C878]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md transition-all mt-2"
          >
            Continue to Workspaces
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#718079]">
            By continuing, you agree to OFIS security and physical space usage standards.
          </p>
        </div>

      </div>
    </div>
  );
};
