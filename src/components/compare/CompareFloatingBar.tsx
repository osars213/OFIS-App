import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, 
  X, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Trash2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CompareFloatingBar: React.FC = () => {
  const {
    comparedSpaceIds,
    allSpaces,
    removeSpaceFromCompare,
    clearCompareList,
    setIsCompareModalOpen,
    isCompareModalOpen,
    compareToast,
  } = useApp();

  if (comparedSpaceIds.length === 0 || isCompareModalOpen) {
    return (
      <AnimatePresence>
        {compareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-20 md:bottom-6 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold flex items-center space-x-2.5 ${
              compareToast.type === 'success'
                ? 'bg-[#14BEB8]/95 border-[#14BEB8] text-white'
                : compareToast.type === 'warning'
                ? 'bg-[#FFA987] border-[#FFA987] text-[#12383B]'
                : 'bg-[#07383D]/95 border-[#166D74] text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{compareToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const selectedSpaces = comparedSpaceIds
    .map(id => allSpaces.find(s => s.id === id))
    .filter(Boolean);

  const count = comparedSpaceIds.length;
  const canCompare = count >= 2;

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {compareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-28 md:bottom-24 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold flex items-center space-x-2.5 ${
              compareToast.type === 'success'
                ? 'bg-[#14BEB8]/95 border-[#14BEB8] text-white'
                : compareToast.type === 'warning'
                ? 'bg-[#FFA987] border-[#FFA987] text-[#12383B]'
                : 'bg-[#07383D]/95 border-[#166D74] text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{compareToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Comparison Dock */}
      <motion.div
        id="compare-floating-dock"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-[#07383D]/95 backdrop-blur-xl border border-[#14BEB8]/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-3 sm:p-3.5 flex items-center justify-between gap-3 text-white"
      >
        {/* Left: Count & Thumbnails */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="w-7 h-7 rounded-xl bg-[#14BEB8]/20 border border-[#14BEB8]/40 text-[#28D2CB] flex items-center justify-center font-mono font-bold text-xs">
              {count}/3
            </span>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">
                Compare Workspaces
              </div>
              <div className="text-[10px] text-[#B8D1D0]">
                {canCompare ? 'Ready for side-by-side match' : 'Select 1 more to compare'}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center -space-x-2 overflow-hidden px-1">
            {selectedSpaces.map((space) => space && (
              <div
                key={space.id}
                className="relative group w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#14BEB8]/60 overflow-hidden shrink-0 shadow-md bg-[#0B4A50]"
                title={space.title}
              >
                <img
                  src={space.featuredImage}
                  alt={space.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSpaceFromCompare(space.id);
                  }}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FFA987] transition-opacity cursor-pointer"
                  title="Remove from comparison"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 3 - count }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-dashed border-[#166D74] bg-[#0B4A50]/50 flex items-center justify-center text-[#B8D1D0] text-[10px] font-mono shrink-0"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            id="clear-compare-dock-btn"
            onClick={clearCompareList}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-[#B8D1D0] hover:text-[#FFA987] hover:bg-[#0B4A50] transition-colors text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            title="Clear list"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>

          <button
            type="button"
            id="open-compare-modal-btn"
            onClick={() => setIsCompareModalOpen(true)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer ${
              canCompare
                ? 'bg-[#14BEB8] hover:bg-[#0EA8A2] text-white'
                : 'bg-[#0B4A50] hover:bg-[#105A60] text-[#28D2CB] border border-[#14BEB8]/30'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{canCompare ? `Compare (${count})` : `Compare (Add 1 more)`}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </>
  );
};
