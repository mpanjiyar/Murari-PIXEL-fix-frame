import React, { useState, useEffect, useCallback } from 'react';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';
import {
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Upload,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Copy,
  Clock,
  Sparkles,
  Link as LinkIcon,
  X,
  Check,
  Eye,
  Activity,
  Layers,
  Mail
} from 'lucide-react';
import { VaultItem, VaultLink } from './PixelFixVault';
import { INITIAL_KNOWLEDGE_DOCS } from '../data/vaultKnowledgeBase';

interface AdminVaultManagerProps {
  adminKey: string;
  currentTheme?: 'normal' | 'mono' | 'light';
}

const VAULT_CATEGORIES = [
  'All',
  'Repair Notes',
  'Drivers & Utilities',
  'System Manuals',
  'Licenses & Invoices',
  'Credentials & Keys',
  'General'
];

export const AdminVaultManager: React.FC<AdminVaultManagerProps> = ({
  adminKey,
  currentTheme = 'normal'
}) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stats, setStats] = useState<any>(null);

  // Modals & Editors
  const [activeModal, setActiveModal] = useState<'none' | 'edit_doc' | 'create_doc' | 'upload_file' | 'change_password' | 'manage_access'>('none');
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<VaultItem | null>(null);

  // Doc form state
  const [docName, setDocName] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('Repair Notes');
  const [docContent, setDocContent] = useState('');
  const [docLinks, setDocLinks] = useState<VaultLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload file state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCat, setUploadCat] = useState('Drivers & Utilities');
  const [isUploading, setIsUploading] = useState(false);

  // Password change state
  const [newVaultPassword, setNewVaultPassword] = useState('');
  const [confirmVaultPassword, setConfirmVaultPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Recovery email state
  const [recoveryEmail, setRecoveryEmail] = useState('Mpanjiyar100@gmail.com');
  const [newRecoveryEmailInput, setNewRecoveryEmailInput] = useState('');
  const [isUpdatingRecoveryEmail, setIsUpdatingRecoveryEmail] = useState(false);

  // Headers
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey
    };
  }, [adminKey]);

  // Fetch Items & Stats
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsRes, statsRes, recRes] = await Promise.all([
        fetch('/api/vault/items', { headers: getHeaders() }).catch(() => null),
        fetch('/api/vault/stats', { headers: getHeaders() }).catch(() => null),
        fetch('/api/vault/recovery-info').catch(() => null)
      ]);

      if (itemsRes && itemsRes.ok) {
        const itemsData = await itemsRes.json();
        if (itemsData.success && Array.isArray(itemsData.items) && itemsData.items.length > 0) {
          setItems(itemsData.items);
        } else {
          setItems(INITIAL_KNOWLEDGE_DOCS as any);
        }
      } else {
        setItems(INITIAL_KNOWLEDGE_DOCS as any);
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
      }

      if (recRes && recRes.ok) {
        const recData = await recRes.json();
        if (recData.success && recData.recoveryEmail) {
          setRecoveryEmail(recData.recoveryEmail);
        }
      }
    } catch (e) {
      console.warn('[Admin Vault] Fallback to local knowledge base:', e);
      setItems(INITIAL_KNOWLEDGE_DOCS as any);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.content && item.content.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Open Create Doc
  const handleOpenCreate = () => {
    setEditingItem(null);
    setDocName('');
    setDocDescription('');
    setDocCategory('Repair Notes');
    setDocContent('');
    setDocLinks([]);
    setFeedbackMsg(null);
    setActiveModal('create_doc');
  };

  // Open Edit Doc
  const handleOpenEdit = (item: VaultItem) => {
    setEditingItem(item);
    setDocName(item.name);
    setDocDescription(item.description);
    setDocCategory(item.category || 'General');
    setDocContent(item.content || '');
    setDocLinks(item.links ? [...item.links] : []);
    setFeedbackMsg(null);
    setActiveModal('edit_doc');
  };

  // Save Doc
  const handleSaveDoc = async () => {
    if (!docName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Document name is required.' });
      return;
    }
    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/vault/document', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          id: editingItem?.id,
          name: docName.trim(),
          description: docDescription.trim(),
          category: docCategory,
          content: docContent,
          links: docLinks
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: 'Document saved successfully.' });
        setTimeout(() => {
          setActiveModal('none');
          fetchData();
        }, 1000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to save document.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Network connection issue.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Commit Upload
  const handleCommitUpload = async () => {
    if (!uploadFile || !uploadBase64) return;
    setIsUploading(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/vault/upload', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fileName: uploadName.trim() || uploadFile.name,
          description: uploadDesc.trim(),
          category: uploadCat,
          mimeType: uploadFile.type,
          base64Data: uploadBase64
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: 'File uploaded into vault.' });
        setTimeout(() => {
          setActiveModal('none');
          setUploadFile(null);
          setUploadBase64(null);
          fetchData();
        }, 1000);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to upload file.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Network error uploading file.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Download
  const handleDownload = (item: VaultItem) => {
    window.open(`/api/vault/download/${item.id}?token=${encodeURIComponent(adminKey)}`, '_blank');
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await fetch(`/api/vault/items/${deleteCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setDeleteCandidate(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newVaultPassword.length < 6) {
      setFeedbackMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newVaultPassword !== confirmVaultPassword) {
      setFeedbackMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/vault/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          newPassword: newVaultPassword,
          adminKey
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: 'Vault password successfully updated! All active tokens revoked.' });
        setTimeout(() => {
          setActiveModal('none');
          setNewVaultPassword('');
          setConfirmVaultPassword('');
          fetchData();
        }, 1500);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Network error updating password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Update recovery email
  const handleUpdateRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecoveryEmailInput.trim() || !newRecoveryEmailInput.includes('@')) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid recovery email address.' });
      return;
    }

    setIsUpdatingRecoveryEmail(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/vault/recovery-email', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newEmail: newRecoveryEmailInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecoveryEmail(newRecoveryEmailInput.trim());
        setFeedbackMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          setActiveModal('none');
        }, 1500);
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update recovery email.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Network connection issue.' });
    } finally {
      setIsUpdatingRecoveryEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-2xl bg-[#14141E] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500]">
              <Lock size={16} />
            </span>
            <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono">
              Pixel Fix Vault Master Control Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Create, Edit, Upload, Rename, Move, Download, and Delete documents. Manage the master password and authorized access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-[0_2px_15px_rgba(255,85,0,0.3)]"
          >
            <Plus size={14} />
            <span>+ Create Document</span>
          </button>

          <button
            onClick={() => {
              setUploadFile(null);
              setUploadBase64(null);
              setUploadName('');
              setUploadDesc('');
              setFeedbackMsg(null);
              setActiveModal('upload_file');
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => {
              setNewVaultPassword('');
              setConfirmVaultPassword('');
              setFeedbackMsg(null);
              setActiveModal('change_password');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound size={14} />
            <span>Reset Passcode</span>
          </button>

          <button
            onClick={() => {
              setNewRecoveryEmailInput(recoveryEmail);
              setFeedbackMsg(null);
              setActiveModal('manage_access');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Mail size={14} />
            <span>Recovery Email</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#14141E] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Total Files</span>
            <div className="text-xl font-black text-white font-mono">{stats.totalItems}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#14141E] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Storage Used</span>
            <div className="text-xl font-black text-cyan-400 font-mono">{stats.totalBytesFormatted}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#14141E] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Active Sessions</span>
            <div className="text-xl font-black text-emerald-400 font-mono">{stats.activeTokensCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#14141E] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Security State</span>
            <div className="text-xs font-bold text-white flex items-center gap-1 mt-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Scrypt Hashed</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#14141E] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <LagFreeInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault items..."
            className="w-full bg-[#181824] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {VAULT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF5500] text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#14141E]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#101018] text-slate-400 font-mono text-[10px] uppercase border-b border-white/5">
            <tr>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                  Loading vault catalog...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                  No vault items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-[#FF5500]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono uppercase text-[10px] text-slate-400">
                    {item.fileType}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{formatBytes(item.sizeBytes)}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="Edit / Rename / Move"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-emerald-400"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: CREATE / EDIT DOC */}
      {(activeModal === 'create_doc' || activeModal === 'edit_doc') && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#14141E] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                {editingItem ? 'Edit / Move Document' : 'Create Vault Document'}
              </h3>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {feedbackMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">File Name</label>
                  <LagFreeInput
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Document Title..."
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {VAULT_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">Description</label>
                <LagFreeInput
                  type="text"
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Short description..."
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">Content</label>
                <LagFreeTextArea
                  rows={8}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Document content..."
                  className="w-full bg-[#181824] border border-white/10 rounded-xl p-3 text-xs text-white font-mono leading-relaxed outline-none"
                />
              </div>

              {/* Links */}
              <div className="space-y-2 p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[11px] font-bold text-white uppercase font-mono">Attached Links</span>
                <div className="grid grid-cols-2 gap-2">
                  <LagFreeInput
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Link Label (e.g. Google Drive Repo)"
                    className="bg-[#181824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <LagFreeInput
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="bg-[#181824] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newLinkUrl) return;
                    setDocLinks([...docLinks, { title: newLinkTitle || newLinkUrl, url: newLinkUrl, status: 'valid' }]);
                    setNewLinkTitle('');
                    setNewLinkUrl('');
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 rounded text-xs text-white"
                >
                  Add Link
                </button>
                {docLinks.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-cyan-400 bg-white/5 p-1.5 rounded">
                    <span>{l.title} ({l.url})</span>
                    <button onClick={() => setDocLinks(docLinks.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-400">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDoc}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold uppercase cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD FILE */}
      {activeModal === 'upload_file' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#14141E] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">Upload File to Vault</h3>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0];
                  setUploadFile(f);
                  setUploadName(f.name);
                  const reader = new FileReader();
                  reader.onload = () => setUploadBase64(reader.result as string);
                  reader.readAsDataURL(f);
                }
              }}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FF5500] file:text-white hover:file:bg-[#FF4400]"
            />

            {uploadFile && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">File Name</label>
                  <LagFreeInput
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">Category</label>
                  <select
                    value={uploadCat}
                    onChange={(e) => setUploadCat(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {VAULT_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">Description</label>
                  <LagFreeInput
                    type="text"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitUpload}
                disabled={!uploadFile || !uploadBase64 || isUploading}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Save File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSCODE */}
      {activeModal === 'change_password' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#14141E] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">Reset Vault Passcode</h3>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">New Passcode</label>
                <LagFreeInput
                  type="password"
                  required
                  value={newVaultPassword}
                  onChange={(e) => setNewVaultPassword(e.target.value)}
                  placeholder="Min 6 characters..."
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">Confirm Passcode</label>
                <LagFreeInput
                  type="password"
                  required
                  value={confirmVaultPassword}
                  onChange={(e) => setConfirmVaultPassword(e.target.value)}
                  placeholder="Confirm..."
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Passcode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE RECOVERY EMAIL */}
      {activeModal === 'manage_access' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#14141E] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="text-[#FF5500]" size={16} />
                <h3 className="text-sm font-bold text-white uppercase font-mono">Vault Recovery Email Account</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRecoveryEmail} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400 font-mono">
                  Registered Recovery Email Address
                </label>
                <LagFreeInput
                  type="email"
                  required
                  value={newRecoveryEmailInput}
                  onChange={(e) => setNewRecoveryEmailInput(e.target.value)}
                  placeholder="e.g. Mpanjiyar100@gmail.com"
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  When a technician or administrator forgets the Vault passcode, recovery OTP codes will be verified against and dispatched to this email.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRecoveryEmail}
                  className="px-5 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingRecoveryEmail ? 'Saving...' : 'Save Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#14141E] border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
            <Trash2 size={24} className="text-rose-500 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white">Delete Item?</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">{deleteCandidate.name}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminVaultManager;
