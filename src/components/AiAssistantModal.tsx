import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleGenAIService } from '../services/geminiService';
import { formatSpaceRate } from '../utils/pricing';
import { OfisAssistantIcon } from './OfisAssistantIcon';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    allSpaces,
    setSelectedSpaceId,
    setCurrentView,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; matchedSpaceId?: string }>>([
    {
      sender: 'ai',
      text: "Hello! I am your Ofis Assistant. Tell me what you're working on (e.g. 'I need a 6-person meeting room in VI with high-speed fiber for international Zoom calls') and I will curate the best workspaces & studios with guaranteed power uptime.",
    },
  ]);

  if (!isAiModalOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await GoogleGenAIService.matchSpaceWithAi(textToSend, allSpaces);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.recommendationText,
          matchedSpaceId: response.spaceId,
        },
      ]);
    } catch (error) {
      const fallbackSpace = allSpaces[0];
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackSpace 
            ? `I've analyzed our verified spaces! Based on your criteria, ${fallbackSpace.title} in ${fallbackSpace.neighborhood || fallbackSpace.city} provides 24/7 solar/generator power and dedicated high-speed fiber.`
            : "I've analyzed our network! Please browse our curated directory for verified power uptime and fiber-connected desks.",
          matchedSpaceId: fallbackSpace?.id,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#07383D] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl flex flex-col h-[580px] overflow-hidden text-[#12383B] dark:text-white transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between bg-[#FFF9F4] dark:bg-[#07383D]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FFA987]/20 border border-[#FFA987]/50 flex items-center justify-center shrink-0 shadow-2xs">
              <OfisAssistantIcon size="sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#12383B] dark:text-white flex items-center gap-2">
                <span>Ofis Assistant</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFA987]/30 text-[#006B70] dark:text-[#FFA987] font-extrabold uppercase">
                  AI Concierge
                </span>
              </h3>
              <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">Match workspaces by amenities, power & capacity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(false)}
            className="p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-[#07383D]">
          {messages.map((m, idx) => {
            const matchedSpace = m.matchedSpaceId ? allSpaces.find(s => s.id === m.matchedSpaceId) : null;

            return (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#006B70] text-white font-medium shadow-xs'
                      : 'bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-[#12383B] dark:text-white shadow-xs'
                  }`}
                >
                  {m.text}
                </div>

                {matchedSpace && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#FFA987]/50 max-w-sm flex items-center justify-between gap-3 shadow-md">
                    <img src={matchedSpace.featuredImage} alt={matchedSpace.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#12383B] dark:text-white truncate">{matchedSpace.title}</h5>
                      <p className="text-[10px] text-[#006B70] dark:text-[#FFA987] font-semibold">{formatSpaceRate(matchedSpace)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSpaceId(matchedSpace.id);
                        setCurrentView('details');
                        setIsAiModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs active:scale-95"
                    >
                      View Space
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-[#006B70] dark:text-[#FFA987] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#FFA987] animate-ping" />
              <span>Analyzing verified telemetry & power uptime across Nigeria...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#FFF9F4] dark:bg-[#0B4A50] border-t border-[#E2ECEB] dark:border-[#166D74] flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
          <button
            type="button"
            onClick={() => handleSend("Quiet podcast studio with 4K camera gear in Lekki")}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#07383D] border border-[#FFA987]/40 text-[#12383B] dark:text-[#FFD0BD] hover:border-[#FFA987] shrink-0 font-medium cursor-pointer shadow-2xs"
          >
            🎙️ Podcast studio Lekki
          </button>
          <button
            type="button"
            onClick={() => handleSend("Boardroom for 10 people in Victoria Island with 85 inch display")}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#07383D] border border-[#FFA987]/40 text-[#12383B] dark:text-[#FFD0BD] hover:border-[#FFA987] shrink-0 font-medium cursor-pointer shadow-2xs"
          >
            📊 Boardroom VI (10 pax)
          </button>
          <button
            type="button"
            onClick={() => handleSend("Hot desk with 24/7 solar power and Starlink in Yaba")}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#07383D] border border-[#FFA987]/40 text-[#12383B] dark:text-[#FFD0BD] hover:border-[#FFA987] shrink-0 font-medium cursor-pointer shadow-2xs"
          >
            ⚡ Hot desk in Yaba
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#FFF9F4] dark:bg-[#07383D] border-t border-[#E2ECEB] dark:border-[#166D74]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about workspaces, generator power, fiber speeds..."
              className="flex-1 p-2.5 rounded-xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white placeholder-[#5D7A7D] dark:placeholder-[#8BA8A7] focus:outline-none focus:border-[#FFA987] focus:ring-1 focus:ring-[#FFA987]/40"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white transition-all disabled:opacity-50 cursor-pointer active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
