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

  const hostSpaces = allSpaces.filter(s => s.host.id === currentUser.id || s.host.id === 'host-001' || s.host.id === 'user-001');

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
    <div className="min-h-screen bg-[#0D0D0D] pb-32">
      
      {/* Sticky Top Header Bar */}
      <div className="sticky top-16 z-30 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1E2522] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left Brand & Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSwitchToGuestMode}
              title="Switch to Guest Mode"
              className="p-2 rounded-xl bg-[#141816] text-[#9EABA3] hover:text-[#00C878] border border-[#232D28] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#F2F2F2]">Host Operations & Property Portal</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00C878]/15 text-[#00C878] font-bold border border-[#00C878]/30">
                  Host Mode Active
                </span>
              </div>
              <p className="text-xs text-[#718079]">
                Logged in as <span className="text-[#F2F2F2] font-semibold">{currentUser.name}</span> ({hostSpaces.length} Workspaces)
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto pb-1 sm:pb-0">
            
            {/* Mode Switcher Button */}
            <button
              type="button"
              onClick={handleSwitchToGuestMode}
              className="px-3 py-1.5 rounded-xl bg-[#141816] hover:bg-[#18201B] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors"
            >
              <Repeat className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Switch to Guest View</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiagnosticsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#141816] hover:bg-[#18201B] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Health</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHostPayoutModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#00C878]/40 text-xs font-bold text-[#00C878] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Withdraw ₦</span>
            </button>

            <button
              type="button"
              onClick={() => setIsListSpaceModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Space</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-[#141816] border-b border-[#1E2522] sticky top-[125px] sm:top-[129px] z-20 px-4 sm:px-6 lg:px-8">
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
                    ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                    : 'text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-[#0D0D0D] text-[#00C878]' : 'bg-[#00C878] text-[#0D0D0D]'
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
                <h3 className="text-lg font-bold text-[#F2F2F2]">Live Facility Power & Connectivity Telemetry</h3>
                <p className="text-xs text-[#718079]">Continuous IoT monitoring for Victoria Island and Ikoyi hubs</p>
              </div>

              <button
                type="button"
                disabled={generatorTesting}
                onClick={handleRunGeneratorTest}
                className="px-4 py-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#00C878]/40 text-xs font-bold text-[#00C878] flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Zap className={`w-3.5 h-3.5 ${generatorTesting ? 'animate-bounce' : ''}`} />
                <span>{generatorTesting ? 'Running Test...' : 'Run Auto-Switch Test'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-4 rounded-2xl bg-[#00C878]/15 border border-[#00C878]/30 text-xs text-[#00C878] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{testResult}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#718079]">
                  <span>Generator Load</span>
                  <Zap className="w-4 h-4 text-[#00C878]" />
                </div>
                <div className="text-2xl font-extrabold text-[#F2F2F2] font-mono">
                  145 kVA
                </div>
                <div className="w-full bg-[#18201B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00C878] h-full w-[58%]" />
                </div>
                <p className="text-[11px] text-[#718079]">58% of 250 kVA Perkins Genset</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#718079]">
                  <span>Solar Battery SoC</span>
                  <BatteryCharging className="w-4 h-4 text-[#00C878]" />
                </div>
                <div className="text-2xl font-extrabold text-[#00C878] font-mono">
                  94% Full
                </div>
                <div className="w-full bg-[#18201B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00C878] h-full w-[94%]" />
                </div>
                <p className="text-[11px] text-[#718079]">Lithium-Iron Phosphate Bank</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#718079]">
                  <span>Diesel Fuel Reserves</span>
                  <Fuel className="w-4 h-4 text-[#E0A82E]" />
                </div>
                <div className="text-2xl font-extrabold text-[#F2F2F2] font-mono">
                  1,420 Liters
                </div>
                <div className="w-full bg-[#18201B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#E0A82E] h-full w-[78%]" />
                </div>
                <p className="text-[11px] text-[#718079]">Est. 86 hours continuous runtime</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#718079]">
                  <span>Dual Fiber & Starlink Ping</span>
                  <Wifi className="w-4 h-4 text-[#00C878]" />
                </div>
                <div className="text-2xl font-extrabold text-[#00C878] font-mono">
                  6 ms
                </div>
                <div className="w-full bg-[#18201B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00C878] h-full w-[98%]" />
                </div>
                <p className="text-[11px] text-[#718079]">MainOne Fiber + Starlink Failover</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
