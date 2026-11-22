const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

export function getAdminHeaders() {
  let token = 'gvc-admin-session-active';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('gvc_admin_token') || token;
    }
  } catch (e) {}
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/status`);
    if (!res.ok) throw new Error('Status failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline-fallback',
      church_name: 'Grace Victory Church',
      database: { connected: false }
    };
  }
}

// SERMONS
export async function fetchSermons(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.series && params.series !== 'All') query.append('series', params.series);

    const res = await fetch(`${API_BASE_URL}/api/sermons?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sermons');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback sermons', err);
    return null;
  }
}

export async function createSermon(sermonData) {
  const res = await fetch(`${API_BASE_URL}/api/sermons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sermonData)
  });
  if (!res.ok) throw new Error('Failed to create sermon');
  return await res.json();
}

export async function deleteSermon(id) {
  const res = await fetch(`${API_BASE_URL}/api/sermons/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete sermon');
  return await res.json();
}

// EVENTS
const EVENTS_STORAGE_KEY = 'gvc_church_events_v1';

export function getEventNotices(evt) {
  if (!evt) return [];
  if (Array.isArray(evt.extra_notices) && evt.extra_notices.length > 0) {
    return evt.extra_notices.filter(Boolean);
  }
  if (Array.isArray(evt.extra_info) && evt.extra_info.length > 0) {
    return evt.extra_info.filter(Boolean);
  }
  if (typeof evt.extra_info === 'string' && evt.extra_info.trim()) {
    if (evt.extra_info.includes('•')) {
      return evt.extra_info.split('•').map(s => s.trim()).filter(Boolean);
    }
    return evt.extra_info.split('\n').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// Parse event timeline into start/end Date objects
export function getEventTimeline(eventOrDate) {
  if (!eventOrDate) return null;
  const str = (typeof eventOrDate === 'string' ? eventOrDate : eventOrDate.date || '').trim();
  if (!str) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const lower = str.toLowerCase();

  // 1. YYYY-MM-DD (Standard Calendar date format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59);
    return { start, end, isRecurring: false };
  }

  // 2. DD-MM-YYYY or DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy.map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59);
    return { start, end, isRecurring: false };
  }

  // 3. Month & Day with or without Year: e.g. "December 20, 2026" or "Dec 25"
  const monthDayMatch = str.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?$/i);
  if (monthDayMatch) {
    const [, monthStr, dayStr, yearStr] = monthDayMatch;
    const testDate = new Date(`${monthStr} 1, 2000`);
    if (!isNaN(testDate.getTime())) {
      const monthIdx = testDate.getMonth();
      const day = parseInt(dayStr, 10);
      let year = yearStr ? parseInt(yearStr, 10) : currentYear;
      let start = new Date(year, monthIdx, day, 0, 0, 0);
      let end = new Date(year, monthIdx, day, 23, 59, 59);
      if (!yearStr && end < now) {
        year = currentYear + 1;
        start = new Date(year, monthIdx, day, 0, 0, 0);
        end = new Date(year, monthIdx, day, 23, 59, 59);
      }
      return { start, end, isRecurring: false };
    }
  }

  // 4. Date Range: e.g. "December 18 - 20, 2026"
  const rangeMatch = str.match(/([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2})(?:,?\s*(\d{4}))?/);
  if (rangeMatch) {
    const [, monthStr, d1, d2, yearStr] = rangeMatch;
    const testDate = new Date(`${monthStr} 1, 2000`);
    const monthIdx = !isNaN(testDate.getTime()) ? testDate.getMonth() : 0;
    const year = yearStr ? parseInt(yearStr, 10) : currentYear;
    const start = new Date(year, monthIdx, parseInt(d1, 10), 0, 0, 0);
    const end = new Date(year, monthIdx, parseInt(d2, 10), 23, 59, 59);
    return { start, end, isRecurring: false };
  }

  // 5. Recurring: "First Friday of Every Month"
  if (lower.includes('first friday')) {
    let candidate = new Date(now.getFullYear(), now.getMonth(), 1);
    while (candidate.getDay() !== 5) candidate.setDate(candidate.getDate() + 1);
    if (candidate < now) {
      candidate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      while (candidate.getDay() !== 5) candidate.setDate(candidate.getDate() + 1);
    }
    const end = new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate(), 23, 59, 59);
    return { start: candidate, end, isRecurring: true };
  }

  // 6. Recurring: "Every Sunday"
  if (lower.includes('sunday')) {
    let candidate = new Date(now);
    let daysUntilSunday = (7 - candidate.getDay()) % 7;
    if (daysUntilSunday === 0 && candidate.getHours() >= 13) daysUntilSunday = 7;
    candidate.setDate(candidate.getDate() + daysUntilSunday);
    const end = new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate(), 23, 59, 59);
    return { start: candidate, end, isRecurring: true };
  }

  // 7. Generic recurring
  if (lower.includes('every') || lower.includes('weekly') || lower.includes('monthly') || lower.includes('daily')) {
    return { 
      start: now, 
      end: new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59), 
      isRecurring: true 
    };
  }

  // 8. General Date parsing fallback
  try {
    let parseTarget = str;
    if (!/\b20\d{2}\b/.test(str)) {
      parseTarget = `${str} ${currentYear}`;
    }
    const parsed = new Date(parseTarget);
    if (!isNaN(parsed.getTime())) {
      const start = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0);
      const end = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59);
      return { start, end, isRecurring: false };
    }
  } catch (e) {}

  return null;
}

