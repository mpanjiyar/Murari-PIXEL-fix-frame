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

  // Re-open from floating launcher - opens offer popup
  const handleReopen = () => {
    setIsOpen(true);
  };

  const handlePrimaryAction = () => {
    handleClose();
    onUnlockPack();
  };

  const handleSecondaryAction = () => {
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

              {/* Header Actions: Close Button */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close offer popup"
                  className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer border ${
                    isLight
                      ? 'text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border-slate-200 shadow-xs'
                      : 'text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 border-white/10'
                  }`}
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                {/* Header Badge & Custom Logo */}
                <div className="flex flex-wrap items-center gap-2 pr-12 sm:pr-14">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase shadow-xs border ${
                    isLight
                      ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-black'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-black'
                  }`}>
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
                      <Sparkles size={13} className={isLight ? 'text-amber-800 fill-amber-700/30 animate-pulse' : 'text-amber-400 fill-amber-400/30 animate-pulse'} />
                    )}
                    <span>{config.badgeText || '🎉 PUJA SPECIAL OFFER'}</span>
                  </div>

                  {config.discountBadge && (
                    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold'
                    }`}>
                      <Zap size={11} className={isLight ? 'fill-emerald-800 text-emerald-800' : 'fill-emerald-400 text-emerald-400'} />
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
                        <span className={isLight ? 'text-amber-800 font-black' : `bg-gradient-to-r ${activeGradient} bg-clip-text text-transparent`}>
                          {config.headline.split('—')[1]}
                        </span>
                      </>
                    ) : (
                      <span className={isLight ? 'text-slate-950 font-black' : `bg-gradient-to-r ${activeGradient} bg-clip-text text-transparent`}>
                        {config.headline}
                      </span>
                    )}
                  </h2>
                  <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                    {config.subheadline}
                  </p>
                </div>

                {/* Categories Grid Highlights - Click directs to Unlock Pack workflow (Payment & Admin Approval Required) */}
                {config.categories && config.categories.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-1 text-[10px] sm:text-xs font-mono">
                    {config.categories.map((cat, i) => (
                      <div
                        key={cat.id || i}
                        onClick={handlePrimaryAction}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all select-none cursor-pointer hover:scale-[1.02] shadow-xs ${
                          isLight
                            ? 'bg-slate-50 hover:bg-amber-50/70 border-slate-200 hover:border-amber-400 text-slate-900'
                            : 'bg-zinc-900/70 hover:bg-zinc-900 border-white/10 hover:border-amber-500/40 text-zinc-100'
                        }`}
                        title={`Click to unlock ${cat.label} (Payment & Admin Approval required)`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>{cat.label}</span>
                          <FolderLock size={11} className={isLight ? 'text-amber-700 shrink-0' : 'text-amber-400 shrink-0'} />
                        </div>
                        <div className={`flex items-center justify-between text-[9px] mt-1.5 pt-1 border-t border-dashed ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                          <span className={`font-mono font-black ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>{cat.count}</span>
                          <span className={`text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                            isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-zinc-300'
                          }`}>Locked</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price Display Card */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isLight
                      ? 'bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border-amber-300 shadow-sm'
                      : 'bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-orange-950/30 border-amber-500/30 shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] sm:text-xs uppercase font-mono tracking-wider font-bold ${
                        isLight ? 'text-slate-700' : 'text-zinc-400'
                      }`}>
                        {config.pricingBadge || 'Special Festive Deal'}
                      </span>
                      {config.originalPrice > 0 && (
                        <span className={`line-through text-xs sm:text-sm font-mono font-semibold ${
                          isLight ? 'text-slate-500' : 'text-zinc-500'
                        }`}>
                          {config.currency === 'INR' ? '₹' : config.currency}
                          {config.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        isLight ? 'text-slate-950' : 'text-amber-300'
                      }`}>
                        ONLY {config.currency === 'INR' ? '₹' : config.currency}
                        {config.offerPrice}/-
                      </span>
                      <span className={`text-[10px] sm:text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                      }`}>
                        {config.paymentType || 'One-Time Payment'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className={`text-[10px] uppercase font-mono block font-black tracking-wider ${
                      isLight ? 'text-slate-700' : 'text-zinc-400'
                    }`}>
                      Order Delivery
                    </span>
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      <span className={`text-[11px] font-mono font-bold ${
                        isLight ? 'text-slate-900' : 'text-zinc-200'
                      }`}>
                        Instant Verification
                      </span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                        isLight
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        🔒 150K Reels
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="flex-1 py-3.5 px-6 rounded-xl sm:rounded-2xl font-mono font-black text-xs sm:text-sm tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{config.primaryButtonText || 'CLAIM PUJA OFFER — ₹199'}</span>
                    <ArrowRight size={16} className="stroke-[3]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSecondaryAction}
                    className={`py-3.5 px-5 rounded-xl sm:rounded-2xl font-mono font-bold text-xs sm:text-sm tracking-wider uppercase border transition-all cursor-pointer ${
                      isLight
                        ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-xs'
                        : 'border-white/15 bg-white/5 hover:bg-white/10 text-white shadow-xs'
                    }`}
                  >
                    <span>{config.secondaryButtonText || 'Explore Categories'}</span>
                  </button>
                </div>

                {/* Trust Badges Footer & WhatsApp Support Link */}
                <div className={`pt-3 flex flex-wrap items-center justify-between text-[10px] font-mono gap-2 border-t ${
                  isLight ? 'border-slate-200 text-slate-700 font-semibold' : 'border-white/10 text-zinc-300 font-medium'
                }`}>
                  {config.trustBadges && config.trustBadges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      {config.trustBadges.map((badge, idx) => (
                        <span key={idx} className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 size={12} className={isLight ? 'text-emerald-700 shrink-0' : 'text-emerald-400 shrink-0'} />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {config.supportLink && (
                    <a
                      href={config.supportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-colors ml-auto cursor-pointer ${
                        isLight
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                      }`}
                      title="Contact support on WhatsApp"
                    >
                      <MessageCircle size={12} /> Support Chat
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
              aria-label="Reopen Puja Offer"
              title={effectiveIsAdmin ? "Reopen Offer · Double-click for Admin Edit" : "Reopen Puja Offer"}
              className={`group relative flex items-center gap-2.5 py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-left ${
                isLight
                  ? 'bg-white hover:bg-amber-50/70 border-amber-400 text-slate-900 shadow-amber-500/20'
                  : 'bg-zinc-950/95 hover:bg-zinc-900 border-amber-500/50 text-white shadow-black/60'
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
                <span className={`text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1 ${
                  isLight ? 'text-amber-900' : 'text-amber-400'
                }`}>
                  <span>{config.floatingBadgeTitle || '🎉 PUJA OFFER'}</span>
                </span>
                <span className={`text-[9px] sm:text-[10px] font-mono font-bold ${
                  isLight ? 'text-slate-700' : 'text-zinc-300'
                }`}>
                  {config.floatingBadgeSubtext || `150K+ Reels Pack · ₹${config.offerPrice}`}
                </span>
              </div>

              <div className={`ml-1 p-1 rounded-full group-hover:translate-x-0.5 transition-transform ${
                isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <ArrowRight size={12} className="stroke-[3]" />
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
