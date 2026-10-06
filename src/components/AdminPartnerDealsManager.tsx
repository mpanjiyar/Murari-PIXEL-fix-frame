import React, { useState, useMemo } from 'react';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';
import { 
  ShoppingBag, Sparkles, RefreshCw, Plus, Edit, Trash2, Eye, EyeOff, 
  ExternalLink, Search, X, Check, AlertCircle, ArrowUpRight, Upload, 
  Calendar, Layers, DollarSign, Tag, CheckCircle2, ChevronRight
} from 'lucide-react';
import { AffiliateLink } from '../types';
import { ImageUploader } from './ImageUploader';

interface AdminPartnerDealsManagerProps {
  deals: AffiliateLink[];
  currentTheme: 'normal' | 'mono' | 'light';
  onSaveDeal: (deal: AffiliateLink) => Promise<void>;
  onDeleteDeal: (deal: AffiliateLink) => Promise<void>;
  onTogglePublish?: (deal: AffiliateLink) => Promise<void>;
  triggerToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  triggerConfirm: (msg: string, onConfirm: () => void) => void;
}

export const AdminPartnerDealsManager: React.FC<AdminPartnerDealsManagerProps> = ({
  deals,
  currentTheme,
  onSaveDeal,
  onDeleteDeal,
  onTogglePublish,
  triggerToast,
  triggerConfirm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultNewDeal: AffiliateLink = {
    id: '',
    title: '',
    description: '',
    category: 'photography',
    url: '',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    discountCode: '',
    availability: 'In Stock',
    partnerSource: 'Direct',
    isPublished: true,
    clicks: 0,
  };

  const [formData, setFormData] = useState<AffiliateLink>(defaultNewDeal);

  // Core predefined categories
  const coreCategories = [
    { key: 'photography', label: 'Photography & Cinema' },
    { key: 'it_tech', label: 'IT Hardware & Systems' },
    { key: 'software', label: 'Software & Licenses' },
    { key: 'accessories', label: 'Tech & Studio Accessories' },
    { key: 'my_gears', label: 'My Daily Gear (Star)' },
  ];

  // Detect partner store from URL
  const detectPartnerStore = (url: string): 'Amazon' | 'Flipkart' | 'Direct' => {
    if (!url) return 'Direct';
    if (/flipkart\.com|dl\.flipkart\.com|fkrt\.(it|co)/i.test(url)) return 'Flipkart';
    if (/amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it|com\.mx|com\.br|com\.tr|ae|sa|sg|se|pl|nl|be|com\.be|co\.za|eg)|\/amzn\.to\//i.test(url)) return 'Amazon';
    return 'Direct';
  };

  // Filtered list of deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cats = (deal.category || '').toLowerCase().split(',').map(c => c.trim());
        if (!cats.includes(selectedCategory.toLowerCase())) return false;
      }

      // Status filter
      if (filterStatus === 'published' && deal.isPublished === false) return false;
      if (filterStatus === 'draft' && deal.isPublished !== false) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (deal.title || '').toLowerCase().includes(q) ||
        (deal.description || '').toLowerCase().includes(q) ||
        (deal.category || '').toLowerCase().includes(q) ||
        (deal.partnerSource || '').toLowerCase().includes(q) ||
        (deal.url || '').toLowerCase().includes(q) ||
        (deal.discountCode || '').toLowerCase().includes(q)
      );
    });
  }, [deals, selectedCategory, filterStatus, searchQuery]);

  // Open modal for new product
  const handleAddNew = () => {
    setFormData({
      ...defaultNewDeal,
      id: 'aff_' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setFetchError(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // Open modal for editing existing product
  const handleEdit = (deal: AffiliateLink) => {
    setFormData({
      ...deal,
      partnerSource: deal.partnerSource || detectPartnerStore(deal.url),
      isPublished: deal.isPublished ?? true,
    });
    setFetchError(null);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Fetch product details from Amazon / Flipkart / Partner URL
  const handleFetchProduct = async () => {
    const rawUrl = formData.url?.trim();
    if (!rawUrl) {
      setFetchError('Please enter a product URL first.');
      triggerToast('Please enter a product URL first', 'info');
      return;
    }

    const looksLikeUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/i.test(rawUrl);
    if (!looksLikeUrl) {
      setFetchError('Invalid product URL format. Please provide a valid web address.');
      triggerToast('Invalid URL format', 'error');
      return;
    }

    setIsFetchingDetails(true);
    setFetchError(null);

    try {
      // First try POST to /api/fetch-partner-product or /api/fetch-amazon-product
      let res = await fetch('/api/fetch-partner-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl })
      });

      if (!res.ok) {
        // Fallback to GET
        res = await fetch(`/api/fetch-partner-product?url=${encodeURIComponent(rawUrl)}`);
      }

      if (!res.ok) {
        // Fallback to amazon endpoint
        res = await fetch('/api/fetch-amazon-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rawUrl })
        });
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data && data.success && data.product) {
        const prod = data.product;
        const detectedSource = prod.partnerSource || detectPartnerStore(prod.url || rawUrl);

        setFormData(prev => ({
          ...prev,
          title: prod.title || prev.title,
          description: prod.description || prev.description,
          imageUrl: prod.imageUrl || prev.imageUrl,
          price: prod.price || prev.price,
          originalPrice: prod.originalPrice || prev.originalPrice,
          discountPercentage: prod.discountPercentage || prev.discountPercentage,
          availability: prod.availability || prev.availability || 'In Stock',
          category: prod.category || prev.category || 'photography',
          partnerSource: detectedSource,
          url: prod.url || rawUrl,
        }));

        triggerToast(`Product details successfully fetched from ${detectedSource}!`, 'success');
      } else {
        throw new Error(data?.error || 'Product details could not be extracted from this link.');
      }
    } catch (err: any) {
      console.warn('[Admin Deals Fetch] Error:', err);
      const msg = 'Product details could not be fetched. Please verify the link and try again, or enter details manually below.';
      setFetchError(msg);
      triggerToast(msg, 'error');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Submit / Save handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      triggerToast('Product title is required.', 'error');
      return;
    }
    if (!formData.url?.trim()) {
      triggerToast('Product URL is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const finalDeal: AffiliateLink = {
        ...formData,
        id: formData.id || 'aff_' + Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        category: (formData.category || 'accessories').toLowerCase().trim(),
        url: formData.url.trim(),
        imageUrl: formData.imageUrl?.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
        partnerSource: formData.partnerSource || detectPartnerStore(formData.url),
        isPublished: formData.isPublished ?? true,
        createdAt: formData.createdAt || nowIso,
        updatedAt: nowIso,
        clicks: typeof formData.clicks === 'number' ? formData.clicks : 0,
      };

      await onSaveDeal(finalDeal);
      setIsFormOpen(false);
      triggerToast(isEditing ? 'Partner deal updated successfully!' : 'New partner deal published successfully!', 'success');
    } catch (err: any) {
      console.error('[Admin Deals] Save error:', err);
      triggerToast('Failed to save partner deal: ' + (err?.message || 'unknown error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish status directly from list
  const handleTogglePublishState = async (deal: AffiliateLink) => {
    const newStatus = deal.isPublished === false ? true : false;
    try {
      if (onTogglePublish) {
        await onTogglePublish(deal);
      } else {
        await onSaveDeal({
          ...deal,
          isPublished: newStatus,
          updatedAt: new Date().toISOString(),
        });
      }
      triggerToast(`Deal ${newStatus ? 'published to catalog' : 'moved to drafts'}!`, 'info');
    } catch (err) {
      triggerToast('Failed to update status', 'error');
    }
  };

  // Delete confirmation
  const handleDelete = (deal: AffiliateLink) => {
    triggerConfirm(
      `Are you sure you want to delete "${deal.title}"? This will permanently remove it from the catalog.`,
      async () => {
        try {
          await onDeleteDeal(deal);
          triggerToast('Partner deal deleted successfully.', 'info');
        } catch (err: any) {
          triggerToast('Failed to delete deal: ' + (err?.message || 'error'), 'error');
        }
      }
    );
  };

  // Helper for category label
  const getCatLabel = (catKey: string) => {
    const found = coreCategories.find(c => c.key === catKey.toLowerCase().trim());
    if (found) return found.label;
    return catKey.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const isLight = currentTheme === 'light';

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Action Header */}
      <div className={`p-6 rounded-3xl border ${
        isLight ? 'bg-amber-50/40 border-amber-200/80 shadow-sm' : 'bg-zinc-950/80 border-white/5 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <ShoppingBag size={20} className="stroke-[2.5]" />
              </span>
              <h2 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Partner Deals &amp; Affiliate Center
              </h2>
            </div>
            <p className={`text-xs max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Manage curated gear recommendations, software licenses, Amazon &amp; Flipkart product links, 
              live pricing, categories, and real-time storefront synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAddNew}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer transform-gpu hover:scale-[1.02]"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Add Partner Product</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Products</span>
            <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{deals.length}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Published Active</span>
            <p className="text-lg font-black text-emerald-500">
              {deals.filter(d => d.isPublished !== false).length}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Drafts / Inactive</span>
            <p className="text-lg font-black text-amber-500">
              {deals.filter(d => d.isPublished === false).length}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Clicks Tracked</span>
            <p className="text-lg font-black text-cyan-400">
              {deals.reduce((sum, d) => sum + (d.clicks || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 border-amber-500 text-black shadow-md'
                : isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  : 'bg-zinc-900 border-white/5 text-slate-300 hover:border-white/10'
            }`}
          >
            All ({deals.length})
          </button>

          {coreCategories.map(cat => {
            const count = deals.filter(d => (d.category || '').toLowerCase().includes(cat.key)).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-black shadow-md'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      : 'bg-zinc-900 border-white/5 text-slate-300 hover:border-white/10'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <LagFreeInput
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className={`w-full pl-8 pr-7 py-2 rounded-xl text-xs font-sans outline-none border transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  : 'bg-zinc-900 border-white/5 text-white placeholder-slate-500 focus:border-amber-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold outline-none border cursor-pointer ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-zinc-900 border-white/5 text-slate-200'
            }`}
          >
            <option value="all">Status: All</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Products Table / Cards */}
      {filteredDeals.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-white/5'
        }`}>
          <ShoppingBag size={32} className="mx-auto text-slate-400" />
          <h3 className={`text-sm font-bold font-mono uppercase ${isLight ? 'text-slate-800' : 'text-white'}`}>
            No Products Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No partner deals matched your search query "${searchQuery}".`
              : 'No products in this category yet. Click Add Partner Product above to add one!'}
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
          >
            <Plus size={12} />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => {
            const isFk = deal.partnerSource === 'Flipkart' || /flipkart/i.test(deal.url || '');
            const isAmz = !isFk && (deal.partnerSource === 'Amazon' || /amazon|amzn/i.test(deal.url || ''));

            return (
              <div
                key={deal.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500/40'
                    : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                } ${deal.isPublished === false ? 'opacity-70 border-dashed border-amber-500/40' : ''}`}
              >
                <div>
                  {/* Top Store Badge & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isFk ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#2874F0] text-white font-mono text-[8px] font-black uppercase tracking-wider">
                          FLIPKART
                        </span>
                      ) : isAmz ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF9900] text-black font-mono text-[8px] font-black uppercase tracking-wider">
                          AMAZON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[8px] font-black uppercase tracking-wider">
                          {deal.partnerSource || 'DIRECT'}
                        </span>
                      )}

                      {deal.isPublished === false ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono text-[8px] font-bold uppercase">
                          DRAFT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[8px] font-bold uppercase">
                          LIVE
                        </span>
                      )}

                      <span className="text-[9px] font-mono text-slate-400">
                        {deal.clicks || 0} clicks
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublishState(deal)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                          deal.isPublished === false
                            ? 'text-amber-500 border-amber-500/30 hover:bg-amber-500/10'
                            : 'text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10'
                        }`}
                        title={deal.isPublished === false ? 'Publish Deal' : 'Unpublish Deal (Draft)'}
                      >
                        {deal.isPublished === false ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>

                      <button
                        onClick={() => handleEdit(deal)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(deal)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail & Info row */}
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 dark:border-white/10 flex items-center justify-center p-1">
                      <img
                        src={deal.imageUrl || defaultNewDeal.imageUrl}
                        alt={deal.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultNewDeal.imageUrl;
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {deal.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {deal.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Category Strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {deal.price ? (
                        <span className={`font-black ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>
                          {deal.price}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No price listed</span>
                      )}
                      {deal.discountPercentage && (
                        <span className="text-[8px] font-bold px-1 rounded bg-emerald-500/10 text-emerald-500">
                          {deal.discountPercentage}
                        </span>
                      )}
                      {deal.discountCode && (
                        <span className="text-[8px] font-mono px-1 rounded bg-amber-500/10 text-amber-500 font-bold">
                          {deal.discountCode}
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {deal.category}
                    </span>
                  </div>
                </div>

                {/* Footer Link & ID */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="truncate max-w-[140px]">ID: {deal.id}</span>
                  <a
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-500 hover:underline"
                  >
                    <span>Visit Link</span>
                    <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT PARTNER PRODUCT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className={`relative w-full max-w-4xl my-auto rounded-3xl border p-5 sm:p-8 space-y-6 text-left shadow-2xl transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/10'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10">
              <div>
                <h3 className={`text-lg sm:text-xl font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Sparkles size={18} className="text-amber-500" />
                  <span>{isEditing ? 'Edit Partner Deal' : 'Add New Partner Product'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste any Amazon or Flipkart product link for auto-fetch, or enter details manually.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Form Content */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* SECTION 1: Product Link & Auto-Fetch */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <span>1. Supported Product URL (Amazon / Flipkart / Direct)</span>
                  </label>
                  <span className="text-[9px] font-mono text-slate-400">
                    Supports amazon.in, amzn.to, flipkart.com, fkrt.co &amp; direct links
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <LagFreeInput
                    type="url"
                    required
                    value={formData.url || ''}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono outline-none border transition-all ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500' 
                        : 'bg-zinc-900 border-white/10 text-white focus:border-amber-500'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={handleFetchProduct}
                    disabled={isFetchingDetails || !formData.url?.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
                  >
                    {isFetchingDetails ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        <span>Fetch Product</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Error Banner if fetch failed */}
                {fetchError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">{fetchError}</p>
                      <p className="text-[10px] text-slate-400">
                        You can continue to fill in the title, price, category, and photo manually below.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Split Columns for Form Details and Real-Time Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 cols: Form inputs */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Product Title *
                    </label>
                    <LagFreeInput
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Sony Alpha 7 IV Mirrorless Camera"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' 
                          : 'bg-zinc-900 border-white/10 text-white focus:border-amber-500'
                      }`}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Short Description / Recommendation Text
                    </label>
                    <LagFreeTextArea
                      rows={3}
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain why this gadget or tool is recommended..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-sans outline-none border transition-all leading-relaxed ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' 
                          : 'bg-zinc-900 border-white/10 text-white focus:border-amber-500'
                      }`}
                    />
                  </div>

                  {/* Category & Partner Source */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Category Key *
                      </label>
                      <LagFreeInput
                        type="text"
                        required
                        value={formData.category || ''}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="photography, it_tech, software, accessories"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-900 border-white/10 text-white'
                        }`}
                      />

                      {/* Quick Select Category Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {coreCategories.map(cat => (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.key })}
                            className={`px-2 py-0.5 rounded-lg text-[8.5px] font-mono transition-colors cursor-pointer border ${
                              formData.category?.toLowerCase() === cat.key
                                ? 'bg-amber-500 text-black border-amber-500 font-bold'
                                : isLight
                                  ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                  : 'bg-zinc-800 border-white/5 text-slate-300 hover:border-white/15'
                            }`}
                          >
                            {cat.key}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Partner Store
                      </label>
                      <select
                        value={formData.partnerSource || 'Direct'}
                        onChange={e => setFormData({ ...formData, partnerSource: e.target.value as any })}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold outline-none border cursor-pointer ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-900 border-white/10 text-white'
                        }`}
                      >
                        <option value="Amazon">Amazon</option>
                        <option value="Flipkart">Flipkart</option>
                        <option value="Direct">Direct Store / Partner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing, Original Price, Discount */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Sale Price
                      </label>
                      <LagFreeInput
                        type="text"
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        placeholder="₹64,990"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold outline-none border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-900 border-white/10 text-white'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Original Price
                      </label>
                      <LagFreeInput
                        type="text"
                        value={formData.originalPrice || ''}
                        onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="₹79,900"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-900 border-white/10 text-white'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Discount / Promo
                      </label>
                      <LagFreeInput
                        type="text"
                        value={formData.discountPercentage || formData.discountCode || ''}
                        onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                        placeholder="18% OFF or CODE"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-900 border-white/10 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Product Photo Image & Uploader */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Product Image (Upload or Paste URL)
                    </label>

                    <ImageUploader
                      label="Upload Product Image"
                      value={formData.imageUrl || ''}
                      currentTheme={currentTheme}
                      onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    />

                    <LagFreeInput
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none border ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-900 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Publish Status Toggle */}
                  <div className="pt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isPublished !== false}
                        onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs font-bold font-mono uppercase ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Published immediately on live site
                      </span>
                    </label>
                  </div>
                </div>

                {/* Right 5 cols: Live Product Preview Card */}
                <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-2.5">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 block text-center lg:text-left">
                    Live Product Preview
                  </span>

                  <div className={`p-4 rounded-2xl border text-left space-y-3 ${
                    isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-zinc-900 border-white/10 shadow-xl'
                  }`}>
                    {/* Preview Image Frame */}
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white p-3 border border-slate-100 flex items-center justify-center relative">
                      <img
                        src={formData.imageUrl || defaultNewDeal.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultNewDeal.imageUrl;
                        }}
                      />

                      {/* Store Badge */}
                      <div className="absolute top-2 left-2">
                        {formData.partnerSource === 'Flipkart' ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#2874F0] text-white font-mono text-[7px] font-black uppercase">
                            FLIPKART
                          </span>
                        ) : formData.partnerSource === 'Amazon' ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF9900] text-black font-mono text-[7px] font-black uppercase">
                            AMAZON
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[7px] font-black uppercase">
                            {formData.partnerSource || 'DIRECT'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Preview Details */}
                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold line-clamp-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {formData.title || 'Product Title Appears Here'}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {formData.description || 'Short recommendation summary will appear here for visitors.'}
                      </p>
                    </div>

                    {/* Price in Preview */}
                    {(formData.price || formData.discountPercentage) && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>
                            {formData.price || '₹--'}
                          </span>
                          {formData.originalPrice && (
                            <span className="line-through text-slate-400 text-[10px]">
                              {formData.originalPrice}
                            </span>
                          )}
                          {formData.discountPercentage && (
                            <span className="text-[8px] font-bold px-1 rounded bg-emerald-500/10 text-emerald-500">
                              {formData.discountPercentage}
                            </span>
                          )}
                        </div>

                        {formData.discountCode && (
                          <span className="text-[8px] font-mono px-1 rounded bg-amber-500/10 text-amber-500 font-bold">
                            {formData.discountCode}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Preview Button */}
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 rounded-xl bg-amber-500 text-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm opacity-90"
                    >
                      <span>View Product</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
