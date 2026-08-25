import React from 'react';
import { 
  ArrowLeftRight, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Layers,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SavedComparison } from '../../types';

interface SavedComparisonsSectionProps {
  onSelectComparison?: (comparison: SavedComparison) => void;
  compact?: boolean;
}

export const SavedComparisonsSection: React.FC<SavedComparisonsSectionProps> = ({
  onSelectComparison,
  compact = false,
}) => {
  const {
    savedComparisons,
    deleteSavedComparison,
    loadSavedComparison,
    allSpaces,
  } = useApp();

  if (savedComparisons.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#18201B] border border-[#232D28] text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-[#141816] border border-[#232D28] text-[#718079] flex items-center justify-center mx-auto">
          <Layers className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-[#F2F2F2]">No Saved Comparisons Yet</p>
        <p className="text-[11px] text-[#718079] max-w-xs mx-auto leading-relaxed">
          Compare up to 3 workspaces and tap &ldquo;Save Comparison&rdquo; to review or reopen them anytime.
        </p>
      </div>
    );
  }

  const handleOpen = (comp: SavedComparison) => {
    if (onSelectComparison) {
      onSelectComparison(comp);
    } else {
      loadSavedComparison(comp.id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9EABA3] flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00C878]" />
          <span>Saved Comparisons ({savedComparisons.length})</span>
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {savedComparisons.map((comp) => {
          const matchedSpaces = comp.spaceIds
            .map(id => allSpaces.find(s => s.id === id))
            .filter(Boolean);

          const formattedDate = new Date(comp.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={comp.id}
              className="p-3.5 rounded-2xl bg-[#18201B] border border-[#232D28] hover:border-[#00C878]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#00C878]/15 text-[#00C878] text-[10px] font-mono font-bold uppercase">
                    {comp.spacesCount} Spaces
                  </span>
                  <span className="text-[10px] text-[#718079] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#718079]" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                <h5 className="text-xs font-bold text-[#F2F2F2] truncate group-hover:text-[#00C878] transition-colors">
                  {comp.title}
                </h5>

                {comp.highlightSummary && (
                  <p className="text-[11px] text-[#718079] line-clamp-1">
                    {comp.highlightSummary}
                  </p>
                )}

                {/* Mini preview thumbnails */}
                <div className="flex items-center space-x-1.5 pt-1">
                  {matchedSpaces.map((space) => space && (
                    <div
                      key={space.id}
                      className="w-6 h-6 rounded-lg overflow-hidden border border-[#232D28] shrink-0"
                      title={space.title}
                    >
                      <img src={space.featuredImage} alt={space.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#232D28] shrink-0">
                <button
                  type="button"
                  onClick={() => deleteSavedComparison(comp.id)}
                  className="p-2 rounded-xl bg-[#2D1616] hover:bg-[#3D1A1A] border border-[#FF5C5C]/30 text-[#FF8585] text-xs transition-colors cursor-pointer"
                  title="Delete saved comparison"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpen(comp)}
                  className="px-3.5 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <span>Open Comparison</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
