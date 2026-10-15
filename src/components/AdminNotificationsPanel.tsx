import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Check,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Clock,
  User,
  Phone,
  Tag
} from 'lucide-react';
import { AdminAlertNotification, AdminNotificationType, AdminNotificationSeverity } from '../types';

interface AdminNotificationsPanelProps {
  currentTheme?: 'light' | 'normal' | 'dark' | 'mono';
  onOpenOrderReview?: (orderId: string) => void;
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminNotificationsPanel: React.FC<AdminNotificationsPanelProps> = ({
  currentTheme = 'dark',
  onOpenOrderReview,
  triggerToast,
}) => {
  const [notifications, setNotifications] = useState<AdminAlertNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | AdminNotificationType>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AdminNotificationSeverity>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isLight = currentTheme === 'light';

  // Fetch notifications
  const fetchNotifications = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const res = await fetch('/api/reels/admin/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Failed to fetch admin notifications:', e);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup real-time Server-Sent Events (SSE) listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/reels/events?isAdmin=true');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.eventType === 'NEW_NOTIFICATION') {
            setNotifications(prev => [payload.notification, ...prev.filter(n => n.id !== payload.notification.id)]);
            setUnreadCount(c => c + 1);
            if (triggerToast) {
              triggerToast(`🔔 Alert: ${payload.notification.title}`, payload.notification.severity === 'ERROR' ? 'error' : 'info');
            }
          } else if (payload.eventType === 'NOTIFICATION_READ') {
            setNotifications(prev => prev.map(n => n.id === payload.id ? { ...n, readAt: new Date().toISOString() } : n));
            setUnreadCount(c => Math.max(0, c - 1));
          } else if (payload.eventType === 'NOTIFICATIONS_ALL_READ') {
            setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
            setUnreadCount(0);
          } else if (payload.eventType === 'ORDER_SUBMITTED_FOR_REVIEW') {
            fetchNotifications(true);
          }
        } catch (_) {}
      };
    } catch (err) {
      console.warn('SSE notification stream unavailable:', err);
    }

    // Backup polling every 12 seconds
    const interval = setInterval(() => fetchNotifications(true), 12000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/reels/admin/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (_) {}
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/reels/admin/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      if (triggerToast) triggerToast('All notifications marked as read', 'success');
    } catch (_) {}
  };

  // Quick Approve directly from notification
  const handleQuickApprove = async (orderId: string, notifId: string) => {
    setActionLoadingId(notifId);
    try {
      const res = await fetch('/api/reels/admin/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'approve',
          reason: 'Verified in BharatPe records by Murari Panjiyar',
          adminEmail: 'Mpanjiyar100@gmail.com',
          adminName: 'Murari Panjiyar',
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (triggerToast) triggerToast(`Order ${orderId} approved! Digital access unlocked.`, 'success');
        handleMarkAsRead(notifId);
        fetchNotifications(true);
      } else {
        if (triggerToast) triggerToast(data.error || 'Approval failed', 'error');
      }
    } catch {
      if (triggerToast) triggerToast('Network error processing approval', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered list
  const filtered = notifications.filter(n => {
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    if (severityFilter !== 'ALL' && n.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = n.relatedOrderId?.toLowerCase().includes(q);
      const matchName = n.customerName?.toLowerCase().includes(q);
      const matchUtr = n.utrReference?.toLowerCase().includes(q);
      const matchMsg = n.message?.toLowerCase().includes(q);
      const matchTitle = n.title?.toLowerCase().includes(q);
      return matchOrder || matchName || matchUtr || matchMsg || matchTitle;
    }
    return true;
  });

  const getSeverityBadge = (sev: AdminNotificationSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-red-600 text-white"><AlertOctagon size={11} /> CRITICAL</span>;
      case 'ERROR':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30"><XCircle size={11} /> ERROR</span>;
      case 'WARNING':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30"><AlertTriangle size={11} /> WARNING</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30"><Info size={11} /> INFO</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950/90 border-white/10'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5500] to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0 relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-[11px] font-mono font-black flex items-center justify-center animate-bounce shadow-md">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg sm:text-xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Administrative Notifications &amp; System Alerts
              </h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Real-time feed for Murari Panjiyar: Manual payment reviews, failed webhook events, and security warnings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            <Check size={14} />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            onClick={() => fetchNotifications()}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="Refresh alerts"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer name, UTR..."
              className={`w-full pl-10 pr-3.5 py-2 rounded-xl text-xs font-mono outline-none transition-all ${
                isLight ? 'bg-white border border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/80 border border-white/10 text-white focus:border-[#FF5500]'
              }`}
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-zinc-400 shrink-0">Type:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'MANUAL_VERIFICATION_REQUEST', label: 'Payment Requests' },
              { id: 'FAILED_WEBHOOK', label: 'Webhook' },
              { id: 'SYSTEM_WARNING', label: 'Warnings' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  typeFilter === tab.id
                    ? 'bg-[#FF5500] text-white'
                    : isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-black/60 border border-white/10 text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-zinc-400 shrink-0">Severity:</span>
            {['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev as any)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-amber-500 text-black'
                    : isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-black/60 border border-white/10 text-zinc-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`p-12 rounded-3xl border text-center space-y-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-zinc-950/50 border-white/5 text-zinc-400'
          }`}>
            <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
            <h4 className="font-bold text-sm text-white">All Clear — No Notifications Found</h4>
            <p className="text-xs max-w-sm mx-auto">
              There are no alerts matching your criteria. New payment review submissions and system warnings will appear here in real-time.
            </p>
          </div>
        ) : (
          filtered.map(notif => {
            const isUnread = !notif.readAt;
            const isPaymentRequest = notif.type === 'MANUAL_VERIFICATION_REQUEST';

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden ${
                  isUnread
                    ? isLight
                      ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                      : 'bg-zinc-900/90 border-[#FF5500]/40 shadow-lg shadow-[#FF5500]/5'
                    : isLight
                    ? 'bg-white border-slate-200 opacity-80'
                    : 'bg-zinc-950/60 border-white/5 opacity-80'
                }`}
              >
                {/* Visual Unread Accent Indicator */}
                {isUnread && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#FF5500]" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 pl-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(notif.severity)}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-bold">
                        {notif.type}
                      </span>
                      {notif.relatedOrderId && (
                        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {notif.relatedOrderId}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(notif.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      {isUnread && (
                        <span className="inline-block w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
                      )}
                    </div>

                    <h4 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {notif.title}
                    </h4>

                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      {notif.message}
                    </p>

                    {/* Metadata summary badge line */}
                    {(notif.customerName || notif.utrReference || notif.customerPhone) && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                        {notif.customerName && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <User size={12} className="text-[#FF5500]" />
                            <strong>{notif.customerName}</strong>
                          </span>
                        )}
                        {notif.customerPhone && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Phone size={12} className="text-emerald-400" />
                            <span>{notif.customerPhone}</span>
                          </span>
                        )}
                        {notif.utrReference && (
                          <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 text-amber-300">
                            <Tag size={12} className="text-amber-400" />
                            <span>UTR: <strong className="tracking-widest">{notif.utrReference}</strong></span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {/* Quick Approve Button for Manual Verification Requests */}
                    {isPaymentRequest && notif.relatedOrderId && !notif.resolvedAt && (
                      <button
                        type="button"
                        disabled={actionLoadingId === notif.id}
                        onClick={() => handleQuickApprove(notif.relatedOrderId!, notif.id)}
                        className="py-1.5 px-3 rounded-xl font-mono text-xs font-black uppercase bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck size={14} />
                        <span>{actionLoadingId === notif.id ? 'Approving...' : 'Approve Order'}</span>
                      </button>
                    )}

                    {notif.relatedOrderId && onOpenOrderReview && (
                      <button
                        type="button"
                        onClick={() => onOpenOrderReview(notif.relatedOrderId!)}
                        className={`py-1.5 px-3 rounded-xl font-mono text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                        }`}
                      >
                        <ExternalLink size={13} />
                        <span>Review Full Order</span>
                      </button>
                    )}

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1 cursor-pointer transition-colors"
                      >
                        Dismiss / Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
