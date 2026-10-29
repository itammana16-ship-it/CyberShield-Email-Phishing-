
import React, { useState } from 'react';
import { User } from '../../types';
import { Storage } from '../../utils/storage';
import {
  User as UserIcon,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  onUserUpdated?: (user: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUserUpdated,
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [dateOfBirth, setDateOfBirth] = useState(
    currentUser.dateOfBirth || ''
  );
  const [address, setAddress] = useState(currentUser.address || '');
  const [gender, setGender] = useState(currentUser.gender || '');
  const [mobileNumber, setMobileNumber] = useState(
    currentUser.mobileNumber || ''
  );
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const inputClass =
    'w-full py-2.5 px-3 bg-[var(--theme-bg)] border border-slate-700 rounded-lg text-[var(--theme-text)] focus:outline-none focus:border-cyan-500';
  const labelClass =
    'block text-sm text-slate-400 font-medium mb-1.5';

  const handleUpdateInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInfoMessage(null);
    setInfoError(null);

    const cleanName = username.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail) {
      setInfoError('Name and Email are required.');
      return;
    }

    const updated: User = {
      ...currentUser,
      username: cleanName,
      email: cleanEmail,
      dateOfBirth,
      address: address.trim(),
      gender,
      mobileNumber: mobileNumber.trim(),
      avatar,
    };

    try {
      Storage.saveUser(updated);
      Storage.setActiveSession(updated);
      onUserUpdated?.(updated);
      setInfoMessage('Profile details saved successfully on this browser.');
    } catch {
      setInfoError(
        'Could not save your profile. Please try a smaller photo.'
      );
    }
  };

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setInfoError('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 1024 * 1024) {
      setInfoError('Please choose an image smaller than 1 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setInfoError(null);
      }
    };

    reader.onerror = () => {
      setInfoError('Could not read the selected image.');
    };

    reader.readAsDataURL(file);
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassError(
      'Password change is not connected to the authentication backend yet. No password was changed.'
    );
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-[var(--theme-text)] flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-cyan-400" />
          Personal Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Edit your personal information and profile photo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 p-5 rounded-xl border border-slate-700 bg-[var(--theme-card)] shadow-lg space-y-5">
          <h2 className="text-base font-semibold text-[var(--theme-text)]">
            Personal Information
          </h2>

          {infoMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {infoError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{infoError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-slate-600 flex items-center justify-center bg-slate-800">
                  <UserIcon className="w-10 h-10 text-slate-400" />
                </div>
              )}

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-[var(--theme-text)] hover:border-cyan-500">
                <Camera className="w-4 h-4" />
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500">
                Optional · Image must be smaller than 1 MB
              </p>
            </div>

            <div>
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
                placeholder="Enter your address (optional)"
                rows={3}
                autoComplete="street-address"
              />
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={inputClass}
                placeholder="Enter mobile number (optional)"
                autoComplete="tel"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </form>
        </section>

        <section className="lg:col-span-5 p-5 rounded-xl border border-slate-700 bg-[var(--theme-card)] shadow-lg space-y-4">
          <h2 className="text-base font-semibold text-[var(--theme-text)] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            Change Password
          </h2>

          {passError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
