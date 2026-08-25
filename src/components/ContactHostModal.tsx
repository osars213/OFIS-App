import React, { useState } from 'react';
import { X, Send, Phone, Mail, MessageSquare, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactHostModal: React.FC = () => {
  const { isContactOpen, setIsContactOpen, contactSpace } = useApp();
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isContactOpen || !contactSpace) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setIsContactOpen(false);
      setMessage('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-[#00C878]" />
            <h3 className="text-lg font-bold text-[#F2F2F2]">Direct Host Inquiry</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsContactOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#00C878]/15 text-[#00C878] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#F2F2F2]">Inquiry Dispatched!</h4>
            <p className="text-xs text-[#718079]">{contactSpace.host.name} will respond via SMS/Email shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#18201B] border border-[#232D28]">
              <img src={contactSpace.host.avatar} alt={contactSpace.host.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="text-xs font-bold text-[#F2F2F2]">{contactSpace.host.name}</div>
                <div className="text-[10px] text-[#718079]">{contactSpace.host.companyName}</div>
                <div className="text-[10px] text-[#00C878] font-mono mt-0.5">Typically responds in &lt;10 mins</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F2F2F2]">Message to Host</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about custom multi-day bookings, studio gear load-in, private parking, or catering..."
                rows={4}
                required
                className="w-full p-3 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none focus:border-[#00C878]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9EABA3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md"
              >
                Send Inquiry
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
