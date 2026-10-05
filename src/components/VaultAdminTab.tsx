/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  FileText,
  Upload,
  Trash2,
  Edit,
  Download,
  Folder,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Move
} from 'lucide-react';
import { VaultItem, VaultAuthorizedUser, VaultAuditLog } from '../types';

interface VaultAdminTabProps {
  currentTheme?: 'dark' | 'light' | 'mono';
  onOpenVaultModal?: () => void;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const VaultAdminTab: React.FC<VaultAdminTabProps> = ({
  currentTheme = 'dark',
  onOpenVaultModal,
  triggerToast
}) => {
  // Vault Admin State
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('pf_vault_token') || null;
  });
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data
  const [items, setItems] = useState<VaultItem[]>([]);
  const [users, setUsers] = useState<VaultAuthorizedUser[]>([]);
  const [logs, setLogs] = useState<VaultAuditLog[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Add User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Rename / Move Item Dialog
  const [selectedItemToRename, setSelectedItemToRename] = useState<VaultItem | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [moveFolderInput, setMoveFolderInput] = useState('');
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  // Verify and fetch on mount
  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token]);

  const handleAdminVaultLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassInput.trim()) return;

    setIsVerifying(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/vault/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassInput.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication rejected.');
        return;
      }

      setToken(data.token);
      sessionStorage.setItem('pf_vault_token', data.token);
      setAdminPassInput('');
      triggerToast('Vault administrative session authorized.', 'success');
      fetchAdminData(data.token);
    } catch {
      setLoginError('Error connecting to Vault authentication service.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchAdminData = async (activeToken: string) => {
    setIsLoadingData(true);
    try {
      // 1. Items
      const itemsRes = await fetch('/api/vault/items', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const itemsData = await itemsRes.json();
      if (itemsRes.ok && itemsData.success) {
        setItems(itemsData.items || []);
        setTotalSize(itemsData.totalSize || 0);
      } else if (itemsRes.status === 401) {
        setToken(null);
        sessionStorage.removeItem('pf_vault_token');
        return;
      }

      // 2. Users
      const usersRes = await fetch('/api/vault/admin/users', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsers(usersData.users || []);
      }

      // 3. Logs
      const logsRes = await fetch('/api/vault/admin/logs', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const logsData = await logsRes.json();
      if (logsRes.ok && logsData.success) {
        setLogs(logsData.logs || []);
      }
    } catch {
      triggerToast('Error loading Vault control records.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 6) {
      triggerToast('New password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerToast('New password and confirmation do not match.', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/vault/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast('Master Vault password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to update vault password.', 'error');
      }
    } catch {
      triggerToast('Network error while updating password.', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newUserName.trim() || !newUserEmail.trim()) return;

    setIsAddingUser(true);
    try {
      const res = await fetch('/api/vault/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Authorized access granted to ${newUserName}.`, 'success');
        setNewUserName('');
        setNewUserEmail('');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to add user.', 'error');
      }
    } catch {
      triggerToast('Network error adding authorized user.', 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Revoke vault access for ${name}?`)) return;

    try {
      const res = await fetch(`/api/vault/admin/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Access revoked for ${name}.`, 'info');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to remove user.', 'error');
      }
    } catch {
      triggerToast('Network error revoking user.', 'error');
    }
  };

  const handleRenameOrMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedItemToRename) return;

    setIsUpdatingItem(true);
    try {
      const res = await fetch(`/api/vault/items/${encodeURIComponent(selectedItemToRename.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: renameInput.trim(),
          folder: moveFolderInput.trim() || selectedItemToRename.folder
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast('Item renamed & moved successfully.', 'success');
        setSelectedItemToRename(null);
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to update item.', 'error');
      }
    } catch {
      triggerToast('Network error updating item.', 'error');
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Permanently delete "${name}" from Vault?`)) return;

    try {
      const res = await fetch(`/api/vault/items/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`"${name}" deleted from Vault.`, 'success');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to delete item.', 'error');
      }
    } catch {
      triggerToast('Network error deleting item.', 'error');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Tab Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] shrink-0">
            <Lock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#FF5500] block">
              PIXEL FIX VAULT CONTROL DESK
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Encrypted Document &amp; File Vault Manager
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Control storage partitions, master password hashing, and authorized technicians.
            </p>
          </div>
        </div>

        {onOpenVaultModal && (
          <button
            type="button"
            onClick={onOpenVaultModal}
            className="px-4 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF5500]/20 cursor-pointer self-start sm:self-auto"
          >
            <Folder size={14} />
            <span>Open Vault Workspace</span>
          </button>
        )}
      </div>

      {!token ? (
        /* Vault Key Unlock for Admin */
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-900/60 border border-white/10 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] mx-auto">
            <KeyRound size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Unlock Vault Admin Console</h3>
            <p className="text-xs text-zinc-400">
              Enter your Vault master passcode (or admin security passcode) to administer storage and access keys.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-left flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminVaultLogin} className="space-y-3 text-left">
            <input
              type="password"
              required
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="Enter vault passcode..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500] font-mono"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 bg-[#FF5500] hover:bg-[#FF4400] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#FF5500]/25"
            >
              {isVerifying ? 'Validating...' : 'Unlock Vault Management'}
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Admin Suite for Vault */
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Total Documents</span>
              <span className="text-2xl font-black text-white">{items.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Storage Used</span>
              <span className="text-2xl font-black text-[#FF5500]">{formatBytes(totalSize)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Authorized Users</span>
              <span className="text-2xl font-black text-emerald-400">{users.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Audit Trail</span>
              <span className="text-2xl font-black text-amber-400">{logs.length}</span>
            </div>
          </div>

          {/* TWO COLUMN GRID: Password Management & User Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Change Master Vault Password */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <ShieldCheck size={18} className="text-[#FF5500]" />
                <div>
                  <h3 className="text-sm font-bold text-white">Change Vault Master Password</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Updates scrypt hash and cryptographic salt</span>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-zinc-400 block">Current Vault Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 block">New Password (min 6)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 block">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-[#FF5500]/20 flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <KeyRound size={13} />
                  <span>{isChangingPass ? 'Updating Hash...' : 'Update Vault Password'}</span>
                </button>
              </form>
            </div>

            {/* 2. Manage Authorized User Access */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Users size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Authorized Users &amp; Roles</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Control which staff or technicians can access Vault</span>
                </div>
              </div>

              {/* Add User Form */}
              <form onSubmit={handleAddUser} className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Name (e.g. Ramesh IT)"
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Email address"
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="editor">Editor (Upload &amp; Edit)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Grant Access</span>
                </button>
              </form>

              {/* Current Users List */}
              <div className="space-y-2 pt-2 border-t border-white/5 max-h-[160px] overflow-y-auto">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-zinc-500">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {u.role}
                      </span>
                      {users.length > 1 && u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                          title="Revoke access"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ITEM MANAGEMENT TABLE: Rename, Move, Replace, Delete */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#FF5500]" />
                <h3 className="text-sm font-bold text-white">All Vault Documents &amp; Files</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">{items.length} records</span>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-zinc-300">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Folder</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Updated</th>
                    <th className="py-2.5 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map(it => (
                    <tr key={it.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white max-w-[200px] truncate">
                        {it.name}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{it.folder}</td>
                      <td className="py-3 px-3">
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                          {it.fileType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{formatBytes(it.size)}</td>
                      <td className="py-3 px-3 text-zinc-500">{formatDate(it.updatedAt)}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItemToRename(it);
                              setRenameInput(it.name);
                              setMoveFolderInput(it.folder);
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                            title="Rename / Move Folder"
                          >
                            <Move size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(it.id, it.name)}
                            className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Delete Item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Rename/Move Modal */}
          {selectedItemToRename && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-white/15 space-y-4">
                <h4 className="text-sm font-bold text-white font-mono">Rename / Move Vault Item</h4>
                <form onSubmit={handleRenameOrMove} className="space-y-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-zinc-400 block">File Name</label>
                    <input
                      type="text"
                      required
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 block">Folder / Category</label>
                    <input
                      type="text"
                      required
                      value={moveFolderInput}
                      onChange={(e) => setMoveFolderInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItemToRename(null)}
                      className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingItem}
                      className="px-4 py-1.5 rounded-xl bg-[#FF5500] text-white font-bold"
                    >
                      {isUpdatingItem ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* AUDIT LOG TRAIL */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                  Security &amp; Modification Audit Trail
                </h4>
              </div>
              <button
                type="button"
                onClick={() => token && fetchAdminData(token)}
                className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw size={11} /> Refresh Logs
              </button>
            </div>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-black/30 text-[11px] font-mono text-zinc-400 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-white/5 text-[#FF5500]">
                      {log.action}
                    </span>
                    <span className="text-zinc-200 truncate">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0">{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultAdminTab;
