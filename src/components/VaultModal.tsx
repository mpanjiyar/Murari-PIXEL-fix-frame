/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';
import {
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Upload,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Folder,
  FolderPlus,
  Clock,
  HardDrive,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  ChevronRight,
  Shield,
  ShieldCheck,
  Link as LinkIcon,
  Sparkles,
  Maximize2,
  Minimize2,
  File,
  Layers,
  ArrowRight,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VaultItem, VaultLink } from '../types';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: 'dark' | 'light' | 'mono';
  isMasterAdmin?: boolean;
}

export const VaultTriggerButton: React.FC<{
  onClick: () => void;
  className?: string;
  theme?: 'dark' | 'light' | 'mono';
}> = ({ onClick, className = '', theme = 'dark' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Open Secure Text & File Vault"
      aria-label="Open Secure Vault"
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm select-none ${
        theme === 'light'
          ? 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-[#FF5500] border border-slate-300/80 shadow-slate-200/50'
          : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-[#FF5500]/50 shadow-black/40'
      } ${className}`}
    >
      <span className="relative flex items-center justify-center">
        <Lock size={11} className="text-[#FF5500] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
        <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-[#FF5500] rounded-full animate-ping opacity-75" />
      </span>
      <span className="group-hover:text-[#FF5500] transition-colors">Vault</span>
    </button>
  );
};

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'dark',
  isMasterAdmin = false
}) => {
  // Authentication state
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('pf_vault_token') || null;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Vault data state
  const [items, setItems] = useState<VaultItem[]>([]);
  const [folders, setFolders] = useState<string[]>(['All']);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Text editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [editorName, setEditorName] = useState('');
  const [editorDescription, setEditorDescription] = useState('');
  const [editorFolder, setEditorFolder] = useState('PC Repair');
  const [editorContent, setEditorContent] = useState('');
  const [editorLinks, setEditorLinks] = useState<VaultLink[]>([]);
  const [isEditorPreview, setIsEditorPreview] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);

  // Link Insertion Dialog inside editor
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkTitleInput, setLinkTitleInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [linkValidating, setLinkValidating] = useState(false);
  const [linkValidationInfo, setLinkValidationInfo] = useState<{ valid: boolean; type?: string; message?: string } | null>(null);

  // 5-Step File Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadBase64, setUploadBase64] = useState<string>('');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadCustomName, setUploadCustomName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFolder, setUploadFolder] = useState('Documents');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingUpload, setIsSavingUpload] = useState(false);

  // File Preview / Reader Modal
  const [previewItem, setPreviewItem] = useState<VaultItem | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Move / Rename Quick Dialog
  const [moveItem, setMoveItem] = useState<VaultItem | null>(null);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);

  // Delete Confirmation Modal
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Verify stored token on open
  useEffect(() => {
    if (!isOpen) return;
    if (token) {
      verifyToken(token);
    }
  }, [isOpen, token]);

  const verifyToken = async (activeToken: string) => {
    try {
      const res = await fetch('/api/vault/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken })
      });
      const data = await res.json();
      if (!data.valid) {
        handleLogout();
      } else {
        loadVaultItems(activeToken);
        initRealtimeSync(activeToken);
      }
    } catch {
      // offline or network hiccup, retain state
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/vault/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Authentication rejected. Please verify password.');
        return;
      }

      setToken(data.token);
      sessionStorage.setItem('pf_vault_token', data.token);
      setPasswordInput('');
      triggerToast('Vault security decrypted! Access granted.', 'success');
      loadVaultItems(data.token);
      initRealtimeSync(data.token);
    } catch (err: any) {
      setAuthError('Connection error contacting Vault security engine.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/vault/auth/lock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      } catch {
        // ignore logout errors
      }
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setToken(null);
    sessionStorage.removeItem('pf_vault_token');
    setItems([]);
    setPreviewItem(null);
    setIsEditorOpen(false);
    setIsUploadModalOpen(false);
    triggerToast('Vault securely locked.', 'info');
  };

  const loadVaultItems = async (activeToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vault/items', {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items || []);
        if (data.folders) {
          setFolders(data.folders);
        }
        setTotalSize(data.totalSize || 0);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      triggerToast('Error loading Vault storage entries.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-Time Server-Sent Events (SSE) Sync
  const initRealtimeSync = (activeToken: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource(`/api/vault/stream?token=${encodeURIComponent(activeToken)}`);
    eventSourceRef.current = es;

    es.addEventListener('ITEMS_UPDATED', () => {
      loadVaultItems(activeToken);
    });

    es.onerror = () => {
      // Reconnect handled automatically by browser EventSource
    };
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Format bytes helper
  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date helper
  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Filtered and Searched items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Folder filter
      if (selectedFolder !== 'All' && item.folder !== selectedFolder) {
        return false;
      }

      // File type filter
      if (fileTypeFilter !== 'all') {
        if (fileTypeFilter === 'text' && item.itemType !== 'text') return false;
        if (fileTypeFilter === 'image' && !['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(item.fileType.toLowerCase())) return false;
        if (fileTypeFilter === 'document' && !['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(item.fileType.toLowerCase())) return false;
        if (fileTypeFilter === 'spreadsheet' && !['xls', 'xlsx', 'csv'].includes(item.fileType.toLowerCase())) return false;
        if (fileTypeFilter === 'archive' && !['zip', 'rar', '7z', 'tar', 'gz'].includes(item.fileType.toLowerCase())) return false;
      }

      // Search query (matches file name, description, content, and links)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesContent = item.content?.toLowerCase().includes(query);
        const matchesFolder = item.folder?.toLowerCase().includes(query);
        const matchesType = item.fileType?.toLowerCase().includes(query);
        const matchesLinks = item.links?.some(l => l.title.toLowerCase().includes(query) || l.url.toLowerCase().includes(query));

        return matchesName || matchesDesc || matchesContent || matchesFolder || matchesType || matchesLinks;
      }

      return true;
    });
  }, [items, selectedFolder, fileTypeFilter, searchQuery]);

  // Recent items (top 4 latest updated)
  const recentItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);
  }, [items]);

  // Get Contextual Icon for File
  const getFileIcon = (item: VaultItem) => {
    if (item.itemType === 'text') {
      return <FileText size={18} className="text-orange-400 shrink-0" />;
    }
    const ext = item.fileType.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
      return <ImageIcon size={18} className="text-emerald-400 shrink-0" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText size={18} className="text-rose-400 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet size={18} className="text-green-400 shrink-0" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive size={18} className="text-amber-400 shrink-0" />;
    }
    if (['js', 'ts', 'py', 'json', 'html', 'css', 'sh', 'bat'].includes(ext)) {
      return <FileCode size={18} className="text-cyan-400 shrink-0" />;
    }
    return <File size={18} className="text-indigo-400 shrink-0" />;
  };

  // Handle Download File or Text
  const handleDownload = (item: VaultItem) => {
    if (!token) return;
    const downloadUrl = `/api/vault/files/${encodeURIComponent(item.id)}/download?token=${encodeURIComponent(token)}`;
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.target = '_blank';
    anchor.download = item.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // Open Text Editor for new or existing item
  const openTextEditor = (item?: VaultItem) => {
    if (item) {
      setEditingItem(item);
      setEditorName(item.name);
      setEditorDescription(item.description || '');
      setEditorFolder(item.folder || 'PC Repair');
      setEditorContent(item.content || '');
      setEditorLinks(item.links || []);
    } else {
      setEditingItem(null);
      setEditorName('');
      setEditorDescription('');
      setEditorFolder(selectedFolder !== 'All' ? selectedFolder : 'PC Repair');
      setEditorContent('');
      setEditorLinks([]);
    }
    setIsEditorPreview(false);
    setIsEditorOpen(true);
  };

  // Save Text File
  const handleSaveTextFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!editorName.trim()) {
      triggerToast('Please provide a file name.', 'error');
      return;
    }

    setIsSavingText(true);
    try {
      const payload = {
        name: editorName.trim(),
        description: editorDescription.trim(),
        folder: editorFolder.trim() || 'General',
        content: editorContent,
        links: editorLinks
      };

      let res;
      if (editingItem) {
        res = await fetch(`/api/vault/items/${encodeURIComponent(editingItem.id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/vault/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(editingItem ? 'Document updated successfully.' : 'New document saved to Vault.', 'success');
        setIsEditorOpen(false);
        loadVaultItems(token);
      } else {
        triggerToast(data.error || 'Failed to save document.', 'error');
      }
    } catch {
      triggerToast('Network error while saving document.', 'error');
    } finally {
      setIsSavingText(false);
    }
  };

  // Link Insertion Dialog inside editor
  const handleValidateAndAddLink = async () => {
    if (!linkUrlInput.trim()) {
      setLinkValidationInfo({ valid: false, message: 'URL cannot be empty.' });
      return;
    }

    setLinkValidating(true);
    try {
      const res = await fetch('/api/vault/validate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: linkUrlInput.trim() })
      });
      const data = await res.json();

      if (data.valid) {
        const newLink: VaultLink = {
          title: linkTitleInput.trim() || data.hostname || 'Connected Resource',
          url: linkUrlInput.trim(),
          valid: true,
          type: data.type || (data.isDrive ? 'Google Drive' : 'Direct Link')
        };
        setEditorLinks(prev => [...prev, newLink]);

        // Also append link markdown to text content
        const markdownLink = `\n[${newLink.title}](${newLink.url})\n`;
        setEditorContent(prev => prev + markdownLink);

        setLinkTitleInput('');
        setLinkUrlInput('');
        setLinkValidationInfo(null);
        setIsLinkDialogOpen(false);
        triggerToast('Link verified & inserted into document.', 'success');
      } else {
        setLinkValidationInfo({
          valid: false,
          message: data.error || 'Invalid URL structure. Ensure it begins with https://'
        });
      }
    } catch {
      setLinkValidationInfo({ valid: false, message: 'Failed to contact validation service.' });
    } finally {
      setLinkValidating(false);
    }
  };

  // Delete Vault Item
  const handleDeleteItem = async () => {
    if (!itemToDelete || !token) return;
    try {
      const res = await fetch(`/api/vault/items/${encodeURIComponent(itemToDelete.id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`"${itemToDelete.name}" deleted from Vault.`, 'success');
        setItemToDelete(null);
        if (previewItem?.id === itemToDelete.id) {
          setPreviewItem(null);
        }
        loadVaultItems(token);
      } else {
        triggerToast(data.error || 'Failed to delete item.', 'error');
      }
    } catch {
      triggerToast('Network error deleting item.', 'error');
    }
  };

  // 5-Step File Upload Handlers
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setUploadError('File size exceeds the 30MB Vault limit.');
      return;
    }

    setSelectedUploadFile(file);
    setUploadCustomName(file.name);
    setUploadError(null);
    setUploadStep(1);
    setUploadProgress(0);

    // Simulate Step 1 Upload Progress with real FileReader
    let currentPct = 10;
    const interval = setInterval(() => {
      currentPct += 15;
      if (currentPct >= 95) {
        clearInterval(interval);
      } else {
        setUploadProgress(currentPct);
      }
    }, 60);

    const reader = new FileReader();
    reader.onload = (e) => {
      clearInterval(interval);
      setUploadProgress(100);
      const result = e.target?.result as string;
      if (result) {
        const base64 = result.split(',')[1] || '';
        setUploadBase64(base64);

        if (file.type.startsWith('image/')) {
          setUploadPreviewUrl(result);
        } else {
          setUploadPreviewUrl(null);
        }

        setTimeout(() => {
          setUploadStep(2); // Move to Preview & Name Step
        }, 300);
      }
    };
    reader.onerror = () => {
      clearInterval(interval);
      setUploadError('Failed to read file from local disk.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = async () => {
    if (!token || !selectedUploadFile || !uploadBase64) return;
    if (!uploadCustomName.trim()) {
      setUploadError('File name cannot be empty.');
      return;
    }

    setIsSavingUpload(true);
    setUploadStep(4); // Saving State
    setUploadError(null);

    try {
      const ext = selectedUploadFile.name.split('.').pop() || 'bin';
      const res = await fetch('/api/vault/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: uploadCustomName.trim(),
          description: uploadDescription.trim(),
          folder: uploadFolder.trim() || 'Documents',
          fileType: ext,
          mimeType: selectedUploadFile.type || 'application/octet-stream',
          base64Data: uploadBase64
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStep(5); // Success Confirmation Step
        loadVaultItems(token);
      } else {
        setUploadError(data.error || 'Failed to upload file to Vault.');
        setUploadStep(3);
      }
    } catch {
      setUploadError('Network error uploading file to Vault.');
      setUploadStep(3);
    } finally {
      setIsSavingUpload(false);
    }
  };

  const resetUploadModal = () => {
    setSelectedUploadFile(null);
    setUploadBase64('');
    setUploadPreviewUrl(null);
    setUploadCustomName('');
    setUploadDescription('');
    setUploadProgress(0);
    setUploadStep(1);
    setUploadError(null);
    setIsUploadModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      {/* Toast Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl border text-xs font-mono font-bold shadow-2xl flex items-center gap-2 max-w-md ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : statusMessage.type === 'error'
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                  : 'bg-zinc-900/90 text-zinc-200 border-zinc-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
            ) : (
              <Sparkles size={16} className="text-[#FF5500] shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`relative w-full max-w-5xl h-[92vh] max-h-[820px] rounded-2xl md:rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
          currentTheme === 'light'
            ? 'bg-white/95 text-slate-900 border-slate-200 shadow-slate-900/20'
            : 'bg-zinc-950/95 text-zinc-100 border-white/10 shadow-black/80'
        } backdrop-blur-xl`}
      >
        {/* Top Title Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] shadow-sm">
              <Lock size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#FF5500] font-mono">
                  Pixel Fix
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 font-mono">
                  v2.6 Secure
                </span>
              </div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Secure Text &amp; File Vault</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                title="Lock Vault & Terminate Session"
              >
                <Lock size={12} />
                <span className="hidden sm:inline">Lock Vault</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
              aria-label="Close Vault Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* BODY AREA */}
        {!token ? (
          /* ========================================================= */
          /* 1. PASSWORD SCREEN                                        */
          /* ========================================================= */
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 shadow-2xl text-center space-y-6">
              {/* Security Shield Animation */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-dashed border-[#FF5500]/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5500]/20 to-orange-500/10 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] shadow-lg shadow-[#FF5500]/20"
                >
                  <ShieldCheck size={32} />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  Protected Document Vault
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Access requires encrypted master authentication. All files, diagnostic notes, and Google Drive links are shielded behind server-side scrypt hashing.
                </p>
              </div>

              {/* Error Notice */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-left flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Password Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Vault Access Passcode
                  </label>
                  <div className="relative">
                    <LagFreeInput
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter security passcode..."
                      autoFocus
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#FF5500] transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-[#FF5500] hover:bg-[#FF4400] disabled:opacity-50 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#FF5500]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Decrypting Security...</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={14} />
                      <span>Unlock Vault</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>AES-256 Server Scrypt</span>
                <span className="text-zinc-400">Master Passcode Protected</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* 2. VAULT DASHBOARD                                        */
          /* ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="p-3 sm:p-4 border-b border-white/10 bg-zinc-900/40 shrink-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <LagFreeInput
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by file name, content, or type..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openTextEditor()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#FF5500] hover:bg-[#FF4400] text-white shadow-md shadow-[#FF5500]/20 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>+ New Text File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetUploadModal();
                      setIsUploadModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-white/10 transition-all cursor-pointer"
                  >
                    <Upload size={14} className="text-[#FF5500]" />
                    <span>Upload File</span>
                  </button>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center rounded-xl bg-black/30 border border-white/10 p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        viewMode === 'grid' ? 'bg-[#FF5500] text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      <Layers size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        viewMode === 'list' ? 'bg-[#FF5500] text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="List View"
                    >
                      <FileText size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Folders & File Type Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                {/* Folders */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1 flex items-center gap-1">
                    <Folder size={11} /> Folders:
                  </span>
                  {folders.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFolder(f)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedFolder === f
                          ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      {f}
                    </button>
                  ))}

                  {/* Quick Add Folder */}
                  {showAddFolderInput ? (
                    <div className="flex items-center gap-1">
                      <LagFreeInput
                        type="text"
                        placeholder="Folder name"
                        value={newFolderNameInput}
                        onChange={(e) => setNewFolderNameInput(e.target.value)}
                        className="px-2 py-0.5 text-[11px] rounded bg-black/60 border border-white/20 text-white outline-none w-24"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFolderNameInput.trim()) {
                            const trimmed = newFolderNameInput.trim();
                            if (!folders.includes(trimmed)) {
                              setFolders(prev => [...prev, trimmed]);
                              setSelectedFolder(trimmed);
                            }
                            setNewFolderNameInput('');
                            setShowAddFolderInput(false);
                          }
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-xs px-1"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddFolderInput(false)}
                        className="text-zinc-500 hover:text-zinc-300 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddFolderInput(true)}
                      className="px-2 py-1 rounded-lg text-[10px] text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-700 hover:border-zinc-500 flex items-center gap-1 cursor-pointer"
                      title="Create Category / Folder"
                    >
                      <FolderPlus size={10} /> + Folder
                    </button>
                  )}
                </div>

                {/* File Type Filter */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="text-zinc-500">Type:</span>
                  {['all', 'text', 'document', 'spreadsheet', 'archive', 'image'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFileTypeFilter(t)}
                      className={`px-1.5 py-0.5 rounded capitalize ${
                        fileTypeFilter === t ? 'text-white font-bold bg-white/10' : 'hover:text-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable File List / Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Recent Files row (only when no search is active) */}
              {!searchQuery && recentItems.length > 0 && selectedFolder === 'All' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock size={12} className="text-[#FF5500]" /> Recent Files
                    </span>
                    <span>{recentItems.length} recent</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {recentItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setPreviewItem(item)}
                        className="p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/70 border border-white/5 hover:border-[#FF5500]/40 transition-all cursor-pointer group flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5 shrink-0 group-hover:border-[#FF5500]/30 transition-colors">
                            {getFileIcon(item)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF5500] transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {item.description || `${item.fileType.toUpperCase()} file`}
                            </p>
                            <span className="text-[9px] font-mono text-zinc-500 block mt-1">
                              {formatBytes(item.size)} • {formatDate(item.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main File Collection Header */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/5 pb-2">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive size={13} className="text-[#FF5500]" />
                  <span>{selectedFolder === 'All' ? 'All Files & Documents' : `Folder: ${selectedFolder}`}</span>
                  <span className="text-zinc-500 font-normal">({filteredItems.length})</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  Total Storage: {formatBytes(totalSize)}
                </span>
              </div>

              {/* Empty State */}
              {filteredItems.length === 0 && (
                <div className="text-center py-12 px-4 space-y-4 border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mx-auto">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-300">No documents or files found</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      {searchQuery
                        ? `No items match "${searchQuery}". Try a different keyword or filter.`
                        : 'Your secure vault is ready. Create a text note with links or upload files directly.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => openTextEditor()}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#FF5500] text-white hover:bg-[#FF4400] transition-colors"
                    >
                      + New Text File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetUploadModal();
                        setIsUploadModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              )}

              {/* GRID VIEW */}
              {viewMode === 'grid' && filteredItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/5 hover:border-[#FF5500]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Card Top: Icon & Folder & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 shrink-0 group-hover:border-[#FF5500]/30 transition-colors">
                              {getFileIcon(item)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5 inline-block truncate max-w-[120px]">
                                {item.folder || 'General'}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">
                                {item.fileType.toUpperCase()} • {formatBytes(item.size)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.itemType === 'text' && (
                              <button
                                type="button"
                                onClick={() => openTextEditor(item)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                title="Edit Document"
                              >
                                <Edit size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDownload(item)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                              title="Download File"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* File Name & Description */}
                        <div
                          onClick={() => setPreviewItem(item)}
                          className="cursor-pointer space-y-1.5"
                        >
                          <h3 className="text-sm font-bold text-white group-hover:text-[#FF5500] transition-colors leading-snug line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description || (item.content ? item.content.slice(0, 100) : 'No description provided.')}
                          </p>
                        </div>

                        {/* Clickable Links inside text snippet preview */}
                        {item.links && item.links.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-[9px] font-mono uppercase font-bold text-zinc-500 flex items-center gap-1">
                              <LinkIcon size={10} className="text-[#FF5500]" /> Connected Links:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] text-[10px] font-mono font-bold border border-[#FF5500]/30 transition-colors"
                                  title={link.url}
                                >
                                  <ExternalLink size={10} />
                                  <span className="max-w-[140px] truncate">{link.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Dates & Quick Preview Button */}
                      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Updated: {formatDate(item.updatedAt)}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="text-[#FF5500] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>View</span> <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LIST VIEW */}
              {viewMode === 'list' && filteredItems.length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-zinc-900/30 overflow-hidden divide-y divide-white/5">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-zinc-900/60 transition-colors flex items-center justify-between gap-4 group"
                    >
                      <div
                        onClick={() => setPreviewItem(item)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 shrink-0 group-hover:border-[#FF5500]/30">
                          {getFileIcon(item)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white group-hover:text-[#FF5500] transition-colors truncate">
                              {item.name}
                            </h4>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                              {item.folder}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.description || (item.content ? item.content.slice(0, 80) : '')}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono text-zinc-400 shrink-0">
                        <span>{formatBytes(item.size)}</span>
                        <span>{formatDate(item.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.itemType === 'text' && (
                          <button
                            type="button"
                            onClick={() => openTextEditor(item)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                          title="Download"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. CREATE & EDIT TEXT FILE MODAL                          */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isEditorOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl h-[90vh] max-h-[750px] rounded-3xl bg-zinc-950 border border-white/15 flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Editor Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/60 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#FF5500]" />
                    <h3 className="text-sm font-bold text-white font-mono">
                      {editingItem ? 'Edit Vault Document' : 'Create New Vault Document'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Preview / Edit */}
                    <button
                      type="button"
                      onClick={() => setIsEditorPreview(!isEditorPreview)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        isEditorPreview ? 'bg-[#FF5500] text-white' : 'bg-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {isEditorPreview ? 'Edit Mode' : 'Formatted Preview'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Editor Form */}
                <form onSubmit={handleSaveTextFile} className="flex-1 flex flex-col overflow-hidden">
                  {/* Top Meta: Name, Folder, Description */}
                  <div className="p-4 border-b border-white/10 bg-zinc-900/30 space-y-3 shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                          Document File Name *
                        </label>
                        <LagFreeInput
                          type="text"
                          required
                          value={editorName}
                          onChange={(e) => setEditorName(e.target.value)}
                          placeholder="e.g. PC Repair Notes & Installation Steps"
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                          Folder / Category
                        </label>
                        <select
                          value={editorFolder}
                          onChange={(e) => setEditorFolder(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF5500]"
                        >
                          {folders.filter(f => f !== 'All').map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                          <option value="PC Repair">PC Repair</option>
                          <option value="Guides">Guides</option>
                          <option value="Drivers">Drivers</option>
                          <option value="Diagnostics">Diagnostics</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                        Short Description / Summary (optional)
                      </label>
                      <LagFreeInput
                        type="text"
                        value={editorDescription}
                        onChange={(e) => setEditorDescription(e.target.value)}
                        placeholder="Brief summary visible on cards..."
                        className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    {/* Basic Formatting Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditorContent(prev => prev + '**bold text**')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorContent(prev => prev + '*italic text*')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white italic"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorContent(prev => prev + '\n### Heading\n')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                          title="Heading"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorContent(prev => prev + '\n- Bullet point\n')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                          title="Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorContent(prev => prev + '\n```\n// Code or command\n```\n')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                          title="Code Block"
                        >
                          &lt;/&gt;
                        </button>
                      </div>

                      {/* Insert Link button */}
                      <button
                        type="button"
                        onClick={() => {
                          setLinkTitleInput('');
                          setLinkUrlInput('');
                          setLinkValidationInfo(null);
                          setIsLinkDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FF5500]/15 hover:bg-[#FF5500]/25 text-[#FF5500] border border-[#FF5500]/30 font-bold transition-colors cursor-pointer"
                      >
                        <LinkIcon size={12} />
                        <span>Insert Verified Link (Google Drive / HTTPS)</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Editor Textarea OR Preview Mode */}
                  <div className="flex-1 p-4 overflow-y-auto bg-black/40">
                    {!isEditorPreview ? (
                      <LagFreeTextArea
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        placeholder="Write or paste your text notes here...
Example:
### Windows Installation Steps
1. Boot from UEFI USB drive
2. Configure partition alignment
3. Download Intel RST Chipset Driver from Google Drive..."
                        className="w-full h-full min-h-[220px] bg-transparent text-white text-xs font-mono leading-relaxed placeholder-zinc-600 focus:outline-none resize-none"
                      />
                    ) : (
                      /* Formatted Preview with Clickable Links */
                      <div className="space-y-4 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {editorContent ? (
                          <div className="space-y-3">
                            {editorContent.split('\n').map((line, idx) => {
                              // Detect links in lines
                              const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                              if (linkMatch) {
                                const title = linkMatch[1];
                                const url = linkMatch[2];
                                return (
                                  <div key={idx} className="my-1.5">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5500]/15 hover:bg-[#FF5500]/25 text-[#FF5500] border border-[#FF5500]/40 font-bold transition-all shadow-sm"
                                    >
                                      <ExternalLink size={12} />
                                      <span>{title}</span>
                                      <span className="text-[9px] text-zinc-400">({url.includes('drive.google.com') ? 'Google Drive' : 'Download Link'})</span>
                                    </a>
                                  </div>
                                );
                              }
                              if (line.startsWith('### ')) {
                                return <h3 key={idx} className="text-sm font-black text-white pt-2 text-[#FF5500]">{line.replace('### ', '')}</h3>;
                              }
                              if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('- ')) {
                                return <div key={idx} className="pl-3 border-l-2 border-orange-500/50 text-zinc-300">{line}</div>;
                              }
                              return <p key={idx}>{line}</p>;
                            })}
                          </div>
                        ) : (
                          <p className="text-zinc-600 italic">No content written yet. Switch to Edit Mode to compose text.</p>
                        )}

                        {/* Verified Links Shelf in Preview */}
                        {editorLinks.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <LinkIcon size={12} className="text-[#FF5500]" />
                              <span>Attached External Resources ({editorLinks.length})</span>
                            </h4>
                            <div className="flex flex-col gap-2">
                              {editorLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#FF5500]/50 flex items-center justify-between text-xs text-white transition-all group"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <ExternalLink size={13} className="text-[#FF5500]" />
                                    <div className="min-w-0">
                                      <span className="font-bold block truncate group-hover:text-[#FF5500] transition-colors">{link.title}</span>
                                      <span className="text-[10px] text-zinc-500 truncate block">{link.url}</span>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    {link.type || 'Verified HTTPS'}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Editor Footer */}
                  <div className="p-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {editorContent.length} characters • {editorContent.split(/\s+/).filter(Boolean).length} words
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditorOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingText}
                        className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#FF5500] hover:bg-[#FF4400] disabled:opacity-50 text-white shadow-lg shadow-[#FF5500]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSavingText ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Saving Document...</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            <span>Save to Vault</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 4. INSERT VERIFIED LINK DIALOG                            */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isLinkDialogOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-[#FF5500]" />
                    <h4 className="text-sm font-bold text-white font-mono">Insert Verified External Link</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLinkDialogOpen(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-zinc-400 block font-bold">Link Title / Label</label>
                    <LagFreeInput
                      type="text"
                      value={linkTitleInput}
                      onChange={(e) => setLinkTitleInput(e.target.value)}
                      placeholder="e.g. Download Windows 11 Driver Package"
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 block font-bold">Target Resource URL (HTTPS or Google Drive) *</label>
                    <LagFreeInput
                      type="url"
                      required
                      value={linkUrlInput}
                      onChange={(e) => {
                        setLinkUrlInput(e.target.value);
                        setLinkValidationInfo(null);
                      }}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  {/* Validation Feedback */}
                  {linkValidationInfo && (
                    <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                      linkValidationInfo.valid
                        ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/30'
                        : 'bg-rose-950/60 text-rose-200 border-rose-500/30'
                    }`}>
                      {linkValidationInfo.valid ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{linkValidationInfo.message}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Supports Google Drive, OneDrive, Dropbox, direct drivers, and secure HTTPS file links. URLs are verified by server prior to saving.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLinkDialogOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateAndAddLink}
                    disabled={linkValidating}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#FF5500] hover:bg-[#FF4400] disabled:opacity-50 text-white flex items-center gap-1.5"
                  >
                    {linkValidating ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Verifying Link...</span>
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Validate &amp; Insert</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 5. 5-STEP FILE UPLOAD MODAL                               */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/15 overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Header with 5 Steps Breadcrumb */}
                <div className="px-5 py-4 border-b border-white/10 bg-zinc-900/60 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Upload size={16} className="text-[#FF5500]" />
                      <h3 className="text-sm font-bold text-white font-mono">Upload File to Vault</h3>
                    </div>
                    <button
                      type="button"
                      onClick={resetUploadModal}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* 5 Steps Indicator */}
                  <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
                    {[
                      { step: 1, label: 'Select' },
                      { step: 2, label: 'Preview' },
                      { step: 3, label: 'Metadata' },
                      { step: 4, label: 'Save' },
                      { step: 5, label: 'Done' }
                    ].map(st => (
                      <div
                        key={st.step}
                        className={`py-1 rounded font-bold transition-colors ${
                          uploadStep >= st.step
                            ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30'
                            : 'bg-white/5 text-zinc-500'
                        }`}
                      >
                        {st.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Body */}
                <div className="p-6 space-y-4">
                  {uploadError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* STEP 1: Select & Progress */}
                  {uploadStep === 1 && (
                    <div className="space-y-4">
                      {!selectedUploadFile ? (
                        <label className="border-2 border-dashed border-white/20 hover:border-[#FF5500]/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-black/20 group">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileSelect(f);
                            }}
                          />
                          <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] mb-3 group-hover:scale-105 transition-transform">
                            <Upload size={24} />
                          </div>
                          <span className="text-sm font-bold text-white block">
                            Choose a file or drag &amp; drop here
                          </span>
                          <span className="text-xs text-zinc-500 mt-1 block font-mono">
                            TXT, PDF, DOCX, XLSX, ZIP, JPG, PNG, WebP (up to 30MB)
                          </span>
                        </label>
                      ) : (
                        /* Upload Progress Screen */
                        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4 text-center">
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="font-bold text-white truncate max-w-[200px]">{selectedUploadFile.name}</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden p-0.5 border border-white/10">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-orange-600 to-[#FF5500]"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 block">
                            Reading binary stream • {formatBytes(selectedUploadFile.size)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2 & 3: Preview, Custom Name, Folder, Description */}
                  {(uploadStep === 2 || uploadStep === 3) && selectedUploadFile && (
                    <div className="space-y-4">
                      {/* Step 2: Instant Preview */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                        {uploadPreviewUrl ? (
                          <img
                            src={uploadPreviewUrl}
                            alt="Preview"
                            className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#FF5500] shrink-0">
                            <File size={28} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                            {selectedUploadFile.type || 'Binary Document'}
                          </span>
                          <span className="text-xs font-bold text-white block truncate">
                            {selectedUploadFile.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 block">
                            Size: {formatBytes(selectedUploadFile.size)}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: File Name & Meta */}
                      <div className="space-y-3 text-xs font-mono">
                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold block">File Name in Vault *</label>
                          <LagFreeInput
                            type="text"
                            required
                            value={uploadCustomName}
                            onChange={(e) => setUploadCustomName(e.target.value)}
                            placeholder="Custom file name..."
                            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#FF5500]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-zinc-400 font-bold block">Folder</label>
                            <select
                              value={uploadFolder}
                              onChange={(e) => setUploadFolder(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#FF5500]"
                            >
                              {folders.filter(f => f !== 'All').map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                              <option value="Documents">Documents</option>
                              <option value="PC Repair">PC Repair</option>
                              <option value="Drivers">Drivers</option>
                              <option value="General">General</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-zinc-400 font-bold block">File Type</label>
                            <input
                              type="text"
                              disabled
                              value={selectedUploadFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
                              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/5 text-zinc-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold block">Short Description</label>
                          <LagFreeInput
                            type="text"
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="e.g. Guwahati client motherboard driver backup..."
                            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#FF5500]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Saving Loading Indicator */}
                  {uploadStep === 4 && (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] mx-auto animate-pulse">
                        <RefreshCw size={24} className="animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Saving to Secure Storage Disk</h4>
                        <p className="text-xs text-zinc-500 font-mono">Writing encrypted file stream and indexing item...</p>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Success Confirmation */}
                  {uploadStep === 5 && (
                    <div className="py-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">File Uploaded Successfully!</h4>
                        <p className="text-xs text-zinc-400 font-mono">
                          "{uploadCustomName}" is now securely stored in your Vault.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={resetUploadModal}
                        className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#FF5500] hover:bg-[#FF4400] text-white shadow-lg shadow-[#FF5500]/25 transition-all"
                      >
                        Return to Vault Dashboard
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Footer Actions */}
                {uploadStep >= 2 && uploadStep <= 3 && (
                  <div className="p-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between shrink-0">
                    <button
                      type="button"
                      onClick={() => setUploadStep(1)}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveUpload}
                      disabled={isSavingUpload}
                      className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#FF5500] hover:bg-[#FF4400] text-white shadow-lg shadow-[#FF5500]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Save File to Vault</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 6. FILE PREVIEW & READER MODAL                            */}
        {/* ========================================================= */}
        <AnimatePresence>
          {previewItem && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-zinc-950 border border-white/15 flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/60 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                      {getFileIcon(previewItem)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{previewItem.name}</h3>
                      <span className="text-[10px] font-mono text-zinc-400 block">
                        Folder: {previewItem.folder} • {formatBytes(previewItem.size)} • Updated: {formatDate(previewItem.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {previewItem.itemType === 'text' && (
                      <button
                        type="button"
                        onClick={() => {
                          const item = previewItem;
                          setPreviewItem(null);
                          openTextEditor(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownload(previewItem)}
                      className="px-3 py-1.5 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-xs font-mono font-bold text-white flex items-center gap-1 shadow-md shadow-[#FF5500]/20"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewItem(null)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Description if present */}
                  {previewItem.description && (
                    <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 text-xs text-zinc-300 font-mono">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Description:</span>
                      {previewItem.description}
                    </div>
                  )}

                  {/* Text Content Rendering with Clickable Links */}
                  {previewItem.itemType === 'text' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/5 pb-2">
                        <span className="font-bold text-white">Document Text</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (previewItem.content) {
                              navigator.clipboard.writeText(previewItem.content);
                              setCopiedText(true);
                              setTimeout(() => setCopiedText(false), 2000);
                            }
                          }}
                          className="hover:text-white flex items-center gap-1 text-[11px]"
                        >
                          {copiedText ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {previewItem.content ? (
                          <div className="space-y-3">
                            {previewItem.content.split('\n').map((line, idx) => {
                              const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                              if (linkMatch) {
                                const title = linkMatch[1];
                                const url = linkMatch[2];
                                return (
                                  <div key={idx} className="my-2">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5500]/15 hover:bg-[#FF5500]/25 text-[#FF5500] border border-[#FF5500]/40 font-bold transition-all"
                                    >
                                      <ExternalLink size={12} />
                                      <span>{title}</span>
                                      <span className="text-[10px] text-zinc-400">({url.includes('drive.google.com') ? 'Google Drive Link' : 'External Resource'})</span>
                                    </a>
                                  </div>
                                );
                              }
                              if (line.startsWith('### ')) {
                                return <h3 key={idx} className="text-sm font-black text-[#FF5500] pt-2">{line.replace('### ', '')}</h3>;
                              }
                              return <p key={idx}>{line}</p>;
                            })}
                          </div>
                        ) : (
                          <p className="text-zinc-500 italic">Empty document.</p>
                        )}
                      </div>

                      {/* Clickable Links Section */}
                      {previewItem.links && previewItem.links.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold font-mono uppercase text-white tracking-wider flex items-center gap-1.5">
                            <LinkIcon size={12} className="text-[#FF5500]" />
                            <span>Linked External Resources ({previewItem.links.length})</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {previewItem.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#FF5500]/50 transition-all flex items-center justify-between text-xs text-white group"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <ExternalLink size={14} className="text-[#FF5500]" />
                                  <div className="min-w-0">
                                    <span className="font-bold block truncate group-hover:text-[#FF5500] transition-colors">{link.title}</span>
                                    <span className="text-[10px] text-zinc-500 truncate block">{link.url}</span>
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                  Open
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Preview for uploaded images */}
                  {previewItem.itemType === 'file' && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(previewItem.fileType.toLowerCase()) && token && (
                    <div className="space-y-3 text-center">
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-2 overflow-hidden max-h-[400px] flex items-center justify-center">
                        <img
                          src={`/api/vault/files/${encodeURIComponent(previewItem.id)}/preview?token=${encodeURIComponent(token)}`}
                          alt={previewItem.name}
                          className="max-h-[380px] max-w-full rounded-xl object-contain shadow-lg"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        High-Resolution Master Image • {formatBytes(previewItem.size)}
                      </span>
                    </div>
                  )}

                  {/* Binary file info card */}
                  {previewItem.itemType === 'file' && !['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(previewItem.fileType.toLowerCase()) && (
                    <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#FF5500] mx-auto">
                        <File size={32} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">{previewItem.name}</h4>
                        <p className="text-xs text-zinc-400 font-mono">
                          {previewItem.mimeType} • {formatBytes(previewItem.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(previewItem)}
                        className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#FF5500] hover:bg-[#FF4400] text-white shadow-lg shadow-[#FF5500]/25 transition-all inline-flex items-center gap-1.5"
                      >
                        <Download size={14} />
                        <span>Download to Device</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 7. DELETE CONFIRMATION DIALOG                             */}
        {/* ========================================================= */}
        <AnimatePresence>
          {itemToDelete && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-rose-500/30 shadow-2xl space-y-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                  <Trash2 size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Delete Vault Item?</h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    "{itemToDelete.name}" will be permanently erased from secure storage.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setItemToDelete(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteItem}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
                  >
                    Delete Permanently
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VaultModal;