// Check if an event is currently active (DEADLINE HAS NOT PASSED)
export function isEventActive(eventOrDate) {
  if (!eventOrDate) return false;
  const timeline = getEventTimeline(eventOrDate);
  if (!timeline) return false;
  const now = new Date();
  return timeline.end >= now;
}

// Format date for HTML <input type="date" /> (returns YYYY-MM-DD)
export function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const timeline = getEventTimeline(str);
  if (timeline && timeline.start) {
    const d = timeline.start;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
}

// Format date nicely for visitors: e.g. "2026-11-30" -> "Nov 30, 2026"
export function formatEventDisplayDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch.map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
  return str;
}

// Sort active upcoming events so the CLOSEST upcoming event is first!
export function getSortedActiveEvents(eventsList) {
  if (!Array.isArray(eventsList)) return [];
  return eventsList
    .filter(isEventActive)
    .sort((a, b) => {
      const timeA = getEventTimeline(a);
      const timeB = getEventTimeline(b);
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;

      // Specific dates take priority over recurring events
      const aIsSpecific = !timeA.isRecurring;
      const bIsSpecific = !timeB.isRecurring;
      if (aIsSpecific && !bIsSpecific) return -1;
      if (!aIsSpecific && bIsSpecific) return 1;

      // Sort by earliest start time (closest date to now comes first)
      return timeA.start.getTime() - timeB.start.getTime();
    });
}

export function getStoredEvents() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(EVENTS_STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function saveStoredEvents(events) {
  try {
    if (typeof window !== 'undefined' && Array.isArray(events)) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      window.dispatchEvent(new CustomEvent('gvc_events_updated', { detail: events }));
    }
  } catch (e) {}
}

