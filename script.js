/* =====================================================
   ملعبك — منطق التطبيق (Demo build)
   حجوزات محلية على الجهاز فقط (localStorage).
   ===================================================== */

const app = document.getElementById('app');

/* ---------- أدوات عامة ---------- */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.toggle('error', !!isError);
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

function pitchById(id) { return PITCHES.find(p => p.id === id); }

function pitchImg(p) { return 'pitch-' + p.img + '.svg'; }

function stars(r) { return '★ ' + r; }

function pitchCard(p) {
  return `
  <a class="pitch-card" href="#/pitch/${p.id}">
    <div class="thumb">
      <img src="${pitchImg(p)}" alt="${esc(p.name)}" loading="lazy">
      ${p.indoor ? '<span class="badge">صالة مغطاة</span>' : (p.size === 11 ? '<span class="badge gold">نجيل طبيعي</span>' : '')}
    </div>
    <div class="pitch-body">
      <div class="pitch-top">
        <div>
          <div class="pitch-name">${esc(p.name)}</div>
          <div class="pitch-loc">📍 ${esc(p.area)}، ${esc(p.city)}</div>
        </div>
        <div class="rating">${stars(p.rating)} <span>(${p.reviews})</span></div>
      </div>
      <div class="pitch-meta">
        <span class="chip">⚽ ${p.size} لاعبين</span>
        <span class="chip">${esc(p.surface)}</span>
        ${p.indoor ? '<span class="chip">❄️ مكيف</span>' : '<span class="chip">💡 إضاءة ليلية</span>'}
      </div>
      <div class="pitch-foot">
        <div class="price">${p.price} ج.م <small>/ الساعة</small></div>
        <span class="btn btn-ghost" style="padding:7px 16px;font-size:.85rem">احجز</span>
      </div>
    </div>
  </a>`;
}

/* حالة ميعاد: available | booked | blocked | past */
function slotState(pitch, ds, h) {
  const now = new Date();
  if (ds === todayStr() && h <= now.getHours()) return 'past';
  if (seededBookedSlots(pitch.id, ds).has(h)) return 'booked';
  const blocked = loadBlocked();
  if ((blocked[pitch.id + '|' + ds] || []).includes(h)) return 'blocked';
  const mine = loadBookings().some(b =>
    b.pitchId === pitch.id && b.date === ds && b.status !== 'cancelled' && b.slots.includes(h));
  if (mine) return 'booked';
  return 'available';
}

/* ---------- الراوتر ---------- */

function route() {
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  const nav = document.querySelectorAll('.main-nav a');
  nav.forEach(a => a.classList.remove('active'));

  document.getElementById('navToggle').classList.remove('open');
  document.querySelector('.main-nav').classList.remove('open');

  if (parts[0] === '' || parts[0] === 'home') { setNav('home'); viewHome(); }
  else if (parts[0] === 'pitches') { setNav('pitches'); viewPitches(); }
  else if (parts[0] === 'pitch' && parts[1]) { setNav('pitches'); viewPitch(parts[1]); }
  else if (parts[0] === 'confirm' && parts[1]) { viewConfirm(parts[1]); }
  else if (parts[0] === 'my') { setNav('my'); viewMy(); }
  else if (parts[0] === 'owner') { setNav('owner'); viewOwner(); }
  else if (parts[0] === 'how') { setNav('home'); viewHome(true); }
  else { viewHome(); }
  window.scrollTo(0, 0);
}

function setNav(k) {
  const a = document.querySelector('.main-nav a[data-nav="' + k + '"]');
  if (a) a.classList.add('active');
}

window.addEventListener('hashchange', route);

document.getElementById('navToggle').addEventListener('click', () => {
  document.querySelector('.main-nav').classList.toggle('open');
});

/* ---------- الصفحة الرئيسية ---------- */

