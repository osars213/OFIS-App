import React from 'react';
import { 
  X, 
  User, 
  Building2, 
  Sparkles, 
  PlusCircle, 
  CalendarCheck, 
  Bookmark, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  LogIn,
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCw, 
  Activity, 
  UserPlus,
  ArrowLeftRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFISWordmark } from './OFISWordmark';

export const OfisNavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    currentUser,
    switchUserRole,
    setCurrentView,
    setIsAuthModalOpen,
    openAuthModal,
    setIsListSpaceModalOpen,
    setIsAiModalOpen,
    setIsSettingsOpen,
    setIsDiagnosticsModalOpen,
    notifications,
    markAllNotificationsRead,
    unreadNotificationsCount,
    signOut,
    signIn,
    isGuest,
    comparedSpaceIds,
    setIsCompareModalOpen,
  } = useApp();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-[#121614] border-l border-[#1E2522] shadow-2xl flex flex-col justify-between z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1E2522] flex items-center justify-between">
          <OFISWordmark size="sm" />
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* User Card */}
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00C878]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#F2F2F2] truncate">{currentUser.name}</h4>
                <p className="text-xs text-[#718079] truncate">{currentUser.email}</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#00C878]/15 text-[#00C878] text-[10px] font-mono font-bold uppercase">
                    {currentUser.role}
                  </span>
                  <span className="text-[10px] text-[#718079]">
                    ₦{(currentUser?.walletBalanceNgn ?? 0).toLocaleString()} Balance
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#232D28] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  switchUserRole(currentUser.role === 'user' ? 'host' : 'user');
                }}
                className="text-xs text-[#00C878] hover:underline font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch to {currentUser.role === 'user' ? 'Host Mode' : 'Guest Mode'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openAuthModal('profile');
                }}
                className="text-xs text-[#9EABA3] hover:text-[#F2F2F2] cursor-pointer"
              >
                Manage Profile
              </button>
            </div>

            {/* Prominent Sign In / Sign Up / Sign Out Button inside User Card */}
            <div className="pt-2 border-t border-[#232D28] space-y-2">
              {isGuest ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="drawer-sign-in-btn"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-[#F2F2F2] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#718079]" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    id="drawer-sign-up-btn"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      openAuthModal('signup');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="drawer-sign-out-btn"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    signOut();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#2D1616] hover:bg-[#3D1A1A] border border-[#FF5C5C]/30 text-[#FF8585] hover:text-[#FF5C5C] text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#FF5C5C]" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider px-2 pb-1">
              Explore & Bookings
            </p>

            <button
              type="button"
              onClick={() => {
                setCurrentView('explore');
                setIsDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#F2F2F2] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-[#00C878]" />
                <span>Explore Workspaces</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#718079]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('bookings');
                setIsDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#F2F2F2] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-4 h-4 text-[#00C878]" />
                <span>My Active Bookings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#718079]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('saved');
                setIsDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#F2F2F2] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Bookmark className="w-4 h-4 text-[#00C878]" />
                <span>Saved Favorites</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#718079]" />
            </button>

            <button
              type="button"
              id="drawer-compare-spaces-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsCompareModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#F2F2F2] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ArrowLeftRight className="w-4 h-4 text-[#00C878]" />
                <span>Compare Workspaces</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {comparedSpaceIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[#00C878]/20 text-[#00C878] text-[10px] font-mono font-bold">
                    {comparedSpaceIds.length}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-[#718079]" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsAiModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#00C878] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 text-[#00C878]" />
                <span>Ofis Assistant</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#718079]" />
            </button>
          </div>

          {/* Host Operations */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider px-2 pb-1">
              Host Operations
            </p>

            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsListSpaceModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#F2F2F2] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <PlusCircle className="w-4 h-4 text-[#00C878]" />
                <span>List a New Hub / Space</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#718079]" />
            </button>

            <button
              type="button"
              onClick={() => {
                switchUserRole('host');
                setIsDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18201B] text-xs font-semibold text-[#F2F2F2] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-[#00C878]" />
                <span>Host Dashboard & Earnings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#718079]" />
            </button>
          </div>

          {/* Notifications Brief */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <p className="text-[11px] font-mono font-bold uppercase text-[#718079] tracking-wider">
                Notifications ({unreadNotificationsCount})
              </p>
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-[10px] text-[#00C878] hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>

            {notifications.slice(0, 2).map(n => (
              <div key={n.id} className="p-3 rounded-xl bg-[#18201B] border border-[#232D28] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F2F2F2]">{n.title}</span>
                  <span className="text-[10px] text-[#718079]">{n.timestamp}</span>
                </div>
                <p className="text-[#9EABA3] leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1E2522] space-y-2.5">
          {currentUser.role === 'host' && (
            <button
              type="button"
              id="drawer-diagnostics-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsDiagnosticsModalOpen(true);
              }}
              className="w-full flex items-center space-x-2 text-xs font-bold text-[#00C878] hover:text-[#00E58B] transition-colors cursor-pointer"
            >
              <Activity className="w-4 h-4 text-[#00C878]" />
              <span>Run System Health Diagnostics</span>
            </button>
          )}

          <button
            type="button"
            id="drawer-settings-btn"
            onClick={() => {
              setIsDrawerOpen(false);
              setIsSettingsOpen(true);
            }}
            className="w-full flex items-center space-x-2 text-xs text-[#9EABA3] hover:text-[#F2F2F2] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Platform Settings & Clock</span>
          </button>

          <div className="text-[11px] text-[#718079] font-mono flex items-center justify-between pt-2 border-t border-[#1E2522]">
            <span>OFIS Nigeria v2.0</span>
            <span className="text-[#00C878]">● 100% Naira (₦) Ready</span>
          </div>
        </div>

      </div>
    </div>
  );
};
