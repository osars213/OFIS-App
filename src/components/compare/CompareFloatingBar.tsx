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
                ? 'bg-[#121E18]/95 border-[#00C878]/50 text-[#00C878]'
                : compareToast.type === 'warning'
                ? 'bg-[#261E14]/95 border-[#F59E0B]/50 text-[#FBBF24]'
                : 'bg-[#18201B]/95 border-[#2E3B34] text-[#F2F2F2]'
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
                ? 'bg-[#121E18]/95 border-[#00C878]/50 text-[#00C878]'
                : compareToast.type === 'warning'
                ? 'bg-[#261E14]/95 border-[#F59E0B]/50 text-[#FBBF24]'
                : 'bg-[#18201B]/95 border-[#2E3B34] text-[#F2F2F2]'
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
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-[#141816]/95 backdrop-blur-xl border border-[#00C878]/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-3 sm:p-3.5 flex items-center justify-between gap-3 text-[#F2F2F2]"
      >
        {/* Left: Count & Thumbnails */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="w-7 h-7 rounded-xl bg-[#00C878]/15 border border-[#00C878]/30 text-[#00C878] flex items-center justify-center font-mono font-bold text-xs">
              {count}/3
            </span>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#F2F2F2] leading-tight">
                Compare Workspaces
              </div>
              <div className="text-[10px] text-[#718079]">
                {canCompare ? 'Ready for side-by-side match' : 'Select 1 more to compare'}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex items-center -space-x-2 overflow-hidden px-1">
            {selectedSpaces.map((space) => space && (
              <div
                key={space.id}
                className="relative group w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#00C878]/60 overflow-hidden shrink-0 shadow-md bg-[#18201B]"
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
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FF5C5C] transition-opacity cursor-pointer"
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-dashed border-[#2E3B34] bg-[#18201B]/50 flex items-center justify-center text-[#718079] text-[10px] font-mono shrink-0"
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
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-[#718079] hover:text-[#FF8585] hover:bg-[#231A1A] transition-colors text-xs font-semibold flex items-center space-x-1 cursor-pointer"
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
                ? 'bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D]'
                : 'bg-[#1E2522] hover:bg-[#26302B] text-[#00C878] border border-[#00C878]/30'
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
