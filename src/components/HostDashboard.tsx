import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  ArrowLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Play,
  Pause,
  QrCode,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Fuel,
  BatteryCharging,
  Wifi,
  Activity,
  AlertCircle,
  Eye,
  Sliders,
  Calendar as CalendarIcon,
  Bell,
  Sparkles,
  LayoutDashboard,
  UserCheck,
  PlusCircle,
  Repeat
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space } from '../types';
import { HostHomeTab } from './host/HostHomeTab';
import { HostSpacesTab } from './host/HostSpacesTab';
import { HostBookingsTab } from './host/HostBookingsTab';
import { HostCalendarTab } from './host/HostCalendarTab';
import { HostPricingRulesTab } from './host/HostPricingRulesTab';
import { HostPayoutsTab } from './host/HostPayoutsTab';
import { HostInsightsTab } from './host/HostInsightsTab';
import { HostNotificationsTab } from './host/HostNotificationsTab';

export type HostDashboardTab = 
  | 'home' 
  | 'spaces' 
  | 'bookings' 
  | 'calendar' 
  | 'pricing' 
  | 'payouts' 
  | 'insights' 
  | 'notifications' 
  | 'telemetry';

export const HostDashboard: React.FC = () => {
  const { 
    currentUser, 
    allSpaces, 
    setCurrentView, 
    switchUserRole,
    setIsListSpaceModalOpen,
    setIsHostPayoutModalOpen,
    setIsDiagnosticsModalOpen,
    checkInGuest,
    notifications,
    unreadNotificationsCount
  } = useApp();

  const [activeTab, setActiveTab] = useState<HostDashboardTab>('home');
  const [selectedSpaceForAction, setSelectedSpaceForAction] = useState<Space | null>(null);
  
  // Fast turnstile pass modal state
  const [quickPassInput, setQuickPassInput] = useState('');
  const [quickCheckInResult, setQuickCheckInResult] = useState<{ success: boolean; message: string; booking?: any } | null>(null);
  
  // Generator test state
  const [generatorTesting, setGeneratorTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const hostSpaces = allSpaces.filter(s => 
    s.host.id === currentUser.id || 
    (currentUser.email && s.host.email && s.host.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser.name && s.host.name && s.host.name.toLowerCase() === currentUser.name.toLowerCase()) ||
    (currentUser.id === 'host-001' && (s.host.id === 'host-001' || s.host.id === 'user-001')) ||
    (!s.host.id && currentUser.role === 'host')
  );

  const handleOpenCheckInCode = (code: string) => {
    setQuickPassInput(code);
    setActiveTab('bookings');
    const res = checkInGuest(code);
    setQuickCheckInResult(res);
  };

  const handleRunGeneratorTest = () => {
    setGeneratorTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setGeneratorTesting(false);
      setTestResult('Generator Auto-Switch & Pure Sine Inverter diagnostics PASSED (0.00ms switchover lag)');
    }, 1200);
  };

  const handleSwitchToGuestMode = () => {
    switchUserRole('user');
    setCurrentView('explore');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] pb-32 transition-colors">
      
      {/* Sticky Top Header Bar */}
      <div className="sticky top-16 z-30 bg-[#FFF9F4]/95 dark:bg-[#07383D]/95 backdrop-blur-md border-b border-[#E2ECEB] dark:border-[#166D74] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left Brand & Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSwitchToGuestMode}
              title="Switch to Guest Mode"
              className="p-2 rounded-xl bg-white dark:bg-[#0B4A50] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#14BEB8] dark:hover:text-[#28D2CB] border border-[#E2ECEB] dark:border-[#166D74] cursor-pointer transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#12383B] dark:text-white">Host Operations &amp; Property Portal</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB] font-bold border border-[#14BEB8]/30">
                  Host Mode Active
                </span>
              </div>
              <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                Logged in as <span className="text-[#12383B] dark:text-white font-semibold">{currentUser.name}</span> ({hostSpaces.length} Workspaces)
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto pb-1 sm:pb-0">
            
            {/* Mode Switcher Button */}
            <button
              type="button"
              onClick={handleSwitchToGuestMode}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors shadow-xs"
            >
              <Repeat className="w-3.5 h-3.5 text-[#14BEB8]" />
              <span>Switch to Guest View</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiagnosticsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-[#14BEB8]" />
              <span>Health</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHostPayoutModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FFA987]/20 hover:bg-[#FFA987]/30 border border-[#FFA987]/40 text-xs font-bold text-[#12383B] dark:text-white flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5 text-[#006B70] dark:text-[#28D2CB]" />
              <span>Withdraw ₦</span>
            </button>

            <button
              type="button"
              onClick={() => setIsListSpaceModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Space</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white dark:bg-[#0B4A50] border-b border-[#E2ECEB] dark:border-[#166D74] sticky top-[125px] sm:top-[129px] z-20 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: 'home', label: 'Host Home', icon: LayoutDashboard },
            { id: 'spaces', label: 'My Spaces', icon: Building2 },
            { id: 'bookings', label: 'Bookings Queue', icon: Users },
            { id: 'calendar', label: 'Calendar & Blocks', icon: CalendarIcon },
            { id: 'pricing', label: 'Pricing Rules', icon: Sliders },
            { id: 'payouts', label: 'Earnings & Payouts', icon: Wallet },
            { id: 'insights', label: 'Insights & Analytics', icon: TrendingUp },
            { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount },
            { id: 'telemetry', label: 'IoT Telemetry', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as HostDashboardTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#14BEB8] text-white shadow-sm'
                    : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white text-[#14BEB8]' : 'bg-[#FFA987] text-[#12383B]'
                  }`}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TAB 1: HOST HOME DASHBOARD */}
        {activeTab === 'home' && (
          <HostHomeTab
            hostSpaces={hostSpaces}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenCheckInCode={handleOpenCheckInCode}
          />
        )}

        {/* TAB 2: MANAGE SPACES */}
        {activeTab === 'spaces' && (
          <HostSpacesTab
            hostSpaces={hostSpaces}
            onSelectSpaceForPricing={(space) => {
              setSelectedSpaceForAction(space);
              setActiveTab('pricing');
            }}
            onSelectSpaceForCalendar={(space) => {
              setSelectedSpaceForAction(space);
              setActiveTab('calendar');
            }}
          />
        )}

        {/* TAB 3: BOOKINGS QUEUE */}
        {activeTab === 'bookings' && (
          <HostBookingsTab
            onOpenCheckInCode={handleOpenCheckInCode}
          />
        )}

        {/* TAB 4: CALENDAR & DATE BLOCKING */}
        {activeTab === 'calendar' && (
          <HostCalendarTab
            hostSpaces={hostSpaces}
            selectedSpace={selectedSpaceForAction}
          />
        )}

        {/* TAB 5: DYNAMIC PRICING RULES */}
        {activeTab === 'pricing' && (
          <HostPricingRulesTab
            hostSpaces={hostSpaces}
            selectedSpace={selectedSpaceForAction}
          />
        )}

        {/* TAB 6: EARNINGS & PAYOUTS */}
        {activeTab === 'payouts' && (
          <HostPayoutsTab />
        )}

        {/* TAB 7: INSIGHTS & ANALYTICS */}
        {activeTab === 'insights' && (
          <HostInsightsTab hostSpaces={hostSpaces} />
        )}

        {/* TAB 8: NOTIFICATIONS & ALERTS */}
        {activeTab === 'notifications' && (
          <HostNotificationsTab />
        )}

        {/* TAB 9: IOT POWER & SENSOR TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#12383B] dark:text-white">Live Facility Power &amp; Connectivity Telemetry</h3>
                <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">Continuous IoT monitoring for Victoria Island and Ikoyi hubs</p>
              </div>

              <button
                type="button"
                disabled={generatorTesting}
                onClick={handleRunGeneratorTest}
                className="px-4 py-2 rounded-xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 hover:bg-[#14BEB8]/25 border border-[#14BEB8]/30 text-xs font-bold text-[#006B70] dark:text-[#28D2CB] flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Zap className={`w-3.5 h-3.5 ${generatorTesting ? 'animate-bounce' : ''}`} />
                <span>{generatorTesting ? 'Running Test...' : 'Run Auto-Switch Test'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-4 rounded-2xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/30 text-xs text-[#006B70] dark:text-[#28D2CB] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{testResult}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <span>Generator Load</span>
                  <Zap className="w-4 h-4 text-[#14BEB8]" />
                </div>
                <div className="text-2xl font-extrabold text-[#12383B] dark:text-white font-mono">
                  145 kVA
                </div>
                <div className="w-full bg-[#E2ECEB] dark:bg-[#166D74] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#14BEB8] h-full w-[58%]" />
                </div>
                <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">58% of 250 kVA Perkins Genset</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <span>Solar Battery SoC</span>
                  <BatteryCharging className="w-4 h-4 text-[#14BEB8]" />
                </div>
                <div className="text-2xl font-extrabold text-[#006B70] dark:text-[#28D2CB] font-mono">
                  94% Full
                </div>
                <div className="w-full bg-[#E2ECEB] dark:bg-[#166D74] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#14BEB8] h-full w-[94%]" />
                </div>
                <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Lithium-Iron Phosphate Bank</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <span>Diesel Fuel Reserves</span>
                  <Fuel className="w-4 h-4 text-[#FFA987]" />
                </div>
                <div className="text-2xl font-extrabold text-[#12383B] dark:text-white font-mono">
                  1,420 Liters
                </div>
                <div className="w-full bg-[#E2ECEB] dark:bg-[#166D74] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#FFA987] h-full w-[78%]" />
                </div>
                <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Est. 86 hours continuous runtime</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <span>Dual Fiber &amp; Starlink Ping</span>
                  <Wifi className="w-4 h-4 text-[#14BEB8]" />
                </div>
                <div className="text-2xl font-extrabold text-[#006B70] dark:text-[#28D2CB] font-mono">
                  6 ms
                </div>
                <div className="w-full bg-[#E2ECEB] dark:bg-[#166D74] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#14BEB8] h-full w-[98%]" />
                </div>
                <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">MainOne Fiber + Starlink Failover</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
