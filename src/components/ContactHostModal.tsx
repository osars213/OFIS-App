import React from 'react';
import { X, Phone, Mail, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactHostModal: React.FC = () => {
  const { contactHostData, setContactHostData, showToast } = useApp();

  if (!contactHostData) return null;

  const handleCall = () => {
    showToast(`Calling host concierge: ${contactHostData.phone}`);
  };

  const handleWhatsApp = () => {
    showToast('Opening WhatsApp verified host chat...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00C878]" />
            <h3 className="text-sm font-bold text-[#F2F2F2]">Contact Space Host</h3>
          </div>
          <button
            type="button"
            onClick={() => setContactHostData(null)}
            className="p-1 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-1">
            <h4 className="text-xs font-bold text-[#F2F2F2]">{contactHostData.spaceTitle}</h4>
            <p className="text-[11px] text-[#9EABA3]">Host: <strong className="text-[#F2F2F2]">{contactHostData.hostName}</strong></p>
            <div className="flex items-center gap-1 text-[10px] text-[#00C878] pt-1">
              <Clock className="w-3 h-3" />
              <span>Typical response time: Under 5 minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full py-2.5 px-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp / Message</span>
            </button>

            {contactHostData.phone && (
              <button
                type="button"
                onClick={handleCall}
                className="w-full py-2.5 px-3 rounded-xl bg-[#161D19] hover:bg-[#1C2420] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Call Concierge: {contactHostData.phone}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
