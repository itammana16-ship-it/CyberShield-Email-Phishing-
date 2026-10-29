
import React from 'react';
import type { User, ScanResult } from '../../types';
import {
  X,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  History,
} from 'lucide-react';

interface UserDossierModalProps {
  user: User;
  userScans: ScanResult[];
  onClose: () => void;
}

const formatLabel = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (
    value instanceof Date ||
    (typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value))
  ) {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const hiddenFields = new Set([
  'id',
  '_id',
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'organization',
  'securityclearance',
  'createdat',
]);

const normalizeKey = (key: string) =>
  key.replace(/[_\-\s]/g, '').toLowerCase();

export const UserDossierModal: React.FC<UserDossierModalProps> = ({
  user,
  userScans,
  onClose,
}) => {
  const userData = user as unknown as Record<string, unknown>;

  const profileEntries = Object.entries(userData).filter(([key, value]) => {
    const normalized = normalizeKey(key);

    return (
      !hiddenFields.has(key.toLowerCase()) &&
      !hiddenFields.has(normalized) &&
      value !== null &&
      value !== undefined &&
      typeof value !== 'function'
    );
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="User Profile"
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-900/40 p-3">
              <UserIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Profile</h2>
              <p className="text-sm text-slate-400">
                {formatValue(userData.username)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section className="rounded-xl border border-slate-700 p-5">
            <h3 className="mb-4 font-semibold text-white">User Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400">User ID</p>
                <p className="mt-1 break-all text-sm text-white">
                  {formatValue(userData.id ?? userData._id)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400">Role</p>
                <p className="mt-1 text-sm text-white">
                  {formatValue(userData.role)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400">Join Date</p>
                <p className="mt-1 text-sm text-white">
                  {formatValue(userData.createdAt)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400">Last Login</p>
                <p className="mt-1 text-sm text-white">
                  {formatValue(userData.lastLogin)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 p-5">
            <h3 className="mb-4 font-semibold text-white">
              Additional Profile Details
            </h3>
            {profileEntries.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {profileEntries.map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-slate-800 p-3">
                    <p className="text-xs text-slate-400">{formatLabel(key)}</p>
                    <p className="mt-1 break-words text-sm text-white">
                      {formatValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No additional profile information available.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-slate-700 p-5">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">
                Scan History ({userScans.length})
              </h3>
            </div>

            {userScans.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs text-slate-400">
                      <th className="px-3 py-3">Target</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Verdict</th>
                      <th className="px-3 py-3">Confidence</th>
                      <th className="px-3 py-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userScans.map((scan, index) => {
                      const data = scan as unknown as Record<string, unknown>;
                      const verdict = String(
                        data.verdict ?? data.result ?? 'Unknown'
                      );
                      const isThreat =
                        /phish|malicious|danger|high risk/i.test(verdict);

                      return (
                        <tr
                          key={String(data.id ?? data._id ?? index)}
                          className="border-b border-slate-800"
                        >
                          <td className="max-w-[220px] break-words px-3 py-3 text-slate-200">
                            {formatValue(
                              data.target ?? data.url ?? data.email ?? data.message
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-200">
                            {formatValue(data.vector ?? data.type ?? data.scanType)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                                isThreat
                                  ? 'bg-red-900/50 text-red-300'
                                  : 'bg-emerald-900/50 text-emerald-300'
                              }`}
                            >
                              {isThreat ? (
                                <ShieldAlert className="h-3.5 w-3.5" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5" />
                              )}
                              {verdict}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-200">
                            {formatValue(data.confidence ?? data.confidenceScore)}
                          </td>
                          <td className="px-3 py-3 text-slate-200">
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4 text-amber-400" />
                              {formatValue(data.risk ?? data.riskLevel)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No scan history available for this user.
              </p>
            )}
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-700 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDossierModal;
