import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHURCH_INFO, CHURCH_STATS, DEFAULT_MILESTONES, CORE_BELIEFS, LEADERSHIP_TEAM } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';

export const DEFAULT_SETTINGS = {
  churchName: "Grace Victory Church",
  tamilName: "கிரேஸ் விக்டரி சர்ச்",
  seniorPastor: "Pastor P. Rajendran",
  seniorPastorTitle: "Founder & Senior Pastor",
  associatePastor: "Pastor R. Franklin Rajendran",
  associatePastorTitle: "Youth Pastor & Administrator",
  youthPastor: "Pastor R. Franklin Rajendran",
  youthPastorTitle: "Youth Pastor & Administrator",
  phone: "+91 93605 88397",
  whatsappNumber: "+91 93605 88397",
  email: "contact@gracevictorychurch.org",
  adminNotificationEmail: "contact@gracevictorychurch.org",
  address: "Grace Victory Church, Vattamalai, Tamil Nadu, India",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=Grace%20Victory%20Church,%20Vattamalai,%20Tamil%20Nadu,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed",
  googleMapsLink: "https://maps.google.com/?q=Grace+Victory+Church+Vattamalai+Tamil+Nadu+India",
  serviceTimings: "Sunday 09:30 AM – 11:30 AM",
  wednesdayTiming: "07:00 PM – 08:30 PM",
  fridayTiming: "10:30 AM – 01:30 PM",
  yearBadge: "2026",
  themeBadge: "YEAR OF FELLOWSHIP",
  tamilTheme: "2026 வெற்றி மற்றும் ஐக்கியத்தின் ஆண்டு",
  tagline: "Always Something New — Since 1998",
  verse: "“Thanks be unto God, which always causeth us to triumph in Christ!” — 2 Cor 2:14",
  pastorImage: "/images/pastor.jpg",
  associatePastorImage: "/images/franklin.jpg",
  youthPastorImage: "/images/franklin.jpg",
  churchHallImage: "/images/church_hall.jpg",
  upiId: "gracevictorychurch@okaxis",
  bankName: "State Bank of India (SBI)",
  accountNumber: "921020038472910",
  branch: "Vattamalai Branch",
  ifscCode: "SBIN0004921",
  razorpayKeyId: "rzp_test_GVC1024Testing",
  razorpaySecretConfigured: false,
  churchStats: CHURCH_STATS,
  milestones: DEFAULT_MILESTONES,
  coreBeliefs: CORE_BELIEFS,
  leadershipTeam: LEADERSHIP_TEAM,
  sliderSpeedSeconds: 3,
  featuredHomeTestimonyIds: ['testimony-1', 'testimony-2', 'testimony-3'],
  foundedYear: "1998",
  pastorWelcomeBadge: "A Personal Word from Our Pastoral Leadership",
  pastorWelcomeTitle: "“You Were Born to Walk in Divine Favor and Supernatural Victory!”",
  pastorWelcomeP1: "Beloved brother and sister, welcome to Grace Victory Church. For over 28 years, God has granted us the privilege of shepherding precious families across Vattamalai with love, truth, and the supernatural power of the Holy Spirit.",
  pastorWelcomeP2: "No matter what challenge, illness, or heartbreak you are carrying today, our Lord Jesus Christ is alive and His grace is more than sufficient. We believe that when you step into our church, you will experience the tangible presence of God, deep fellowship, and supernatural peace.",
  pastorWelcomeQuote: "“Together with our pastoral leadership and our youth pastor, Pastor R. Franklin Rajendran, we personally invite you to worship with us this Sunday. We look forward to welcoming you and your family!”",
  faqList: null,
  swiftCode: "SBININBB492",
  givingVerse: "“Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.” — Malachi 3:10",
  givingPresets: "500, 1000, 2500, 5000, 10000",
  prayerWallVerse: "“Again I say unto you, That if two of you shall agree on earth as touching any thing that they shall ask, it shall be done for them of my Father which is in heaven.” — Matthew 18:19",
};

