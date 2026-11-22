import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Calendar, Heart, Users, DollarSign, 
  Plus, Trash2, CheckCircle, Database, Server, RefreshCw, X, 
  Settings, Image, Phone, MapPin, Clock, Edit, Save, LogOut, 
  ExternalLink, Sparkles, BookOpen, AlertCircle, Lock, Key, ArrowRight, Eye, EyeOff, Upload,
  Search, Check, Filter, ChevronUp, ChevronDown, Layers,
  Mail, MessageCircle, Send, Inbox, Star, User, UserCheck, Menu, Shield,
  Sun, Moon, QrCode, Receipt, Download, Printer, FileText, CreditCard, TrendingUp, HelpCircle
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { 
  fetchSermons, createSermon, deleteSermon, 
  fetchEvents, createEvent, updateEvent, deleteEvent, getEventNotices,
  formatDateForInput, formatEventDisplayDate, isEventActive,
  fetchPrayers, fetchAllPrayersAdmin, deletePrayer, 
  fetchTestimonies, submitTestimony, deleteTestimony, getStoredTestimonies,
  toggleTestimonyHomeFeature, changeAdminPassword,
  fetchMinistries, createMinistry, updateMinistry, deleteMinistry,
  fetchSystemStatus, fetchAllDonations, deleteDonation, updateDonationStatus, submitDonation, getStoredDonations,
  fetchInquiries, deleteInquiry, getStoredInquiries,
  getGmailComposeUrl 
} from '../api/client';
import { INITIAL_SERMONS, INITIAL_EVENTS, INITIAL_PRAYERS, TESTIMONIES, CHURCH_STATS, DEFAULT_MILESTONES, CORE_BELIEFS, LEADERSHIP_TEAM, MINISTRIES_DATA, FAQ_LIST } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';

