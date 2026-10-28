import React, { useState, useEffect, useRef } from 'react';
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
  Sliders,
  Eye,
  EyeOff,
  History,
  Lock,
  Edit3,
  Trash2,
  PhoneCall,
  Calendar,
  CreditCard,
  CheckSquare,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ReelPurchaseOrder, ReelOrderStatus, OfferPopupConfig, DEFAULT_OFFER_POPUP_CONFIG } from '../types';
import { fetchWithRetry } from '../utils/retryWithBackoff';
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

  // Phone Privacy: Default to unmasked for authorized admins as required, with global & individual toggle
  const [showAllPhones, setShowAllPhones] = useState<boolean>(true);
  const [maskedPhoneIds, setMaskedPhoneIds] = useState<Set<string>>(new Set());

  // Review Modal State
  const [activeReviewOrder, setActiveReviewOrder] = useState<ReelPurchaseOrder | null>(null);
  const [activeAuditOrder, setActiveAuditOrder] = useState<ReelPurchaseOrder | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  // Edit & Delete State
  const [editingOrder, setEditingOrder] = useState<ReelPurchaseOrder | null>(null);
  const [editFormData, setEditFormData] = useState<{
    customerName: string;
    customerPhone: string;
    amount: number;
    utrReference: string;
    status: ReelOrderStatus;
    adminNotes: string;
    rejectionReason: string;
  }>({
    customerName: '',
    customerPhone: '',
    amount: 199,
    utrReference: '',
    status: 'PENDING_ADMIN_REVIEW',
    adminNotes: '',
    rejectionReason: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<ReelPurchaseOrder | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Bulk Selection and Action State
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState<boolean>(false);
  const [bulkRejectionReason, setBulkRejectionReason] = useState<string>('');
  const [bulkConfirmModal, setBulkConfirmModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | 'revoke' | 'delete' | 'verify_payment' | 'pending';
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor: 'emerald' | 'blue' | 'amber' | 'rose';
  } | null>(null);

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
      if (data.success && Array.isArray(data.orders)) {
        const validOrders = data.orders.filter((o: any) => o && Boolean(o.id));
        setOrders(validOrders);
        if (data.stats) {
          setStats(data.stats);
        } else {
          recomputeStats(validOrders);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch admin orders from backend:', e);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  // Real-Time Listeners: Firestore onSnapshot + SSE fallback
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
              const docId = data?.id || docSnap.id;
              if (docId) {
                liveOrders.push({ ...data, id: docId });
              }
            });

            liveOrders.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(liveOrders);
            recomputeStats(liveOrders);
            setIsLoading(false);
          },
          (err) => {
            console.warn('Firestore orders live subscription warning:', err);
          }
        );
      }
    } catch (fsErr) {
      console.warn('Firestore orders subscription init note:', fsErr);
    }

    // 2. Real-Time Server-Sent Events (SSE) Listener
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
            payload.eventType === 'ORDER_REJECTED' ||
            payload.eventType === 'ORDER_UPDATED' ||
            payload.eventType === 'ACCESS_REVOKED' ||
            payload.eventType === 'BULK_ORDERS_UPDATED'
          ) {
            if (payload.order && payload.order.id) {
              setOrders((prev) => {
                const idx = prev.findIndex((o) => o.id === payload.order.id);
                const updated = idx >= 0
                  ? prev.map((o) => (o.id === payload.order.id ? payload.order : o))
                  : [payload.order, ...prev];
                recomputeStats(updated);
                return updated;
              });
            }
            fetchOrders(true);
          } else if (payload.eventType === 'ORDER_DELETED' && payload.orderId) {
            setOrders((prev) => {
              const remaining = prev.filter((o) => o.id !== payload.orderId);
              recomputeStats(remaining);
              return remaining;
            });
          }
        } catch (_) {}
      };

      eventSource.onerror = () => {
        // SSE reconnects automatically; keep quiet
      };
    } catch (err) {
      console.warn('SSE stream unavailable in Purchase Manager:', err);
    }

    // 3. Fallback sync poll (gentle interval)
    const interval = setInterval(() => fetchOrders(true), 15000);

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

  // Phone Visibility Helpers: Display Registered Mobile Number cleanly without clipping
  const isPhoneMasked = (orderId: string) => {
    if (!showAllPhones) return true;
    return maskedPhoneIds.has(orderId);
  };

  const getDisplayPhone = (phone: string, orderId: string) => {
    if (!phone) return '—';
    if (!isPhoneMasked(orderId)) return phone;
    const clean = String(phone).replace(/[^\d+]/g, '');
    if (clean.length >= 10) {
      return clean.slice(0, 5) + ' •••••';
    }
    return '•••••';
  };

  const toggleSinglePhoneMask = (orderId: string) => {
    setMaskedPhoneIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  // Submit Approval, Rejection, Revocation, or Payment Verification
  const handleDecideOrder = async (
    action: 'approve' | 'reject' | 'revoke' | 'verify_payment',
    targetOrder?: ReelPurchaseOrder,
    customReason?: string
  ) => {
    const orderToProcess = targetOrder || activeReviewOrder;
    if (!orderToProcess) return;

    let effReason = customReason || (action === 'approve' ? adminNote : rejectionReason);

    if (action === 'reject' && !effReason.trim()) {
      const entered = window.prompt(
        `Enter rejection reason for Order #${orderToProcess.id}:`,
        'UTR could not be matched against current BharatPe statement.'
      );
      if (!entered || !entered.trim()) {
        if (triggerToast) triggerToast('Rejection cancelled: reason is required.', 'info');
        return;
      }
      effReason = entered.trim();
    }

    if (
      action === 'revoke' &&
      !window.confirm(
        `Are you sure you want to REVOKE approval for Order #${orderToProcess.id}? This will immediately lock customer download access server-side.`
      )
    ) {
      return;
    }

    setIsSubmittingDecision(true);
    const nowIso = new Date().toISOString();

    // 1. Dual-update Firestore directly so any connected client updates immediately
    if (db && orderToProcess.id) {
      try {
        if (action === 'approve') {
          const downloadToken = crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '')
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
          await setDoc(
            doc(db, 'reels_orders', orderToProcess.id),
            {
              id: orderToProcess.id,
              status: 'APPROVED',
              verificationSource: 'manual_admin',
              paymentVerifiedAt: nowIso,
              approvedAt: nowIso,
              reviewedByAdminId: 'Murari Panjiyar (Mpanjiyar100@gmail.com)',
              downloadToken,
              masterDriveLink: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
              links: {
                masterGoogleDrive: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
                vaultAccessRoute: `/api/reels/vault-access/${orderToProcess.id}`,
                directTokenDownload: `/api/reels/download/${downloadToken}?category=all`,
              },
              updatedAt: nowIso,
            },
            { merge: true }
          );
        } else if (action === 'revoke') {
          await setDoc(
            doc(db, 'reels_orders', orderToProcess.id),
            {
              id: orderToProcess.id,
              status: 'REFUNDED',
              revokedAt: nowIso,
              reviewedByAdminId: 'Murari Panjiyar (Mpanjiyar100@gmail.com)',
              rejectionReason: effReason.trim() || 'Access revoked by administrator Murari Panjiyar',
              downloadToken: null,
              masterDriveLink: null,
              links: null,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        } else if (action === 'verify_payment') {
          await setDoc(
            doc(db, 'reels_orders', orderToProcess.id),
            {
              id: orderToProcess.id,
              paymentVerifiedAt: nowIso,
              verificationSource: 'manual_admin',
              updatedAt: nowIso,
            },
            { merge: true }
          );
        } else {
          await setDoc(
            doc(db, 'reels_orders', orderToProcess.id),
            {
              id: orderToProcess.id,
              status: 'REJECTED',
              rejectedAt: nowIso,
              reviewedByAdminId: 'Murari Panjiyar (Mpanjiyar100@gmail.com)',
              rejectionReason: effReason.trim(),
              downloadToken: null,
              masterDriveLink: null,
              links: null,
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
      const { res } = await fetchWithRetry(
        '/api/reels/admin/verify-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': 'mpanjiyar-admin-secret-2026',
          },
          body: JSON.stringify({
            orderId: orderToProcess.id,
            action,
            reason:
              action === 'approve'
                ? effReason.trim() || 'Verified by Murari Panjiyar in BharatPe records'
                : action === 'verify_payment'
                ? effReason.trim() || 'Payment verified in BharatPe statement records'
                : effReason.trim() ||
                  (action === 'revoke'
                    ? 'Access revoked and locked by administrator'
                    : 'Payment verification unsuccessful'),
            adminEmail: 'Mpanjiyar100@gmail.com',
            adminName: 'Murari Panjiyar',
          }),
        },
        {
          maxRetries: 3,
          initialDelayMs: 600,
          backoffFactor: 2,
          timeoutMs: 8000,
        }
      );

      const data = await res.json();
      if (data.success) {
        if (triggerToast) {
          triggerToast(
            action === 'approve'
              ? `Order ${orderToProcess.id} approved! Digital download unlocked.`
              : action === 'revoke'
              ? `Access revoked for Order ${orderToProcess.id}. Files locked.`
              : action === 'verify_payment'
              ? `Payment for Order ${orderToProcess.id} verified in records.`
              : `Order ${orderToProcess.id} marked as rejected.`,
            action === 'approve' || action === 'verify_payment' ? 'success' : 'info'
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

  // Execute Bulk Action across all selected orders
  const executeBulkAction = async (
    action: 'approve' | 'reject' | 'pending' | 'revoke' | 'verify_payment' | 'delete',
    reason?: string
  ) => {
    if (selectedOrderIds.size === 0) return;
    setIsBulkProcessing(true);
    const targetIds = Array.from(selectedOrderIds);

    const effReason = reason?.trim() || (
      action === 'approve'
        ? 'Bulk verified & approved by Murari Panjiyar against settlement records'
        : action === 'reject'
        ? 'Payment verification unsuccessful in bank records'
        : action === 'revoke'
        ? 'Access revoked and locked by administrator'
        : action === 'verify_payment'
        ? 'Payment verified against BharatPe statement'
        : 'Bulk status update by administrator'
    );

    // Direct Firestore optimistic multi-document updates for instant synchronization
    const nowIso = new Date().toISOString();
    if (db) {
      try {
        for (const id of targetIds) {
          if (action === 'delete') {
            deleteDoc(doc(db, 'reels_orders', id)).catch(() => {});
          } else {
            const partial: any = { id, updatedAt: nowIso };
            if (action === 'approve') {
              partial.status = 'APPROVED';
              partial.approvedAt = nowIso;
              partial.paymentVerifiedAt = nowIso;
              partial.reviewedByAdminId = 'Murari Panjiyar (Mpanjiyar100@gmail.com)';
              partial.masterDriveLink = 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing';
              partial.links = {
                masterGoogleDrive: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
                vaultAccessRoute: `/api/reels/vault-access/${id}`,
              };
            } else if (action === 'reject') {
              partial.status = 'REJECTED';
              partial.rejectedAt = nowIso;
              partial.rejectionReason = effReason;
              partial.reviewedByAdminId = 'Murari Panjiyar (Mpanjiyar100@gmail.com)';
            } else if (action === 'revoke') {
              partial.status = 'REFUNDED';
              partial.approvedAt = null;
            } else if (action === 'verify_payment') {
              partial.paymentVerifiedAt = nowIso;
              partial.verificationSource = 'manual_admin';
            } else if (action === 'pending') {
              partial.status = 'PENDING_ADMIN_REVIEW';
              partial.approvedAt = null;
              partial.rejectedAt = null;
            }
            setDoc(doc(db, 'reels_orders', id), partial, { merge: true }).catch(() => {});
          }
        }
      } catch (fsErr) {
        console.warn('Bulk Firestore write warning:', fsErr);
      }
    }

    try {
      const { res } = await fetchWithRetry(
        '/api/reels/admin/bulk-verify-orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': 'mpanjiyar-admin-secret-2026',
          },
          body: JSON.stringify({
            orderIds: targetIds,
            action,
            reason: effReason,
            adminName: 'Murari Panjiyar (Admin)',
            adminEmail: 'Mpanjiyar100@gmail.com',
          }),
        },
        {
          maxRetries: 3,
          initialDelayMs: 600,
          backoffFactor: 2,
          timeoutMs: 15000,
        }
      );

      const data = await res.json();
      if (data.success) {
        if (action === 'delete') {
          setOrders(prev => {
            const remaining = prev.filter(o => !selectedOrderIds.has(o.id));
            recomputeStats(remaining);
            return remaining;
          });
        } else {
          setOrders(prev => {
            const updated = prev.map(o => {
              if (selectedOrderIds.has(o.id)) {
                if (action === 'approve') {
                  return { ...o, status: 'APPROVED' as ReelOrderStatus, approvedAt: nowIso, paymentVerifiedAt: nowIso };
                }
                if (action === 'reject') {
                  return { ...o, status: 'REJECTED' as ReelOrderStatus, rejectedAt: nowIso, rejectionReason: effReason };
                }
                if (action === 'revoke') {
                  return { ...o, status: 'REFUNDED' as ReelOrderStatus, approvedAt: null };
                }
                if (action === 'verify_payment') {
                  return { ...o, paymentVerifiedAt: nowIso };
                }
                if (action === 'pending') {
                  return { ...o, status: 'PENDING_ADMIN_REVIEW' as ReelOrderStatus, approvedAt: null, rejectedAt: null };
                }
              }
              return o;
            });
            recomputeStats(updated);
            return updated;
          });
        }

        if (triggerToast) {
          triggerToast(
            data.message || `Bulk ${action.toUpperCase()} processed for ${targetIds.length} orders!`,
            action === 'approve' || action === 'verify_payment' ? 'success' : 'info'
          );
        }
        clearSelection();
        setBulkConfirmModal(null);
        setBulkRejectModalOpen(false);
        setBulkRejectionReason('');
        fetchOrders(true);
      } else {
        if (triggerToast) triggerToast(data.error || 'Failed to execute bulk operation', 'error');
      }
    } catch (err: any) {
      console.error('Bulk operation network error:', err);
      if (triggerToast) triggerToast(`Bulk ${action.toUpperCase()} updated in database.`, 'success');
      clearSelection();
      setBulkConfirmModal(null);
      setBulkRejectModalOpen(false);
      setBulkRejectionReason('');
      fetchOrders(true);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    window.location.href = '/api/reels/admin/export-csv';
    if (triggerToast) triggerToast('Downloading verified purchases CSV report...', 'info');
  };

  // Start Editing Order
  const handleStartEdit = (order: ReelPurchaseOrder) => {
    setEditingOrder(order);
    setEditFormData({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      amount: order.amount || 199,
      utrReference: order.utrReference || '',
      status: order.status || 'PENDING_ADMIN_REVIEW',
      adminNotes: order.adminNotes || '',
      rejectionReason: order.rejectionReason || '',
    });
  };

  // Save Order Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/reels/admin/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'mpanjiyar-admin-secret-2026',
        },
        body: JSON.stringify({
          ...editFormData,
          adminName: 'Murari Panjiyar (Admin)',
          adminEmail: 'Mpanjiyar100@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        if (db) {
          await setDoc(doc(db, 'reels_orders', editingOrder.id), data.order, { merge: true }).catch(() => {});
        }
        setOrders(prev => {
          const updated = prev.map(o => o.id === editingOrder.id ? data.order : o);
          recomputeStats(updated);
          return updated;
        });
        if (triggerToast) triggerToast(`Order ${editingOrder.id} updated successfully!`, 'success');
        setEditingOrder(null);
      } else {
        if (triggerToast) triggerToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      if (triggerToast) triggerToast('Network error updating order', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Order Deletion (Server-side access revocation)
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeletingOrder(true);
    try {
      const res = await fetch(`/api/reels/admin/orders/${deletingOrder.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'mpanjiyar-admin-secret-2026',
        },
        body: JSON.stringify({
          adminName: 'Murari Panjiyar (Admin)',
          adminEmail: 'Mpanjiyar100@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (db) {
          await deleteDoc(doc(db, 'reels_orders', deletingOrder.id)).catch(() => {});
        }
        setOrders(prev => {
          const remaining = prev.filter(o => o.id !== deletingOrder.id);
          recomputeStats(remaining);
          return remaining;
        });
        if (triggerToast) triggerToast(`Order ${deletingOrder.id} deleted. All access links revoked immediately!`, 'success');
        setDeletingOrder(null);
      } else {
        if (triggerToast) triggerToast(data.error || 'Failed to delete order', 'error');
      }
    } catch {
      if (triggerToast) triggerToast('Network error deleting order', 'error');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(o => {
      if (!o || !o.id) return false;
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchName = (o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.customerPhone || '').includes(q);
        const matchUtr = (o.utrReference || '').toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchUtr;
      }
      return true;
    })
    .sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === 'NEWEST' ? tB - tA : tA - tB;
    });

  // Bulk Selection Helpers
  const isAllFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every(o => selectedOrderIds.has(o.id));

  const isSomeFilteredSelected =
    filteredOrders.some(o => selectedOrderIds.has(o.id)) && !isAllFilteredSelected;

  const toggleSelectOrder = (orderId: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedOrderIds(prev => {
        const next = new Set(prev);
        filteredOrders.forEach(o => next.delete(o.id));
        return next;
      });
    } else {
      setSelectedOrderIds(prev => {
        const next = new Set(prev);
        filteredOrders.forEach(o => next.add(o.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedOrderIds(new Set());
  };

  const selectByStatus = (status: ReelOrderStatus) => {
    const matching = filteredOrders.filter(o => o.status === status);
    if (matching.length === 0) {
      if (triggerToast) triggerToast(`No orders with status ${status} found in current view.`, 'info');
      return;
    }
    setSelectedOrderIds(new Set(matching.map(o => o.id)));
    if (triggerToast) triggerToast(`Selected ${matching.length} order(s) with status ${status}.`, 'info');
  };

  const getStatusBadge = (status: ReelOrderStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-black tracking-wider ${
            isLight
              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            <CheckCircle2 size={13} className={isLight ? 'text-emerald-800' : 'text-emerald-400'} />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING_ADMIN_REVIEW':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-black tracking-wider ${
            isLight
              ? 'bg-amber-100 text-amber-950 border border-amber-300'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            <Clock size={13} className={`animate-spin ${isLight ? 'text-amber-800' : 'text-amber-400'}`} />
            <span>Awaiting Review</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-black tracking-wider ${
            isLight
              ? 'bg-rose-100 text-rose-950 border border-rose-300'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            <XCircle size={13} className={isLight ? 'text-rose-800' : 'text-rose-400'} />
            <span>REJECTED</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider ${
            isLight
              ? 'bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
          }`}>
            <Clock size={13} className={isLight ? 'text-slate-600' : 'text-zinc-400'} />
            <span>Pending UPI Scan</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-black tracking-wider ${
            isLight
              ? 'bg-slate-200 text-slate-900 border border-slate-300'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-600'
          }`}>
            <Lock size={13} className={isLight ? 'text-slate-700' : 'text-zinc-400'} />
            <span>Access Revoked</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-bold ${
            isLight
              ? 'bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-zinc-800 text-zinc-300 border border-white/10'
          }`}>
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Toolbar: Clean, Modern & Responsive */}
      <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/80 border-white/10'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-[#FF5500] text-black flex items-center justify-center shrink-0 shadow-sm">
            <ShoppingBag size={24} className="fill-black/30" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-lg sm:text-xl font-black font-mono tracking-tight ${isLight ? 'text-slate-950 font-black' : 'text-white font-bold'}`}>
                Puja Offer Orders
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${
                isLight ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                150K+ Reels Mega Pack
              </span>
            </div>
            <p className={`text-xs mt-1 font-mono ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
              Verify UPI payments against BharatPe records, manage customer approvals, and view full registered details in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Global Phone Privacy Toggle */}
          <button
            type="button"
            onClick={() => setShowAllPhones(!showAllPhones)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              showAllPhones
                ? isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
            }`}
            title="Toggle visibility of all Registered Mobile Numbers across the list"
          >
            {showAllPhones ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-zinc-400" />}
            <span>{showAllPhones ? 'Mobile Numbers: Visible' : 'Mobile Numbers: Masked'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOfferModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              isLight
                ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="Edit Festive Offer Popup, Floating Badge, pricing, and banners"
          >
            <Sliders size={14} className="text-amber-500" />
            <span>Offer Settings</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => fetchOrders()}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10'
            }`}
            title="Refresh order records"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Flat KPI Statistics Summary (Clean, Modern, No Unnecessary Boxes) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Verified Revenue */}
        <div className={`p-4 rounded-xl border space-y-1 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/60 border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Verified Revenue
            </span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
            ₹{stats.verifiedRevenue.toLocaleString('en-IN')}
          </div>
          <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            {stats.approvedOrders} Approved × ₹199
          </p>
        </div>

        {/* Card 2: Awaiting Approval */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'PENDING_ADMIN_REVIEW' ? 'ALL' : 'PENDING_ADMIN_REVIEW')}
          className={`p-4 rounded-xl border space-y-1 cursor-pointer transition-all ${
            statusFilter === 'PENDING_ADMIN_REVIEW'
              ? isLight
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                : 'bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/30'
              : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-amber-400' : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
              Awaiting Review
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>
            {stats.pendingReview}
          </div>
          <p className={`text-[11px] font-mono ${isLight ? 'text-amber-800' : 'text-amber-400/80'}`}>
            Needs verification
          </p>
        </div>

        {/* Card 3: Approved Purchases */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'ALL' : 'APPROVED')}
          className={`p-4 rounded-xl border space-y-1 cursor-pointer transition-all ${
            statusFilter === 'APPROVED'
              ? isLight
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/40'
                : 'bg-emerald-500/15 border-emerald-500/50 ring-2 ring-emerald-500/30'
              : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-emerald-400' : 'bg-zinc-900/60 border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
              Approved
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {stats.approvedOrders}
          </div>
          <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Access granted
          </p>
        </div>

        {/* Card 4: Rejected Requests */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'ALL' : 'REJECTED')}
          className={`p-4 rounded-xl border space-y-1 cursor-pointer transition-all ${
            statusFilter === 'REJECTED'
              ? isLight
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/40'
                : 'bg-rose-500/15 border-rose-500/50 ring-2 ring-rose-500/30'
              : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-rose-400' : 'bg-zinc-900/60 border-white/10 hover:border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${isLight ? 'text-rose-900' : 'text-rose-300'}`}>
              Rejected
            </span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {stats.rejectedOrders}
          </div>
          <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Unverified / denied
          </p>
        </div>

        {/* Card 5: Total Orders */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border space-y-1 cursor-pointer col-span-2 sm:col-span-1 transition-all ${
            statusFilter === 'ALL'
              ? isLight
                ? 'bg-slate-100 border-slate-400'
                : 'bg-zinc-800 border-white/20'
              : isLight ? 'bg-white border-slate-200 shadow-xs hover:border-slate-400' : 'bg-zinc-900/60 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Total Orders
            </span>
            <ShoppingBag size={16} className={isLight ? 'text-slate-700' : 'text-zinc-300'} />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {stats.totalOrders}
          </div>
          <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            {filteredOrders.length} displaying
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-white/10'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search size={16} className={`absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customer name, registered mobile, order ID, or UTR..."
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-mono outline-none transition-all ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 placeholder:text-slate-400'
                  : 'bg-black/60 border border-white/15 text-white focus:border-amber-500 placeholder:text-zinc-500'
              }`}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className={`text-xs font-mono font-bold shrink-0 ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-400'}`}>
              Filter:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono outline-none cursor-pointer ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-500'
                  : 'bg-black/80 border border-white/15 text-white focus:border-amber-500'
              }`}
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              <option value="PENDING_ADMIN_REVIEW">⏳ Awaiting Review ({stats.pendingReview})</option>
              <option value="APPROVED">✅ Approved & Paid ({stats.approvedOrders})</option>
              <option value="REJECTED">❌ Rejected ({stats.rejectedOrders})</option>
              <option value="PENDING_PAYMENT">🕒 Pending Scan ({stats.pendingPayment})</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className={`text-xs font-mono font-bold shrink-0 ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-400'}`}>
              Sort:
            </span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono outline-none cursor-pointer ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-500'
                  : 'bg-black/80 border border-white/15 text-white focus:border-amber-500'
              }`}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Selection Shortcuts */}
      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 flex-wrap font-mono text-xs ${
        isLight ? 'bg-white border-slate-200 text-slate-700 shadow-xs' : 'bg-zinc-900/40 border-white/10 text-zinc-300'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold flex items-center gap-1.5 shrink-0">
            <Layers size={14} className="text-amber-500" />
            <span>Multi-Order Selection:</span>
          </span>
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
              isAllFilteredSelected
                ? isLight ? 'bg-amber-100 border-amber-300 text-amber-950' : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            {isAllFilteredSelected ? 'Deselect All' : `Select All (${filteredOrders.length})`}
          </button>
          <button
            type="button"
            onClick={() => selectByStatus('PENDING_ADMIN_REVIEW')}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
              isLight ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
            }`}
          >
            Awaiting Review ({stats.pendingReview})
          </button>
          <button
            type="button"
            onClick={() => selectByStatus('APPROVED')}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
              isLight ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            }`}
          >
            Approved ({stats.approvedOrders})
          </button>
        </div>

        {selectedOrderIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className={`font-black ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
              {selectedOrderIds.size} selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer hover:underline ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Bulk Action Sticky Toolbar (Prominent when 1+ orders are selected) */}
      {selectedOrderIds.size > 0 && (
        <div className={`p-4 rounded-2xl border transition-all sticky top-2 z-30 shadow-xl backdrop-blur-md ${
          isLight
            ? 'bg-amber-50/95 border-amber-300 text-slate-900 shadow-amber-900/10'
            : 'bg-zinc-900/95 border-amber-500/50 text-white shadow-black/40'
        }`}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                isLight ? 'bg-amber-200/80 text-amber-950 border border-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                <CheckSquare size={16} className="text-amber-500 shrink-0" />
                <span>{selectedOrderIds.size} of {filteredOrders.length} order(s) selected</span>
              </div>
              {filteredOrders.length > selectedOrderIds.size && (
                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  className={`text-xs font-mono font-bold underline cursor-pointer hover:opacity-80 ${
                    isLight ? 'text-amber-900' : 'text-amber-300'
                  }`}
                >
                  Select all {filteredOrders.length}
                </button>
              )}
              <button
                type="button"
                onClick={clearSelection}
                className={`text-xs font-mono font-bold cursor-pointer inline-flex items-center gap-1 hover:opacity-80 ${
                  isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <X size={14} />
                <span>Deselect All</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk Approve */}
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => {
                  setBulkConfirmModal({
                    isOpen: true,
                    action: 'approve',
                    title: `Approve ${selectedOrderIds.size} Selected Orders?`,
                    description: `This will approve all ${selectedOrderIds.size} selected purchase orders simultaneously, generate cryptographic 32-byte download tokens, and immediately unlock Google Drive master access for each customer.`,
                    confirmLabel: `Approve All (${selectedOrderIds.size})`,
                    confirmColor: 'emerald',
                  });
                }}
                className="py-2 px-3.5 rounded-xl font-mono font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                title="Approve selected orders and grant download access"
              >
                <CheckCircle2 size={14} />
                <span>Approve ({selectedOrderIds.size})</span>
              </button>

              {/* Bulk Verify Payment */}
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => {
                  setBulkConfirmModal({
                    isOpen: true,
                    action: 'verify_payment',
                    title: `Mark Payment Verified for ${selectedOrderIds.size} Orders?`,
                    description: `This marks payment transactions as verified against BharatPe settlement statements in records for all ${selectedOrderIds.size} selected orders.`,
                    confirmLabel: `Verify Payment (${selectedOrderIds.size})`,
                    confirmColor: 'blue',
                  });
                }}
                className="py-2 px-3.5 rounded-xl font-mono font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                title="Verify payment against BharatPe records"
              >
                <ShieldCheck size={14} />
                <span>Verify ({selectedOrderIds.size})</span>
              </button>

              {/* Bulk Reject */}
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => {
                  setBulkRejectModalOpen(true);
                }}
                className="py-2 px-3.5 rounded-xl font-mono font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                title="Reject selected orders with reason"
              >
                <XCircle size={14} />
                <span>Reject ({selectedOrderIds.size})</span>
              </button>

              {/* Bulk Revoke Access */}
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => {
                  setBulkConfirmModal({
                    isOpen: true,
                    action: 'revoke',
                    title: `Revoke Access for ${selectedOrderIds.size} Orders?`,
                    description: `This will immediately invalidate all download tokens and revoke Google Drive links server-side for all ${selectedOrderIds.size} selected orders. Customers will be locked out until a new purchase is made.`,
                    confirmLabel: `Revoke Access (${selectedOrderIds.size})`,
                    confirmColor: 'amber',
                  });
                }}
                className={`py-2 px-3.5 rounded-xl font-mono font-bold text-xs border cursor-pointer transition-all inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  isLight
                    ? 'border-amber-400 bg-amber-100/70 hover:bg-amber-200 text-amber-950 font-bold'
                    : 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                }`}
                title="Revoke download access server-side"
              >
                <Lock size={14} />
                <span>Revoke ({selectedOrderIds.size})</span>
              </button>

              {/* Bulk Delete */}
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => {
                  setBulkConfirmModal({
                    isOpen: true,
                    action: 'delete',
                    title: `Permanently Delete ${selectedOrderIds.size} Orders?`,
                    description: `WARNING: This will permanently delete the ${selectedOrderIds.size} selected order records and invalidate all access tokens immediately server-side. This action is irreversible.`,
                    confirmLabel: `Delete (${selectedOrderIds.size})`,
                    confirmColor: 'rose',
                  });
                }}
                className="py-2 px-3.5 rounded-xl font-mono font-bold text-xs bg-zinc-800 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/30 cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                title="Permanently delete selected orders"
              >
                <Trash2 size={14} />
                <span>Delete ({selectedOrderIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Mobile Orders Card List (< 768px): Clean, Modern, Flat Cards with Complete Labels */}
      <div className="md:hidden space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className={`p-8 text-center text-xs font-mono rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-900/60 border-white/10 text-zinc-400'
          }`}>
            No orders found matching your search.
          </div>
        ) : (
          filteredOrders.map((order, orderIdx) => {
            const isPendingReview = order.status === 'PENDING_ADMIN_REVIEW';
            const isApproved = order.status === 'APPROVED';
            const isPhoneHidden = isPhoneMasked(order.id);
            const displayPhone = getDisplayPhone(order.customerPhone, order.id);
            const cardKey = order.id ? `mobile-order-${order.id}` : `mobile-order-fallback-${orderIdx}`;

            return (
              <div
                key={cardKey}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 font-mono text-xs ${
                  selectedOrderIds.has(order.id)
                    ? isLight
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                      : 'bg-amber-950/20 border-amber-500/60 ring-2 ring-amber-500/40'
                    : isPendingReview
                    ? isLight
                      ? 'bg-white border-amber-400 shadow-sm'
                      : 'bg-zinc-900/90 border-amber-500/40'
                    : isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-zinc-900/70 border-white/10'
                }`}
              >
                {/* 1. Order ID, Checkbox & Approval Status */}
                <div className={`flex items-start justify-between gap-2 pb-3 border-b ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.id}`}
                      checked={selectedOrderIds.has(order.id)}
                      onChange={(e) => toggleSelectOrder(order.id, e)}
                      className="mt-1 w-5 h-5 rounded text-amber-500 cursor-pointer accent-amber-500 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        Order ID
                      </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-bold font-mono text-xs select-all ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                        {order.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.id, `id-${order.id}`)}
                        className={`p-1 rounded cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
                        title="Copy Order ID"
                      >
                        {copiedKey === `id-${order.id}` ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(order.status)}</div>
                </div>

                {/* 2. Customer Name (Fully visible, wraps naturally) */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-bold flex items-center gap-1.5 shrink-0 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    <User size={13} className="text-[#FF5500]" />
                    <span>Customer Name:</span>
                  </span>
                  <span className={`font-bold text-right text-xs break-words ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                    {order.customerName || 'Customer'}
                  </span>
                </div>

                {/* 3. Registered Mobile Number — Full Label & Full Visibility */}
                <div className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                }`}>
                  <span className={`text-xs font-bold flex items-center gap-1.5 shrink-0 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    <Phone size={13} className="text-emerald-500" />
                    <span>Registered Mobile Number:</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono font-bold text-xs select-all ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>
                      {displayPhone}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSinglePhoneMask(order.id)}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={isPhoneHidden ? 'Show full phone number' : 'Mask phone number'}
                    >
                      {isPhoneHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.customerPhone, `ph-${order.id}`)}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Copy Mobile Number"
                    >
                      {copiedKey === `ph-${order.id}` ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone.replace(/[^\d+]/g, '')}`}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          isLight ? 'text-emerald-700 hover:text-emerald-950' : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                        title="Call Customer"
                      >
                        <PhoneCall size={13} />
                      </a>
                    )}
                  </div>
                </div>

                {/* 4. Payment Status & UTR */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-bold flex items-center gap-1.5 shrink-0 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    <CreditCard size={13} className="text-amber-500" />
                    <span>Payment Status:</span>
                  </span>
                  <div className="text-right space-y-1">
                    {order.paymentVerifiedAt || order.verificationSource === 'manual_admin' ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <CheckCircle2 size={11} />
                        <span>Verified in BharatPe</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <Clock size={11} />
                        <span>Pending Verification</span>
                      </span>
                    )}
                    {order.utrReference ? (
                      <div className="text-xs font-mono">
                        <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>UTR: </span>
                        <strong className={`select-all ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>
                          {order.utrReference}
                        </strong>
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-500 font-mono">No UTR submitted</div>
                    )}
                  </div>
                </div>

                {/* 5. Amount & Date */}
                <div className={`flex items-center justify-between text-xs pt-2.5 border-t ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <div>
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>Amount: </span>
                    <strong className={`font-mono text-xs ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>
                      ₹{order.amount || 199} INR
                    </strong>
                  </div>
                  <div className={`text-right text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {new Date(order.submittedAt || order.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>

                {/* 6. Clean, Flat Action Toolbar */}
                <div className={`pt-2.5 border-t flex flex-wrap items-center gap-2 ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}>
                  {/* Primary Approval / Revoke Actions */}
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleDecideOrder('approve', order)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDecideOrder('revoke', order)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>Revoke Access</span>
                    </button>
                  )}

                  {isPendingReview && (
                    <button
                      type="button"
                      onClick={() => handleDecideOrder('reject', order)}
                      className={`py-2.5 px-3 rounded-xl font-mono font-bold text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
                        isLight
                          ? 'border-rose-300 text-rose-900 bg-rose-50 hover:bg-rose-100'
                          : 'border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20'
                      }`}
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Secondary Action Icons with Clear Text */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setActiveReviewOrder(order)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                      title="View Full Details"
                    >
                      <Eye size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(order)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                      title="Edit Purchase Record"
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingOrder(order)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'
                      }`}
                      title="Delete Record & Revoke Access"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAuditOrder(order)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                      title="View Audit Trail"
                    >
                      <History size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Desktop Orders Table (>= 768px): Flat, High-Contrast, No Restricted Widths */}
      <div className={`hidden md:block rounded-2xl border overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/80 border-white/10'
      }`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[1080px]">
            <thead className={`text-[11px] font-mono uppercase tracking-wider border-b ${
              isLight ? 'bg-slate-50 text-slate-700 border-slate-200 font-bold' : 'bg-zinc-900/90 text-zinc-300 border-white/10 font-bold'
            }`}>
              <tr>
                <th className="py-3.5 px-3 w-12 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all orders"
                    checked={isAllFilteredSelected}
                    ref={el => {
                      if (el) el.indeterminate = isSomeFilteredSelected;
                    }}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer accent-amber-500"
                    title={isAllFilteredSelected ? "Deselect all filtered orders" : "Select all filtered orders"}
                  />
                </th>
                <th className="py-3.5 px-4 min-w-[170px]">Order ID</th>
                <th className="py-3.5 px-4 min-w-[160px]">Customer Name</th>
                <th className="py-3.5 px-4 min-w-[210px]">Registered Mobile Number</th>
                <th className="py-3.5 px-4 min-w-[190px]">Payment Verification Status</th>
                <th className="py-3.5 px-4 min-w-[140px]">Order Submission Date</th>
                <th className="py-3.5 px-4 min-w-[150px]">Admin Approval Status</th>
                <th className="py-3.5 px-4 text-right min-w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isLight ? 'divide-slate-200' : 'divide-white/5'}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, orderIdx) => {
                  const isPendingReview = order.status === 'PENDING_ADMIN_REVIEW';
                  const isApproved = order.status === 'APPROVED';
                  const isPhoneHidden = isPhoneMasked(order.id);
                  const displayPhone = getDisplayPhone(order.customerPhone, order.id);
                  const rowKey = order.id ? `table-order-${order.id}` : `table-order-fallback-${orderIdx}`;

                  return (
                    <tr
                      key={rowKey}
                      className={`transition-colors ${
                        selectedOrderIds.has(order.id)
                          ? isLight
                            ? 'bg-amber-100/60 hover:bg-amber-100/80 border-l-4 border-l-amber-500'
                            : 'bg-amber-950/40 hover:bg-amber-950/50 border-l-4 border-l-amber-500'
                          : isPendingReview
                          ? isLight
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : 'bg-amber-950/20 hover:bg-amber-950/30'
                          : isLight
                          ? 'hover:bg-slate-50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Column 0: Selection Checkbox */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select order ${order.id}`}
                          checked={selectedOrderIds.has(order.id)}
                          onChange={(e) => toggleSelectOrder(order.id, e)}
                          className="w-4 h-4 rounded text-amber-500 cursor-pointer accent-amber-500"
                        />
                      </td>

                      {/* Column 1: Order ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-mono font-black select-all ${isLight ? 'text-slate-950 font-black' : 'text-white font-bold'}`}>
                            {order.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.id, `id-${order.id}`)}
                            className={`p-1 rounded cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
                            title="Copy Order ID"
                          >
                            {copiedKey === `id-${order.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <span className={`text-[11px] font-bold block mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                          ₹{order.amount || 199} INR
                        </span>
                      </td>

                      {/* Column 2: Customer Name (Natural wrapping allowed) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#FF5500] shrink-0" />
                          <span className={`font-bold break-words ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                            {order.customerName || 'Customer'}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Registered Mobile Number — Full Label & Full Visibility */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-mono font-bold select-all ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>
                            {displayPhone}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSinglePhoneMask(order.id)}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                            title={isPhoneHidden ? 'Show full phone number' : 'Mask phone number'}
                          >
                            {isPhoneHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.customerPhone, `ph-${order.id}`)}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                            title="Copy Registered Mobile Number"
                          >
                            {copiedKey === `ph-${order.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Column 4: Payment Verification Status */}
                      <td className="py-3.5 px-4">
                        {order.paymentVerifiedAt || order.verificationSource === 'manual_admin' ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              <CheckCircle2 size={11} />
                              <span>Verified in BharatPe</span>
                            </span>
                            {order.utrReference && (
                              <div className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                UTR: <strong className={`select-all ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>{order.utrReference}</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              <Clock size={11} />
                              <span>Pending Verification</span>
                            </span>
                            {order.utrReference ? (
                              <div className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                UTR: <strong className={`select-all ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>{order.utrReference}</strong>
                              </div>
                            ) : (
                              <div className="text-[11px] text-zinc-500 font-mono">No UTR submitted</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Order Submission Date */}
                      <td className="py-3.5 px-4">
                        <div className={`text-xs font-bold ${isLight ? 'text-slate-900 font-bold' : 'text-zinc-200'}`}>
                          {new Date(order.submittedAt || order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                          {new Date(order.submittedAt || order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Column 6: Admin Approval Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Quick Decision Buttons */}
                          {!isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleDecideOrder('approve', order)}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              title="Approve Order & Grant Access"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDecideOrder('revoke', order)}
                              className="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              title="Revoke Approval & Lock Access"
                            >
                              Revoke
                            </button>
                          )}

                          {isPendingReview && (
                            <button
                              type="button"
                              onClick={() => handleDecideOrder('reject', order)}
                              className={`py-1.5 px-2.5 rounded-lg font-mono font-bold text-xs border transition-colors cursor-pointer ${
                                isLight
                                  ? 'border-rose-300 text-rose-900 bg-rose-50 hover:bg-rose-100'
                                  : 'border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20'
                              }`}
                              title="Reject Order"
                            >
                              Reject
                            </button>
                          )}

                          {/* Detail & Edit Actions */}
                          <button
                            type="button"
                            onClick={() => setActiveReviewOrder(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                            }`}
                            title="View Full Details"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                            }`}
                            title="Edit Purchase Record"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingOrder(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight
                                ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'
                            }`}
                            title="Delete Record & Revoke Access"
                          >
                            <Trash2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveAuditOrder(order)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                            }`}
                            title="View Audit Trail"
                          >
                            <History size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. ORDER REVIEW & DECISION MODAL */}
      {activeReviewOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setActiveReviewOrder(null)}
          />

          <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl z-10 overflow-hidden my-auto ${
            isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-zinc-950 text-white border-white/15'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                    Review Purchase & Authorization
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}`}>
                    Order ID: {activeReviewOrder.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveReviewOrder(null)}
                className={`p-2 rounded-xl cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className={`text-[11px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Customer Full Name
                  </span>
                  <span className={`font-bold text-sm break-words ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                    {activeReviewOrder.customerName || 'Customer'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className={`text-[11px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Registered Mobile Number
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold text-sm select-all ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>
                      {activeReviewOrder.customerPhone || '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeReviewOrder.customerPhone, 'modal-phone')}
                      className={`p-1 rounded cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
                      title="Copy Mobile Number"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className={`text-[11px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Payable Amount
                  </span>
                  <span className={`font-black text-sm ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>
                    ₹{activeReviewOrder.amount || 199} INR
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <span className={`text-[11px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Current Order Status
                  </span>
                  <div className="mt-0.5">{getStatusBadge(activeReviewOrder.status)}</div>
                </div>
              </div>

              {/* UTR Verification Details */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-amber-50/70 border-amber-300' : 'bg-amber-500/10 border-amber-500/25'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs uppercase font-bold flex items-center gap-1.5 ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>
                    <Tag size={13} />
                    Customer Submitted 12-Digit UTR
                  </span>
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Reconcile in BharatPe statement
                  </span>
                </div>

                <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                  isLight ? 'bg-white border-amber-300 shadow-xs' : 'bg-black/60 border-white/10'
                }`}>
                  <span className={`text-base sm:text-lg font-black tracking-widest select-all ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>
                    {activeReviewOrder.utrReference || 'No UTR Submitted Yet'}
                  </span>
                  {activeReviewOrder.utrReference && (
                    <button
                      type="button"
                      onClick={() => handleCopy(activeReviewOrder.utrReference!, 'modal-utr')}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer hover:bg-amber-300 shadow-sm"
                    >
                      Copy UTR
                    </button>
                  )}
                </div>

                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Verify that a ₹{activeReviewOrder.amount || 199} credit matching UTR <strong>{activeReviewOrder.utrReference || 'N/A'}</strong> appears in your BharatPe merchant settlements.
                </p>
              </div>

              {/* Admin Decision Forms */}
              {activeReviewOrder.status === 'PENDING_ADMIN_REVIEW' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-bold ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                      Optional Approval Note for Audit Records:
                    </label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="e.g. Verified in BharatPe statement (settled at 10:15 AM)"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500'
                          : 'bg-black/60 border border-white/15 text-white focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmittingDecision}
                      onClick={() => handleDecideOrder('approve')}
                      className="w-full py-3 px-4 rounded-xl font-mono font-black text-xs uppercase bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>{isSubmittingDecision ? 'Approving...' : 'Approve & Unlock Digital Access'}</span>
                    </button>
                  </div>

                  <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    <label className="text-rose-500 font-bold block text-xs">
                      Or Reject with Reason (Required if rejecting):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="e.g. UTR not found in bank statement, amount was incorrect..."
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500'
                            : 'bg-black/60 border border-white/15 text-white focus:border-rose-500'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={isSubmittingDecision || !rejectionReason.trim()}
                        onClick={() => handleDecideOrder('reject')}
                        className="py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already Approved Order - Option to Revoke Access */}
              {activeReviewOrder.status === 'APPROVED' && (
                <div className="space-y-4 pt-2">
                  <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  }`}>
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-bold ${isLight ? 'text-emerald-950 font-black' : 'text-emerald-300'}`}>
                        Active & Verified Access Granted
                      </span>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        This customer currently has full access to the 150K+ Reels Mega Pack resources.
                      </p>
                    </div>
                  </div>

                  <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    <label className="text-rose-500 font-bold block text-xs">
                      Revoke Approval & Lock Access:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Revocation reason (e.g. Payment chargeback, duplicate refund)"
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500'
                            : 'bg-black/60 border border-white/15 text-white focus:border-rose-500'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={isSubmittingDecision}
                        onClick={() => handleDecideOrder('revoke')}
                        className="py-2.5 px-4 rounded-xl font-mono font-black text-xs uppercase bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <XCircle size={14} />
                        <span>{isSubmittingDecision ? 'Revoking...' : 'Revoke Approval'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejected / Refunded Order - Option to Re-evaluate and Approve */}
              {(activeReviewOrder.status === 'REJECTED' || activeReviewOrder.status === 'REFUNDED') && (
                <div className="space-y-3 pt-2">
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isLight ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}>
                    <XCircle size={16} className="shrink-0" />
                    <span>Access is currently locked ({activeReviewOrder.status}).</span>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={() => handleDecideOrder('approve')}
                    className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span>Re-Approve & Restore Customer Access</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT TRAIL MODAL */}
      {activeAuditOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setActiveAuditOrder(null)}
          />

          <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl z-10 overflow-hidden my-auto ${
            isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-zinc-950 text-white border-white/15'
          }`}>
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <History size={20} />
                </div>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                    Audit & Action History
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Order ID: {activeAuditOrder.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAuditOrder(null)}
                className={`p-2 rounded-xl cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto font-mono text-xs">
              <div className={`p-3 rounded-xl border grid grid-cols-2 gap-2 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div>
                  <span className={`block text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Customer:</span>
                  <span className={`font-bold ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>{activeAuditOrder.customerName || 'Customer'}</span>
                </div>
                <div>
                  <span className={`block text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Current Status:</span>
                  <span className={`font-bold ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>{activeAuditOrder.status}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Timeline of Events:
                </span>
                {(!activeAuditOrder.auditLogs || activeAuditOrder.auditLogs.length === 0) ? (
                  <div className={`p-4 rounded-xl text-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-zinc-400'}`}>
                    No audit records found for this order.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeAuditOrder.auditLogs.map((log, idx) => (
                      <div
                        key={`audit-${activeAuditOrder.id}-${log.timestamp || idx}-${log.action || ''}-${idx}`}
                        className={`p-3 rounded-xl border space-y-1 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>{log.action}</span>
                          <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>
                            {new Date(log.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>{log.details}</p>
                        <div className={`text-[11px] pt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          Actor: <strong>{log.actor}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setActiveAuditOrder(null)}
                  className={`py-2 px-4 rounded-xl font-bold cursor-pointer ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. EDIT ORDER RECORD MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => !isSavingEdit && setEditingOrder(null)}
          />

          <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl z-10 overflow-hidden my-auto ${
            isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-zinc-950 text-white border-white/15'
          }`}>
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>
                    Edit Purchase Record
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Order: {editingOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSavingEdit && setEditingOrder(null)}
                className={`p-2 rounded-xl cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 space-y-4 font-mono text-xs max-h-[75vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.customerName}
                  onChange={e => setEditFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
                      : 'bg-black/60 border border-white/15 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={editFormData.customerPhone}
                  onChange={e => setEditFormData(prev => ({ ...prev, customerPhone: e.target.value.replace(/[^\d]/g, '') }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
                      : 'bg-black/60 border border-white/15 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                    Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.amount}
                    onChange={e => setEditFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
                        : 'bg-black/60 border border-white/15 text-white focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                    12-Digit UTR Ref
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={editFormData.utrReference}
                    onChange={e => setEditFormData(prev => ({ ...prev, utrReference: e.target.value.replace(/[\s-]+/g, '') }))}
                    placeholder="12-digit UTR"
                    className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
                        : 'bg-black/60 border border-white/15 text-white focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                  Approval / Payment Status *
                </label>
                <select
                  value={editFormData.status}
                  onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl outline-none cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-500'
                      : 'bg-black/80 border border-white/15 text-white focus:border-amber-500'
                  }`}
                >
                  <option value="PENDING_ADMIN_REVIEW">PENDING_ADMIN_REVIEW (Awaiting Murari Review)</option>
                  <option value="APPROVED">APPROVED (Entitlements Unlocked)</option>
                  <option value="REJECTED">REJECTED (Access Denied)</option>
                  <option value="REFUNDED">REFUNDED (Access Revoked)</option>
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT (Awaiting UPI)</option>
                  <option value="PAYMENT_FAILED">PAYMENT_FAILED (Transaction Failed)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase block ${isLight ? 'text-slate-700 font-bold' : 'text-zinc-300'}`}>
                  Admin Audit Note
                </label>
                <textarea
                  rows={2}
                  value={editFormData.adminNotes}
                  onChange={e => setEditFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Internal audit notes..."
                  className={`w-full px-3.5 py-2.5 rounded-xl outline-none ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
                      : 'bg-black/60 border border-white/15 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setEditingOrder(null)}
                  className={`py-2.5 px-4 rounded-xl font-bold cursor-pointer ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="py-2.5 px-5 rounded-xl font-bold bg-[#FF5500] hover:bg-orange-600 text-white cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  {isSavingEdit && <RefreshCw size={13} className="animate-spin" />}
                  <span>{isSavingEdit ? 'Saving...' : 'Save Order Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. DELETE ORDER CONFIRMATION MODAL */}
      {deletingOrder && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => !isDeletingOrder && setDeletingOrder(null)}
          />

          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl z-10 overflow-hidden my-auto p-5 sm:p-6 space-y-4 ${
            isLight ? 'bg-white text-slate-900 border-rose-300' : 'bg-zinc-950 text-white border-rose-500/40'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className={`font-bold text-base sm:text-lg ${isLight ? 'text-rose-950 font-black' : 'text-rose-400'}`}>
                  Permanently Delete Order?
                </h3>
                <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Order ID: {deletingOrder.id}
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 ${
              isLight ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
            }`}>
              <p className="font-bold">⚠️ Critical Access Revocation Warning:</p>
              <p className="text-[11px] leading-relaxed">
                Deleting this order removes the record from both database and disk. All associated download tokens and Google Drive access links are invalidated server-side immediately.
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono text-xs space-y-1.5 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/40 border-white/10 text-white'
            }`}>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Customer:</span>
                <span className={`font-bold ${isLight ? 'text-slate-950 font-black' : 'text-white'}`}>{deletingOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Registered Mobile Number:</span>
                <span className={`font-bold font-mono ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>{deletingOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Amount:</span>
                <span className={`font-bold ${isLight ? 'text-emerald-900 font-black' : 'text-emerald-400'}`}>₹{deletingOrder.amount} INR</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Current Status:</span>
                <span className={`font-bold ${isLight ? 'text-amber-950 font-black' : 'text-amber-400'}`}>{deletingOrder.status}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setDeletingOrder(null)}
                className={`py-2.5 px-4 rounded-xl font-bold cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmDelete}
                className="py-2.5 px-5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                {isDeletingOrder && <RefreshCw size={14} className="animate-spin" />}
                <span>Delete & Revoke Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8B. Bulk Confirmation Modal */}
      {bulkConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-900 border-white/20 text-white'
          }`}>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {bulkConfirmModal.action === 'approve' && <CheckCircle2 size={22} className="text-emerald-500" />}
                {bulkConfirmModal.action === 'verify_payment' && <ShieldCheck size={22} className="text-blue-500" />}
                {bulkConfirmModal.action === 'revoke' && <Lock size={22} className="text-amber-500" />}
                {bulkConfirmModal.action === 'delete' && <Trash2 size={22} className="text-rose-500" />}
                <h3 className="text-base font-black">
                  {bulkConfirmModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkConfirmModal(null)}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              {bulkConfirmModal.description}
            </p>

            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'
            }`}>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Target Orders:</span>
                <span className="font-bold">{selectedOrderIds.size} orders selected</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Admin Authorizer:</span>
                <span className="font-bold text-amber-500">Murari Panjiyar (Admin)</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Real-Time Sync:</span>
                <span className="font-bold text-emerald-500">Firestore & SSE Multi-Device</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => setBulkConfirmModal(null)}
                className={`py-2 px-4 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => executeBulkAction(bulkConfirmModal.action)}
                className={`py-2 px-5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  bulkConfirmModal.confirmColor === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : bulkConfirmModal.confirmColor === 'blue'
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : bulkConfirmModal.confirmColor === 'amber'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isBulkProcessing && <RefreshCw size={13} className="animate-spin" />}
                <span>{bulkConfirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8C. Bulk Rejection Modal with Preset Reasons */}
      {bulkRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-900 border-white/20 text-white'
          }`}>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <XCircle size={22} className="text-rose-500" />
                <h3 className="text-base font-black">
                  Bulk Reject {selectedOrderIds.size} Orders
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBulkRejectModalOpen(false);
                  setBulkRejectionReason('');
                }}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Specify the reason for rejecting these {selectedOrderIds.size} orders. Customers will see this exact message when tracking their order.
            </p>

            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Quick Preset Reasons:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  'UTR transaction reference not found in BharatPe merchant records',
                  'Payment amount does not match offer price of ₹199 INR',
                  'Invalid or duplicate transaction reference submitted',
                  'Transaction expired or marked as failed at bank gateway',
                ].map((preset, pIdx) => (
                  <button
                    key={`bulk-preset-${pIdx}`}
                    type="button"
                    onClick={() => setBulkRejectionReason(preset)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      bulkRejectionReason === preset
                        ? isLight ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold' : 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                        : isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Custom Rejection Reason:
              </label>
              <textarea
                rows={3}
                value={bulkRejectionReason}
                onChange={e => setBulkRejectionReason(e.target.value)}
                placeholder="Enter specific details explaining why payment was not verified..."
                className={`w-full p-3 rounded-xl text-xs font-mono outline-none resize-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-rose-500'
                    : 'bg-black/60 border border-white/15 text-white focus:border-rose-500 placeholder:text-zinc-500'
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => {
                  setBulkRejectModalOpen(false);
                  setBulkRejectionReason('');
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkProcessing || !bulkRejectionReason.trim()}
                onClick={() => executeBulkAction('reject', bulkRejectionReason)}
                className="py-2 px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBulkProcessing && <RefreshCw size={13} className="animate-spin" />}
                <span>Confirm Bulk Rejection ({selectedOrderIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Offer Section Admin Customizer Modal */}
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
