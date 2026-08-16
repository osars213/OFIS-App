import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Compass
} from 'lucide-react';
import { OfisLogo } from './OfisLogo';
import { useApp } from '../context/AppContext';

interface OfisWelcomeViewProps {
  onContinueToExplore: () => void;
}

/**
 * Dedicated OFIS Sign-In / Welcome Screen
 * Uses OFIS dark visual language, exact logo at top, and clean authentication options.
 */
export const OfisWelcomeView: React.FC<OfisWelcomeViewProps> = ({
  onContinueToExplore,
}) => {
  const { setCurrentUser, showToast } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [userIntent, setUserIntent] = useState<'seeker' | 'host'>('seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentUser({
        id: `usr_${Date.now()}`,
        name: provider === 'Google' ? 'Alex Adebayo' : 'Chidi Okafor',
        email: provider === 'Google' ? 'alex.adebayo@gmail.com' : 'chidi.okafor@icloud.com',
        role: userIntent === 'host' ? 'host' : 'coworker',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        phone: '+234 803 123 4567',
        isVerified: true,
      });
      showToast(`Welcome to OFIS! Signed in with ${provider}`, 'success');
      onContinueToExplore();
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentUser({
        id: `usr_${Date.now()}`,
        name: name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
        email,
        role: userIntent === 'host' ? 'host' : 'coworker',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        phone: phone || '+234 802 000 1122',
        isVerified: true,
      });

      if (mode === 'signup') {
        showToast(
          userIntent === 'host'
            ? `Welcome Host! ${businessName || name} is now registered on OFIS.`
            : 'Welcome to OFIS! Your space seeker account is ready.',
          'success'
        );
      } else {
        showToast('Welcome back to OFIS!', 'success');
      }
      onContinueToExplore();
    }, 900);
  };

  return (
    <div
      id="ofis-welcome-signin-page"
      className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden select-none"
    >
      {/* Background Volumetric Green Light Spill */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00C878]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Sign In Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#111111] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
      >
        {/* Upper Header with exact OFIS Logo */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="mb-3.5">
            <OfisLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'signin' ? 'Welcome to OFIS' : 'Join OFIS Nigeria'}
          </h1>
          <p className="text-sm text-[#9A9A9A] mt-1.5 font-medium">
            {mode === 'signin'
              ? 'Find a space. Book it. Get to work.'
              : 'The doorway to Nigeria’s top workspaces, studios & event spaces.'}
          </p>
        </div>

        {/* Two-Sided Marketplace Switcher for Sign-up */}
        {mode === 'signup' && (
          <div className="mb-5 p-1 bg-[#181818] border border-[#2A2A2A] rounded-2xl grid grid-cols-2 gap-1">
            <button
              type="button"
              id="signup-role-seeker-btn"
              onClick={() => setUserIntent('seeker')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                userIntent === 'seeker'
                  ? 'bg-[#00C878] text-[#0A0A0A] shadow-md'
                  : 'text-[#9A9A9A] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              I'm looking for a space
            </button>
            <button
              type="button"
              id="signup-role-host-btn"
              onClick={() => setUserIntent('host')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                userIntent === 'host'
                  ? 'bg-[#00C878] text-[#0A0A0A] shadow-md'
                  : 'text-[#9A9A9A] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              I own a space
            </button>
          </div>
        )}

        {/* Social Authentication */}
        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            id="welcome-google-auth-btn"
            disabled={isSubmitting}
            onClick={() => handleSocialAuth('Google')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#2C2C2C] bg-[#161616] hover:bg-[#1E1E1E] hover:border-[#3A3A3A] text-white text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            id="welcome-apple-auth-btn"
            disabled={isSubmitting}
            onClick={() => handleSocialAuth('Apple')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#2C2C2C] bg-[#161616] hover:bg-[#1E1E1E] hover:border-[#3A3A3A] text-white text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.16-.54 2.79-1.28z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#262626] w-full" />
          <span className="bg-[#111111] px-3 text-[11px] font-medium text-[#707070] uppercase tracking-wider">
            or
          </span>
          <div className="border-t border-[#262626] w-full" />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="welcome-input-name"
                  placeholder="e.g. Babatunde Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] focus:ring-1 focus:ring-[#00C878] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stone-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && userIntent === 'host' && (
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Business or Space Brand Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="welcome-input-business-name"
                  placeholder="e.g. LeadSpace Studios Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] focus:ring-1 focus:ring-[#00C878] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stone-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                id="welcome-input-email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] focus:ring-1 focus:ring-[#00C878] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stone-600 outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  id="welcome-input-phone"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] focus:ring-1 focus:ring-[#00C878] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stone-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="welcome-input-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#00C878] focus:ring-1 focus:ring-[#00C878] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-stone-600 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          {mode === 'signin' && (
            <div className="flex justify-end">
              <button
                type="button"
                id="welcome-forgot-password-btn"
                onClick={() => showToast('Password reset link sent to your email', 'info')}
                className="text-xs text-[#9A9A9A] hover:text-[#00C878] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Primary Green Button */}
          <button
            type="submit"
            id="welcome-signin-submit-btn"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0A0A0A] font-bold text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(0,200,120,0.35)] hover:shadow-[0_0_25px_rgba(0,200,120,0.5)] flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : userIntent === 'host' ? (
              'Create Host Account'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Switch Sign in vs Sign up */}
        <div className="text-center mt-5 pt-4 border-t border-[#222222]">
          {mode === 'signin' ? (
            <p className="text-xs text-[#9A9A9A]">
              Don't have an account?{' '}
              <button
                type="button"
                id="welcome-switch-to-signup-btn"
                onClick={() => setMode('signup')}
                className="text-[#00C878] font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#9A9A9A]">
              Already have an account?{' '}
              <button
                type="button"
                id="welcome-switch-to-signin-btn"
                onClick={() => setMode('signin')}
                className="text-[#00C878] font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Direct Guest Bypass to Explore */}
        <div className="mt-4 text-center">
          <button
            type="button"
            id="welcome-guest-explore-btn"
            onClick={onContinueToExplore}
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#00C878]" />
            Continue exploring as guest
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
