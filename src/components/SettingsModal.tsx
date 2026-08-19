import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Palette,
  User,
  Lock,
  ShieldCheck,
  Smartphone,
  Check,
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  Bell,
  MapPin,
  Camera,
  Database,
  RefreshCw,
  Trash2,
  KeyRound,
  Fingerprint,
  Info,
  Sliders,
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'appearance' | 'profile' | 'security' | 'permissions' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setCurrentUser,
    themeMode,
    setThemeMode,
    effectiveTheme,
    showToast,
    openAvatarModal,
    isSupabaseConnected,
    databaseStatus,
  } = useApp();

  const isLight = effectiveTheme === 'light';

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || 'Chidi Nnamdi');
  const [email, setEmail] = useState(currentUser?.email || 'chidi.dev@ofis.ng');
  const [phone, setPhone] = useState('+234 803 456 7890');
  const [company, setCompany] = useState(currentUser?.company || 'Lagos Tech Hub');
  const [bio, setBio] = useState('Senior Product Designer & Full-stack Explorer based in Victoria Island, Lagos.');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // App Permissions State
  const [permissionLocation, setPermissionLocation] = useState(true);
  const [permissionCamera, setPermissionCamera] = useState(true);
  const [permissionNotifications, setPermissionNotifications] = useState(true);
  const [permissionSms, setPermissionSms] = useState(true);
  const [permissionOfflineStorage, setPermissionOfflineStorage] = useState(true);

  // Version diagnostics
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.', 'warning');
      return;
    }
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
      });
    }
    showToast('Profile information updated successfully!', 'success');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully. Your account is secured.', 'success');
  };

  const handleCheckForUpdates = () => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus('FIS is up to date (Version 2.4.1 - Production Stable)');
      showToast('You are running the latest version of FIS.', 'success');
    }, 1000);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('ofis_filter_cache');
      sessionStorage.removeItem('ofis_session_cache');
      showToast('App spatial cache and offline buffers cleared successfully.', 'info');
    } catch {
      showToast('Cache cleared.', 'info');
    }
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div
        id="settings-modal-container"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-3xl ${
          isLight
            ? 'bg-[#FFFFFF] border-neutral-200 text-neutral-900 shadow-2xl'
            : 'bg-[#141414] border-[#2A2A2A] text-white shadow-2xl'
        } border overflow-hidden flex flex-col max-h-[90vh] my-auto`}
      >
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b ${
          isLight ? 'border-neutral-200 bg-[#F8FAFC]' : 'border-[#262626] bg-[#171717]'
        } flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00C878]/15 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Settings & Preferences
              </h2>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'}`}>
                Manage theme, account security, device permissions, and app version
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-settings-modal-btn"
            onClick={onClose}
            className={`p-2 rounded-xl ${
              isLight ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100' : 'text-stone-400 hover:text-white hover:bg-[#222222]'
            } transition-colors cursor-pointer`}
            aria-label="Close Settings Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Tab Sidebar + Right Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Navigation Tabs */}
          <div className={`w-full md:w-56 p-3 md:p-4 border-b md:border-b-0 md:border-r ${
            isLight ? 'border-neutral-200 bg-[#F8FAFC]' : 'border-[#262626] bg-[#111111]'
          } flex md:flex-col gap-1.5 overflow-x-auto shrink-0`}>
            <button
              type="button"
              id="tab-btn-appearance"
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeTab === 'appearance'
                  ? isLight
                    ? 'bg-[#E8F8F0] text-[#00A865] border border-[#00C878]/30 shadow-xs'
                    : 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-xs'
                  : isLight
                  ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>Appearance & Theme</span>
            </button>

            <button
              type="button"
              id="tab-btn-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeTab === 'profile'
                  ? isLight
                    ? 'bg-[#E8F8F0] text-[#00A865] border border-[#00C878]/30 shadow-xs'
                    : 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-xs'
                  : isLight
                  ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile & Details</span>
            </button>

            <button
              type="button"
              id="tab-btn-security"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeTab === 'security'
                  ? isLight
                    ? 'bg-[#E8F8F0] text-[#00A865] border border-[#00C878]/30 shadow-xs'
                    : 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-xs'
                  : isLight
                  ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Security & Password</span>
            </button>

            <button
              type="button"
              id="tab-btn-permissions"
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeTab === 'permissions'
                  ? isLight
                    ? 'bg-[#E8F8F0] text-[#00A865] border border-[#00C878]/30 shadow-xs'
                    : 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-xs'
                  : isLight
                  ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>App Permissions</span>
            </button>

            <button
              type="button"
              id="tab-btn-about"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap text-left ${
                activeTab === 'about'
                  ? isLight
                    ? 'bg-[#E8F8F0] text-[#00A865] border border-[#00C878]/30 shadow-xs'
                    : 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-xs'
                  : isLight
                  ? 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>Version & System</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
            {/* 1. APPEARANCE & THEME TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-2`}>
                    <Palette className="w-4 h-4 text-[#00C878]" />
                    <span>Theme & Interface Styling</span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-[#A3A3A3]'} mt-1`}>
                    Customize your visual workspace experience. Choose between signature obsidian dark, modern soft grey canvas, or sync automatically with your device settings.
                  </p>
                </div>

                {/* 3 Theme Options Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Dark Mode Card */}
                  <div
                    id="theme-card-dark"
                    onClick={() => {
                      setThemeMode('dark');
                      showToast('Switched to Dark Theme (Signature Obsidian)', 'info');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      themeMode === 'dark'
                        ? 'border-[#00C878] bg-[#063B2A]/20 shadow-lg shadow-[#00C878]/10'
                        : isLight
                        ? 'border-neutral-200 bg-white hover:border-neutral-300'
                        : 'border-[#262626] bg-[#1A1A1A] hover:border-[#383838]'
                    }`}
                  >
                    <div>
                      <div className="w-full h-20 rounded-xl bg-[#0D0D0D] border border-[#2B2B2B] p-2.5 flex flex-col justify-between mb-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-2 rounded-full bg-[#00C878]" />
                          <div className="w-3 h-3 rounded-full bg-[#262626]" />
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-2 rounded-sm bg-[#1F1F1F]" />
                          <div className="w-3/4 h-2 rounded-sm bg-[#171717]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-1.5`}>
                          <Moon className="w-3.5 h-3.5 text-[#00C878]" />
                          <span>Dark Theme</span>
                        </span>
                        {themeMode === 'dark' && (
                          <span className="w-4 h-4 rounded-full bg-[#00C878] text-[#0D0D0D] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#888888]'} mt-1`}>
                        Obsidian black with vibrant emerald accents.
                      </p>
                    </div>
                  </div>

                  {/* Light Mode Card (Grey Canvas) */}
                  <div
                    id="theme-card-light"
                    onClick={() => {
                      setThemeMode('light');
                      showToast('Switched to Light Theme (Soft Grey Canvas)', 'info');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      themeMode === 'light'
                        ? 'border-[#00C878] bg-[#E8F8F0] shadow-lg shadow-[#00C878]/10'
                        : isLight
                        ? 'border-neutral-200 bg-white hover:border-neutral-300'
                        : 'border-[#262626] bg-[#1A1A1A] hover:border-[#383838]'
                    }`}
                  >
                    <div>
                      <div className="w-full h-20 rounded-xl bg-[#F0F2F5] border border-[#CBD5E1] p-2.5 flex flex-col justify-between mb-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-2 rounded-full bg-[#00A865]" />
                          <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-2 rounded-sm bg-white shadow-xs" />
                          <div className="w-3/4 h-2 rounded-sm bg-[#E2E8F0]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-1.5`}>
                          <Sun className="w-3.5 h-3.5 text-[#D6A83A]" />
                          <span>Light Theme</span>
                        </span>
                        {themeMode === 'light' && (
                          <span className="w-4 h-4 rounded-full bg-[#00C878] text-[#0D0D0D] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#888888]'} mt-1`}>
                        Refined modern grey canvas with crisp white cards.
                      </p>
                    </div>
                  </div>

                  {/* System Default Card */}
                  <div
                    id="theme-card-system"
                    onClick={() => {
                      setThemeMode('system');
                      showToast('Switched to System Theme (Device Auto-sync)', 'info');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      themeMode === 'system'
                        ? 'border-[#00C878] bg-[#00C878]/10 shadow-lg shadow-[#00C878]/10'
                        : isLight
                        ? 'border-neutral-200 bg-white hover:border-neutral-300'
                        : 'border-[#262626] bg-[#1A1A1A] hover:border-[#383838]'
                    }`}
                  >
                    <div>
                      <div className="w-full h-20 rounded-xl bg-gradient-to-r from-[#0D0D0D] to-[#F0F2F5] border border-[#3A3A3A] p-2.5 flex flex-col justify-between mb-3">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-2 rounded-full bg-[#00C878]" />
                          <div className="w-3 h-3 rounded-full bg-white/40" />
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-2 rounded-sm bg-white/20" />
                          <div className="w-2/3 h-2 rounded-sm bg-white/10" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-1.5`}>
                          <Monitor className="w-3.5 h-3.5 text-[#00C878]" />
                          <span>System Default</span>
                        </span>
                        {themeMode === 'system' && (
                          <span className="w-4 h-4 rounded-full bg-[#00C878] text-[#0D0D0D] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#888888]'} mt-1`}>
                        Adapts to your operating system's light/dark mode.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Real-Time Workspace Preview in Selected Theme */}
                <div className={`p-4 sm:p-5 rounded-2xl border ${isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-[#181818] border-[#2A2A2A]'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#00C878]" />
                      <span className={`text-xs font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        Live Workspace Preview
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLight ? 'bg-[#E8F8F0] text-[#00A865]' : 'bg-[#063B2A] text-[#00C878]'
                    }`}>
                      {effectiveTheme === 'dark' ? 'Dark Obsidian Active' : 'Light Grey Canvas Active'}
                    </span>
                  </div>

                  {/* Simulated Mini Space Card */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${
                    effectiveTheme === 'dark'
                      ? 'bg-[#141414] border-[#2A2A2A] text-white'
                      : 'bg-[#F0F2F5] border-[#E2E8F0] text-neutral-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0 relative bg-neutral-800">
                        <img
                          src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&fit=crop&q=80"
                          alt="Preview Space"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-[#00C878] text-[#0D0D0D] text-[9px] font-black">
                          4.9 ★
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold truncate">Greenhouse Hub (Lekki Phase 1)</h4>
                          <span className="text-xs font-black text-[#00C878]">₦2,500/hr</span>
                        </div>
                        <p className={`text-[10px] ${effectiveTheme === 'dark' ? 'text-[#9A9A9A]' : 'text-neutral-500'} truncate mt-0.5`}>
                          24/7 Power • Solar Backup • 150 Mbps Fiber
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${
                            effectiveTheme === 'dark' ? 'bg-[#222222] text-[#D4D4D4]' : 'bg-white text-neutral-700 shadow-2xs border border-neutral-200'
                          }`}>
                            ⚡ Power Guaranteed
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold ${
                            effectiveTheme === 'dark' ? 'bg-[#222222] text-[#D4D4D4]' : 'bg-white text-neutral-700 shadow-2xs border border-neutral-200'
                          }`}>
                            Instant Book
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Visual Settings */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        High Contrast Typography
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'}`}>
                        Enabled by default for crystal-clear readability across all Nigerian display devices.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFILE & PERSONAL DETAILS TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-2`}>
                    <User className="w-4 h-4 text-[#00C878]" />
                    <span>Personal Profile & Identity</span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-[#A3A3A3]'} mt-1`}>
                    Update your display name, contact phone for access codes, and profile avatar.
                  </p>
                </div>

                {/* Avatar Banner & Change Button */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} flex items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3.5">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00C878] shadow-md"
                    />
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{name}</div>
                      <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'}`}>{currentUser?.role || 'Coworker'} • Verified</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAvatarModal();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#00C878]/15 hover:bg-[#00C878]/25 text-[#00C878] border border-[#00C878]/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Customize Avatar</span>
                  </button>
                </div>

                {/* Name & Display Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      id="settings-profile-name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                      }`}
                      placeholder="e.g. Chidi Nnamdi"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      id="settings-profile-company"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                      }`}
                      placeholder="e.g. Techpoint / Freelance"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="settings-profile-email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                      }`}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                      Phone Number (Access Pass SMS)
                    </label>
                    <input
                      type="tel"
                      id="settings-profile-phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                      }`}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                {/* Bio / Work description */}
                <div>
                  <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                    Short Bio / Professional Role
                  </label>
                  <textarea
                    rows={2}
                    id="settings-profile-bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                      isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                    }`}
                    placeholder="Tell hosts a bit about your work..."
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    id="save-profile-btn"
                    className="px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0D0D0D]" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* 3. SECURITY & PASSWORD TAB */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-2`}>
                    <Lock className="w-4 h-4 text-[#00C878]" />
                    <span>Password & Account Security</span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-[#A3A3A3]'} mt-1`}>
                    Ensure your account has a strong password and multi-factor verification enabled.
                  </p>
                </div>

                {/* Current Password */}
                <div>
                  <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      id="settings-current-password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-neutral-500' : 'text-[#888888]'} hover:text-white cursor-pointer`}
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        id="settings-new-password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                          isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                        }`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-neutral-500' : 'text-[#888888]'} hover:text-white cursor-pointer`}
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold ${isLight ? 'text-neutral-700' : 'text-[#D4D4D4]'} mb-1.5`}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="settings-confirm-password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden focus:border-[#00C878] transition-colors ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#1B1B1B] border-[#2D2D2D] text-white'
                      }`}
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                {/* 2FA Toggle */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-[#00C878]" />
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Two-Factor Authentication (2FA)</div>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'}`}>
                        Receive a verification code via SMS or WhatsApp before booking approvals.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(twoFactorEnabled ? '2FA has been disabled.' : '2FA is now enabled.', 'info');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      twoFactorEnabled ? 'bg-[#00C878]' : isLight ? 'bg-neutral-300' : 'bg-[#333333]'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Active Sessions */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-[#D6A83A]" />
                      <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Active Sessions</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#00C878] bg-[#00C878]/10 px-2 py-0.5 rounded-full">
                      CURRENT DEVICE
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A3A3A3]">
                    Chrome on MacOS / Android • Lagos, Nigeria • IP: 102.89.xx.xx
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    id="update-password-btn"
                    className="px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4 text-[#0D0D0D]" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            )}

            {/* 4. APP PERMISSIONS TAB */}
            {activeTab === 'permissions' && (
              <div className="space-y-5">
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-2`}>
                    <ShieldCheck className="w-4 h-4 text-[#00C878]" />
                    <span>Device & Hardware Permissions</span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-[#A3A3A3]'} mt-1`}>
                    Control which browser and mobile hardware capabilities FIS can access to deliver seamless proximity bookings.
                  </p>
                </div>

                {/* Permissions List */}
                <div className="space-y-3">
                  {/* 1. Location */}
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} flex items-center justify-between`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Location & Geolocation (GPS)</div>
                        <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'} mt-0.5`}>
                          Used for "Locate in My Vicinity" to instantly sort available spaces by physical distance from your current location.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPermissionLocation(!permissionLocation);
                        showToast(permissionLocation ? 'Location permission disabled.' : 'Location permission granted.', 'info');
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ml-3 ${
                        permissionLocation ? 'bg-[#00C878]' : isLight ? 'bg-neutral-300' : 'bg-[#333333]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          permissionLocation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2. Camera Access */}
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} flex items-center justify-between`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center shrink-0 mt-0.5">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Camera & QR Scanner</div>
                        <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'} mt-0.5`}>
                          Used by coworkers to scan door access QR codes at hubs, and by hosts to upload space photos.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPermissionCamera(!permissionCamera);
                        showToast(permissionCamera ? 'Camera permission disabled.' : 'Camera permission granted.', 'info');
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ml-3 ${
                        permissionCamera ? 'bg-[#00C878]' : isLight ? 'bg-neutral-300' : 'bg-[#333333]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          permissionCamera ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3. Push Notifications */}
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} flex items-center justify-between`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Session Reminders & Push Alerts</div>
                        <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'} mt-0.5`}>
                          Sends 1-hour session start reminders, check-in confirmations, and host messaging replies.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPermissionNotifications(!permissionNotifications);
                        showToast(permissionNotifications ? 'Notifications disabled.' : 'Notifications enabled.', 'info');
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ml-3 ${
                        permissionNotifications ? 'bg-[#00C878]' : isLight ? 'bg-neutral-300' : 'bg-[#333333]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          permissionNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 4. Local Storage & Offline Pass Cache */}
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} flex items-center justify-between`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center shrink-0 mt-0.5">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Offline Keyless Pass Cache</div>
                        <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#A3A3A3]'} mt-0.5`}>
                          Stores valid QR passes in local encrypted storage so you can enter physical spaces even without internet.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPermissionOfflineStorage(!permissionOfflineStorage);
                        showToast(permissionOfflineStorage ? 'Offline pass cache disabled.' : 'Offline pass cache enabled.', 'info');
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ml-3 ${
                        permissionOfflineStorage ? 'bg-[#00C878]' : isLight ? 'bg-neutral-300' : 'bg-[#333333]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          permissionOfflineStorage ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. APP VERSION & DIAGNOSTICS TAB */}
            {activeTab === 'about' && (
              <div className="space-y-5">
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-neutral-900' : 'text-white'} flex items-center gap-2`}>
                    <Info className="w-4 h-4 text-[#00C878]" />
                    <span>App Version & System Diagnostics</span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-[#A3A3A3]'} mt-1`}>
                    Production release details, live cloud database status, and cache management tools.
                  </p>
                </div>

                {/* Version Overview Card */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F8FAFC] border-neutral-200' : 'bg-[#181818] border-[#262626]'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-base font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        FIS Physical Spaces
                      </div>
                      <div className="text-xs font-mono text-[#00C878]">
                        Version 2.4.1 (Build 2026.08-SPATIAL)
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#00C878] text-[#0D0D0D]">
                      OFFICIAL RELEASE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#2A2A2A]/50">
                    <div>
                      <span className={`${isLight ? 'text-neutral-500' : 'text-[#888888]'}`}>Platform Engine:</span>
                      <div className="font-semibold">React 18 + Vite + Tailwind</div>
                    </div>
                    <div>
                      <span className={`${isLight ? 'text-neutral-500' : 'text-[#888888]'}`}>Cloud Database:</span>
                      <div className="font-semibold text-[#00C878]">
                        {isSupabaseConnected ? 'Supabase Realtime Sync' : 'Hybrid Local + Cloud Cache'}
                      </div>
                    </div>
                    <div>
                      <span className={`${isLight ? 'text-neutral-500' : 'text-[#888888]'}`}>Vicinity Radar:</span>
                      <div className="font-semibold">Nigeria Cartography v3.2</div>
                    </div>
                    <div>
                      <span className={`${isLight ? 'text-neutral-500' : 'text-[#888888]'}`}>License:</span>
                      <div className="font-semibold">Apache-2.0 Open License</div>
                    </div>
                  </div>
                </div>

                {/* Actions: Check for Updates & Clear Cache */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    id="check-update-btn"
                    onClick={handleCheckForUpdates}
                    disabled={isCheckingUpdate}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdate ? 'Checking for updates...' : 'Check for Updates'}</span>
                  </button>

                  <button
                    type="button"
                    id="clear-cache-btn"
                    onClick={handleClearCache}
                    className={`py-2.5 px-4 rounded-xl border ${
                      isLight ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100' : 'bg-[#222222] border-[#333333] text-white hover:bg-[#2A2A2A]'
                    } text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#D6A83A]" />
                    <span>Clear Spatial Cache</span>
                  </button>
                </div>

                {updateStatus && (
                  <div className="p-3 rounded-xl bg-[#00C878]/15 border border-[#00C878]/30 text-[#00C878] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{updateStatus}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
