import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHURCH_INFO, CHURCH_STATS, DEFAULT_MILESTONES, CORE_BELIEFS, LEADERSHIP_TEAM } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';
import { API_BASE_URL } from '../api/client';

// Social media channels shown in the Hero slide dock and the Footer (editable from Admin > Footer & Social Links)
export const DEFAULT_SOCIAL_LINKS = {
  instagram: { url: "https://instagram.com", label: "@gracevictorychurch", sublabel: "@pastorrajendran" },
  facebook: { url: "https://facebook.com", label: "@gracevictorychurch", sublabel: "@franklinraj" },
  youtube: { url: "https://youtube.com", label: "GRACE VICTORY CHURCH", sublabel: "GVC WORSHIP CHANNEL" },
};

// Footer text blocks (empty value = automatic default text is used)
export const DEFAULT_FOOTER_CONFIG = {
  verse: "",
  prayerButtonText: "Need Prayer?",
  brandDescription: "",
};

// Adds https:// when missing and blocks unsafe protocols (javascript:, data:, etc.)
export function normalizeExternalUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value)) return value.startsWith('//') ? `https:${value}` : value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return '';
  return `https://${value}`;
}

export function resolveSocialLinks(settings) {
  const saved = (settings && typeof settings.socialLinks === 'object' && settings.socialLinks) || {};
  const out = {};
  Object.keys(DEFAULT_SOCIAL_LINKS).forEach((key) => {
    const merged = { ...DEFAULT_SOCIAL_LINKS[key], ...(saved[key] || {}) };
    out[key] = {
      url: normalizeExternalUrl(merged.url),
      label: String(merged.label ?? ''),
      sublabel: String(merged.sublabel ?? ''),
    };
  });
  return out;
}

export function resolveFooterConfig(settings) {
  const saved = (settings && typeof settings.footerConfig === 'object' && settings.footerConfig) || {};
  return { ...DEFAULT_FOOTER_CONFIG, ...saved };
}

