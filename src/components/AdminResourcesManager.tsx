import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  Search,
  ExternalLink,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Lock,
  Save,
  X,
  RefreshCw,
  Plus,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Filter
} from 'lucide-react';
import { MegaPackResource, ResourceAvailabilityStatus, ResourceAuditEntry } from '../types';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';

interface AdminResourcesManagerProps {
  currentTheme?: 'light' | 'normal' | 'dark' | 'mono';
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminResourcesManager: React.FC<AdminResourcesManagerProps> = ({
  currentTheme = 'dark',
  triggerToast,
}) => {
  const [resources, setResources] = useState<MegaPackResource[]>([]);
  const [masterVaultUrl, setMasterVaultUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Master URL editing state
  const [editingMasterUrl, setEditingMasterUrl] = useState<string>('');
  const [isSavingMasterUrl, setIsSavingMasterUrl] = useState<boolean>(false);
  const [masterUrlFeedback, setMasterUrlFeedback] = useState<string | null>(null);

  // Edit Resource Modal state
  const [activeEditResource, setActiveEditResource] = useState<MegaPackResource | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    destinationUrl: string;
    category: MegaPackResource['category'];
    categoryLabel: string;
    categoryColor: string;
    resourceType: MegaPackResource['resourceType'];
    badge: string;
    countBadge: string;
    isActive: boolean;
    sortOrder: number;
    availabilityStatus: ResourceAvailabilityStatus;
    notes: string;
  }>({
    title: '',
    description: '',
    destinationUrl: '',
    category: 'core',
    categoryLabel: 'Core Collection',
    categoryColor: '',
    resourceType: 'drive_folder',
    badge: '',
    countBadge: '',
    isActive: true,
    sortOrder: 1,
    availabilityStatus: 'verified',
    notes: '',
  });
  const [isSavingResource, setIsSavingResource] = useState<boolean>(false);
  const [isValidatingLink, setIsValidatingLink] = useState<boolean>(false);
  const [linkValidationMsg, setLinkValidationMsg] = useState<string | null>(null);

  const isLight = currentTheme === 'light';

  // Fetch admin resources and store config
  const fetchAdminResources = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const [resReq, configReq] = await Promise.all([
        fetch('/api/reels/admin/resources'),
        fetch('/api/reels/admin/config'),
      ]);

      const resData = await resReq.json();
      const configData = await configReq.json();

      if (resData.success && Array.isArray(resData.resources)) {
        setResources(resData.resources);
      }
      if (configData.success && configData.config) {
        setMasterVaultUrl(configData.config.masterDriveLink || '');
        setEditingMasterUrl(configData.config.masterDriveLink || '');
      }
    } catch (err) {
      console.warn('[Admin Resource Manager] Failed to load resources:', err);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminResources();

    // Setup SSE listener for real-time synchronization
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/reels/events?isAdmin=true');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.eventType === 'RESOURCE_UPDATED' && payload.resource) {
            setResources(prev =>
              prev.map(r => (r.id === payload.resource.id ? payload.resource : r))
            );
          } else if (payload.eventType === 'CONFIG_UPDATED' && payload.config) {
            if (payload.config.masterDriveLink) {
              setMasterVaultUrl(payload.config.masterDriveLink);
              setEditingMasterUrl(payload.config.masterDriveLink);
            }
          }
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Update Master Vault URL
  const handleSaveMasterVaultUrl = async () => {
    const trimmed = editingMasterUrl.trim();
    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
      setMasterUrlFeedback('Error: URL must start with https://');
      return;
    }

    setIsSavingMasterUrl(true);
    setMasterUrlFeedback(null);

