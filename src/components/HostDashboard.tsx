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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#111827] pb-32 transition-colors">
      
      {/* Sticky Top Header Bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#374151] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left Brand & Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSwitchToGuestMode}
              title="Switch to Guest Mode"
              className="p-2 rounded-xl bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#16A34A] dark:hover:text-[#16A34A] border border-[#E5E7EB] dark:border-[#374151] cursor-pointer transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Host Operations & Property Portal</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] font-bold border border-[#16A34A]/30">
                  Host Mode Active
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Logged in as <span className="text-[#111827] dark:text-[#F9FAFB] font-semibold">{currentUser.name}</span> ({hostSpaces.length} Workspaces)
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto pb-1 sm:pb-0">
            
            {/* Mode Switcher Button */}
            <button
              type="button"
              onClick={handleSwitchToGuestMode}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors shadow-xs"
            >
              <Repeat className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Switch to Guest View</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiagnosticsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Health</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHostPayoutModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 hover:bg-[#BBF7D0] dark:hover:bg-[#16A34A]/30 border border-[#16A34A]/30 text-xs font-bold text-[#16A34A] flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Withdraw ₦</span>
            </button>

            <button
              type="button"
              onClick={() => setIsListSpaceModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Space</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151] sticky top-[125px] sm:top-[129px] z-20 px-4 sm:px-6 lg:px-8 shadow-xs">
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
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white text-[#16A34A]' : 'bg-[#16A34A] text-white'
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
                <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Live Facility Power & Connectivity Telemetry</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Continuous IoT monitoring for Victoria Island and Ikoyi hubs</p>
              </div>

              <button
                type="button"
                disabled={generatorTesting}
                onClick={handleRunGeneratorTest}
                className="px-4 py-2 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 hover:bg-[#BBF7D0] dark:hover:bg-[#16A34A]/30 border border-[#16A34A]/30 text-xs font-bold text-[#16A34A] flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Zap className={`w-3.5 h-3.5 ${generatorTesting ? 'animate-bounce' : ''}`} />
                <span>{generatorTesting ? 'Running Test...' : 'Run Auto-Switch Test'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-4 rounded-2xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 border border-[#16A34A]/30 text-xs text-[#16A34A] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{testResult}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>Generator Load</span>
                  <Zap className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB] font-mono">
                  145 kVA
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#16A34A] h-full w-[58%]" />
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">58% of 250 kVA Perkins Genset</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>Solar Battery SoC</span>
                  <BatteryCharging className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div className="text-2xl font-extrabold text-[#16A34A] font-mono">
                  94% Full
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#16A34A] h-full w-[94%]" />
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Lithium-Iron Phosphate Bank</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>Diesel Fuel Reserves</span>
                  <Fuel className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB] font-mono">
                  1,420 Liters
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#F59E0B] h-full w-[78%]" />
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Est. 86 hours continuous runtime</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>Dual Fiber & Starlink Ping</span>
                  <Wifi className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div className="text-2xl font-extrabold text-[#16A34A] font-mono">
                  6 ms
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#16A34A] h-full w-[98%]" />
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">MainOne Fiber + Starlink Failover</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
