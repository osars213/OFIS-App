import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { spacesService } from '../services/spacesService';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  spaceSuggestionId?: string;
}

export const AiAssistantModal: React.FC = () => {
  const { isAiAssistantOpen, setIsAiAssistantOpen, setSelectedSpaceId, setCurrentView } = useApp();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your OFIS Workspace Concierge. Tell me where you want to work (e.g. Lekki, Ikeja, Maitama), your team size, or if you need podcast recording gear and solar power.',
    }
  ]);

  if (!isAiAssistantOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    const newMsg: Message = { sender: 'user', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setQuery('');

    // Process intelligent suggestion based on user query
    setTimeout(() => {
      let replyText = 'Here is a top-rated space in our network that fits your criteria with 100% uninterrupted solar power and high-speed fiber:';
      let suggestedId = 'space_1';

      const lower = userText.toLowerCase();
      if (lower.includes('podcast') || lower.includes('audio') || lower.includes('mic')) {
        replyText = 'For audio and video production, I highly recommend The Acoustic Podcast Suite in Victoria Island:';
        suggestedId = 'space_3';
      } else if (lower.includes('abuja') || lower.includes('maitama')) {
        replyText = 'In Abuja, Capital Hub Maitama is the premier executive coworking and meeting venue:';
        suggestedId = 'space_4';
      } else if (lower.includes('ikeja') || lower.includes('mainland')) {
        replyText = 'On the Lagos Mainland, Ikeja Tech Loft offers great community and dual silent generators:';
        suggestedId = 'space_2';
      } else if (lower.includes('lekki') || lower.includes('photo') || lower.includes('shoot')) {
        replyText = 'Check out Lekki Creative Loft & Daylight Studio, complete with profoto lighting and cyclorama wall:';
        suggestedId = 'space_5';
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText,
        spaceSuggestionId: suggestedId
      }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-5 space-y-4 flex flex-col h-[520px] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#00C878]/15 text-[#00C878]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F2F2F2]">OFIS Concierge AI</h3>
              <p className="text-[10px] text-[#00C878] font-medium">Smart Nigerian Workspace Finder</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(false)}
            className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m, idx) => {
            const suggestedSpace = m.spaceSuggestionId ? spacesService.getSpaceById(m.spaceSuggestionId) : null;
            return (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#00C878] text-[#0D0D0D] font-medium rounded-tr-none'
                      : 'bg-[#1A201D] text-[#F2F2F2] border border-[#232D28] rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>

                {/* Attached Space Card */}
                {suggestedSpace && (
                  <div
                    onClick={() => {
                      setSelectedSpaceId(suggestedSpace.id);
                      setCurrentView('details');
                      setIsAiAssistantOpen(false);
                    }}
                    className="mt-2 p-3 bg-[#121714] rounded-xl border border-[#00C878]/40 hover:border-[#00C878] cursor-pointer transition-all flex items-center space-x-3 w-full max-w-[85%]"
                  >
                    <img
                      src={suggestedSpace.featuredImage}
                      alt={suggestedSpace.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <h4 className="text-xs font-bold text-[#F2F2F2] truncate">{suggestedSpace.title}</h4>
                      <p className="text-[10px] text-[#9EABA3]">{suggestedSpace.neighborhood} • ₦{suggestedSpace.pricePerHour.toLocaleString()}/hr</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#00C878] flex-shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-2 border-t border-[#1E2522] flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Looking for a quiet 4-person room in Lekki with solar..."
            className="flex-1 p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] hover:bg-[#00E58B] transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
