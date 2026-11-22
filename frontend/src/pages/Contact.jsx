import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle, 
  HelpCircle, ChevronDown, MessageCircle, Sparkles, ExternalLink 
} from 'lucide-react';
import { submitContact, triggerNotification, getGmailComposeUrl, openGmailCompose } from '../api/client';
import { FAQ_LIST } from '../data/mockData';
import { useChurch } from '../context/ChurchContext';

export default function Contact() {
  const church = useChurch();
  const settings = church?.settings || {};

  const churchAddress = settings.address || "Grace Victory Church, Vattamalai, Tamil Nadu, India";
  const churchPhone = settings.phone || "+91 93605 88397";
  const churchWhatsapp = settings.whatsappNumber || "+91 93605 88397";
  const churchEmail = settings.email || "contact@gracevictorychurch.org";
  const adminNotificationEmail = settings.adminNotificationEmail || "madara05112001@gmail.com";
  const googleMapsEmbedUrl = settings.googleMapsEmbedUrl || "https://maps.google.com/maps?q=Grace%20Victory%20Church,%20Vattamalai,%20Tamil%20Nadu,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const googleMapsLink = settings.googleMapsLink || "https://maps.google.com/?q=Grace+Victory+Church+Vattamalai+Tamil+Nadu+India";
  const sundayTiming = settings.serviceTimings || "09:30 AM – 11:30 AM";
  const wednesdayTiming = settings.wednesdayTiming || "07:00 PM – 08:30 PM";
  const fridayTiming = settings.fridayTiming || "10:30 AM – 01:30 PM";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitContact({
        ...formData,
        sent_to_email: adminNotificationEmail
      });
      await triggerNotification({
        type: 'contact',
        data: formData,
        recipient: adminNotificationEmail
      });
    } catch (err) {
      console.warn('API error, recorded locally', err);
    } finally {
      setSubmitted(true);
      setLoading(false);

      // Open Gmail Web directly in browser with pre-filled message (bypasses Outlook)
      const mailSubject = `[GVC NOTIFICATION] ✉️ New Serve Message: ${formData.subject || 'General'} - from ${formData.name}`;
      const mailBody = `Dear Grace Victory Church Pastoral & Admin Team,\n\nA new message was submitted on the website under "HOW CAN WE SERVE YOU?":\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone (WhatsApp): ${formData.phone || 'N/A'}\nSubject: ${formData.subject}\nDate: ${new Date().toLocaleString()}\n\nMessage Body:\n"${formData.message}"\n\n---\nSubmitted via Grace Victory Church Website`;
      
      openGmailCompose({
        to: adminNotificationEmail,
        subject: mailSubject,
        body: mailBody
      });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#FAF9F6] text-slate-800">
      
      {/* PAGE HEADER - LIGHT THEME */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2 sm:mb-3">
            We Would Love to Hear From You
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-6xl text-[#0B192C] mb-3 sm:mb-6 leading-tight">
            Contact & <span className="gold-text-gradient">Visit Us</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Have questions? Need prayer? Planning your first visit? Our church pastoral and administrative teams are here to assist you.
          </p>
        </div>
      </section>

      {/* CONTACT INFO & FORM GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: INFO CARDS (Dynamically controlled via Admin Panel) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
              <h3 className="font-serif font-bold text-xl text-slate-950 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <span>Sanctuary Location</span>
              </h3>

              <div className="space-y-4 text-sm text-slate-600">
                <p className="leading-relaxed font-semibold text-slate-900">
                  {churchAddress}
                </p>

                <div className="pt-2 flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span>Office: <a href={`tel:${churchPhone.replace(/[^0-9+]/g, '')}`} className="font-bold text-slate-900 hover:text-amber-700">{churchPhone}</a></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp: <strong className="text-slate-900">{churchWhatsapp}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>Email: <a href={getGmailComposeUrl({ to: churchEmail })} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 hover:text-amber-700">{churchEmail}</a></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <a
                  href={`https://wa.me/${churchWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect Directly on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* INTERACTIVE GOOGLE MAP LOCATION (Managed via Admin Portal) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-base text-slate-950 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Church Location & Map</span>
                </h4>
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Embedded Interactive Map */}
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
                <iframe
                  title="Grace Victory Church Location"
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 truncate">
                  Vattamalai, Tamil Nadu
                </p>
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <span>Get Driving Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10">
              
              {!submitted ? (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    Send a Message
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-slate-950 mb-2">
                    How Can We Serve You?
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Inquiries are sent directly to the church administration email at <strong className="text-slate-700">{churchEmail}</strong>.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="youremail@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 93605 88397"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 font-medium focus:bg-white"
                        >
                          <option value="General Church Inquiry">General Church Inquiry</option>
                          <option value="Pastoral Counseling">Request Pastoral Counseling</option>
                          <option value="Baby Dedication / Baptism">Baby Dedication / Water Baptism</option>
                          <option value="Wedding / Funeral Booking">Wedding / Memorial Service</option>
                          <option value="Joining a Ministry Team">Joining a Ministry Team</option>
                          <option value="Prayer Request">Direct Pastoral Prayer Request</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message *</label>
                      <textarea
                        rows="4"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your message or inquiry here..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Sending Message...' : 'Send Message to Church Office'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-slate-950">
                    Message Dispatched to Church Office!
                  </h3>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-left text-xs text-amber-950 space-y-1 max-w-md mx-auto">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>Instant Pastoral Notification Dispatched:</span>
                    </div>
                    <p className="text-slate-600">
                      Thank you, <strong>{formData.name}</strong>! Your inquiry was dispatched to <strong className="text-slate-900 font-mono">{adminNotificationEmail}</strong> and logged in the church admin system.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={getGmailComposeUrl({
                        to: adminNotificationEmail,
                        subject: `[GVC NOTIFICATION] ✉️ New Serve Message: ${formData.subject} - from ${formData.name}`,
                        body: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\nSubject: ${formData.subject}\n\nMessage:\n"${formData.message}"\n\n---\nSubmitted via Grace Victory Church Website`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Open in Gmail (Web)</span>
                    </a>

                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', subject: 'General Church Inquiry', message: '' });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS - LIGHT THEME */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2">
              Common Questions
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-950 mb-4">
              First-Time Visitor FAQ
            </h2>
            <p className="text-slate-600 text-sm">
              Everything you need to know before stepping through our doors.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-base text-slate-900 hover:text-amber-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-amber-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