    try {
      const res = await fetch('/api/reels/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterDriveLink: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setMasterVaultUrl(trimmed);
        setMasterUrlFeedback('Master Vault URL updated successfully. All customer tabs updated live.');
        if (triggerToast) triggerToast('Master Vault URL updated live across store!', 'success');
      } else {
        setMasterUrlFeedback(`Failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setMasterUrlFeedback('Network error updating Master Vault URL.');
    } finally {
      setIsSavingMasterUrl(false);
      setTimeout(() => setMasterUrlFeedback(null), 4000);
    }
  };

  // Open Edit Modal
  const openEditModal = (resource: MegaPackResource) => {
    setActiveEditResource(resource);
    setEditForm({
      title: resource.title || '',
      description: resource.description || '',
      destinationUrl: resource.destinationUrl || '',
      category: resource.category || 'core',
      categoryLabel: resource.categoryLabel || 'Core Collection',
      categoryColor: resource.categoryColor || '',
      resourceType: resource.resourceType || 'drive_folder',
      badge: resource.badge || '',
      countBadge: resource.countBadge || '',
      isActive: resource.isActive !== false,
      sortOrder: resource.sortOrder || 1,
      availabilityStatus: resource.availabilityStatus || 'verified',
      notes: resource.notes || '',
    });
    setLinkValidationMsg(null);
  };

  // Test / Validate Link
  const handleValidateLink = async () => {
    const url = editForm.destinationUrl.trim();
    if (!url) {
      setLinkValidationMsg('Please enter a destination URL to validate.');
      return;
    }

    setIsValidatingLink(true);
    setLinkValidationMsg(null);

    try {
      const res = await fetch('/api/reels/admin/resources/validate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          resourceId: activeEditResource?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditForm(prev => ({ ...prev, availabilityStatus: data.status }));
        setLinkValidationMsg(
          `Result: ${data.status.toUpperCase()} (${data.message})${data.statusCode ? ` [HTTP ${data.statusCode}]` : ''}`
        );
      } else {
        setLinkValidationMsg(`Validation failed: ${data.error}`);
      }
    } catch (err) {
      setLinkValidationMsg('Network check error. Manual verification recommended.');
    } finally {
      setIsValidatingLink(false);
    }
  };

  // Save Resource Edits
  const handleSaveResource = async () => {
    if (!activeEditResource) return;
    setIsSavingResource(true);

    try {
      const res = await fetch(`/api/reels/admin/resources/${activeEditResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          adminId: 'Murari Panjiyar (Admin)',
        }),
      });
      const data = await res.json();