// Safe storage wrapper (handles Chrome Incognito / Safari Private mode and storage quotas gracefully)
const memoryStore = {};
const safeStorage = {
  getItem: (key) => {
    if (memoryStore[key] !== undefined && memoryStore[key] !== null) {
      return memoryStore[key];
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Storage access blocked
    }
    return null;
  },
  setItem: (key, val) => {
    memoryStore[key] = val;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, val);
        } catch (quotaErr) {
          console.warn('localStorage quota exceeded, cleaning old entries and retrying', quotaErr);
          try {
            window.localStorage.removeItem(key);
            window.localStorage.setItem(key, val);
          } catch (e) {
            console.warn('Persistent localStorage unavailable, using in-memory store');
          }
        }
      }
    } catch (e) { }
  },
  removeItem: (key) => {
    delete memoryStore[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) { }
  }
};

export function sanitizeFranklinName(name) {
  if (!name || typeof name !== 'string') return 'Pastor R. Franklin Rajendran';
  let cleaned = name.replace(/(?:Rajendran)+/gi, 'Rajendran');
  cleaned = cleaned.replace(/(?:endran)+/gi, 'endran');
  if (cleaned.includes('Franklin') && !cleaned.includes('Rajendran')) {
    cleaned = cleaned.replace(/Franklin(\s+Raj)?/i, 'Franklin Rajendran');
  }
  return cleaned.trim();
}

export function normalizeLeadershipTeam(team) {
  if (!Array.isArray(team) || team.length < 2) return team;

  let list = team.map(leader => {
    let updatedName = leader.name;
    if (updatedName && updatedName.includes('Franklin') && !updatedName.includes('Rajendran')) {
      updatedName = 'Pastor R. Franklin Rajendran';
    }
    if (updatedName && (updatedName.includes('Rachel') || updatedName.includes('Joice'))) {
      updatedName = 'Pastor Joice Rajendran';
    }
    return { ...leader, name: updatedName };
  });

  // Re-order: 1) Senior Pastor, 2) Co-Pastor, 3) Youth Pastor
  const seniorIdx = list.findIndex(l =>
    l.role?.toLowerCase().includes('senior') || l.name?.toLowerCase().includes('p. rajendran')
  );
  const coPastorIdx = list.findIndex(l =>
    l.role?.toLowerCase().includes('co-pastor') || l.role?.toLowerCase().includes('women') || l.name?.toLowerCase().includes('joice') || l.name?.toLowerCase().includes('rachel')
  );
  const youthIdx = list.findIndex(l =>
    l.role?.toLowerCase().includes('youth') || l.name?.toLowerCase().includes('franklin')
  );

  if (seniorIdx !== -1 && coPastorIdx !== -1 && youthIdx !== -1) {
    const senior = list[seniorIdx];
    const coPastor = list[coPastorIdx];
    const youth = list[youthIdx];
    const remaining = list.filter((_, i) => i !== seniorIdx && i !== coPastorIdx && i !== youthIdx);
    return [senior, coPastor, youth, ...remaining];
  }

  return list;
}

const ChurchContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => DEFAULT_SETTINGS,
  resetSettings: () => { },
  isAdminLoggedIn: false,
  loginAdmin: async () => ({ success: false }),
  logoutAdmin: () => { },
});

