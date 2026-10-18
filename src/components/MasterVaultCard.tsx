import React, { useState, useRef, useCallback } from 'react';
import {
  Folder,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

interface MasterVaultCardProps {
  masterDriveLink: string;
  isUnlocked?: boolean;
  customerName?: string;
  orderId?: string;
  currentTheme?: string;
  onLaunchSuccess?: () => void;
  onRequestUnlock?: () => void;
}

export const CANONICAL_MEGA_REELS_VAULT_URL = 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing';

export const MasterVaultCard: React.FC<MasterVaultCardProps> = ({
  masterDriveLink,
  isUnlocked = false,
  customerName,
  orderId,
  currentTheme = 'dark',
  onLaunchSuccess,
  onRequestUnlock,
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyFeedbackMsg, setCopyFeedbackMsg] = useState<string>('');
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const isLight = currentTheme === 'light';

  // Strict authorization: Populate destination if explicitly unlocked (using masterDriveLink or verified canonical vault URL)
  const resolvedLink = (masterDriveLink && masterDriveLink.trim()) || (isUnlocked ? CANONICAL_MEGA_REELS_VAULT_URL : '');
  const sanitizedUrl = isUnlocked ? resolvedLink : '';
  const isValidUrl = Boolean(isUnlocked && sanitizedUrl && (sanitizedUrl.startsWith('https://') || sanitizedUrl.startsWith('http://')));
  const isGoogleDrive = sanitizedUrl.includes('drive.google.com');
  const isFileFormat = sanitizedUrl.includes('/file/d/');
  const isFolderFormat = sanitizedUrl.includes('/folders/');

  // Launch Master Vault action
  const handleLaunchMasterVault = useCallback(() => {
    setLaunchError(null);

    if (!isUnlocked || !isValidUrl) {
      const msg = 'Access Locked: Without a valid registered 10-digit mobile number or approved Order ID, access cannot be granted.';
      setLaunchError(msg);
      if (onRequestUnlock) onRequestUnlock();
      return;
    }

    try {
      const newWindow = window.open(sanitizedUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setLaunchError('Browser pop-up blocked. Click the accessible direct link below to open.');
      } else {
        if (onLaunchSuccess) onLaunchSuccess();
      }
    } catch (err: any) {
      setLaunchError('Navigation was blocked by your browser. Please use the direct destination link below.');
    }
  }, [sanitizedUrl, isValidUrl, isUnlocked, onLaunchSuccess, onRequestUnlock]);

  // Copy Master Link action
  const handleCopyMasterLink = useCallback(async () => {
    if (isCopying) return;
    setIsCopying(true);
    setCopyStatus('idle');
    setCopyFeedbackMsg('');

    if (!isUnlocked || !isValidUrl || !sanitizedUrl) {
      setCopyStatus('error');
      setCopyFeedbackMsg('Access Locked: Valid mobile number or approved Order ID required.');
      setIsCopying(false);
      if (onRequestUnlock) onRequestUnlock();
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sanitizedUrl);
        setCopyStatus('success');
        setCopyFeedbackMsg('Master link copied successfully.');
      } else {
        // Fallback for older browsers or restricted iframe environments
        const textArea = document.createElement('textarea');
        textArea.value = sanitizedUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setCopyStatus('success');
          setCopyFeedbackMsg('Master link copied successfully.');
        } else {
          throw new Error('Clipboard copy command was rejected.');
        }
      }
    } catch (err) {
      setCopyStatus('error');
      setCopyFeedbackMsg('Clipboard access was denied by your browser. Please use the text link below.');
    } finally {
      setTimeout(() => {
        setIsCopying(false);
      }, 600);

      // Auto-clear success message after 4 seconds
      setTimeout(() => {
        setCopyStatus(prev => (prev === 'success' ? 'idle' : prev));
      }, 4000);
    }
  }, [sanitizedUrl, isValidUrl, isCopying]);

  return (
    <div
      id="master-vault-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-950 to-neutral-950 border border-teal-500/40 p-6 sm:p-8 md:p-9 shadow-2xl transition-all"
    >
      {/* Background radial glow accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Branding Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FF5500] to-orange-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shadow-orange-500/25 shrink-0">
              PF
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#FF5500] uppercase font-bold block">
                PIXEL FIX • DIGITAL CREATOR RESOURCES
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Centralized Google Drive Master Vault
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Access Unlocked
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <Lock size={12} />
                Requires Verification
              </span>
            )}
          </div>
        </div>

        {/* Heading & Title Area according to Section 5 requirements */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs uppercase tracking-wider font-bold">
            <Sparkles size={14} className="animate-pulse" />
            <span>AUTHORITATIVE REELS &amp; SHORTS VAULT</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            150K+ MEGA PACK <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              REELS &amp; SHORTS COLLECTION
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Explore your available resource collections from one organized, easy-to-use library.
            {customerName && (
              <span className="block mt-1 text-teal-300 text-xs font-mono">
                Licensed to: <strong className="text-white">{customerName}</strong> {orderId ? `(Order: ${orderId})` : ''}
              </span>
            )}
          </p>
        </div>

        {/* Description of Master Resource */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 shrink-0 mt-0.5">
              <Folder size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-white font-mono">
                Google Drive Master Repository
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                Contains the complete uncompressed 1080x1920 9:16 vertical MP4 library across all 53 categorized packs, including Anime, 4K Footage, Luxury, Comedy, Motivation, and Creator eBooks.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          {/* Action A: LAUNCH GOOGLE DRIVE MASTER VAULT */}
          <button
            type="button"
            onClick={handleLaunchMasterVault}
            className={`flex-1 py-4 px-6 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
              isUnlocked
                ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 hover:from-teal-400 hover:to-emerald-300 text-black shadow-teal-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30'
            }`}
            title={isUnlocked ? 'Launch Google Drive Master Vault in a new tab' : 'Access Locked: Valid mobile number or Order ID required'}
            aria-label={isUnlocked ? 'Launch Google Drive Master Vault' : 'Access Locked'}
          >
            {isUnlocked ? (
              <>
                <Folder size={18} className="shrink-0" />
                <span className="truncate">LAUNCH GOOGLE DRIVE MASTER VAULT</span>
                <ExternalLink size={16} className="shrink-0" />
              </>
            ) : (
              <>
                <Lock size={18} className="shrink-0 text-amber-400" />
                <span className="truncate">LOCKED • VERIFY MOBILE / ORDER ID</span>
              </>
            )}
          </button>

          {/* Action B: COPY MASTER LINK */}
          <button
            type="button"
            onClick={handleCopyMasterLink}
            disabled={!isUnlocked || isCopying}
            className={`py-4 px-5 rounded-2xl font-mono text-xs font-bold border transition-all flex items-center justify-center gap-2 shrink-0 ${
              !isUnlocked
                ? 'opacity-40 border-white/5 bg-transparent text-zinc-500 cursor-not-allowed'
                : copyStatus === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : copyStatus === 'error'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200 cursor-pointer'
            }`}
            title={!isUnlocked ? 'Locked: Verification required' : 'Copy Master Vault Link to Clipboard'}
            aria-label="Copy Master Link"
          >
            {copyStatus === 'success' ? (
              <>
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span className="font-bold">COPIED!</span>
              </>
            ) : (
              <>
                <Copy size={16} className="shrink-0" />
                <span>{isUnlocked ? 'COPY MASTER LINK' : 'LOCKED'}</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Messages */}
        {copyFeedbackMsg && (
          <div
            className={`text-xs font-mono p-3 rounded-xl border flex items-center gap-2 ${
              copyStatus === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/50 border-red-500/30 text-red-300'
            }`}
            role="status"
            aria-live="polite"
          >
            {copyStatus === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            <span>{copyFeedbackMsg}</span>
          </div>
        )}

        {launchError && (
          <div
            className="text-xs font-mono p-3 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 flex items-center gap-2"
            role="alert"
          >
            <AlertCircle size={15} className="shrink-0 text-amber-400" />
            <span>{launchError}</span>
          </div>
        )}

        {/* Accessible Direct Text Link & Google Drive Access Status Note */}
        <div className="pt-2 border-t border-white/10 space-y-2 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>Direct Link:</span>
              {isUnlocked && sanitizedUrl ? (
                <a
                  href={sanitizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 hover:text-teal-200 underline truncate max-w-[280px] sm:max-w-md inline-block align-bottom"
                  title={sanitizedUrl}
                >
                  {sanitizedUrl}
                </a>
              ) : (
                <span className="text-amber-400 font-mono">🔒 Locked — Requires Verified 10-digit Mobile or Order ID</span>
              )}
            </span>

            {isUnlocked && (
              <span className="text-[10px] text-zinc-500">
                Format: {isFileFormat ? 'Google Drive File (/file/d/)' : isFolderFormat ? 'Google Drive Folder (/folders/)' : 'Cloud Repository'}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-[10.5px] text-zinc-400 font-mono leading-relaxed">
            <Info size={14} className="text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-300">Google Drive Access Guidelines:</strong> If prompted by Google with <em>&quot;Request Access&quot;</em>, please ensure you are signed in to your primary Google Account in your browser. All permissions are verified for authorized purchasers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
