import React from 'react';
import { X, Settings, ShieldCheck, Zap, Globe, RefreshCw, Smartphone, Clock, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    currency,
    timeFormat,
    setTimeFormat,
    setIsDiagnosticsModalOpen,
    currentUser,
  } = useApp();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#00C878]" />
            <h3 className="text-lg font-bold text-[#F2F2F2]">Platform Settings</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Time Format Preference */}
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Clock & Time Format</span>
              </div>
              <p className="text-[10px] text-[#718079]">Switch between standard 12-hour (AM/PM) and 24-hour display</p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                id="time-format-12h-btn"
                onClick={() => setTimeFormat('12h')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeFormat === '12h'
                    ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                    : 'bg-[#141816] text-[#718079] hover:text-[#F2F2F2]'
                }`}
              >
                12h (AM/PM)
              </button>
              <button
                type="button"
                id="time-format-24h-btn"
                onClick={() => setTimeFormat('24h')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeFormat === '24h'
                    ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                    : 'bg-[#141816] text-[#718079] hover:text-[#F2F2F2]'
                }`}
              >
                24h
              </button>
            </div>
          </div>

          {/* Currency Configuration - 100% Naira */}
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F2F2F2]">Primary Settlement Currency</div>
              <p className="text-[10px] text-[#718079]">Standardized Nigerian Naira (₦ NGN) ecosystem</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30">
                ₦ NGN (Nigeria)
              </span>
            </div>
          </div>

          {/* Diagnostics Trigger (Host Only) */}
          {currentUser.role === 'host' && (
            <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F2F2F2] flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>System Health & Diagnostics</span>
                </div>
                <p className="text-[10px] text-[#718079]">Run full diagnostic test on currency, telemetry & auth</p>
              </div>
              <button
                type="button"
                id="settings-diagnostics-btn"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsDiagnosticsModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md cursor-pointer shrink-0"
              >
                Run Diagnosis
              </button>
            </div>
          )}

          {/* Telemetry Status */}
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00C878]">
              <Zap className="w-4 h-4" />
              <span>Real-time Grid & Power Telemetry</span>
            </div>
            <p className="text-xs text-[#9EABA3] leading-relaxed">
              OFIS synchronizes with hardware IoT telemetry across partner hubs in Lagos, Abuja, Port Harcourt, and Ibadan to ensure uninterrupted power.
            </p>
          </div>

          {/* Reset App State */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Local Storage & Seed Fresh Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
