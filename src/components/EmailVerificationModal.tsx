import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send, 
  RefreshCw, 
  ArrowRight,
  Lock,
  Building2,
  CreditCard,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const EmailVerificationModal: React.FC = () => {
  const {
    isEmailVerificationModalOpen,
    setIsEmailVerificationModalOpen,
    emailVerificationReason,
    currentUser,
    verifyUserEmail,
    sendVerificationEmail,
    toggleUserEmailVerification,
    setIsCheckoutOpen,
    setIsListSpaceModalOpen,
  } = useApp();

  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  useEffect(() => {
    if (isEmailVerificationModalOpen) {
      setOtpCode('');
      setStatusMsg(null);
      setShowSuccessScreen(false);
      // Generate initial test OTP for convenience
      const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(testOtp);
    }
  }, [isEmailVerificationModalOpen, currentUser.email]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  if (!isEmailVerificationModalOpen) return null;

  const handleSendCode = async () => {
    setIsSending(true);
    setStatusMsg(null);
    try {
      const res = await sendVerificationEmail(currentUser.email);
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newOtp);
      setResendCountdown(45);
      setStatusMsg({
        text: `6-digit security code dispatched to ${currentUser.email}. (Demo Code: ${newOtp})`,
        type: 'info',
      });
    } catch (err: any) {
      setStatusMsg({ text: 'Failed to send code. Please try again.', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (!code) {
      setStatusMsg({ text: 'Please enter the 6-digit verification code.', type: 'error' });
      return;
    }

    // Accept user entered code or test code
    if (code.length < 4) {
      setStatusMsg({ text: 'Please enter a valid verification code.', type: 'error' });
      return;
    }

    setIsVerifying(true);
    setStatusMsg(null);

    setTimeout(async () => {
      try {
        await verifyUserEmail(code);
        setShowSuccessScreen(true);
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#14BEB8', '#FFA987', '#006B70', '#FFFFFF'],
          });
        } catch (e) {}

        setTimeout(() => {
          setIsEmailVerificationModalOpen(false);
          if (emailVerificationReason === 'listing') {
            setIsListSpaceModalOpen(true);
          } else if (emailVerificationReason === 'payment') {
            setIsCheckoutOpen(true);
          }
        }, 1600);
      } catch (err) {
        setStatusMsg({ text: 'Verification failed. Please try again.', type: 'error' });
      } finally {
        setIsVerifying(false);
      }
    }, 700);
  };

  const handleInstantVerify = async () => {
    setIsVerifying(true);
    await verifyUserEmail();
    setShowSuccessScreen(true);
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#14BEB8', '#FFA987', '#006B70', '#FFFFFF'],
      });
    } catch (e) {}

    setTimeout(() => {
      setIsEmailVerificationModalOpen(false);
      if (emailVerificationReason === 'listing') {
        setIsListSpaceModalOpen(true);
      } else if (emailVerificationReason === 'payment') {
        setIsCheckoutOpen(true);
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#07383D] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl p-6 space-y-5">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsEmailVerificationModalOpen(false)}
          className="absolute right-5 top-5 p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {showSuccessScreen ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/40 flex items-center justify-center mx-auto text-[#006B70] dark:text-[#28D2CB]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#12383B] dark:text-white">Email Verified Successfully!</h3>
              <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] max-w-xs mx-auto">
                Your email <span className="text-[#006B70] dark:text-[#28D2CB] font-mono font-medium">{currentUser.email}</span> is now confirmed. All platform capabilities are unlocked.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFA987]" />
              <span>
                {emailVerificationReason === 'listing' 
                  ? 'Returning to workspace listing submission...' 
                  : emailVerificationReason === 'payment'
                  ? 'Returning to instant pass checkout...'
                  : 'Account fully unlocked!'}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Header with Icon */}
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/30 flex items-center justify-center text-[#006B70] dark:text-[#28D2CB] shrink-0">
                <Mail className="w-6 h-6 text-[#14BEB8]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#12383B] dark:text-white">Verify Your Email</h3>
                  <span className="text-[10px] font-mono uppercase bg-[#FFA987]/20 text-[#C05621] dark:text-[#FFA987] px-2 py-0.5 rounded-full border border-[#FFA987]/40 font-bold">
                    Required
                  </span>
                </div>
                <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  {emailVerificationReason === 'listing' ? (
                    <span>Hosts must verify email before publishing workspaces to ensure platform trust and payout safety.</span>
                  ) : emailVerificationReason === 'payment' ? (
                    <span>Members must verify email before authorizing payments and receiving digital pass credentials.</span>
                  ) : (
                    <span>Verify your email address to unlock workspace listings and seamless pass checkouts.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Policy Enforcement Banner */}
            <div className="p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5D7A7D] dark:text-[#B8D1D0]">Current Email:</span>
                <span className="text-[#12383B] dark:text-white font-mono font-bold truncate max-w-[200px]">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2ECEB] dark:border-[#166D74]">
                <span className="text-[#5D7A7D] dark:text-[#B8D1D0]">Status:</span>
                <span className="text-[#C05621] dark:text-[#FFA987] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>Unverified (Gated from List/Pay)</span>
                </span>
              </div>
            </div>

            {/* OTP Code Entry Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] uppercase tracking-wider font-mono">
                  Enter 6-Digit Code
                </label>
                {generatedCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(generatedCode);
                      handleVerifyOtp(generatedCode);
                    }}
                    className="text-[10px] text-[#006B70] dark:text-[#28D2CB] hover:underline font-mono cursor-pointer"
                  >
                    Auto-fill demo code: {generatedCode}
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="email-verification-otp-input"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-center font-mono text-lg tracking-widest text-[#006B70] dark:text-[#28D2CB] font-bold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#14BEB8]"
                />
              </div>

              {statusMsg && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                  statusMsg.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950/30 border border-red-500/30 text-red-600 dark:text-red-400'
                    : statusMsg.type === 'success'
                    ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/40 text-[#006B70] dark:text-[#28D2CB]'
                    : 'bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-[#12383B] dark:text-white'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#14BEB8]" />
                  <span>{statusMsg.text}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="verify-email-submit-btn"
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerifyOtp()}
                className="w-full py-3.5 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Unlock Account</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSending || resendCountdown > 0}
                  onClick={handleSendCode}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Send New Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleInstantVerify}
                  className="py-2.5 px-3 rounded-xl bg-[#FFA987]/20 hover:bg-[#FFA987]/30 border border-[#FFA987]/40 text-xs font-bold text-[#006B70] dark:text-[#FFA987] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>1-Tap Instant Verify</span>
                </button>
              </div>
            </div>

            {/* Footer Trust Note */}
            <div className="pt-2 text-center">
              <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
                🔒 OFIS Trust &amp; Security: Email verification ensures legitimate host listings and fraud-free instant turnstile pass issuance.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
