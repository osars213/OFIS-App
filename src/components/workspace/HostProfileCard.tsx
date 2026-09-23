import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  MessageSquare, 
  Award, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Space, HostProfile } from '../../types';
import { HostProfileModal } from './HostProfileModal';

interface HostProfileCardProps {
  host: HostProfile;
  space: Space;
  allSpaces: Space[];
  onContactHost: () => void;
  onSelectSpace?: (spaceId: string) => void;
}

export const HostProfileCard: React.FC<HostProfileCardProps> = ({
  host,
  space,
  allSpaces,
  onContactHost,
  onSelectSpace,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Host spaces count
  const hostSpaces = allSpaces.filter((s) => s.host.id === host.id);
  const yearsHosting = host.yearsHosting || 3;
  const rating = host.rating || 4.95;
  const responseMinutes = host.responseTimeMinutes || 10;
  const responseRate = host.responseRatePercent || 98;

  return (
    <>
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-5 shadow-2xs">
        
        {/* Top Host Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={host.avatar}
                alt={host.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#14B8A6] shadow-lg"
              />
              <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-[#0F766E] text-white shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">{host.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#0F766E]/15 border border-[#14B8A6]/30 text-[10px] font-mono font-bold text-[#14B8A6]">
                  Verified Host
                </span>
              </div>
              <p className="text-xs text-[#4B5563] dark:text-[#CBD5E1] font-medium">{host.companyName}</p>
              <div className="flex items-center space-x-2 mt-1 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                <span>Hosting for {yearsHosting} years</span>
                <span>•</span>
                <span>{hostSpaces.length || 1} Workspaces</span>
              </div>
            </div>
          </div>

          {/* Contact & View Profile Buttons */}
          <div className="flex items-center space-x-2 sm:self-center">
            <button
              type="button"
              onClick={onContactHost}
              className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white" />
              <span>Message Host</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              Profile
            </button>
          </div>
        </div>

        {/* Host Credentials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#E5E7EB] dark:border-[#374151]">
          
          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] dark:text-[#94A3B8] mb-1">
              <Star className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6]" />
              <span>Host Rating</span>
            </div>
            <div className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB] font-mono">
              {rating} / 5.0
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] dark:text-[#94A3B8] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Response Time</span>
            </div>
            <div className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB] font-mono">
              ~{responseMinutes} mins
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] dark:text-[#94A3B8] mb-1">
              <Award className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Response Rate</span>
            </div>
            <div className="text-sm font-bold text-[#14B8A6] font-mono">
              {responseRate}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] dark:text-[#94A3B8] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Identity Audit</span>
            </div>
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">
              Verified 100%
            </div>
          </div>

        </div>

        {/* Verification Guarantee Reassurance Note */}
        <div className="flex items-center space-x-2 text-xs text-[#4B5563] dark:text-[#CBD5E1] p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827]/50 border border-[#E5E7EB] dark:border-[#374151]">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span>
            This host is an OFIS Certified Workspace Partner. Instant digital access pass guaranteed.
          </span>
        </div>

      </div>

      {/* Host Full Profile Modal */}
      {isProfileModalOpen && (
        <HostProfileModal
          host={host}
          hostSpaces={hostSpaces}
          onClose={() => setIsProfileModalOpen(false)}
          onContact={() => {
            setIsProfileModalOpen(false);
            onContactHost();
          }}
          onSelectSpace={(spaceId) => {
            setIsProfileModalOpen(false);
            if (onSelectSpace) onSelectSpace(spaceId);
          }}
        />
      )}
    </>
  );
};