export async function fetchEvents(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.featured !== undefined) query.append('featured', params.featured);
    if (params.category && params.category !== 'All') query.append('category', params.category);

    const res = await fetch(`${API_BASE_URL}/api/events?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveStoredEvents(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, trying stored events', err);
  }

  const local = getStoredEvents();
  if (local !== null && Array.isArray(local)) {
    if (params.category && params.category !== 'All') {
      return local.filter(e => e.category?.toLowerCase() === params.category.toLowerCase());
    }
    return local;
  }
  return [];
}

export async function createEvent(eventData) {
  let created = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, saving event locally', err);
  }

  if (!created) {
    created = {
      ...eventData,
      id: eventData.id || `event-${Date.now()}`
    };
  }

  const existing = getStoredEvents() || [];
  const updated = [created, ...existing.filter(e => e.id !== created.id)];
  saveStoredEvents(updated);

  return created;
}

export async function updateEvent(id, eventData) {
  let updatedEvent = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (res.ok) {
      updatedEvent = await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, updating event locally', err);
  }

  if (!updatedEvent) {
    updatedEvent = { ...eventData, id };
  }

  const existing = getStoredEvents() || [];
  const updated = existing.map(e => e.id === id ? { ...e, ...updatedEvent } : e);
  if (!existing.some(e => e.id === id)) {
    updated.unshift(updatedEvent);
  }
  saveStoredEvents(updated);

  return updatedEvent;
}

export async function deleteEvent(id) {
  try {
    await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {}

  const existing = getStoredEvents() || [];
  saveStoredEvents(existing.filter(e => e.id !== id && e._id !== id));
  return { id };
}

export async function submitEventRsvp(rsvpData) {
  const res = await fetch(`${API_BASE_URL}/api/events/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvpData)
  });
  if (!res.ok) throw new Error('Failed to RSVP');
  return await res.json();
}

// PRAYER REQUESTS
export async function fetchPrayers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/prayers`);
    if (!res.ok) throw new Error('Failed to fetch prayers');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback prayers', err);
    return null;
  }
}

export async function fetchAllPrayersAdmin() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/prayers/admin/all`);
    if (!res.ok) throw new Error('Failed to fetch admin prayers');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback prayers', err);
    return null;
  }
}

export async function deletePrayer(prayerId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/prayers/${prayerId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete prayer');
    return await res.json();
  } catch (err) {
    return { success: true };
  }
}

export async function submitPrayer(prayerData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prayerData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, saving prayer locally', err);
  }
  return {
    ...prayerData,
    id: `prayer-${Date.now()}`,
    prayer_count: 1,
    created_at: new Date().toISOString()
  };
}

export async function clickPrayCount(prayerId) {
  const res = await fetch(`${API_BASE_URL}/api/prayers/${prayerId}/pray`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to update prayer count');
  return await res.json();
}

// TESTIMONIES (SEPARATE DATABASE COLLECTION)
const TESTIMONIES_STORAGE_KEY = 'gvc_testimonies_v2';

export const INITIAL_FALLBACK_TESTIMONIES = [
  {
    id: "testimony-1",
    name: "Dr. Arun Kumar & Dr. Priya",
    story: "When my father was hospitalized in ICU with severe complications, the pastoral team and prayer chain of Grace Victory Church interceded continuously. God performed a supernatural miracle! Today he is completely healed. Praise the Lord!",
    type: "Miraculous Healing",
    date: "2026-11-10",
    location: "Vattamalai",
    featured_home: true,
    is_active: true
  },
  {
    id: "testimony-2",
    name: "Grace Shalini",
    story: "I came to GVC feeling broken and depressed after failing key exams and losing hope. Through the anointed worship and loving community at Ignite Youth, Jesus healed my mind and restored my confidence. I now work at a top firm and lead a life group!",
    type: "Life Transformation",
    date: "2026-11-05",
    location: "Vattamalai",
    featured_home: true,
    is_active: true
  },
  {
    id: "testimony-3",
    name: "Brother David & Family",
    story: "Our family business was facing severe financial ruin. Pastor P. Rajendran prayed over us during the Sunday service and prophesied divine breakthrough. Within two months, God opened extraordinary new doors beyond our imagination!",
    type: "Financial Breakthrough",
    date: "2026-10-28",
    location: "Vattamalai",
    featured_home: true,
    is_active: true
  }
];

export function getStoredTestimonies() {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(TESTIMONIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (e) {}
  return INITIAL_FALLBACK_TESTIMONIES;
}

export function saveStoredTestimonies(list) {
  try {
    if (typeof window !== 'undefined' && Array.isArray(list)) {
      localStorage.setItem(TESTIMONIES_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('gvc_testimonies_updated', { detail: list }));
    }
  } catch (e) {}
}

export async function fetchTestimonies() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/testimonies`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((t, idx) => ({
          ...t,
          id: String(t.id || t._id || `testimony-${idx + 1}`)
        }));
        saveStoredTestimonies(normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using stored testimonies', err);
  }
  return getStoredTestimonies();
}

export async function submitTestimony(testimonyData) {
  let created = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/testimonies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonyData)
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, saving testimony locally', err);
  }

  if (!created) {
    created = {
      ...testimonyData,
      id: testimonyData.id || `testimony-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
  } else {
    created = {
      ...created,
      id: String(created.id || created._id || `testimony-${Date.now()}`)
    };
  }

  const existing = getStoredTestimonies();
  const updated = [created, ...existing.filter(t => String(t.id) !== String(created.id) && String(t._id) !== String(created.id))];
  saveStoredTestimonies(updated);
  return created;
}

