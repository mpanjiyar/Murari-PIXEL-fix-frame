import React, { useState, useCallback } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Folder,
  Send,
  BookOpen,
  Wrench,
  Link as LinkIcon,
  HelpCircle,
  Lock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { MegaPackResource, ResourceAvailabilityStatus } from '../types';

export const CANONICAL_MEGA_REELS_VAULT_URL = '';

interface ResourceRegistryCardProps {
  resource: MegaPackResource;
  fallbackMasterUrl?: string;
  onCopy?: (url: string, title: string) => void;
  isCopied?: boolean;
  onRequestUnlock?: () => void;
}

export const ResourceRegistryCard: React.FC<ResourceRegistryCardProps> = ({
  resource,
  fallbackMasterUrl,
  onCopy,
  isCopied = false,
  onRequestUnlock,
}) => {
  const [localCopied, setLocalCopied] = useState<boolean>(false);
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  // Strict access check: Without verified authorization, destinationUrl is locked
  const rawUrl = (resource.destinationUrl && resource.destinationUrl.trim()) || (fallbackMasterUrl && fallbackMasterUrl.trim()) || '';
  const isLocked = Boolean(resource.isLocked === true || (!rawUrl));
  const destinationUrl = !isLocked ? rawUrl : '';

  const handleOpen = useCallback(() => {
    if (isLocked) {
      setLockNotice('Access locked: A valid registered mobile number or approved Order ID is required to access this resource.');
      setTimeout(() => setLockNotice(null), 4000);
      if (onRequestUnlock) onRequestUnlock();
      return;
    }
    try {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {
      window.location.href = destinationUrl;
    }
  }, [destinationUrl, isLocked, onRequestUnlock]);

  const handleCardClick = () => {
    handleOpen();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      setLockNotice('Access locked: Please verify your mobile number or Order ID.');
      setTimeout(() => setLockNotice(null), 4000);
      if (onRequestUnlock) onRequestUnlock();
      return;
    }
    if (onCopy) {
      onCopy(destinationUrl, resource.title);
    } else {
      try {
        navigator.clipboard.writeText(destinationUrl);
        setLocalCopied(true);
        setTimeout(() => setLocalCopied(false), 2500);
      } catch (_) {}
    }
  };

  // Status badge styling
  const renderStatusBadge = (status: ResourceAvailabilityStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Verified
          </span>
        );
      case 'auth_required':
        return (
          <span className="flex items-center gap-1 text-[9.5px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            <Lock size={10} />
            Google Login
          </span>
        );
      case 'permission_denied':
        return (
          <span className="flex items-center gap-1 text-[9.5px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <AlertTriangle size={10} />
            Permission Check
          </span>
        );
      case 'not_found':
        return (
          <span className="flex items-center gap-1 text-[9.5px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <XCircle size={10} />
            In Review
          </span>
        );
      case 'inconclusive':
      case 'admin_review':
      default:
        return (
          <span className="flex items-center gap-1 text-[9.5px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
            <HelpCircle size={10} />
            Active
          </span>
        );
    }
  };

  // Type icon
  const renderTypeIcon = (type?: string) => {
    switch (type) {
      case 'telegram':
        return <Send size={15} className="text-sky-400" />;
      case 'ebook':
        return <BookOpen size={15} className="text-emerald-400" />;
      case 'tool':
        return <Wrench size={15} className="text-amber-400" />;
      case 'link':
        return <LinkIcon size={15} className="text-teal-400" />;
      case 'drive_folder':
      case 'drive_file':
      default:
        return <Folder size={15} className="text-teal-400" />;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      tabIndex={0}
      role="button"
      className="group relative rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 p-5 transition-all duration-200 flex flex-col justify-between shadow-lg text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400"
      style={{ minHeight: '230px' }}
      title={`Click to automatically open ${resource.title}`}
      aria-label={`Open ${resource.title} in Google Drive`}
    >
      <div className="space-y-3 flex-1 flex flex-col pointer-events-none">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                resource.categoryColor || 'text-teal-400 bg-teal-500/10 border-teal-500/25'
              }`}
            >
              {resource.categoryLabel}
            </span>

            {resource.countBadge && (
              <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                {resource.countBadge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {renderStatusBadge(resource.availabilityStatus)}
            {renderTypeIcon(resource.resourceType)}
          </div>
        </div>

        {/* Resource Title */}
        <div className="space-y-1">
          <h4
            className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 break-words"
            title={resource.title}
          >
            {resource.title}
          </h4>

          {resource.badge && (
            <span className="text-[10.5px] font-mono text-zinc-400 block">
              Tag: <span className="text-zinc-300">{resource.badge}</span>
            </span>
          )}
        </div>

        {/* Resource Description */}
        <p className="text-[11px] leading-relaxed text-zinc-400 break-words line-clamp-3 flex-1">
          {resource.description || 'Verified curated digital creator video assets for high retention and engagement.'}
        </p>

        {lockNotice && (
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10.5px] font-mono text-amber-300">
            {lockNotice}
          </div>
        )}
      </div>

      {/* Card Action Controls pinned to bottom */}
      <div
        className="pt-4 mt-3 border-t border-white/10 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleOpen}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
            isLocked
              ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30'
              : 'bg-white/10 group-hover:bg-teal-500 group-hover:text-black text-white'
          }`}
          title={isLocked ? 'Access Locked: Valid mobile number or Order ID required' : `Open ${resource.title}`}
          aria-label={isLocked ? 'Access Locked' : `Open ${resource.title}`}
        >
          {isLocked ? (
            <>
              <Lock size={13} className="text-amber-400 shrink-0" />
              <span>LOCKED • VERIFY</span>
            </>
          ) : (
            <>
              <span>OPEN RESOURCE</span>
              <ExternalLink size={13} className="shrink-0" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={isLocked}
          className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            isLocked
              ? 'opacity-40 border-white/5 bg-transparent text-zinc-500 cursor-not-allowed'
              : isCopied || localCopied
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'border-white/10 bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white'
          }`}
          title={isLocked ? 'Locked: Verification required' : 'Copy Resource Link'}
          aria-label={`Copy link for ${resource.title}`}
        >
          {isCopied || localCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};
