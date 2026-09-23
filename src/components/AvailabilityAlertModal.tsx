import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Calendar, 
  Mail, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send,
  MessageSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space } from '../types';

interface AvailabilityAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  space?: Space | null;
  prefillStartDate?: string;
  prefillEndDate?: string;
}

export const AvailabilityAlertModal: React.FC<AvailabilityAlertModalProps> = ({
  isOpen,
  onClose,
  space,
  prefillStartDate,
  prefillEndDate,
}) => {
  const {
    currentUser,
    createAvailabilityAlert,
    triggerAvailabilityAlertSim,
    allSpaces,
    formatPrice,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

  const targetSpace = space || allSpaces[0];

  const [startDate, setStartDate] = useState(prefillStartDate || tomorrowStr);
  const [endDate, setEndDate] = useState(prefillEndDate || nextWeekStr);
  const [isMultiDay, setIsMultiDay] = useState(true);
  const [timeSlot, setTimeSlot] = useState('full_day');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [phone, setPhone] = useState(currentUser.phone || '+234 803 123 4567');
  const [email, setEmail] = useState(currentUser.email || 'user@workmail.ng');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAlertId, setCreatedAlertId] = useState<string | null>(null);
  const [simulatedDispatch, setSimulatedDispatch] = useState<{
    smsMessage?: string;
    emailSubject?: string;
  } | null>(null);

  useEffect(() => {
    if (prefillStartDate) setStartDate(prefillStartDate);
    if (prefillEndDate) setEndDate(prefillEndDate);
    if (currentUser?.phone) setPhone(currentUser.phone);
    if (currentUser?.email) setEmail(currentUser.email);
    setCreatedAlertId(null);
    setSimulatedDispatch(null);
  }, [isOpen, prefillStartDate, prefillEndDate, currentUser]);

  if (!isOpen || !targetSpace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsEnabled && !emailEnabled) {
      alert('Please enable at least one notification channel (SMS or Email).');
      return;
    }

    setIsSubmitting(true);
    const newAlert = createAvailabilityAlert({
      spaceId: targetSpace.id,
      spaceTitle: targetSpace.title,
      spaceImage: targetSpace.featuredImage,
      spaceCity: targetSpace.city,
      spaceNeighborhood: targetSpace.neighborhood,
      userId: currentUser.id,
      userName: currentUser.name,
      preferredStartDate: startDate,
      preferredEndDate: isMultiDay ? endDate : undefined,
      timeSlot: timeSlot === 'full_day' ? 'Full Day Access' : timeSlot === 'morning' ? '08:00 - 13:00' : '13:00 - 18:00',
      channels: {
        sms: smsEnabled,
        email: emailEnabled,
        inApp: true,
      },
      contactEmail: email,
      contactPhone: phone,
    });

    setIsSubmitting(false);
    setCreatedAlertId(newAlert.id);
  };

  const handleTestDispatch = () => {
    if (!createdAlertId) return;
    const res = triggerAvailabilityAlertSim(createdAlertId);
    if (res.success) {
      setSimulatedDispatch({
        smsMessage: res.smsMessage,
        emailSubject: res.emailSubject,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F2] dark:bg-[#0F766E]/15 border border-[#0F766E]/30 flex items-center justify-center text-[#0F766E]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Space Availability Alert</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Instant SMS & Email alert when dates open up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Preview */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151]">
          <img
            src={targetSpace.featuredImage}
            alt={targetSpace.title}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] truncate">{targetSpace.title}</h4>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">{targetSpace.neighborhood}, {targetSpace.city}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#0F766E]">
              <span>{formatPrice(targetSpace.pricePerHour)}/hr</span>
              <span className="text-[#9CA3AF]">•</span>
              <span>{formatPrice(targetSpace.pricePerDay || targetSpace.pricePerHour * 8)}/day</span>
            </div>
          </div>
        </div>

        {createdAlertId ? (
          /* Confirmation State with 1-Tap Test Dispatch */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#E6F4F2] dark:bg-[#0F766E]/10 border border-[#0F766E]/30 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-[#E6F4F2] dark:bg-[#0F766E]/20 text-[#0F766E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Availability Alert Activated!</h4>
              <p className="text-xs text-[#4B5563] dark:text-[#CBD5E1] leading-relaxed">
                You will receive an automated priority alert on <span className="text-[#111827] dark:text-[#F9FAFB] font-semibold">{email}</span> {smsEnabled && `and SMS on `}<span className="text-[#111827] dark:text-[#F9FAFB] font-semibold">{phone}</span> the exact second desks or passes free up for {startDate}{isMultiDay && endDate ? ` → ${endDate}` : ''}.
              </p>
            </div>

            {/* Test Simulation Trigger Button */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0F766E]" />
                  <span>Test Notification Dispatch</span>
                </span>
                <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">Simulation Ready</span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                Trigger a simulated host desk release now to preview the SMS & Email notification payload immediately.
              </p>
              <button
                type="button"
                onClick={handleTestDispatch}
                className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D625C] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Desk Release & Dispatch Alerts</span>
              </button>
            </div>

            {/* Simulated Messages Feedback */}
            {simulatedDispatch && (
              <div className="space-y-2.5 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#0F766E]/40 text-xs">
                <div className="text-[11px] font-mono font-bold text-[#0F766E] uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulated Multi-Channel Delivery Logs:</span>
                </div>
                {smsEnabled && (
                  <div className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-[11px] space-y-1">
                    <div className="text-[#0F766E] font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>SMS Gateway (Delivered to {phone})</span>
                    </div>
                    <p className="text-[#4B5563] dark:text-[#CBD5E1] font-mono">{simulatedDispatch.smsMessage}</p>
                  </div>
                )}
                {emailEnabled && (
                  <div className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-[11px] space-y-1">
                    <div className="text-[#0F766E] font-bold flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>Email Dispatch (Delivered to {email})</span>
                    </div>
                    <p className="text-[#4B5563] dark:text-[#CBD5E1] font-mono">{simulatedDispatch.emailSubject}</p>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-xs font-bold text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151] cursor-pointer shadow-2xs"
            >
              Done & Close
            </button>
          </div>
        ) : (
          /* Form for setting preferences */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Preferred Dates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Preferred Dates</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsMultiDay(false)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      !isMultiDay ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                    }`}
                  >
                    Single Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMultiDay(true)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      isMultiDay ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                    }`}
                  >
                    Extended Range
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E] font-mono cursor-pointer"
                    required
                  />
                </div>
                {isMultiDay ? (
                  <div>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mb-1">End Date</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || todayStr}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E] font-mono cursor-pointer"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Time Preference</span>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E] cursor-pointer"
                    >
                      <option value="full_day">All Day (Full Pass)</option>
                      <option value="morning">Morning (08:00 - 13:00)</option>
                      <option value="afternoon">Afternoon (13:00 - 18:00)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Delivery Channels (SMS & Email) */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider font-mono">
                Alert Delivery Channels
              </label>

              {/* SMS Preference */}
              <div 
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  smsEnabled ? 'bg-[#F8FAFC] dark:bg-[#1F2937] border-[#0F766E]/40' : 'bg-white dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    smsEnabled ? 'bg-[#E6F4F2] dark:bg-[#0F766E]/20 text-[#0F766E]' : 'bg-[#F1F5F9] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center gap-1.5">
                      <span>SMS Mobile Alert</span>
                      <span className="text-[9px] font-mono text-[#0F766E] bg-[#E6F4F2] dark:bg-[#0F766E]/10 px-1.5 py-0.2 rounded">
                        Instant SMS
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Receive immediate SMS when booking unlocks</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={() => {}}
                  className="rounded text-[#0F766E] focus:ring-0 cursor-pointer"
                />
              </div>

              {smsEnabled && (
                <div className="pl-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E] font-mono"
                    required={smsEnabled}
                  />
                </div>
              )}

              {/* Email Preference */}
              <div 
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  emailEnabled ? 'bg-[#F8FAFC] dark:bg-[#1F2937] border-[#0F766E]/40' : 'bg-white dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    emailEnabled ? 'bg-[#E6F4F2] dark:bg-[#0F766E]/20 text-[#0F766E]' : 'bg-[#F1F5F9] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center gap-1.5">
                      <span>Email Notification</span>
                      <span className="text-[9px] font-mono text-[#0F766E] bg-[#E6F4F2] dark:bg-[#0F766E]/10 px-1.5 py-0.2 rounded">
                        Direct Inbox
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Includes instant 1-tap pass checkout link</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={() => {}}
                  className="rounded text-[#0F766E] focus:ring-0 cursor-pointer"
                />
              </div>

              {emailEnabled && (
                <div className="pl-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.ng"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E] font-mono"
                    required={emailEnabled}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#0F766E] hover:bg-[#0D625C] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{isSubmitting ? 'Activating Alert...' : 'Activate Availability Alert'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
