import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Star, 
  Plus, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  AlertCircle,
  Camera,
  Layers
} from 'lucide-react';

export interface PhotoUploadManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  featuredIndex?: number;
  onFeaturedChange?: (index: number) => void;
  category?: string;
  minPhotos?: number;
}

// Curated authentic workspace photos categorized for quick selection
const WORKSPACE_PRESETS: { label: string; category: string; url: string }[] = [
  {
    label: 'Modern Coworking Desks',
    category: 'coworking',
    url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Executive Glass Office',
    category: 'private-office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'High-Tech Boardroom / AV Display',
    category: 'meeting-room',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Acoustic Podcast & Media Studio',
    category: 'studio',
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Auditorium & Training Hall',
    category: 'training-room',
    url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Solar Inverter & Power Facility',
    category: 'power',
    url: 'https://images.unsplash.com/photo-1508873696983-2df570464756?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Espresso Bar & Cafe Lounge',
    category: 'lounge',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Outdoor Work Terrace',
    category: 'terrace',
    url: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1200&auto=format&fit=crop&q=80',
  },
];

export const PhotoUploadManager: React.FC<PhotoUploadManagerProps> = ({
  images,
  onChange,
  featuredIndex = 0,
  onFeaturedChange,
  category,
  minPhotos = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files (JPEG, PNG, WebP) are allowed');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Images must be under 10MB each');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Read files as base64 data URLs
    const readPromises = validFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then(newUrls => {
        const combined = [...images, ...newUrls];
        onChange(combined);
      })
      .catch(err => {
        console.error('Error reading files:', err);
        setErrorMessage('Failed to read image files. Please try again.');
      });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      const url = new URL(urlInput.trim());
      onChange([...images, url.toString()]);
      setUrlInput('');
      setShowUrlInput(false);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL');
    }
  };

  const handleAddPreset = (url: string) => {
    if (images.includes(url)) return;
    onChange([...images, url]);
    setErrorMessage(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    if (onFeaturedChange) {
      if (featuredIndex === indexToRemove) {
        onFeaturedChange(0);
      } else if (featuredIndex > indexToRemove) {
        onFeaturedChange(featuredIndex - 1);
      }
    }
  };

  const handleSetCover = (index: number) => {
    if (onFeaturedChange) {
      onFeaturedChange(index);
    } else {
      // Reorder array so index becomes 0
      const target = images[index];
      const rest = images.filter((_, idx) => idx !== index);
      onChange([target, ...rest]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-[#14B8A6]" />
            <span>Workspace Photos &amp; Facility Proof</span>
            <span className="text-[#FF5C5C] font-bold">*</span>
          </label>
          <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
            Upload clear pictures of work desks, meeting setups, and backup power equipment.
          </p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
            images.length >= minPhotos 
              ? 'bg-[#0F766E]/15 text-[#14B8A6]' 
              : 'bg-[#FF5C5C]/15 text-[#FF5C5C]'
          }`}>
            {images.length} / {minPhotos} min photo{minPhotos > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-xs text-[#FF5C5C] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-[#14B8A6] bg-[#0F766E]/10 scale-[1.01]' 
            : 'border-[#E5E7EB] dark:border-[#374151] hover:border-[#0F766E]/60 bg-[#F8FAFC] dark:bg-[#1F2937]/70 hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-center text-[#14B8A6] shadow-inner">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">
              Drag &amp; drop photos here, or <span className="text-[#14B8A6] underline">browse files</span>
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
              Supports JPEG, PNG, WebP up to 10MB per photo
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Add by URL or Add Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setShowUrlInput(!showUrlInput);
            setShowPresets(false);
          }}
          className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>Add Photo by URL</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowPresets(!showPresets);
            setShowUrlInput(false);
          }}
          className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>Choose Sample Workspace Photos</span>
        </button>
      </div>

      {/* Add by URL input drawer */}
      {showUrlInput && (
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2">
          <label className="text-[11px] font-bold text-[#4B5563] dark:text-[#CBD5E1]">Direct Image URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Sample Workspace Presets Grid */}
      {showPresets && (
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#111827] dark:text-[#F9FAFB]">Instant Workspace Photo Presets</span>
            <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">Click to attach</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WORKSPACE_PRESETS.map((preset, idx) => {
              const isSelected = images.includes(preset.url);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset.url)}
                  disabled={isSelected}
                  className={`relative rounded-xl overflow-hidden border text-left transition-all group ${
                    isSelected 
                      ? 'border-[#14B8A6] opacity-50 cursor-not-allowed' 
                      : 'border-[#E5E7EB] dark:border-[#374151] hover:border-[#0F766E] cursor-pointer'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="p-1.5 bg-[#111827]/90 backdrop-blur-sm">
                    <p className="text-[10px] font-medium text-[#F9FAFB] truncate">{preset.label}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 p-1 rounded-full bg-[#0F766E] text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploaded Photos Gallery Preview */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#CBD5E1]">
            <span>Attached Photos ({images.length})</span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">First photo is default cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => {
              const isCover = idx === featuredIndex;
              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl overflow-hidden border bg-white dark:bg-[#111827] group transition-all ${
                    isCover ? 'border-[#14B8A6] ring-2 ring-[#0F766E]/30 shadow-lg' : 'border-[#E5E7EB] dark:border-[#374151] hover:border-[#0F766E]'
                  }`}
                >
                  <div className="relative h-28 w-full bg-[#F1F5F9] dark:bg-[#1F2937]">
                    <img
                      src={imgUrl}
                      alt={`Workspace photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Cover Photo Badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center space-x-1 shadow-md">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Cover Photo</span>
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          title="Set as featured cover photo"
                          className="p-1.5 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white text-[10px] font-bold flex items-center space-x-1 transition-colors"
                        >
                          <Star className="w-3 h-3" />
                          <span>Make Cover</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Delete photo"
                        className="p-1.5 rounded-xl bg-[#FF5C5C]/80 hover:bg-[#FF5C5C] text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-1.5 text-center bg-[#F8FAFC] dark:bg-[#1F2937]">
                    <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] font-mono">Photo {idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
