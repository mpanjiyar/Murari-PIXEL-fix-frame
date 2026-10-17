import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  FolderLock,
  Layers,
  Film,
  Download,
  Flame,
  Tag,
  Settings,
  Edit2,
  Sliders,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import {
  OfferPopupConfig,
  DEFAULT_OFFER_POPUP_CONFIG,
  FestivalThemeType
} from '../types';
import { OfferSectionAdminModal } from './OfferSectionAdminModal';

interface DurgaPujaOfferPopupProps {
  currentTheme?: 'light' | 'normal' | 'mono';
  onUnlockPack: () => void;
  onExploreCategories?: () => void;
  isCheckoutActive?: boolean;
  isAuthorized?: boolean;
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  onlyShowOnBooking?: boolean;
  activeTab?: string;
}

export const DurgaPujaOfferPopup: React.FC<DurgaPujaOfferPopupProps> = ({
  currentTheme = 'normal',
  onUnlockPack,
  onExploreCategories,
  isCheckoutActive = false,
  isAuthorized = false,
  triggerToast,
  onlyShowOnBooking = false,
  activeTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Initialize config with local storage cache or defaults
  const [config, setConfig] = useState<OfferPopupConfig>(() => {
    try {
      const cached = localStorage.getItem('mp_offer_popup_config');
      if (cached) {
        return { ...DEFAULT_OFFER_POPUP_CONFIG, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Error reading cached offer popup config:', e);
    }
    return DEFAULT_OFFER_POPUP_CONFIG;
  });

  // Admin setting option will ONLY show when admin is logged in from main admin page
  const effectiveIsAdmin = useMemo(() => {
    if (!isAuthorized) return false;
    try {
      return localStorage.getItem('mp_admin_authorized') === 'true';
    } catch {
      return false;
    }
  }, [isAuthorized]);

  // Fetch latest config from server API
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/reels/popup-config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(prev => ({ ...prev, ...data.config }));
          try {
            localStorage.setItem('mp_offer_popup_config', JSON.stringify(data.config));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Unable to fetch remote popup config:', err);
    }
  }, []);

  // Check session storage on mount and fetch config
  useEffect(() => {
    setMounted(true);
    fetchConfig();

    try {
      const alreadyDismissed = sessionStorage.getItem('durga_puja_offer_dismissed');
      if (!alreadyDismissed && !isCheckoutActive && config.enabled !== false) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      } else if (alreadyDismissed) {
        setIsDismissed(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, [isCheckoutActive, fetchConfig, config.enabled]);

  // Real-time updates via SSE listener
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/reels/events');
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.eventType === 'POPUP_CONFIG_UPDATED' && payload.config) {
            setConfig(payload.config);
            localStorage.setItem('mp_offer_popup_config', JSON.stringify(payload.config));
          } else if (payload.eventType === 'INITIAL_STATE' && payload.popupConfig) {
            setConfig(payload.popupConfig);
            localStorage.setItem('mp_offer_popup_config', JSON.stringify(payload.popupConfig));
          }
        } catch {}
      };
    } catch (e) {
      console.warn('SSE subscription failed:', e);
    }

    return () => {
      es?.close();
    };
  }, []);

  // Save handler called by Admin Modal
  const handleSaveConfig = async (newConfig: OfferPopupConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('mp_offer_popup_config', JSON.stringify(newConfig));
    } catch {}

    const res = await fetch('/api/reels/admin/popup-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });

    if (!res.ok) {
      throw new Error('Server returned non-200 status');
    }
  };

  // Handle closing popup
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsDismissed(true);
    try {
      sessionStorage.setItem('durga_puja_offer_dismissed', 'true');
    } catch {}
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isAdminModalOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, isAdminModalOpen]);

  // Re-open from floating launcher or navigate directly if custom link configured
  const handleReopen = () => {
    if (config.floatingBadgeLink && config.floatingBadgeLink.trim()) {
      window.open(config.floatingBadgeLink.trim(), '_blank', 'noopener,noreferrer');
      return;
    }
    setIsOpen(true);
  };

  const handlePrimaryAction = () => {
    handleClose();
    onUnlockPack();
  };

  const handleSecondaryAction = () => {
    if (config.secondaryButtonLink && config.secondaryButtonLink.trim()) {
      window.open(config.secondaryButtonLink.trim(), '_blank', 'noopener,noreferrer');
      return;
    }
    handleClose();
    if (onExploreCategories) {
      onExploreCategories();
    } else {
      onUnlockPack();
    }
  };

  if (!mounted) return null;

  const isLight = currentTheme === 'light';
  const isMono = currentTheme === 'mono';

  const themeGradients: Record<FestivalThemeType, string> = {
    durga: 'from-red-600 via-amber-500 to-orange-500',
    diwali: 'from-amber-400 via-yellow-500 to-red-500',
    orange: 'from-[#FF5500] via-orange-500 to-amber-500',
    emerald: 'from-emerald-500 via-teal-400 to-cyan-500',
    purple: 'from-purple-600 via-fuchsia-500 to-pink-500',
    gold: 'from-amber-300 via-yellow-500 to-amber-700',
  };

  const activeGradient = themeGradients[config.festivalTheme] || themeGradients.durga;

  return (
    <>
      {/* 1. Global Offer Modal */}
      <AnimatePresence>
        {isOpen && !isCheckoutActive && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="durga-puja-modal-title"
          >
            {/* Backdrop with restrained blur & celebratory warm ambient hue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Card Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`relative w-full max-w-lg md:max-w-xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl z-10 my-auto text-left transition-colors duration-200 ${
                isLight
                  ? 'bg-white border-amber-300/80 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)]'
                  : isMono
                  ? 'bg-zinc-950 border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
                  : 'bg-zinc-950/95 border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.28)] backdrop-blur-xl'
              }`}
            >
              {/* Top Festivity Glow Stripe */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${activeGradient} shrink-0`} />

              {/* Header Actions: Admin Inline Edit (ONLY for logged in admin from main admin page) & Close Button */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                {effectiveIsAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/85 hover:bg-[#FF5500] text-amber-300 hover:text-white border border-amber-500/40 hover:border-white/40 transition-all cursor-pointer shadow-md backdrop-blur-md"
                    title="Admin: Edit every detail of this section (link, text, logo, prices, chips)"
                  >
                    <Sliders size={12} className="animate-spin-slow" />
                    <span>Admin Edit</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close offer popup"
                  className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                {/* Header Badge & Custom Logo */}
                <div className="flex flex-wrap items-center gap-2 pr-28 sm:pr-32">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase bg-gradient-to-r from-red-500/20 via-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 shadow-sm">
                    {config.customLogoUrl ? (
                      config.customLogoLink ? (
                        <a
                          href={config.customLogoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                          title="Open logo link"
                        >
                          <img
                            src={config.customLogoUrl}
                            alt="Offer Logo"
                            className="w-4 h-4 object-contain rounded-xs"
                          />
                        </a>
                      ) : (
                        <img
                          src={config.customLogoUrl}
                          alt="Offer Logo"
                          className="w-4 h-4 object-contain rounded-xs"
                        />
                      )
                    ) : (
                      <Sparkles size={13} className="text-amber-400 fill-amber-400/30 animate-pulse" />
                    )}
                    <span>{config.badgeText || '🎉 DURGA PUJA SPECIAL OFFER'}</span>
                  </div>

                  {config.discountBadge && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <Zap size={11} className="fill-emerald-400" />
                      <span>{config.discountBadge}</span>
                    </span>
                  )}
                </div>

                {/* Main Headline & Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <h2
                    id="durga-puja-modal-title"
                    className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug ${
                      isLight ? 'text-slate-950' : 'text-white'
                    }`}
                  >
                    {config.headline.includes('—') ? (
                      <>
                        {config.headline.split('—')[0]}—{' '}
                        <span className={`bg-gradient-to-r ${activeGradient} bg-clip-text text-transparent`}>
                          {config.headline.split('—')[1]}
                        </span>
                      </>
                    ) : (
                      <span className={`bg-gradient-to-r ${activeGradient} bg-clip-text text-transparent`}>
                        {config.headline}
                      </span>
                    )}
                  </h2>
                  <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    {config.subheadline}
                  </p>
                </div>

                {/* Categories Grid Highlights - Each category pill supports custom link */}
                {config.categories && config.categories.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-1 text-[10px] sm:text-xs font-mono">
                    {config.categories.map((cat, i) => {
                      const isClickable = Boolean(cat.link && cat.link.trim());
                      return (
                        <div
                          key={cat.id || i}
                          onClick={isClickable ? () => window.open(cat.link!.trim(), '_blank', 'noopener,noreferrer') : undefined}
                          className={`p-2 rounded-xl border flex flex-col justify-between transition-all select-none ${
                            isClickable ? 'cursor-pointer hover:border-amber-500 hover:scale-[1.02] shadow-sm' : ''
                          } ${
                            isLight
                              ? 'bg-slate-50 border-slate-200/90 text-slate-800'
                              : 'bg-zinc-900/60 border-white/5 text-zinc-300'
                          }`}
                          title={isClickable ? `Open ${cat.label} link` : undefined}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold line-clamp-1">{cat.label}</span>
                            {isClickable && <ExternalLink size={10} className="text-amber-500 shrink-0" />}
                          </div>
                          <span className="text-[9px] text-amber-500 font-bold">{cat.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Price Display Card with Delivery Master Vault Link */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isLight
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-gradient-to-r from-amber-950/20 via-zinc-900/40 to-orange-950/20 border-amber-500/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-slate-400">
                        {config.pricingBadge || 'Special Festive Deal'}
                      </span>
                      {config.originalPrice > 0 && (
                        <span className="line-through text-xs sm:text-sm text-slate-500 font-mono font-medium">
                          {config.currency === 'INR' ? '₹' : config.currency}
                          {config.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono tracking-tight">
                        ONLY {config.currency === 'INR' ? '₹' : config.currency}
                        {config.offerPrice}/-
                      </span>
                      <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold font-mono">
                        {config.paymentType || 'One-Time Payment'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">
                      Delivery Access
                    </span>
                    <button
                      type="button"
                      onClick={handlePrimaryAction}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 justify-end transition-colors cursor-pointer"
                      title="Access strictly requires mobile number verification and admin approval"
                    >
                      <FolderLock size={12} className="text-amber-400" />
                      <span>Google Drive Master Vault</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        Locked
                      </span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="flex-1 py-3 px-5 rounded-xl sm:rounded-2xl font-mono font-black text-xs sm:text-sm tracking-wider uppercase text-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{config.primaryButtonText || 'UNLOCK YOUR PACK'}</span>
                    {config.primaryButtonLink ? (
                      <ExternalLink size={15} className="stroke-[2.5]" />
                    ) : (
                      <ArrowRight size={16} className="stroke-[3]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSecondaryAction}
                    className={`py-3 px-4 rounded-xl sm:rounded-2xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase border transition-all cursor-pointer ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{config.secondaryButtonText || 'Explore Categories'}</span>
                  </button>
                </div>

                {/* Trust Badges Footer & WhatsApp Support Link */}
                <div className="pt-2 flex flex-wrap items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400 gap-2 border-t border-slate-200/40 dark:border-white/5">
                  {config.trustBadges && config.trustBadges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      {config.trustBadges.map((badge, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {config.supportLink && (
                    <a
                      href={config.supportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[9.5px] font-mono text-emerald-500 hover:text-emerald-400 font-bold transition-colors ml-auto cursor-pointer"
                      title="Contact support on WhatsApp"
                    >
                      <MessageCircle size={11} /> Support Chat
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Floating Reopen Trigger (Shows on all pages when popup is closed) */}
      <AnimatePresence>
        {!isOpen && !isCheckoutActive && config.floatingBadgeEnabled !== false && (!onlyShowOnBooking || activeTab === 'contact') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-[90] select-none flex items-center gap-2"
          >
            {/* Target Button Selected by User: Reopens Offer */}
            <button
              type="button"
              onClick={handleReopen}
              onDoubleClick={(e) => {
                if (!effectiveIsAdmin) return;
                e.stopPropagation();
                setIsAdminModalOpen(true);
              }}
              onContextMenu={(e) => {
                if (!effectiveIsAdmin) return;
                e.preventDefault();
                setIsAdminModalOpen(true);
              }}
              aria-label="Reopen Durga Puja Offer"
              title={effectiveIsAdmin ? "Reopen Offer · Double-click for Admin Edit" : "Reopen Durga Puja Offer"}
              className={`group relative flex items-center gap-2 py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border shadow-[0_4px_25px_rgba(245,158,11,0.35)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-left ${
                isLight
                  ? 'bg-white/95 hover:bg-slate-50 border-amber-400 text-slate-900'
                  : 'bg-zinc-950/90 hover:bg-zinc-900 border-amber-500/50 text-white'
              }`}
            >
              {/* Glowing Pulse Dot or Custom Logo */}
              {config.customLogoUrl ? (
                <img
                  src={config.customLogoUrl}
                  alt="Badge Logo"
                  className="w-4 h-4 object-contain rounded-xs shrink-0"
                />
              ) : (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}

              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase text-amber-500 flex items-center gap-1">
                  <span>{config.floatingBadgeTitle || '🎉 DURGA PUJA OFFER'}</span>
                </span>
                <span className={`text-[8.5px] sm:text-[9.5px] font-mono ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  {config.floatingBadgeSubtext || `150K+ Reels Pack · ₹${config.offerPrice}`}
                </span>
              </div>

              <div className="ml-1 p-1 rounded-full bg-amber-500/20 text-amber-500 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={11} className="stroke-[3]" />
              </div>
            </button>

            {/* Quick Admin Customizer Button directly on the floating badge - ONLY visible when admin is logged in from main admin page */}
            {effectiveIsAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdminModalOpen(true);
                }}
                className="p-2 sm:p-2.5 rounded-full bg-black/85 hover:bg-[#FF5500] text-amber-300 hover:text-white border border-amber-500/50 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-110 active:scale-95"
                title="Admin Customizer: Change link, text, logo, prices, and categories in this section"
                aria-label="Admin edit offer section"
              >
                <Sliders size={14} className="stroke-[2.5]" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Offer Section Admin Customizer Modal - ONLY opens for authenticated admin */}
      {effectiveIsAdmin && (
        <OfferSectionAdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          currentConfig={config}
          onSave={handleSaveConfig}
          currentTheme={currentTheme}
          triggerToast={triggerToast}
        />
      )}
    </>
  );
};
