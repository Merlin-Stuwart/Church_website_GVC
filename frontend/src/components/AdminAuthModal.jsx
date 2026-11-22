import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Key, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, User, CheckCircle } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { changeAdminPassword } from '../api/client';

export default function AdminAuthModal({ isOpen, onClose }) {
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Change password fields
  const [cpUserId, setCpUserId] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const church = useChurch();
  const loginAdmin = church?.loginAdmin || (async () => ({ success: false }));
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await loginAdmin({
        userId: userId.trim(),
        password: password.trim()
      });
      if (result.success) {
        setUserId('');
        setPassword('');
        onClose();
        navigate('/admin');
      } else {
        setError(result.message || 'Invalid User ID or Password. Access denied.');
      }
    } catch (err) {
      setError('Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await changeAdminPassword({
        userId: cpUserId.trim() || 'admin',
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        newUserId: cpUserId.trim() || 'admin'
      });
      setSuccessMsg('✓ Password changed successfully in db.auth! Please log in with your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUserId(cpUserId.trim() || 'admin');
      setTimeout(() => {
        setIsChangePasswordMode(false);
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Top Header */}
        <div className="bg-[#0B192C] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            {isChangePasswordMode ? <Key className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>

          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block mb-1">
            {isChangePasswordMode ? 'Security & Credentials • db.auth' : 'Authorized Personnel Only'}
          </span>
          <h3 className="font-serif font-black text-xl text-white">
            {isChangePasswordMode ? 'Change Admin Password' : 'Church Admin Portal Access'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isChangePasswordMode 
              ? 'Update your credentials saved in MongoDB auth collection' 
              : 'Grace Victory Church Content Management System'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          
          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 mb-4 font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isChangePasswordMode ? (
            /* =============================================================
               MODE 1: NORMAL LOGIN FORM
               ============================================================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* User ID Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  User ID / Username
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter User ID (e.g. admin)..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangePasswordMode(true);
                      setError('');
                      setSuccessMsg('');
                      setCpUserId(userId || 'admin');
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Change Password?</span>
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-mono"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-md shadow-amber-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Key className="w-4 h-4" />
                <span>{loading ? 'Verifying Credentials...' : 'Unlock Admin Portal'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>
          ) : (
            /* =============================================================
               MODE 2: CHANGE PASSWORD FORM
               ============================================================= */
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  User ID / Username
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={cpUserId}
                    onChange={(e) => setCpUserId(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 chars)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-mono"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>{loading ? 'Saving to db.auth...' : 'Save New Password in db.auth'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordMode(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
                >
                  &larr; Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Keyboard shortcut info */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold">A</kbd> anywhere to open this prompt.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
