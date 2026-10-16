import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  User,
  Phone,
  Tag,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  X,
  Sparkles,
  Sliders
} from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ReelPurchaseOrder, ReelOrderStatus, OfferPopupConfig, DEFAULT_OFFER_POPUP_CONFIG } from '../types';
import { AdminResourcesManager } from './AdminResourcesManager';
import { OfferSectionAdminModal } from './OfferSectionAdminModal';

interface AdminPurchaseManagerProps {
  currentTheme?: 'light' | 'normal' | 'dark' | 'mono';
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  selectedOrderId?: string | null;
  onClearSelectedOrder?: () => void;
}

export const AdminPurchaseManager: React.FC<AdminPurchaseManagerProps> = ({
  currentTheme = 'dark',
  triggerToast,
  selectedOrderId = null,
  onClearSelectedOrder,
}) => {
  const [adminTab, setAdminTab] = useState<'orders' | 'resources'>('orders');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerConfig, setOfferConfig] = useState<OfferPopupConfig>(() => {
    try {
      const cached = localStorage.getItem('mp_offer_popup_config');
      if (cached) return { ...DEFAULT_OFFER_POPUP_CONFIG, ...JSON.parse(cached) };
    } catch {}
    return DEFAULT_OFFER_POPUP_CONFIG;
  });
  const [orders, setOrders] = useState<ReelPurchaseOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    approvedOrders: 0,
    pendingReview: 0,
    pendingPayment: 0,
    rejectedOrders: 0,
    failedOrders: 0,
    refundedOrders: 0,
    verifiedRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReelOrderStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Review Modal State
  const [activeReviewOrder, setActiveReviewOrder] = useState<ReelPurchaseOrder | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  const isLight = currentTheme === 'light';

  // Helper to recompute stats from any fresh order list
  const recomputeStats = (orderList: ReelPurchaseOrder[]) => {
    const totalOrders = orderList.length;
    const approvedOrders = orderList.filter(o => o.status === 'APPROVED').length;
    const pendingReview = orderList.filter(o => o.status === 'PENDING_ADMIN_REVIEW').length;
    const pendingPayment = orderList.filter(o => o.status === 'PENDING_PAYMENT').length;
    const rejectedOrders = orderList.filter(o => o.status === 'REJECTED').length;
    const failedOrders = orderList.filter(o => o.status === 'PAYMENT_FAILED').length;
    const refundedOrders = orderList.filter(o => o.status === 'REFUNDED').length;
    const verifiedRevenue = orderList
      .filter(o => o.status === 'APPROVED')
      .reduce((sum, o) => sum + (o.amount || 199.0), 0);

    setStats({
      totalOrders,
      approvedOrders,
      pendingReview,
      pendingPayment,
      rejectedOrders,
      failedOrders,
      refundedOrders,
      verifiedRevenue,
    });
  };

  // Fetch orders from backend
  const fetchOrders = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const res = await fetch('/api/reels/admin/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        if (data.stats) {
          setStats(data.stats);
        } else {
          recomputeStats(data.orders);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch admin orders from backend:', e);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 1. Direct Multi-Device Real-Time Firestore Listener
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      if (db) {
        unsubscribeFirestore = onSnapshot(
          collection(db, 'reels_orders'),
          (snapshot) => {
            const liveOrders: ReelPurchaseOrder[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as ReelPurchaseOrder;
              if (data && data.id) {
                liveOrders.push(data);
              }
            });

            if (liveOrders.length > 0) {
              setOrders((prev) => {
                const map = new Map<string, ReelPurchaseOrder>();
                prev.forEach((o) => map.set(o.id, o));
                liveOrders.forEach((o) => map.set(o.id, { ...(map.get(o.id) || {}), ...o }));
                const merged = Array.from(map.values()).sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                recomputeStats(merged);
                return merged;
              });
              setIsLoading(false);
            }
          },
          (err) => {
            console.warn('Firestore orders live subscription warning:', err);
          }
        );
      }
    } catch (fsErr) {
      console.warn('Firestore orders subscription init note:', fsErr);
    }

    // 2. Setup real-time Server-Sent Events (SSE) listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/reels/events?isAdmin=true');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.eventType === 'ORDER_CREATED' ||
            payload.eventType === 'ORDER_SUBMITTED_FOR_REVIEW' ||
            payload.eventType === 'ORDER_APPROVED' ||
            payload.eventType === 'ORDER_REJECTED'
          ) {
            fetchOrders(true);
          }
        } catch (_) {}
      };
    } catch (err) {
      console.warn('SSE stream unavailable in Purchase Manager:', err);
    }

    // 3. Fallback polling
    const interval = setInterval(() => fetchOrders(true), 12000);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  // Handle selectedOrderId prop from notifications
  useEffect(() => {
    if (selectedOrderId && orders.length > 0) {
      const target = orders.find(o => o.id === selectedOrderId);
      if (target) {
        setActiveReviewOrder(target);
      }
    }
  }, [selectedOrderId, orders]);

  // Fetch offer popup config
  useEffect(() => {
    fetch('/api/reels/popup-config')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.config) {
          setOfferConfig(data.config);
          try {
            localStorage.setItem('mp_offer_popup_config', JSON.stringify(data.config));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveOfferConfig = async (newConfig: OfferPopupConfig) => {
    setOfferConfig(newConfig);
    try {
      localStorage.setItem('mp_offer_popup_config', JSON.stringify(newConfig));
    } catch {}
    const res = await fetch('/api/reels/admin/popup-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });
    if (!res.ok) {
      throw new Error('Failed to save popup config');
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (triggerToast) triggerToast('Copied to clipboard!', 'info');
  };

  // Submit Approval or Rejection
  const handleDecideOrder = async (action: 'approve' | 'reject') => {
    if (!activeReviewOrder) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      if (triggerToast) triggerToast('Please enter a rejection reason to inform the customer.', 'error');
      return;
    }

    setIsSubmittingDecision(true);
    const nowIso = new Date().toISOString();

    // 1. Dual-update Firestore directly so any connected client unlocks immediately
    if (db && activeReviewOrder.id) {
      try {
        if (action === 'approve') {
          const downloadToken = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now().toString(36) + Math.random().toString(36).slice(2);
          await setDoc(
            doc(db, 'reels_orders', activeReviewOrder.id),
            {
              status: 'APPROVED',
              verificationSource: 'manual_admin',
              approvedAt: nowIso,
              reviewedByAdminId: 'Murari Panjiyar (Mpanjiyar100@gmail.com)',
              downloadToken,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        } else {
          await setDoc(
            doc(db, 'reels_orders', activeReviewOrder.id),
            {
              status: 'REJECTED',
              rejectedAt: nowIso,
              reviewedByAdminId: 'Murari Panjiyar (Mpanjiyar100@gmail.com)',
              rejectionReason: rejectionReason.trim(),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      } catch (fsErr) {
        console.warn('Firestore direct decision write note:', fsErr);
      }
    }

    try {
      const res = await fetch('/api/reels/admin/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeReviewOrder.id,
          action,
          reason: action === 'approve' ? (adminNote.trim() || 'Verified by Murari Panjiyar in BharatPe records') : rejectionReason.trim(),
          adminEmail: 'Mpanjiyar100@gmail.com',
          adminName: 'Murari Panjiyar',
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (triggerToast) {
          triggerToast(
            action === 'approve'
              ? `🎉 Order ${activeReviewOrder.id} approved! Digital download entitlement unlocked.`
              : `Order ${activeReviewOrder.id} marked as rejected.`,
            action === 'approve' ? 'success' : 'info'
          );
        }
        setActiveReviewOrder(null);
        setAdminNote('');
        setRejectionReason('');
        if (onClearSelectedOrder) onClearSelectedOrder();
        fetchOrders(true);
      } else {
        if (triggerToast) triggerToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      setActiveReviewOrder(null);
      setAdminNote('');
      setRejectionReason('');
      if (onClearSelectedOrder) onClearSelectedOrder();
      if (triggerToast) triggerToast(`Order status updated to ${action.toUpperCase()} in database.`, 'success');
      fetchOrders(true);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    window.location.href = '/api/reels/admin/export-csv';
    if (triggerToast) triggerToast('Downloading verified purchases CSV report...', 'info');
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(o => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchPhone = o.customerPhone.includes(q);
        const matchUtr = o.utrReference?.toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchUtr;
      }
      return true;
    })
    .sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === 'NEWEST' ? tB - tA : tA - tB;
    });

  const getStatusBadge = (status: ReelOrderStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={12} />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING_ADMIN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            <Clock size={12} />
            <span>Awaiting Murari Review</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle size={12} />
            <span>REJECTED</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
            <Clock size={12} />
            <span>Pending UPI Scan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950/90 border-white/10'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#FF5500] flex items-center justify-center text-white shadow-lg shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg sm:text-xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                150K+ Mega Pack Purchase Management
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₹199 LIVE STORE
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Authorize customer purchases, verify 12-digit UPI UTR references, manage entitlements, and inspect customer details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsOfferModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Edit Festive Offer Popup, Floating Badge, links, logo, and text"
          >
            <Sliders size={14} className="text-amber-400" />
            <span>Offer & Popup Settings</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => fetchOrders()}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="Refresh order records"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Verified Revenue */}
        <div className={`p-4 rounded-2xl border space-y-1 col-span-2 sm:col-span-1 lg:col-span-2 ${
          isLight ? 'bg-emerald-50/70 border-emerald-300' : 'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">
              Verified Gross Revenue
            </span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            ₹{stats.verifiedRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            {stats.approvedOrders} Approved × ₹199 (Excludes pending &amp; rejected)
          </p>
        </div>

        {/* Card 2: Awaiting Murari Review */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'PENDING_ADMIN_REVIEW' ? 'ALL' : 'PENDING_ADMIN_REVIEW')}
          className={`p-4 rounded-2xl border space-y-1 cursor-pointer transition-all hover:scale-102 ${
            stats.pendingReview > 0
              ? 'bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/5'
              : isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
              Awaiting Approval
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {stats.pendingReview}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            Needs verification
          </p>
        </div>

        {/* Card 3: Approved Purchases */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'ALL' : 'APPROVED')}
          className={`p-4 rounded-2xl border space-y-1 cursor-pointer transition-all hover:scale-102 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
              Approved
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.approvedOrders}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            Drive access unlocked
          </p>
        </div>

        {/* Card 4: Rejected Requests */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'ALL' : 'REJECTED')}
          className={`p-4 rounded-2xl border space-y-1 cursor-pointer transition-all hover:scale-102 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-rose-400">
              Rejected
            </span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.rejectedOrders}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            Access denied
          </p>
        </div>

        {/* Card 5: Total Orders */}
        <div className={`p-4 rounded-2xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
              Total Orders
            </span>
            <ShoppingBag size={16} className="text-zinc-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalOrders}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            Lifetime initiated
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, order ID, or UTR..."
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-mono outline-none transition-all ${
                isLight ? 'bg-white border border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/80 border border-white/10 text-white focus:border-[#FF5500]'
              }`}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 shrink-0">Filter:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono outline-none cursor-pointer ${
                isLight ? 'bg-white border border-slate-300 text-slate-800' : 'bg-black/80 border border-white/10 text-white'
              }`}
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              <option value="PENDING_ADMIN_REVIEW">⏳ Awaiting Murari Review ({stats.pendingReview})</option>
              <option value="APPROVED">✅ Approved &amp; Paid ({stats.approvedOrders})</option>
              <option value="REJECTED">❌ Rejected ({stats.rejectedOrders})</option>
              <option value="PENDING_PAYMENT">🕒 Pending UPI Scan ({stats.pendingPayment})</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 shrink-0">Sort:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono outline-none cursor-pointer ${
                isLight ? 'bg-white border border-slate-300 text-slate-800' : 'bg-black/80 border border-white/10 text-white'
              }`}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Orders Card List (< 768px) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className={`p-8 text-center text-xs rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-900/60 border-white/10 text-zinc-400'}`}>
            No orders found matching your search.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPendingReview = order.status === 'PENDING_ADMIN_REVIEW';

            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPendingReview
                    ? isLight
                      ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : 'bg-gradient-to-b from-amber-950/30 to-black/80 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-zinc-900/70 border-white/10'
                }`}
              >
                {/* Header: Order ID & Status */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-white">{order.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.id, `id-${order.id}`)}
                        className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedKey === `id-${order.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-sans">{order.campaign || 'Durga Puja Special Offer'}</span>
                  </div>
                  <div className="shrink-0">{getStatusBadge(order.status)}</div>
                </div>

                {/* Details */}
                <div className="py-2.5 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                      <User size={12} className="text-[#FF5500]" /> Customer:
                    </span>
                    <span className="font-bold text-white text-right">{order.customerName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                      <Phone size={12} className="text-emerald-400" /> WhatsApp:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">{order.customerPhone}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.customerPhone, `ph-${order.id}`)}
                        className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedKey === `ph-${order.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                      <Tag size={12} className="text-amber-400" /> UPI UTR:
                    </span>
                    {order.utrReference ? (
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                        <span className="font-bold text-amber-300 tracking-wider text-[11px] select-all">{order.utrReference}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.utrReference!, `utr-${order.id}`)}
                          className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                          title="Copy UTR"
                        >
                          {copiedKey === `utr-${order.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">Not entered</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Amount:</span>
                    <span className="font-black text-emerald-400">₹{order.amount} INR</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>Submitted:</span>
                    <span>{new Date(order.submittedAt || order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>

                  {order.status === 'REJECTED' && order.rejectionReason && (
                    <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300">
                      Reason: {order.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-white/10">
                  {isPendingReview ? (
                    <button
                      type="button"
                      onClick={() => setActiveReviewOrder(order)}
                      className="w-full py-2.5 px-3 rounded-xl font-mono font-black uppercase text-xs bg-gradient-to-r from-amber-400 to-[#FF5500] hover:from-amber-300 hover:to-orange-400 text-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all min-h-[44px]"
                    >
                      <ShieldCheck size={15} />
                      <span>Review &amp; Decide (₹{order.amount})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveReviewOrder(order)}
                      className={`w-full py-2.5 px-3 rounded-xl font-mono font-bold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                      }`}
                    >
                      <span>Inspect Details</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Orders Table (>= 768px) */}
      <div className={`hidden md:block rounded-3xl border overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950/80 border-white/10'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[11px] font-mono uppercase tracking-wider border-b ${
              isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-zinc-900/80 text-zinc-400 border-white/10'
            }`}>
              <tr>
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment UTR</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Submission Date &amp; Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isPendingReview = order.status === 'PENDING_ADMIN_REVIEW';

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isPendingReview
                          ? isLight ? 'bg-amber-50/70 hover:bg-amber-100/50' : 'bg-amber-950/20 hover:bg-amber-950/30'
                          : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{order.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.id, `id-${order.id}`)}
                            className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedKey === `id-${order.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-sans block">{order.campaign}</span>
                      </td>

                      {/* Customer Details: Full Name & Phone Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User size={13} className="text-[#FF5500]" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-emerald-400" />
                          <span>{order.customerPhone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.customerPhone, `ph-${order.id}`)}
                            className="p-0.5 rounded text-zinc-500 hover:text-white cursor-pointer"
                            title="Copy Phone Number"
                          >
                            {copiedKey === `ph-${order.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          </button>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-emerald-400 whitespace-nowrap">
                        ₹{order.amount} INR
                      </td>

                      {/* Payment UTR */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.utrReference ? (
                          <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 w-fit">
                            <Tag size={12} className="text-amber-400" />
                            <span className="font-bold text-amber-300 tracking-wider select-all">{order.utrReference}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(order.utrReference!, `utr-${order.id}`)}
                              className="p-0.5 rounded text-zinc-400 hover:text-white cursor-pointer"
                              title="Copy UTR"
                            >
                              {copiedKey === `utr-${order.id}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Not entered yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                        {order.status === 'APPROVED' && order.approvedAt && (
                          <span className="text-[9.5px] text-zinc-500 block mt-0.5">
                            Approved by: {order.reviewedByAdminId?.split(' ')[0] || 'Murari'}
                          </span>
                        )}
                        {order.status === 'REJECTED' && order.rejectionReason && (
                          <span className="text-[9.5px] text-rose-400/90 block mt-0.5 max-w-[180px] truncate" title={order.rejectionReason}>
                            Reason: {order.rejectionReason}
                          </span>
                        )}
                      </td>

                      {/* Submission Date & Time */}
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                        <div className="text-[11px] font-bold text-zinc-200">
                          {new Date(order.submittedAt || order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(order.submittedAt || order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isPendingReview ? (
                          <button
                            type="button"
                            onClick={() => setActiveReviewOrder(order)}
                            className="py-1.5 px-3 rounded-xl font-bold uppercase text-xs bg-gradient-to-r from-amber-400 to-[#FF5500] hover:from-amber-300 hover:to-orange-400 text-black shadow-md cursor-pointer active:scale-95 transition-all"
                          >
                            Review &amp; Decide
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveReviewOrder(order)}
                            className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                            }`}
                          >
                            Inspect Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER REVIEW & DECISION MODAL */}
      {activeReviewOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            onClick={() => setActiveReviewOrder(null)}
          />

          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl z-10 overflow-hidden my-auto ${
            isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-zinc-950 text-white border-white/15'
          }`}>
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Review Purchase &amp; Authorization</h3>
                  <p className="text-xs text-zinc-400 font-mono">Order ID: {activeReviewOrder.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveReviewOrder(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto font-mono text-xs">
              {/* Order Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}>
                  <span className="text-[10px] text-zinc-400 uppercase block">Customer Full Name</span>
                  <span className="font-bold text-sm text-white">{activeReviewOrder.customerName}</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}>
                  <span className="text-[10px] text-zinc-400 uppercase block">Customer Mobile Phone</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-400">{activeReviewOrder.customerPhone}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeReviewOrder.customerPhone, 'modal-phone')}
                      className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}>
                  <span className="text-[10px] text-zinc-400 uppercase block">Payable Price</span>
                  <span className="font-black text-sm text-emerald-400">₹{activeReviewOrder.amount} INR</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'}`}>
                  <span className="text-[10px] text-zinc-400 uppercase block">Current Order Status</span>
                  <div className="mt-0.5">{getStatusBadge(activeReviewOrder.status)}</div>
                </div>
              </div>

              {/* UTR Verification Box */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-amber-950/20 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <Tag size={13} />
                    Customer Submitted 12-Digit UTR
                  </span>
                  <span className="text-[10px] text-zinc-400">Check BharatPe settlement</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-black/60 p-3 rounded-xl border border-white/10">
                  <span className="text-base sm:text-lg font-black tracking-widest text-amber-400 select-all">
                    {activeReviewOrder.utrReference || 'No UTR Submitted Yet'}
                  </span>
                  {activeReviewOrder.utrReference && (
                    <button
                      type="button"
                      onClick={() => handleCopy(activeReviewOrder.utrReference!, 'modal-utr')}
                      className="px-2.5 py-1 rounded bg-amber-500 text-black text-[11px] font-bold cursor-pointer hover:bg-amber-400"
                    >
                      Copy UTR
                    </button>
                  )}
                </div>

                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Verify that a ₹{activeReviewOrder.amount} credit matching UTR <strong>{activeReviewOrder.utrReference || 'N/A'}</strong> appears in your BharatPe merchant app before approving.
                </p>
              </div>

              {/* Admin Decision Forms */}
              {activeReviewOrder.status === 'PENDING_ADMIN_REVIEW' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 block text-[11px]">Optional Approval Note for Records:</label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="e.g. Verified in BharatPe statement (settled at 10:15 AM)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmittingDecision}
                      onClick={() => handleDecideOrder('approve')}
                      className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>{isSubmittingDecision ? 'Approving...' : 'Approve & Unlock Download Access'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <label className="text-rose-400 block text-[11px]">Or Reject with Reason (Required if rejecting):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="e.g. UTR not found in bank statement, amount was incorrect..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-rose-500/30 text-white outline-none focus:border-rose-500 text-xs"
                      />
                      <button
                        type="button"
                        disabled={isSubmittingDecision || !rejectionReason.trim()}
                        onClick={() => handleDecideOrder('reject')}
                        className="py-2 px-4 rounded-xl font-bold text-xs uppercase bg-rose-600 hover:bg-rose-500 text-white cursor-pointer disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Decision / History Audit Log */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-zinc-400 uppercase block">Audit &amp; Decision History:</span>
                <div className="space-y-1.5">
                  {activeReviewOrder.auditLogs?.map((log, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] flex items-start justify-between gap-2">
                      <div>
                        <span className="text-white font-bold">{log.action}</span>
                        <p className="text-zinc-400 text-[10px]">{log.details}</p>
                      </div>
                      <div className="text-right text-[10px] text-zinc-500 shrink-0">
                        <div>{new Date(log.timestamp).toLocaleTimeString('en-IN')}</div>
                        <div>{log.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Section Admin Customizer Modal */}
      <OfferSectionAdminModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        currentConfig={offerConfig}
        onSave={handleSaveOfferConfig}
        currentTheme={currentTheme === 'dark' ? 'normal' : currentTheme}
        triggerToast={triggerToast}
      />
    </div>
  );
};
