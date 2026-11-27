import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle, Quote, Heart, Mail, AlertCircle } from 'lucide-react';
import { submitTestimony, getGmailComposeUrl } from '../api/client';
import { useChurch } from '../context/ChurchContext';

export default function TestimonyModal({ isOpen, onClose, onTestimonyAdded }) {
  const church = useChurch();
  const settings = church?.settings || {};
  const adminNotificationEmail = settings.adminNotificationEmail || settings.email || 'contact@gracevictorychurch.org';

  const [prefix, setPrefix] = useState('Brother');
  const [name, setName] = useState('');
  const [formData, setFormData] = useState({
    story: '',
    type: 'Miraculous Healing',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanName = name.trim();
    const formattedName = cleanName.toLowerCase().startsWith(prefix.toLowerCase())
      ? cleanName
      : `${prefix} ${cleanName}`;

    const submissionPayload = {
      ...formData,
      name: formattedName
    };
    setLastSubmittedPayload(submissionPayload);

    try {
      const res = await submitTestimony(submissionPayload);
      if (onTestimonyAdded) onTestimonyAdded(res);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not submit testimony right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto my-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-8 text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2 pr-10 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Share God's Miracles • தேவ சாட்சிகள்</span>
            </div>

            <h3 className="font-serif font-bold text-2xl text-slate-950 mb-2 pr-10">
              Share Your Testimony
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              “They overcame him by the blood of the Lamb and by the word of their testimony.” (Revelation 12:11). Encourage the congregation with how God has worked in your life!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name & Title *</label>
                <div className="flex gap-2">
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="shrink-0 w-28 sm:w-32 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-bold text-amber-900"
                  >
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Elder">Elder</option>
                    <option value="Evangelist">Evangelist</option>
                    <option value="Family">Family</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samuel / Priya & Family"
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Displayed as: <strong className="text-amber-800">{prefix} {name.trim() || 'Your Name'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium"
                  >
                    <option value="Miraculous Healing">Miraculous Healing (சுகமளிக்கும் அற்புதம்)</option>
                    <option value="Life Transformation">Life Transformation (மறுரூபமாக்கப்பட்ட வாழ்க்கை)</option>
                    <option value="Financial Breakthrough">Financial Breakthrough (நிதி ஆசீர்வாதம் & வேலை)</option>
                    <option value="Family Peace">Family Peace & Restoration (குடும்ப சமாதானம்)</option>
                    <option value="Deliverance">Deliverance & Freedom (விடுதலை & வெற்றி)</option>
                    <option value="Thanksgiving">Thanksgiving & Praise (நன்றி செலுத்துதல்)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Vattamalai / Tirupur"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Testimony (What did God do?) *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Tell how God answered your prayer or performed a miracle in your life..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Testimony...' : 'Publish Testimony for God’s Glory'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="font-serif font-bold text-2xl text-slate-950">
              Praise the Lord! Testimony Received!
            </h3>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-left text-xs text-amber-950 space-y-1 max-w-sm mx-auto">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Notification Dispatched to Church Office:</span>
              </div>
              <p className="text-slate-600">
                An alert was dispatched to <strong className="text-slate-900 font-mono break-all">{adminNotificationEmail}</strong> and saved for admin review in the portal.
              </p>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Thank you for sharing the mighty works of God to inspire and strengthen others in faith!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {lastSubmittedPayload && (
                <a
                  href={getGmailComposeUrl({
                    to: adminNotificationEmail,
                    subject: `[GVC NOTIFICATION] 🌟 New Testimony Submitted by ${lastSubmittedPayload.name}`,
                    body: `Testimony Details:\nName: ${lastSubmittedPayload.name}\nType: ${lastSubmittedPayload.type}\nLocation: ${lastSubmittedPayload.location}\n\nStory:\n"${lastSubmittedPayload.story}"`
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Gmail (Web)</span>
                </a>
              )}

              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setFormData({ story: '', type: 'Miraculous Healing', location: '' });
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                Amen & Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
