import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Eye,
  MessageCircle,
  FolderLock,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react';
import {
  OfferPopupConfig,
  OfferPopupCategoryItem,
  DEFAULT_OFFER_POPUP_CONFIG,
  FestivalThemeType
} from '../types';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';

interface OfferSectionAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: OfferPopupConfig;
  onSave: (newConfig: OfferPopupConfig) => Promise<void>;
  currentTheme?: 'light' | 'normal' | 'mono';
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const OfferSectionAdminModal: React.FC<OfferSectionAdminModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
  currentTheme = 'normal',
  triggerToast,
}) => {
  const [form, setForm] = useState<OfferPopupConfig>({
    ...DEFAULT_OFFER_POPUP_CONFIG,
    ...currentConfig,
  });
  const [activeTab, setActiveTab] = useState<'text' | 'logo' | 'pricing' | 'links' | 'categories' | 'trust' | 'preview'>('text');
  const [isSaving, setIsSaving] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatCount, setNewCatCount] = useState('');
  const [newCatLink, setNewCatLink] = useState('');

  // Keep form updated when currentConfig changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        ...DEFAULT_OFFER_POPUP_CONFIG,
        ...currentConfig,
      });
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const isLight = currentTheme === 'light';

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      await onSave(form);
      if (triggerToast) {
        triggerToast('Festive offer section updated successfully! All links and content are live.', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save offer section details:', err);
      if (triggerToast) {
        triggerToast('Failed to save configuration. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setForm({ ...DEFAULT_OFFER_POPUP_CONFIG });
    if (triggerToast) {
      triggerToast('Restored default settings and links. Click "Save Live Changes" to commit.', 'info');
    }
  };

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const newItem: OfferPopupCategoryItem = {
      id: Date.now().toString(36),
      label: newCatLabel.trim(),
      count: newCatCount.trim() || '15K+',
      link: newCatLink.trim() || undefined,
    };
    setForm(prev => ({
      ...prev,
      categories: [...prev.categories, newItem]
    }));
    setNewCatLabel('');
    setNewCatCount('');
    setNewCatLink('');
  };

  const handleRemoveCategory = (id: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };

  const handleUpdateCategory = (id: string, updates: Partial<OfferPopupCategoryItem>) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const themeOptions: { id: FestivalThemeType; name: string; gradient: string }[] = [
    { id: 'durga', name: 'Durga Puja & Navratri', gradient: 'from-red-600 via-amber-500 to-orange-500' },
    { id: 'diwali', name: 'Diwali Spark', gradient: 'from-amber-400 via-yellow-500 to-red-500' },
    { id: 'orange', name: 'Pixel Fix Signature Neon', gradient: 'from-[#FF5500] via-orange-500 to-amber-500' },
    { id: 'emerald', name: 'Prosperity Emerald', gradient: 'from-emerald-500 via-teal-400 to-cyan-500' },
    { id: 'purple', name: 'Creator Royal Purple', gradient: 'from-purple-600 via-fuchsia-500 to-pink-500' },
    { id: 'gold', name: 'Golden Luxe VIP', gradient: 'from-amber-300 via-yellow-500 to-amber-700' },
  ];

  const currentThemeGradient = themeOptions.find(t => t.id === form.festivalTheme)?.gradient || 'from-red-600 via-amber-500 to-orange-500';

  // Responsive theme-aware class helpers
  const inputClass = isLight
    ? 'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-sans focus:border-amber-500 focus:bg-white outline-none transition-colors'
    : 'w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder:text-slate-500 text-xs font-sans focus:border-amber-500 focus:bg-slate-900 outline-none transition-colors';

  const smallInputClass = isLight
    ? 'w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:border-amber-500 focus:bg-white outline-none transition-colors'
    : 'w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:bg-slate-900 outline-none transition-colors';

  const labelClass = isLight
    ? 'block text-xs font-mono font-bold uppercase tracking-wider text-slate-800 mb-1.5'
    : 'block text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1.5';

  const smallLabelClass = isLight
    ? 'block text-[10px] font-mono text-slate-700 uppercase mb-1 font-bold'
    : 'block text-[10px] font-mono text-slate-400 uppercase mb-1 font-semibold';

  const cardBoxClass = isLight
    ? 'p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm'
    : 'p-4 rounded-2xl bg-white/[0.03] border border-white/10';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-admin-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl z-10 overflow-hidden text-left ${
            isLight
              ? 'bg-white border-amber-300/80 text-slate-900 shadow-xl'
              : 'bg-[#0a0d16] border-amber-500/30 text-white shadow-2xl'
          }`}
        >
          {/* Header Accent Line */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${currentThemeGradient}`} />

          {/* Modal Header */}
          <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-4 shrink-0 ${
            isLight ? 'bg-amber-50/60 border-slate-200 text-slate-900' : 'bg-black/30 border-white/10 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FF5500] to-amber-500 text-white shadow-md">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="offer-admin-modal-title" className={`text-base sm:text-lg font-black tracking-tight uppercase font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Festive Offer Section Customizer
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/40">
                    Admin Portal
                  </span>
                </div>
                <p className={`text-xs font-sans mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Customize all links, text headlines, logos, prices, categories, and trust badges live.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Close customizer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex items-center gap-1.5 p-2 sm:px-5 border-b overflow-x-auto scrollbar-none shrink-0 text-xs font-mono font-bold ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-black/40 border-white/5'
          }`}>
            {[
              { id: 'text', label: 'Headline & Copy', icon: Tag },
              { id: 'logo', label: 'Emblem & Theme', icon: ImageIcon },
              { id: 'pricing', label: 'Price & Terms', icon: DollarSign },
              { id: 'links', label: 'All Action Links', icon: LinkIcon, badge: 'All Links' },
              { id: 'categories', label: 'Categories Grid', icon: Layers },
              { id: 'trust', label: 'Badges & Switches', icon: CheckCircle2 },
              { id: 'preview', label: 'Live Preview', icon: Eye },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                      : isLight
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isActive ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB 1: HEADLINE & COPY */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Top Badge Label</label>
                    <LagFreeInput
                      type="text"
                      value={form.badgeText}
                      onChange={(e: any) => setForm({ ...form, badgeText: e.target.value })}
                      placeholder="e.g. 🎉 DURGA PUJA SPECIAL OFFER"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Discount Tag Badge</label>
                    <LagFreeInput
                      type="text"
                      value={form.discountBadge}
                      onChange={(e: any) => setForm({ ...form, discountBadge: e.target.value })}
                      placeholder="e.g. 90% OFF LIMITED TIME"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Main Section Headline</label>
                  <LagFreeInput
                    type="text"
                    value={form.headline}
                    onChange={(e: any) => setForm({ ...form, headline: e.target.value })}
                    placeholder="e.g. 150K+ MEGA PACK — REELS & SHORTS"
                    className={`${inputClass} font-bold text-sm`}
                  />
                  <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Use an em-dash (—) to split text so the second part receives the vibrant festival gradient.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Detailed Subheadline / Description</label>
                  <LagFreeTextArea
                    rows={3}
                    value={form.subheadline}
                    onChange={(e: any) => setForm({ ...form, subheadline: e.target.value })}
                    placeholder="Describe the pack value, high-retention formats, and ready-to-post vertical videos..."
                    className={`${inputClass} leading-relaxed resize-none`}
                  />
                </div>

                <div className={cardBoxClass}>
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider block mb-3 ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>
                    Floating Reopen Badge Display Labels
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={smallLabelClass}>Floating Title</label>
                      <LagFreeInput
                        type="text"
                        value={form.floatingBadgeTitle}
                        onChange={(e: any) => setForm({ ...form, floatingBadgeTitle: e.target.value })}
                        placeholder="e.g. 🎉 DURGA PUJA OFFER"
                        className={smallInputClass}
                      />
                    </div>
                    <div>
                      <label className={smallLabelClass}>Floating Subtitle</label>
                      <LagFreeInput
                        type="text"
                        value={form.floatingBadgeSubtext}
                        onChange={(e: any) => setForm({ ...form, floatingBadgeSubtext: e.target.value })}
                        placeholder="e.g. 150K+ Reels Pack · ₹199"
                        className={smallInputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EMBLEM & THEME PALETTE */}
            {activeTab === 'logo' && (
              <div className="space-y-6">
                <div className={cardBoxClass}>
                  <label className={labelClass}>Custom Logo / Emblem Image URL</label>
                  <p className={`text-[11px] mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Provide an image URL (PNG, SVG, JPG, WebP) to display as the custom emblem in the offer header badge and floating icon. Leave blank to use the animated festival sparkle icon.
                  </p>
                  <div className="flex gap-2">
                    <LagFreeInput
                      type="url"
                      value={form.customLogoUrl}
                      onChange={(e: any) => setForm({ ...form, customLogoUrl: e.target.value })}
                      placeholder="https://example.com/festive-logo.png"
                      className={`${inputClass} flex-1 font-mono`}
                    />
                    {form.customLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, customLogoUrl: '' })}
                        className="px-3 py-2 rounded-xl bg-red-500/15 text-red-500 hover:bg-red-500/25 text-xs font-mono font-bold cursor-pointer transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Logo Preview */}
                  {form.customLogoUrl && (
                    <div className={`mt-3 p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/10'
                    }`}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/10 dark:bg-black/60 border border-slate-200 dark:border-white/15 flex items-center justify-center p-1 shrink-0">
                        <img
                          src={form.customLogoUrl}
                          alt="Custom Offer Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as any).src = 'https://placehold.co/100x100?text=Invalid+URL';
                          }}
                        />
                      </div>
                      <div className="text-xs">
                        <span className="text-emerald-500 font-mono font-bold flex items-center gap-1">
                          <Check size={12} /> Custom Emblem Active
                        </span>
                        <span className={`text-[11px] block mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Will display inside the header and floating badge.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Logo Click Link */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                    <label className={smallLabelClass}>Emblem Click Destination Link (Optional)</label>
                    <div className="flex gap-2">
                      <LagFreeInput
                        type="url"
                        value={form.customLogoLink || ''}
                        onChange={(e: any) => setForm({ ...form, customLogoLink: e.target.value })}
                        placeholder="e.g. https://instagram.com/pixelfix or brand URL"
                        className={`${smallInputClass} font-mono`}
                      />
                      {form.customLogoLink && (
                        <button
                          type="button"
                          onClick={() => window.open(form.customLogoLink, '_blank')}
                          className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          title="Test Link in new tab"
                        >
                          <ExternalLink size={12} /> Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Festival Theme Palette Selection */}
                <div>
                  <label className={labelClass}>Section Festive Color Scheme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {themeOptions.map(theme => {
                      const isSelected = form.festivalTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setForm({ ...form, festivalTheme: theme.id })}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              : 'bg-black/30 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${theme.gradient} shrink-0 shadow-sm`} />
                            <div>
                              <span className={`text-xs font-mono font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {theme.name}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRICING & TERMS */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Special Offer Price (₹)</label>
                    <LagFreeInput
                      type="number"
                      value={form.offerPrice}
                      onChange={(e: any) => setForm({ ...form, offerPrice: Number(e.target.value) || 0 })}
                      className={`${inputClass} font-mono font-black text-sm`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Strikethrough Price (₹)</label>
                    <LagFreeInput
                      type="number"
                      value={form.originalPrice}
                      onChange={(e: any) => setForm({ ...form, originalPrice: Number(e.target.value) || 0 })}
                      className={`${inputClass} font-mono font-black text-sm`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Currency Code</label>
                    <LagFreeInput
                      type="text"
                      value={form.currency}
                      onChange={(e: any) => setForm({ ...form, currency: e.target.value })}
                      placeholder="INR or ₹"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Price Tag Headline</label>
                    <LagFreeInput
                      type="text"
                      value={form.pricingBadge}
                      onChange={(e: any) => setForm({ ...form, pricingBadge: e.target.value })}
                      placeholder="e.g. Special Festive Deal"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Payment Type Label</label>
                    <LagFreeInput
                      type="text"
                      value={form.paymentType}
                      onChange={(e: any) => setForm({ ...form, paymentType: e.target.value })}
                      placeholder="e.g. One-Time Payment"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Delivery Note</label>
                    <LagFreeInput
                      type="text"
                      value={form.deliveryNote}
                      onChange={(e: any) => setForm({ ...form, deliveryNote: e.target.value })}
                      placeholder="e.g. Google Drive Master Vault"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ALL ACTION LINKS & URLS */}
            {activeTab === 'links' && (
              <div className="space-y-5">
                <div className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
                  isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                }`}>
                  <Globe size={16} className="shrink-0 text-amber-500" />
                  <span>
                    Fully editable link manager. You can assign custom destinations to buttons, master vault delivery, support chats, and category cards.
                  </span>
                </div>

                {/* 1. Primary Action Button Link */}
                <div className={cardBoxClass}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>
                      1. Primary Action Button Link
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Main unlock CTA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={smallLabelClass}>Button Text Label</label>
                      <LagFreeInput
                        type="text"
                        value={form.primaryButtonText}
                        onChange={(e: any) => setForm({ ...form, primaryButtonText: e.target.value })}
                        placeholder="e.g. UNLOCK YOUR PACK"
                        className={`${smallInputClass} font-bold`}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>Destination URL (Optional)</label>
                      <div className="flex gap-2">
                        <LagFreeInput
                          type="url"
                          value={form.primaryButtonLink}
                          onChange={(e: any) => setForm({ ...form, primaryButtonLink: e.target.value })}
                          placeholder="Leave empty for automated UPI modal, or enter custom URL"
                          className={`${smallInputClass} font-mono`}
                        />
                        {form.primaryButtonLink && (
                          <button
                            type="button"
                            onClick={() => window.open(form.primaryButtonLink, '_blank')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            title="Test primary action link in new tab"
                          >
                            <ExternalLink size={12} /> Test
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-[10px] mt-2 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    💡 Default: Leaving the URL blank launches the integrated zero-delay UPI Checkout & verification workflow.
                  </p>
                </div>

                {/* 2. Secondary Action Button Link */}
                <div className={cardBoxClass}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                      2. Secondary Action Button Link
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Categories / Info CTA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={smallLabelClass}>Button Text Label</label>
                      <LagFreeInput
                        type="text"
                        value={form.secondaryButtonText}
                        onChange={(e: any) => setForm({ ...form, secondaryButtonText: e.target.value })}
                        placeholder="e.g. Explore Categories"
                        className={`${smallInputClass} font-bold`}
                      />
                    </div>

                    <div>
                      <label className={smallLabelClass}>Destination URL (Optional)</label>
                      <div className="flex gap-2">
                        <LagFreeInput
                          type="url"
                          value={form.secondaryButtonLink}
                          onChange={(e: any) => setForm({ ...form, secondaryButtonLink: e.target.value })}
                          placeholder="Leave empty for category browser, or enter custom URL"
                          className={`${smallInputClass} font-mono`}
                        />
                        {form.secondaryButtonLink && (
                          <button
                            type="button"
                            onClick={() => window.open(form.secondaryButtonLink, '_blank')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            title="Test secondary action link in new tab"
                          >
                            <ExternalLink size={12} /> Test
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Master Vault Google Drive Direct Link */}
                <div className={cardBoxClass}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>
                      <FolderLock size={14} className="text-amber-500" />
                      3. Google Drive Master Vault Direct Link
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Delivery target
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <LagFreeInput
                      type="url"
                      value={form.masterVaultLink || ''}
                      onChange={(e: any) => setForm({ ...form, masterVaultLink: e.target.value })}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className={`${smallInputClass} font-mono flex-1`}
                    />
                    {form.masterVaultLink && (
                      <button
                        type="button"
                        onClick={() => window.open(form.masterVaultLink, '_blank')}
                        className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Test drive link"
                      >
                        <ExternalLink size={12} /> Test Drive Link
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Support / WhatsApp Inquiry Link */}
                <div className={cardBoxClass}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>
                      <MessageCircle size={14} className="text-emerald-500" />
                      4. Customer Support / WhatsApp Link
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Assistance URL
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <LagFreeInput
                      type="url"
                      value={form.supportLink || ''}
                      onChange={(e: any) => setForm({ ...form, supportLink: e.target.value })}
                      placeholder="https://wa.me/919954000000?text=..."
                      className={`${smallInputClass} font-mono flex-1`}
                    />
                    {form.supportLink && (
                      <button
                        type="button"
                        onClick={() => window.open(form.supportLink, '_blank')}
                        className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Test support chat link"
                      >
                        <ExternalLink size={12} /> Test WhatsApp
                      </button>
                    )}
                  </div>
                </div>

                {/* 5. Floating Badge Custom Click Link */}
                <div className={cardBoxClass}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>
                      5. Floating Badge Direct Click Destination (Optional)
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Reopen vs Direct URL
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <LagFreeInput
                      type="url"
                      value={form.floatingBadgeLink || ''}
                      onChange={(e: any) => setForm({ ...form, floatingBadgeLink: e.target.value })}
                      placeholder="Leave blank to reopen popup, or enter URL to redirect directly on click"
                      className={`${smallInputClass} font-mono flex-1`}
                    />
                    {form.floatingBadgeLink && (
                      <button
                        type="button"
                        onClick={() => window.open(form.floatingBadgeLink, '_blank')}
                        className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Test floating badge link"
                      >
                        <ExternalLink size={12} /> Test Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CATEGORIES GRID & CATEGORY LINKS */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className={labelClass}>
                      Category Highlight Chips ({form.categories.length})
                    </label>
                    <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Each category pill can have its own label, clip count, and optional direct destination link.
                    </p>
                  </div>
                </div>

                {/* Categories List with Direct Links */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto p-1">
                  {form.categories.map((cat, idx) => (
                    <div
                      key={cat.id || idx}
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/10'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1 w-full">
                        <div className="sm:col-span-4">
                          <label className={smallLabelClass}>Category Label</label>
                          <LagFreeInput
                            type="text"
                            value={cat.label}
                            onChange={(e: any) => handleUpdateCategory(cat.id, { label: e.target.value })}
                            className={smallInputClass}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className={smallLabelClass}>Clips Count</label>
                          <LagFreeInput
                            type="text"
                            value={cat.count}
                            onChange={(e: any) => handleUpdateCategory(cat.id, { count: e.target.value })}
                            className={smallInputClass}
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className={smallLabelClass}>Direct Category URL (Optional)</label>
                          <div className="flex gap-1.5">
                            <LagFreeInput
                              type="url"
                              value={cat.link || ''}
                              onChange={(e: any) => handleUpdateCategory(cat.id, { link: e.target.value })}
                              placeholder="e.g. drive folder link"
                              className={`${smallInputClass} font-mono`}
                            />
                            {cat.link && (
                              <button
                                type="button"
                                onClick={() => window.open(cat.link, '_blank')}
                                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono cursor-pointer shrink-0"
                                title="Test category link"
                              >
                                <ExternalLink size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                        title="Delete category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Category Control */}
                <div className={cardBoxClass}>
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider block mb-2 ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>
                    Add New Category
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <LagFreeInput
                        type="text"
                        value={newCatLabel}
                        onChange={(e: any) => setNewCatLabel(e.target.value)}
                        placeholder="Category Name (e.g. AI Avatars)"
                        className={smallInputClass}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <LagFreeInput
                        type="text"
                        value={newCatCount}
                        onChange={(e: any) => setNewCatCount(e.target.value)}
                        placeholder="Count (e.g. 18K+ Clips)"
                        className={smallInputClass}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <LagFreeInput
                        type="url"
                        value={newCatLink}
                        onChange={(e: any) => setNewCatLink(e.target.value)}
                        placeholder="Optional Link (https://...)"
                        className={`${smallInputClass} font-mono`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="w-full h-full min-h-[38px] px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: TRUST BADGES & SWITCHES */}
            {activeTab === 'trust' && (
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Trust Highlights (3 Footer Points)</label>
                  <div className="space-y-2.5">
                    {form.trustBadges.map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <LagFreeInput
                          type="text"
                          value={badge}
                          onChange={(e: any) => {
                            const updated = [...form.trustBadges];
                            updated[idx] = e.target.value;
                            setForm({ ...form, trustBadges: updated });
                          }}
                          className={`${inputClass} font-mono`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Visibility Toggles */}
                <div className={cardBoxClass}>
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider block mb-3 ${isLight ? 'text-slate-900' : 'text-amber-400'}`}>
                    Visibility & Popup Automations
                  </span>

                  <label className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={form.enabled}
                      onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <span className={`text-xs font-mono font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Enable Auto-Popup for Visitors
                      </span>
                      <span className={`text-[11px] block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        When enabled, visitors see the festive modal automatically upon visiting the site.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-3 border-t border-slate-200 dark:border-white/5">
                    <input
                      type="checkbox"
                      checked={form.floatingBadgeEnabled}
                      onChange={(e) => setForm({ ...form, floatingBadgeEnabled: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <span className={`text-xs font-mono font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Enable Floating Reopen Badge
                      </span>
                      <span className={`text-[11px] block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Persistent bottom badge that allows visitors to re-open the offer or access the link.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 7: LIVE PREVIEW */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold uppercase ${isLight ? 'text-slate-800' : 'text-amber-400'}`}>
                    Real-time Result Preview
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Scales down the resulting popup exactly as visitors will see it
                  </span>
                </div>

                <div className={`p-4 sm:p-6 rounded-3xl border flex items-center justify-center ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/60 border-white/10'
                }`}>
                  <div className={`w-full max-w-lg rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl text-left ${
                    isLight
                      ? 'bg-white border-amber-300 text-slate-900'
                      : 'bg-[#0e121e] border-amber-500/30 text-white'
                  }`}>
                    {/* Header line */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${currentThemeGradient}`} />

                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-amber-500/15 border border-amber-500/30 text-amber-500">
                        {form.customLogoUrl ? (
                          <img src={form.customLogoUrl} alt="Logo" className="w-3.5 h-3.5 object-contain" />
                        ) : (
                          <Sparkles size={11} className="text-amber-400" />
                        )}
                        <span>{form.badgeText || '🎉 DURGA PUJA SPECIAL OFFER'}</span>
                      </div>

                      {/* Headline */}
                      <h3 className="text-lg font-black tracking-tight">
                        {form.headline.includes('—') ? (
                          <>
                            {form.headline.split('—')[0]}—{' '}
                            <span className={`bg-gradient-to-r ${currentThemeGradient} bg-clip-text text-transparent`}>
                              {form.headline.split('—')[1]}
                            </span>
                          </>
                        ) : (
                          <span className={`bg-gradient-to-r ${currentThemeGradient} bg-clip-text text-transparent`}>
                            {form.headline}
                          </span>
                        )}
                      </h3>

                      <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {form.subheadline}
                      </p>

                      {/* Categories Preview */}
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                        {form.categories.slice(0, 6).map((c, i) => (
                          <div
                            key={i}
                            className={`p-1.5 rounded-lg border ${
                              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/5 border-white/5 text-slate-300'
                            }`}
                          >
                            <span className="font-bold block truncate">{c.label}</span>
                            <span className="text-amber-500">{c.count}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Bar */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <div>
                          <span className="text-[9px] uppercase font-mono text-slate-400 block">{form.pricingBadge}</span>
                          <span className="text-xl font-black text-amber-500 font-mono">
                            {form.currency === 'INR' ? '₹' : form.currency}{form.offerPrice}/-
                          </span>
                        </div>
                        <div className="text-right text-[10px] font-mono text-slate-400">
                          <span className="line-through">{form.currency === 'INR' ? '₹' : form.currency}{form.originalPrice}</span>
                          <span className="text-emerald-500 block font-bold">{form.paymentType}</span>
                        </div>
                      </div>

                      {/* Button */}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          className="flex-1 py-2.5 px-4 rounded-xl font-mono font-black text-xs uppercase text-black bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <span>{form.primaryButtonText || 'UNLOCK YOUR PACK'}</span>
                          <ArrowRight size={13} />
                        </button>
                        <button
                          type="button"
                          className={`py-2 px-3 rounded-xl font-mono font-bold text-xs border ${
                            isLight ? 'border-slate-300 text-slate-700' : 'border-white/10 text-slate-300'
                          }`}
                        >
                          {form.secondaryButtonText || 'Categories'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-black/30 border-white/10'
          }`}>
            <button
              type="button"
              onClick={handleResetDefaults}
              className={`text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg transition-colors ${
                isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <RotateCcw size={13} /> Restore Defaults
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-colors ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 active:scale-98 transition-all disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Live Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