export async function deleteTestimony(testimonyId) {
  try {
    await fetch(`${API_BASE_URL}/api/testimonies/${testimonyId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Backend delete error', err);
  }
  const existing = getStoredTestimonies();
  const updated = existing.filter(t => String(t.id) !== String(testimonyId) && String(t._id) !== String(testimonyId));
  saveStoredTestimonies(updated);
  return { success: true };
}

export async function toggleTestimonyHomeFeature(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/testimonies/${id}/toggle-home`, {
      method: 'PUT'
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { id, success: true };
}

export async function changeAdminPassword({ userId = 'admin', currentPassword, newPassword, newUserId }) {
  const res = await fetch(`${API_BASE_URL}/api/admin/auth/credentials`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({
      user_id: userId,
      current_password: currentPassword,
      new_user_id: newUserId || userId,
      new_password: newPassword
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to update password');
  }
  return data;
}

export async function triggerNotification(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend notification trigger error', err);
  }
  return { success: false };
}

// MINISTRIES & PRAYER SERVICES
export async function fetchMinistries() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ministries`);
    if (!res.ok) throw new Error('Failed to fetch ministries');
    return await res.json();
  } catch (err) {
    console.warn('API error fetching ministries, using fallback', err);
    return null;
  }
}

export async function createMinistry(ministryData) {
  const res = await fetch(`${API_BASE_URL}/api/ministries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ministryData)
  });
  if (!res.ok) throw new Error('Failed to create ministry');
  return await res.json();
}

export async function updateMinistry(id, ministryData) {
  const res = await fetch(`${API_BASE_URL}/api/ministries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ministryData)
  });
  if (!res.ok) throw new Error('Failed to update ministry');
  return await res.json();
}

export async function deleteMinistry(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ministries/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete ministry');
    return await res.json();
  } catch (err) {
    return { success: true };
  }
}

// CONTACT & PLAN A VISIT
const INQUIRIES_STORAGE_KEY = 'gvc_church_inquiries_v1';

export function getStoredInquiries() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(INQUIRIES_STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveStoredInquiries(list) {
  try {
    if (typeof window !== 'undefined' && Array.isArray(list)) {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('gvc_inquiries_updated', { detail: list }));
    }
  } catch (e) {}
}

export async function fetchInquiries() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contact/messages`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveStoredInquiries(data);
        return data;
      }
    }
  } catch (err) {}
  return getStoredInquiries();
}

export async function deleteInquiry(id) {
  try {
    await fetch(`${API_BASE_URL}/api/contact/messages/${id}`, { method: 'DELETE' });
  } catch (e) {}
  const existing = getStoredInquiries();
  const updated = existing.filter(m => m.id !== id);
  saveStoredInquiries(updated);
  return { success: true };
}

