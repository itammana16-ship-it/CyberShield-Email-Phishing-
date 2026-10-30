
import React, { useEffect, useState } from 'react';
import { User, ScanResult } from '../../types';
import { UserDossierModal } from './UserDossierModal';
import {
  Users,
  Trash2,
  FileText,
  User as UserIcon,
  Search,
  AlertCircle
} from 'lucide-react';

interface AdminUserListProps {
  scans: ScanResult[];
  onUserRemoved?: () => void;
}

const API_URL = 'https://cybershield-phishing-api.onrender.com';

export const AdminUserList: React.FC<AdminUserListProps> = ({
  scans,
  onUserRemoved
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserForDossier, setSelectedUserForDossier] =
    useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Read the logged-in admin's JWT token.
  const getAuthHeaders = (): HeadersInit => {
    const token = sessionStorage.getItem('phishguard_access_token');

    if (!token) {
      throw new Error('Admin session expired. Please log in again.');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Load registered users from MongoDB.
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin authorization failed. Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch registered users.');
      }

      const data: User[] = await response.json();
      setUsers(data);
      setNotification(null);
    } catch (error) {
      console.error('Error fetching users:', error);

      setNotification(
        error instanceof Error
          ? error.message
          : 'Could not load registered users from server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.organization &&
      user.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDossier = (user: User) => {
    setSelectedUserForDossier(user);
  };

  // Delete user from MongoDB through the protected backend API.
  const confirmDeleteUser = async () => {
    if (!userToDelete || deleting) return;

    if (userToDelete.role === 'admin') {
      setNotification('Master Admin user cannot be deleted.');
      setUserToDelete(null);
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}/api/users/${encodeURIComponent(userToDelete.id)}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin authorization failed. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Could not delete this user.');
      }

      setUsers(previousUsers =>
        previousUsers.filter(user => user.id !== userToDelete.id)
      );

      setNotification(
        `User account ${userToDelete.username} was deleted successfully from MongoDB.`
      );

      if (onUserRemoved) {
        onUserRemoved();
      }

      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);

      setNotification(
        error instanceof Error
          ? error.message
          : 'Failed to delete user.'
      );
    } finally {
      setDeleting(false);
      window.setTimeout(() => setNotification(null), 4000);
    }
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
            Shows all registered users. Click a user's box to view their scan
            history and profile.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-sm text-slate-400">
          Loading registered users...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => {
            const userScanCount = scans.filter(
              scan => scan.userId === user.id
            ).length;

            const userPhishCount = scans.filter(
              scan =>
                scan.userId === user.id &&
                scan.threatLevel === 'phishing'
            ).length;

            const isMasterAdmin = user.role === 'admin';

            return (
              <div
                key={user.id}
                className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] hover:border-cyan-500/50 transition-all shadow-lg flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isMasterAdmin
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-slate-800 text-cyan-300 border border-slate-700'
                        }`}
                      >
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

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        isMasterAdmin
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1.5 py-2 border-y border-slate-800/60 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Organization:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[140px]">
                        {user.organization || 'SOC Core'}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Clearance:</span>
                      <span className="text-slate-200 font-medium">
                        {user.securityClearance || 'Level 1'}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Total Scans Logged:</span>
                      <span className="font-mono font-bold text-cyan-300 tabular-nums">
                        {userScanCount}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Phishing Intercepted:</span>
                      <span className="font-mono font-bold text-rose-400 tabular-nums">
                        {userPhishCount}
                      </span>
                    </div>
                  </div>
                </div>

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

          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-10 text-sm text-slate-400">
              No registered users found.
            </div>
          )}
        </div>
      )}

      {selectedUserForDossier && (
        <UserDossierModal
          user={selectedUserForDossier}
          userScans={scans.filter(
            scan => scan.userId === selectedUserForDossier.id
          )}
          onClose={() => setSelectedUserForDossier(null)}
        />
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-900/80 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">
                Confirm User Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user{' '}
              <strong>{userToDelete.username}</strong> ({userToDelete.email})
              from the MongoDB repository? This action cannot be reversed.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setUserToDelete(null)}
                className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteUser}
                className="py-1.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
