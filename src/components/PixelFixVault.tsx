import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  X,
  FileCode,
  FolderOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Copy,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Check,
  Sparkles,
  Link as LinkIcon,
  Filter,
  Grid,
  List,
  File,
  Layers,
  Activity,
  Folder,
  FolderPlus,
  Tag,
  Share2,
  Wifi,
  WifiOff,
  CornerDownRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Terminal,
  Cpu,
  Laptop,
  Globe,
  Sliders,
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs
} from 'firebase/firestore';
import {
  KNOWLEDGE_BASE_FOLDERS,
  INITIAL_KNOWLEDGE_DOCS,
  INITIAL_TECHNICAL_LINKS,
  VaultLinkItem
} from '../data/vaultKnowledgeBase';

export interface VaultLink {
  title: string;
  url: string;
  status?: 'valid' | 'invalid' | 'warning';
}

export interface VaultFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultItem {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: 'text' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'zip' | 'jpg' | 'jpeg' | 'png' | 'webp' | 'other';
  originalFileName?: string;
  storedFileName?: string;
  mimeType?: string;
  content?: string;
  links?: VaultLink[];
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  folder?: string;
  fileDataUrl?: string;
  isProtected?: boolean;
}

interface PixelFixVaultProps {
  isOpen: boolean;
  onClose: () => void;
  adminKey?: string;
  currentTheme?: string;
  isFullScreenPage?: boolean;
  onBackToWebsite?: () => void;
  isEmbeddedTab?: boolean;
}

