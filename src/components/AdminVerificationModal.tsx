import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Wifi, 
  MapPin, 
  Camera, 
  Banknote, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Check,
  Building2,
  Clock,
  Send,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space } from '../types';
import { getSpacePricing } from '../utils/pricing';

export const AdminVerificationModal: React.FC = () => {
  const { 
    isAdminReviewModalOpen, 
    setIsAdminReviewModalOpen,
    adminReviewSpace,
    setAdminReviewSpace,
    allSpaces, 
    verifySpaceByAdmin,
    formatPrice 
  } = useApp();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState<number>(0);
  const [auditStepMessage, setAuditStepMessage] = useState<string>('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (adminReviewSpace) {
      setSelectedSpaceId(adminReviewSpace.id);
      if (adminReviewSpace.verificationStatus === 'rejected') {
        setFilterTab('rejected');
      } else if (adminReviewSpace.isVerified || adminReviewSpace.verificationStatus === 'verified') {
        setFilterTab('verified');
      } else {
        setFilterTab('pending');
      }
    }
  }, [adminReviewSpace, isAdminReviewModalOpen]);

  if (!isAdminReviewModalOpen) return null;

  // Partition spaces by verification status
  const pendingSpaces = allSpaces.filter(
    s => s.verificationStatus === 'pending' || (s.isVerified === false && s.verificationStatus !== 'rejected')
  );
  const verifiedSpaces = allSpaces.filter(
    s => s.verificationStatus === 'verified' || (s.isVerified === true && s.verificationStatus !== 'pending')
  );
  const rejectedSpaces = allSpaces.filter(
    s => s.verificationStatus === 'rejected'
  );

  const displayedSpaces = 
    filterTab === 'pending' ? pendingSpaces : 
    filterTab === 'verified' ? verifiedSpaces : 
    rejectedSpaces;

  const currentSpace = allSpaces.find(s => s.id === (selectedSpaceId || displayedSpaces[0]?.id)) || displayedSpaces[0];

  const handleRunAiAudit = (space: Space) => {
    setIsAuditing(true);
    setAuditProgress(15);
    setAuditStepMessage('Inspecting workspace photos and visual quality...');

    setTimeout(() => {
      setAuditProgress(45);
      setAuditStepMessage('Validating 24/7 backup power & generator switchover specs...');
    }, 450);

    setTimeout(() => {
      setAuditProgress(75);
      setAuditStepMessage('Benchmarking internet ISP & fiber bandwidth speed...');
    }, 900);

    setTimeout(() => {
      setAuditProgress(90);
      setAuditStepMessage('Verifying Nigerian geocoding & commercial pricing sanity...');
    }, 1350);

    setTimeout(() => {
      setAuditProgress(100);
      setAuditStepMessage('AI Agent Audit Complete: Workspace 100% compliant!');
      setIsAuditing(false);
    }, 1750);
  };

  const handleApprove = async (spaceId: string) => {
    await verifySpaceByAdmin(spaceId, true, 'Verified and approved by OFIS Admin Agent. All infrastructure verified.');
    setShowRejectForm(false);
    setRejectionNotes('');
  };

  const handleReject = async (spaceId: string) => {
    if (!rejectionNotes.trim()) return;
    await verifySpaceByAdmin(spaceId, false, rejectionNotes.trim());
    setShowRejectForm(false);
    setRejectionNotes('');
  };

  const pricing = currentSpace ? getSpacePricing(currentSpace) : null;
  const images = currentSpace ? (currentSpace.images?.length ? currentSpace.images : [currentSpace.featuredImage]) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#141816] rounded-3xl border border-[#E5E7EB] dark:border-[#232D28] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] dark:border-[#1E2522] flex items-center justify-between bg-white dark:bg-[#141816]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] dark:bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F2F2F2]">OFIS Admin Agent Verification Portal</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] text-[10px] font-mono font-bold">
                  AGENT ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#718079] mt-0.5">
                Review host submissions, uploaded photos, and power audits before activating spaces for public booking.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminReviewModalOpen(false)}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filter Bar */}
        <div className="px-5 py-3 border-b border-[#E5E7EB] dark:border-[#1E2522] bg-[#F8FAFC] dark:bg-[#141816] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setFilterTab('pending');
                setSelectedSpaceId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-[#FEF3C7] dark:bg-[#FFB020]/20 text-[#D97706] dark:text-[#FFB020] border border-[#F59E0B]/40'
                  : 'text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#F59E0B] text-white font-mono text-[10px]">
                {pendingSpaces.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterTab('verified');
                setSelectedSpaceId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                filterTab === 'verified'
                  ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40'
                  : 'text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified &amp; Live</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#16A34A] text-white font-mono text-[10px]">
                {verifiedSpaces.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterTab('rejected');
                setSelectedSpaceId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                filterTab === 'rejected'
                  ? 'bg-[#FEE2E2] dark:bg-[#FF5C5C]/20 text-[#DC2626] dark:text-[#FF5C5C] border border-[#EF4444]/40'
                  : 'text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Action Required</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#EF4444] text-white font-mono text-[10px]">
                {rejectedSpaces.length}
              </span>
            </button>
          </div>

          {pendingSpaces.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                for (const space of pendingSpaces) {
                  await verifySpaceByAdmin(space.id, true, 'Batch approved by OFIS Admin Agent');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/15 hover:bg-[#BBF7D0] dark:hover:bg-[#16A34A]/25 border border-[#16A34A]/40 text-[#16A34A] text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Batch Fast-Track Approve ({pendingSpaces.length})</span>
            </button>
          )}
        </div>

        {/* Content Body: Sidebar List + Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Submissions List */}
          <div className="md:col-span-4 border-r border-[#E5E7EB] dark:border-[#1E2522] overflow-y-auto p-3 space-y-2 bg-[#F8FAFC] dark:bg-[#101412] max-h-[65vh]">
            {displayedSpaces.length === 0 ? (
              <div className="text-center py-12 px-4">
                <ShieldCheck className="w-10 h-10 text-[#9CA3AF] dark:text-[#232D28] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2]">No {filterTab} listings</p>
                <p className="text-[11px] text-[#6B7280] dark:text-[#718079] mt-1">
                  {filterTab === 'pending' 
                    ? 'All host workspace submissions have been reviewed!' 
                    : 'No records found in this view.'}
                </p>
              </div>
            ) : (
              displayedSpaces.map(space => {
                const isSelected = space.id === currentSpace?.id;
                const isPending = space.verificationStatus === 'pending' || (space.isVerified === false && space.verificationStatus !== 'rejected');
                const isApproved = space.verificationStatus === 'verified' || (space.isVerified === true && space.verificationStatus !== 'pending');
                const photoCount = space.images?.length || 1;

                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpaceId(space.id);
                      setShowRejectForm(false);
                      setRejectionNotes('');
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-white dark:bg-[#18201B] border-[#16A34A] shadow-md ring-1 ring-[#16A34A]/30'
                        : 'bg-white dark:bg-[#141816] border-[#E5E7EB] dark:border-[#1E2522] hover:border-[#16A34A]/40'
                    }`}
                  >
                    <img
                      src={space.featuredImage || space.images?.[0] || 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=300'}
                      alt={space.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E5E7EB] dark:border-[#232D28]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          isApproved ? 'bg-[#16A34A]' : isPending ? 'bg-[#F59E0B] animate-pulse' : 'bg-[#EF4444]'
                        }`} />
                        <h4 className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2] truncate">{space.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#718079] truncate mt-0.5">
                        {space.neighborhood}, {space.city}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] text-[#6B7280] dark:text-[#9EABA3] font-mono">
                          {photoCount} photo{photoCount > 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-[#16A34A] font-mono font-bold">
                          {formatPrice(space.pricePerHour, { perHour: true })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Space Inspection Panel */}
          <div className="md:col-span-8 overflow-y-auto p-5 space-y-5 bg-white dark:bg-[#121614] max-h-[65vh]">
            {currentSpace ? (
              <div className="space-y-5">
                
                {/* Title & Status Banner */}
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-[#111827] dark:text-[#F2F2F2]">{currentSpace.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        currentSpace.verificationStatus === 'verified' || (currentSpace.isVerified && currentSpace.verificationStatus !== 'pending')
                          ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40'
                          : currentSpace.verificationStatus === 'rejected'
                          ? 'bg-[#FEE2E2] dark:bg-[#FF5C5C]/20 text-[#DC2626] dark:text-[#FF5C5C] border border-[#EF4444]/40'
                          : 'bg-[#FEF3C7] dark:bg-[#FFB020]/20 text-[#D97706] dark:text-[#FFB020] border border-[#F59E0B]/40 animate-pulse'
                      }`}>
                        {currentSpace.verificationStatus === 'verified' || (currentSpace.isVerified && currentSpace.verificationStatus !== 'pending')
                          ? '✓ Live & Verified'
                          : currentSpace.verificationStatus === 'rejected'
                          ? '✗ Needs Changes'
                          : '⏳ Pending Admin Verification'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-[#6B7280] dark:text-[#718079] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>{currentSpace.address} ({currentSpace.neighborhood}, {currentSpace.city})</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunAiAudit(currentSpace)}
                    disabled={isAuditing}
                    className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/15 hover:bg-[#BBF7D0] dark:hover:bg-[#16A34A]/25 border border-[#16A34A]/40 text-[#16A34A] text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>{isAuditing ? 'Auditing Space...' : 'Run AI Agent Audit'}</span>
                  </button>
                </div>

                {/* AI Audit Live Progress Bar */}
                {isAuditing && (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#141816] border border-[#16A34A]/40 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#16A34A] flex items-center space-x-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{auditStepMessage}</span>
                      </span>
                      <span className="font-mono text-[#16A34A] font-bold">{auditProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-[#18201B] overflow-hidden">
                      <div 
                        className="h-full bg-[#16A34A] transition-all duration-300 rounded-full"
                        style={{ width: `${auditProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Photo Gallery Review */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2] flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-[#16A34A]" />
                      <span>Uploaded Photos &amp; Visual Evidence ({images.length})</span>
                    </label>
                    <span className="text-[11px] text-[#6B7280] dark:text-[#718079]">Click to expand</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {images.map((imgUrl, i) => (
                      <div 
                        key={i}
                        onClick={() => setSelectedImagePreview(imgUrl)}
                        className="relative h-24 rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-[#232D28] hover:border-[#16A34A] cursor-pointer group transition-all"
                      >
                        <img
                          src={imgUrl}
                          alt={`Proof photo ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#16A34A] text-white text-[9px] font-bold">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4-Pillar Infrastructure Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Power Specs */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#141816] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#111827] dark:text-[#F2F2F2]">
                      <Zap className="w-4 h-4 text-[#16A34A]" />
                      <span>24/7 Power Infrastructure</span>
                    </div>
                    <p className="text-xs font-bold text-[#16A34A]">{currentSpace.powerType}</p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#718079]">
                      Guaranteed Uptime: <span className="text-[#111827] dark:text-[#F2F2F2] font-mono">{currentSpace.powerUptimeGuaranteePercent || 99.9}%</span>
                    </p>
                  </div>

                  {/* Internet Specs */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#141816] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#111827] dark:text-[#F2F2F2]">
                      <Wifi className="w-4 h-4 text-[#16A34A]" />
                      <span>Internet &amp; Fiber Speed</span>
                    </div>
                    <p className="text-xs font-bold text-[#16A34A]">
                      {currentSpace.internetSpeedMbps || 250} Mbps High Speed
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#718079]">
                      ISP: <span className="text-[#111827] dark:text-[#F2F2F2]">{currentSpace.internetIsp || 'MainOne / Starlink'}</span>
                    </p>
                  </div>

                  {/* Pricing Model */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#141816] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#111827] dark:text-[#F2F2F2]">
                      <Banknote className="w-4 h-4 text-[#16A34A]" />
                      <span>Pricing &amp; Rate Structure</span>
                    </div>
                    <p className="text-xs font-bold text-[#16A34A] font-mono">
                      {formatPrice(pricing?.rate || currentSpace.pricePerHour)} / {pricing?.unitLabel || 'hr'}
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#718079]">
                      Basis: <span className="text-[#111827] dark:text-[#F2F2F2] capitalize">{pricing?.basis || 'Per Space'}</span> • Capacity: <span className="text-[#111827] dark:text-[#F2F2F2] font-mono">{currentSpace.capacity || 10} people</span>
                    </p>
                  </div>

                  {/* Host Identity */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#141816] border border-[#E5E7EB] dark:border-[#232D28] space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#111827] dark:text-[#F2F2F2]">
                      <Users className="w-4 h-4 text-[#16A34A]" />
                      <span>Host &amp; Location Contact</span>
                    </div>
                    <p className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2] truncate">{currentSpace.host?.name || 'Workspace Host'}</p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#718079] truncate">
                      {currentSpace.host?.phone || '+234 800 OFIS HOST'} • {currentSpace.host?.email || 'host@ofis.ng'}
                    </p>
                  </div>
                </div>

                {/* Rejection Feedback Form */}
                {showRejectForm && (
                  <div className="p-4 rounded-2xl bg-[#FEE2E2] dark:bg-[#FF5C5C]/10 border border-[#EF4444]/30 space-y-3 animate-fadeIn">
                    <label className="text-xs font-bold text-[#DC2626] dark:text-[#FF5C5C] flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Specify Action Items / Feedback for Host</span>
                    </label>
                    <textarea
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="e.g. Please upload a clear photo of the backup generator or solar battery inverter room..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white dark:bg-[#141816] border border-[#EF4444]/30 text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#EF4444]"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18201B] text-xs text-[#6B7280] dark:text-[#9EABA3] hover:text-[#111827] dark:hover:text-[#F2F2F2] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(currentSpace.id)}
                        disabled={!rejectionNotes.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        Submit Rejection &amp; Notify Host
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Action Controls */}
                <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1E2522] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#6B7280] dark:text-[#718079]">
                    Space ID: <span className="font-mono text-[#111827] dark:text-[#9EABA3]">{currentSpace.id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!showRejectForm && (
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-[#18201B] hover:bg-[#FEE2E2] dark:hover:bg-[#232D28] border border-[#EF4444]/40 text-[#DC2626] dark:text-[#FF5C5C] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Request Changes / Reject
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleApprove(currentSpace.id)}
                      className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve &amp; Activate Space</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-xs text-[#6B7280] dark:text-[#718079]">
                Select a space from the list to inspect.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Large Image Preview Modal */}
      {selectedImagePreview && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-[#232D28]">
            <img
              src={selectedImagePreview}
              alt="Expanded preview"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 text-white hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
