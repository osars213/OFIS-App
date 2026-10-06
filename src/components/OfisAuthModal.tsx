import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  UserPlus, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFISWordmark } from './OFISWordmark';
import { SavedComparisonsSection } from './compare/SavedComparisonsSection';

export const OfisAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    currentUser, 
    updateCurrentUser, 
    registerUser, 
    loginUser, 
    signInWithGoogle,
    switchUserRole, 
    signOut, 
    isGuest,
    openEmailVerificationModal,
    toggleUserEmailVerification,
    setCurrentView,
    setSelectedSpaceId,
  } = useApp();

  const [authMode, setAuthMode] = useState<'signup' | 'login' | 'profile'>('signup');

  // Sign up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+234 ');
  const [signupRole, setSignupRole] = useState<'user' | 'host'>('user');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Login state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileCompany, setProfileCompany] = useState(currentUser.company || '');

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state when modal opens or active user changes
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalTab) {
        setAuthMode(authModalTab);
      } else if (isGuest) {
        setAuthMode('signup');
      } else {
        setAuthMode('profile');
      }
      setStatusMessage(null);
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
      setProfileCompany(currentUser.company || '');
    }
  }, [isAuthModalOpen, authModalTab, currentUser, isGuest]);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      setIsSubmitting(false);
      setStatusMessage({ text: 'Signed in with Google successfully.', type: 'success' });
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 900);
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage({ text: err?.message || 'Google authentication error', type: 'error' });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const name = signupName.trim();
    const email = signupEmail.trim().toLowerCase();
    const phone = signupPhone.trim();

    if (!name || name.length < 2) {
      setStatusMessage({ text: 'Please enter your full name (minimum 2 characters).', type: 'error' });
      return;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatusMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUser({
        name,
        email,
        phone: phone || '+234 800 000 0000',
        role: signupRole,
        company: signupCompany.trim(),
        password: signupPassword.trim(),
        avatar: '',
      });

      setIsSubmitting(false);

      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupCompany('');
        setTimeout(() => {
          setStatusMessage(null);
          setIsAuthModalOpen(false);
        }, 1100);
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage({ text: err?.message || 'Registration failed', type: 'error' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const query = loginEmailOrPhone.trim();
    if (!query) {
      setStatusMessage({ text: 'Please enter your registered email or phone number.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginUser(query, loginPassword.trim());
      setIsSubmitting(false);

      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
        setLoginEmailOrPhone('');
        setLoginPassword('');
        setTimeout(() => {
          setStatusMessage(null);
          setIsAuthModalOpen(false);
        }, 900);
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage({ text: err?.message || 'Login failed', type: 'error' });
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setStatusMessage({ text: 'Full name cannot be empty.', type: 'error' });
      return;
    }
    updateCurrentUser({
      name: profileName.trim(),
      email: profileEmail.trim().toLowerCase(),
      phone: profilePhone.trim(),
      company: profileCompany.trim(),
    });
    setStatusMessage({ text: 'Profile changes saved successfully!', type: 'success' });
    setTimeout(() => {
      setStatusMessage(null);
      setIsAuthModalOpen(false);
    }, 900);
  };

  const switchTab = (mode: 'signup' | 'login' | 'profile') => {
    setAuthMode(mode);
    setAuthModalTab(mode);
    setStatusMessage(null);
  };

  return (
    <div 
      id="ofis-auth-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div 
        id="ofis-auth-modal-dialog"
        className="relative w-full max-w-lg bg-white dark:bg-[#07383D] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl p-6 sm:p-7 space-y-5 text-[#12383B] dark:text-white transition-colors duration-150"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2ECEB] dark:border-[#166D74] pb-4">
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => {
                setIsAuthModalOpen(false);
                setCurrentView('explore');
                setSelectedSpaceId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer transition-transform hover:opacity-90 flex items-center"
              title="Return to Home / Explore"
            >
              <OFISWordmark size="sm" />
            </div>
            <div className="hidden sm:block h-4 w-px bg-[#E2ECEB] dark:bg-[#166D74]" />
            <span className="text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0]">
              {authMode === 'signup' ? 'Create Account' : authMode === 'login' ? 'Welcome Back' : 'Account Profile'}
            </span>
          </div>
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher with Uniform Brand Styling */}
        <div className={`grid ${isGuest ? 'grid-cols-2' : 'grid-cols-3'} p-1 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold`}>
          <button
            id="auth-tab-signup-btn"
            type="button"
            onClick={() => switchTab('signup')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'signup' 
                ? 'bg-[#14BEB8] text-white font-bold shadow-xs' 
                : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#FFA987]" />
            <span>Sign Up</span>
          </button>

          <button
            id="auth-tab-login-btn"
            type="button"
            onClick={() => switchTab('login')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'login' 
                ? 'bg-[#14BEB8] text-white font-bold shadow-xs' 
                : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
            }`}
          >
            <span>Sign In</span>
          </button>

          {!isGuest && (
            <button
              id="auth-tab-profile-btn"
              type="button"
              onClick={() => switchTab('profile')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                authMode === 'profile' 
                  ? 'bg-[#14BEB8] text-white font-bold shadow-xs' 
                  : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          )}
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div 
            id="auth-status-alert"
            className={`p-3 rounded-2xl text-xs flex items-center space-x-2 border transition-all ${
              statusMessage.type === 'success' 
                ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border-[#14BEB8]/40 text-[#006B70] dark:text-[#28D2CB]' 
                : 'bg-red-50 dark:bg-red-950/30 border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FFA987]" /> : <X className="w-4 h-4 shrink-0" />}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SIGN UP (MODERNIZED NEW USER REGISTRATION)                             */}
        {/* ========================================================================= */}
        {authMode === 'signup' && (
          <div className="space-y-4">
            
            {/* Quick 1-Tap Google Sign-In */}
            <button
              type="button"
              id="signup-google-btn"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#FFA987]/60 text-xs font-bold text-[#12383B] dark:text-white transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-2xs active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex-1 h-px bg-[#E2ECEB] dark:bg-[#166D74]" />
              <span className="text-[11px] font-medium text-[#5D7A7D] dark:text-[#B8D1D0]">or register with email</span>
              <div className="flex-1 h-px bg-[#E2ECEB] dark:bg-[#166D74]" />
            </div>

            <form id="signup-form" onSubmit={handleSignUp} className="space-y-3.5">
              
              {/* Account Role Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Account Type</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="signup-role-member-btn"
                    type="button"
                    onClick={() => setSignupRole('user')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      signupRole === 'user'
                        ? 'bg-[#FFD0BD]/25 dark:bg-[#FFA987]/15 border-[#FFA987] ring-1 ring-[#FFA987]/40 text-[#12383B] dark:text-white shadow-2xs'
                        : 'bg-white dark:bg-[#0B4A50] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:border-[#FFA987]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Briefcase className={`w-4 h-4 ${signupRole === 'user' ? 'text-[#FFA987]' : 'text-[#5D7A7D] dark:text-[#B8D1D0]'}`} />
                      <span className="text-xs font-bold">Workspace Member</span>
                    </div>
                    <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-1">Book desks, meeting pods & studios</p>
                  </button>

                  <button
                    id="signup-role-host-btn"
                    type="button"
                    onClick={() => setSignupRole('host')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      signupRole === 'host'
                        ? 'bg-[#FFD0BD]/25 dark:bg-[#FFA987]/15 border-[#FFA987] ring-1 ring-[#FFA987]/40 text-[#12383B] dark:text-white shadow-2xs'
                        : 'bg-white dark:bg-[#0B4A50] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:border-[#FFA987]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className={`w-4 h-4 ${signupRole === 'host' ? 'text-[#FFA987]' : 'text-[#5D7A7D] dark:text-[#B8D1D0]'}`} />
                      <span className="text-xs font-bold">Space Host</span>
                    </div>
                    <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-1">List spaces & receive payouts</p>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                  <input
                    id="signup-name-input"
                    type="text"
                    placeholder="e.g. Oluwaseun Adeleke"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                  <input
                    id="signup-email-input"
                    type="email"
                    placeholder="name@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                  />
                </div>
              </div>

              {/* Phone & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#12383B] dark:text-white">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                    <input
                      id="signup-phone-input"
                      type="tel"
                      placeholder="+234 802 000 0000"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#12383B] dark:text-white">Company (Optional)</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                    <input
                      id="signup-company-input"
                      type="text"
                      placeholder="e.g. Remote, Studio"
                      value={signupCompany}
                      onChange={(e) => setSignupCompany(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                  <input
                    id="signup-password-input"
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-2.5 text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>
                  {isSubmitting 
                    ? 'Creating Account...' 
                    : signupRole === 'host' 
                      ? 'Register Host Account' 
                      : 'Create Account'}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SIGN IN (CLEAN & NON-REDUNDANT)                                         */}
        {/* ========================================================================= */}
        {authMode === 'login' && (
          <div className="space-y-4">
            
            {/* Quick 1-Tap Google Sign-In */}
            <button
              type="button"
              id="login-google-btn"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#FFA987]/60 text-xs font-bold text-[#12383B] dark:text-white transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-2xs active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex-1 h-px bg-[#E2ECEB] dark:bg-[#166D74]" />
              <span className="text-[11px] font-medium text-[#5D7A7D] dark:text-[#B8D1D0]">or sign in with email/phone</span>
              <div className="flex-1 h-px bg-[#E2ECEB] dark:bg-[#166D74]" />
            </div>

            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Email Address or Phone Number</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                  <input
                    id="login-email-input"
                    type="text"
                    placeholder="e.g. tunde.adeyemi@paystack.com or +234 802 345 6789"
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#FFA987]" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#8DA3A2] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA - Clean, No Repeated Icon */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to OFIS'}</span>
              </button>

              {/* Fast Demo Switches */}
              <div className="pt-3 border-t border-[#E2ECEB] dark:border-[#166D74] space-y-2">
                <div className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-medium">Quick 1-Tap Demo Logins:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="quick-demo-user-btn"
                    type="button"
                    onClick={async () => {
                      await loginUser('tunde.adeyemi@paystack.com', 'Password123!');
                      setStatusMessage({ text: 'Authenticated as Babatunde Adeyemi', type: 'success' });
                      setTimeout(() => setIsAuthModalOpen(false), 800);
                    }}
                    className="p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#FFA987]/60 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="text-xs font-bold text-[#12383B] dark:text-white">Babatunde (Member)</div>
                    <div className="text-[10px] text-[#006B70] dark:text-[#FFA987] font-semibold">Paystack Engineer</div>
                  </button>

                  <button
                    id="quick-demo-host-btn"
                    type="button"
                    onClick={async () => {
                      await loginUser('funke@creativespace.ng', 'Password123!');
                      setStatusMessage({ text: 'Authenticated as Funke Akindele-Cole', type: 'success' });
                      setTimeout(() => setIsAuthModalOpen(false), 800);
                    }}
                    className="p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#FFA987]/60 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="text-xs font-bold text-[#12383B] dark:text-white">Funke (Host)</div>
                    <div className="text-[10px] text-[#006B70] dark:text-[#FFA987] font-semibold">VI Hub Operator</div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PROFILE & CREDENTIALS                                                  */}
        {/* ========================================================================= */}
        {authMode === 'profile' && (
          <form id="profile-form" onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74]">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFA987]/20 border border-[#FFA987]/40 text-[#006B70] dark:text-[#FFA987] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#FFA987]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#12383B] dark:text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-[#006B70] dark:text-[#FFA987] font-mono uppercase font-bold flex items-center space-x-1">
                    <span>{currentUser.role} Account</span>
                    <span>•</span>
                    <span>₦{(currentUser.walletBalanceNgn || 0).toLocaleString()} Balance</span>
                  </div>
                </div>
              </div>

              {!isGuest ? (
                <button
                  id="profile-signout-btn"
                  type="button"
                  onClick={() => {
                    signOut();
                    setAuthMode('login');
                    setStatusMessage({ text: 'Signed out of OFIS session.', type: 'success' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="px-3 py-1.5 rounded-xl bg-[#14BEB8]/15 border border-[#14BEB8]/40 text-xs font-bold text-[#006B70] dark:text-[#28D2CB] flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#12383B] dark:text-white">Full Name</label>
              <input
                id="profile-name-input"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#FFA987]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Email Address</label>
                {currentUser?.isEmailVerified ? (
                  <span className="text-[10px] text-[#006B70] dark:text-[#FFA987] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#FFA987]" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-[#C05621] dark:text-[#FFA987] font-bold flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>
              <input
                id="profile-email-input"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#FFA987]"
              />
            </div>

            {/* Email Verification Status Card */}
            <div className="p-3 rounded-2xl border text-xs space-y-2 bg-[#FFA987]/15 dark:bg-[#FFA987]/10 border-[#FFA987]/30 text-[#12383B] dark:text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {currentUser?.isEmailVerified ? (
                    <ShieldCheck className="w-4 h-4 text-[#FFA987]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#FFA987]" />
                  )}
                  <span className="font-bold text-xs">
                    {currentUser?.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {!currentUser?.isEmailVerified ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthModalOpen(false);
                        openEmailVerificationModal('general');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FFA987] hover:bg-[#ff966f] text-[#006B70] font-extrabold text-[10px] cursor-pointer"
                    >
                      Verify Now
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#006B70] dark:text-[#28D2CB] font-mono">
                      {currentUser?.emailVerifiedAt ? `Verified ${new Date(currentUser.emailVerifiedAt).toLocaleDateString()}` : 'Active'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleUserEmailVerification()}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-[#07383D] hover:bg-[#F3F6F5] border border-[#E2ECEB] dark:border-[#166D74] text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white font-mono cursor-pointer"
                    title="Toggle verification state for testing"
                  >
                    Toggle
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">
                {currentUser?.isEmailVerified 
                  ? 'Your email is verified. You have full access to list workspaces and pay for turnstile passes.'
                  : 'Policy: Users cannot list new spaces or make pass payments until email is verified.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Phone Number</label>
                <input
                  id="profile-phone-input"
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#FFA987]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#12383B] dark:text-white">Company</label>
                <input
                  id="profile-company-input"
                  type="text"
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#FFA987]"
                />
              </div>
            </div>

            {/* Saved Comparisons Section */}
            <div className="pt-3 border-t border-[#E2ECEB] dark:border-[#166D74]">
              <SavedComparisonsSection
                compact
                onSelectComparison={() => {
                  setIsAuthModalOpen(false);
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2ECEB] dark:border-[#166D74]">
              <button
                id="profile-toggle-role-btn"
                type="button"
                onClick={() => switchUserRole(currentUser.role === 'host' ? 'user' : 'host')}
                className="text-xs font-semibold text-[#006B70] dark:text-[#28D2CB] hover:underline cursor-pointer"
              >
                Switch to {currentUser.role === 'host' ? 'Member Mode' : 'Host Mode'}
              </button>

              <button
                id="profile-save-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs shadow-md cursor-pointer active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