      if (data.success && data.resource) {
        setResources(prev =>
          prev.map(r => (r.id === activeEditResource.id ? data.resource : r))
        );
        if (triggerToast) triggerToast(`Saved: ${data.resource.title}`, 'success');
        setActiveEditResource(null);
      } else {
        alert(`Failed to save: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error saving resource.');
    } finally {
      setIsSavingResource(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = resources.length;
    const verified = resources.filter(r => r.availabilityStatus === 'verified').length;
    const authReq = resources.filter(r => r.availabilityStatus === 'auth_required').length;
    const attention = resources.filter(
      r => r.availabilityStatus === 'not_found' || r.availabilityStatus === 'permission_denied' || r.availabilityStatus === 'invalid_url'
    ).length;
    const active = resources.filter(r => r.isActive !== false).length;
    return { total, verified, authReq, attention, active };
  }, [resources]);

  // Filtered list
  const filteredList = useMemo(() => {
    return resources.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter === 'needs_attention') {
        const isProblem =
          item.availabilityStatus === 'not_found' ||
          item.availabilityStatus === 'permission_denied' ||
          item.availabilityStatus === 'invalid_url' ||
          item.availabilityStatus === 'admin_review';
        if (!isProblem) return false;
      } else if (statusFilter !== 'all' && item.availabilityStatus !== statusFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.destinationUrl.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [resources, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Sparkles size={14} />
            <span>AUTHORITATIVE MEGA PACK REPOSITORIES</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Resource Registry &amp; Destination Manager
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl">
            Live management of all 53 PDF-derived video packs, Google Drive destinations, and access verification statuses. Edits broadcast live via SSE.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAdminResources()}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Live Registry</span>
        </button>
      </div>

      {/* 1. MASTER GOOGLE DRIVE VAULT CONFIGURATION */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
              <Folder size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Master Google Drive Vault URL
              </h4>
              <p className="text-[11px] text-zinc-400">
                The centralized URL launched by customer buttons and used as the master resource vault.
              </p>
            </div>
          </div>

          <a
            href={masterVaultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-teal-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Test Vault</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="url"
            value={editingMasterUrl}
            onChange={e => setEditingMasterUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/... or /drive/folders/..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-black border border-white/15 focus:border-teal-500 text-xs font-mono text-white outline-none"
          />
          <button
            type="button"
            onClick={handleSaveMasterVaultUrl}
            disabled={isSavingMasterUrl || editingMasterUrl === masterVaultUrl}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              editingMasterUrl !== masterVaultUrl
                ? 'bg-teal-500 hover:bg-teal-400 text-black shadow-md'
                : 'bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            {isSavingMasterUrl ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Update Master Vault URL</span>
          </button>
        </div>

        {masterUrlFeedback && (
          <div className="text-xs font-mono p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-300">
            {masterUrlFeedback}
          </div>
        )}
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-left">
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Items</span>
          <span className="text-xl font-black text-white">{stats.total}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Verified</span>
          <span className="text-xl font-black text-emerald-400">{stats.verified}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10">
          <span className="text-[10px] text-indigo-400 uppercase tracking-wider block">Google Login</span>
          <span className="text-xl font-black text-indigo-400">{stats.authReq}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Needs Review</span>
          <span className="text-xl font-black text-amber-400">{stats.attention}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-teal-400 uppercase tracking-wider block">Active Online</span>
          <span className="text-xl font-black text-teal-300">{stats.active}</span>
        </div>
      </div>

      {/* 3. FILTERS AND SEARCH */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search resource title, destination URL, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-white/15 focus:border-teal-500 text-xs font-mono text-white outline-none"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-white/15 text-xs font-mono text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="quick_access">Quick Access</option>
            <option value="core">Core &amp; Premium</option>
            <option value="creative">Creative &amp; Lifestyle</option>
            <option value="trending">Tools &amp; Trending</option>
            <option value="ai_gadgets">AI &amp; Gadgets</option>
            <option value="bonuses">Bonuses &amp; Tools</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-white/15 text-xs font-mono text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="needs_attention">⚠️ Needs Review</option>
            <option value="verified">Verified</option>
            <option value="auth_required">Google Login</option>
            <option value="inconclusive">Inconclusive</option>
          </select>
        </div>
      </div>

      {/* 4. RESOURCE TABLE LIST */}
      <div className="rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[10.5px] uppercase text-zinc-400 tracking-wider">
                <th className="py-3.5 px-4"># Order</th>
                <th className="py-3.5 px-4">Resource Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Destination Destination URL</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList.map(res => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-400">
                    #{res.sortOrder}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white max-w-[200px] truncate" title={res.title}>
                      {res.title}
                    </div>
                    {res.badge && (
                      <span className="text-[10px] text-zinc-400 block">
                        {res.badge} {res.countBadge ? `• ${res.countBadge}` : ''}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/10 bg-white/5 text-zinc-300">
                      {res.categoryLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={res.destinationUrl || masterVaultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline max-w-[240px] truncate block text-[11px]"
                      title={res.destinationUrl || masterVaultUrl}
                    >
                      {res.destinationUrl || '(Uses Master Vault Link)'}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                        res.availabilityStatus === 'verified'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : res.availabilityStatus === 'auth_required'
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {res.availabilityStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(res)}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-bold text-[11px] uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. EDIT RESOURCE MODAL */}
      {activeEditResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-teal-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-mono">
                    Edit Resource #{activeEditResource.sortOrder}: {activeEditResource.title}
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-400">ID: {activeEditResource.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveEditResource(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Edit Form */}
            <div className="space-y-4 text-left font-mono text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold uppercase">Resource Title:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 focus:border-teal-500 text-white outline-none"
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 block font-bold uppercase">Destination URL:</label>
                  <button
                    type="button"
                    onClick={handleValidateLink}
                    disabled={isValidatingLink}
                    className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isValidatingLink ? <RefreshCw size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                    <span>Test &amp; Validate URL</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={editForm.destinationUrl}
                  onChange={e => setEditForm({ ...editForm, destinationUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 focus:border-teal-500 text-white outline-none"
                />
                {linkValidationMsg && (
                  <p className="text-[11px] text-teal-300 bg-teal-950/40 p-2 rounded-lg border border-teal-500/20">
                    {linkValidationMsg}
                  </p>
                )}
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold uppercase">Category:</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-white outline-none"
                  >
                    <option value="quick_access">Quick Access</option>
                    <option value="core">Core &amp; Premium</option>
                    <option value="creative">Creative &amp; Lifestyle</option>
                    <option value="trending">Tools &amp; Trending</option>
                    <option value="ai_gadgets">AI &amp; Gadgets</option>
                    <option value="bonuses">Bonuses &amp; Tools</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold uppercase">Availability Status:</label>
                  <select
                    value={editForm.availabilityStatus}
                    onChange={e => setEditForm({ ...editForm, availabilityStatus: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-white outline-none"
                  >
                    <option value="verified">Verified (Active)</option>
                    <option value="auth_required">Requires Google Login</option>
                    <option value="permission_denied">Permission Check Needed</option>
                    <option value="not_found">Not Found (404)</option>
                    <option value="inconclusive">Inconclusive</option>
                    <option value="admin_review">Under Review</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold uppercase">Description:</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 focus:border-teal-500 text-white outline-none"
                />
              </div>

              {/* Active Toggle & Sort Order */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-500"
                  />
                  <span className="text-white font-bold">Active in Customer Directory</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Sort Order:</span>
                  <input
                    type="number"
                    value={editForm.sortOrder}
                    onChange={e => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-white text-center"
                  />
                </div>
              </div>

              {/* Audit History */}
              {activeEditResource.auditHistory && activeEditResource.auditHistory.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Audit History:</span>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {activeEditResource.auditHistory.map((item, idx) => (
                      <div key={idx} className="text-[10px] text-zinc-400 bg-white/5 p-1.5 rounded">
                        <span>{new Date(item.timestamp).toLocaleString()}: </span>
                        <strong>{item.adminId}</strong> - {item.details}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveEditResource(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveResource}
                disabled={isSavingResource}
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                {isSavingResource ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Resource Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
