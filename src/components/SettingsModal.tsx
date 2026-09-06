import React from 'react';
import { X, Settings, Zap, Globe, RefreshCw, Clock, Activity, DollarSign, Check, MapPin, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportedCurrency, CURRENCY_RATES } from '../services/currencyService';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    currency,
    setCurrency,
    currencyMode,
    detectedIpInfo,
    resetCurrencyToAutoIp,
    timeFormat,
    setTimeFormat,
    setIsDiagnosticsModalOpen,
    currentUser,
    theme,
    setTheme,
  } = useApp();

  if (!isSettingsOpen) return null;

  const currentRateMeta = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const isAutoMode = currencyMode === 'auto_ip';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1F2937] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto transition-colors">
        
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Platform Settings</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          
          {/* Section 0: Appearance & Theme Preference */}
          <div className="p-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-[#16A34A]" />
                  <span>Appearance & Theme</span>
                </div>
                <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                  Toggle between Light, Dark, or System mode
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="theme-select-light"
                onClick={() => setTheme('light')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A] font-bold shadow-xs'
                    : 'bg-white dark:bg-[#1F2937] border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#D1D5DB] hover:border-[#16A34A]/40'
                }`}
              >
                <Sun className="w-4 h-4 text-[#F59E0B]" />
                <span>Light</span>
              </button>

              <button
                type="button"
                id="theme-select-dark"
                onClick={() => setTheme('dark')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A] font-bold shadow-xs'
                    : 'bg-white dark:bg-[#1F2937] border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#D1D5DB] hover:border-[#16A34A]/40'
                }`}
              >
                <Moon className="w-4 h-4 text-[#6366F1]" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                id="theme-select-system"
                onClick={() => setTheme('system')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A] font-bold shadow-xs'
                    : 'bg-white dark:bg-[#1F2937] border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#D1D5DB] hover:border-[#16A34A]/40'
                }`}
              >
                <Monitor className="w-4 h-4 text-[#8B5CF6]" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Section 1: Localization & IP-Dependent Currency (Default Behavior) */}
          <div className="p-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#16A34A]" />
                  <span>Currency & Exchange Rates</span>
                </div>
                <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                  Prices adapt automatically based on your real-time IP location
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#DCFCE7] dark:bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30">
                {currentRateMeta.symbol} {currency}
              </span>
            </div>

            {/* Auto IP-Detection Status Banner */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] dark:bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0 text-base">
                  {detectedIpInfo.detectedFlag || '📍'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-bold text-[#111827] dark:text-[#F9FAFB] truncate">
                      Auto-detected via IP: {detectedIpInfo.detectedCountry}
                    </span>
                    {isAutoMode && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A]">
                        Active Default
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono truncate">
                    1 {currency} ≈ ₦{currentRateMeta.rateToNgn.toLocaleString()} NGN {detectedIpInfo.ipAddress ? `• ${detectedIpInfo.ipAddress}` : ''}
                  </p>
                </div>
              </div>

              {!isAutoMode && (
                <button
                  type="button"
                  id="reset-currency-auto-btn"
                  onClick={resetCurrencyToAutoIp}
                  className="px-2.5 py-1.5 rounded-lg bg-[#DCFCE7] dark:bg-[#16A34A]/15 hover:bg-[#bbf7d0] dark:hover:bg-[#16A34A]/25 border border-[#16A34A]/30 text-[10px] font-bold text-[#16A34A] transition-all flex items-center space-x-1 shrink-0 cursor-pointer"
                  title="Reset to automatically detected IP currency"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Auto</span>
                </button>
              )}
            </div>

            {/* Quick Currency Selector Pills */}
            <div className="space-y-1.5 pt-0.5">
              <label className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block">
                Change Display Currency
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {(Object.keys(CURRENCY_RATES) as SupportedCurrency[]).map((cKey) => {
                  const meta = CURRENCY_RATES[cKey];
                  const isSelected = currency === cKey;
                  return (
                    <button
                      key={cKey}
                      type="button"
                      id={`select-currency-${cKey}`}
                      onClick={() => setCurrency(cKey)}
                      className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#16A34A] text-white font-bold border-[#16A34A] shadow-sm'
                          : 'bg-white dark:bg-[#1F2937] text-[#4B5563] dark:text-[#D1D5DB] border-[#E5E7EB] dark:border-[#374151] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F8FAFC] dark:hover:bg-[#374151]'
                      }`}
                      title={`${meta.name} (1 ${cKey} ≈ ₦${meta.rateToNgn.toLocaleString()})`}
                    >
                      <div className="text-sm leading-none">{meta.flag}</div>
                      <div className="font-mono text-[10px] mt-1">{meta.code}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Time Display Preference */}
          <div className="p-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Clock & Time Format</span>
              </div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Switch between standard 12-hour (AM/PM) and 24-hour display</p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                id="time-format-12h-btn"
                onClick={() => setTimeFormat('12h')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeFormat === '12h'
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-transparent'
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
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-transparent'
                }`}
              >
                24h
              </button>
            </div>
          </div>

          {/* Diagnostics Trigger (Host Only) */}
          {currentUser.role === 'host' && (
            <div className="p-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>System Health & Diagnostics</span>
                </div>
                <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Run full diagnostic test on currency, telemetry & auth</p>
              </div>
              <button
                type="button"
                id="settings-diagnostics-btn"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsDiagnosticsModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md cursor-pointer shrink-0"
              >
                Run Diagnosis
              </button>
            </div>
          )}

          {/* Telemetry Status */}
          <div className="p-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#16A34A]">
              <Zap className="w-4 h-4" />
              <span>Real-time Grid & Power Telemetry</span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
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
              className="w-full py-2.5 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
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


