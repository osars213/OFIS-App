import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  Check,
  Camera,
  Upload,
  X,
  Compass,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { OfisLogo } from './OfisLogo';
import { useApp } from '../context/AppContext';

interface OfisAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onCompletedHostSignup?: () => void;
  onCompletedClientSignup?: () => void;
}

export const OfisAuthModal: React.FC<OfisAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onCompletedHostSignup,
  onCompletedClientSignup,
}) => {
  const { setCurrentUser, showToast, openAvatarModal } = useApp();

  // Mode: 'signin' | 'signup_landing' | 'client_signup' | 'host_signup' | 'avatar_prompt'
  const [authView, setAuthView] = useState<'signin' | 'signup_landing' | 'client_signup' | 'host_signup' | 'avatar_prompt'>(
    initialMode === 'signup' ? 'signup_landing' : 'signin'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User details created during sign up
  const [createdUser, setCreatedUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'coworker' | 'host' | 'admin';
    phone: string;
    avatar: string;
    company?: string;
  } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setAuthView(initialMode === 'signup' ? 'signup_landing' : 'signin');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setBusinessName('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSocialAuth = (provider: 'Google' | 'Apple', intendedRole: 'coworker' | 'host') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const isGoogle = provider === 'Google';
      const user = {
        id: `usr_${Date.now()}`,
        name: isGoogle ? 'Alex Adebayo' : 'Chidi Okafor',
        email: isGoogle ? 'alex.adebayo@gmail.com' : 'chidi.okafor@icloud.com',
        role: intendedRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        phone: '+234 803 123 4567',
        isVerified: true,
      };

      setCurrentUser(user);
      setCreatedUser(user);
      setAuthView('avatar_prompt');
    }, 700);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const displayName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
      const user = {
        id: `usr_${Date.now()}`,
        name: displayName,
        email,
        role: 'coworker' as const,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        phone: phone || '+234 802 000 1122',
        isVerified: true,
      };

      setCurrentUser(user);
      showToast('Welcome back to OFIS!', 'success');
      onClose();
    }, 700);
  };

  const handleClientSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email,
        role: 'coworker' as const,
        phone: phone || '+234 800 000 0000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        isVerified: true,
      };

      setCurrentUser(user);
      setCreatedUser(user);
      setAuthView('avatar_prompt');
    }, 700);
  };

  const handleHostSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email,
        role: 'host' as const,
        company: businessName.trim() || undefined,
        phone: phone || '+234 800 000 0000',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        isVerified: true,
      };

      setCurrentUser(user);
      setCreatedUser(user);
      setAuthView('avatar_prompt');
    }, 700);
  };

  const handleFinishAvatarPrompt = (customizeNow: boolean) => {
    onClose();
    if (customizeNow) {
      openAvatarModal();
    }
    
    if (createdUser?.role === 'host') {
      showToast('Host account created! Let’s list your space.', 'success');
      onCompletedHostSignup?.();
    } else {
      showToast('Welcome to OFIS! Start exploring spaces.', 'success');
      onCompletedClientSignup?.();
    }
  };

  return (
    <div
      id="ofis-auth-modal-backdrop"
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="ofis-auth-modal-card"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${
          authView === 'signup_landing' ? 'max-w-2xl' : 'max-w-md'
        } bg-[#111111] border border-[#242424] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left overflow-hidden my-auto transition-all`}
      >
        {/* Subtle decorative green ambient glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#00C878]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#00C878]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          aria-label="Close auth dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================= */}
        {/* 1. SIGN-UP LANDING SCREEN: Book a Space vs List a Space   */}
        {/* ========================================================= */}
        {authView === 'signup_landing' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <OfisLogo size="md" showTagline={false} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome to OFIS
              </h2>
              <p className="text-sm font-semibold text-[#00C878] mt-1">
                What would you like to do?
              </p>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[#181818] border border-[#2A2A2A] text-xs text-[#9A9A9A]">
                <span>Need a space? <strong className="text-white">Book one.</strong></span>
                <span className="text-[#444444]">•</span>
                <span>Have a space? <strong className="text-[#00C878]">List it.</strong></span>
              </div>
            </div>

            {/* Two Large Visually Distinct Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              {/* Option A: BOOK A SPACE (Client) */}
              <div
                id="landing-choice-book-space"
                className="group relative bg-[#171717] hover:bg-[#1C1C1C] border border-[#282828] hover:border-[#00C878]/60 rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 flex items-center justify-center mb-4">
                    <Compass className="w-6 h-6" />
                  </div>

                  <div className="text-xs font-black uppercase text-[#00C878] tracking-wider">
                    I need a space
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    BOOK A SPACE
                  </h3>
                  
                  <div className="text-xs text-[#9A9A9A] mt-2 mb-4">
                    <div className="font-semibold text-stone-300 mb-1.5">Find and book:</div>
                    <ul className="space-y-1 text-[11px] text-stone-400">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Coworking spaces & hot desks</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Private offices & team suites</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Meeting rooms & boardrooms</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Podcast & audio suites</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Content creator & 4K video sets</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Photography & cyclorama studios</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                        <span>Event spaces & workshops</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  id="choice-create-client-btn"
                  onClick={() => setAuthView('client_signup')}
                  className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(0,200,120,0.25)] flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <span>Create Client Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Option B: LIST A SPACE (Space Owner) */}
              <div
                id="landing-choice-list-space"
                className="group relative bg-[#171717] hover:bg-[#1C1C1C] border border-[#282828] hover:border-[#D6A83A]/60 rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#2A2312] text-[#D6A83A] border border-[#D6A83A]/40 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>

                  <div className="text-xs font-black uppercase text-[#D6A83A] tracking-wider">
                    I have a space
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    LIST A SPACE
                  </h3>
                  
                  <div className="text-xs text-[#9A9A9A] mt-2 mb-4">
                    <div className="font-semibold text-stone-300 mb-1.5">List and earn from:</div>
                    <ul className="space-y-1 text-[11px] text-stone-400">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Offices & executive suites</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Coworking spaces & hub desks</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Podcast & recording studios</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Meeting rooms & training halls</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Event spaces & creative venues</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Creative spaces & gallery lofts</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A83A]" />
                        <span>Other bookable physical spaces</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  id="choice-list-my-space-btn"
                  onClick={() => setAuthView('host_signup')}
                  className="w-full py-3 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-white border border-[#3A3A3A] hover:border-[#D6A83A] font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-[#D6A83A]" />
                  <span>List My Space</span>
                </button>
              </div>

            </div>

            {/* Bottom Switch to Sign In */}
            <div className="text-center pt-3 border-t border-[#222222]">
              <p className="text-xs text-[#9A9A9A]">
                Already have an account?{' '}
                <button
                  type="button"
                  id="landing-switch-to-signin-btn"
                  onClick={() => setAuthView('signin')}
                  className="text-[#00C878] font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. CLIENT SIGN-UP: Create your OFIS account               */}
        {/* ========================================================= */}
        {authView === 'client_signup' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => setAuthView('signup_landing')}
              className="flex items-center gap-1.5 text-xs text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Create your OFIS account
              </h2>
              <p className="text-xs text-[#9A9A9A] mt-1">
                Book verified workspaces and creative studios across Nigeria.
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="client-auth-google-btn"
                disabled={isSubmitting}
                onClick={() => handleSocialAuth('Google', 'coworker')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2B2B2B] bg-[#171717] hover:bg-[#1E1E1E] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                id="client-auth-apple-btn"
                disabled={isSubmitting}
                onClick={() => handleSocialAuth('Apple', 'coworker')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2B2B2B] bg-[#171717] hover:bg-[#1E1E1E] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.16-.54 2.79-1.28z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#262626] w-full" />
              <span className="bg-[#111111] px-2.5 text-[10px] font-medium text-[#707070] uppercase tracking-wider whitespace-nowrap">
                or continue with email
              </span>
              <div className="border-t border-[#262626] w-full" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleClientSignUpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    id="client-signup-name"
                    placeholder="e.g. Babatunde Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    id="client-signup-email"
                    placeholder="babatunde@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    id="client-signup-phone"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="client-signup-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="client-signup-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs transition-all cursor-pointer shadow-md mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Creating account...' : 'Create Client Account'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthView('signin')}
                className="text-xs text-[#9A9A9A] hover:text-white"
              >
                Already have an account? <strong className="text-[#00C878]">Sign in</strong>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SPACE OWNER SIGN-UP: List your space on OFIS           */}
        {/* ========================================================= */}
        {authView === 'host_signup' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => setAuthView('signup_landing')}
              className="flex items-center gap-1.5 text-xs text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                List your space on OFIS
              </h2>
              <p className="text-xs text-[#9A9A9A] mt-1">
                Turn your unused or underutilized space into a source of income.
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="host-auth-google-btn"
                disabled={isSubmitting}
                onClick={() => handleSocialAuth('Google', 'host')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2B2B2B] bg-[#171717] hover:bg-[#1E1E1E] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                id="host-auth-apple-btn"
                disabled={isSubmitting}
                onClick={() => handleSocialAuth('Apple', 'host')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2B2B2B] bg-[#171717] hover:bg-[#1E1E1E] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.16-.54 2.79-1.28z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#262626] w-full" />
              <span className="bg-[#111111] px-2.5 text-[10px] font-medium text-[#707070] uppercase tracking-wider whitespace-nowrap">
                or continue with email
              </span>
              <div className="border-t border-[#262626] w-full" />
            </div>

            {/* Host Email Form */}
            <form onSubmit={handleHostSignUpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    id="host-signup-name"
                    placeholder="e.g. Chioma Okafor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Business / Brand Name <span className="text-stone-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="host-signup-business"
                    placeholder="e.g. LeadSpace Studios Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    id="host-signup-email"
                    placeholder="host@studios.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    id="host-signup-phone"
                    placeholder="+234 802 000 1122"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="host-signup-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="host-signup-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs transition-all cursor-pointer shadow-md mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Creating host account...' : 'List My Space'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthView('signin')}
                className="text-xs text-[#9A9A9A] hover:text-white"
              >
                Already have an account? <strong className="text-[#00C878]">Sign in</strong>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. SIGN-IN SCREEN                                         */}
        {/* ========================================================= */}
        {authView === 'signin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <OfisLogo size="md" showTagline={false} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Welcome to OFIS
              </h2>
              <p className="text-xs text-[#9A9A9A] mt-1">
                Find a space. Book it. Get to work.
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="signin-google-btn"
                disabled={isSubmitting}
                onClick={() => handleSocialAuth('Google', 'coworker')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2B2B2B] bg-[#171717] hover:bg-[#1E1E1E] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                id="signin-apple-btn"
                disabled={isSubmitting}
                onClick={() => handleSocialAuth('Apple', 'coworker')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2B2B2B] bg-[#171717] hover:bg-[#1E1E1E] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.16-.54 2.79-1.28z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#262626] w-full" />
              <span className="bg-[#111111] px-2.5 text-[10px] font-medium text-[#707070] uppercase tracking-wider whitespace-nowrap">
                or continue with email
              </span>
              <div className="border-t border-[#262626] w-full" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    id="signin-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="signin-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-stone-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Password reset instructions sent to your email', 'info')}
                  className="text-[11px] text-[#9A9A9A] hover:text-[#00C878]"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                id="signin-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs transition-all cursor-pointer shadow-md mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#222222]">
              <p className="text-xs text-[#9A9A9A]">
                Don't have an account?{' '}
                <button
                  type="button"
                  id="signin-switch-to-signup-btn"
                  onClick={() => setAuthView('signup_landing')}
                  className="text-[#00C878] font-bold hover:underline cursor-pointer ml-1"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. POST SIGN-UP AVATAR PROMPT                             */}
        {/* ========================================================= */}
        {authView === 'avatar_prompt' && (
          <div className="text-center py-2 space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#063B2A] border border-[#00C878]/40 flex items-center justify-center mx-auto text-[#00C878]">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Profile Avatar
              </h2>
              <p className="text-xs text-[#9A9A9A] mt-1 max-w-xs mx-auto">
                Personalize your circular OFIS profile avatar for passes and bookings.
              </p>
            </div>

            <div className="py-2 flex justify-center">
              <div className="w-24 h-24 rounded-full ring-4 ring-[#00C878]/60 overflow-hidden bg-[#1E1E1E] shadow-xl relative">
                <img
                  src={createdUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="avatar-prompt-customize-btn"
                onClick={() => handleFinishAvatarPrompt(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(0,200,120,0.3)] flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Photo / Create Avatar</span>
              </button>

              <button
                type="button"
                id="avatar-prompt-skip-btn"
                onClick={() => handleFinishAvatarPrompt(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
