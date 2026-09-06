import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Check, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Wallet, 
  ArrowRight,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

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
    switchUserRole, 
    signOut, 
    isGuest,
    openEmailVerificationModal,
    verifyUserEmail,
    toggleUserEmailVerification,
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
  const [signupAvatar, setSignupAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');

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

  const AVATAR_OPTIONS = [
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Tech Lead' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', label: 'Engineer' },
    { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', label: 'Operator' },
    { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', label: 'Creative' },
  ];

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
        avatar: signupAvatar,
      });

      setIsSubmitting(false);

      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
        // Clear sign up fields
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div 
        id="ofis-auth-modal-dialog"
        className="relative w-full max-w-lg bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 sm:p-7 space-y-5"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2]">
                {authMode === 'signup' ? 'Create OFIS Account' : authMode === 'login' ? 'Sign In to OFIS' : 'Account & Pass Credentials'}
              </h3>
              <p className="text-xs text-[#718079]">Vetted workspaces, instant digital passes & host operations</p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs font-semibold">
          <button
            id="auth-tab-signup-btn"
            type="button"
            onClick={() => switchTab('signup')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'signup' 
                ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-md' 
                : 'text-[#718079] hover:text-[#F2F2F2]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>

          <button
            id="auth-tab-login-btn"
            type="button"
            onClick={() => switchTab('login')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'login' 
                ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-md' 
                : 'text-[#718079] hover:text-[#F2F2F2]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>

          <button
            id="auth-tab-profile-btn"
            type="button"
            onClick={() => switchTab('profile')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'profile' 
                ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-md' 
                : 'text-[#718079] hover:text-[#F2F2F2]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div 
            id="auth-status-alert"
            className={`p-3 rounded-2xl text-xs flex items-center space-x-2 border transition-all ${
              statusMessage.type === 'success' 
                ? 'bg-[#00C878]/15 border-[#00C878]/30 text-[#00C878]' 
                : 'bg-[#FF5C5C]/15 border-[#FF5C5C]/30 text-[#FF8585]'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SIGN UP (NEW USER REGISTRATION)                                        */}
        {/* ========================================================================= */}
        {authMode === 'signup' && (
          <form id="signup-form" onSubmit={handleSignUp} className="space-y-4">
            
            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F2F2F2]">Account Type & Purpose</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="signup-role-member-btn"
                  type="button"
                  onClick={() => setSignupRole('user')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    signupRole === 'user'
                      ? 'bg-[#00C878]/10 border-[#00C878] text-[#F2F2F2]'
                      : 'bg-[#18201B] border-[#232D28] text-[#718079] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Briefcase className={`w-4 h-4 ${signupRole === 'user' ? 'text-[#00C878]' : 'text-[#718079]'}`} />
                    <span className="text-xs font-bold">Workspace Member</span>
                  </div>
                  <p className="text-[10px] text-[#718079] mt-1">Book desks, meeting rooms & receive ₦25,000 credit</p>
                </button>

                <button
                  id="signup-role-host-btn"
                  type="button"
                  onClick={() => setSignupRole('host')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    signupRole === 'host'
                      ? 'bg-[#00C878]/10 border-[#00C878] text-[#F2F2F2]'
                      : 'bg-[#18201B] border-[#232D28] text-[#718079] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className={`w-4 h-4 ${signupRole === 'host' ? 'text-[#00C878]' : 'text-[#718079]'}`} />
                    <span className="text-xs font-bold">Hub Operator / Host</span>
                  </div>
                  <p className="text-[10px] text-[#718079] mt-1">List spaces, check in guests & receive Naira payouts</p>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                <input
                  id="signup-name-input"
                  type="text"
                  placeholder="e.g. Oluwaseun Adeleke"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                <input
                  id="signup-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Phone & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    placeholder="+234 802 000 0000"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Company / Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                  <input
                    id="signup-company-input"
                    type="text"
                    placeholder="e.g. Paystack, Remote, Studio"
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F2F2F2]">Choose Profile Avatar</label>
              <div className="flex items-center space-x-3">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.url}
                    type="button"
                    onClick={() => setSignupAvatar(av.url)}
                    className={`relative rounded-full transition-all cursor-pointer ${
                      signupAvatar === av.url ? 'ring-2 ring-[#00C878] scale-105' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-10 h-10 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                <input
                  id="signup-password-input"
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-2.5 text-[#718079] hover:text-[#F2F2F2] cursor-pointer"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? 'Registering Account...' 
                  : signupRole === 'host' 
                    ? 'Create Host Account & Setup Listings' 
                    : 'Create Account & Claim ₦25,000 Welcome Credit'}
              </span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 2. LOG IN                                                                 */}
        {/* ========================================================================= */}
        {authMode === 'login' && (
          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Email Address or Phone Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                <input
                  id="login-email-input"
                  type="text"
                  placeholder="e.g. tunde.adeyemi@paystack.com or +234 802 345 6789"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#718079]" />
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-[#718079] hover:text-[#F2F2F2] cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to OFIS'}</span>
            </button>

            {/* Fast Demo Switches */}
            <div className="pt-3 border-t border-[#1E2522] space-y-2">
              <div className="text-[11px] text-[#718079] font-medium">Quick 1-Tap Demo Logins:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="quick-demo-user-btn"
                  type="button"
                  onClick={() => {
                    loginUser('tunde.adeyemi@paystack.com');
                    setStatusMessage({ text: 'Logged in as Babatunde Adeyemi (User)', type: 'success' });
                    setTimeout(() => setIsAuthModalOpen(false), 800);
                  }}
                  className="p-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#F2F2F2]">Babatunde (User)</div>
                  <div className="text-[10px] text-[#00C878]">Paystack Engineer • ₦45,000</div>
                </button>

                <button
                  id="quick-demo-host-btn"
                  type="button"
                  onClick={() => {
                    loginUser('funke@creativespace.ng');
                    setStatusMessage({ text: 'Logged in as Funke Akindele-Cole (Host)', type: 'success' });
                    setTimeout(() => setIsAuthModalOpen(false), 800);
                  }}
                  className="p-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#F2F2F2]">Funke (Host)</div>
                  <div className="text-[10px] text-[#00C878]">VI Hub Operator • ₦380,000</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 3. PROFILE & CREDENTIALS                                                  */}
        {/* ========================================================================= */}
        {authMode === 'profile' && (
          <form id="profile-form" onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18201B] border border-[#232D28]">
              <div className="flex items-center space-x-3">
                <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00C878]" />
                <div>
                  <div className="text-xs font-bold text-[#F2F2F2]">{currentUser.name}</div>
                  <div className="text-[10px] text-[#00C878] font-mono uppercase font-bold flex items-center space-x-1">
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
                  className="px-3 py-1.5 rounded-xl bg-[#2D1616] hover:bg-[#3D1A1A] border border-[#FF5C5C]/30 text-xs font-bold text-[#FF8585] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#FF5C5C]" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="px-3 py-1.5 rounded-xl bg-[#00C878]/15 border border-[#00C878]/30 text-xs font-bold text-[#00C878] flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Full Name</label>
              <input
                id="profile-name-input"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F2F2F2]">Email Address</label>
                {currentUser?.isEmailVerified ? (
                  <span className="text-[10px] text-[#00C878] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified (List & Pay Active)</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-[#FFB800] font-bold flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unverified (Gated)</span>
                  </span>
                )}
              </div>
              <input
                id="profile-email-input"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
              />
            </div>

            {/* Email Verification Status Card */}
            <div className={`p-3 rounded-2xl border text-xs space-y-2 ${
              currentUser?.isEmailVerified 
                ? 'bg-[#00C878]/10 border-[#00C878]/30 text-[#F2F2F2]' 
                : 'bg-[#FFB800]/10 border-[#FFB800]/30 text-[#F2F2F2]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {currentUser?.isEmailVerified ? (
                    <ShieldCheck className="w-4 h-4 text-[#00C878]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#FFB800]" />
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
                      className="px-2.5 py-1 rounded-lg bg-[#FFB800] hover:bg-[#FFC72C] text-[#0D0D0D] font-extrabold text-[10px] cursor-pointer"
                    >
                      Verify Now
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#00C878] font-mono">
                      {currentUser?.emailVerifiedAt ? `Verified ${new Date(currentUser.emailVerifiedAt).toLocaleDateString()}` : 'Active'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleUserEmailVerification()}
                    className="px-2 py-1 rounded-lg bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-[10px] text-[#9EABA3] hover:text-[#F2F2F2] font-mono cursor-pointer"
                    title="Toggle verification state for testing"
                  >
                    Toggle
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#9EABA3]">
                {currentUser?.isEmailVerified 
                  ? 'Your email is verified. You have full access to list workspaces and pay for turnstile passes.'
                  : 'Policy: Users cannot list new spaces or make pass payments until email is verified.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Phone Number</label>
                <input
                  id="profile-phone-input"
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F2F2F2]">Company</label>
                <input
                  id="profile-company-input"
                  type="text"
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                />
              </div>
            </div>

            {/* Saved Comparisons Section */}
            <div className="pt-3 border-t border-[#1E2522]">
              <SavedComparisonsSection
                compact
                onSelectComparison={() => {
                  setIsAuthModalOpen(false);
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1E2522]">
              <button
                id="profile-toggle-role-btn"
                type="button"
                onClick={() => switchUserRole(currentUser.role === 'host' ? 'user' : 'host')}
                className="text-xs font-semibold text-[#00C878] hover:underline cursor-pointer"
              >
                Switch to {currentUser.role === 'host' ? 'Member Mode' : 'Host Mode'}
              </button>

              <button
                id="profile-save-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md cursor-pointer"
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