export async function submitContact(messageData) {
  let created = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, saving inquiry locally', err);
  }

  if (!created) {
    created = {
      ...messageData,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
  }

  const existing = getStoredInquiries();
  const updated = [created, ...existing.filter(m => m.id !== created.id)];
  saveStoredInquiries(updated);
  return created;
}

export async function submitPlanVisit(visitData) {
  const res = await fetch(`${API_BASE_URL}/api/contact/plan-visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitData)
  });
  if (!res.ok) throw new Error('Failed to submit plan visit');
  return await res.json();
}

// GIVING / DONATIONS
export async function fetchGivingDetails() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations/details`);
    if (!res.ok) throw new Error('Failed to fetch details');
    return await res.json();
  } catch (err) {
    return null;
  }
}

const DONATIONS_STORAGE_KEY = 'gvc_donations_cache';

export function getStoredDonations() {
  try {
    const raw = localStorage.getItem(DONATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredDonations(donations) {
  try {
    localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donations));
    window.dispatchEvent(new CustomEvent('gvc_donations_updated', { detail: donations }));
  } catch (e) {
    console.warn('Failed to save donations to localStorage', e);
  }
}

export async function createPaymentOrder(orderData) {
  const res = await fetch(`${API_BASE_URL}/api/donations/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to initialize payment order');
  }
  return await res.json();
}

export async function verifyPayment(verificationData) {
  const res = await fetch(`${API_BASE_URL}/api/donations/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verificationData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Bank payment verification failed');
  }
  const verifiedDonation = await res.json();

  const existing = getStoredDonations();
  const updated = [verifiedDonation, ...existing.filter(d => d.id !== verifiedDonation.id)];
  saveStoredDonations(updated);

  return verifiedDonation;
}

export async function submitDonation(donationData) {
  let created = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData)
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (err) {
    console.warn('API error recording donation to backend', err);
  }

  if (!created) {
    created = {
      id: `don-${Date.now()}`,
      receipt_number: `GVC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
      created_at: new Date().toISOString(),
      status: 'Completed',
      ...donationData
    };
  }

  const existing = getStoredDonations();
  const updated = [created, ...existing.filter(d => d.id !== created.id)];
  saveStoredDonations(updated);

  return created;
}

export async function fetchAllDonations() {
  let serverDonations = [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations`);
    if (res.ok) {
      serverDonations = await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch donations from server, using cached', err);
  }

  const localDonations = getStoredDonations();
  const map = new Map();
  serverDonations.forEach(d => map.set(d.id, d));
  localDonations.forEach(d => {
    if (!map.has(d.id)) {
      map.set(d.id, d);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  saveStoredDonations(merged);
  return merged;
}

export async function deleteDonation(donationId) {
  try {
    await fetch(`${API_BASE_URL}/api/donations/${donationId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Could not delete donation on server', err);
  }

  const existing = getStoredDonations();
  const updated = existing.filter(d => d.id !== donationId);
  saveStoredDonations(updated);
  return { status: 'success', id: donationId };
}

export async function updateDonationStatus(donationId, status) {
  try {
    await fetch(`${API_BASE_URL}/api/donations/${donationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.warn('Could not update donation status on server', err);
  }

  const existing = getStoredDonations();
  const updated = existing.map(d => d.id === donationId ? { ...d, status } : d);
  saveStoredDonations(updated);
  return { status: 'success', id: donationId, new_status: status };
}

// GMAIL WEB COMPOSE HELPERS (Opens Gmail directly in browser, bypassing desktop Outlook)
export function getGmailComposeUrl({ to = '', subject = '', body = '' } = {}) {
  const params = new URLSearchParams();
  params.append('view', 'cm');
  params.append('fs', '1');
  if (to) params.append('to', to);
  if (subject) params.append('su', subject);
  if (body) params.append('body', body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function openGmailCompose({ to = '', subject = '', body = '' } = {}) {
  const url = getGmailComposeUrl({ to, subject, body });
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // If popup blocked, navigate directly
      window.location.href = url;
    }
  } catch (e) {
    window.location.href = url;
  }
}
