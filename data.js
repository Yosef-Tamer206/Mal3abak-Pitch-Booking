/* =====================================================
   ملعبك — بيانات تجريبية (Demo data)
   كل الأسماء والأسعار والأماكن افتراضية لعرض الفكرة فقط.
   ===================================================== */

const AMENITY_ICONS = {
  'إضاءة ليلية': '💡',
  'موقف سيارات': '🅿️',
  'غرف تغيير': '🚪',
  'دش': '🚿',
  'كافيتريا': '☕',
  'تأجير كور': '⚽',
  'تكييف': '❄️',
  'نجيل طبيعي': '🌿',
  'سماعات وميكروفون': '🎤',
  'كاميرات تصوير': '🎥'
};

const PITCHES = [
  {
    id: 'p01', name: 'ملعب النجوم', city: 'الفيوم', area: 'وسط البلد',
    price: 200, size: 5, indoor: false, rating: 4.7, reviews: 132, img: 1,
    surface: 'نجيل صناعي', owner: 'owner1',
    open: 10, close: 26, // 10 صباحًا - 2 بعد منتصف الليل
    amenities: ['إضاءة ليلية', 'موقف سيارات', 'غرف تغيير', 'تأجير كور'],
    about: 'ملعب خماسي نجيل صناعي في قلب الفيوم، إضاءة ممتازة للماتشات الليلية وحكم متوفر عند الطلب.'
  },
  {
    id: 'p02', name: 'ملعب الصقور', city: 'الفيوم', area: 'إبشواي',
    price: 150, size: 7, indoor: false, rating: 4.4, reviews: 58, img: 2,
    surface: 'نجيل صناعي', owner: 'owner1',
    open: 9, close: 24,
    amenities: ['إضاءة ليلية', 'غرف تغيير', 'كافيتريا'],
    about: 'ملعب سباعي واسع في إبشواي، مناسب للماتشات الطويلة والتجمعات الكبيرة بسعر اقتصادي.'
  },
  {
    id: 'p03', name: 'استاد الواحة', city: 'الفيوم', area: 'طامية',
    price: 500, size: 11, indoor: false, rating: 4.8, reviews: 210, img: 3,
    surface: 'نجيل طبيعي', owner: 'owner2',
    open: 8, close: 23,
    amenities: ['نجيل طبيعي', 'غرف تغيير', 'دش', 'موقف سيارات', 'كاميرات تصوير'],
    about: 'ملعب 11 لاعب بنجيل طبيعي ومدرجات صغيرة، تجربة أقرب للملاعب الرسمية للبطولات والمناسبات.'
  },
  {
    id: 'p04', name: 'ملعب الجزيرة', city: 'القاهرة', area: 'الزمالك',
    price: 400, size: 5, indoor: false, rating: 4.6, reviews: 341, img: 4,
    surface: 'نجيل صناعي', owner: 'owner2',
    open: 10, close: 26,
    amenities: ['إضاءة ليلية', 'كافيتريا', 'تأجير كور', 'موقف سيارات'],
    about: 'في قلب الزمالك، ملعب خماسي بموقع مميز وخدمة كافيتريا على جنب الملعب.'
  },
  {
    id: 'p05', name: 'نادي المدينة', city: 'القاهرة', area: 'مدينة نصر',
    price: 300, size: 7, indoor: false, rating: 4.5, reviews: 198, img: 1,
    surface: 'نجيل صناعي', owner: 'owner2',
    open: 9, close: 25,
    amenities: ['إضاءة ليلية', 'غرف تغيير', 'دش', 'موقف سيارات'],
    about: 'ملعب سباعي في مدينة نصر قريب من كل المواصلات، مثالي لماتشات بعد الشغل.'
  },
  {
    id: 'p06', name: 'ملعب المستقبل', city: 'القاهرة', area: 'التجمع الخامس',
    price: 350, size: 5, indoor: true, rating: 4.9, reviews: 420, img: 2,
    surface: 'نجيل صناعي', owner: 'owner1',
    open: 10, close: 26,
    amenities: ['تكييف', 'إضاءة ليلية', 'غرف تغيير', 'دش', 'كافيتريا', 'تأجير كور'],
    about: 'صالة مغطاة مكيفة بالتجمع الخامس، العب في أي حر ومن غير ما تشيل هم الجو.'
  },
  {
    id: 'p07', name: 'أرينا أكتوبر', city: '6 أكتوبر', area: 'الحي المتميز',
    price: 280, size: 7, indoor: false, rating: 4.3, reviews: 96, img: 3,
    surface: 'نجيل صناعي', owner: 'owner2',
    open: 10, close: 24,
    amenities: ['إضاءة ليلية', 'موقف سيارات', 'كافيتريا'],
    about: 'أرينا سباعية في 6 أكتوبر بمساحات مريحة وموقف سيارات واسع.'
  },
  {
    id: 'p08', name: 'ملعب المعادي كلوب', city: 'القاهرة', area: 'المعادي',
    price: 320, size: 5, indoor: false, rating: 4.6, reviews: 154, img: 4,
    surface: 'نجيل صناعي', owner: 'owner1',
    open: 9, close: 25,
    amenities: ['إضاءة ليلية', 'غرف تغيير', 'دش', 'كافيتريا'],
    about: 'ملعب خماسي هادي في المعادي، نجيل متجدد باستمرار وأجواء عائلية.'
  },
  {
    id: 'p09', name: 'الهرم جرين', city: 'الجيزة', area: 'الهرم',
    price: 220, size: 7, indoor: false, rating: 4.2, reviews: 73, img: 1,
    surface: 'نجيل صناعي', owner: 'owner2',
    open: 10, close: 24,
    amenities: ['إضاءة ليلية', 'تأجير كور'],
    about: 'ملعب سباعي بسعر مناسب في الهرم، احجز بسرعة لأن المواعيد الليلية بتخلص بدري.'
  },
  {
    id: 'p10', name: 'ملعب الشروق', city: 'القاهرة', area: 'مدينة الشروق',
    price: 450, size: 11, indoor: false, rating: 4.7, reviews: 88, img: 2,
    surface: 'نجيل طبيعي', owner: 'owner1',
    open: 8, close: 23,
    amenities: ['نجيل طبيعي', 'غرف تغيير', 'دش', 'سماعات وميكروفون'],
    about: 'ملعب 11 لاعب بنجيل طبيعي في الشروق، مجهز للبطولات بنظام صوتي وتعليق.'
  }
];

