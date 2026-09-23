import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Star, 
  Clock, 
  Award, 
  MapPin, 
  Building2, 
  MessageSquare, 
  CheckCircle2, 
  Calendar,
  Zap,
  Phone,
  Mail
} from 'lucide-react';
import { HostProfile, Space } from '../../types';

interface HostProfileModalProps {
  host: HostProfile;
  hostSpaces: Space[];
  onClose: () => void;
  onContact: () => void;
  onSelectSpace: (spaceId: string) => void;
}

export const HostProfileModal: React.FC<HostProfileModalProps> = ({
  host,
  hostSpaces,
  onClose,
  onContact,
  onSelectSpace,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-[#374151] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-[#CBD5E1] hover:text-[#F9FAFB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Profile Header */}
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img
              src={host.avatar}
              alt={host.name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-[#14B8A6] shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0F766E] text-white shadow-md">
              <ShieldCheck className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#F9FAFB]">{host.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0F766E]/15 border border-[#14B8A6]/30 text-xs font-mono font-bold text-[#14B8A6]">
                Superhost
              </span>
            </div>
            <p className="text-sm text-[#CBD5E1] font-medium">{host.companyName}</p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-[#94A3B8]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Hosting since 2022 • Verified Real Estate Partner</span>
            </div>
          </div>
        </div>

        {/* Host Bio */}
        <div className="p-4 rounded-2xl bg-[#1F2937] border border-[#374151] space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">About the Host</h3>
          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            {host.bio || 
              `${host.name} oversees premier tech-focused and executive workspaces across Lagos and Abuja. All listings are equipped with Tier-1 high-speed fiber internet, automated dual power generation, and verified on-site hospitality managers.`}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#1F2937] border border-[#374151] text-center">
            <div className="text-[11px] text-[#94A3B8]">Guest Rating</div>
            <div className="text-base font-bold text-[#14B8A6] font-mono mt-0.5">
              {host.rating || 4.95} ★
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#1F2937] border border-[#374151] text-center">
            <div className="text-[11px] text-[#94A3B8]">Response Rate</div>
            <div className="text-base font-bold text-[#F9FAFB] font-mono mt-0.5">
              {host.responseRatePercent || 98}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#1F2937] border border-[#374151] text-center">
            <div className="text-[11px] text-[#94A3B8]">Response Time</div>
            <div className="text-base font-bold text-[#F9FAFB] font-mono mt-0.5">
              ~{host.responseTimeMinutes || 10} mins
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#1F2937] border border-[#374151] text-center">
            <div className="text-[11px] text-[#94A3B8]">Active Hubs</div>
            <div className="text-base font-bold text-[#F9FAFB] font-mono mt-0.5">
              {hostSpaces.length || 1}
            </div>
          </div>
        </div>

        {/* Host Workspaces */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#F9FAFB]">
            Workspaces Operated by {host.name} ({hostSpaces.length})
          </h3>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {hostSpaces.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSpace(s.id)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#1F2937] hover:bg-[#374151] border border-[#374151] hover:border-[#0F766E]/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={s.featuredImage}
                    alt={s.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#F9FAFB] group-hover:text-[#14B8A6] transition-colors">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {s.neighborhood}, {s.city} • {s.category}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#14B8A6]">
                    ₦{(s.pricePerHour || 0).toLocaleString()} / hr
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">{s.rating} ★</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#374151]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-xs font-semibold text-[#CBD5E1] transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onContact}
            className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Send Direct Message</span>
          </button>
        </div>

      </div>
    </div>
  );
};
