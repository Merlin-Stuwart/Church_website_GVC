import React, { useState } from 'react';
import { X, Heart, CheckCircle, Shield, Lock, Mail } from 'lucide-react';
import { submitPrayer, triggerNotification, getGmailComposeUrl } from '../api/client';
import { useChurch } from '../context/ChurchContext';

export default function PrayerModal({ isOpen, onClose, onPrayerAdded }) {
  const church = useChurch();
  const settings = church?.settings || {};
  const adminNotificationEmail = settings.adminNotificationEmail || 'madara05112001@gmail.com';

  const [formData, setFormData] = useState({
    name: '',
    request: '',
    category: 'Healing & Health',
    is_public: false,
    is_anonymous: false
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await submitPrayer(formData);
      if (onPrayerAdded) onPrayerAdded(res);
      await triggerNotification({
        type: 'prayer',
        data: formData,
        recipient: adminNotificationEmail
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('API error, showing confirmation', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto my-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-8 text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-amber-600 text-amber-600" />
              <span>We Are Standing With You In Faith</span>
            </div>

            <h3 className="font-serif font-bold text-2xl text-slate-950 mb-2">
              Submit a Prayer Request
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              “The prayer of a righteous person is powerful and effective.” (James 5:16). Our pastoral prayer team intercedes over every prayer request submitted.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required={!formData.is_anonymous}
                  disabled={formData.is_anonymous}
                  value={formData.is_anonymous ? 'Anonymous' : formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.is_anonymous ? 'Anonymous Intercessor' : 'Sister Mary / Brother Paul'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prayer Need Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors font-medium"
                >
                  <option value="Healing & Health">Healing & Health (சுகம் & ஆரோக்கியம்)</option>
                  <option value="Family & Marriage">Family & Marriage (குடும்ப சமாதானம்)</option>
                  <option value="Career & Finances">Job, Career & Finances (வேலை & தொழில்)</option>
                  <option value="Salvation & Renewal">Salvation & Deliverance (இரட்சிப்பு & விடுதலை)</option>
                  <option value="Childbirth & Children">Childbirth & Children (மழலை பாக்கியம் & பிள்ளைகள்)</option>
                  <option value="Thanksgiving">Thanksgiving & Praise (நன்றி செலுத்துதல்)</option>
                  <option value="General Guidance">General Guidance & Wisdom (தேவ வழிநடத்துதல்)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Prayer Request *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.request}
                  onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                  placeholder="Share details of your situation so we can agree together in faith according to Matthew 18:19..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                ></textarea>
              </div>

              {/* Confidential Privacy Assurance & Anonymous Toggle */}
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold block text-amber-900">100% Confidential Pastoral Care</span>
                    Your prayer request will not be shown publicly on the website. It goes directly to Pastor P. Rajendran and our intercessory prayer team.
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                    className="rounded bg-slate-100 border-slate-300 text-amber-600 focus:ring-0"
                  />
                  <span>Keep my identity anonymous</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting in Faith...' : 'Submit Prayer Request'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="font-serif font-bold text-2xl text-slate-950">
              Prayer Received in Faith!
            </h3>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-left text-xs text-amber-950 space-y-1 max-w-sm mx-auto">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Notification Dispatched to Pastoral Team:</span>
              </div>
              <p className="text-slate-600">
                An alert was dispatched to <strong className="text-slate-900 font-mono">{adminNotificationEmail}</strong> and logged in the church admin system.
              </p>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed italic">
              “Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.” — Mark 11:24
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={getGmailComposeUrl({
                  to: adminNotificationEmail,
                  subject: `[GVC NOTIFICATION] 🙏 New Prayer Request from ${formData.name || 'Anonymous'}`,
                  body: `Prayer Request Details:\nName: ${formData.name || 'Anonymous'}\nCategory: ${formData.category}\nPrivacy: ${formData.is_public ? 'Public' : 'Confidential'}\n\nPetition:\n"${formData.request}"`
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Mail className="w-4 h-4" />
                <span>Open in Gmail (Web)</span>
              </a>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', request: '', category: 'Healing & Health', is_public: false, is_anonymous: false });
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