export function ChurchProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem('gvc_live_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        if (merged.leadershipTeam) {
          merged.leadershipTeam = normalizeLeadershipTeam(merged.leadershipTeam);
        }
        if (merged.associatePastor) {
          merged.associatePastor = sanitizeFranklinName(merged.associatePastor);
        }
        return merged;
      }
    } catch (e) { }
    return DEFAULT_SETTINGS;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return Boolean(safeStorage.getItem('gvc_admin_token'));
    } catch (e) {
      return false;
    }
  });

  // Sync settings with backend API if available
  useEffect(() => {
    let isMounted = true;
    async function loadRemoteSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const remote = await res.json();
          if (remote && remote.church_name && isMounted) {
            setSettings(prev => ({
              ...prev,
              churchName: remote.church_name || prev.churchName,
              tamilName: remote.tamil_name || prev.tamilName,
              seniorPastor: remote.senior_pastor || prev.seniorPastor,
              seniorPastorTitle: remote.senior_pastor_title || prev.seniorPastorTitle,
              associatePastor: sanitizeFranklinName(remote.associate_pastor || prev.associatePastor),
              associatePastorTitle: remote.associate_pastor_title || prev.associatePastorTitle,
              associatePastorImage: remote.associate_pastor_image || prev.associatePastorImage,
              phone: remote.phone || prev.phone,
              whatsappNumber: remote.whatsapp_number || prev.whatsappNumber,
              email: remote.email || prev.email,
              adminNotificationEmail: remote.admin_notification_email || prev.adminNotificationEmail,
              address: remote.address || prev.address,
              googleMapsEmbedUrl: remote.google_maps_embed_url || prev.googleMapsEmbedUrl,
              googleMapsLink: remote.google_maps_link || prev.googleMapsLink,
              serviceTimings: remote.service_timings || prev.serviceTimings,
              yearBadge: remote.year_badge || prev.yearBadge,
              themeBadge: remote.theme_badge || prev.themeBadge,
              tamilTheme: remote.tamil_theme || prev.tamilTheme,
              tagline: remote.tagline || prev.tagline,
              verse: remote.verse || prev.verse,
              pastorImage: remote.pastor_image || prev.pastorImage,
              churchHallImage: remote.church_hall_image || prev.churchHallImage,
              upiId: remote.upi_id || prev.upiId,
              bankName: remote.bank_name || prev.bankName,
              accountNumber: remote.account_number || prev.accountNumber,
              branch: remote.branch || prev.branch,
              ifscCode: remote.ifsc_code || prev.ifscCode,
              razorpayKeyId: remote.razorpay_key_id || prev.razorpayKeyId,
              razorpaySecretConfigured: Boolean(remote.razorpay_secret_configured),
              churchStats: remote.church_stats || prev.churchStats,
              milestones: remote.milestones || prev.milestones,
              coreBeliefs: remote.core_beliefs || prev.coreBeliefs,
              leadershipTeam: normalizeLeadershipTeam(remote.leadership_team || prev.leadershipTeam),
              sliderSpeedSeconds: remote.slider_speed_seconds || prev.sliderSpeedSeconds || 3,
              featuredHomeTestimonyIds: remote.featured_home_testimony_ids || prev.featuredHomeTestimonyIds || ['testimony-1', 'testimony-2', 'testimony-3'],
              foundedYear: remote.founded_year || prev.foundedYear || "1998",
              pastorWelcomeBadge: remote.pastor_welcome_badge || prev.pastorWelcomeBadge,
              pastorWelcomeTitle: remote.pastor_welcome_title || prev.pastorWelcomeTitle,
              pastorWelcomeP1: remote.pastor_welcome_p1 || prev.pastorWelcomeP1,
              pastorWelcomeP2: remote.pastor_welcome_p2 || prev.pastorWelcomeP2,
              pastorWelcomeQuote: remote.pastor_welcome_quote || prev.pastorWelcomeQuote,
              faqList: remote.faq_list || prev.faqList,
              swiftCode: remote.swift_code || prev.swiftCode || "SBININBB492",
              givingVerse: remote.giving_verse || prev.givingVerse,
              givingPresets: remote.giving_presets || prev.givingPresets,
              prayerWallVerse: remote.prayer_wall_verse || prev.prayerWallVerse,
            }));
          }
        }
      } catch (err) {
        // Backend offline or fallback
      }
    }
    loadRemoteSettings();
    return () => { isMounted = false; };
  }, []);

  const updateSettings = async (newSettings) => {
    let finalLeadership = newSettings.leadershipTeam || settings.leadershipTeam;
    if (Array.isArray(finalLeadership)) {
      finalLeadership = await Promise.all(
        finalLeadership.map(async (leader) => {
          if (leader.image && typeof leader.image === 'string' && leader.image.startsWith('data:image/') && leader.image.length > 50000) {
            try {
              const comp = await compressImage(leader.image, 600, 0.8);
              return { ...leader, image: comp };
            } catch (e) {
              return leader;
            }
          }
          return leader;
        })
      );
      finalLeadership = normalizeLeadershipTeam(finalLeadership);
    }

    const updated = {
      ...settings,
      ...newSettings,
      associatePastor: sanitizeFranklinName(newSettings.associatePastor || settings.associatePastor),
      leadershipTeam: finalLeadership
    };

    // Strip sensitive write-only fields so they are NEVER saved to browser localStorage
    const { razorpayKeySecret, ...cleanSettingsToPersist } = updated;
    setSettings(cleanSettingsToPersist);
    safeStorage.setItem('gvc_live_settings', JSON.stringify(cleanSettingsToPersist));

    // Dispatch custom event for real-time multi-tab/component sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gvc_settings_updated'));
    }

    // Non-blocking background sync with abort timeout so UI never freezes
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const token = safeStorage.getItem('gvc_admin_token') || 'gvc-admin-session-active';
      fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          church_name: updated.churchName,
          tamil_name: updated.tamilName,
          senior_pastor: updated.seniorPastor,
          senior_pastor_title: updated.seniorPastorTitle,
          associate_pastor: updated.associatePastor,
          associate_pastor_title: updated.associatePastorTitle,
          associate_pastor_image: updated.associatePastorImage,
          phone: updated.phone,
          whatsapp_number: updated.whatsappNumber,
          email: updated.email,
          address: updated.address,
          google_maps_embed_url: updated.googleMapsEmbedUrl,
          google_maps_link: updated.googleMapsLink,
          service_timings: updated.serviceTimings,
          year_badge: updated.yearBadge,
          theme_badge: updated.themeBadge,
          tamil_theme: updated.tamilTheme,
          tagline: updated.tagline,
          verse: updated.verse,
          pastor_image: updated.pastorImage,
          church_hall_image: updated.churchHallImage,
          upi_id: updated.upiId,
          bank_name: updated.bankName,
          account_number: updated.accountNumber,
          branch: updated.branch,
          ifsc_code: updated.ifscCode,
          razorpay_key_id: updated.razorpayKeyId,
          ...(newSettings.razorpayKeySecret && !String(newSettings.razorpayKeySecret).startsWith('•••')
            ? { razorpay_key_secret: String(newSettings.razorpayKeySecret).trim() }
            : {}),
          church_stats: updated.churchStats,
          milestones: updated.milestones,
          core_beliefs: updated.coreBeliefs,
          leadership_team: updated.leadershipTeam,
          slider_speed_seconds: updated.sliderSpeedSeconds || 3,
          featured_home_testimony_ids: updated.featuredHomeTestimonyIds,
          founded_year: updated.foundedYear,
          pastor_welcome_badge: updated.pastorWelcomeBadge,
          pastor_welcome_title: updated.pastorWelcomeTitle,
          pastor_welcome_p1: updated.pastorWelcomeP1,
          pastor_welcome_p2: updated.pastorWelcomeP2,
          pastor_welcome_quote: updated.pastorWelcomeQuote,
          faq_list: updated.faqList,
          swift_code: updated.swiftCode,
          giving_verse: updated.givingVerse,
          giving_presets: updated.givingPresets,
          prayer_wall_verse: updated.prayerWallVerse,
        }),
        signal: controller.signal
      }).catch(() => { })
        .finally(() => clearTimeout(timeoutId));
    } catch (e) { }

    return updated;
  };

  const loginAdmin = async (param1, param2) => {
    let userId = 'admin';
    let password = '';

    if (typeof param1 === 'object' && param1 !== null) {
      userId = (
        param1.userId ||
        param1.user_id ||
        param1.username ||
        'admin'
      ).trim();
      password = param1.password || '';
    } else if (
      typeof param1 === 'string' &&
      typeof param2 === 'string'
    ) {
      userId = param1.trim();
      password = param2;
    } else if (typeof param1 === 'string') {
      password = param1;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message: err.detail || 'Invalid User ID or Password'
        };
      }

      const data = await res.json();

      if (!data.token || typeof data.token !== 'string') {
        return {
          success: false,
          message: 'Invalid server authentication response'
        };
      }

      safeStorage.setItem('gvc_admin_token', data.token);
      safeStorage.setItem(
        'gvc_admin_user',
        JSON.stringify(data.user || { user_id: userId })
      );

      setIsAdminLoggedIn(true);
      return { success: true };

    } catch (err) {
      return {
        success: false,
        message: 'Unable to connect to server. Please try again.'
      };
    }
  };

  const logoutAdmin = () => {
    safeStorage.removeItem('gvc_admin_token');
    setIsAdminLoggedIn(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    safeStorage.removeItem('gvc_live_settings');
  };

  return (
    <ChurchContext.Provider value={{
      settings: settings || DEFAULT_SETTINGS,
      updateSettings,
      resetSettings,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  const context = useContext(ChurchContext);
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: async () => DEFAULT_SETTINGS,
      resetSettings: () => { },
      isAdminLoggedIn: false,
      loginAdmin: async () => ({ success: false }),
      logoutAdmin: () => { },
    };
  }
  return context;
}