const CITIES = ['الكل', ...new Set(PITCHES.map(p => p.city))];

/* ---------- أدوات التواريخ ---------- */

function pad2(n) { return String(n).padStart(2, '0'); }

function dateStr(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function todayStr() { return dateStr(new Date()); }

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function formatDateAr(ds) {
  const d = new Date(ds + 'T12:00:00');
  return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()];
}

function hourLabel(h) {
  const hh = h % 24;
  const suffix = hh >= 12 ? 'م' : 'ص';
  let disp = hh % 12; if (disp === 0) disp = 12;
  return disp + ':00 ' + suffix;
}

function slotLabel(h) { return hourLabel(h) + ' - ' + hourLabel(h + 1); }

/* ---------- توفر المواعيد (بذرة ثابتة للعرض) ---------- */

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

/* مواعيد "محجوزة" بشكل ثابت لكل ملعب ويوم عشان الديمو يبان واقعي */
function seededBookedSlots(pitchId, ds) {
  const pitch = PITCHES.find(p => p.id === pitchId);
  const out = new Set();
  if (!pitch) return out;
  for (let h = pitch.open; h < pitch.close; h++) {
    const v = hashCode(pitchId + '|' + ds + '|' + h) % 100;
    if (v < 28) out.add(h); // حوالي ٢٨٪ من المواعيد محجوزة
  }
  return out;
}

/* ---------- التخزين المحلي ---------- */

const LS_BOOKINGS = 'm3b_bookings_v1';
const LS_BLOCKED = 'm3b_blocked_v1';
const LS_OWNER = 'm3b_owner_demo';

function loadBookings() {
  try { return JSON.parse(localStorage.getItem(LS_BOOKINGS)) || []; } catch (e) { return []; }
}
function saveBookings(b) { localStorage.setItem(LS_BOOKINGS, JSON.stringify(b)); }

function loadBlocked() {
  try { return JSON.parse(localStorage.getItem(LS_BLOCKED)) || {}; } catch (e) { return {}; }
}
function saveBlocked(b) { localStorage.setItem(LS_BLOCKED, JSON.stringify(b)); }

function genCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return 'M3B-' + c;
}