export default function AdminDashboard() {
  const church = useChurch();
  const settings = church?.settings || {};
  const updateSettings = church?.updateSettings || (async () => {});
  const isAdminLoggedIn = Boolean(church?.isAdminLoggedIn);
  const loginAdmin = church?.loginAdmin || (async () => ({ success: false }));
  const logoutAdmin = church?.logoutAdmin || (() => {});
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('settings');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Bright Mode
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [aboutSaveSuccess, setAboutSaveSuccess] = useState(false);
  const [directUserId, setDirectUserId] = useState('admin');
  const [directPassword, setDirectPassword] = useState('');
  const [showDirectPassword, setShowDirectPassword] = useState(false);
  const [directError, setDirectError] = useState('');
  const [directSuccess, setDirectSuccess] = useState('');
  const [directLoading, setDirectLoading] = useState(false);
  const [directLockMode, setDirectLockMode] = useState('login'); // 'login' or 'changePassword'
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Auth management state (db.auth collection)
  const [authForm, setAuthForm] = useState({
    currentPassword: '',
    newUserId: 'admin',
    newPassword: '',
    confirmPassword: ''
  });
  const [authSaveStatus, setAuthSaveStatus] = useState(null);
  const [authSaveLoading, setAuthSaveLoading] = useState(false);

  // Form State for Live Site Settings
  const [siteForm, setSiteForm] = useState({
    churchName: settings.churchName,
    tamilName: settings.tamilName,
    seniorPastor: settings.seniorPastor,
    seniorPastorTitle: settings.seniorPastorTitle || "Founder & Senior Pastor",
    associatePastor: settings.associatePastor || "Pastor R. Franklin Rajendran",
    associatePastorTitle: settings.associatePastorTitle || "Youth Pastor & Administrator",
    phone: settings.phone,
    whatsappNumber: settings.whatsappNumber,
    email: settings.email || "contact@gracevictorychurch.org",
    adminNotificationEmail: settings.adminNotificationEmail || "madara05112001@gmail.com",
    address: settings.address,
    googleMapsEmbedUrl: settings.googleMapsEmbedUrl || "https://maps.google.com/maps?q=Grace%20Victory%20Church,%20Vattamalai,%20Tamil%20Nadu,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed",
    googleMapsLink: settings.googleMapsLink || "https://maps.google.com/?q=Grace+Victory+Church+Vattamalai+Tamil+Nadu+India",
    serviceTimings: settings.serviceTimings,
    wednesdayTiming: settings.wednesdayTiming || "07:00 PM – 08:30 PM",
    fridayTiming: settings.fridayTiming || "10:30 AM – 01:30 PM",
    yearBadge: settings.yearBadge,
    themeBadge: settings.themeBadge,
    tamilTheme: settings.tamilTheme,
    tagline: settings.tagline,
    verse: settings.verse,
    pastorImage: settings.pastorImage,
    associatePastorImage: settings.associatePastorImage || "/images/franklin.jpg",
    churchHallImage: settings.churchHallImage,
    upiId: settings.upiId,
    bankName: settings.bankName,
    accountNumber: settings.accountNumber,
    branch: settings.branch,
    ifscCode: settings.ifscCode,
    razorpayKeyId: settings.razorpayKeyId || settings.razorpay_key_id || 'rzp_test_GVC1024Testing',
    razorpayKeySecret: settings.razorpayKeySecret || settings.razorpay_key_secret || 'gvcSecretKeyForTesting1024',
    sliderSpeedSeconds: settings.sliderSpeedSeconds || 3,
    featuredHomeTestimonyIds: settings.featuredHomeTestimonyIds || ['testimony-1', 'testimony-2', 'testimony-3'],
    churchStats: settings.churchStats || CHURCH_STATS,
    milestones: settings.milestones || DEFAULT_MILESTONES,
    coreBeliefs: settings.coreBeliefs || CORE_BELIEFS,
    leadershipTeam: settings.leadershipTeam || LEADERSHIP_TEAM,
    foundedYear: settings.foundedYear || '1998',
    pastorWelcomeBadge: settings.pastorWelcomeBadge || 'A Personal Word from Our Pastoral Leadership',
    pastorWelcomeTitle: settings.pastorWelcomeTitle || '“You Were Born to Walk in Divine Favor and Supernatural Victory!”',
    pastorWelcomeP1: settings.pastorWelcomeP1 || 'Beloved brother and sister, welcome to Grace Victory Church. For over 28 years, God has granted us the privilege of shepherding precious families across Vattamalai with love, truth, and the supernatural power of the Holy Spirit.',
    pastorWelcomeP2: settings.pastorWelcomeP2 || 'No matter what challenge, illness, or heartbreak you are carrying today, our Lord Jesus Christ is alive and His grace is more than sufficient. We believe that when you step into our church, you will experience the tangible presence of God, deep fellowship, and supernatural peace.',
    pastorWelcomeQuote: settings.pastorWelcomeQuote || '“Together with our pastoral leadership and our youth pastor, Pastor R. Franklin Rajendran, we personally invite you to worship with us this Sunday. We look forward to welcoming you and your family!”',
    faqList: Array.isArray(settings.faqList) && settings.faqList.length > 0 ? settings.faqList : FAQ_LIST,
    swiftCode: settings.swiftCode || 'SBININBB492',
    givingVerse: settings.givingVerse || '“Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.” — Malachi 3:10',
    givingPresets: settings.givingPresets || '500, 1000, 2500, 5000, 10000',
    prayerWallVerse: settings.prayerWallVerse || '“Again I say unto you, That if two of you shall agree on earth as touching any thing that they shall ask, it shall be done for them of my Father which is in heaven.” — Matthew 18:19',
  });

  // Data states
  const [sermons, setSermons] = useState(INITIAL_SERMONS);
  const [events, setEvents] = useState([]);
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [prayerSearch, setPrayerSearch] = useState('');
  const [prayerCategoryFilter, setPrayerCategoryFilter] = useState('All');
  const [intercededPrayerIds, setIntercededPrayerIds] = useState(new Set());
  const [testimonies, setTestimonies] = useState(() => getStoredTestimonies());
  const [isTestimonyModalOpen, setIsTestimonyModalOpen] = useState(false);
  const [newTestimonyPrefix, setNewTestimonyPrefix] = useState('Brother');
  const [newTestimony, setNewTestimony] = useState({
    name: '',
    story: '',
    type: 'Miraculous Healing',
    location: 'Vattamalai'
  });

  // Ministries & Services collection state
  const [ministries, setMinistries] = useState(MINISTRIES_DATA);
  const [isMinistryModalOpen, setIsMinistryModalOpen] = useState(false);
  const [editingMinistryId, setEditingMinistryId] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [ministryForm, setMinistryForm] = useState({
    title: '',
    category: 'Weekly Prayer Gatherings',
    badge: 'Open to All',
    meeting_time: 'Fridays 10:00 AM – 02:00 PM',
    leader: 'Pastor P. Rajendran',
    tagline: 'Miracle & Healing Breakthrough',
    desc: '',
    image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'
  });

  const [donations, setDonations] = useState([]);
  const [donationSearch, setDonationSearch] = useState('');
  const [donationCauseFilter, setDonationCauseFilter] = useState('all');
  const [donationStatusFilter, setDonationStatusFilter] = useState('all');
  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState(null);
  const [isManualDonationModalOpen, setIsManualDonationModalOpen] = useState(false);
  const [manualDonationForm, setManualDonationForm] = useState({
    donor_name: '',
    email: '',
    phone: '',
    amount: '',
    cause: 'Tithes & General Offerings',
    payment_method: 'Cash / Sunday Offering',
    notes: ''
  });
  const [isSubmittingManualDonation, setIsSubmittingManualDonation] = useState(false);
  const [inquiries, setInquiries] = useState(() => getStoredInquiries());
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquirySubjectFilter, setInquirySubjectFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // New Sermon Modal State
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [newSermon, setNewSermon] = useState({
    title: '',
    speaker: siteForm.seniorPastor,
    date: new Date().toISOString().split('T')[0],
    series: 'Victorious Living Series',
    scripture: '',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    audio_url: '',
    duration: '45 mins',
    category: 'Sunday Worship',
    language: 'Tamil & English',
    summary: '',
    thumbnail: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'
  });

  // Event Modal State (Add & Edit)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:30 AM - 11:30 AM',
    location: 'Grace Victory Church Main Sanctuary',
    category: 'Sunday Worship',
    image_url: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80',
    featured: true,
    registration_required: false,
    extra_notices: [''],
    extra_info: '',
    highlights: ['Anointed Praise & Intercession', 'Fellowship Refreshments Included', 'All Are Cordially Welcome']
  });

  // Sync form with settings when settings change
  useEffect(() => {
    setSiteForm({
      churchName: settings.churchName,
      tamilName: settings.tamilName,
      seniorPastor: settings.seniorPastor,
      seniorPastorTitle: settings.seniorPastorTitle || "Founder & Senior Pastor",
      associatePastor: settings.associatePastor || "Pastor R. Franklin Rajendran",
      associatePastorTitle: settings.associatePastorTitle || "Youth Pastor & Administrator",
      phone: settings.phone,
      whatsappNumber: settings.whatsappNumber,
      email: settings.email || "contact@gracevictorychurch.org",
      adminNotificationEmail: settings.adminNotificationEmail || "madara05112001@gmail.com",
      address: settings.address,
      googleMapsEmbedUrl: settings.googleMapsEmbedUrl || "https://maps.google.com/maps?q=Grace%20Victory%20Church,%20Vattamalai,%20Tamil%20Nadu,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed",
      googleMapsLink: settings.googleMapsLink || "https://maps.google.com/?q=Grace+Victory+Church+Vattamalai+Tamil+Nadu+India",
      serviceTimings: settings.serviceTimings,
      wednesdayTiming: settings.wednesdayTiming || "07:00 PM – 08:30 PM",
      fridayTiming: settings.fridayTiming || "10:30 AM – 01:30 PM",
      yearBadge: settings.yearBadge,
      themeBadge: settings.themeBadge,
      tamilTheme: settings.tamilTheme,
      tagline: settings.tagline,
      verse: settings.verse,
      pastorImage: settings.pastorImage,
      associatePastorImage: settings.associatePastorImage || "/images/franklin.jpg",
      churchHallImage: settings.churchHallImage,
      upiId: settings.upiId,
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      branch: settings.branch,
      ifscCode: settings.ifscCode,
      razorpayKeyId: settings.razorpayKeyId || settings.razorpay_key_id || 'rzp_test_GVC1024Testing',
      razorpayKeySecret: settings.razorpayKeySecret || settings.razorpay_key_secret || 'gvcSecretKeyForTesting1024',
      sliderSpeedSeconds: settings.sliderSpeedSeconds || 3,
      featuredHomeTestimonyIds: settings.featuredHomeTestimonyIds || ['testimony-1', 'testimony-2', 'testimony-3'],
      churchStats: settings.churchStats || CHURCH_STATS,
      milestones: settings.milestones || DEFAULT_MILESTONES,
      coreBeliefs: settings.coreBeliefs || CORE_BELIEFS,
      leadershipTeam: settings.leadershipTeam || LEADERSHIP_TEAM,
      foundedYear: settings.foundedYear || '1998',
      pastorWelcomeBadge: settings.pastorWelcomeBadge || 'A Personal Word from Our Pastoral Leadership',
      pastorWelcomeTitle: settings.pastorWelcomeTitle || '“You Were Born to Walk in Divine Favor and Supernatural Victory!”',
      pastorWelcomeP1: settings.pastorWelcomeP1 || 'Beloved brother and sister, welcome to Grace Victory Church. For over 28 years, God has granted us the privilege of shepherding precious families across Vattamalai with love, truth, and the supernatural power of the Holy Spirit.',
      pastorWelcomeP2: settings.pastorWelcomeP2 || 'No matter what challenge, illness, or heartbreak you are carrying today, our Lord Jesus Christ is alive and His grace is more than sufficient. We believe that when you step into our church, you will experience the tangible presence of God, deep fellowship, and supernatural peace.',
      pastorWelcomeQuote: settings.pastorWelcomeQuote || '“Together with our pastoral leadership and our youth pastor, Pastor R. Franklin Rajendran, we personally invite you to worship with us this Sunday. We look forward to welcoming you and your family!”',
      faqList: Array.isArray(settings.faqList) && settings.faqList.length > 0 ? settings.faqList : FAQ_LIST,
      swiftCode: settings.swiftCode || 'SBININBB492',
      givingVerse: settings.givingVerse || '“Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.” — Malachi 3:10',
      givingPresets: settings.givingPresets || '500, 1000, 2500, 5000, 10000',
      prayerWallVerse: settings.prayerWallVerse || '“Again I say unto you, That if two of you shall agree on earth as touching any thing that they shall ask, it shall be done for them of my Father which is in heaven.” — Matthew 18:19',
    });
  }, [settings]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const s = await fetchSermons();
      if (s && s.length > 0) setSermons(s);

      const e = await fetchEvents();
      if (Array.isArray(e)) setEvents(e);

      const p = await fetchAllPrayersAdmin();
      if (p && p.length > 0) setPrayers(p);

      const t = await fetchTestimonies();
      if (t && t.length > 0) setTestimonies(t);

      const m = await fetchMinistries();
      if (m && m.length > 0) setMinistries(m);

      const d = await fetchAllDonations();
      if (d) setDonations(d);

      const inq = await fetchInquiries();
      if (inq && Array.isArray(inq)) setInquiries(inq);
    } catch (err) {
      console.warn('Dashboard load fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();

    const handleInquiriesUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setInquiries(e.detail);
      } else {
        setInquiries(getStoredInquiries());
      }
    };
    window.addEventListener('gvc_inquiries_updated', handleInquiriesUpdate);

    const handleTestimoniesUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setTestimonies(e.detail);
      } else {
        setTestimonies(getStoredTestimonies());
      }
    };
    window.addEventListener('gvc_testimonies_updated', handleTestimoniesUpdate);

    const handleDonationsUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setDonations(e.detail);
      } else {
        setDonations(getStoredDonations());
      }
    };
    window.addEventListener('gvc_donations_updated', handleDonationsUpdate);

    return () => {
      window.removeEventListener('gvc_inquiries_updated', handleInquiriesUpdate);
      window.removeEventListener('gvc_testimonies_updated', handleTestimoniesUpdate);
      window.removeEventListener('gvc_donations_updated', handleDonationsUpdate);
    };
  }, []);

  const handleDeleteInquiry = async (id) => {
    if (window.confirm('Delete this inquiry? / இந்த தகவலை நீக்க வேண்டுமா?')) {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm('Delete this donation record? / இந்த நன்கொடை பதிவை நீக்க வேண்டுமா?')) {
      try {
        await deleteDonation(id);
        setDonations(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.warn('Delete donation error', err);
      }
    }
  };

  const handleToggleDonationStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Verified' ? 'Pending' : 'Verified';
    try {
      await updateDonationStatus(id, nextStatus);
      setDonations(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    } catch (err) {
      console.warn('Status update error', err);
    }
  };

  const handleExportDonationsCSV = () => {
    if (!donations || donations.length === 0) {
      alert('No donation records available to export.');
      return;
    }
    const headers = ['Receipt No', 'Donor Name', 'Amount (INR)', 'Cause / Purpose', 'Payment Method', 'Phone', 'Email', 'Transaction ID', 'Status', 'Date', 'Notes'];
    const rows = donations.map(d => [
      `"${d.receipt_number || ''}"`,
      `"${(d.donor_name || '').replace(/"/g, '""')}"`,
      d.amount || 0,
      `"${(d.cause || '').replace(/"/g, '""')}"`,
      `"${(d.payment_method || '').replace(/"/g, '""')}"`,
      `"${(d.phone || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.transaction_id || '').replace(/"/g, '""')}"`,
      `"${d.status || 'Completed'}"`,
      `"${d.created_at ? new Date(d.created_at).toLocaleString() : ''}"`,
      `"${(d.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GVC_Donations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualDonation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!manualDonationForm.donor_name || !manualDonationForm.amount) {
      alert('Please fill in Donor Name and Offering Amount.');
      return;
    }
    setIsSubmittingManualDonation(true);
    try {
      const created = await submitDonation({
        donor_name: manualDonationForm.donor_name.trim(),
        email: manualDonationForm.email.trim() || 'church.office@gracevictorychurch.org',
        phone: manualDonationForm.phone.trim(),
        amount: parseFloat(manualDonationForm.amount),
        cause: manualDonationForm.cause,
        payment_method: manualDonationForm.payment_method,
        notes: manualDonationForm.notes.trim() || 'Sunday Sanctuary Offering',
        status: 'Verified',
        transaction_id: `OFFLINE-${Date.now().toString().slice(-6)}`
      });
      setDonations(prev => [created, ...prev.filter(d => d.id !== created.id)]);
      setIsManualDonationModalOpen(false);
      setManualDonationForm({
        donor_name: '',
        email: '',
        phone: '',
        amount: '',
        cause: 'Tithes & General Offerings',
        payment_method: 'Cash / Sunday Offering',
        notes: ''
      });
    } catch (err) {
      alert('Failed to record offering. Please try again.');
    } finally {
      setIsSubmittingManualDonation(false);
    }
  };

  const handleSendWhatsAppThankYou = (donation) => {
    const cleanPhone = (donation.phone || '').replace(/[^0-9]/g, '');
    const donorName = donation.donor_name || 'Beloved in Christ';
    const amount = donation.amount ? `₹${parseFloat(donation.amount).toLocaleString('en-IN')}` : '';
    const cause = donation.cause || 'the Lord\'s ministry';
    const text = encodeURIComponent(
      `Dear ${donorName},\n\nGreetings in the precious name of our Lord and Saviour Jesus Christ! ✨\n\n` +
      `We gratefully acknowledge your generous offering of ${amount} towards ${cause} at Grace Victory Church (GVC).\n\n` +
      `Receipt No: ${donation.receipt_number || 'Official Record'}\n\n` +
      `"The Lord bless you and keep you; The Lord make His face shine upon you!" — Numbers 6:24-26\n\n` +
      `With prayers and blessings,\nPastor P. Rajendran & GVC Pastoral Team`
    );
    window.open(`https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : ''}?text=${text}`, '_blank');
  };

  const handleUpdateAuthCredentials = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthSaveStatus(null);
    if (!authForm.currentPassword) {
      setAuthSaveStatus({ success: false, message: 'Please enter your current password.' });
      return;
    }
    if (authForm.newPassword !== authForm.confirmPassword) {
      setAuthSaveStatus({ success: false, message: 'New password and confirm password do not match.' });
      return;
    }
    if (authForm.newPassword.length < 4) {
      setAuthSaveStatus({ success: false, message: 'New password must be at least 4 characters.' });
      return;
    }

    setAuthSaveLoading(true);
    try {
      const res = await fetch('/api/admin/auth/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: authForm.currentPassword,
          new_user_id: authForm.newUserId,
          new_password: authForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSaveStatus({ success: true, message: data.message || 'Credentials updated successfully in db.auth collection!' });
        setAuthForm({ currentPassword: '', newUserId: authForm.newUserId, newPassword: '', confirmPassword: '' });
      } else {
        setAuthSaveStatus({ success: false, message: data.detail || 'Failed to update credentials in db.auth' });
      }
    } catch (err) {
      setAuthSaveStatus({ success: false, message: 'Server communication error. Please try again.' });
    } finally {
      setAuthSaveLoading(false);
    }
  };

  const handleFaqChange = (index, field, value) => {
    const list = [...(siteForm.faqList || FAQ_LIST)];
    list[index] = { ...list[index], [field]: value };
    setSiteForm({ ...siteForm, faqList: list });
  };

  const handleAddFaq = () => {
    const list = [...(siteForm.faqList || FAQ_LIST)];
    list.push({ q: 'New Question for Church Visitors?', a: 'Provide the helpful answer here.' });
    setSiteForm({ ...siteForm, faqList: list });
  };

  const handleRemoveFaq = (index) => {
    const list = (siteForm.faqList || FAQ_LIST).filter((_, i) => i !== index);
    setSiteForm({ ...siteForm, faqList: list });
  };

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSettings(siteForm);
      setSettingsSaved(true);
      setSaveSuccess(true);
      setTimeout(() => {
        setSettingsSaved(false);
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Settings save failed:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleApplyAndRefresh = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings(siteForm);
      setSettingsSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err) {
      setIsSavingSettings(false);
    }
  };

  const handleCreateSermon = async (e) => {
    e.preventDefault();
    let finalThumbnail = newSermon.thumbnail;
    const match = newSermon.video_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      finalThumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    const sermonPayload = { ...newSermon, thumbnail: finalThumbnail };

    try {
      const created = await createSermon(sermonPayload);
      setSermons([created, ...sermons]);
      setIsSermonModalOpen(false);
      setNewSermon({
        title: '',
        speaker: siteForm.seniorPastor,
        date: new Date().toISOString().split('T')[0],
        series: 'கூடாரப் பண்டிகை பெருவிழா',
        scripture: '',
        video_url: '',
        audio_url: '',
        duration: '45 mins',
        category: 'கூடாரப் பண்டிகை',
        language: 'Tamil',
        summary: '',
        thumbnail: ''
      });
    } catch (err) {
      // Local fallback
      const localSermon = { ...sermonPayload, id: `sermon-${Date.now()}` };
      setSermons([localSermon, ...sermons]);
      setIsSermonModalOpen(false);
      setNewSermon({
        title: '',
        speaker: siteForm.seniorPastor,
        date: new Date().toISOString().split('T')[0],
        series: 'கூடாரப் பண்டிகை பெருவிழா',
        scripture: '',
        video_url: '',
        audio_url: '',
        duration: '45 mins',
        category: 'கூடாரப் பண்டிகை',
        language: 'Tamil',
        summary: '',
        thumbnail: ''
      });
    }
  };

  const handleDeleteSermon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sermon?')) return;
    try {
      await deleteSermon(id);
    } catch (err) {}
    setSermons(sermons.filter(s => s.id !== id));
  };

  const handleEventImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.8);
        setNewEvent(prev => ({ ...prev, image_url: compressed }));
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewEvent(prev => ({ ...prev, image_url: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '09:30 AM - 11:30 AM',
      location: 'Grace Victory Church Main Sanctuary',
      category: 'Sunday Worship',
      image_url: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80',
      featured: true,
      registration_required: false,
      extra_notices: [''],
      extra_info: '',
      highlights: ['Anointed Praise & Intercession', 'Fellowship Refreshments Included', 'All Are Cordially Welcome']
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt) => {
    setEditingEventId(evt.id);
    const existingNotices = getEventNotices(evt);
    setNewEvent({
      title: evt.title || '',
      description: evt.description || '',
      date: evt.date || '',
      time: evt.time || '09:30 AM - 11:30 AM',
      location: evt.location || 'Grace Victory Church Sanctuary',
      category: evt.category || 'Sunday Worship',
      image_url: evt.image_url || '',
      featured: evt.featured ?? true,
      registration_required: false,
      extra_notices: existingNotices.length > 0 ? existingNotices : [''],
      extra_info: evt.extra_info || '',
      highlights: Array.isArray(evt.highlights) && evt.highlights.length > 0 
        ? evt.highlights 
        : ['Anointed Praise & Intercession', 'Fellowship Refreshments Included', 'All Are Cordially Welcome']
    });
    setIsEventModalOpen(true);
  };

  const handleAddNoticeField = () => {
    setNewEvent(prev => ({
      ...prev,
      extra_notices: [...(prev.extra_notices || ['']), '']
    }));
  };

  const handleUpdateNotice = (idx, value) => {
    const list = [...(newEvent.extra_notices || [''])];
    list[idx] = value;
    setNewEvent(prev => ({
      ...prev,
      extra_notices: list,
      extra_info: list.filter(Boolean).join(' • ')
    }));
  };

  const handleRemoveNotice = (idx) => {
    const list = (newEvent.extra_notices || ['']).filter((_, i) => i !== idx);
    const finalList = list.length > 0 ? list : [''];
    setNewEvent(prev => ({
      ...prev,
      extra_notices: finalList,
      extra_info: finalList.filter(Boolean).join(' • ')
    }));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const cleanedNotices = (newEvent.extra_notices || []).map(s => (s || '').trim()).filter(Boolean);
    const payload = {
      ...newEvent,
      extra_notices: cleanedNotices,
      extra_info: cleanedNotices.join(' • ')
    };

    try {
      if (editingEventId) {
        const updated = await updateEvent(editingEventId, payload);
        setEvents(events.map(ev => ev.id === editingEventId ? { ...ev, ...updated } : ev));
      } else {
        const created = await createEvent(payload);
        setEvents([created, ...events]);
      }
      setIsEventModalOpen(false);
      setEditingEventId(null);
    } catch (err) {
      if (editingEventId) {
        setEvents(events.map(ev => ev.id === editingEventId ? { ...ev, ...payload } : ev));
      } else {
        const localEvent = { ...payload, id: `event-${Date.now()}` };
        setEvents([localEvent, ...events]);
      }
      setIsEventModalOpen(false);
      setEditingEventId(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
    } catch (err) {}
    setEvents(events.filter(e => e.id !== id));
  };

  const handleDeletePrayer = async (id) => {
    if (!window.confirm('Delete this prayer request?')) return;
    try {
      await deletePrayer(id);
    } catch (err) {
      console.warn('Error deleting prayer', err);
    }
    setPrayers(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteTestimony = async (id) => {
    if (!window.confirm('Delete this testimony? / இந்த சாட்சியை நீக்க வேண்டுமா?')) return;
    try {
      await deleteTestimony(id);
    } catch (err) {
      console.warn('Error deleting testimony', err);
    }
    setTestimonies(prev => prev.filter(t => t.id !== id));
    const currentFeatured = siteForm.featuredHomeTestimonyIds || settings.featuredHomeTestimonyIds || [];
    if (currentFeatured.map(String).includes(String(id))) {
      const updated = currentFeatured.filter(fid => String(fid) !== String(id));
      setSiteForm(prev => ({ ...prev, featuredHomeTestimonyIds: updated }));
      updateSettings({ featuredHomeTestimonyIds: updated });
    }
  };

  const toggleFeatureTestimonyOnHome = async (testimonyId) => {
    const currentFeatured = siteForm.featuredHomeTestimonyIds || settings.featuredHomeTestimonyIds || ['testimony-1', 'testimony-2', 'testimony-3'];
    const idStr = String(testimonyId);
    let updated;
    if (currentFeatured.map(String).includes(idStr)) {
      // Unselect from Home
      updated = currentFeatured.filter(id => String(id) !== idStr);
    } else {
      // Add to Home (sliding window: if 3 already selected, replace the oldest one)
      if (currentFeatured.length >= 3) {
        updated = [...currentFeatured.slice(1), idStr];
      } else {
        updated = [...currentFeatured, idStr];
      }
    }
    const updatedForm = { ...siteForm, featuredHomeTestimonyIds: updated };
    setSiteForm(updatedForm);
    await updateSettings({ featuredHomeTestimonyIds: updated });
    try {
      await toggleTestimonyHomeFeature(testimonyId);
    } catch (e) {}
  };

  const handleCreateTestimony = async (e) => {
    e.preventDefault();
    try {
      const cleanName = newTestimony.name.trim();
      const formattedName = cleanName.toLowerCase().startsWith(newTestimonyPrefix.toLowerCase())
        ? cleanName
        : `${newTestimonyPrefix} ${cleanName}`;
      const payload = { ...newTestimony, name: formattedName };
      const res = await submitTestimony(payload);
      setTestimonies(prev => [res, ...prev]);
      setIsTestimonyModalOpen(false);
      setNewTestimony({ name: '', story: '', type: 'Miraculous Healing', location: 'Vattamalai' });
    } catch (err) {
      alert('Failed to add testimony: ' + err.message);
    }
  };

  // Ministries & Services Management Handlers
  const PRESET_MINISTRY_CATEGORIES = [
    'Weekly Prayer Gatherings',
    'Fasting Prayer',
    'Intercession',
    'Sunday Worship',
    'Youth',
    'Kids',
    'Women',
    'Men',
    'Worship & Media',
    'Outreach & Missions',
    'Special Revival Meeting'
  ];

  const handleOpenCreateMinistry = () => {
    setEditingMinistryId(null);
    setIsCustomCategory(false);
    setMinistryForm({
      title: '',
      category: 'Weekly Prayer Gatherings',
      badge: 'Open to All',
      meeting_time: 'Every Friday 10:00 AM – 02:00 PM',
      leader: 'Pastor P. Rajendran',
      tagline: 'Miracle & Healing Breakthrough',
      desc: '',
      image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'
    });
    setIsMinistryModalOpen(true);
  };

  const handleOpenEditMinistry = (m) => {
    setEditingMinistryId(m.id);
    const cat = m.category || 'Weekly Prayer Gatherings';
    const isCustom = !PRESET_MINISTRY_CATEGORIES.includes(cat);
    setIsCustomCategory(isCustom);
    setMinistryForm({
      title: m.title || '',
      category: cat,
      badge: m.badge || m.age || '',
      meeting_time: m.meeting_time || m.meetingTime || '',
      leader: m.leader || '',
      tagline: m.tagline || '',
      desc: m.desc || '',
      image: m.image || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'
    });
    setIsMinistryModalOpen(true);
  };

  const handleMinistryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 700, 0.8);
        setMinistryForm(prev => ({ ...prev, image: compressed }));
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMinistryForm(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveMinistry = async (e) => {
    e.preventDefault();
    try {
      if (editingMinistryId) {
        const updated = await updateMinistry(editingMinistryId, ministryForm);
        setMinistries(prev => prev.map(m => m.id === editingMinistryId ? { ...m, ...updated } : m));
      } else {
        const created = await createMinistry(ministryForm);
        setMinistries(prev => [created, ...prev]);
      }
      setIsMinistryModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      if (editingMinistryId) {
        setMinistries(prev => prev.map(m => m.id === editingMinistryId ? { ...m, ...ministryForm } : m));
      } else {
        const localItem = { ...ministryForm, id: `ministry-${Date.now()}` };
        setMinistries(prev => [localItem, ...prev]);
      }
      setIsMinistryModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleDeleteMinistry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ministry or prayer service?')) return;
    try {
      await deleteMinistry(id);
    } catch (err) {}
    setMinistries(prev => prev.filter(m => m.id !== id));
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.82);
        setSiteForm(prev => ({ ...prev, [field]: compressed }));
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSiteForm(prev => ({ ...prev, [field]: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // About Page Customizer Handlers
  const updateChurchStat = (index, field, value) => {
    const list = [...(siteForm.churchStats || CHURCH_STATS)];
    list[index] = { ...list[index], [field]: value };
    setSiteForm(prev => ({ ...prev, churchStats: list }));
  };

  const addChurchStat = () => {
    const list = [...(siteForm.churchStats || CHURCH_STATS), { value: '100+', label: 'New Metric', desc: 'Description of ministry impact.' }];
    setSiteForm(prev => ({ ...prev, churchStats: list }));
  };

  const deleteChurchStat = (index) => {
    const list = (siteForm.churchStats || CHURCH_STATS).filter((_, i) => i !== index);
    setSiteForm(prev => ({ ...prev, churchStats: list }));
  };

  const updateMilestone = (index, field, value) => {
    const list = [...(siteForm.milestones || DEFAULT_MILESTONES)];
    list[index] = { ...list[index], [field]: value };
    setSiteForm(prev => ({ ...prev, milestones: list }));
  };

  const addMilestone = () => {
    const list = [...(siteForm.milestones || DEFAULT_MILESTONES), { year: '2026', title: 'New Milestone Title', desc: "Description of God's faithfulness." }];
    setSiteForm(prev => ({ ...prev, milestones: list }));
  };

  const deleteMilestone = (index) => {
    const list = (siteForm.milestones || DEFAULT_MILESTONES).filter((_, i) => i !== index);
    setSiteForm(prev => ({ ...prev, milestones: list }));
  };

  const updateCoreBelief = (index, field, value) => {
    const list = [...(siteForm.coreBeliefs || CORE_BELIEFS)];
    list[index] = { ...list[index], [field]: value };
    setSiteForm(prev => ({ ...prev, coreBeliefs: list }));
  };

  const addCoreBelief = () => {
    const list = [...(siteForm.coreBeliefs || CORE_BELIEFS), { title: 'New Core Belief', verse: 'John 3:16', desc: 'Summary of Biblical doctrine and belief.' }];
    setSiteForm(prev => ({ ...prev, coreBeliefs: list }));
  };

  const deleteCoreBelief = (index) => {
    const list = (siteForm.coreBeliefs || CORE_BELIEFS).filter((_, i) => i !== index);
    setSiteForm(prev => ({ ...prev, coreBeliefs: list }));
  };

  const updateLeader = (index, field, value) => {
    const list = [...(siteForm.leadershipTeam || LEADERSHIP_TEAM)];
    list[index] = { ...list[index], [field]: value };
    setSiteForm(prev => ({ ...prev, leadershipTeam: list }));
  };

  const handleLeaderImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 0.8);
        updateLeader(index, 'image', compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updateLeader(index, 'image', reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const deleteLeaderImage = (index) => {
    updateLeader(index, 'image', '');
  };

  const addLeader = () => {
    const list = [...(siteForm.leadershipTeam || LEADERSHIP_TEAM), {
      name: 'New Pastor / Leader',
      role: 'Associate Pastor',
      bio: "Serving God's flock with dedication and grace.",
      image: ''
    }];
    setSiteForm(prev => ({ ...prev, leadershipTeam: list }));
  };

  const deleteLeader = (index) => {
    const list = (siteForm.leadershipTeam || LEADERSHIP_TEAM).filter((_, i) => i !== index);
    setSiteForm(prev => ({ ...prev, leadershipTeam: list }));
  };

  const moveLeader = (fromIndex, toIndex) => {
    const list = [...(siteForm.leadershipTeam || LEADERSHIP_TEAM)];
    if (toIndex < 0 || toIndex >= list.length) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setSiteForm(prev => ({ ...prev, leadershipTeam: list }));
  };

  const handleSaveAboutSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingAbout(true);
    setAboutSaveSuccess(false);

    try {
      // Compress any large data URLs in leadership team before saving
      const compressedLeaders = await Promise.all(
        (siteForm.leadershipTeam || []).map(async (leader) => {
          if (leader.image && typeof leader.image === 'string' && leader.image.startsWith('data:image/') && leader.image.length > 50000) {
            try {
              const comp = await compressImage(leader.image, 600, 0.8);
              return { ...leader, image: comp };
            } catch (err) {
              return leader;
            }
          }
          return leader;
        })
      );

      const payload = {
        ...siteForm,
        leadershipTeam: compressedLeaders,
      };

      setSiteForm(payload);
      await updateSettings(payload);

      setAboutSaveSuccess(true);
      setSaveSuccess(true);
      setTimeout(() => {
        setAboutSaveSuccess(false);
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Could not save settings: ' + (err.message || 'Please try again'));
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setDirectError('');
    setDirectSuccess('');
    setDirectLoading(true);
    try {
      const res = await loginAdmin({
        userId: directUserId.trim(),
        password: directPassword.trim()
      });
      if (!res.success) {
        setDirectError(res.message || 'Invalid User ID or Password. Access denied.');
      } else {
        setDirectPassword('');
      }
    } catch (err) {
      setDirectError('Authentication error. Please verify your credentials.');
    } finally {
      setDirectLoading(false);
    }
  };

  const handleDirectChangePassword = async (e) => {
    e.preventDefault();
    setDirectError('');
    setDirectSuccess('');
    if (authForm.newPassword !== authForm.confirmPassword) {
      setDirectError('New password and confirm password do not match.');
      return;
    }
    if (authForm.newPassword.length < 4) {
      setDirectError('New password must be at least 4 characters long.');
      return;
    }
    setDirectLoading(true);
    try {
      await changeAdminPassword({
        userId: directUserId.trim() || 'admin',
        currentPassword: directPassword.trim(),
        newPassword: authForm.newPassword.trim(),
        newUserId: directUserId.trim() || 'admin'
      });
      setDirectSuccess('✓ Password updated in db.auth! You can now log in.');
      setDirectPassword('');
      setAuthForm({ currentPassword: '', newUserId: directUserId, newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setDirectLockMode('login');
      }, 2500);
    } catch (err) {
      setDirectError(err.message || 'Failed to update password. Check current password.');
    } finally {
      setDirectLoading(false);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#071320]' : 'admin-bright-portal bg-[#F8FAFC]'}`}>
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            {directLockMode === 'changePassword' ? <Key className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>

          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block mb-1">
            {directLockMode === 'changePassword' ? 'Security & Credentials • db.auth' : 'GVC Church Administration'}
          </span>
          <h2 className="font-serif font-black text-2xl text-white mb-2">
            {directLockMode === 'changePassword' ? 'Change Admin Password' : 'Admin Access Required'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {directLockMode === 'changePassword' 
              ? 'Update your admin credentials stored in MongoDB auth collection.' 
              : 'Enter your authorized User ID and Password to access the content management system.'}
          </p>

          {directSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 mb-4 font-bold text-left animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{directSuccess}</span>
            </div>
          )}

          {directError && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800/60 mb-4 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{directError}</span>
            </div>
          )}

          {directLockMode === 'login' ? (
            <form onSubmit={handleDirectLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
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
                    value={directUserId}
                    onChange={(e) => {
                      setDirectUserId(e.target.value);
                      setDirectError('');
                    }}
                    placeholder="Enter User ID (e.g. admin)..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDirectLockMode('changePassword');
                      setDirectError('');
                      setDirectSuccess('');
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
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
                    type={showDirectPassword ? 'text' : 'password'}
                    required
                    value={directPassword}
                    onChange={(e) => {
                      setDirectPassword(e.target.value);
                      setDirectError('');
                    }}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectPassword(!showDirectPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showDirectPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={directLoading}
                className="w-full py-3.5 rounded-xl text-center text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <Key className="w-4 h-4" />
                <span>{directLoading ? 'Verifying Credentials...' : 'Unlock Admin Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleDirectChangePassword} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  User ID / Username
                </label>
                <input
                  type="text"
                  required
                  value={directUserId}
                  onChange={(e) => setDirectUserId(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={directPassword}
                  onChange={(e) => setDirectPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={authForm.newPassword}
                  onChange={(e) => setAuthForm({ ...authForm, newPassword: e.target.value })}
                  placeholder="Enter new strong password (min 4 chars)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={directLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>{directLoading ? 'Saving in db.auth...' : 'Save New Password in db.auth'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDirectLockMode('login');
                    setDirectError('');
                    setDirectSuccess('');
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
                >
                  &larr; Back to Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Shortcut: <kbd className="text-amber-400 font-mono font-bold">Ctrl+Shift+A</kbd></span>
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              Return to Website &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const TAB_CONFIG = {
    settings: {
      title: 'Church Identity & Contact Details',
      subtitle: 'Manage church names, pastoral leadership roles, telephone numbers, emails, and weekly timings',
      icon: Settings,
      category: 'IDENTITY & BRANDING'
    },
    media: {
      title: 'Photos & Background Banners',
      subtitle: 'Upload and customize hero banner, pastor portraits, and sanctuary backgrounds',
      icon: Image,
      category: 'MEDIA & ASSETS'
    },
    about: {
      title: 'About Page & Church History',
      subtitle: 'Manage founding milestone timeline, core beliefs, and leadership team profiles',
      icon: BookOpen,
      category: 'IDENTITY & BRANDING'
    },
    sermons: {
      title: 'Sermons & Video Library',
      subtitle: 'Publish, organize, and manage Sunday messages, YouTube video links, and study notes',
      icon: Video,
      category: 'PROGRAMS & MEDIA'
    },
    events: {
      title: 'Events Calendar & Gatherings',
      subtitle: 'Schedule upcoming special services, conventions, fasting prayer meetings, and fellowship events',
      icon: Calendar,
      category: 'PROGRAMS & MEDIA'
    },
    ministries: {
      title: 'Ministries & Church Services',
      subtitle: 'Manage church departments: Women\'s Fellowship, Youth Ministry, Fasting Prayer, and Sunday School',
      icon: Layers,
      category: 'PROGRAMS & MEDIA'
    },
    prayers: {
      title: 'Confidential Prayer Requests',
      subtitle: 'Private prayer requests submitted by church believers and online visitors for intercession',
      icon: Heart,
      category: 'PASTORAL CARE & INBOX'
    },
    testimonies: {
      title: 'Public Testimonies & Stories',
      subtitle: 'Review, approve, and select the 3 featured testimonies displayed on the website',
      icon: Sparkles,
      category: 'PASTORAL CARE & INBOX'
    },
    inquiries: {
      title: 'Contact Messages & Inquiries',
      subtitle: 'Messages sent via the "How Can We Serve You?" contact form with direct Gmail notification',
      icon: Mail,
      category: 'PASTORAL CARE & INBOX'
    },
    donations: {
      title: 'Donation & Giving Records',
      subtitle: 'Complete list of tithes, building fund offerings, and donor contributions with receipts and contact details',
      icon: Receipt,
      category: 'STEWARDSHIP'
    },
    giving: {
      title: 'Tithes, Offerings & UPI Details',
      subtitle: 'Update church bank account details, IFSC code, and direct UPI payment identifiers',
      icon: DollarSign,
      category: 'STEWARDSHIP'
    }
  };

  const currentTab = TAB_CONFIG[activeTab] || TAB_CONFIG['settings'];
  const CurrentIcon = currentTab.icon;

  const navGroups = [
    {
      group: 'IDENTITY & BRANDING',
      items: [
        { id: 'settings', label: 'Church & Contact Info', icon: Settings, count: null },
        { id: 'media', label: 'Photos & Backgrounds', icon: Image, count: null },
        { id: 'about', label: 'About Page & History', icon: BookOpen, count: null },
      ]
    },
    {
      group: 'PROGRAMS & MEDIA',
      items: [
        { id: 'sermons', label: 'Sermons & Media', icon: Video, count: sermons.length },
        { id: 'events', label: 'Events Calendar', icon: Calendar, count: events.length },
        { id: 'ministries', label: 'Ministries & Services', icon: Layers, count: ministries.length },
      ]
    },
    {
      group: 'PASTORAL CARE & INBOX',
      items: [
        { id: 'prayers', label: 'Prayer Requests', icon: Heart, count: prayers.length },
        { id: 'testimonies', label: 'Public Testimonies', icon: Sparkles, count: testimonies.length },
        { id: 'inquiries', label: 'Contact Inquiries', icon: Mail, count: inquiries.length },
      ]
    },
    {
      group: 'STEWARDSHIP',
      items: [
        { id: 'donations', label: 'Donation Records', icon: Receipt, count: donations.length },
        { id: 'giving', label: 'Giving & UPI Bank', icon: DollarSign, count: null },
      ]
    }
  ];

  return (
    <div className={`min-h-screen flex antialiased selection:bg-amber-500 selection:text-white ${
      isDarkMode ? 'bg-[#070F1E] text-slate-100' : 'admin-bright-portal bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR NAVIGATION
         ========================================================================= */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 xl:w-72 bg-[#0B1528] border-r border-slate-800/80 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out shrink-0 select-none shadow-2xl lg:shadow-none ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Church Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#091122]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-black text-sm text-white tracking-wide truncate">
                  {siteForm.churchName || 'Grace Victory Church'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                    Admin Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grouped Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                {group.group}
              </div>
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    data-active={isActive ? "true" : "false"}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer group text-left ${
                      isActive
                        ? 'active-nav-item bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 font-bold border-l-4 border-amber-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ItemIcon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.count !== null && item.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ml-2 ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : item.count > 0
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold'
                            : 'bg-slate-800 text-slate-500 font-medium'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User & System Box */}
        <div className="p-3 border-t border-slate-800/80 bg-[#091122] space-y-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">Admin</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">db.auth synced</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(true);
                setAuthSaveStatus(null);
              }}
              className="px-2.5 py-2 rounded-lg text-[11px] font-bold text-amber-300 hover:text-white bg-slate-800/70 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Change Admin Password"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 py-2 rounded-lg text-[11px] font-bold text-red-400 hover:text-white bg-slate-800/70 hover:bg-red-600/30 border border-red-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Logout from Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          <div className="pt-0.5 text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              Shortcut: <kbd className="font-mono text-amber-400/90 font-bold">Ctrl+Shift+A</kbd>
            </p>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070F1E] overflow-x-hidden">
        
        {/* Modern Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0B1528]/95 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-8 py-3.5 shadow-xl flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Page Title & Category */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90">
                  {currentTab.category}
                </span>
                <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                  Admin Dashboard
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-black text-white truncate flex items-center gap-2">
                <CurrentIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{currentTab.title}</span>
              </h2>
            </div>
          </div>

          {/* Quick Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Prayers shortcut */}
            <button
              onClick={() => setActiveTab('prayers')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'prayers'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-slate-700'
              }`}
              title="View confidential prayer requests"
            >
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>Prayers ({prayers.length})</span>
            </button>

            {/* Quick Inquiries shortcut */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
              title="View contact form messages"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Inquiries ({inquiries.length})</span>
            </button>

            {/* Quick Donations shortcut */}
            <button
              onClick={() => setActiveTab('donations')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'donations'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
              title="View giving & donation records"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Giving ({donations.length})</span>
            </button>

            {/* Bright / Dark Mode Theme Switcher */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isDarkMode 
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' 
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
              title={isDarkMode ? "Switch to Bright Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-amber-800" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Dark Mode' : 'Bright Mode'}</span>
            </button>

            {/* View Live Site Button */}
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
              target="_blank"
              rel="noopener noreferrer"
              title="Open public website in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View Site</span>
            </Link>

            {/* Top Bar Change Password Button */}
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(true);
                setAuthSaveStatus(null);
              }}
              className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white hover:bg-amber-500/20 border border-amber-500/30 transition-colors items-center gap-1.5 cursor-pointer shadow-sm"
              title="Change Admin Password"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </button>

            {/* Top Bar Logout Button */}
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/30 border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Subtitle / Description bar */}
        <div className="px-4 sm:px-8 py-2 bg-[#091122] border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <p className="truncate text-slate-400 text-[11px] sm:text-xs">
            {currentTab.subtitle}
          </p>
          <div className="hidden lg:flex items-center gap-2 shrink-0 text-[11px] text-slate-500">
            <span>Database:</span>
            <span className="font-semibold text-amber-400 font-mono">MongoDB Atlas</span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1">
        
        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold text-sm">
                All changes have been successfully saved and published live to the website!
              </span>
            </div>
            <Link to="/" className="text-xs font-bold underline hover:text-white">
              View on live site &rarr;
            </Link>
          </div>
        )}

        {/* =========================================================================
            TAB 1: LIVE CHURCH INFORMATION & CONTACT EDITOR
           ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
            <div>
              <h2 className="font-serif font-black text-2xl text-white mb-2 flex items-center gap-2">
                <Settings className="w-6 h-6 text-amber-400" />
                <span>Live Church Identity & Contact Details</span>
              </h2>
              <p className="text-xs text-slate-400">
                Any changes made here will immediately update across all pages (Banner, Header, Footer, and Contact sections).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Church Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={siteForm.churchName}
                    onChange={(e) => setSiteForm({ ...siteForm, churchName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Church Name (Tamil)
                  </label>
                  <input
                    type="text"
                    value={siteForm.tamilName}
                    onChange={(e) => setSiteForm({ ...siteForm, tamilName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Founded Year (Established)
                  </label>
                  <input
                    type="text"
                    value={siteForm.foundedYear || '1998'}
                    onChange={(e) => setSiteForm({ ...siteForm, foundedYear: e.target.value })}
                    placeholder="1998"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Senior Pastor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={siteForm.seniorPastor}
                    onChange={(e) => setSiteForm({ ...siteForm, seniorPastor: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Senior Pastor Title
                  </label>
                  <input
                    type="text"
                    value={siteForm.seniorPastorTitle}
                    onChange={(e) => setSiteForm({ ...siteForm, seniorPastorTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                    placeholder="Founder & Senior Pastor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Second Pastor Name (Elder Son)
                  </label>
                  <input
                    type="text"
                    value={siteForm.associatePastor}
                    onChange={(e) => setSiteForm({ ...siteForm, associatePastor: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                    placeholder="Pastor R. Samuel Rajendran"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Second Pastor Role / Title
                  </label>
                  <input
                    type="text"
                    value={siteForm.associatePastorTitle}
                    onChange={(e) => setSiteForm({ ...siteForm, associatePastorTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                    placeholder="Associate Pastor & Administrator"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Phone / Helpline Number
                  </label>
                  <input
                    type="text"
                    required
                    value={siteForm.phone}
                    onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={siteForm.whatsappNumber}
                    onChange={(e) => setSiteForm({ ...siteForm, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Church Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    value={siteForm.address}
                    onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Church Public Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={siteForm.email || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })}
                    placeholder="contact@gracevictorychurch.org"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Public church email displayed on Contact page.
                  </span>
                </div>
              </div>

              {/* GOOGLE MAPS LOCATION & EMBED LINK */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Google Maps Location & Live Embed Link</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Controls the interactive Google Map and directions button on the Contact & Visit page.
                    </p>
                  </div>
                  {siteForm.googleMapsLink && (
                    <a
                      href={siteForm.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Test Map Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Google Maps Embed Iframe URL
                    </label>
                    <input
                      type="text"
                      value={siteForm.googleMapsEmbedUrl || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, googleMapsEmbedUrl: e.target.value })}
                      placeholder="https://maps.google.com/maps?q=Grace%20Victory%20Church...&output=embed"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Embed URL for interactive map iframe display.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Direct Google Maps App / Directions Link
                    </label>
                    <input
                      type="text"
                      value={siteForm.googleMapsLink || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, googleMapsLink: e.target.value })}
                      placeholder="https://maps.google.com/?q=Grace+Victory+Church+Vattamalai"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Opened when users click "Get Directions" or "Open in Maps".
                    </span>
                  </div>
                </div>

                {/* Live Admin Preview of the Map */}
                {siteForm.googleMapsEmbedUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Live Map Preview (Contact Page Display):
                    </span>
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <iframe
                        title="Admin Map Preview"
                        src={siteForm.googleMapsEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE ADMIN ALERT & NOTIFICATION EMAIL */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Notification "To" Email (Gmail Alerts Recipient)</span>
                  </label>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                    To: {siteForm.adminNotificationEmail || 'madara05112001@gmail.com'}
                  </span>
                </div>
                <input
                  type="email"
                  required
                  value={siteForm.adminNotificationEmail || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, adminNotificationEmail: e.target.value })}
                  placeholder="madara05112001@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-amber-500/60 text-white text-sm focus:outline-none focus:border-amber-400 font-mono font-bold"
                />
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  🔔 <strong>Gmail Alerts 'To' Email:</strong> Prayer Request, Testimony, மற்றும் Contact Form ("How Can We Serve You?") வழியாக அனுப்பப்படும் அனைத்து செய்திகளும் எந்த ஜிமெயிலுக்கு (To Email) செல்ல வேண்டும் என்பதை நீங்கள் இங்கே Update செய்து கொள்ளலாம்.
                </p>
              </div>

              {/* Service Timings (Displayed on Contact page & Schedule Cards) */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Service Timings (Live on Contact Page & Timetable)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Sunday Worship Service *
                    </label>
                    <input
                      type="text"
                      required
                      value={siteForm.serviceTimings || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, serviceTimings: e.target.value })}
                      placeholder="09:30 AM – 11:30 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Wednesday Bible Study
                    </label>
                    <input
                      type="text"
                      value={siteForm.wednesdayTiming || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, wednesdayTiming: e.target.value })}
                      placeholder="07:00 PM – 08:30 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Friday Fasting Prayer
                    </label>
                    <input
                      type="text"
                      value={siteForm.fridayTiming || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, fridayTiming: e.target.value })}
                      placeholder="10:30 AM – 01:30 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Year (Banner Badge)
                  </label>
                  <input
                    type="text"
                    value={siteForm.yearBadge}
                    onChange={(e) => setSiteForm({ ...siteForm, yearBadge: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Annual Theme Badge
                  </label>
                  <input
                    type="text"
                    value={siteForm.themeBadge}
                    onChange={(e) => setSiteForm({ ...siteForm, themeBadge: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Tamil Theme Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteForm.tamilTheme}
                    onChange={(e) => setSiteForm({ ...siteForm, tamilTheme: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Scripture Verse (Hero & Footer)
                </label>
                <input
                  type="text"
                  value={siteForm.verse}
                  onChange={(e) => setSiteForm({ ...siteForm, verse: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* HERO SLIDER AUTO-SWITCH SPEED CUSTOMIZER */}
              <div className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-400/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Hero Slider Auto-Switch Speed (Seconds)</span>
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      எத்தனை வினாடிக்கு ஒருமுறை Hero Slide தானாக மாற வேண்டும்? (Slider switch interval in seconds)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-lg font-black text-slate-950 px-3.5 py-1 rounded-xl bg-amber-400 shadow-lg">
                      {siteForm.sliderSpeedSeconds || 3}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={siteForm.sliderSpeedSeconds || 3}
                    onChange={(e) => setSiteForm({ ...siteForm, sliderSpeedSeconds: Math.max(1, Number(e.target.value)) })}
                    className="flex-1 accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={siteForm.sliderSpeedSeconds || 3}
                      onChange={(e) => setSiteForm({ ...siteForm, sliderSpeedSeconds: Math.max(1, Number(e.target.value)) })}
                      className="w-20 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-center text-sm focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-slate-400 font-bold">Sec</span>
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
                  {[2, 3, 4, 5, 7, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSiteForm({ ...siteForm, sliderSpeedSeconds: sec })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        Number(siteForm.sliderSpeedSeconds || 3) === sec
                          ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold scale-105'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sec}s {sec === 3 ? '★ Recommended' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Senior Pastor's Welcome Message Section (Homepage) */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Homepage Senior Pastor's Welcome Message
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Update the welcome greeting and pastoral message displayed prominently on the homepage.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Section Badge / Subtitle
                    </label>
                    <input
                      type="text"
                      value={siteForm.pastorWelcomeBadge || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, pastorWelcomeBadge: e.target.value })}
                      placeholder="Welcome to Grace Victory Church • போதகரின் வாழ்த்துச் செய்தி"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Welcome Headline / Title
                    </label>
                    <input
                      type="text"
                      value={siteForm.pastorWelcomeTitle || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, pastorWelcomeTitle: e.target.value })}
                      placeholder="A Personal Welcome from Our Senior Pastor"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Welcome Paragraph 1
                  </label>
                  <textarea
                    rows={3}
                    value={siteForm.pastorWelcomeP1 || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, pastorWelcomeP1: e.target.value })}
                    placeholder="First paragraph of pastor's welcome..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Welcome Paragraph 2
                  </label>
                  <textarea
                    rows={3}
                    value={siteForm.pastorWelcomeP2 || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, pastorWelcomeP2: e.target.value })}
                    placeholder="Second paragraph of pastor's welcome..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Closing Quote / Pastoral Blessing
                  </label>
                  <textarea
                    rows={2}
                    value={siteForm.pastorWelcomeQuote || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, pastorWelcomeQuote: e.target.value })}
                    placeholder="“No matter where you are on your spiritual journey, you have a place and a family waiting for you here.”"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none resize-y"
                  />
                </div>
              </div>

              {/* Homepage Visitor FAQs (Inline Interactive Editor) */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Homepage Frequently Asked Questions (FAQs)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage the questions and answers displayed in the visitor FAQ accordion on the homepage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors self-start cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(siteForm.faqList && siteForm.faqList.length > 0 ? siteForm.faqList : FAQ_LIST).map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          FAQ #{idx + 1}
                        </span>
                        {(siteForm.faqList || FAQ_LIST).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Remove this FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Question</label>
                        <input
                          type="text"
                          value={faq.q || ''}
                          onChange={(e) => handleFaqChange(idx, 'q', e.target.value)}
                          placeholder="e.g. What should I expect on my first visit?"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Answer</label>
                        <textarea
                          rows={2}
                          value={faq.a || ''}
                          onChange={(e) => handleFaqChange(idx, 'a', e.target.value)}
                          placeholder="Answer for visitors..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prayer Wall Scripture Verse */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Prayer Wall Header Scripture Verse
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Scripture verse shown at the top of the Prayer & Testimonies page.
                </p>
                <textarea
                  rows={2}
                  value={siteForm.prayerWallVerse || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, prayerWallVerse: e.target.value })}
                  placeholder="“Again I say unto you, That if two of you shall agree on earth...”"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none resize-y"
                />
              </div>

              <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className={`px-8 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-xl cursor-pointer ${
                    settingsSaved
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : isSavingSettings
                      ? 'bg-amber-600 text-slate-950 opacity-80 cursor-wait'
                      : 'text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-amber-400/20 active:scale-95'
                  }`}
                >
                  {isSavingSettings ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Saving Changes...</span>
                    </>
                  ) : settingsSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span>Saved Live!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-slate-950" />
                      <span>Save All Changes Live</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleApplyAndRefresh}
                  disabled={isSavingSettings}
                  className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-200 hover:text-white bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${isSavingSettings ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                  <span>Apply & Refresh Page</span>
                </button>

                {settingsSaved && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-xl animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Settings Saved Live! (Slider speed: {siteForm.sliderSpeedSeconds || 3}s)</span>
                  </div>
                )}
              </div>

            </form>

            {/* ADMIN AUTH CREDENTIALS MANAGER (db.auth collection) */}
            <div className="pt-8 border-t border-slate-800">
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                        <span>Database Collection: db.auth • அட்மின் பாதுகாப்பு & உள்நுழைவு</span>
                      </div>
                      <h3 className="font-serif font-black text-xl text-white">
                        Admin Authentication & Credentials
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Manage the User ID and Password stored in MongoDB <code className="text-amber-300 font-mono">db.auth</code> collection. Both are required to unlock the Admin Portal.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateAuthCredentials} className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Admin User ID / Username *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={authForm.newUserId}
                          onChange={(e) => setAuthForm({ ...authForm, newUserId: e.target.value })}
                          placeholder="e.g. admin or gvcadmin"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Stored as user_id in db.auth</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Key className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          required
                          value={authForm.currentPassword}
                          onChange={(e) => setAuthForm({ ...authForm, currentPassword: e.target.value })}
                          placeholder="Enter current password to authorize change..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Required for security verification</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={authForm.newPassword}
                        onChange={(e) => setAuthForm({ ...authForm, newPassword: e.target.value })}
                        placeholder="Enter new strong password..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  {authSaveStatus && (
                    <div className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
                      authSaveStatus.success 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                        : 'bg-red-950/40 border-red-800/60 text-red-400 font-semibold'
                    }`}>
                      {authSaveStatus.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
                      <span>{authSaveStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authSaveLoading}
                    className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{authSaveLoading ? 'Updating in db.auth...' : 'Update Admin Credentials in db.auth'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: IMAGES & MEDIA MANAGER (CHANGE PASTOR PHOTO & BACKGROUND)
           ========================================================================= */}
        {activeTab === 'media' && (
          <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
            <div>
              <h2 className="font-serif font-black text-2xl text-white mb-2 flex items-center gap-2">
                <Image className="w-6 h-6 text-amber-400" />
                <span>Photos & Visual Assets Customizer</span>
              </h2>
              <p className="text-xs text-slate-400">
                Update the Senior Pastor photo or Church Sanctuary background image. Changes apply immediately to the website!
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* 1. Senior Pastor Photo Customizer */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Senior Pastor Picture
                    </span>
                    <span className="text-[10px] text-slate-400">Pastor P. Rajendran</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-950 border border-amber-400/40 shrink-0 shadow-lg">
                      <img 
                        src={siteForm.pastorImage} 
                        alt="Pastor Preview" 
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { e.target.src = '/images/pastor.jpg'; }}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="block text-[11px] font-medium text-slate-300">
                        Image File or Online URL
                      </label>
                      <input
                        type="text"
                        value={siteForm.pastorImage}
                        onChange={(e) => setSiteForm({ ...siteForm, pastorImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400"
                        placeholder="/images/pastor.jpg"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <label className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>Upload Device</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'pastorImage')} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setSiteForm({ ...siteForm, pastorImage: '/images/pastor.jpg' })}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Second Pastor Photo Customizer (Elder Son) */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Second Pastor Picture
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold">Elder Son</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-950 border border-amber-400/40 shrink-0 shadow-lg">
                      <img 
                        src={siteForm.associatePastorImage} 
                        alt="Youth Pastor Preview" 
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { e.target.src = '/images/franklin.jpg'; }}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="block text-[11px] font-medium text-slate-300">
                        Image File or Online URL
                      </label>
                      <input
                        type="text"
                        value={siteForm.associatePastorImage}
                        onChange={(e) => setSiteForm({ ...siteForm, associatePastorImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400"
                        placeholder="/images/franklin.jpg"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <label className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>Upload Device</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'associatePastorImage')} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setSiteForm({ ...siteForm, associatePastorImage: '/images/franklin.jpg' })}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Church Sanctuary Photo Customizer */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Church Sanctuary Hall Photo
                    </span>
                    <span className="text-[10px] text-slate-400">Banner Shadow</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-28 h-24 rounded-2xl overflow-hidden bg-slate-950 border border-amber-400/40 shrink-0 shadow-lg">
                      <img 
                        src={siteForm.churchHallImage} 
                        alt="Sanctuary Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/images/church_hall.jpg'; }}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="block text-[11px] font-medium text-slate-300">
                        Image File or Online URL
                      </label>
                      <input
                        type="text"
                        value={siteForm.churchHallImage}
                        onChange={(e) => setSiteForm({ ...siteForm, churchHallImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400"
                        placeholder="/images/church_hall.jpg"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <label className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>Upload Device</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'churchHallImage')} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setSiteForm({ ...siteForm, churchHallImage: '/images/church_hall.jpg' })}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Media Changes Live</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* =========================================================================
            TAB: ABOUT & HERITAGE CUSTOMIZER
           ========================================================================= */}
        {activeTab === 'about' && (
          <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="font-serif font-black text-2xl text-white mb-2 flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  <span>About Us Page & Heritage Customizer</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Update ministry statistics counts, timeline milestones, statement of faith beliefs, and pastoral leadership team (including photo upload/delete).
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingAbout}
                onClick={handleSaveAboutSettings}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xl ${
                  aboutSaveSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : isSavingAbout
                    ? 'bg-amber-600 text-slate-950 opacity-80 cursor-wait'
                    : 'text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-amber-400/20'
                }`}
              >
                {isSavingAbout ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : aboutSaveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Saved Live!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Changes Live</span>
                  </>
                )}
              </button>
            </div>

            {/* 1. MINISTRY COUNTS & METRICS */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                    <span>1. Ministry Counts & Metrics (Top Banner Cards)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Displayed prominently on the top-right of the About Us page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addChurchStat}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(siteForm.churchStats || CHURCH_STATS).map((stat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Card #{idx + 1}
                      </span>
                      {(siteForm.churchStats || CHURCH_STATS).length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteChurchStat(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete metric card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Number / Count Value (e.g. 28+, 3,500+)
                        </label>
                        <input
                          type="text"
                          value={stat.value || ''}
                          onChange={(e) => updateChurchStat(idx, 'value', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-amber-400"
                          placeholder="28+"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Label / Title (e.g. Years of Ministry)
                        </label>
                        <input
                          type="text"
                          value={stat.label || ''}
                          onChange={(e) => updateChurchStat(idx, 'label', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-amber-400"
                          placeholder="Years of Ministry"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={stat.desc || ''}
                        onChange={(e) => updateChurchStat(idx, 'desc', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:border-amber-400"
                        placeholder="Faithful service in Vattamalai since 1998."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. MILESTONES OF GOD'S FAITHFULNESS */}
            <div className="space-y-6 border-t border-slate-800/80 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                    <span>2. Milestones of God’s Faithfulness (Timeline)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chronological history points displayed on the About Us page journey.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-4">
                {(siteForm.milestones || DEFAULT_MILESTONES).map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Milestone #{idx + 1}
                      </span>
                      {(siteForm.milestones || DEFAULT_MILESTONES).length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteMilestone(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Year / Era (e.g. 1998, 2004, Today)
                        </label>
                        <input
                          type="text"
                          value={m.year || ''}
                          onChange={(e) => updateMilestone(idx, 'year', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs focus:border-amber-400"
                          placeholder="1998"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Milestone Title
                        </label>
                        <input
                          type="text"
                          value={m.title || ''}
                          onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:border-amber-400"
                          placeholder="The Humble Beginning"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Description / History Story
                      </label>
                      <textarea
                        rows={2}
                        value={m.desc || ''}
                        onChange={(e) => updateMilestone(idx, 'desc', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:border-amber-400"
                        placeholder="Pastor P. Rajendran responded to God's call..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. WHAT WE BELIEVE (CORE BELIEFS) */}
            <div className="space-y-6 border-t border-slate-800/80 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                    <span>3. What We Believe (Statement of Faith)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scriptural foundations and core doctrines shown in cards on the About page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCoreBelief}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Statement</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(siteForm.coreBeliefs || CORE_BELIEFS).map((belief, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Statement #{idx + 1}
                      </span>
                      {(siteForm.coreBeliefs || CORE_BELIEFS).length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteCoreBelief(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete belief"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Scripture Verse (e.g. 2 Timothy 3:16)
                        </label>
                        <input
                          type="text"
                          value={belief.verse || ''}
                          onChange={(e) => updateCoreBelief(idx, 'verse', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs font-bold focus:border-amber-400"
                          placeholder="2 Timothy 3:16"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Title / Doctrine (e.g. The Holy Scriptures)
                        </label>
                        <input
                          type="text"
                          value={belief.title || ''}
                          onChange={(e) => updateCoreBelief(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-amber-400"
                          placeholder="The Holy Scriptures"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Belief Statement / Explanation
                      </label>
                      <textarea
                        rows={2}
                        value={belief.desc || ''}
                        onChange={(e) => updateCoreBelief(idx, 'desc', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:border-amber-400"
                        placeholder="We believe the Holy Bible is the inspired..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. PASTORAL LEADERSHIP TEAM */}
            <div className="space-y-6 border-t border-slate-800/80 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                    <span>4. Pastoral Leadership Team (Add / Update / Delete Photos & Leaders)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload or delete photos, update names, designations, and bios for leadership members.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLeader}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Leader</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(siteForm.leadershipTeam || LEADERSHIP_TEAM).map((leader, idx) => (
                  <div key={idx} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between relative group">
                    <div className="space-y-4">
                      
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                          Leader #{idx + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveLeader(idx, idx - 1)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Move card up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                          {idx < (siteForm.leadershipTeam || LEADERSHIP_TEAM).length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveLeader(idx, idx + 1)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Move card down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                          {(siteForm.leadershipTeam || LEADERSHIP_TEAM).length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteLeader(idx)}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-1"
                              title="Remove leader"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Photo Section with Add/Upload/Update/Delete Photo */}
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-2">
                          Leader Picture
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-950 border border-amber-400/40 shrink-0 shadow-md relative group/pic">
                            {leader.image ? (
                              <img 
                                src={leader.image} 
                                alt={leader.name || 'Leader'} 
                                className="w-full h-full object-cover object-top"
                                onError={(e) => { e.target.src = '/images/pastor.jpg'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                                <Users className="w-8 h-8 opacity-40 mb-1" />
                                <span className="text-[9px] uppercase font-bold text-slate-500">No Photo</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap gap-1.5">
                              {/* Upload / Update Button */}
                              <label className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors">
                                <Upload className="w-3 h-3" />
                                <span>{leader.image ? 'Change Photo' : 'Upload Photo'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleLeaderImageUpload(idx, e)} 
                                  className="hidden" 
                                />
                              </label>

                              {/* Delete Photo Button */}
                              {leader.image && (
                                <button
                                  type="button"
                                  onClick={() => deleteLeaderImage(idx)}
                                  className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Delete photo"
                                >
                                  Delete Photo
                                </button>
                              )}
                            </div>

                            {/* Image URL text fallback */}
                            <input
                              type="text"
                              value={leader.image || ''}
                              onChange={(e) => updateLeader(idx, 'image', e.target.value)}
                              placeholder="Or paste image URL"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono focus:border-amber-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Name & Role Inputs */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={leader.name || ''}
                            onChange={(e) => updateLeader(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-amber-400"
                            placeholder="Pastor P. Rajendran"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Role / Ministry Designation
                          </label>
                          <input
                            type="text"
                            value={leader.role || ''}
                            onChange={(e) => updateLeader(idx, 'role', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-medium text-xs focus:border-amber-400"
                            placeholder="Founder & Senior Pastor"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Biography & Ministry Calling
                          </label>
                          <textarea
                            rows={3}
                            value={leader.bio || ''}
                            onChange={(e) => updateLeader(idx, 'bio', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs leading-relaxed focus:border-amber-400"
                            placeholder="Serving with dedication..."
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Save Section with In-Place Feedback */}
            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {aboutSaveSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-xl animate-in fade-in">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <span>All changes, team members & photos saved successfully!</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Click below to compress photos, save changes, and publish live to the website.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={isSavingAbout}
                onClick={handleSaveAboutSettings}
                className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl ${
                  aboutSaveSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                    : isSavingAbout
                    ? 'bg-amber-600 text-slate-950 opacity-80 cursor-wait'
                    : 'text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-amber-400/20 active:scale-95'
                }`}
              >
                {isSavingAbout ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Compressing & Saving Changes...</span>
                  </>
                ) : aboutSaveSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-white" />
                    <span>Saved & Published Live!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save All About Page Changes Live</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 3: SERMONS CRUD
           ========================================================================= */}
        {activeTab === 'sermons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">
                  Sermons & Video Messages ({sermons.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Add, edit, or delete preachings and Sunday messages.
                </p>
              </div>

              <button
                onClick={() => setIsSermonModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Sermon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sermons.map((s) => (
                <div key={s.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-video bg-slate-900">
                      <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400">
                        {s.duration}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        {s.series || 'Sunday Worship'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-white line-clamp-1">
                        {s.title}
                      </h4>
                      <p className="text-xs text-slate-400">Speaker: {s.speaker}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{s.summary}</p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{s.date}</span>
                    <button
                      onClick={() => handleDeleteSermon(s.id)}
                      className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600/30 transition-colors"
                      title="Delete Sermon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: EVENTS CRUD
           ========================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">
                  Church Events & Conferences ({events.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Publish upcoming services, retreats, youth camps, and revival meetings.
                </p>
              </div>

              <button
                onClick={handleOpenAddEvent}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Event</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
                <Calendar className="w-10 h-10 text-amber-500/70 mx-auto mb-3" />
                <p className="text-sm text-slate-300 font-semibold mb-1">No Church Events Currently Scheduled</p>
                <p className="text-xs text-slate-500 mb-4">When no events are scheduled, the website hero section displays only the 1 main Church & Pastors slide.</p>
                <button
                  onClick={handleOpenAddEvent}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Event</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((e) => (
                <div key={e.id} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg flex gap-4 items-start justify-between">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img 
                      src={e.image_url || 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80'} 
                      alt={e.title}
                      className="w-full h-full object-cover"
                      onError={(ev) => { ev.target.src = 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80'; }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        {e.category}
                      </span>
                      {isEventActive(e) ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Live on Site</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          <span>Expired (Hidden from Site)</span>
                        </span>
                      )}
                      {e.featured && (
                        <span className="text-[10px] text-amber-400 font-bold">★ Featured</span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base text-white truncate">
                      {e.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{formatEventDisplayDate(e.date)} • {e.time}</span>
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {e.description}
                    </p>

                    {/* Special Notices (Multiple) */}
                    {getEventNotices(e).length > 0 && (
                      <div className="flex flex-col gap-1 pt-1">
                        {getEventNotices(e).map((n, nIdx) => (
                          <div key={nIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold max-w-full">
                            <span className="shrink-0">🍽️</span>
                            <span className="truncate">{n}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Highlights chips */}
                    {Array.isArray(e.highlights) && e.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {e.highlights.map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditEvent(e)}
                      className="p-2.5 rounded-xl text-amber-400 hover:text-white hover:bg-amber-500/20 transition-colors cursor-pointer"
                      title="Edit Event & Food/Highlights Info"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="p-2.5 rounded-xl text-red-400 hover:text-white hover:bg-red-600/30 transition-colors cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: CONFIDENTIAL PRAYER REQUESTS INBOX
           ========================================================================= */}
        {activeTab === 'prayers' && (
          <div className="space-y-6">
            
            {/* Header with Title and Confidentiality Badge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Confidential Pastoral Inbox • ரகசிய ஜெப விண்ணப்பங்கள்</span>
                </div>
                <h2 className="font-serif font-black text-2xl text-white">
                  Prayer Petitions & Intercession ({prayers.length})
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  These requests are submitted privately by believers and visitors. They are not displayed on the public website and are accessible strictly to Pastor P. Rajendran and authorized pastoral staff.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 font-bold text-xs border border-amber-500/20 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{prayers.length} Received</span>
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{intercededPrayerIds.size} Interceded</span>
                </span>
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by petitioner name or prayer keywords..."
                  value={prayerSearch}
                  onChange={(e) => setPrayerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Healing', 'Family', 'Career', 'Salvation'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPrayerCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      prayerCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Prayer Requests Cards List */}
            {(() => {
              const filtered = prayers.filter((p) => {
                const matchesSearch = !prayerSearch || 
                  p.name?.toLowerCase().includes(prayerSearch.toLowerCase()) || 
                  p.request?.toLowerCase().includes(prayerSearch.toLowerCase()) ||
                  p.category?.toLowerCase().includes(prayerSearch.toLowerCase());
                const matchesCategory = prayerCategoryFilter === 'All' || 
                  p.category?.toLowerCase().includes(prayerCategoryFilter.toLowerCase());
                return matchesSearch && matchesCategory;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
                    <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="font-serif font-bold text-lg text-white">No Prayer Requests Found</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {prayerSearch || prayerCategoryFilter !== 'All' 
                        ? 'Try adjusting your search or category filter.' 
                        : 'Any new prayer request submitted by website visitors will appear here securely.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((p) => {
                    const isInterceded = intercededPrayerIds.has(p.id);
                    return (
                      <div 
                        key={p.id} 
                        className={`p-6 rounded-2xl border transition-all ${
                          isInterceded 
                            ? 'bg-slate-950/70 border-emerald-900/40' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
                              {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-white text-sm font-serif">{p.name || 'Anonymous Petitioner'}</strong>
                                {p.is_anonymous && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                                    Anonymous
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Private Submission'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                              {p.category || 'General Prayer Need'}
                            </span>
                            {isInterceded && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Interceded</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Prayer Request Body Quote */}
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 mb-4">
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            “{p.request}”
                          </p>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Confidential • Not visible on public website</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIntercededPrayerIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(p.id)) next.delete(p.id);
                                  else next.add(p.id);
                                  return next;
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                                isInterceded
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                              }`}
                            >
                              <CheckCircle className={`w-3.5 h-3.5 ${isInterceded ? 'text-emerald-400' : 'text-slate-400'}`} />
                              <span>{isInterceded ? 'Prayed Over ✓' : 'Mark as Interceded'}</span>
                            </button>

                            <button
                              onClick={() => handleDeletePrayer(p.id)}
                              className="px-3 py-1.5 text-red-400 hover:text-white hover:bg-red-600/30 border border-red-500/20 rounded-xl transition-colors flex items-center gap-1"
                              title="Delete Prayer Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        )}

        {/* =========================================================================
            TAB 6: TESTIMONIES COLLECTION (PUBLIC WEBSITE DISPLAY)
           ========================================================================= */}
        {activeTab === 'testimonies' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Public Website Display • திருச்சபை சாட்சிகள்</span>
                </div>
                <h2 className="font-serif font-black text-2xl text-white">
                  Testimonies Collection ({testimonies.length})
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  These testimonies are displayed publicly on the website to glorify Jesus and encourage believers. You can add new testimonies, delete them, and choose exactly which 3 are featured on the Home page.
                </p>
              </div>

              <button
                onClick={() => setIsTestimonyModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Add New Testimony</span>
              </button>
            </div>

            {/* HOME PAGE FEATURED 3 SELECTOR PANEL */}
            {(() => {
              const currentFeatured = siteForm.featuredHomeTestimonyIds || settings.featuredHomeTestimonyIds || ['testimony-1', 'testimony-2', 'testimony-3'];
              const activeFeaturedItems = currentFeatured
                .map(id => testimonies.find(t => String(t.id) === String(id) || String(t._id) === String(id)))
                .filter(Boolean);

              return (
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                          <span>Home Page Featured Testimonies</span>
                          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                            {activeFeaturedItems.length}/3 Selected
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Admin can choose which 3 testimonies show on the Home page. The full list is shown in normal order on the Prayer & Testimonies page.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-400 mr-1">Currently on Home:</span>
                    {activeFeaturedItems.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs shadow-sm"
                      >
                        <span className="font-black text-amber-400">Slot #{idx + 1}:</span>
                        <span className="font-bold truncate max-w-[140px] text-white">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleFeatureTestimonyOnHome(item.id)}
                          className="p-1 hover:bg-amber-500/30 rounded-lg text-amber-300 hover:text-white transition-colors"
                          title="Remove from Home page"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {activeFeaturedItems.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No custom selection yet (showing latest 3 by default).</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Testimonies Grid in Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonies.map((t) => {
                const currentFeatured = siteForm.featuredHomeTestimonyIds || settings.featuredHomeTestimonyIds || ['testimony-1', 'testimony-2', 'testimony-3'];
                const isFeatured = currentFeatured.map(String).includes(String(t.id));
                const featuredSlot = currentFeatured.map(String).indexOf(String(t.id));

                return (
                  <div 
                    key={t.id} 
                    className={`bg-slate-950 p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                      isFeatured 
                        ? 'border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          {t.type || 'Miraculous Healing'}
                        </span>
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                            <Star className="w-2.5 h-2.5 fill-slate-950" />
                            <span>Home Slot #{featuredSlot + 1}</span>
                          </span>
                        )}
                        {!isFeatured && (
                          <span className="text-[11px] text-slate-400">{t.date || 'Recent'}</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
                        “{t.story}”
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-white text-xs block font-serif">{t.name}</strong>
                          <span className="text-[10px] text-slate-500">{t.location || 'Vattamalai'} • {t.date || 'Testimony'}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteTestimony(t.id)}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-600/30 rounded-xl transition-colors cursor-pointer"
                          title="Delete Testimony"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Home Page Featured Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleFeatureTestimonyOnHome(t.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isFeatured 
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                        <span>
                          {isFeatured 
                            ? `Featured on Home (Slot #${featuredSlot + 1}) — Click to Remove` 
                            : '+ Feature on Home Page'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB: MINISTRIES & PRAYER SERVICES (MONGODB COLLECTION)
           ========================================================================= */}
        {activeTab === 'ministries' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>MongoDB Collection: db.ministries • திருச்சபை ஊழியங்கள் & ஜெப கூட்டங்கள்</span>
                </div>
                <h2 className="font-serif font-black text-2xl text-white">
                  Church Ministries & Prayer Services ({ministries.length})
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Manage Friday Miracle & Fasting Prayer, Wednesday Intercessory Bible Study, Sunday worship, youth gatherings, and all departmental ministries. You can add new prayer gatherings, update schedules and anointed descriptions, or delete them.
                </p>
              </div>

              <button
                onClick={handleOpenCreateMinistry}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Add Ministry / Prayer Service</span>
              </button>
            </div>

            {/* Ministries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministries.map((m) => (
                <div 
                  key={m.id} 
                  className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-900">
                    <img 
                      src={m.image || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'} 
                      alt={m.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold shadow">
                        {m.badge || m.age || 'Open to All'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] font-bold border border-slate-700">
                        {m.category || 'Ministry'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white mb-1">
                        {m.title}
                      </h3>
                      {m.tagline && (
                        <p className="text-xs text-amber-400 font-semibold mb-2 italic">
                          “{m.tagline}”
                        </p>
                      )}
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                        {m.desc}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-300 pt-3 border-t border-slate-900">
                        {(m.meeting_time || m.meetingTime) && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{m.meeting_time || m.meetingTime}</span>
                          </div>
                        )}
                        {m.leader && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Leader: <strong className="text-white">{m.leader}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-900 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditMinistry(m)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMinistry(m.id)}
                        className="px-3 py-1.5 rounded-xl text-red-400 hover:text-white hover:bg-red-600/30 border border-red-500/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Delete Ministry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB: DONATION & GIVING RECORDS
           ========================================================================= */}
        {activeTab === 'donations' && (() => {
          const totalDonationsAmount = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
          const totalDonorsCount = new Set(donations.map(d => (d.donor_name || '').trim().toLowerCase()).filter(Boolean)).size;
          const avgDonation = donations.length > 0 ? Math.round(totalDonationsAmount / donations.length) : 0;
          
          const filteredDonations = donations.filter(d => {
            const query = donationSearch.trim().toLowerCase();
            const matchesSearch = !query || 
              (d.donor_name && d.donor_name.toLowerCase().includes(query)) ||
              (d.phone && d.phone.toLowerCase().includes(query)) ||
              (d.email && d.email.toLowerCase().includes(query)) ||
              (d.receipt_number && d.receipt_number.toLowerCase().includes(query)) ||
              (d.transaction_id && d.transaction_id.toLowerCase().includes(query)) ||
              (d.notes && d.notes.toLowerCase().includes(query));

            const matchesCause = donationCauseFilter === 'all' || 
              (d.cause && d.cause.toLowerCase().includes(donationCauseFilter.toLowerCase()));

            const matchesStatus = donationStatusFilter === 'all' || 
              (d.status && d.status.toLowerCase() === donationStatusFilter.toLowerCase());

            return matchesSearch && matchesCause && matchesStatus;
          });

          return (
            <div className={`p-6 sm:p-10 rounded-3xl border space-y-8 transition-colors ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-white shadow-2xl' 
                : 'bg-white border-slate-200 text-slate-900 shadow-[0_4px_25px_rgba(0,0,0,0.05)]'
            }`}>
              {/* Header with Title and Action Buttons */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <h2 className={`font-serif font-black text-2xl mb-1.5 flex items-center gap-2.5 ${
                    isDarkMode ? 'text-white' : 'text-slate-950'
                  }`}>
                    <Receipt className="w-6 h-6 text-amber-500" />
                    <span>Church Donation & Giving Records ({donations.length})</span>
                  </h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Real-time list of all tithes, mission offerings, and sanctuary building contributions stored in MongoDB <code className="text-amber-600 font-mono font-bold">db.donations</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsManualDonationModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer font-sans"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Sunday Offering</span>
                  </button>

                  <button
                    onClick={handleExportDonationsCSV}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700' 
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                    }`}
                    title="Export giving records as CSV for Excel / Accounting"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={loadAll}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-white bg-slate-900 border-slate-800 hover:border-slate-700' 
                        : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                    }`}
                    title="Refresh records from database"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Summary KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Giving */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/30' 
                    : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-white keep-text-white'}`}>
                      Total Giving Received
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-white/20 text-white keep-text-white'}`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-serif font-black text-2xl sm:text-3xl text-white keep-text-white">
                    ₹{totalDonationsAmount.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-white/95 keep-text-white'}`}>
                    Cumulative tithes & offerings
                  </span>
                </div>

                {/* Card 2: Contributions */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-white border-slate-200 shadow-sm text-slate-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Total Contributions
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`font-serif font-black text-2xl sm:text-3xl ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                    {donations.length}
                  </div>
                  <span className={`text-[10px] block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Stored in db.donations
                  </span>
                </div>

                {/* Card 3: Donors */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-white border-slate-200 shadow-sm text-slate-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-sky-400' : 'text-sky-700'}`}>
                      Generous Donors
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-50 text-sky-700'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`font-serif font-black text-2xl sm:text-3xl ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                    {totalDonorsCount}
                  </div>
                  <span className={`text-[10px] block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Individual supporters
                  </span>
                </div>

                {/* Card 4: Average */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-white border-slate-200 shadow-sm text-slate-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                      Average Offering
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`font-serif font-black text-2xl sm:text-3xl ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                    ₹{avgDonation.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Average per transaction
                  </span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    placeholder="Search by donor name, phone, email, receipt #, or notes..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white shadow-sm'
                    }`}
                  />
                  {donationSearch && (
                    <button
                      onClick={() => setDonationSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={donationCauseFilter}
                    onChange={(e) => setDonationCauseFilter(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-500 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-slate-300' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <option value="all">All Giving Causes</option>
                    <option value="Tithes">Tithes & General</option>
                    <option value="Sanctuary">Building Fund</option>
                    <option value="Missions">Village Missions</option>
                    <option value="Mercy">Mercy & Needy Care</option>
                    <option value="Children">Youth & Sunday School</option>
                  </select>

                  <select
                    value={donationStatusFilter}
                    onChange={(e) => setDonationStatusFilter(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-500 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-slate-300' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Verified">Verified / Completed</option>
                    <option value="Pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              {/* Donations List / Table */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between text-xs font-semibold px-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span>Showing {filteredDonations.length} of {donations.length} records</span>
                  <span>Sorted by Newest First</span>
                </div>

                {filteredDonations.length === 0 ? (
                  <div className={`p-12 text-center rounded-2xl border space-y-4 ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-serif font-bold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                        No Donation Records Found
                      </h4>
                      <p className={`text-xs max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {donationSearch || donationCauseFilter !== 'all' || donationStatusFilter !== 'all'
                          ? 'No results match your search filters. Try clearing your search.'
                          : 'No donations recorded yet. When donors give online via UPI or when you record Sunday offerings, they will appear here.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsManualDonationModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Sunday Offering</span>
                    </button>
                  </div>
                ) : (
                  <div className={`overflow-x-auto rounded-2xl border ${
                    isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white shadow-sm'
                  }`}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b ${
                          isDarkMode 
                            ? 'bg-slate-900/90 text-slate-400 border-slate-800' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 font-bold uppercase text-[10px] tracking-wider'
                        }`}>
                          <th className="p-3.5">Donor & Receipt</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Purpose / Cause</th>
                          <th className="p-3.5">Payment Method</th>
                          <th className="p-3.5">Contact Details</th>
                          <th className="p-3.5">Date & Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        isDarkMode ? 'divide-slate-800/60 bg-slate-950/60' : 'divide-slate-100 bg-white'
                      }`}>
                        {filteredDonations.map((item) => {
                          const isVerified = (item.status || 'Completed').toLowerCase() === 'verified' || (item.status || 'Completed').toLowerCase() === 'completed';
                          return (
                            <tr key={item.id} className={`transition-colors ${
                              isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-amber-50/40'
                            }`}>
                              {/* Donor & Receipt */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border-amber-500/30 text-amber-300' 
                                      : 'bg-gradient-to-tr from-amber-100 to-amber-200 border-amber-300 text-amber-900 shadow-sm'
                                  }`}>
                                    {(item.donor_name || 'G').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                                      {item.donor_name || 'Faithful Giver'}
                                    </div>
                                    <button
                                      onClick={() => setSelectedReceiptDonation(item)}
                                      className={`font-mono text-[10px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                                        isDarkMode ? 'text-amber-400/90 hover:text-amber-300' : 'text-amber-700 hover:text-amber-900'
                                      }`}
                                      title="Click to view printable receipt"
                                    >
                                      <span>{item.receipt_number || item.id}</span>
                                    </button>
                                    {item.notes && (
                                      <p className={`text-[11px] italic line-clamp-1 mt-0.5 ${
                                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                      }`} title={item.notes}>
                                        "{item.notes}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Amount */}
                              <td className="p-3.5 font-bold whitespace-nowrap">
                                <span className={`font-serif text-base font-black ${
                                  isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                                }`}>
                                  ₹{parseFloat(item.amount || 0).toLocaleString('en-IN')}
                                </span>
                              </td>

                              {/* Cause */}
                              <td className="p-3.5">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                                  isDarkMode 
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {item.cause || 'Tithes & General'}
                                </span>
                              </td>

                              {/* Payment Method */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <span className={`font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                                    {item.payment_method || 'UPI'}
                                  </span>
                                  {item.transaction_id && (
                                    <span className="font-mono text-[10px] text-slate-500 block">
                                      {item.transaction_id}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Contact Details */}
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  {item.phone && (
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <a href={`tel:${item.phone}`} className={`hover:underline font-medium ${
                                        isDarkMode ? 'text-slate-300' : 'text-slate-800'
                                      }`}>{item.phone}</a>
                                    </div>
                                  )}
                                  {item.email && (
                                    <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                      <Mail className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span className="truncate max-w-[150px]">{item.email}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Date & Status */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="space-y-1">
                                  <span className={`text-[11px] block font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                                  </span>
                                  <button
                                    onClick={() => handleToggleDonationStatus(item.id, item.status)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors cursor-pointer ${
                                      isVerified
                                        ? (isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100')
                                        : (isDarkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25' : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100')
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    {item.status || 'Verified'}
                                  </button>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View / Print Receipt */}
                                  <button
                                    onClick={() => setSelectedReceiptDonation(item)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isDarkMode 
                                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700' 
                                        : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200 shadow-sm'
                                    }`}
                                    title="View & Print Official Receipt"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                                  </button>

                                  {/* WhatsApp Thank You */}
                                  <button
                                    onClick={() => handleSendWhatsAppThankYou(item)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isDarkMode 
                                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm'
                                    }`}
                                    title="Send WhatsApp Pastoral Blessing & Thank You"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Record */}
                                  <button
                                    onClick={() => handleDeleteDonation(item.id)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      isDarkMode 
                                        ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' 
                                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* =========================================================================
            TAB: GIVING & BANK DETAILS
           ========================================================================= */}
        {activeTab === 'giving' && (
          <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl space-y-8 transition-colors ${
            isDarkMode 
              ? 'bg-slate-950 border-slate-800 text-white shadow-2xl' 
              : 'bg-white border-slate-200 text-slate-900 shadow-[0_4px_25px_rgba(0,0,0,0.05)]'
          }`}>
            <div>
              <h2 className={`font-serif font-black text-2xl mb-2 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-950'
              }`}>
                <DollarSign className="w-6 h-6 text-amber-500" />
                <span>Tithes, UPI & Bank Wire Settings</span>
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Edit the church UPI ID, bank account number, and branch details displayed on the Giving page.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Church UPI ID (GPay, PhonePe, Paytm)
                  </label>
                  <input
                    type="text"
                    value={siteForm.upiId}
                    onChange={(e) => setSiteForm({ ...siteForm, upiId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={siteForm.bankName}
                    onChange={(e) => setSiteForm({ ...siteForm, bankName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-sm'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={siteForm.accountNumber}
                    onChange={(e) => setSiteForm({ ...siteForm, accountNumber: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={siteForm.branch}
                    onChange={(e) => setSiteForm({ ...siteForm, branch: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={siteForm.ifscCode}
                    onChange={(e) => setSiteForm({ ...siteForm, ifscCode: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Bank SWIFT Code (International / Wire)
                  </label>
                  <input
                    type="text"
                    value={siteForm.swiftCode || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, swiftCode: e.target.value })}
                    placeholder="e.g. SBININBB492"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Giving Page Custom Scripture Verse & Preset Quick Select Amounts */}
              <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <h4 className={`font-serif font-bold text-sm flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-950'
                }`}>
                  <Heart className="w-4 h-4 text-amber-500" />
                  <span>Giving Page Scripture Verse & Donation Presets</span>
                </h4>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Giving Page Header Scripture Verse
                  </label>
                  <textarea
                    rows={2}
                    value={siteForm.givingVerse || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, givingVerse: e.target.value })}
                    placeholder="“Bring ye all the tithes into the storehouse...” — Malachi 3:10"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:border-amber-400 focus:outline-none resize-y transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Quick Select Preset Amounts (₹ Comma-Separated)
                  </label>
                  <input
                    type="text"
                    value={siteForm.givingPresets || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, givingPresets: e.target.value })}
                    placeholder="500, 1000, 2500, 5000, 10000"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Donors can click these instant pills or enter any custom amount they wish.
                  </p>
                </div>
              </div>

              {/* Payment Gateway Configuration: 100% Automated Bank Success Verification */}
              <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
                isDarkMode 
                  ? 'bg-slate-900/90 border-slate-800 text-white' 
                  : 'bg-amber-50/40 border-amber-200 text-slate-900'
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                  isDarkMode ? 'border-slate-800/80' : 'border-amber-200/80'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/20 text-amber-700'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`font-serif font-bold text-sm flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-950'
                      }`}>
                        <span>Razorpay Automated Bank Verification Gateway</span>
                      </h4>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        When enabled, payments from Google Pay, PhonePe, Paytm, and Cards will only be saved in MongoDB after bank confirms SUCCESS.
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    siteForm.razorpayKeyId && siteForm.razorpayKeyId.startsWith('rzp_live')
                      ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                  }`}>
                    {siteForm.razorpayKeyId && siteForm.razorpayKeyId.startsWith('rzp_live') ? '● Live Production Gateway' : '● Test Simulator Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Razorpay Key ID (rzp_test_... or rzp_live_...)
                    </label>
                    <input
                      type="text"
                      value={siteForm.razorpayKeyId || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, razorpayKeyId: e.target.value })}
                      placeholder="rzp_test_..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-700 text-white' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-amber-500 shadow-sm'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Razorpay Key Secret (Bank Cryptographic Signature Secret)
                    </label>
                    <input
                      type="password"
                      value={siteForm.razorpayKeySecret || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, razorpayKeySecret: e.target.value })}
                      placeholder="Enter secret key..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono focus:border-amber-400 focus:outline-none transition-colors ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-700 text-white' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-amber-500 shadow-sm'
                      }`}
                    />
                  </div>
                </div>

                <p className={`text-[11px] italic ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                  💡 Tip: You can get these free API keys from your Razorpay Dashboard ➔ Settings ➔ API Keys. Test simulator is active by default.
                </p>
              </div>

              {/* Dynamic QR Code & UPI Link Live Test Preview */}
              {siteForm.upiId && (
                <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-500" />
                      <span>Live Donor UPI QR Code Preview (Generated for {siteForm.upiId})</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isDarkMode 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      Active on /giving
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                    <div className="w-36 h-36 p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${siteForm.upiId}&pn=${encodeURIComponent(siteForm.churchName || 'Grace Victory Church')}&cu=INR`)}`}
                        alt="Admin UPI Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                        When donors give online, scanning or clicking automatically pre-fills:
                      </p>
                      <ul className={`list-disc list-inside space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <li>Payee UPI ID: <strong className="text-amber-600 font-mono">{siteForm.upiId}</strong></li>
                        <li>Payee Name: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{siteForm.churchName}</strong></li>
                        <li>Dynamic Amount: (Prefilled based on donor selection)</li>
                        <li>Transaction Note: (Prefilled with Ministry category & custom prayer message)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Banking Info Live</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB: CONTACT INQUIRIES & MESSAGES ("HOW CAN WE SERVE YOU?")
           ========================================================================= */}
        {activeTab === 'inquiries' && (
          <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="font-serif font-black text-2xl text-white mb-1 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-amber-400" />
                  <span>Contact Form Inquiries ({inquiries.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Messages submitted by website visitors on the Contact Page ("HOW CAN WE SERVE YOU?").
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span className="font-semibold">Live Alert Sent to:</span>
                <span className="font-mono text-white font-bold">{siteForm.adminNotificationEmail || 'madara05112001@gmail.com'}</span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by sender name, email, phone or message..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={inquirySubjectFilter}
                  onChange={(e) => setInquirySubjectFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Subjects</option>
                  <option value="General Church Inquiry">General Church Inquiry</option>
                  <option value="Pastoral Counseling">Pastoral Counseling</option>
                  <option value="Baby Dedication / Baptism">Baby Dedication / Baptism</option>
                  <option value="Wedding / Funeral Booking">Wedding / Funeral</option>
                  <option value="Joining a Ministry Team">Joining a Ministry Team</option>
                  <option value="Prayer Request">Prayer Request</option>
                </select>
              </div>
            </div>

            {/* Inquiries List */}
            {(() => {
              const filtered = inquiries.filter(item => {
                const q = inquirySearch.toLowerCase();
                const matchQuery = !q || 
                  (item.name && item.name.toLowerCase().includes(q)) ||
                  (item.email && item.email.toLowerCase().includes(q)) ||
                  (item.phone && item.phone.toLowerCase().includes(q)) ||
                  (item.message && item.message.toLowerCase().includes(q)) ||
                  (item.subject && item.subject.toLowerCase().includes(q));
                const matchSubject = inquirySubjectFilter === 'All' || item.subject === inquirySubjectFilter;
                return matchQuery && matchSubject;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white text-sm">No Messages Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {inquiries.length === 0 
                        ? 'No inquiries submitted yet. When a visitor submits the "How Can We Serve You?" form on the Contact page, it will be logged here and emailed to ' + (siteForm.email || 'the church email') + '.'
                        : 'No inquiries match your current search and filter criteria.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((item, idx) => {
                    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
                    return (
                      <div 
                        key={item.id || idx} 
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
                              {(item.name || 'G')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-white">{item.name || 'Anonymous Visitor'}</h4>
                                {item.subject && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    {item.subject}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently received'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {item.email && (
                              <a
                                href={getGmailComposeUrl({
                                  to: item.email,
                                  subject: `Re: [Grace Victory Church] ${item.subject || 'Inquiry'}`,
                                  body: `Dear ${item.name || 'Friend'},\n\nThank you for reaching out to Grace Victory Church.\n\nRegarding your inquiry:\n"${item.message || ''}"\n\nWarm regards,\nGrace Victory Church Pastoral Team`
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                title="Reply directly via Gmail"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Reply (Gmail)</span>
                              </a>
                            )}
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(item.name || '')},%20greetings%20from%20Grace%20Victory%20Church!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                title="Reply on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteInquiry(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inquiry Body */}
                        <div className="text-xs text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
                          {item.message}
                        </div>

                        {/* Contact details footer */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                          {item.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-amber-400" />
                              <span className="text-slate-300 font-medium">{item.email}</span>
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span className="text-slate-300 font-medium">{item.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

      </main>
      </div>

      {/* =========================================================================
          MODAL: ADD NEW SERMON
         ========================================================================= */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-white">Add New Sermon</h3>
              <button onClick={() => setIsSermonModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSermon} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Sermon Title *</label>
                <input
                  type="text"
                  required
                  value={newSermon.title}
                  onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Walking in Faith"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Speaker *</label>
                  <input
                    type="text"
                    required
                    value={newSermon.speaker}
                    onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSermon.date}
                    onChange={(e) => setNewSermon({ ...newSermon, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Scripture Reference</label>
                <input
                  type="text"
                  value={newSermon.scripture}
                  onChange={(e) => setNewSermon({ ...newSermon, scripture: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Hebrews 11:1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category *</label>
                  <select
                    value={newSermon.category}
                    onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="கூடாரப் பண்டிகை">கூடாரப் பண்டிகை</option>
                    <option value="Sunday Worship">Sunday Worship</option>
                    <option value="Revival Night">Revival Night</option>
                    <option value="Family Sunday">Family Sunday</option>
                    <option value="Bible Study">Bible Study</option>
                    <option value="Youth Service">Youth Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Series</label>
                  <input
                    type="text"
                    value={newSermon.series}
                    onChange={(e) => setNewSermon({ ...newSermon, series: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="கூடாரப் பண்டிகை பெருவிழா"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">YouTube Video / Live Stream URL *</label>
                <input
                  type="url"
                  required
                  value={newSermon.video_url}
                  onChange={(e) => setNewSermon({ ...newSermon, video_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="https://www.youtube.com/live/..."
                />
                <span className="text-[10px] text-amber-400/80 mt-1 block">
                  YouTube Live stream or video link preview will be automatically extracted.
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Summary</label>
                <textarea
                  rows="3"
                  value={newSermon.summary}
                  onChange={(e) => setNewSermon({ ...newSermon, summary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Key message takeaways..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
              >
                Publish Sermon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT CHURCH EVENT
         ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-white">
                {editingEventId ? 'Edit Church Event' : 'Add Church Event'}
              </h3>
              <button 
                onClick={() => { setIsEventModalOpen(false); setEditingEventId(null); }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Annual Miracle Night"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                    <span>Date (Calendar Picker) *</span>
                    <span className="text-[10px] text-amber-400 font-normal">Day / Month / Year</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formatDateForInput(newEvent.date)}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs [color-scheme:dark] cursor-pointer focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  {newEvent.date && (
                    <p className="mt-1 text-[11px] text-amber-300 font-medium flex items-center gap-1">
                      <span>📅</span>
                      <span>Selected: {formatEventDisplayDate(newEvent.date)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Time</label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                    placeholder="09:30 AM - 11:30 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="Grace Victory Church Sanctuary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category *</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs font-semibold"
                  >
                    <option value="Sunday Worship">Sunday Worship</option>
                    <option value="Fasting & Prayer">Fasting & Prayer</option>
                    <option value="Revival & Miracle">Revival & Miracle</option>
                    <option value="Youth Gathering">Youth Gathering</option>
                    <option value="Special Conference">Special Conference</option>
                    <option value="Celebration">Celebration</option>
                    <option value="Prayer">Prayer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Event Poster / Banner Image</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="https://... or upload image"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEventImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {newEvent.image_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 w-36">
                    <img 
                      src={newEvent.image_url} 
                      alt="Event Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Describe the gathering, theme and invitation..."
                ></textarea>
              </div>

              {/* SPECIAL NOTICES & DETAILS SECTION (With + Add Details Button, NO suggestions) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="text-sm">🍽️</span>
                    <span>Special Notices / Additional Details (கூடுதல் தகவல்கள் / உணவு விவரம்)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddNoticeField}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Detail</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(newEvent.extra_notices || ['']).map((notice, nIdx) => (
                    <div key={nIdx} className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-bold w-4 text-center">{nIdx + 1}.</span>
                      <input
                        type="text"
                        value={notice}
                        onChange={(e) => handleUpdateNotice(nIdx, e.target.value)}
                        className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-100 placeholder-slate-500 text-xs focus:border-amber-400"
                        placeholder={
                          nIdx === 0
                            ? "e.g. Fellowship Lunch / அன்பு விருந்து ஏற்பாடு செய்யப்பட்டுள்ளது"
                            : nIdx === 1
                            ? "e.g. Free Transportation from Town"
                            : "e.g. Special Anointing Prayer for Families"
                        }
                      />
                      {(newEvent.extra_notices || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNotice(nIdx)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Remove this detail"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* KEY HIGHLIGHTS / BULLET POINTS (Shown on Slide 2 VIP card & Event cards) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Event Highlights & Features (நிகழ்ச்சி சிறப்பம்சங்கள் - Up to 3)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Slide 2 Bullet Points</span>
                </div>

                {[0, 1, 2].map((idx) => {
                  const currentHighlights = Array.isArray(newEvent.highlights) ? [...newEvent.highlights] : [];
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-bold w-4 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={currentHighlights[idx] || ''}
                        onChange={(e) => {
                          const updated = [...currentHighlights];
                          updated[idx] = e.target.value;
                          setNewEvent({ ...newEvent, highlights: updated.filter(Boolean) });
                        }}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        placeholder={
                          idx === 0 
                            ? "e.g. Anointed Praise & Intercession" 
                            : idx === 1 
                            ? "e.g. Fellowship Lunch / அன்பு விருந்து" 
                            : "e.g. All Are Cordially Welcome • Free Entry"
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer shadow-lg"
              >
                {editingEventId ? 'Update Event Changes' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW TESTIMONY
         ========================================================================= */}
      {isTestimonyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-white">Add Public Testimony</h3>
              <button onClick={() => setIsTestimonyModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTestimony} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Title & Believer Name *</label>
                <div className="flex gap-2">
                  <select
                    value={newTestimonyPrefix}
                    onChange={(e) => setNewTestimonyPrefix(e.target.value)}
                    className="w-28 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold"
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
                    value={newTestimony.name}
                    onChange={(e) => setNewTestimony({ ...newTestimony, name: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="e.g. Samuel / Priya & Family"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category *</label>
                  <select
                    value={newTestimony.type}
                    onChange={(e) => setNewTestimony({ ...newTestimony, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="Miraculous Healing">Miraculous Healing</option>
                    <option value="Life Transformation">Life Transformation</option>
                    <option value="Financial Breakthrough">Financial Breakthrough</option>
                    <option value="Family Peace">Family Peace</option>
                    <option value="Deliverance">Deliverance</option>
                    <option value="Thanksgiving">Thanksgiving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newTestimony.location}
                    onChange={(e) => setNewTestimony({ ...newTestimony, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="Vattamalai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Testimony Story *</label>
                <textarea
                  rows="4"
                  required
                  value={newTestimony.story}
                  onChange={(e) => setNewTestimony({ ...newTestimony, story: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Describe what Jesus did..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Publish Testimony
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT MINISTRY OR PRAYER SERVICE
         ========================================================================= */}
      {isMinistryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-white">
                {editingMinistryId ? 'Edit Ministry / Prayer Service' : 'Add New Ministry / Prayer Service'}
              </h3>
              <button 
                onClick={() => setIsMinistryModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMinistry} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Ministry or Prayer Title *</label>
                <input
                  type="text"
                  required
                  value={ministryForm.title}
                  onChange={(e) => setMinistryForm({ ...ministryForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="e.g. Friday Miracle & Fasting Prayer (வெள்ளி உபவாச ஜெபம்)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Category (பிரிவு) *</label>
                  <select
                    required
                    value={isCustomCategory ? '__custom__' : (ministryForm.category || 'Weekly Prayer Gatherings')}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                        setMinistryForm(prev => ({ ...prev, category: '' }));
                      } else {
                        setIsCustomCategory(false);
                        setMinistryForm(prev => ({ ...prev, category: e.target.value }));
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs font-semibold focus:border-amber-400"
                  >
                    <option value="Weekly Prayer Gatherings">Weekly Prayer Gatherings (வாராந்திர ஜெபங்கள்)</option>
                    <option value="Fasting Prayer">Fasting Prayer (வெள்ளி உபவாச ஜெபம்)</option>
                    <option value="Intercession">Intercession & Bible Study (புதன் உபதேச ஜெபம்)</option>
                    <option value="Sunday Worship">Sunday Worship (ஞாயிறு ஆராதனை)</option>
                    <option value="Youth">Youth Movement (வாலிபர் ஊழியம்)</option>
                    <option value="Kids">Kids Church (சிறுவர் ஊழியம்)</option>
                    <option value="Women">Women of Worth (பெண்கள் ஊழியம்)</option>
                    <option value="Men">Men of Honor (ஆண்கள் ஊழியம்)</option>
                    <option value="Worship & Media">Worship & Media (ஆராதனை & மீடியா)</option>
                    <option value="Outreach & Missions">Outreach & Missions (சமூகப்பணி)</option>
                    <option value="Special Revival Meeting">Special Revival Meeting (எழுப்புதல் கூட்டம்)</option>
                    <option value="__custom__">✏️ Custom / Other Category...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      required
                      autoFocus
                      value={ministryForm.category}
                      onChange={(e) => setMinistryForm({ ...ministryForm, category: e.target.value })}
                      className="w-full p-2.5 mt-2 rounded-xl bg-slate-900 border border-amber-400 text-white text-xs placeholder-slate-500"
                      placeholder="Type custom category name..."
                    />
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-slate-300">Target / Age Badge</label>
                    <span className="text-[10px] text-slate-500">Quick list</span>
                  </div>
                  <input
                    type="text"
                    list="ministry-badge-suggestions"
                    value={ministryForm.badge}
                    onChange={(e) => setMinistryForm({ ...ministryForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="e.g. Open to All / Every Friday"
                  />
                  <datalist id="ministry-badge-suggestions">
                    <option value="Open to All" />
                    <option value="Every Friday" />
                    <option value="Mid-Week Service" />
                    <option value="All Believers" />
                    <option value="Teens & Young Adults (Ages 13 – 28)" />
                    <option value="Ages 3 – 12" />
                    <option value="All Women & Mothers" />
                    <option value="All Men & Fathers" />
                    <option value="Musicians & Tech" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Meeting Time / Days</label>
                  <input
                    type="text"
                    value={ministryForm.meeting_time}
                    onChange={(e) => setMinistryForm({ ...ministryForm, meeting_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="Every Friday 10:00 AM – 02:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Ministry Leader / In-charge</label>
                  <input
                    type="text"
                    value={ministryForm.leader}
                    onChange={(e) => setMinistryForm({ ...ministryForm, leader: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="Pastor P. Rajendran"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Spiritual Tagline / Theme</label>
                <input
                  type="text"
                  value={ministryForm.tagline}
                  onChange={(e) => setMinistryForm({ ...ministryForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Miracle & Healing Breakthrough"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Description & Purpose *</label>
                <textarea
                  rows="4"
                  required
                  value={ministryForm.desc}
                  onChange={(e) => setMinistryForm({ ...ministryForm, desc: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  placeholder="Describe the anointing, scriptures, and spiritual mission of this gathering..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Cover Image URL or Upload</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ministryForm.image}
                    onChange={(e) => setMinistryForm({ ...ministryForm, image: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    placeholder="https://... or upload photo"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMinistryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {ministryForm.image && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 w-32">
                    <img 
                      src={ministryForm.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer mt-4"
              >
                {editingMinistryId ? 'Update Ministry Live' : 'Save Ministry Live to Database'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHANGE ADMIN PASSWORD (db.auth collection)
         ========================================================================= */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-950 rounded-3xl border border-amber-500/30 p-5 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Change Admin Password
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono block">Database: db.auth collection</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChangePasswordModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAuthCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin User ID
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={authForm.newUserId}
                    onChange={(e) => setAuthForm({ ...authForm, newUserId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={authForm.currentPassword}
                    onChange={(e) => setAuthForm({ ...authForm, currentPassword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="Enter current password..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={authForm.newPassword}
                    onChange={(e) => setAuthForm({ ...authForm, newPassword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="Enter new password (min 4 chars)..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="Re-enter new password..."
                />
              </div>

              {authSaveStatus && (
                <div className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
                  authSaveStatus.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                    : 'bg-red-950/40 border-red-800/60 text-red-400 font-semibold'
                }`}>
                  {authSaveStatus.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
                  <span>{authSaveStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSaveLoading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Key className="w-4 h-4" />
                <span>{authSaveLoading ? 'Saving in db.auth...' : 'Save New Password in db.auth'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW & PRINT OFFICIAL DONATION RECEIPT
         ========================================================================= */}
      {selectedReceiptDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl border border-slate-300 p-5 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-6 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-950">Official Giving Receipt</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Grace Victory Church Stewardship</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptDonation(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Certificate Box */}
            <div id="printable-receipt" className="p-6 rounded-2xl bg-amber-50/40 border-2 border-amber-200/80 space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-amber-200">
                <h4 className="font-serif font-black text-lg text-amber-950 tracking-tight">
                  {settings.churchName || 'GRACE VICTORY CHURCH'}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {settings.address || 'Vattamalai, Tamil Nadu, India'}
                </p>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-mono text-[10px] font-bold">
                  Receipt No: {selectedReceiptDonation.receipt_number || selectedReceiptDonation.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Donor Name</span>
                  <strong className="text-slate-900 text-sm font-serif">{selectedReceiptDonation.donor_name || 'Faithful Giver'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Date & Time</span>
                  <span className="text-slate-700 font-medium">
                    {selectedReceiptDonation.created_at ? new Date(selectedReceiptDonation.created_at).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Purpose / Cause</span>
                  <strong className="text-amber-900">{selectedReceiptDonation.cause || 'Tithes & Offerings'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Payment Mode</span>
                  <span className="text-slate-700 font-medium">{selectedReceiptDonation.payment_method || 'UPI'}</span>
                </div>

                {selectedReceiptDonation.phone && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Phone / WhatsApp</span>
                    <span className="text-slate-700">{selectedReceiptDonation.phone}</span>
                  </div>
                )}
                {selectedReceiptDonation.transaction_id && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">TXN Reference</span>
                    <span className="text-slate-700 font-mono text-[10px]">{selectedReceiptDonation.transaction_id}</span>
                  </div>
                )}
              </div>

              {selectedReceiptDonation.notes && (
                <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Personal Prayer / Purpose Note:</span>
                  <p className="text-slate-700 italic mt-0.5">"{selectedReceiptDonation.notes}"</p>
                </div>
              )}

              {/* Amount Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">Amount Contributed</span>
                  <span className="text-xs opacity-90">Official Church Record</span>
                </div>
                <div className="font-serif font-black text-2xl sm:text-3xl">
                  ₹{parseFloat(selectedReceiptDonation.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-500 pt-1 italic">
                “Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.” — 2 Cor 9:7
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setSelectedReceiptDonation(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsAppThankYou(selectedReceiptDonation)}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD MANUAL SUNDAY OFFERING
         ========================================================================= */}
      {isManualDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-5 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-6 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Record Sunday Offering</h3>
                  <span className="text-[10px] text-slate-400">Manual Church Sanctuary / Cash Entry</span>
                </div>
              </div>
              <button
                onClick={() => setIsManualDonationModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualDonation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Donor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualDonationForm.donor_name}
                  onChange={(e) => setManualDonationForm({ ...manualDonationForm, donor_name: e.target.value })}
                  placeholder="e.g. Bro. David / Sis. Mary"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualDonationForm.amount}
                    onChange={(e) => setManualDonationForm({ ...manualDonationForm, amount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={manualDonationForm.payment_method}
                    onChange={(e) => setManualDonationForm({ ...manualDonationForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Cash / Sunday Offering">Cash / Sanctuary</option>
                    <option value="UPI (Direct)">UPI Direct</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ministry Cause / Purpose
                </label>
                <select
                  value={manualDonationForm.cause}
                  onChange={(e) => setManualDonationForm({ ...manualDonationForm, cause: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Tithes & General Offerings">Tithes & General Offerings</option>
                  <option value="Sanctuary Expansion & Building Fund">Sanctuary Expansion & Building Fund</option>
                  <option value="Village Missions & Church Planting">Village Missions & Church Planting</option>
                  <option value="Mercy Ministries & Needy Care">Mercy Ministries & Needy Care</option>
                  <option value="Children & Youth VBS">Children & Youth VBS</option>
                  <option value="Special Thanksgiving Offering">Special Thanksgiving Offering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={manualDonationForm.phone}
                    onChange={(e) => setManualDonationForm({ ...manualDonationForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualDonationForm.email}
                    onChange={(e) => setManualDonationForm({ ...manualDonationForm, email: e.target.value })}
                    placeholder="donor@..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Personal Note / Prayer Request
                </label>
                <textarea
                  rows="2"
                  value={manualDonationForm.notes}
                  onChange={(e) => setManualDonationForm({ ...manualDonationForm, notes: e.target.value })}
                  placeholder="Optional note e.g. Thanksgiving for birthday / family healing..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsManualDonationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManualDonation}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingManualDonation ? 'Saving...' : 'Save Offering & Record'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
