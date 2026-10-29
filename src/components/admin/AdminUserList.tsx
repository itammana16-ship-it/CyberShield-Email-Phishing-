import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { Storage } from '../../utils/storage';
import { UserDossierModal } from './UserDossierModal';
import { 
  Users, 
  Trash2, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  User as UserIcon, 
  ExternalLink,
  Search,
  AlertCircle
} from 'lucide-react';

interface AdminUserListProps {
  scans: ScanResult[];
  onUserRemoved?: () => void;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({ scans, onUserRemoved }) => {
  const [users, setUsers] = useState<User[]>(() => Storage.getUsers());
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDossier = (user: User) => {
    setSelectedUserForDossier(user);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'admin') {
      setNotification('Master Admin user cannot be deleted.');
      setUserToDelete(null);
      return;
    }

    const success = Storage.removeUser(userToDelete.id);
    if (success) {
      const refreshed = Storage.getUsers();
      setUsers(refreshed);
      setNotification(`User account ${userToDelete.username} was permanently removed from MongoDB.`);
      if (onUserRemoved) onUserRemoved();
    }
    setUserToDelete(null);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>User Management & Scan Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
Shows all registered users in separate boxes. Click a user’s box to view their scan history and profile.          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Box Box Card Grid ("eyta box box akare par user list thakbe click korle file open hobe") */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const userScanCount = scans.filter(s => s.userId === user.id).length;
          const userPhishCount = scans.filter(s => s.userId === user.id && s.threatLevel === 'phishing').length;
          const isMasterAdmin = user.role === 'admin';

          return (
            <div
              key={user.id}
              className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] hover:border-cyan-500/50 transition-all shadow-lg flex flex-col justify-between group relative"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isMasterAdmin ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                    }`}>
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {user.username}
                      </h3>
                      <p className="text-xs text-slate-400 truncate max-w-[170px]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                    isMasterAdmin ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Details snippet */}
                <div className="space-y-1.5 py-2 border-y border-slate-800/60 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Organization:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[140px]">{user.organization || 'SOC Core'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Clearance:</span>
                    <span className="text-slate-200 font-medium">{user.securityClearance || 'Level 1'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Scans Logged:</span>
                    <span className="font-mono font-bold text-cyan-300 tabular-nums">{userScanCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Phishing Intercepted:</span>
                    <span className="font-mono font-bold text-rose-400 tabular-nums">{userPhishCount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleOpenDossier(user)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open File / Scans</span>
                </button>

                {!isMasterAdmin && (
                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    title="Remove user account"
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 hover:text-white border border-rose-800/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dossier Modal when clicking user card */}
      {selectedUserForDossier && (
        <UserDossierModal
          user={selectedUserForDossier}
          userScans={scans.filter(s => s.userId === selectedUserForDossier.id)}
          onClose={() => setSelectedUserForDossier(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-900/80 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm User Deletion</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user <strong>{userToDelete.username}</strong> ({userToDelete.email}) from the MongoDB repository? This action cannot be reversed.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="py-1.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