function viewHome(scrollToHow) {
  const featured = [...PITCHES].sort((a, b) => b.rating - a.rating).slice(0, 3);
  app.innerHTML = `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span class="hero-badge">⚽ نسخة تجريبية — منصة حجز ملاعب</span>
        <h1>ماتشك الجاي يبدأ من هنا.<br><b>احجز ملعبك</b> في دقايق</h1>
        <p class="lead">دور على أقرب ملعب كورة ليك، شوف المواعيد الفاضية لحظة بلحظة، واحجز ساعتك من غير ولا مكالمة تليفون.</p>
        <div class="hero-actions">
          <a href="#/pitches" class="btn btn-primary btn-lg">تصفح الملاعب ⚽</a>
          <a href="#/owner" class="btn btn-ghost btn-lg">عندك ملعب؟</a>
        </div>
        <div class="hero-stats-row">
          <div><div class="num">${PITCHES.length}<b>+</b></div><div class="lbl">ملعب (بيانات تجريبية)</div></div>
          <div><div class="num">${CITIES.length - 1}<b>+</b></div><div class="lbl">مدن</div></div>
          <div><div class="num">24<b>/7</b></div><div class="lbl">حجز أونلاين</div></div>
        </div>
      </div>
      <div class="hero-art">
        <img src="hero.svg" alt="ملعب كرة قدم">
        <div class="hero-stat">
          <div class="num">⚡</div>
          <div class="lbl">تأكيد فوري<br>بكود حجز</div>
        </div>
      </div>
    </div>
  </section>

  <div class="container quick-search">
    <div class="quick-search-card">
      <div class="field">
        <label>ابحث عن ملعب</label>
        <input id="qsText" type="text" placeholder="اسم الملعب أو المنطقة...">
      </div>
      <div class="field">
        <label>المدينة</label>
        <select id="qsCity">${CITIES.map(c => `<option>${c}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>اليوم</label>
        <input id="qsDate" type="date" value="${todayStr()}" min="${todayStr()}">
      </div>
      <button class="btn btn-primary" id="qsGo">دور 🔍</button>
    </div>
  </div>

  <section class="section" id="how">
    <div class="container">
      <div class="section-head">
        <div><h2>إزاي <b>بتحجز</b>؟</h2><div class="sub">3 خطوات وبس</div></div>
      </div>
      <div class="how-grid">
        <div class="how-card"><div class="step-num">1</div><h3>اختار الملعب</h3><p>قارن بين الملاعب حسب المنطقة والسعر وحجم الملعب والتقييمات.</p></div>
        <div class="how-card"><div class="step-num">2</div><h3>حدد اليوم والساعة</h3><p>شوف المواعيد الفاضية على مدار الأسبوع واختار اللي يناسبكم.</p></div>
        <div class="how-card"><div class="step-num">3</div><h3>استلم كود الحجز</h3><p>حجزك بيتأكد فورًا بكود، وتقدر تراجعه أو تلغيه من صفحة حجوزاتي.</p></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-head">
        <div><h2>أعلى الملاعب <b>تقييمًا</b></h2><div class="sub">الأكثر حجزًا في الديمو</div></div>
        <a href="#/pitches" class="btn btn-ghost">شوف الكل ←</a>
      </div>
      <div class="pitch-grid">${featured.map(pitchCard).join('')}</div>
    </div>
  </section>`;

  document.getElementById('qsGo').addEventListener('click', () => {
    const q = document.getElementById('qsText').value.trim();
    const city = document.getElementById('qsCity').value;
    sessionStorage.setItem('m3b_search', JSON.stringify({ q, city }));
    location.hash = '#/pitches';
  });

  if (scrollToHow) {
    setTimeout(() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' }), 60);
  }
}

/* ---------- صفحة الملاعب ---------- */

function viewPitches() {
  const saved = JSON.parse(sessionStorage.getItem('m3b_search') || '{}');
  app.innerHTML = `
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div><h2>كل <b>الملاعب</b></h2><div class="sub">بيانات تجريبية للعرض</div></div>
      </div>
      <div class="filters-bar">
        <div class="field"><label>بحث</label><input id="fText" type="text" placeholder="اسم الملعب أو المنطقة..." value="${esc(saved.q || '')}"></div>
        <div class="field"><label>المدينة</label><select id="fCity">${CITIES.map(c => `<option ${c === saved.city ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label>حجم الملعب</label><select id="fSize"><option value="0">الكل</option><option value="5">خماسي (5)</option><option value="7">سباعي (7)</option><option value="11">11 لاعب</option></select></div>
        <div class="field"><label>أقصى سعر / ساعة</label><select id="fPrice"><option value="0">أي سعر</option><option value="200">حتى 200 ج.م</option><option value="300">حتى 300 ج.م</option><option value="400">حتى 400 ج.م</option><option value="500">حتى 500 ج.م</option></select></div>
        <div class="field"><label>ترتيب حسب</label><select id="fSort"><option value="rating">الأعلى تقييمًا</option><option value="price-asc">السعر: الأقل أولًا</option><option value="price-desc">السعر: الأعلى أولًا</option></select></div>
      </div>
      <div class="results-count" id="resCount"></div>
      <div class="pitch-grid" id="pitchGrid"></div>
    </div>
  </section>`;

  function apply() {
    const q = document.getElementById('fText').value.trim();
    const city = document.getElementById('fCity').value;
    const size = +document.getElementById('fSize').value;
    const maxPrice = +document.getElementById('fPrice').value;
    const sort = document.getElementById('fSort').value;

    let list = PITCHES.filter(p =>
      (!q || p.name.includes(q) || p.area.includes(q) || p.city.includes(q)) &&
      (city === 'الكل' || p.city === city) &&
      (!size || p.size === size) &&
      (!maxPrice || p.price <= maxPrice)
    );
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

    document.getElementById('resCount').innerHTML = `موجود <b>${list.length}</b> ملعب مطابق للبحث`;
    document.getElementById('pitchGrid').innerHTML = list.length
      ? list.map(pitchCard).join('')
      : '<div class="empty-state" style="grid-column:1/-1"><div class="big">🥅</div><p>مفيش ملاعب مطابقة للبحث، جرّب تغير الفلاتر.</p></div>';
  }

  ['fText', 'fCity', 'fSize', 'fPrice', 'fSort'].forEach(id =>
    document.getElementById(id).addEventListener('input', apply));
  apply();
}

/* ---------- صفحة الملعب + الحجز ---------- */

let bookingState = { pitchId: null, date: null, slots: [] };

function viewPitch(id) {
  const p = pitchById(id);
  if (!p) { location.hash = '#/pitches'; return; }
  bookingState = { pitchId: id, date: todayStr(), slots: [] };

  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(new Date(), i));

  app.innerHTML = `
  <section class="section">
    <div class="container">
      <a href="#/pitches" class="muted" style="font-size:.88rem">→ رجوع لكل الملاعب</a>
      <div class="detail-grid" style="margin-top:14px">
        <div>
          <div class="detail-gallery"><img src="${pitchImg(p)}" alt="${esc(p.name)}"></div>
          <div class="detail-title-row">
            <div>
              <h1>${esc(p.name)}</h1>
              <div class="pitch-loc">📍 ${esc(p.area)}، ${esc(p.city)}</div>
            </div>
            <div class="rating" style="font-size:1.1rem">${stars(p.rating)} <span>(${p.reviews} تقييم)</span></div>
          </div>
          <div class="pitch-meta" style="margin:10px 0">
            <span class="chip">⚽ ملعب ${p.size} لاعبين</span>
            <span class="chip">${esc(p.surface)}</span>
            ${p.indoor ? '<span class="chip">❄️ صالة مغطاة</span>' : ''}
            <span class="chip">🕐 مفتوح ${hourLabel(p.open)} - ${hourLabel(p.close)}</span>
          </div>
          <p class="muted" style="margin:8px 0 4px">${esc(p.about)}</p>
          <h3 style="margin:18px 0 4px">المرافق والخدمات</h3>
          <div class="amenities">
            ${p.amenities.map(a => `<span class="amenity">${AMENITY_ICONS[a] || '✔️'} ${esc(a)}</span>`).join('')}
          </div>
          <div class="demo-note">⚠️ دي بيانات ملعب تجريبية للعرض فقط، مش مكان حقيقي والحجز بيتحفظ على جهازك.</div>
        </div>

        <div class="card-box book-panel">
          <div class="price-big">${p.price} ج.م <small>/ الساعة</small></div>
          <hr style="border:none;border-top:1px solid var(--line);margin:14px 0">
          <div class="field"><label>اختار اليوم</label></div>
          <div class="days-strip" id="daysStrip">
            ${days.map((d, i) => {
              const ds = dateStr(d);
              return `<button class="day-pill ${i === 0 ? 'active' : ''}" data-date="${ds}">
                <div class="d-name">${i === 0 ? 'النهارده' : DAY_NAMES[d.getDay()]}</div>
                <div class="d-num">${d.getDate()}</div>
                <div class="d-mon">${MONTH_NAMES[d.getMonth()]}</div>
              </button>`;
            }).join('')}
          </div>
          <div class="slots-legend">
            <span><span class="legend-dot" style="background:var(--green)"></span>متاح</span>
            <span><span class="legend-dot" style="background:#3a5547"></span>محجوز</span>
            <span><span class="legend-dot" style="background:transparent;border:1px dashed var(--gold)"></span>مغلق من الإدارة</span>
          </div>
          <div class="slots-grid" id="slotsGrid"></div>
          <div class="booking-summary" id="bookSummary"></div>
          <div class="field" style="margin-top:10px"><label>الاسم</label><input id="bkName" type="text" placeholder="اسمك"></div>
          <div class="field" style="margin-top:10px"><label>موبايل (اختياري في الديمو)</label><input id="bkPhone" type="tel" placeholder="01xxxxxxxxx — بيانات تجريبية" dir="ltr" style="text-align:end"></div>
          <div class="field" style="margin-top:10px"><label>ملاحظات (اختياري)</label><input id="bkNotes" type="text" placeholder="مثال: محتاجين كورة"></div>
          <button class="btn btn-primary btn-block btn-lg" id="bkConfirm" style="margin-top:14px" disabled>اختار ميعاد الأول</button>
          <p class="muted" style="font-size:.78rem;text-align:center;margin-top:10px">الدفع في الملعب — حجز تجريبي بكود فوري</p>
        </div>
      </div>
    </div>
  </section>`;

  document.querySelectorAll('#daysStrip .day-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#daysStrip .day-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bookingState.date = btn.dataset.date;
      bookingState.slots = [];
      renderSlots();
    });
  });

  document.getElementById('bkConfirm').addEventListener('click', confirmBooking);
  renderSlots();
}