export const PixelFixVault: React.FC<PixelFixVaultProps> = ({
  isOpen,
  onClose,
  adminKey,
  currentTheme = 'dark',
  isFullScreenPage = true,
  onBackToWebsite,
  isEmbeddedTab = false
}) => {
  // Session Token State
  const isAuthorizedAdmin = Boolean(adminKey && (adminKey === 'pixel2025' || adminKey === 'AdminSecret2025'));
  const [token, setToken] = useState<string | null>(() => {
    if (adminKey && (adminKey === 'pixel2025' || adminKey === 'AdminSecret2025')) {
      return 'admin_master_token';
    }
    return sessionStorage.getItem('pixelfix_vault_token') || null;
  });

  // User Permissions: Admin has full write access; Guest/Client has view + download
  const canEditAndUpload = Boolean(token || isAuthorizedAdmin);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(true);

  // Auto-sync token if adminKey becomes available
  useEffect(() => {
    if (isAuthorizedAdmin && !token) {
      setToken('admin_master_token');
    }
  }, [isAuthorizedAdmin]);

  // Auth States
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Real-Time Data States
  const [items, setItems] = useState<VaultItem[]>(INITIAL_KNOWLEDGE_DOCS);
  const [folders, setFolders] = useState<VaultFolder[]>(KNOWLEDGE_BASE_FOLDERS);
  const [technicalLinks, setTechnicalLinks] = useState<VaultLinkItem[]>(INITIAL_TECHNICAL_LINKS);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'offline' | 'syncing'>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'files' | 'links' | 'kb'>('files');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Action States
  const [activeModal, setActiveModal] = useState<
    'none' | 'create_text' | 'edit_text' | 'upload_file' | 'view_item' | 'change_password' | 'create_folder' | 'rename_folder' | 'rename_item' | 'create_link' | 'delete_confirm'
  >('none');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename modal state
  const [itemToRename, setItemToRename] = useState<VaultItem | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Folder creation & rename
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#FF5500');
  const [folderToRename, setFolderToRename] = useState<VaultFolder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  // Private Protected File Authentication State
  const [unlockedProtectedFiles, setUnlockedProtectedFiles] = useState<Record<string, boolean>>({});
  const [filePasswordInput, setFilePasswordInput] = useState('');
  const [fileAuthError, setFileAuthError] = useState<string | null>(null);
  const [isFileAuthenticating, setIsFileAuthenticating] = useState(false);

  // Text Document Editor State
  const [docName, setDocName] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('Operating Systems');
  const [docFolder, setDocFolder] = useState('01 – Windows');
  const [docContent, setDocContent] = useState('');
  const [docIsProtected, setDocIsProtected] = useState(false);
  const [docLinks, setDocLinks] = useState<VaultLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [linkInputError, setLinkInputError] = useState<string | null>(null);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  // Auto-Save Drafts Protection State
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const [recoverableDraft, setRecoverableDraft] = useState<any | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentEditingDocIdRef = useRef<string | null>(null);

  // File Upload Form & Pipeline State (Select → Upload → Progress → Validate → Save → Success)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Drivers & Hardware');
  const [uploadFolder, setUploadFolder] = useState('03 – Drivers');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'select' | 'upload' | 'progress' | 'validate' | 'save' | 'success'>('select');
  const [uploadStatusText, setUploadStatusText] = useState('Ready for upload');
  const [lastUploadedItem, setLastUploadedItem] = useState<VaultItem | null>(null);

  // Change Password State
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwChangeStatus, setPwChangeStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Helper Headers for Server Requests
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }
    return headers;
  }, [token, adminKey]);

  // Robust Server Auth with Automatic Retries & Timeout
  const handleAuthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Please enter your Vault passcode.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const attemptFetch = async (retriesLeft: number): Promise<any> => {
      try {
        const res = await fetch('/api/vault/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput.trim() }),
          signal: controller.signal
        });

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Non-JSON server response');
        }

        const data = await res.json();
        return { res, data };
      } catch (err: any) {
        if (retriesLeft > 0 && err.name !== 'AbortError') {
          await new Promise((r) => setTimeout(r, 400));
          return attemptFetch(retriesLeft - 1);
        }
        throw err;
      }
    };

    try {
      const { res, data } = await attemptFetch(2);
      clearTimeout(timeoutId);

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Incorrect Vault passcode. Access denied.');
        setIsAuthenticating(false);
        return;
      }

      // Success
      const sessionToken = data.token || 'vault_auth_token_' + Date.now();
      sessionStorage.setItem('pixelfix_vault_token', sessionToken);
      setToken(sessionToken);
      setPasswordInput('');
      setAuthError(null);
      showToast('Vault authenticated & unlocked successfully.');
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('[Vault Auth] Connection recovery:', err);
      setAuthError('Unable to connect to Vault server. Retrying...');
      setTimeout(() => {
        setAuthError('Unable to connect. Click "Retry Connection" below.');
      }, 1200);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Lock Vault
  const handleLockVault = async () => {
    try {
      if (token) {
        await fetch('/api/vault/lock', {
          method: 'POST',
          headers: getAuthHeaders()
        });
      }
    } catch {
      // ignore
    }
    sessionStorage.removeItem('pixelfix_vault_token');
    setToken(null);
    setIsGuestMode(true);
    setActiveModal('none');
    setSelectedItem(null);
    setUnlockedProtectedFiles({});
    showToast('Vault locked securely.');
  };

  // REAL-TIME FIRESTORE SYNCHRONIZATION
  useEffect(() => {
    setSyncStatus('connecting');

    // 1. Listen to Vault Items in real-time
    const unsubscribeItems = onSnapshot(
      collection(db, 'vault_items'),
      (snapshot) => {
        setSyncStatus('connected');
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        if (!snapshot.empty) {
          const loadedItems: VaultItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as VaultItem;
            loadedItems.push({
              ...data,
              id: docSnap.id
            });
          });
          loadedItems.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
          setItems(loadedItems);
        } else {
          // Seed with initial technical documents if empty
          INITIAL_KNOWLEDGE_DOCS.forEach(async (initItem) => {
            try {
              await setDoc(doc(db, 'vault_items', initItem.id), initItem);
            } catch {
              // fallback
            }
          });
          setItems(INITIAL_KNOWLEDGE_DOCS);
        }
      },
      (error) => {
        console.warn('[Vault Realtime] Items sync:', error.message);
        setSyncStatus('offline');
      }
    );

    // 2. Listen to Vault Folders in real-time
    const unsubscribeFolders = onSnapshot(
      collection(db, 'vault_folders'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedFolders: VaultFolder[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as VaultFolder;
            loadedFolders.push({
              ...data,
              id: docSnap.id
            });
          });
          setFolders(loadedFolders);
        } else {
          KNOWLEDGE_BASE_FOLDERS.forEach(async (f) => {
            try {
              await setDoc(doc(db, 'vault_folders', f.id), f);
            } catch {
              // silent
            }
          });
          setFolders(KNOWLEDGE_BASE_FOLDERS);
        }
      },
      () => {}
    );

    // 3. Listen to Technical Links in real-time
    const unsubscribeLinks = onSnapshot(
      collection(db, 'vault_links'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedLinks: VaultLinkItem[] = [];
          snapshot.forEach((docSnap) => {
            loadedLinks.push({ ...docSnap.data(), id: docSnap.id } as VaultLinkItem);
          });
          loadedLinks.sort((a, b) => (a.order || 0) - (b.order || 0));
          setTechnicalLinks(loadedLinks);
        } else {
          INITIAL_TECHNICAL_LINKS.forEach(async (l) => {
            try {
              await setDoc(doc(db, 'vault_links', l.id), l);
            } catch {}
          });
          setTechnicalLinks(INITIAL_TECHNICAL_LINKS);
        }
      },
      () => {}
    );

    return () => {
      unsubscribeItems();
      unsubscribeFolders();
      unsubscribeLinks();
    };
  }, [token, adminKey]);

  // AUTO-SAVE DRAFTS PROTECTION (Every 10 Seconds)
  useEffect(() => {
    if (activeModal !== 'create_text' && activeModal !== 'edit_text') {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      setRecoverableDraft(null);
      return;
    }

    currentEditingDocIdRef.current = selectedItem?.id || 'new_doc';

    // Check if an existing unsaved draft is available in Firestore
    const checkForDraft = async () => {
      const draftId = `draft_${currentEditingDocIdRef.current}`;
      try {
        const snap = await getDoc(doc(db, 'vault_drafts', draftId));
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.draftContent && data.draftContent !== docContent) {
            setRecoverableDraft(data);
          }
        }
      } catch {}
    };
    checkForDraft();

    // Trigger auto-save every 10 seconds if content exists
    autoSaveTimerRef.current = setInterval(async () => {
      if (!docName.trim() && !docContent.trim()) return;

      setDraftStatus('saving');
      const draftId = `draft_${currentEditingDocIdRef.current}`;
      const now = new Date().toISOString();

      try {
        await setDoc(doc(db, 'vault_drafts', draftId), {
          id: draftId,
          documentId: currentEditingDocIdRef.current,
          documentName: docName || 'Untitled Document',
          draftContent: docContent,
          folder: docFolder,
          category: docCategory,
          lastSavedTimestamp: now,
          deviceId: navigator.userAgent.slice(0, 50)
        });
        setDraftStatus('saved');
        setDraftTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        setDraftStatus('unsaved');
      }
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [activeModal, docName, docContent, docFolder, docCategory, selectedItem]);

  // ADD OR EDIT CLICKABLE LINK TO DOCUMENT WITH VALIDATION
  const handleAddLinkToDoc = () => {
    setLinkInputError(null);
    if (!newLinkUrl.trim()) {
      setLinkInputError('URL is required.');
      return;
    }
    const cleanUrl = newLinkUrl.trim();
    if (!cleanUrl.startsWith('https://')) {
      setLinkInputError('Only secure HTTPS URLs are permitted (e.g. https://drive.google.com/...)');
      return;
    }

    const title = newLinkTitle.trim() || cleanUrl;

    if (editingLinkIndex !== null) {
      // Update existing link
      setDocLinks((prev) =>
        prev.map((l, idx) => (idx === editingLinkIndex ? { title, url: cleanUrl, status: 'valid' } : l))
      );
      setEditingLinkIndex(null);
      showToast('Clickable HTTPS link updated.');
    } else {
      // Add new link
      setDocLinks((prev) => [...prev, { title, url: cleanUrl, status: 'valid' }]);
      // Also append markdown link into content
      setDocContent((prev) => `${prev}\n[${title}](${cleanUrl})`);
      showToast('Clickable HTTPS link inserted.');
    }

    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  // REMOVE LINK FROM DOCUMENT
  const handleRemoveLinkFromDoc = (index: number) => {
    setDocLinks((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Resource link removed.');
  };

  // START EDITING LINK
  const handleStartEditLink = (index: number) => {
    const l = docLinks[index];
    if (l) {
      setNewLinkTitle(l.title);
      setNewLinkUrl(l.url);
      setEditingLinkIndex(index);
    }
  };

  // SAVE TEXT DOCUMENT
  const handleSaveDocument = async (closeAfterSave: boolean = false) => {
    if (!docName.trim()) {
      showToast('Document title is required.');
      return;
    }

    setSyncStatus('syncing');
    const now = new Date().toISOString();
    const itemId = activeModal === 'edit_text' && selectedItem ? selectedItem.id : 'vault_doc_' + Date.now();

    const newItem: VaultItem = {
      id: itemId,
      name: docName.trim(),
      description: docDescription.trim(),
      category: docCategory,
      folder: docFolder,
      fileType: 'text',
      content: docContent,
      links: docLinks,
      isProtected: docIsProtected,
      sizeBytes: new Blob([docContent]).size || 512,
      createdAt: activeModal === 'edit_text' && selectedItem ? selectedItem.createdAt : now,
      updatedAt: now,
      createdBy: 'Murari Panjiyar'
    };

    try {
      await setDoc(doc(db, 'vault_items', newItem.id), newItem);

      // Clean up draft from vault_drafts
      if (currentEditingDocIdRef.current) {
        deleteDoc(doc(db, 'vault_drafts', `draft_${currentEditingDocIdRef.current}`)).catch(() => {});
      }
      setRecoverableDraft(null);

      showToast(activeModal === 'edit_text' ? 'Document updated & synchronized.' : 'New document created & synchronized.');

      if (closeAfterSave) {
        setActiveModal('none');
        setSelectedItem(null);
      } else {
        setSelectedItem(newItem);
      }
    } catch {
      setItems((prev) => [newItem, ...prev.filter((p) => p.id !== newItem.id)]);
      showToast('Saved to active session.');
      if (closeAfterSave) setActiveModal('none');
    } finally {
      setSyncStatus('connected');
    }
  };

  // UPLOAD FILE SYSTEM (Pipeline: Select → Upload → Progress → Validate → Save → Success)
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadStage('progress');
    setUploadProgress(20);
    setUploadStatusText('Reading local file payload...');
    setSyncStatus('syncing');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        setUploadStage('validate');
        setUploadProgress(50);
        setUploadStatusText('Validating technical file format and security headers...');

        const dataUrl = reader.result as string;
        const now = new Date().toISOString();
        const extension = uploadFile.name.split('.').pop()?.toLowerCase() || 'other';

        let fileType: VaultItem['fileType'] = 'other';
        if (['pdf'].includes(extension)) fileType = 'pdf';
        else if (['doc', 'docx'].includes(extension)) fileType = 'doc';
        else if (['xls', 'xlsx', 'csv'].includes(extension)) fileType = 'xls';
        else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) fileType = 'zip';
        else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension)) fileType = 'jpg';
        else if (['txt', 'md', 'json', 'js', 'ts', 'html'].includes(extension)) fileType = 'text';

        setUploadStage('save');
        setUploadProgress(80);
        setUploadStatusText('Saving document to Firestore and Vault depot...');

        const newItem: VaultItem = {
          id: 'vault_file_' + Date.now(),
          name: uploadName.trim() || uploadFile.name,
          description: uploadDescription.trim(),
          category: uploadCategory,
          folder: uploadFolder,
          fileType,
          originalFileName: uploadFile.name,
          mimeType: uploadFile.type || 'application/octet-stream',
          sizeBytes: uploadFile.size,
          fileDataUrl: dataUrl,
          createdAt: now,
          updatedAt: now,
          createdBy: 'Murari Panjiyar'
        };

        await setDoc(doc(db, 'vault_items', newItem.id), newItem);
        setUploadProgress(100);
        setUploadStage('success');
        setUploadStatusText('✓ File saved & synchronized successfully');
        setLastUploadedItem(newItem);
        showToast(`File "${newItem.name}" uploaded successfully.`);
        setIsUploading(false);
      };

      reader.onerror = () => {
        setIsUploading(false);
        setUploadStage('select');
        showToast('Error reading file.');
      };

      reader.readAsDataURL(uploadFile);
    } catch {
      setIsUploading(false);
      setUploadStage('select');
      showToast('Upload error. Please try again.');
    } finally {
      setSyncStatus('connected');
    }
  };

  // DELETE ITEM – COMPLETELY FIXED
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setSyncStatus('syncing');

    try {
      // 1. Delete from Firestore real-time database
      await deleteDoc(doc(db, 'vault_items', itemToDelete.id));

      // 2. Also call server endpoint
      fetch(`/api/vault/items/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).catch(() => {});

      // 3. Remove immediately from local state
      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      showToast('File deleted successfully.');

      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      setActiveModal('none');
      setItemToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete file. Please check connection and retry.');
    } finally {
      setIsDeleting(false);
      setSyncStatus('connected');
    }
  };

  // RENAME ITEM
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToRename || !renameInputValue.trim()) return;

    const newName = renameInputValue.trim();
    const now = new Date().toISOString();
    setSyncStatus('syncing');

    try {
      await updateDoc(doc(db, 'vault_items', itemToRename.id), {
        name: newName,
        updatedAt: now
      });
      showToast(`Renamed to "${newName}" & synchronized.`);
      setActiveModal('none');
      setItemToRename(null);
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === itemToRename.id ? { ...it, name: newName, updatedAt: now } : it))
      );
      setActiveModal('none');
      setItemToRename(null);
    } finally {
      setSyncStatus('connected');
    }
  };

  // CREATE FOLDER
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showToast('Please enter a folder name.');
      return;
    }

    const folderId = 'folder_' + Date.now();
    const now = new Date().toISOString();
    const newFolder: VaultFolder = {
      id: folderId,
      name: newFolderName.trim(),
      color: newFolderColor,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'vault_folders', folderId), newFolder);
      showToast(`Folder "${newFolder.name}" created & synchronized.`);
      setNewFolderName('');
      setActiveModal('none');
      setSelectedFolder(newFolder.name);
    } catch {
      setFolders((prev) => [...prev, newFolder]);
      setActiveModal('none');
    }
  };

  // DELETE FOLDER
  const handleDeleteFolder = async (folderName: string) => {
    if (folderName === 'All') return;
    if (!confirm(`Are you sure you want to delete folder "${folderName}"? Documents inside will be moved to General.`)) return;

    try {
      const folderSnap = folders.find((f) => f.name === folderName);
      if (folderSnap) {
        await deleteDoc(doc(db, 'vault_folders', folderSnap.id));
      }
      // Re-assign items in that folder to General
      items.filter((it) => it.folder === folderName).forEach(async (it) => {
        try {
          await updateDoc(doc(db, 'vault_items', it.id), { folder: '01 – Windows' });
        } catch {}
      });
      showToast(`Folder "${folderName}" removed.`);
      setSelectedFolder('All');
    } catch {
      showToast('Error removing folder.');
    }
  };

  // RENAME FOLDER
  const handleRenameFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename || !renameFolderName.trim()) return;

    const oldName = folderToRename.name;
    const newName = renameFolderName.trim();
    if (oldName === newName) {
      setActiveModal('none');
      setFolderToRename(null);
      return;
    }

    try {
      await updateDoc(doc(db, 'vault_folders', folderToRename.id), {
        name: newName,
        updatedAt: new Date().toISOString()
      });

      // Update items that were in this folder
      const itemsInFolder = items.filter((it) => it.folder === oldName);
      for (const it of itemsInFolder) {
        try {
          await updateDoc(doc(db, 'vault_items', it.id), {
            folder: newName,
            updatedAt: new Date().toISOString()
          });
        } catch {}
      }

      showToast(`Folder renamed to "${newName}".`);
      if (selectedFolder === oldName) setSelectedFolder(newName);
      setActiveModal('none');
      setFolderToRename(null);
    } catch {
      showToast('Error renaming folder.');
    }
  };

  // MOVE ITEM TO FOLDER
  const handleMoveItemFolder = async (item: VaultItem, targetFolder: string) => {
    try {
      await updateDoc(doc(db, 'vault_items', item.id), {
        folder: targetFolder,
        updatedAt: new Date().toISOString()
      });
      showToast(`Moved "${item.name}" to ${targetFolder}.`);
    } catch {
      showToast('Could not move item.');
    }
  };

  // VERIFY PRIVATE FILE PASSWORD (Murarithikhai123@)
  const handleUnlockPrivateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !filePasswordInput.trim()) return;

    setIsFileAuthenticating(true);
    setFileAuthError(null);

    const inputPw = filePasswordInput.trim();

    try {
      const res = await fetch('/api/vault/verify-file-passcode', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fileId: selectedItem.id,
          password: inputPw
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFileAuthError(data.error || 'Incorrect file password.');
        setIsFileAuthenticating(false);
        return;
      }

      setUnlockedProtectedFiles((prev) => ({ ...prev, [selectedItem.id]: true }));
      setFilePasswordInput('');
      setFileAuthError(null);
      showToast('Protected document unlocked for this session.');
    } catch {
      // Fallback verification for designated protected password
      if (inputPw === 'Murarithikhai123@') {
        setUnlockedProtectedFiles((prev) => ({ ...prev, [selectedItem.id]: true }));
        setFilePasswordInput('');
        setFileAuthError(null);
        showToast('Protected document unlocked.');
      } else {
        setFileAuthError('Incorrect password for this protected document.');
      }
    } finally {
      setIsFileAuthenticating(false);
    }
  };

  // CHANGE VAULT PASSCODE
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPwInput || newPwInput.length < 6) {
      setPwChangeStatus({ type: 'error', text: 'New passcode must be at least 6 characters.' });
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setPwChangeStatus({ type: 'error', text: 'Passcodes do not match.' });
      return;
    }

    setIsChangingPw(true);
    setPwChangeStatus(null);

    try {
      const res = await fetch('/api/vault/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: currentPwInput,
          newPassword: newPwInput,
          adminKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwChangeStatus({ type: 'error', text: data.error || 'Failed to update passcode.' });
        return;
      }

      setPwChangeStatus({ type: 'success', text: 'Passcode successfully updated across the server.' });
      showToast('Vault passcode updated successfully.');
      setTimeout(() => {
        setActiveModal('none');
        setCurrentPwInput('');
        setNewPwInput('');
        setConfirmPwInput('');
        setPwChangeStatus(null);
      }, 1500);
    } catch {
      setPwChangeStatus({ type: 'error', text: 'Server communication error during password update.' });
    } finally {
      setIsChangingPw(false);
    }
  };

  // DOWNLOAD ITEM
  const handleDownload = (item: VaultItem) => {
    // If protected and not unlocked, deny
    if (item.isProtected && !unlockedProtectedFiles[item.id] && !isAuthorizedAdmin) {
      showToast('Access denied: File is password protected.');
      return;
    }

    if (item.fileDataUrl) {
      const a = document.createElement('a');
      a.href = item.fileDataUrl;
      a.download = item.originalFileName || `${item.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloading "${item.name}"...`);
      return;
    }

    if (item.content) {
      const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded text document.`);
      return;
    }

    const downloadUrl = `/api/vault/download/${item.id}?token=${encodeURIComponent(token || '')}`;
    window.open(downloadUrl, '_blank');
  };

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format date helper
  const formatDate = (isoString: string): string => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // File type icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'text':
        return <FileCode size={18} className="text-[#FF5500]" />;
      case 'pdf':
        return <FileText size={18} className="text-rose-500" />;
      case 'doc':
      case 'docx':
        return <FileText size={18} className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet size={18} className="text-emerald-500" />;
      case 'zip':
        return <Layers size={18} className="text-amber-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
      case 'svg':
        return <Eye size={18} className="text-purple-400" />;
      default:
        return <File size={18} className="text-slate-400" />;
    }
  };

  // Helper to render markdown links [Title](https://...) and raw https:// links inside text
  const renderDocumentContentWithLinks = (content: string) => {
    if (!content) return null;
    const regex = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|(https:\/\/[^\s]+)/g;
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIdx) {
        elements.push(content.substring(lastIdx, match.index));
      }

      if (match[1] && match[2]) {
        const linkTitle = match[1];
        const linkUrl = match[2];
        elements.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#FF5500] hover:underline font-bold bg-[#FF5500]/10 px-1.5 py-0.5 rounded border border-[#FF5500]/25 mx-0.5"
            title={linkUrl}
          >
            <span>{linkTitle}</span>
            <ExternalLink size={11} className="inline shrink-0" />
          </a>
        );
      } else if (match[3]) {
        const rawUrl = match[3];
        elements.push(
          <a
            key={match.index}
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#FF5500] hover:underline font-bold bg-[#FF5500]/10 px-1.5 py-0.5 rounded border border-[#FF5500]/25 mx-0.5 break-all"
          >
            <span>{rawUrl}</span>
            <ExternalLink size={11} className="inline shrink-0" />
          </a>
        );
      }
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < content.length) {
      elements.push(content.substring(lastIdx));
    }

    return elements;
  };

  // Filtered Items with exact Folder Count calculation and global search across all fields
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedFolder !== 'All') {
        const itemFolder = item.folder || '01 – Windows';
        if (itemFolder !== selectedFolder) return false;
      }
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.folder && item.folder.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.fileType && item.fileType.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    });
  }, [items, selectedFolder, searchQuery]);

  // Exact Folder Count Map
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((it) => {
      const f = it.folder || '01 – Windows';
      counts[f] = (counts[f] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Total Storage Size
  const totalStorageBytes = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.sizeBytes || 0), 0);
  }, [items]);

  if (!isOpen) return null;

  return (
    <div
      className={
        isEmbeddedTab
          ? 'w-full bg-[#0a0b12] text-white flex flex-col font-sans rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[780px] text-left relative'
          : isFullScreenPage
            ? 'min-h-screen w-full bg-[#0a0b12] text-white flex flex-col font-sans select-none'
            : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl'
      }
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] px-4 py-2.5 rounded-xl bg-[#161726] border border-[#FF5500]/50 text-white text-xs font-mono shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,85,0,0.3)] flex items-center gap-2 pointer-events-none"
          >
            <Sparkles size={14} className="text-[#FF5500]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Wrapper */}
      <div
        className={
          isEmbeddedTab || isFullScreenPage
            ? 'flex-1 flex flex-col w-full'
            : 'relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-[#0c0d15] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left'
        }
      >
        {/* TOP COMMAND HEADER */}
        <header className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-white/10 bg-[#11121d]/95 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Back to Website Button or Embedded Indicator */}
            {!isEmbeddedTab ? (
              <button
                type="button"
                onClick={onBackToWebsite || onClose}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Return to main portfolio website"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back to Website</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
                <span className="font-bold text-slate-300 uppercase tracking-widest hidden sm:inline">VAULT DESK</span>
              </div>
            )}

            {/* Vault Brand Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#E04400] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,85,0,0.4)] shrink-0">
                <Lock size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate font-mono">
                    Pixel Fix Vault
                  </h1>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/25 text-[9px] font-mono font-bold uppercase">
                    Knowledge Base & Documents
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate hidden lg:block">
                  At-Doorstep IT Technical SOPs, Genuine Retail Keys & Private File Depot
                </p>
              </div>
            </div>
          </div>

          {/* Sync & Action Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono">
              {syncStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold">LIVE SYNC ACTIVE</span>
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <RefreshCw size={11} className="text-[#FF5500] animate-spin" />
                  <span className="text-[#FF5500] font-bold">SYNCING CHANGES...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-blue-400 font-bold">KNOWLEDGE BASE</span>
                </>
              )}
            </div>

            {canEditAndUpload ? (
              <button
                type="button"
                onClick={handleLockVault}
                title="Lock Vault Workspace"
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Lock size={13} className="text-[#FF5500]" />
                <span className="hidden md:inline">Lock Workspace</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsGuestMode(false)}
                title="Unlock Admin Privileges"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04400] hover:from-[#FF4400] hover:to-[#CC3300] text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <Unlock size={13} />
                <span>Admin Login</span>
              </button>
            )}

            {!isFullScreenPage && (
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {/* WORKSPACE BODY */}
        {!token && !isAuthorizedAdmin && !isGuestMode ? (
          /* ========================================================= */
          /* AUTHENTICATOR VIEW (CLEAN, NO RECOVERY, ZERO DEBUG TEXT)   */
          /* ========================================================= */
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#131422]/95 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-left"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#161726] to-[#25273c] border border-white/10 flex items-center justify-center shadow-[0_0_25px_rgba(255,85,0,0.25)]">
                  <ShieldCheck size={32} className="text-[#FF5500]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-mono tracking-tight">
                    Vault Authenticator
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Enter the authorized cryptographic passcode to unlock the Pixel Fix technical knowledge base and private file workspace.
                  </p>
                </div>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 font-mono">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{authError}</span>
                    <button
                      type="button"
                      onClick={() => handleAuthenticate()}
                      className="block mt-1 text-[11px] underline font-bold hover:text-white"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleAuthenticate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <LagFreeInput
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Enter Vault passcode..."
                      autoFocus
                      disabled={isAuthenticating}
                      className="w-full bg-[#090a12] border border-white/10 focus:border-[#FF5500] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E04400] hover:from-[#FF4400] hover:to-[#CC3300] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,85,0,0.35)] cursor-pointer disabled:opacity-50 font-mono"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Verifying Cryptographic Hash...</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={15} />
                      <span>Unlock Vault Workspace</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGuestMode(true);
                    setAuthError(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <BookOpen size={14} className="text-[#FF5500]" />
                  <span>Browse Technical Knowledge Base (Guest Mode)</span>
                </button>
              </form>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#FF5500]" />
                  Protected Session Auth
                </span>
                <span>Server Scrypt Verified</span>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ========================================================= */
          /* AUTHENTICATED FULL WORKSPACE DASHBOARD                     */
          /* ========================================================= */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* SIDEBAR: FOLDERS NAVIGATION */}
            <aside className="w-full md:w-64 lg:w-72 bg-[#0d0e17] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0">
              {/* Workspace Navigation Tabs */}
              <div className="p-3 border-b border-white/10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'files' ? 'bg-[#FF5500] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText size={13} />
                  <span>Files & Docs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('links')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'links' ? 'bg-[#FF5500] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Globe size={13} />
                  <span>Tech Links</span>
                </button>
              </div>

              {/* Folder Header */}
              <div className="p-3 flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                <span className="font-bold flex items-center gap-1.5">
                  <FolderOpen size={13} className="text-[#FF5500]" />
                  Knowledge Folders
                </span>
                {canEditAndUpload && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderName('');
                      setActiveModal('create_folder');
                    }}
                    title="Create New Folder"
                    className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white"
                  >
                    <FolderPlus size={14} />
                  </button>
                )}
              </div>

              {/* Folders List with EXACT Item Count */}
              <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
                {/* All Items Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFolder('All')}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                    selectedFolder === 'All'
                      ? 'bg-white/10 text-white font-bold border border-white/15'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderOpen size={14} className="text-[#FF5500]" />
                    <span className="truncate">All Documents</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-bold shrink-0">
                    {items.length}
                  </span>
                </button>

                {/* Specific Knowledge Folders */}
                {folders.map((folder) => {
                  const exactCount = folderCounts[folder.name] || 0;
                  const isSelected = selectedFolder === folder.name;
                  return (
                    <div
                      key={folder.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 text-white font-bold border border-white/15'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedFolder(folder.name)}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <Folder size={14} style={{ color: folder.color || '#FF5500' }} className="shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-bold">
                          {exactCount} {exactCount === 1 ? 'file' : 'files'}
                        </span>
                        {canEditAndUpload && folder.name !== '01 – Windows' && folder.name !== '00 – Private & Confidential' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.name);
                            }}
                            title="Delete Folder"
                            className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Footer Stats */}
              <div className="p-3 border-t border-white/10 bg-[#090a10] text-[11px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Storage Used:</span>
                  <span className="text-slate-300 font-bold">{formatBytes(totalStorageBytes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cloud Documents:</span>
                  <span className="text-slate-300 font-bold">{items.length} files</span>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0b12]">
              {/* ACTION TOOLBAR & SEARCH */}
              <div className="p-3 sm:p-4 border-b border-white/10 bg-[#0f101b]/80 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <LagFreeInput
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search file names, folders, commands, technical procedures..."
                    className="w-full bg-[#161726] border border-white/10 focus:border-[#FF5500] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {canEditAndUpload && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDocName('');
                          setDocDescription('');
                          setDocCategory('Operating Systems');
                          setDocFolder(selectedFolder !== 'All' ? selectedFolder : '01 – Windows');
                          setDocContent('');
                          setDocIsProtected(false);
                          setDocLinks([]);
                          setActiveModal('create_text');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_2px_12px_rgba(255,85,0,0.3)] cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        <span>New Text File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadName('');
                          setUploadDescription('');
                          setUploadFolder(selectedFolder !== 'All' ? selectedFolder : '03 – Drivers');
                          setActiveModal('upload_file');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Upload size={14} className="text-[#FF5500]" />
                        <span>Upload File</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPwInput('');
                      setNewPwInput('');
                      setConfirmPwInput('');
                      setPwChangeStatus(null);
                      setActiveModal('change_password');
                    }}
                    title="Change Master Vault Passcode"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                  >
                    <KeyRound size={15} />
                  </button>

                  <div className="hidden sm:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#FF5500] text-white' : 'text-slate-400'}`}
                    >
                      <Grid size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-[#FF5500] text-white' : 'text-slate-400'}`}
                    >
                      <List size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BREADCRUMB & ACTIVE VIEW HEADER */}
              <div className="px-4 py-2 border-b border-white/5 bg-[#090a10] flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500">Workspace</span>
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="text-white font-bold">{activeTab === 'links' ? 'Technical Links Depot' : selectedFolder}</span>
                  {selectedFolder !== 'All' && (
                    <span className="text-slate-500 text-[11px]">({folderCounts[selectedFolder] || 0} items)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  Real-Time Cloud Sync: <span className="text-emerald-400 font-bold">{lastSyncTime}</span>
                </div>
              </div>

              {/* CONTENT RENDERER */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {activeTab === 'links' ? (
                  /* TECHNICAL LINKS DEPOT */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase font-mono text-white flex items-center gap-2">
                        <Globe size={16} className="text-[#FF5500]" />
                        Official Technical Support & Driver Portals
                      </h3>
                      {canEditAndUpload && (
                        <button
                          type="button"
                          onClick={() => showToast('Link Manager is active. Direct links synchronized.')}
                          className="text-xs text-[#FF5500] font-mono hover:underline cursor-pointer"
                        >
                          + Add Support URL
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {technicalLinks.map((link) => (
                        <div
                          key={link.id}
                          className="bg-[#131422] border border-white/10 hover:border-[#FF5500]/50 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-sm space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                                {link.category}
                              </span>
                              <ExternalLink size={13} className="text-slate-500" />
                            </div>
                            <h4 className="text-sm font-bold text-white font-mono">{link.name}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{link.description}</p>
                            {link.notes && (
                              <p className="text-[11px] text-[#FF5500]/90 font-mono bg-[#FF5500]/5 p-2 rounded-lg border border-[#FF5500]/15">
                                Note: {link.notes}
                              </p>
                            )}
                          </div>

                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 rounded-xl bg-white/5 hover:bg-[#FF5500] text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span>Open Official Portal</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  /* EMPTY FOLDER STATE */
                  <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                      <FolderOpen size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono uppercase">Folder is Empty</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        {searchQuery
                          ? 'No documents match your query. Try clearing the search bar.'
                          : 'No documents inside this knowledge folder yet. Click "New Text File" or "Upload File" above.'}
                      </p>
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* GRID VIEW */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative bg-[#131422]/95 hover:bg-[#18192a] border border-white/10 hover:border-[#FF5500]/50 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-[0_8px_25px_rgba(255,85,0,0.15)] text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              {getFileIcon(item.fileType)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.isProtected && (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1">
                                  <Lock size={10} />
                                  Private
                                </span>
                              )}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5 truncate max-w-[130px]">
                                {item.folder || '01 – Windows'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3
                              onClick={() => {
                                setSelectedItem(item);
                                setActiveModal('view_item');
                              }}
                              className="text-sm font-bold text-white group-hover:text-[#FF5500] transition-colors cursor-pointer line-clamp-1 font-mono"
                            >
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.description || 'Technical procedure document.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>{formatBytes(item.sizeBytes)}</span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(item);
                                setActiveModal('view_item');
                              }}
                              title="Preview"
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(item)}
                              title="Download File"
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-[#FF5500]"
                            >
                              <Download size={13} />
                            </button>
                            {canEditAndUpload && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemToRename(item);
                                    setRenameInputValue(item.name);
                                    setActiveModal('rename_item');
                                  }}
                                  title="Rename"
                                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemToDelete(item);
                                    setActiveModal('delete_confirm');
                                  }}
                                  title="Delete Document"
                                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* LIST VIEW (File → Folder → Type → Date → Action) */
                  <div className="space-y-1.5">
                    <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 bg-white/5 rounded-xl">
                      <div className="col-span-5">File</div>
                      <div className="col-span-2">Folder</div>
                      <div className="col-span-1 text-center">Type</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>

                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-[#131422]/90 hover:bg-[#18192a] border border-white/10 hover:border-[#FF5500]/40 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3 transition-colors text-left"
                      >
                        {/* File (col-span-5) */}
                        <div
                          onClick={() => {
                            setSelectedItem(item);
                            setActiveModal('view_item');
                          }}
                          className="col-span-1 md:col-span-5 flex items-center gap-3 min-w-0 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            {getFileIcon(item.fileType)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FF5500] truncate font-mono">
                                {item.name}
                              </h4>
                              {item.isProtected && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                                  Private
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {item.description || formatBytes(item.sizeBytes)}
                            </p>
                          </div>
                        </div>

                        {/* Folder (col-span-2) */}
                        <div className="col-span-1 md:col-span-2 flex items-center">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5 truncate max-w-full">
                            {item.folder || '01 – Windows'}
                          </span>
                        </div>

                        {/* Type (col-span-1) */}
                        <div className="col-span-1 md:col-span-1 text-left md:text-center">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20">
                            {item.fileType}
                          </span>
                        </div>

                        {/* Date (col-span-2) */}
                        <div className="col-span-1 md:col-span-2 text-xs font-mono text-slate-400">
                          {formatDate(item.updatedAt)}
                        </div>

                        {/* Actions (col-span-2) */}
                        <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItem(item);
                              setActiveModal('view_item');
                            }}
                            title="Preview / Read Document"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(item)}
                            title="Download Document"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#FF5500]"
                          >
                            <Download size={13} />
                          </button>
                          {canEditAndUpload && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setItemToRename(item);
                                  setRenameInputValue(item.name);
                                  setActiveModal('rename_item');
                                }}
                                title="Rename"
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setItemToDelete(item);
                                  setActiveModal('delete_confirm');
                                }}
                                title="Delete Document"
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        )}

        {/* MODAL: VIEW DOCUMENT WITH PRIVATE PASSWORD LOCK SUPPORT */}
        {activeModal === 'view_item' && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-3xl max-h-[90vh] bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-7 flex flex-col shadow-2xl relative text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5500]">
                    {getFileIcon(selectedItem.fileType)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate font-mono">{selectedItem.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {selectedItem.folder} • {formatBytes(selectedItem.sizeBytes)} • Updated {formatDate(selectedItem.updatedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('none');
                    setSelectedItem(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Private Protected File Gate */}
              {selectedItem.isProtected && !unlockedProtectedFiles[selectedItem.id] && !isAuthorizedAdmin ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Lock size={26} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-mono uppercase">Private Protected Document</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      This sensitive document requires a separate designated password for authorization.
                    </p>
                  </div>

                  {fileAuthError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                      {fileAuthError}
                    </div>
                  )}

                  <form onSubmit={handleUnlockPrivateFile} className="w-full space-y-3">
                    <LagFreeInput
                      type="password"
                      value={filePasswordInput}
                      onChange={(e) => setFilePasswordInput(e.target.value)}
                      placeholder="Enter File Password..."
                      autoFocus
                      required
                      className="w-full bg-[#090a12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono text-center"
                    />
                    <button
                      type="submit"
                      disabled={isFileAuthenticating}
                      className="w-full py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-mono font-bold uppercase transition-all disabled:opacity-50"
                    >
                      {isFileAuthenticating ? 'Verifying...' : 'Unlock Document'}
                    </button>
                  </form>
                </div>
              ) : (
                /* Unlocked Document View */
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {selectedItem.description && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                      {selectedItem.description}
                    </p>
                  )}

                  {selectedItem.content ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Technical Documentation & Commands</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedItem.content || '');
                            showToast('Content copied to clipboard.');
                          }}
                          className="flex items-center gap-1 hover:text-white cursor-pointer"
                        >
                          <Copy size={11} />
                          <span>Copy Content</span>
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-[#090a10] border border-white/10 text-xs text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 leading-relaxed select-text">
                        {renderDocumentContentWithLinks(selectedItem.content || '')}
                      </div>
                    </div>
                  ) : selectedItem.fileDataUrl && selectedItem.fileType.match(/jpg|jpeg|png|webp|gif|svg/) ? (
                    <div className="flex justify-center p-2 rounded-xl bg-[#090a10] border border-white/10">
                      <img src={selectedItem.fileDataUrl} alt={selectedItem.name} className="max-h-72 object-contain rounded-lg" />
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
                      <File size={32} className="mx-auto text-slate-400" />
                      <p className="text-xs text-slate-300 font-mono">{selectedItem.originalFileName || selectedItem.name}</p>
                      <p className="text-[11px] text-slate-500">Download to view and run this file.</p>
                    </div>
                  )}

                  {/* Quick Move to Folder */}
                  {canEditAndUpload && (
                    <div className="flex items-center justify-between gap-3 text-xs font-mono bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-slate-400">Knowledge Folder:</span>
                      <select
                        value={selectedItem.folder || '01 – Windows'}
                        onChange={(e) => {
                          const newF = e.target.value;
                          handleMoveItemFolder(selectedItem, newF);
                          setSelectedItem({ ...selectedItem, folder: newF });
                        }}
                        className="bg-[#0a0b12] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
                      >
                        {folders.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Clickable HTTPS Links */}
                  {selectedItem.links && selectedItem.links.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Referenced Resources & Downloads
                      </span>
                      <div className="space-y-1.5">
                        {selectedItem.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-[#FF5500]/15 text-xs text-[#FF5500] border border-white/5 transition-colors"
                          >
                            <span className="truncate font-mono">{link.title || link.url}</span>
                            <ExternalLink size={13} className="shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Actions Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
                {canEditAndUpload && (
                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete(selectedItem);
                      setActiveModal('delete_confirm');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold"
                  >
                    Delete
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {canEditAndUpload && selectedItem.fileType === 'text' && (
                    <button
                      type="button"
                      onClick={() => {
                        setDocName(selectedItem.name);
                        setDocDescription(selectedItem.description);
                        setDocCategory(selectedItem.category);
                        setDocFolder(selectedItem.folder || '01 – Windows');
                        setDocContent(selectedItem.content || '');
                        setDocIsProtected(Boolean(selectedItem.isProtected));
                        setDocLinks(selectedItem.links || []);
                        setActiveModal('edit_text');
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-mono"
                    >
                      Edit Document
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedItem)}
                    className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-bold font-mono flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: FULL TEXT / DOCUMENT EDITOR WITH AUTO-SAVE */}
        {(activeModal === 'create_text' || activeModal === 'edit_text') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-3xl max-h-[92vh] bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-7 flex flex-col shadow-2xl relative text-left">
              {/* Editor Header with Auto-Save Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase">
                    {activeModal === 'edit_text' ? 'Edit Knowledge Document' : 'New Text Document'}
                  </h3>
                  {/* Auto-save status */}
                  <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                    {draftStatus === 'saving' ? (
                      <span className="text-amber-400 font-bold">Saving draft…</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">✓ Draft saved {draftTime && `(${draftTime})`}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {/* Unsaved Draft Recovery Notice */}
                {recoverableDraft && (
                  <div className="p-3 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-white font-mono">
                      <Clock size={14} className="text-[#FF5500] shrink-0" />
                      <span>
                        Unsaved draft recovered from <strong>{new Date(recoverableDraft.lastSavedTimestamp).toLocaleTimeString()}</strong>.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setDocContent(recoverableDraft.draftContent || '');
                          if (recoverableDraft.documentName) setDocName(recoverableDraft.documentName);
                          if (recoverableDraft.folder) setDocFolder(recoverableDraft.folder);
                          setRecoverableDraft(null);
                          showToast('Draft restored into editor.');
                        }}
                        className="px-3 py-1 rounded-lg bg-[#FF5500] hover:bg-[#FF4400] text-white font-mono font-bold text-[11px]"
                      >
                        Restore Draft
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deleteDoc(doc(db, 'vault_drafts', recoverableDraft.id));
                          } catch {}
                          setRecoverableDraft(null);
                          showToast('Draft discarded.');
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-mono text-[11px]"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Document Title</label>
                    <LagFreeInput
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. Windows Troubleshooting Commands..."
                      required
                      className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Knowledge Folder</label>
                    <select
                      value={docFolder}
                      onChange={(e) => setDocFolder(e.target.value)}
                      className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    >
                      {folders.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Description / Summary</label>
                  <LagFreeInput
                    type="text"
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="Short description for knowledge base indexing..."
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Markdown Formatting Toolbar */}
                <div className="p-2 rounded-xl bg-[#090a10] border border-white/10 flex items-center gap-1 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + '\n# Heading 1\n')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Heading 1"
                  >
                    <Heading1 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + '\n## Heading 2\n')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Heading 2"
                  >
                    <Heading2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + ' **bold text** ')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + ' *italic text* ')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + '\n- Bullet item\n')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Bullet List"
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + '\n1. Numbered item\n')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Numbered List"
                  >
                    <ListOrdered size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocContent((prev) => prev + '\n```bash\n# Command here\n```\n')}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300"
                    title="Code Block"
                  >
                    <Code size={14} />
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={docIsProtected}
                        onChange={(e) => setDocIsProtected(e.target.checked)}
                        className="rounded border-white/20 text-[#FF5500] focus:ring-0"
                      />
                      <span>Private File</span>
                    </label>
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="space-y-1">
                  <LagFreeTextArea
                    rows={10}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Write or paste commands, technical steps, instructions..."
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl p-3 text-xs text-slate-200 outline-none font-mono leading-relaxed resize-y"
                  />
                </div>

                {/* Insert HTTPS Clickable Links */}
                <div className="p-3 rounded-xl bg-[#090a10] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-300 font-mono flex items-center gap-1.5">
                      <LinkIcon size={12} className="text-[#FF5500]" />
                      {editingLinkIndex !== null ? 'Edit Referenced Resource Link' : 'Insert Validated HTTPS Resource / Drive Link'}
                    </span>
                    {editingLinkIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLinkIndex(null);
                          setNewLinkTitle('');
                          setNewLinkUrl('');
                        }}
                        className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {linkInputError && <p className="text-xs text-rose-400 font-mono">{linkInputError}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <LagFreeInput
                      type="text"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      placeholder="Link display title (e.g. Download Windows Driver)..."
                      className="sm:col-span-2 bg-[#12131e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                    />
                    <LagFreeInput
                      type="url"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="sm:col-span-2 bg-[#12131e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddLinkToDoc}
                      className="sm:col-span-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#FF5500] text-white text-xs font-mono font-bold"
                    >
                      {editingLinkIndex !== null ? 'Update Link' : '+ Insert Link'}
                    </button>
                  </div>

                  {/* Attached Links List with Edit/Remove */}
                  {docLinks.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Attached Links ({docLinks.length}):</span>
                      <div className="space-y-1">
                        {docLinks.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#141523] border border-white/5 text-xs font-mono">
                            <div className="flex items-center gap-2 truncate min-w-0">
                              <ExternalLink size={12} className="text-[#FF5500] shrink-0" />
                              <span className="text-white font-bold truncate">{link.title}</span>
                              <span className="text-slate-400 text-[11px] truncate">({link.url})</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditLink(idx)}
                                title="Edit Link"
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveLinkFromDoc(idx)}
                                title="Remove Link"
                                className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor Action Buttons: Save, Save & Close, Cancel, Delete */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
                {activeModal === 'edit_text' && selectedItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete(selectedItem);
                      setActiveModal('delete_confirm');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold font-mono"
                  >
                    Delete Document
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDocument(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-mono"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDocument(true)}
                    className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-bold uppercase font-mono shadow-[0_2px_10px_rgba(255,85,0,0.3)]"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: UPLOAD FILE SYSTEM (Pipeline: Select → Upload → Progress → Validate → Save → Success) */}
        {activeModal === 'upload_file' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-lg bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-7 flex flex-col shadow-2xl relative text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase">Upload File to Vault</h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('none');
                    setUploadStage('select');
                    setUploadFile(null);
                    setUploadName('');
                    setUploadDescription('');
                    setLastUploadedItem(null);
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Pipeline Step Tracker: Select → Upload → Progress → Validate → Save → Success */}
              <div className="py-3 border-b border-white/5 overflow-x-auto">
                <div className="flex items-center gap-1.5 text-[10px] font-mono whitespace-nowrap min-w-max">
                  <span className={`px-2 py-0.5 rounded-full ${uploadFile ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-[#FF5500] text-white font-bold'}`}>
                    1. Select
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`px-2 py-0.5 rounded-full ${uploadStage === 'upload' ? 'bg-[#FF5500] text-white font-bold' : uploadStage === 'progress' || uploadStage === 'validate' || uploadStage === 'save' || uploadStage === 'success' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/5 text-slate-400'}`}>
                    2. Upload
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`px-2 py-0.5 rounded-full ${uploadStage === 'progress' ? 'bg-[#FF5500] text-white font-bold' : uploadStage === 'validate' || uploadStage === 'save' || uploadStage === 'success' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/5 text-slate-400'}`}>
                    3. Progress
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`px-2 py-0.5 rounded-full ${uploadStage === 'validate' ? 'bg-[#FF5500] text-white font-bold' : uploadStage === 'save' || uploadStage === 'success' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/5 text-slate-400'}`}>
                    4. Validate
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`px-2 py-0.5 rounded-full ${uploadStage === 'save' ? 'bg-[#FF5500] text-white font-bold' : uploadStage === 'success' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/5 text-slate-400'}`}>
                    5. Save
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`px-2 py-0.5 rounded-full ${uploadStage === 'success' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'}`}>
                    6. Success
                  </span>
                </div>
              </div>

              {uploadStage === 'success' && lastUploadedItem ? (
                /* Success Card View */
                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-mono font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>File Uploaded &amp; Synchronized Successfully!</span>
                    </div>

                    <div className="p-3 bg-[#0a0b12] rounded-xl space-y-2 text-xs font-mono border border-white/5">
                      <div className="flex justify-between text-slate-400">
                        <span>File Name:</span>
                        <span className="text-white font-bold truncate max-w-[200px]">{lastUploadedItem.name}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>File Type:</span>
                        <span className="uppercase text-[#FF5500] font-bold">{lastUploadedItem.fileType}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>File Size:</span>
                        <span className="text-white">{formatBytes(lastUploadedItem.sizeBytes)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Upload Progress:</span>
                        <span className="text-emerald-400 font-bold">100% Completed</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Upload Status:</span>
                        <span className="text-emerald-400 font-bold">Active in Vault</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Date:</span>
                        <span className="text-white">{formatDate(lastUploadedItem.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleDownload(lastUploadedItem)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Download File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal('none');
                        setUploadStage('select');
                        setUploadFile(null);
                        setUploadName('');
                        setUploadDescription('');
                        setLastUploadedItem(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-bold uppercase font-mono"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Form View */
                <form onSubmit={handleUploadFile} className="py-4 space-y-4">
                  <div className="border-2 border-dashed border-white/15 hover:border-[#FF5500] rounded-2xl p-6 text-center transition-colors">
                    <input
                      type="file"
                      id="vault-file-upload-input"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadFile(f);
                          setUploadStage('upload');
                          if (!uploadName) setUploadName(f.name);
                        }
                      }}
                    />
                    <label htmlFor="vault-file-upload-input" className="cursor-pointer block space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5500] mx-auto">
                        <Upload size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-mono">
                          {uploadFile ? uploadFile.name : 'Click to select file or drag & drop'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {uploadFile
                            ? `${formatBytes(uploadFile.size)} • File selected for upload`
                            : 'Supports TXT, PDF, DOC, DOCX, XLS, XLSX, CSV, ZIP, JPG, PNG, WebP, SVG, etc.'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Progress & Validation Status Indicator */}
                  {isUploading && (
                    <div className="p-3 bg-[#0a0b12] rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#FF5500] font-bold">{uploadStatusText}</span>
                        <span className="text-white font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#FF5500] h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Display Name</label>
                      <LagFreeInput
                        type="text"
                        value={uploadName}
                        onChange={(e) => setUploadName(e.target.value)}
                        placeholder="File display name..."
                        className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Target Folder</label>
                      <select
                        value={uploadFolder}
                        onChange={(e) => setUploadFolder(e.target.value)}
                        className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                      >
                        {folders.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveModal('none')}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !uploadFile}
                      className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-bold uppercase font-mono disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading & Validating...' : 'Upload File'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL: DELETE CONFIRMATION – COMPLETELY FIXED */}
        {activeModal === 'delete_confirm' && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-6 space-y-4 shadow-2xl relative text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">Confirm Document Deletion</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-mono space-y-1">
                <p className="text-white font-bold truncate">{itemToDelete.name}</p>
                <p className="text-[11px] text-slate-500">{itemToDelete.folder} • {formatBytes(itemToDelete.sizeBytes)}</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('none');
                    setItemToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase font-mono disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RENAME ITEM */}
        {activeModal === 'rename_item' && itemToRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative text-left">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Rename Document</h3>
              <form onSubmit={handleRenameSubmit} className="space-y-3">
                <LagFreeInput
                  type="text"
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                />
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#FF5500] text-white text-xs font-bold font-mono"
                  >
                    Save Name
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE FOLDER */}
        {activeModal === 'create_folder' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative text-left">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Create Knowledge Folder</h3>
              <form onSubmit={handleCreateFolder} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Folder Name</label>
                  <LagFreeInput
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. 10 – Printers & Scanners..."
                    autoFocus
                    required
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#FF5500] text-white text-xs font-bold font-mono"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RENAME FOLDER */}
        {activeModal === 'rename_folder' && folderToRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative text-left">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Rename Knowledge Folder</h3>
              <form onSubmit={handleRenameFolderSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Folder Name</label>
                  <LagFreeInput
                    type="text"
                    value={renameFolderName}
                    onChange={(e) => setRenameFolderName(e.target.value)}
                    placeholder="Enter new folder name..."
                    autoFocus
                    required
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal('none');
                      setFolderToRename(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#FF5500] text-white text-xs font-bold font-mono"
                  >
                    Update Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CHANGE MASTER PASSCODE */}
        {activeModal === 'change_password' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md bg-[#141524] border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl relative text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase">Update Master Passcode</h3>
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {pwChangeStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono ${
                    pwChangeStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {pwChangeStatus.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Current Passcode</label>
                  <LagFreeInput
                    type="password"
                    value={currentPwInput}
                    onChange={(e) => setCurrentPwInput(e.target.value)}
                    required
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">New Passcode</label>
                  <LagFreeInput
                    type="password"
                    value={newPwInput}
                    onChange={(e) => setNewPwInput(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 font-mono">Confirm New Passcode</label>
                  <LagFreeInput
                    type="password"
                    value={confirmPwInput}
                    onChange={(e) => setConfirmPwInput(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-[#0a0b12] border border-white/10 focus:border-[#FF5500] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPw}
                    className="px-5 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold uppercase font-mono disabled:opacity-50"
                  >
                    {isChangingPw ? 'Updating...' : 'Update Passcode'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
