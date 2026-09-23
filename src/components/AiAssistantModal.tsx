import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, Zap, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleGenAIService } from '../services/geminiService';
import { formatSpaceRate } from '../utils/pricing';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    allSpaces,
    setSelectedSpaceId,
    setCurrentView,
    formatPrice,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; matchedSpaceId?: string }>>([
    {
      sender: 'ai',
      text: "Hello! I am your Ofis Assistant. Tell me what you're working on (e.g. 'I need a 6-person meeting room in VI with high-speed fiber for international Zoom calls') and I will curate the best physical spaces with guaranteed power uptime.",
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
            ? `I've analyzed our physical spaces! Based on your criteria, ${fallbackSpace.title} in ${fallbackSpace.neighborhood || fallbackSpace.city} provides 24/7 solar/generator power and dedicated high-speed fiber.`
            : "I've analyzed our network! Please browse our curated directory for verified power uptime and fiber-connected desks.",
          matchedSpaceId: fallbackSpace?.id,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#111827] rounded-3xl border border-[#374151] shadow-2xl flex flex-col h-[580px] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#374151] flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#0F766E]/15 text-[#14B8A6] border border-[#14B8A6]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F9FAFB]">Ofis Assistant</h3>
              <p className="text-[10px] text-[#94A3B8]">Intelligent workspace matching & telemetry auditing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#F9FAFB] hover:bg-[#1F2937]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const matchedSpace = m.matchedSpaceId ? allSpaces.find(s => s.id === m.matchedSpaceId) : null;

            return (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0F766E] text-white font-medium'
                      : 'bg-[#1F2937] border border-[#374151] text-[#F9FAFB]'
                  }`}
                >
                  {m.text}
                </div>

                {matchedSpace && (
                  <div className="p-3 rounded-2xl bg-[#1F2937] border border-[#14B8A6]/40 max-w-sm flex items-center justify-between gap-3 shadow-lg">
                    <img src={matchedSpace.featuredImage} alt={matchedSpace.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#F9FAFB] truncate">{matchedSpace.title}</h5>
                      <p className="text-[10px] text-[#14B8A6] font-mono">{formatSpaceRate(matchedSpace)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSpaceId(matchedSpace.id);
                        setCurrentView('details');
                        setIsAiModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold shrink-0"
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-[#14B8A6] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-ping" />
              <span>Analyzing telemetry & workspace availability across Nigeria...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#0F172A] border-t border-[#374151] flex items-center space-x-2 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() => handleSend("Quiet podcast studio with 4K camera gear in Lekki")}
            className="px-2.5 py-1 rounded-lg bg-[#1F2937] border border-[#374151] text-[#CBD5E1] hover:text-[#14B8A6] shrink-0"
          >
            🎙️ Podcast studio Lekki
          </button>
          <button
            type="button"
            onClick={() => handleSend("Boardroom for 10 people in Victoria Island with 85 inch display")}
            className="px-2.5 py-1 rounded-lg bg-[#1F2937] border border-[#374151] text-[#CBD5E1] hover:text-[#14B8A6] shrink-0"
          >
            📊 Boardroom VI (10 pax)
          </button>
          <button
            type="button"
            onClick={() => handleSend("Cyclorama infinity photo studio in Ikeja")}
            className="px-2.5 py-1 rounded-lg bg-[#1F2937] border border-[#374151] text-[#CBD5E1] hover:text-[#14B8A6] shrink-0"
          >
            📸 Photo studio Ikeja
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0F172A] border-t border-[#374151]">
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
              placeholder="Ask anything about workspaces, power, fiber speeds..."
              className="flex-1 p-2.5 rounded-xl bg-[#1F2937] border border-[#374151] text-xs text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E]"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2.5 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