function renderSlots() {
  const p = pitchById(bookingState.pitchId);
  const grid = document.getElementById('slotsGrid');
  const confirmBtn = document.getElementById('bkConfirm');
  const summary = document.getElementById('bookSummary');

  let html = '';
  for (let h = p.open; h < p.close; h++) {
    const st = slotState(p, bookingState.date, h);
    const sel = bookingState.slots.includes(h);
    const disabled = st !== 'available';
    const cls = sel ? 'slot selected' : (disabled ? 'slot ' + (st === 'past' ? 'booked' : st) : 'slot');
    html += `<button class="${cls}" data-hour="${h}" ${disabled ? 'disabled' : ''}>${slotLabel(h)}</button>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.slot:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const h = +btn.dataset.hour;
      const i = bookingState.slots.indexOf(h);
      if (i >= 0) bookingState.slots.splice(i, 1);
      else bookingState.slots.push(h);
      bookingState.slots.sort((a, b) => a - b);
      renderSlots();
    });
  });

  const n = bookingState.slots.length;
  if (n > 0) {
    const total = n * p.price;
    const first = bookingState.slots[0], last = bookingState.slots[n - 1];
    const continuous = bookingState.slots.every((h, i) => h === first + i);
    summary.classList.add('show');
    summary.innerHTML = `📅 ${formatDateAr(bookingState.date)} &nbsp;|&nbsp; ⏰ ${hourLabel(first)} - ${hourLabel(last + 1)} &nbsp;|&nbsp; ${n} ساعة &nbsp;|&nbsp; الإجمالي: <span class="total">${total} ج.م</span>${continuous ? '' : '<br><span style="color:var(--gold);font-size:.82rem">ملحوظة: المواعيد المختارة مش ورا بعض</span>'}`;
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'أكد الحجز — ' + total + ' ج.م';
  } else {
    summary.classList.remove('show');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'اختار ميعاد الأول';
  }
}

function confirmBooking() {
  const name = document.getElementById('bkName').value.trim();
  const phone = document.getElementById('bkPhone').value.trim();
  const notes = document.getElementById('bkNotes').value.trim();

  if (!bookingState.slots.length) { toast('اختار ميعاد الأول', true); return; }
  if (name.length < 2) { toast('اكتب اسمك عشان نسجل الحجز', true); return; }

  const p = pitchById(bookingState.pitchId);
  /* تأكد إن المواعيد لسه فاضية */
  for (const h of bookingState.slots) {
    if (slotState(p, bookingState.date, h) !== 'available') {
      toast('ميعاد من اللي اخترته اتحجز للأسف، اختار ميعاد تاني', true);
      renderSlots();
      return;
    }
  }

  const booking = {
    code: genCode(),
    pitchId: p.id,
    date: bookingState.date,
    slots: [...bookingState.slots],
    name, phone, notes,
    total: bookingState.slots.length * p.price,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };
  const all = loadBookings();
  all.push(booking);
  saveBookings(all);
  location.hash = '#/confirm/' + booking.code;
}

/* ---------- صفحة التأكيد ---------- */

function viewConfirm(code) {
  const b = loadBookings().find(x => x.code === code);
  if (!b) { location.hash = '#/pitches'; return; }
  const p = pitchById(b.pitchId);
  const first = b.slots[0], last = b.slots[b.slots.length - 1];

  app.innerHTML = `
  <section class="section">
    <div class="container confirm-wrap">
      <div class="card-box confirm-card">
        <div class="confirm-icon">✅</div>
        <h1 style="font-size:1.6rem">حجزك اتسجل!</h1>
        <p class="muted">احتفظ بكود الحجز ده، هتحتاجه في الملعب أو لو عايز تلغي</p>
        <div class="booking-code">${esc(b.code)}</div>
        <div class="confirm-details">
          <div class="detail-row"><span class="k">الملعب</span><span class="v">${esc(p.name)} — ${esc(p.area)}، ${esc(p.city)}</span></div>
          <div class="detail-row"><span class="k">اليوم</span><span class="v">${formatDateAr(b.date)}</span></div>
          <div class="detail-row"><span class="k">المعاد</span><span class="v">${hourLabel(first)} - ${hourLabel(last + 1)} (${b.slots.length} ساعة)</span></div>
          <div class="detail-row"><span class="k">الاسم</span><span class="v">${esc(b.name)}</span></div>
          <div class="detail-row"><span class="k">الإجمالي</span><span class="v" style="color:var(--green)">${b.total} ج.م — الدفع في الملعب</span></div>
        </div>
        <div class="demo-note">⚠️ حجز تجريبي محفوظ على جهازك بس — في النسخة الحقيقية هيوصل تأكيد لصاحب الملعب وإشعار ليك.</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap">
          <a href="#/my" class="btn btn-primary">حجوزاتي</a>
          <a href="#/pitches" class="btn btn-ghost">احجز ملعب تاني</a>
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- حجوزاتي ---------- */

function viewMy() {
  const all = loadBookings().sort((a, b) => (a.date + a.slots[0]).localeCompare(b.date + b.slots[0]));

  app.innerHTML = `
  <section class="section">
    <div class="container" style="max-width:760px">
      <div class="section-head">
        <div><h2><b>حجوزاتي</b></h2><div class="sub">الحجوزات المحفوظة على جهازك في الديمو ده</div></div>
      </div>
      <div id="myList"></div>
    </div>
  </section>`;

  const list = document.getElementById('myList');
  if (!all.length) {
    list.innerHTML = `<div class="empty-state"><div class="big">📋</div><p>لسه مفيش حجوزات على الجهاز ده.</p><a href="#/pitches" class="btn btn-primary" style="margin-top:14px">احجز أول ماتش</a></div>`;
    return;
  }

  list.innerHTML = all.map(b => {
    const p = pitchById(b.pitchId);
    const d = new Date(b.date + 'T12:00:00');
    const first = b.slots[0], last = b.slots[b.slots.length - 1];
    const cancelled = b.status === 'cancelled';
    return `
    <div class="booking-card">
      <div class="b-date"><div class="n">${d.getDate()}</div><div class="m">${MONTH_NAMES[d.getMonth()]}</div><div class="m">${DAY_NAMES[d.getDay()]}</div></div>
      <div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <b>${esc(p.name)}</b>
          <span class="status-pill ${cancelled ? 'status-cancelled' : 'status-confirmed'}">${cancelled ? 'ملغي' : 'مؤكد'}</span>
        </div>
        <div class="muted" style="font-size:.86rem">⏰ ${hourLabel(first)} - ${hourLabel(last + 1)} &nbsp;|&nbsp; 💰 ${b.total} ج.م &nbsp;|&nbsp; كود: <b style="color:var(--green)">${esc(b.code)}</b></div>
        <div class="muted" style="font-size:.82rem">📍 ${esc(p.area)}، ${esc(p.city)}</div>
      </div>
      <div class="b-actions">
        ${cancelled ? '' : `<button class="btn btn-danger" style="padding:8px 16px;font-size:.84rem" data-cancel="${esc(b.code)}">إلغاء الحجز</button>`}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.cancel;
      const bookings = loadBookings();
      const b = bookings.find(x => x.code === code);
      if (b) { b.status = 'cancelled'; saveBookings(bookings); toast('اتلغى الحجز ' + code); viewMy(); }
    });
  });
}

/* ---------- لوحة صاحب الملعب (ديمو) ---------- */

let ownerState = { pitchId: null, date: null };

function viewOwner() {
  const loggedIn = sessionStorage.getItem(LS_OWNER) === '1';
  if (!loggedIn) {
    app.innerHTML = `
    <section class="section">
      <div class="container owner-hero">
        <div style="font-size:3rem;margin-bottom:10px">🏟️</div>
        <h1 style="font-size:1.8rem;margin-bottom:10px">لوحة تحكم صاحب الملعب</h1>
        <p class="muted" style="margin-bottom:22px">تابع حجوزات ملعبك، اقفل مواعيد للصيانة، وشوف إحصائيات الأسبوع — كل ده من مكان واحد.</p>
        <button class="btn btn-primary btn-lg" id="ownerLogin">دخول تجريبي للوحة التحكم</button>
        <div class="demo-note" style="text-align:start">⚠️ زر الدخول ده للعرض فقط ومش تسجيل دخول حقيقي. في النسخة الفعلية هيبقى فيه حسابات وصلاحيات لكل صاحب ملعب.</div>
      </div>
    </section>`;
    document.getElementById('ownerLogin').addEventListener('click', () => {
      sessionStorage.setItem(LS_OWNER, '1');
      toast('دخلت وضع العرض التجريبي');
      viewOwner();
    });
    return;
  }

  const myPitches = PITCHES.filter(p => p.owner === 'owner1');
  if (!ownerState.pitchId || !myPitches.some(p => p.id === ownerState.pitchId)) {
    ownerState.pitchId = myPitches[0].id;
  }
  if (!ownerState.date) ownerState.date = todayStr();

  const bookings = loadBookings().filter(b => b.status !== 'cancelled');
  const mine = bookings.filter(b => myPitches.some(p => p.id === b.pitchId));
  const today = mine.filter(b => b.date === todayStr());
  const weekRevenue = mine
    .filter(b => b.date >= todayStr() && b.date <= dateStr(addDays(new Date(), 7)))
    .reduce((s, b) => s + b.total, 0);

  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(new Date(), i));

  app.innerHTML = `
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div><h2>لوحة <b>صاحب الملعب</b> <span class="status-pill status-blocked-slot" style="vertical-align:middle">وضع تجريبي</span></h2>
        <div class="sub">البيانات محلية على جهازك للعرض فقط</div></div>
        <button class="btn btn-ghost" id="ownerExit" style="padding:8px 16px;font-size:.85rem">خروج من الوضع التجريبي</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="num">${today.length}</div><div class="lbl">حجوزات النهارده</div></div>
        <div class="stat-card"><div class="num">${mine.length}</div><div class="lbl">كل الحجوزات الجاية</div></div>
        <div class="stat-card"><div class="num">${weekRevenue} ج.م</div><div class="lbl">متوقع الأسبوع ده</div></div>
        <div class="stat-card"><div class="num">${myPitches.length}</div><div class="lbl">ملاعب تحت إدارتك</div></div>
      </div>

      <div class="owner-tabs" id="ownerTabs">
        ${myPitches.map(p => `<button class="owner-tab ${p.id === ownerState.pitchId ? 'active' : ''}" data-pitch="${p.id}">${esc(p.name)}</button>`).join('')}
      </div>

      <div class="detail-grid">
        <div class="card-box">
          <h3 style="margin-bottom:14px">📋 الحجوزات</h3>
          <div class="table-wrap" id="ownerBookings"></div>
        </div>
        <div class="card-box">
          <h3 style="margin-bottom:6px">🔒 قفل المواعيد</h3>
          <p class="muted" style="font-size:.84rem;margin-bottom:8px">اقفل ميعاد للصيانة أو مناسبة خاصة</p>
          <div class="days-strip" id="ownerDays">
            ${days.map((d, i) => {
              const ds = dateStr(d);
              return `<button class="day-pill ${i === 0 ? 'active' : ''}" data-date="${ds}">
                <div class="d-name">${i === 0 ? 'النهارده' : DAY_NAMES[d.getDay()]}</div>
                <div class="d-num">${d.getDate()}</div>
                <div class="d-mon">${MONTH_NAMES[d.getMonth()]}</div>
              </button>`;
            }).join('')}
          </div>
          <div class="slots-grid" id="ownerSlots"></div>
          <p class="muted" style="font-size:.78rem;margin-top:6px">اضغط على أي ميعاد متاح لقفله، أو على ميعاد مغلق لفتحه تاني.</p>
        </div>
      </div>
    </div>
  </section>`;

  document.getElementById('ownerExit').addEventListener('click', () => {
    sessionStorage.removeItem(LS_OWNER);
    viewOwner();
  });

  document.querySelectorAll('#ownerTabs .owner-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      ownerState.pitchId = btn.dataset.pitch;
      viewOwner();
    });
  });

  document.querySelectorAll('#ownerDays .day-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ownerDays .day-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ownerState.date = btn.dataset.date;
      renderOwnerSlots();
    });
  });

  renderOwnerBookings();
  renderOwnerSlots();
}

function renderOwnerBookings() {
  const p = pitchById(ownerState.pitchId);
  const rows = loadBookings()
    .filter(b => b.pitchId === p.id)
    .sort((a, b) => (a.date + a.slots[0]).localeCompare(b.date + b.slots[0]));
  const box = document.getElementById('ownerBookings');
  if (!rows.length) {
    box.innerHTML = '<div class="empty-state" style="padding:30px"><div class="big">📭</div><p>مفيش حجوزات لسه على الملعب ده. جرّب تحجز من واجهة اللاعب وهتظهر هنا.</p></div>';
    return;
  }
  box.innerHTML = `<table class="data-table">
    <thead><tr><th>الكود</th><th>اليوم</th><th>المعاد</th><th>الاسم</th><th>الإجمالي</th><th>الحالة</th></tr></thead>
    <tbody>${rows.map(b => `
      <tr>
        <td><b style="color:var(--green)">${esc(b.code)}</b></td>
        <td>${formatDateAr(b.date)}</td>
        <td>${hourLabel(b.slots[0])} - ${hourLabel(b.slots[b.slots.length - 1] + 1)}</td>
        <td>${esc(b.name)}</td>
        <td>${b.total} ج.م</td>
        <td><span class="status-pill ${b.status === 'cancelled' ? 'status-cancelled' : 'status-confirmed'}">${b.status === 'cancelled' ? 'ملغي' : 'مؤكد'}</span></td>
      </tr>`).join('')}</tbody>
  </table>`;
}

function renderOwnerSlots() {
  const p = pitchById(ownerState.pitchId);
  const grid = document.getElementById('ownerSlots');
  const blocked = loadBlocked();
  const key = p.id + '|' + ownerState.date;
  const blockedList = blocked[key] || [];

  let html = '';
  for (let h = p.open; h < p.close; h++) {
    const st = slotState(p, ownerState.date, h);
    const isBlocked = blockedList.includes(h);
    const cls = isBlocked ? 'slot blocked' : (st === 'booked' || st === 'past' ? 'slot booked' : 'slot');
    const clickable = !(st === 'booked' || st === 'past');
    html += `<button class="${cls}" data-hour="${h}" ${clickable ? '' : 'disabled'}>${slotLabel(h)}</button>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.slot:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const h = +btn.dataset.hour;
      const all = loadBlocked();
      const k = ownerState.pitchId + '|' + ownerState.date;
      all[k] = all[k] || [];
      const i = all[k].indexOf(h);
      if (i >= 0) { all[k].splice(i, 1); toast('الميعاد اتفتح تاني'); }
      else { all[k].push(h); toast('اتقفل الميعاد ' + slotLabel(h)); }
      saveBlocked(all);
      renderOwnerSlots();
    });
  });
}

/* ---------- تشغيل ---------- */
route();
