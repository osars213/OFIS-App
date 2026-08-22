import React, { useState } from 'react';
import { 
  X, 
  User, 
  Bell, 
  Shield, 
  Wallet, 
  Plus, 
  CreditCard, 
  Moon, 
  Sun, 
  Laptop, 
  Info, 
  CheckCircle2, 
  Sliders, 
  Globe, 
  Smartphone,
  Sparkles,
  Zap,
  Lock,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    currentUser, 
    updateCurrentUser, 
    showToast, 
    themeMode, 
    setThemeMode,
    currency,
    setCurrency,
    detectedCountry,
    formatPrice
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'theme' | 'currency' | 'wallet' | 'notifications' | 'about'>('theme');
  const [topupAmount, setTopupAmount] = useState(10000);
  const [whatsappDelivery, setWhatsappDelivery] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [powerAlerts, setPowerAlerts] = useState(true);

  if (!isSettingsOpen) return null;

  const handleTopup = () => {
    updateCurrentUser({
      walletBalance: currentUser.walletBalance + topupAmount,
    });
    showToast(`Successfully credited ₦${topupAmount.toLocaleString()} to your OFIS wallet!`);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setThemeMode(theme);
    showToast(
      `Theme set to ${
        theme === 'light'
          ? 'Light'
          : theme === 'dark'
          ? 'Dark'
          : 'Default (System)'
      }`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E2522] bg-[#101412]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00C878]/10 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F2F2F2]">Settings & Preferences</h3>
              <p className="text-[11px] font-mono text-[#00C878]">OFIS v2.1.1</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#1E2522] px-5 bg-[#121614] overflow-x-auto no-scrollbar gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'theme'
                ? 'border-[#00C878] text-[#00C878]'
                : 'border-transparent text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Theme & Display</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('currency')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'currency'
                ? 'border-[#00C878] text-[#00C878]'
                : 'border-transparent text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Currency & Region</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'wallet'
                ? 'border-[#00C878] text-[#00C878]'
                : 'border-transparent text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet & Balance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'notifications'
                ? 'border-[#00C878] text-[#00C878]'
                : 'border-transparent text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pass Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'about'
                ? 'border-[#00C878] text-[#00C878]'
                : 'border-transparent text-[#9EABA3] hover:text-[#F2F2F2]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>App Info</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: THEME OPTIONS */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider">Theme Appearance</h4>
                <p className="text-[11px] text-[#9EABA3] mt-0.5">Switch between signature, dark, and light visual modes</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Theme 1: Light */}
                <div
                  id="theme-option-light"
                  onClick={() => handleThemeChange('light')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    themeMode === 'light'
                      ? 'bg-[#17201B] border-[#00C878] ring-1 ring-[#00C878]/30 shadow-md'
                      : 'bg-[#161D19] border-[#232D28] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] flex items-center justify-center text-[#00C878] shadow-sm">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F2F2F2]">Light</span>
                      </div>
                      <p className="text-[10px] text-[#9EABA3]">Bright daylight workspace with high-contrast slate surfaces</p>
                    </div>
                  </div>
                  {themeMode === 'light' && (
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0" />
                  )}
                </div>

                {/* Theme 2: Dark */}
                <div
                  id="theme-option-dark"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    themeMode === 'dark'
                      ? 'bg-[#17201B] border-[#00C878] ring-1 ring-[#00C878]/30 shadow-md'
                      : 'bg-[#161D19] border-[#232D28] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-black border border-[#333] flex items-center justify-center text-[#00C878] shadow-sm">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F2F2F2]">Dark</span>
                      </div>
                      <p className="text-[10px] text-[#9EABA3]">Deep obsidian dark theme with emerald highlights</p>
                    </div>
                  </div>
                  {themeMode === 'dark' && (
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0" />
                  )}
                </div>

                {/* Theme 3: Default (System) */}
                <div
                  id="theme-option-system"
                  onClick={() => handleThemeChange('system')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    themeMode === 'system' || themeMode === 'default'
                      ? 'bg-[#17201B] border-[#00C878] ring-1 ring-[#00C878]/30 shadow-md'
                      : 'bg-[#161D19] border-[#232D28] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#101412] border border-[#00C878]/40 flex items-center justify-center text-[#00C878] shadow-sm">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F2F2F2]">Default (System)</span>
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30 font-bold uppercase font-mono">Auto</span>
                      </div>
                      <p className="text-[10px] text-[#9EABA3]">Automatically matches your device operating system theme</p>
                    </div>
                  </div>
                  {(themeMode === 'system' || themeMode === 'default') && (
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENCY & REGIONAL SETTINGS */}
          {activeTab === 'currency' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider">Currency & Geolocation</h4>
                <p className="text-[11px] text-[#9EABA3] mt-0.5">
                  Currency is determined by your country IP by default, or you can switch manually below.
                </p>
              </div>

              {/* IP Country Detection Indicator */}
              <div className="p-3.5 rounded-xl bg-[#161D19] border border-[#232D28] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00C878]/10 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F2F2F2]">IP Geolocation Detection</span>
                    <p className="text-[10px] text-[#9EABA3]">
                      Detected Region:{' '}
                      <span className="font-semibold text-[#00C878]">
                        {detectedCountry === 'NG'
                          ? 'Nigeria 🇳🇬 (Default: NGN)'
                          : detectedCountry
                          ? `${detectedCountry} (Default: USD)`
                          : 'Auto-detected via Network IP'}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30">
                  Active
                </span>
              </div>

              {/* Currency Selector Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {/* Option 1: Nigerian Naira */}
                <div
                  onClick={() => setCurrency('NGN')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    currency === 'NGN'
                      ? 'bg-[#17201B] border-[#00C878] ring-1 ring-[#00C878]/30 shadow-md'
                      : 'bg-[#161D19] border-[#232D28] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0D0D0D] border border-[#232D28] flex items-center justify-center text-sm font-black text-[#00C878] font-mono">
                      ₦
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F2F2F2]">Nigerian Naira (NGN - ₦)</span>
                        <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#00C878]/20 text-[#00C878] font-bold">Local</span>
                      </div>
                      <p className="text-[10px] text-[#9EABA3]">Standard local currency for all Nigeria spaces and passes</p>
                    </div>
                  </div>
                  {currency === 'NGN' && (
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0" />
                  )}
                </div>

                {/* Option 2: US Dollar */}
                <div
                  onClick={() => setCurrency('USD')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    currency === 'USD'
                      ? 'bg-[#17201B] border-[#00C878] ring-1 ring-[#00C878]/30 shadow-md'
                      : 'bg-[#161D19] border-[#232D28] hover:border-[#35433C]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0D0D0D] border border-[#232D28] flex items-center justify-center text-sm font-black text-[#00C878] font-mono">
                      $
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F2F2F2]">US Dollar (USD - $)</span>
                        <span className="px-1.5 py-0.2 text-[9px] rounded bg-blue-500/20 text-blue-400 font-bold">International</span>
                      </div>
                      <p className="text-[10px] text-[#9EABA3]">International converted pricing (1 USD ≈ ₦1,450)</p>
                    </div>
                  </div>
                  {currency === 'USD' && (
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0" />
                  )}
                </div>
              </div>

              {/* Exchange Rate Notice */}
              <div className="p-3 rounded-lg bg-[#121614] border border-[#1E2522] text-xs text-[#9EABA3] flex items-center justify-between">
                <span>Current Conversion Rate:</span>
                <span className="font-mono text-[#F2F2F2] font-semibold">$1.00 USD = ₦1,450 NGN</span>
              </div>
            </div>
          )}

          {/* TAB 3: WALLET & BALANCE */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              {/* User Profile Card */}
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-[#1A201D] border border-[#1E2522]">
                {currentUser.avatarUrl && (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-11 h-11 rounded-xl object-cover ring-1 ring-[#00C878]/30" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-[#F2F2F2]">{currentUser.name}</h4>
                  <p className="text-[11px] text-[#9EABA3]">{currentUser.email}</p>
                  <span className="inline-block text-[10px] font-semibold text-[#00C878] mt-0.5">Role: {currentUser.role === 'host' ? 'Verified Space Host' : 'OFIS Member'}</span>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="space-y-3 p-4 rounded-xl bg-[#161D19] border border-[#232D28]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9EABA3] flex items-center space-x-1.5">
                    <Wallet className="w-4 h-4 text-[#00C878]" />
                    <span>Prepaid Wallet Balance</span>
                  </span>
                  <span className="text-lg font-black text-[#00C878] font-mono">
                    {formatPrice(currentUser.walletBalance)}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-[#718079]">Select Top-Up Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5000, 10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopupAmount(amt)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          topupAmount === amt
                            ? 'bg-[#00C878]/20 border-[#00C878] text-[#00C878]'
                            : 'bg-[#1A201D] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                        }`}
                      >
                        {formatPrice(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTopup}
                  className="w-full py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Fund Wallet ({formatPrice(topupAmount)})</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & DIGITAL PASS DELIVERY */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider">Access Pass & Alert Delivery</h4>
                <p className="text-[11px] text-[#9EABA3] mt-0.5">Manage how digital check-in passes and receipts reach you</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161D19] border border-[#1E2522] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>WhatsApp QR Pass Delivery</span>
                  </p>
                  <p className="text-[10px] text-[#9EABA3]">Instantly receives QR code check-in passes upon payment</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={whatsappDelivery} 
                  onChange={(e) => setWhatsappDelivery(e.target.checked)}
                  className="accent-[#00C878] w-4 h-4 rounded cursor-pointer" 
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#161D19] border border-[#1E2522] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>SMS Check-in Alerts</span>
                  </p>
                  <p className="text-[10px] text-[#9EABA3]">Arrival confirmations & WiFi credentials SMS</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={smsAlerts} 
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="accent-[#00C878] w-4 h-4 rounded cursor-pointer" 
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#161D19] border border-[#1E2522] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>Host Power Status Broadcasts</span>
                  </p>
                  <p className="text-[10px] text-[#9EABA3]">Alerts if generator switchover or maintenance occurs</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={powerAlerts} 
                  onChange={(e) => setPowerAlerts(e.target.checked)}
                  className="accent-[#00C878] w-4 h-4 rounded cursor-pointer" 
                />
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT & APP VERSION */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#161D19] border border-[#232D28] text-center space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#00C878]/15 border border-[#00C878]/30 text-xs font-mono font-bold text-[#00C878]">
                  OFIS v2.1.1
                </span>
                <h4 className="text-sm font-bold text-[#F2F2F2]">Nigeria's Physical Space Network</h4>
                <p className="text-xs text-[#9EABA3] max-w-sm mx-auto leading-relaxed">
                  Connecting Nigerian professionals, teams and creators to verified spaces with guaranteed 24/7 power, fast internet, and instant digital passes.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-[#121614] border border-[#1E2522] flex items-center justify-between">
                  <span className="text-[#718079]">Version</span>
                  <span className="font-mono text-[#F2F2F2]">2.1.1 (Build 2026.8 • Stable)</span>
                </div>
                <div className="p-3 rounded-lg bg-[#121614] border border-[#1E2522] flex items-center justify-between">
                  <span className="text-[#718079]">Network Status</span>
                  <span className="text-[#00C878] font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#00C878] animate-pulse" />
                    <span>All Hubs Online</span>
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#121614] border border-[#1E2522] flex items-center justify-between">
                  <span className="text-[#718079]">Covered Hubs</span>
                  <span className="text-[#F2F2F2]">Lagos • Abuja • Port Harcourt • Ibadan</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2522] bg-[#101412] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#718079]">OFIS v2.1.1</span>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#1A201D] hover:bg-[#202723] text-xs font-semibold text-[#F2F2F2] border border-[#232D28] transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
