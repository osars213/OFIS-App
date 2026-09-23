import React, { useState } from 'react';
import { X, Send, User, MessageSquare, Check, Sparkles, Building2 } from 'lucide-react';
import { Booking, HostMessage } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const HostMessagingModal: React.FC<HostMessagingModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const { hostMessages, sendHostMessage, currentUser } = useApp();
  const [inputText, setInputText] = useState('');

  if (!isOpen || !booking) return null;

  const bookingMessages = hostMessages.filter(m => m.bookingId === booking.id);

  const quickReplies = [
    `Welcome to ${booking.spaceTitle}! Your desk is sanitized & Wi-Fi code is ready.`,
    `Hi ${booking.userName.split(' ')[0]}, let us know if you need parking or cafeteria access!`,
    `Your turnstile digital pass is verified. Dual solar & Starlink fiber are running smoothly.`,
    `Need to extend your hours? You can extend anytime from your digital pass.`
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendHostMessage({
      bookingId: booking.id,
      spaceId: booking.spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name || 'OFIS Host',
      senderRole: 'host',
      content: inputText.trim(),
    });

    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    sendHostMessage({
      bookingId: booking.id,
      spaceId: booking.spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name || 'OFIS Host',
      senderRole: 'host',
      content: text,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1F2937] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center space-x-2">
                <span>Message {booking.userName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6]">
                  {booking.id}
                </span>
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] line-clamp-1">{booking.spaceTitle} • {booking.date}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread Box */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] min-h-[220px] max-h-[300px]">
          {bookingMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-[#6B7280] dark:text-[#9CA3AF] space-y-2">
              <MessageSquare className="w-8 h-8 text-[#9CA3AF] dark:text-[#4B5563]" />
              <p className="text-xs">No previous messages with this guest.</p>
              <span className="text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-semibold">Send a welcome message or quick instructions below!</span>
            </div>
          ) : (
            bookingMessages.map((m) => {
              const isHost = m.senderRole === 'host';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isHost ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{isHost ? 'You (Host)' : m.senderName}</span>
                    <span>•</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      isHost
                        ? 'bg-[#0F766E] text-white font-medium rounded-tr-none shadow-xs'
                        : 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151] rounded-tl-none shadow-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Response Templates */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-medium">
            <Sparkles className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Instant Host Quick Replies:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickReply(qr)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-[#F1F5F9] dark:bg-[#374151] hover:bg-[#E2E8F0] dark:hover:bg-[#4B5563] text-[#374151] dark:text-[#D1D5DB] hover:text-[#0F766E] dark:hover:text-[#14B8A6] border border-[#E5E7EB] dark:border-[#4B5563] text-left transition-colors cursor-pointer"
              >
                {qr.slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Send Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2 border-t border-[#E5E7EB] dark:border-[#374151]">
          <input
            type="text"
            placeholder={`Message ${booking.userName.split(' ')[0]}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F766E]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-2xl bg-[#0F766E] hover:bg-[#0B625C] disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
