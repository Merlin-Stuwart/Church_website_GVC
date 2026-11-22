import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Lock, Key, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, User, CheckCircle, Mail, RotateCcw 
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { 
  changeAdminPassword, 
  requestPasswordResetOTP, 
  resetPasswordWithOTP 
} from '../api/client';

export default function AdminAuthModal({ isOpen, onClose }) {
  // Modes: 'login' | 'forgot' | 'otp_reset' | 'change_with_old'
  const [mode, setMode] = useState('login');

  // Login fields
  const [userId, setUserId] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password / OTP fields
  const [forgotUserId, setForgotUserId] = useState('admin');
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [showOtpPassword, setShowOtpPassword] = useState(false);

  // Change password with old password fields
  const [cpUserId, setCpUserId] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // State feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const church = useChurch();
  const loginAdmin = church?.loginAdmin || (async () => ({ success: false }));
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 1. Normal Login Submit
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

  // 2. Request OTP Submit
  const handleRequestOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const targetUser = (forgotUserId || userId || 'admin').trim();
    try {
      const res = await requestPasswordResetOTP(targetUser);
      setMaskedEmail(res.masked_email || 'super admin email');
      setSuccessMsg(res.message || `✓ Verification code sent to ${res.masked_email || 'super admin email'}!`);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
        setOtpCode(res.dev_otp);
      } else {
        setDevOtp('');
        setOtpCode('');
      }
      setOtpNewPassword('');
      setOtpConfirmPassword('');
      setMode('otp_reset');
    } catch (err) {
      setError(err.message || 'Failed to send OTP verification email. Please check server settings.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password With OTP Submit
  const handleResetWithOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (otpNewPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const targetUser = (forgotUserId || userId || 'admin').trim();

    try {
      const res = await resetPasswordWithOTP({
        userId: targetUser,
        otp: otpCode.trim(),
        newPassword: otpNewPassword.trim()
      });

      setSuccessMsg('✓ Password reset successfully! Logging you in...');

      // Attempt immediate login with new credentials
      try {
        const loginResult = await loginAdmin({
          userId: targetUser,
          password: otpNewPassword.trim()
        });
        if (loginResult.success) {
          setTimeout(() => {
            onClose();
            navigate('/admin');
          }, 1200);
          return;
        }
      } catch (e) {
        // Fallback to login screen
      }

      // If auto-login didn't redirect, prefill login form
      setTimeout(() => {
        setUserId(targetUser);
        setPassword(otpNewPassword.trim());
        setMode('login');
        setSuccessMsg('Password updated! Click "Unlock Admin Portal" to proceed.');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Change Password (Using Current Password)
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
      await changeAdminPassword({
        userId: cpUserId.trim() || 'admin',
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        newUserId: cpUserId.trim() || 'admin'
      });
      setSuccessMsg('✓ Password changed successfully! Please log in with your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUserId(cpUserId.trim() || 'admin');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 2000);
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

          {/* Dynamic Header Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            {mode === 'login' && <Lock className="w-7 h-7" />}
            {mode === 'forgot' && <Mail className="w-7 h-7" />}
            {mode === 'otp_reset' && <ShieldCheck className="w-7 h-7 text-emerald-400" />}
            {mode === 'change_with_old' && <Key className="w-7 h-7" />}
          </div>

          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block mb-1">
            {mode === 'login' && 'Authorized Personnel Only'}
            {mode === 'forgot' && 'Super Admin Password Recovery'}
            {mode === 'otp_reset' && 'Two-Factor Verification'}
            {mode === 'change_with_old' && 'Security & Credentials • db.auth'}
          </span>

          <h3 className="font-serif font-black text-xl text-white">
            {mode === 'login' && 'Church Admin Portal Access'}
            {mode === 'forgot' && 'Forgot Admin Password?'}
            {mode === 'otp_reset' && 'Enter Verification Code'}
            {mode === 'change_with_old' && 'Change Admin Password'}
          </h3>

          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' && 'Grace Victory Church Content Management System'}
            {mode === 'forgot' && 'An OTP will be delivered directly to the super admin email'}
            {mode === 'otp_reset' && `Enter the 6-digit OTP sent to ${maskedEmail || 'your email'}`}
            {mode === 'change_with_old' && 'Update your credentials saved in MongoDB auth collection'}
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
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* =============================================================
             VIEW 1: NORMAL LOGIN FORM
             ============================================================= */}
          {mode === 'login' && (
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
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                      setForgotUserId(userId || 'admin');
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Forgot Password?</span>
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
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Verifying Credentials...' : 'Unlock Admin Portal'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('change_with_old');
                    setError('');
                    setSuccessMsg('');
                    setCpUserId(userId || 'admin');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>Change Password with Current Password</span>
                </button>
              </div>
            </form>
          )}

          {/* =============================================================
             VIEW 2: FORGOT PASSWORD (REQUEST OTP)
             ============================================================= */}
          {mode === 'forgot' && (
            <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Super Admin Email Verification</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed text-[11.5px]">
                  An OTP will be delivered directly to the church super admin notification email. You can reset your password immediately without needing the old password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin User ID / Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={forgotUserId}
                    onChange={(e) => setForgotUserId(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{loading ? 'Sending OTP to Super Admin Email...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
              >
                &larr; Back to Login
              </button>
            </form>
          )}

          {/* =============================================================
             VIEW 3: OTP VERIFICATION & NEW PASSWORD
             ============================================================= */}
          {mode === 'otp_reset' && (
            <form onSubmit={handleResetWithOtpSubmit} className="space-y-3.5">
              {devOtp ? (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-950 font-medium animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Cloud Host Blocked SMTP (Render Free Tier)</span>
                  </div>
                  <p className="text-amber-900/90 text-[11px] leading-relaxed mb-2">
                    Render blocks raw SMTP sockets ([Errno 101]). Your recovery OTP is <strong className="font-mono text-sm px-1.5 py-0.5 rounded bg-amber-200/90 border border-amber-400">{devOtp}</strong> (auto-filled below &amp; logged in Render Dashboard ➔ Logs).
                  </p>
                  <p className="text-[10px] text-amber-800/80">
                    Enter your new password below to reset your password and unlock the Admin Portal immediately!
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Check Super Admin Mailbox</span>
                  </div>
                  <p className="text-emerald-800/90 text-[11px] leading-relaxed">
                    Enter the 6-digit code sent to <strong>{maskedEmail || 'super admin email'}</strong> (valid for 10 mins). Please check your inbox and spam folder.
                  </p>
                </div>
              )}

              {/* 6-Digit OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[8px] text-xl font-mono font-black py-2.5 rounded-xl bg-amber-50/60 border border-amber-300 text-amber-950 focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showOtpPassword ? 'text' : 'password'}
                    required
                    value={otpNewPassword}
                    onChange={(e) => setOtpNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 chars)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtpPassword(!showOtpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showOtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={otpConfirmPassword}
                  onChange={(e) => setOtpConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-mono"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying OTP & Updating...' : 'Reset Password & Unlock Portal'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleRequestOtpSubmit}
                    disabled={loading}
                    className="text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    &larr; Back to Login
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =============================================================
             VIEW 4: CHANGE PASSWORD WITH CURRENT PASSWORD
             ============================================================= */}
          {mode === 'change_with_old' && (
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
                    setMode('login');
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