export const DEFAULT_SETTINGS = {
  socialLinks: DEFAULT_SOCIAL_LINKS,
  footerConfig: DEFAULT_FOOTER_CONFIG,
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
  razorpayKeyId: "",
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

// Keep the browser cache in sync with the server copy so stale local edits
// never override what is actually live.
function persistSettings(next) {
  try {
    const { razorpayKeySecret, ...clean } = next || {};
    safeStorage.setItem('gvc_live_settings', JSON.stringify(clean));
  } catch (e) { }
  return next;
}

export function sanitizeFranklinName(name) {
  if (typeof name !== 'string') return '';
  let cleaned = name.replace(/(?:Rajendran){2,}/gi, 'Rajendran');
  cleaned = cleaned.replace(/(?:endran){2,}/gi, 'endran');
  return cleaned.trim();
}

export function normalizeLeadershipTeam(team) {
  if (!Array.isArray(team)) return team;
  return team;
}

const ChurchContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => DEFAULT_SETTINGS,
  refreshSettings: async () => false,
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

  // Sync settings with backend API, retry on Render cold starts, and re-sync on tab focus/storage
  const lastFetchRef = React.useRef(0);

  const loadRemoteSettings = React.useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) return false;
    lastFetchRef.current = now;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, { cache: 'no-store' });
      if (!res.ok) return false;
      const remote = await res.json();
      if (remote && typeof remote === 'object') {
        setSettings(prev => {
          const pick = (val, fallback) => (val !== undefined && val !== null ? val : fallback);
          const next = {
            ...prev,
            churchName: pick(remote.church_name, prev.churchName),
            tamilName: pick(remote.tamil_name, prev.tamilName),
            seniorPastor: pick(remote.senior_pastor, prev.seniorPastor),
            seniorPastorTitle: pick(remote.senior_pastor_title, prev.seniorPastorTitle),
            associatePastor: sanitizeFranklinName(pick(remote.associate_pastor, prev.associatePastor)),
            associatePastorTitle: pick(remote.associate_pastor_title, prev.associatePastorTitle),
            associatePastorImage: pick(remote.associate_pastor_image, prev.associatePastorImage),
            phone: pick(remote.phone, prev.phone),
            whatsappNumber: pick(remote.whatsapp_number, prev.whatsappNumber),
            email: pick(remote.email, prev.email),
            adminNotificationEmail: pick(remote.admin_notification_email, prev.adminNotificationEmail),
            address: pick(remote.address, prev.address),
            googleMapsEmbedUrl: pick(remote.google_maps_embed_url, prev.googleMapsEmbedUrl),
            googleMapsLink: pick(remote.google_maps_link, prev.googleMapsLink),
            serviceTimings: pick(remote.service_timings, prev.serviceTimings),
            wednesdayTiming: pick(remote.wednesday_timing, prev.wednesdayTiming),
            fridayTiming: pick(remote.friday_timing, prev.fridayTiming),
            yearBadge: pick(remote.year_badge, prev.yearBadge),
            themeBadge: pick(remote.theme_badge, prev.themeBadge),
            tamilTheme: pick(remote.tamil_theme, prev.tamilTheme),
            tagline: pick(remote.tagline, prev.tagline),
            verse: pick(remote.verse, prev.verse),
            pastorImage: pick(remote.pastor_image, prev.pastorImage),
            churchHallImage: pick(remote.church_hall_image, prev.churchHallImage),
            upiId: pick(remote.upi_id, prev.upiId),
            bankName: pick(remote.bank_name, prev.bankName),
            accountNumber: pick(remote.account_number, prev.accountNumber),
            branch: pick(remote.branch, prev.branch),
            ifscCode: pick(remote.ifsc_code, prev.ifscCode),
            razorpayKeyId: pick(remote.razorpay_key_id, prev.razorpayKeyId),
            razorpaySecretConfigured: Boolean(remote.razorpay_secret_configured),
            churchStats: Array.isArray(remote.church_stats) ? remote.church_stats : prev.churchStats,
            milestones: Array.isArray(remote.milestones) ? remote.milestones : prev.milestones,
            coreBeliefs: Array.isArray(remote.core_beliefs) ? remote.core_beliefs : prev.coreBeliefs,
            leadershipTeam: Array.isArray(remote.leadership_team) ? normalizeLeadershipTeam(remote.leadership_team) : prev.leadershipTeam,
            sliderSpeedSeconds: remote.slider_speed_seconds || prev.sliderSpeedSeconds || 3,
            featuredHomeTestimonyIds: Array.isArray(remote.featured_home_testimony_ids) ? remote.featured_home_testimony_ids : prev.featuredHomeTestimonyIds,
            foundedYear: pick(remote.founded_year, prev.foundedYear || "1998"),
            pastorWelcomeBadge: pick(remote.pastor_welcome_badge, prev.pastorWelcomeBadge),
            pastorWelcomeTitle: pick(remote.pastor_welcome_title, prev.pastorWelcomeTitle),
            pastorWelcomeP1: pick(remote.pastor_welcome_p1, prev.pastorWelcomeP1),
            pastorWelcomeP2: pick(remote.pastor_welcome_p2, prev.pastorWelcomeP2),
            pastorWelcomeQuote: pick(remote.pastor_welcome_quote, prev.pastorWelcomeQuote),
            faqList: Array.isArray(remote.faq_list) ? remote.faq_list : prev.faqList,
            swiftCode: pick(remote.swift_code, prev.swiftCode),
            givingVerse: pick(remote.giving_verse, prev.givingVerse),
            givingPresets: pick(remote.giving_presets, prev.givingPresets),
            prayerWallVerse: pick(remote.prayer_wall_verse, prev.prayerWallVerse),
            socialLinks: (remote.social_links && typeof remote.social_links === 'object') ? remote.social_links : prev.socialLinks,
            footerConfig: (remote.footer_config && typeof remote.footer_config === 'object') ? remote.footer_config : prev.footerConfig,
          };
          try {
            if (JSON.stringify(next) === JSON.stringify(prev)) {
              return prev;
            }
          } catch (e) {}
          return persistSettings(next);
        });
        return true;
      }
    } catch (err) {
      // Backend sleeping or offline
    }
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let retryTimer1;
    let retryTimer2;

    async function initLoad() {
      const ok = await loadRemoteSettings(true);
      if (!ok && isMounted) {
        retryTimer1 = setTimeout(async () => {
          if (!isMounted) return;
          const ok2 = await loadRemoteSettings(true);
          if (!ok2 && isMounted) {
            retryTimer2 = setTimeout(() => {
              if (isMounted) loadRemoteSettings(true);
            }, 10000);
          }
        }, 4000);
      }
    }
    initLoad();

    const handleFocus = () => {
      loadRemoteSettings(false);
    };
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadRemoteSettings(false);
      }
    };
    const handleStorage = (e) => {
      if (e.key === 'gvc_live_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...prev, ...parsed }));
        } catch (err) { }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      clearTimeout(retryTimer1);
      clearTimeout(retryTimer2);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadRemoteSettings]);

  const updateSettings = async (newSettings) => {
    let finalLeadership = Array.isArray(newSettings.leadershipTeam) ? newSettings.leadershipTeam : settings.leadershipTeam;
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

    // Save to the backend FIRST and wait for confirmation.
    // Only update local state & browser cache AFTER MongoDB/server confirms success.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    const token = safeStorage.getItem('gvc_admin_token') || '';
    let res;
    try {
      res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
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
          admin_notification_email: updated.adminNotificationEmail,
          address: updated.address,
          google_maps_embed_url: updated.googleMapsEmbedUrl,
          google_maps_link: updated.googleMapsLink,
          service_timings: updated.serviceTimings,
          wednesday_timing: updated.wednesdayTiming,
          friday_timing: updated.fridayTiming,
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
          social_links: updated.socialLinks,
          footer_config: updated.footerConfig,
        }),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(
        err?.name === 'AbortError'
          ? 'Server took too long to respond. Your change was NOT saved to the live site — please try again.'
          : 'Cannot reach the backend server. Your change was NOT saved to the live site.'
      );
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      if (res.status === 401) {
        safeStorage.removeItem('gvc_admin_token');
        setIsAdminLoggedIn(false);
        throw new Error('Admin session expired. Please log in again and re-save.');
      }
      throw new Error(errBody.detail || `Save failed (HTTP ${res.status}). Your change was NOT saved to the live site.`);
    }

    const respData = await res.json().catch(() => ({}));
    const finalSaved = {
      ...cleanSettingsToPersist,
      ...(respData?.settings && typeof respData.settings.razorpay_secret_configured === 'boolean'
        ? { razorpaySecretConfigured: respData.settings.razorpay_secret_configured }
        : {})
    };
    setSettings(finalSaved);
    persistSettings(finalSaved);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gvc_settings_updated'));
    }

    return finalSaved;
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
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Only a real 401 from the backend means wrong credentials.
        // Anything else (404/405/5xx, HTML page) means the backend was not reached.
        if (res.status === 401) {
          return { success: false, message: err.detail || 'Invalid User ID or Password' };
        }
        return {
          success: false,
          message: err.detail || `Cannot reach the backend server (HTTP ${res.status}). Check that VITE_API_URL points to your backend.`
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
    safeStorage.removeItem('gvc_admin_user');
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
      refreshSettings: () => loadRemoteSettings(true),
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
      refreshSettings: async () => false,
      resetSettings: () => { },
      isAdminLoggedIn: false,
      loginAdmin: async () => ({ success: false }),
      logoutAdmin: () => { },
    };
  }
  return context;
}
