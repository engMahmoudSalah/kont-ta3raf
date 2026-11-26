'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = { token: localStorage.kt_token || '', user: null, home: null };
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 2600); };
async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, { method, headers: { 'content-type': 'application/json', ...(S.token ? { authorization: 'Bearer ' + S.token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error || 'خطأ'); e.status = r.status; throw e; }
  return d;
}
const TYPES = { video: 'فيديو', article: 'مقال', guide: 'دليل', checklist: 'قائمة' };
const TICON = { video: '▶', article: '📰', guide: '🧭', checklist: '✅' };
const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
const catOf = id => (S.home.cats.find(c => c.id === id) || { name: '', color: '#1B1B1F', icon: '✦' });
const date = t => new Date(t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });

function mascot(cls = '') {
  return `<svg class="mascot ${cls}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#181818"/><g class="eyes"><circle cx="33.2" cy="45" r="14.4" fill="#FBFBF9"/><circle cx="66.8" cy="45" r="14.4" fill="#FBFBF9"/><circle cx="31" cy="45" r="5.3" fill="#181818"/><circle cx="65" cy="45" r="5.3" fill="#181818"/></g><path d="M23 27l20-2.4M57 24.6l20 2.4" stroke="#EF642D" stroke-width="3.4"/><path d="M41.5 67q8.5 8 17 0" fill="none" stroke="#FBFBF9" stroke-width="2.8" stroke-linecap="round"/></svg>`;
}
const cloud = cls => `<svg class="${cls}" viewBox="0 0 120 80" aria-hidden="true"><path d="M22 66q-16-2-14-18 2-14 18-14 6-22 32-20 20 2 22 20 22-2 24 18 0 14-18 14z" fill="#FBFBF9" stroke="#181818" stroke-width="5" stroke-linejoin="round"/></svg>`;
function art() {
  const rays = [0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => `<line x1="50" y1="6" x2="50" y2="18" stroke="#F0B400" stroke-width="7" stroke-linecap="round" transform="rotate(${a} 50 50)"/>`).join('');
  return `<div class="hero-art">${cloud('c1')}${cloud('c2')}
  <svg class="sunb" viewBox="0 0 100 100" aria-hidden="true">${rays}<circle cx="50" cy="50" r="24" fill="#F0B400" stroke="#181818" stroke-width="5"/></svg>
  ${mascot('big')}
  <svg class="bang" viewBox="0 0 40 100" aria-hidden="true"><rect x="5" y="3" width="30" height="58" rx="10" fill="#EF642D" stroke="#181818" stroke-width="4"/><circle cx="20" cy="82" r="14" fill="#EF642D" stroke="#181818" stroke-width="4"/></svg></div>`;
}
const emptyBox = t => `<div class="empty">${mascot()}${t}</div>`;
function card(i) {
  const c = catOf(i.cat);
  return `<a class="card" href="#/item/${esc(i.id)}">${i.cover ? `<div class="th cov"><em>${esc(c.name)}</em><img src="${esc(i.cover)}" alt="${esc(i.title)}" loading="lazy"></div>` : `<div class="th" style="background:${c.color}"><em>${esc(c.name)}</em>${mascot()}</div>`}
  <div class="bd"><div class="meta">${i.ep ? `<span class="pill y">حلقة ${i.ep}</span>` : ''}${i.publishAt > Date.now() ? '<span class="pill r">مجدول</span>' : ''}<span>${TICON[i.type] || ''} ${TYPES[i.type] || ''}</span><span>${i.minutes} د</span><span>👁 ${fmt(i.views)}</span></div>
  <h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></div></a>`;
}
function md(t) {
  const out = []; let ul = false;
  for (const raw of String(t).split('\n')) {
    const l = raw.trim();
    if (l.startsWith('- ')) { if (!ul) { out.push('<ul>'); ul = true; } out.push(`<li><span>${esc(l.slice(2))}</span></li>`); continue; }
    if (ul) { out.push('</ul>'); ul = false; }
    if (l.startsWith('## ')) out.push(`<h2>${esc(l.slice(3))}</h2>`); else if (l) out.push(`<p>${esc(l)}</p>`);
  }
  if (ul) out.push('</ul>'); return out.join('');
}
function shell(inner, route) {
  const s = S.home.settings; const u = S.user;
  const link = (h, t) => `<a href="#${h}" class="${route === h ? 'on' : ''}">${t}</a>`;
  $('#app').innerHTML = `${s.announcement ? `<div class="ann">${esc(s.announcement)}</div>` : ''}
  <header class="top"><div class="wrap"><a class="logo" href="#/">${mascot()}${esc(s.siteName)}</a>
  <button class="burger" aria-label="القائمة" onclick="document.querySelector('nav.m').classList.toggle('open')">☰</button>
  <nav class="m" onclick="this.classList.remove('open')">${link('/', 'الرئيسية')}${link('/episodes', 'الحلقات')}${link('/explore', 'استكشف')}${s.showPlans ? link('/plans', 'الخطط') : ''}${link('/suggest', 'اقترح موضوعاً')}
  ${u ? `${u.role !== 'user' ? link('/admin', 'لوحة التحكم') : ''}${link('/account', 'حسابي')}` : `${link('/login', 'دخول')}<a class="btn sm" href="#/signup">انضم مجاناً</a>`}</nav></div></header>
  <main>${inner}</main>
  <footer><div class="wrap"><div><b style="font-size:20px">${esc(s.siteName)}</b><br>معلومة قصيرة كل يوم، مصنّفة ومراجعة.</div>
  <div>${s.youtube ? `<a href="${esc(s.youtube)}" target="_blank" rel="noopener">يوتيوب</a> · ` : ''}${s.tiktok ? `<a href="${esc(s.tiktok)}" target="_blank" rel="noopener">تيك توك</a>` : ''}<br><a href="#/suggest">اقترح موضوعاً</a></div></div></footer>`;
  scrollTo(0, 0);
}

// ---------- pages ----------
function pHome() {
  const { settings: s, cats, items } = S.home; const feat = items.filter(i => i.featured).slice(0, 2);
  const latest = [...items].sort((a, b) => b.created - a.created).slice(0, 6);
  shell(`<section class="hero"><div class="wrap"><div><span class="kick">معلومة قصيرة، قيمة كبيرة</span>
  <h1>${esc(s.heroTitle)}</h1><p class="sub">${esc(s.heroSub)}</p>
  <div class="say" style="max-width:420px;margin-bottom:18px">${mascot()}<span>أنا ماسكوت القناة. أسأل "كنت تعرف؟" وأجاوب بسرعة.</span></div><div class="cta"><a class="btn red" href="#/explore">ابدأ الاستكشاف ←</a><a class="btn w" href="#/signup">أنشئ حسابك</a></div></div>${art()}</div></section>
  <div class="marq"><div>${cats.map(c => `${c.icon} ${esc(c.name)}`).join(' &nbsp;✦&nbsp; ')} &nbsp;✦&nbsp; ${cats.map(c => `${c.icon} ${esc(c.name)}`).join(' &nbsp;✦&nbsp; ')}</div></div>
  <section class="s"><div class="wrap"><div class="h2">اختر عالمك<small>ست تصنيفات، وكل واحد فيه ما يستحق أن تعرفه</small></div>
  <div class="cats">${cats.map(c => `<a class="cat" href="#/explore/${c.id}"><div class="ic" style="background:${c.color}33">${c.icon}</div><b>${esc(c.name)}</b><span>${c.count} عنصر</span></a>`).join('')}</div></div></section>
  ${feat.length ? `<section class="s" style="padding-top:0"><div class="wrap"><div class="h2">مختارات<small>ابدأ من هنا</small></div><div class="feat" style="margin-top:22px">${feat.map(card).join('')}</div></div></section>` : ''}
  <section class="s" style="padding-top:0"><div class="wrap"><div class="h2">الأحدث</div><div class="grid">${latest.map(card).join('')}</div>
  <p style="text-align:center;margin-top:24px"><a class="btn" href="#/explore">كل المحتوى</a></p></div></section>
  <section class="s"><div class="wrap"><div class="h2">كيف يعمل؟</div><div class="how">
  <div><b class="n">1</b><b>تصفّح</b><br>محتوى مصنّف حسب الموضوع والنوع.</div>
  <div><b class="n">2</b><b>احفظ وتابع</b><br>أضف للمفضلة وعلّم ما أنهيته.</div>
  <div><b class="n">3</b><b>شارك وناقش</b><br>علّق واقترح موضوع الحلقة القادمة.</div></div></div></section>
  <section class="s" style="padding-top:0"><div class="wrap"><div class="cta-band"><h2>جاهز تعرف أكثر؟</h2><a class="btn" href="#/signup">انضم مجاناً</a></div></div></section>`, '/');
}
function pEpisodes() {
  const eps = S.home.items.filter(i => i.ep).sort((a, b) => b.ep - a.ep);
  shell(`<section class="s"><div class="wrap"><div class="h2">الحلقات<small>حلقة جديدة كل يوم، من الأحدث إلى الأقدم</small></div>
  <div class="grid" style="grid-template-columns:1fr;max-width:760px">${eps.map(i => `<a class="card" href="#/item/${esc(i.id)}" ><div style="aspect-ratio:16/9;border-bottom:var(--b);background:var(--ink);display:grid;place-items:center">${i.cover ? `<img src="${esc(i.cover)}" alt="${esc(i.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">` : mascot()}</div>
  <div class="bd"><div class="meta"><span class="pill y">حلقة ${i.ep}</span><span>${esc(catOf(i.cat).name)}</span><span>${i.minutes} د</span></div><h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></div></a>`).join('') || emptyBox('الحلقات قريباً')}</div></div></section>`, '/episodes');
}
function pExplore(cat) {
  const { cats, items } = S.home; const st = { cat: cat || '', type: '', q: '' };
  shell(`<section class="s"><div class="wrap"><div class="h2">استكشف</div>
  <div class="bar"><input id="q" placeholder="ابحث عن معلومة..." style="max-width:320px"></div>
  <div class="bar" id="fc"></div><div class="bar" id="ft"></div><div class="grid" id="res"></div></div></section>`, '/explore');
  const draw = () => {
    $('#fc').innerHTML = `<span class="chip ${!st.cat ? 'on' : ''}" data-c="">الكل</span>` + cats.map(c => `<span class="chip ${st.cat === c.id ? 'on' : ''}" data-c="${c.id}">${c.icon} ${esc(c.name)}</span>`).join('');
    $('#ft').innerHTML = `<span class="chip ${!st.type ? 'on' : ''}" data-t="">كل الأنواع</span>` + Object.entries(TYPES).map(([k, v]) => `<span class="chip ${st.type === k ? 'on' : ''}" data-t="${k}">${v}</span>`).join('');
    const q = st.q.trim().toLowerCase();
    const r = items.filter(i => (!st.cat || i.cat === st.cat) && (!st.type || i.type === st.type) && (!q || (i.title + i.summary + (i.tags || []).join(' ')).toLowerCase().includes(q)));
    $('#res').innerHTML = r.length ? r.map(card).join('') : `<div style="grid-column:1/-1">${emptyBox('لا نتائج. جرّب كلمة أخرى.')}</div>`;
  };
  draw();
  $('#q').oninput = e => { st.q = e.target.value; draw(); };
  $('#fc').onclick = e => { if (e.target.dataset.c !== undefined) { st.cat = e.target.dataset.c; draw(); } };
  $('#ft').onclick = e => { if (e.target.dataset.t !== undefined) { st.type = e.target.dataset.t; draw(); } };
}
async function pItem(id) {
  let d; try { d = await api('/items/' + id); } catch { return shell(emptyBox('المحتوى غير موجود'), ''); }
  const i = d.item, c = catOf(i.cat), u = S.user;
  const saved = u && u.bookmarks.includes(i.id), done = u && u.done.includes(i.id);
  const cm = list => list.length ? list.map(x => `<div class="cm"><b>${esc(x.by)}</b> <small>${date(x.t)}${x.status !== 'ok' ? ' · ' + (x.status === 'pending' ? 'بانتظار المراجعة' : 'مخفي') : ''}</small><div>${esc(x.text)}</div>${x.reply ? `<div class="rp"><b>${x.reply.auto ? 'ردّ تلقائي' : 'فريق ' + esc(S.home.settings.siteName)}:</b> ${esc(x.reply.text)}</div>` : ''}</div>`).join('') : emptyBox('كن أول من يعلّق');
  shell(`<div class="wrap"><article class="post"><a class="chip" href="#/explore/${i.cat}" style="background:${c.color}33">${c.icon} ${esc(c.name)}</a> <span class="chip">${TYPES[i.type]}</span>${i.ep ? ` <span class="chip" style="background:var(--yellow)">الحلقة ${i.ep}</span>` : ''}
  <h1>${esc(i.title)}</h1><div class="meta"><span>${i.minutes} دقائق</span><span>👁 ${fmt(i.views)}</span><span id="lk">❤ ${i.likes}</span><span>${date(i.created)}</span></div>
  ${i.cover && !i.youtube ? `<div class="pcover"><img src="${esc(i.cover)}" alt="${esc(i.title)}"></div>` : ''}${i.youtube ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(i.youtube)}" allowfullscreen loading="lazy" title="${esc(i.title)}"></iframe></div>` : ''}
  <p style="font-weight:900;font-size:20px;margin-top:16px">${esc(i.summary)}</p>${md(i.body)}${i.short ? `<h2>النسخة القصيرة (Short)</h2><div class="vid" style="aspect-ratio:9/16;max-width:320px"><iframe src="https://www.youtube-nocookie.com/embed/${esc(i.short)}" allowfullscreen loading="lazy" title="Short"></iframe></div>` : ''}${i.credit ? `<p style="font-size:14px;color:var(--grey)">${esc(i.credit)}</p>` : ''}${(d.prev || d.next) ? `<div class="bar" style="justify-content:space-between">${d.next ? `<a class="btn sm w" href="#/item/${esc(d.next.id)}">الحلقة ${d.next.ep} ←</a>` : '<span></span>'}${d.prev ? `<a class="btn sm w" href="#/item/${esc(d.prev.id)}">→ الحلقة ${d.prev.ep}</a>` : ''}</div>` : ''}
  <div class="bar" style="margin-top:24px"><button class="btn red sm" id="b-like">❤ أعجبني</button><button class="btn sm" id="b-save">${saved ? '★ محفوظ' : '☆ احفظ'}</button><button class="btn blue sm" id="b-done">${done ? '✔ تمت القراءة' : 'علّمه كمقروء'}</button>
  <button class="btn w sm" id="b-share">مشاركة</button></div>
  ${i.tiktok ? `<p><a class="chip" href="${esc(i.tiktok)}" target="_blank" rel="noopener">شاهده على تيك توك</a></p>` : ''}
  <h2 style="margin-top:36px">التعليقات</h2><div id="cms">${cm(d.comments)}</div>
  ${u ? `<label class="f">أضف تعليقاً</label><textarea id="ct" maxlength="600"></textarea><p style="margin-top:8px"><button class="btn sm" id="b-cm">أرسل</button></p><div class="err" id="ce"></div>` : '<p class="empty"><a class="btn sm" href="#/login">سجّل الدخول للتعليق</a></p>'}
  ${d.related.length ? `<h2 style="margin-top:36px">قد يعجبك</h2><div class="grid" style="grid-template-columns:1fr">${d.related.map(card).join('')}</div>` : ''}</article></div>`, '');
  const need = () => { if (!S.user) { toast('سجّل الدخول أولاً'); location.hash = '#/login'; return true; } };
  $('#b-like').onclick = async () => { try { const r = await api(`/items/${i.id}/like`, 'POST'); $('#lk').textContent = '❤ ' + r.likes; } catch (e) { toast(e.message); } };
  $('#b-save').onclick = async () => { if (need()) return; const r = await api('/me/bookmark', 'POST', { id: i.id }); S.user.bookmarks = r.bookmarks; $('#b-save').textContent = r.bookmarks.includes(i.id) ? '★ محفوظ' : '☆ احفظ'; };
  $('#b-done').onclick = async () => { if (need()) return; const r = await api('/me/done', 'POST', { id: i.id }); S.user.done = r.done; $('#b-done').textContent = r.done.includes(i.id) ? '✔ تمت القراءة' : 'علّمه كمقروء'; };
  $('#b-share').onclick = async () => { try { if (navigator.share) await navigator.share({ title: i.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast('تم نسخ الرابط'); } } catch { } };
  if ($('#b-cm')) $('#b-cm').onclick = async () => { try { await api(`/items/${i.id}/comments`, 'POST', { text: $('#ct').value }); pItem(i.id); } catch (e) { $('#ce').textContent = e.message; } };
}
function pAuth(mode) {
  const sign = mode === 'signup', setup = mode === 'setup';
  shell(`<div class="wrap"><div class="box auth"><div class="h2">${setup ? 'إعداد الأدمن' : sign ? 'حساب جديد' : 'تسجيل الدخول'}</div>
  <form id="af">${sign || setup ? '<label class="f">الاسم</label><input name="name" maxlength="40">' : ''}
  <label class="f">البريد</label><input name="email" type="email" required autocomplete="email">
  <label class="f">كلمة المرور</label><input name="password" type="password" required minlength="8" autocomplete="${sign || setup ? 'new-password' : 'current-password'}">
  ${setup ? '<label class="f">مفتاح الإعداد</label><input name="key" type="password" required autocomplete="off">' : ''}
  <p style="margin-top:16px"><button class="btn red" style="width:100%;justify-content:center">${sign ? 'إنشاء الحساب' : setup ? 'إنشاء الأدمن' : 'دخول'}</button></p><div class="err" id="ae"></div></form>
  <p style="margin-top:14px;font-size:14px">${sign ? 'عندك حساب؟ <a href="#/login"><b>ادخل</b></a>' : setup ? '' : 'جديد هنا؟ <a href="#/signup"><b>أنشئ حساباً</b></a>'}</p></div></div>`, '/login');
  $('#af').onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    try { const r = await api(setup ? '/auth/setup' : sign ? '/auth/signup' : '/auth/login', 'POST', f); S.token = r.token; localStorage.kt_token = r.token; S.user = r.user; toast('أهلاً ' + r.user.name); location.hash = r.user.role === 'admin' ? '#/admin' : '#/account'; }
    catch (x) { $('#ae').textContent = x.message; }
  };
}
async function pAccount() {
  if (!S.user) return (location.hash = '#/login');
  const u = S.user, items = S.home.items, saved = items.filter(i => u.bookmarks.includes(i.id)), done = items.filter(i => u.done.includes(i.id));
  const pct = items.length ? Math.round(done.length / items.length * 100) : 0;
  shell(`<div class="wrap"><section class="s"><div class="h2">أهلاً ${esc(u.name)}<small>${esc(u.email)} · خطة ${u.plan === 'plus' ? 'بلس' : 'مجانية'}</small></div>
  <div class="kp" style="margin:20px 0"><div><b>${saved.length}</b><span>محفوظ</span></div><div><b>${done.length}</b><span>مقروء</span></div><div><b>${pct}%</b><span>تقدّمك</span></div></div>
  <div class="h2" style="font-size:24px">المفضلة</div><div class="grid">${saved.map(card).join('') || `<div style="grid-column:1/-1">${emptyBox('لم تحفظ شيئاً بعد')}</div>`}</div>
  <div class="box" style="margin-top:30px;max-width:460px"><b>الملف الشخصي</b><label class="f">الاسم</label><input id="pn" value="${esc(u.name)}"><label class="f">كلمة مرور جديدة (اختياري)</label><input id="pp" type="password" autocomplete="new-password">
  <p style="margin-top:12px"><button class="btn sm" id="ps">حفظ</button> <button class="btn w sm" id="lo">خروج</button></p></div></section></div>`, '/account');
  $('#ps').onclick = async () => { try { S.user = { ...S.user, ...await api('/me/profile', 'POST', { name: $('#pn').value, password: $('#pp').value }) }; toast('تم الحفظ'); } catch (e) { toast(e.message); } };
  $('#lo').onclick = async () => { await api('/me/logout', 'POST').catch(() => { }); S.token = ''; S.user = null; localStorage.removeItem('kt_token'); location.hash = '#/'; };
}
function pPlans() {
  const s = S.home.settings;
  shell(`<div class="wrap"><section class="s"><div class="h2">الخطط<small>ابدأ مجاناً</small></div><div class="plans">${s.plans.map((p, k) => `<div class="plan ${k ? 'hi' : ''}"><h3>${esc(p.name)}</h3><div class="pr">${p.soon ? 'قريباً' : 'مجاناً'}</div><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><a class="btn ${k ? '' : 'red'}" href="#/signup">${p.soon ? 'سجّل لتُبلَّغ' : 'ابدأ الآن'}</a></div>`).join('')}</div></section></div>`, '/plans');
}
function pSuggest() {
  shell(`<div class="wrap"><div class="box auth"><div class="h2">اقترح موضوعاً<small>ما الذي تتمنى أن نشرحه؟</small></div><textarea id="st" maxlength="500" placeholder="مثال: لماذا نشعر بالدوار في السيارة؟"></textarea><p style="margin-top:12px"><button class="btn red" id="sb">إرسال</button></p><div class="err" id="se"></div></div></div>`, '/suggest');
  $('#sb').onclick = async () => { try { await api('/suggest', 'POST', { text: $('#st').value }); toast('وصل اقتراحك، شكراً!'); $('#st').value = ''; } catch (e) { $('#se').textContent = e.message; } };
}

// ---------- admin ----------
let tab = 'dash';
async function pAdmin() {
  if (!S.user || S.user.role === 'user') return (location.hash = '#/login');
  const tabs = [['dash', 'نظرة عامة'], ['content', 'المحتوى'], ['comments', 'التعليقات'], ['rules', 'الردود التلقائية'], ['users', 'المستخدمون'], ['connect', 'الربط والنشر'], ['settings', 'إعدادات الموقع'], ['ideas', 'اقتراحات']];
  shell(`<div class="wrap"><section class="s"><div class="h2">لوحة التحكم<small>${esc(S.user.name)} · ${S.user.role === 'admin' ? 'أدمن' : 'محرر'}</small></div>
  <div class="tabs">${tabs.map(([k, v]) => `<button data-k="${k}" class="${tab === k ? 'on' : ''}">${v}</button>`).join('')}</div><div id="ad"></div></section></div>`, '/admin');
  document.querySelector('.tabs').onclick = e => { if (e.target.dataset.k) { tab = e.target.dataset.k; pAdmin(); } };
  const el = $('#ad'); try { await ({ dash: aDash, content: aContent, comments: aComments, rules: aRules, users: aUsers, connect: aConnect, settings: aSettings, ideas: aIdeas }[tab])(el); }
  catch (e) { el.innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}
async function aDash(el) {
  const d = await api('/admin/stats'), t = d.totals, mx = Math.max(1, ...d.days.map(x => x.views || 0));
  el.innerHTML = `<div class="kp"><div><b>${t.published}/${t.items}</b><span>منشور / الكل</span></div><div><b>${fmt(t.views)}</b><span>مشاهدات</span></div><div><b>${t.users}</b><span>مستخدمون</span></div><div><b>${t.likes}</b><span>إعجابات</span></div><div><b>${t.pending}</b><span>تعليقات للمراجعة</span></div><div><b>${d.days.reduce((a, x) => a + (x.autoreplies || 0), 0)}</b><span>ردود تلقائية (14 يوماً)</span></div></div>
  <h3 style="margin:22px 0 8px">المشاهدات آخر 14 يوماً</h3><div class="chart">${d.days.map(x => `<i title="${x.d}: ${x.views || 0}" style="height:${Math.max(3, (x.views || 0) / mx * 100)}%"></i>`).join('')}</div>
  <div class="row" style="margin-top:22px"><div><h3>الأكثر مشاهدة</h3><div class="tw"><table class="tbl"><tr><th>العنوان</th><th>👁</th></tr>${d.top.map(i => `<tr><td>${esc(i.title)}</td><td>${i.views}</td></tr>`).join('')}</table></div></div>
  <div><h3>حسب التصنيف</h3><div class="tw"><table class="tbl"><tr><th>التصنيف</th><th>عناصر</th><th>👁</th></tr>${d.byCat.map(c => `<tr><td>${esc(c.name)}</td><td>${c.n}</td><td>${c.views}</td></tr>`).join('')}</table></div></div></div>
  <h3 style="margin-top:22px">آخر النشاطات</h3><div class="tw"><table class="tbl">${d.log.map(l => `<tr><td>${new Date(l.t).toLocaleString('ar-EG')}</td><td>${esc(l.who)}</td><td>${esc(l.what)}</td></tr>`).join('') || '<tr><td>لا شيء بعد</td></tr>'}</table></div>`;
}
async function aContent(el, editing) {
  const items = await api('/admin/items'), cats = S.home.cats;
  if (editing !== undefined) {
    let i = editing ? (await api('/items/' + editing)).item : { type: 'article', cat: cats[0].id, status: 'draft', minutes: 3, tags: [] };
    el.innerHTML = `<div class="box"><form id="cf"><div class="row"><div><label class="f">العنوان</label><input name="title" value="${esc(i.title)}" required maxlength="140"></div>
    <div><label class="f">التصنيف</label><select name="cat">${cats.map(c => `<option value="${c.id}" ${c.id === i.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
    <div><label class="f">النوع</label><select name="type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${k === i.type ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div><label class="f">الحالة</label><select name="status"><option value="draft" ${i.status === 'draft' ? 'selected' : ''}>مسودة</option><option value="published" ${i.status === 'published' ? 'selected' : ''}>منشور</option></select></div>
    <div><label class="f">مدة القراءة (دقائق)</label><input name="minutes" type="number" min="1" max="60" value="${i.minutes}"></div>
    <div><label class="f">معرّف فيديو يوتيوب</label><input name="youtube" value="${esc(i.youtube)}" dir="ltr" placeholder="مثال: WrFUoCWyVQQ"></div>
    <div><label class="f">رقم الحلقة (اختياري)</label><input name="ep" type="number" min="0" value="${i.ep || ''}"></div>
    <div><label class="f">معرّف Short على يوتيوب</label><input name="short" value="${esc(i.short)}" dir="ltr"></div>
    <div><label class="f">النشر المجدول (بتوقيت القاهرة، فارغ = فوراً)</label><input name="publishAt" type="datetime-local" value="${i.publishAt ? new Date(i.publishAt + 7200000).toISOString().slice(0, 16) : ''}"></div>
    <div><label class="f">سطر الحقوق</label><input name="credit" value="${esc(i.credit)}"></div>
    <div><label class="f">رابط الغلاف (صورة)</label><input name="cover" value="${esc(i.cover)}" dir="ltr" placeholder="/covers/ep1.jpg"></div>
    <div><label class="f">رابط تيك توك</label><input name="tiktok" value="${esc(i.tiktok)}" dir="ltr"></div>
    <div><label class="f">وسوم (بفاصلة)</label><input name="tags" value="${esc((i.tags || []).join('، '))}"></div></div>
    <label class="f">ملخص</label><input name="summary" value="${esc(i.summary)}" maxlength="300">
    <label class="f">المحتوى (## عنوان فرعي، - نقطة)</label><textarea name="body" style="min-height:260px">${esc(i.body)}</textarea>
    <div class="sw"><input type="checkbox" name="featured" ${i.featured ? 'checked' : ''}> مختار في الرئيسية</div>
    <p><button class="btn red sm">حفظ</button> <button type="button" class="btn w sm" id="cx">إلغاء</button></p><div class="err" id="cer"></div></form></div>`;
    $('#cx').onclick = () => aContent(el);
    $('#cf').onsubmit = async e => { e.preventDefault(); const f = new FormData(e.target); const b = Object.fromEntries(f); b.featured = f.has('featured'); b.publishAt = b.publishAt ? Date.parse(b.publishAt + ':00+02:00') : 0; b.tags = String(b.tags).split(/[,،]/).map(x => x.trim()).filter(Boolean); if (i.id) b.id = i.id; try { await api('/admin/items', 'POST', b); S.home = await api('/home'); toast('تم الحفظ'); aContent(el); } catch (x) { $('#cer').textContent = x.message; } };
    return;
  }
  el.innerHTML = `<p><button class="btn sm" id="nw">+ محتوى جديد</button></p><div class="tw" style="margin-top:12px"><table class="tbl"><tr><th>العنوان</th><th>التصنيف</th><th>الحالة</th><th>👁</th><th></th></tr>
  ${items.map(i => `<tr><td>${esc(i.title)}</td><td>${esc(catOf(i.cat).name)}</td><td><span class="pill ${i.status === 'published' ? 'g' : 'y'}">${i.status === 'published' ? 'منشور' : 'مسودة'}</span></td><td>${i.views}</td><td><button class="btn sm w" data-e="${esc(i.id)}">تعديل</button> ${S.user.role === 'admin' ? `<button class="btn sm danger" data-d="${esc(i.id)}">حذف</button>` : ''}</td></tr>`).join('')}</table></div>`;
  $('#nw').onclick = () => aContent(el, '');
  el.onclick = async e => {
    if (e.target.dataset.e) aContent(el, e.target.dataset.e);
    if (e.target.dataset.d && confirm('حذف نهائي؟')) { await api('/admin/items/' + e.target.dataset.d, 'DELETE'); S.home = await api('/home'); aContent(el); }
  };
}
async function aComments(el) {
  const l = await api('/admin/comments');
  el.innerHTML = l.length ? l.map(c => `<div class="cm"><b>${esc(c.by)}</b> <small>${esc(c.email)} · ${esc(c.itemTitle)} · <span class="pill ${c.status === 'ok' ? 'g' : c.status === 'pending' ? 'y' : 'r'}">${c.status === 'ok' ? 'ظاهر' : c.status === 'pending' ? 'ينتظر' : 'مخفي'}</span></small><div>${esc(c.text)}</div>
  ${c.reply ? `<div class="rp">${c.reply.auto ? 'ردّ تلقائي: ' : 'ردّك: '}${esc(c.reply.text)}</div>` : ''}
  <div class="bar" style="margin:8px 0 0"><input placeholder="اكتب ردّاً" data-r="${c.id}" style="max-width:260px"><button class="btn sm" data-a="reply" data-i="${c.id}" data-p="${esc(c.item)}">ردّ</button>
  ${c.status !== 'ok' ? `<button class="btn sm blue" data-a="approve" data-i="${c.id}" data-p="${esc(c.item)}">اعتماد</button>` : `<button class="btn sm w" data-a="hide" data-i="${c.id}" data-p="${esc(c.item)}">إخفاء</button>`}<button class="btn sm danger" data-a="delete" data-i="${c.id}" data-p="${esc(c.item)}">حذف</button></div></div>`).join('') : emptyBox('لا تعليقات بعد');
  el.onclick = async e => {
    const a = e.target.dataset.a; if (!a) return;
    const text = a === 'reply' ? el.querySelector(`[data-r="${e.target.dataset.i}"]`).value : '';
    await api('/admin/comments', 'POST', { action: a, id: e.target.dataset.i, item: e.target.dataset.p, text }); aComments(el);
  };
}
async function aRules(el) {
  let rules = await api('/admin/rules');
  const draw = () => {
    el.innerHTML = `<p style="margin-bottom:10px">عندما يحتوي تعليق على إحدى الكلمات، يُضاف الردّ فوراً. (الربط بتعليقات يوتيوب وتيك توك يحتاج تفعيل الحسابات من تبويب الربط.)</p>
    ${rules.map((r, k) => `<div class="box" style="margin:10px 0;padding:14px"><label class="f" style="margin-top:0">الكلمات (بفاصلة)</label><input data-k="${k}" data-f="kw" value="${esc(r.keywords.join('، '))}"><label class="f">الردّ</label><textarea data-k="${k}" data-f="reply" style="min-height:70px">${esc(r.reply)}</textarea>
    <div class="bar" style="margin-bottom:0"><label class="sw"><input type="checkbox" data-k="${k}" data-f="on" ${r.on ? 'checked' : ''}> مفعّل</label><small>${r.hits || 0} استخدام</small><button class="btn sm danger" data-x="${k}">حذف</button></div></div>`).join('')}
    <p><button class="btn sm w" id="ar">+ قاعدة</button> <button class="btn sm red" id="sr">حفظ الكل</button></p>`;
    $('#ar').onclick = () => { rules.push({ id: '', keywords: [], reply: '', on: true }); draw(); };
    el.oninput = e => { const k = e.target.dataset.k; if (k === undefined) return; const f = e.target.dataset.f; if (f === 'kw') rules[k].keywords = e.target.value.split(/[,،]/).map(x => x.trim()).filter(Boolean); else if (f === 'on') rules[k].on = e.target.checked; else rules[k].reply = e.target.value; };
    el.onclick = e => { if (e.target.dataset.x !== undefined) { rules.splice(+e.target.dataset.x, 1); draw(); } };
    $('#sr').onclick = async () => { rules = await api('/admin/rules', 'POST', { rules }); toast('تم الحفظ'); draw(); };
  };
  draw();
}
async function aUsers(el) {
  const l = await api('/admin/users'), adm = S.user.role === 'admin';
  el.innerHTML = `<div class="tw"><table class="tbl"><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الخطة</th><th>التسجيل</th><th></th></tr>${l.map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${adm && u.email !== S.user.email ? `<select data-e="${esc(u.email)}" data-f="role">${['user', 'editor', 'admin'].map(r => `<option ${r === u.role ? 'selected' : ''} value="${r}">${{ user: 'مستخدم', editor: 'محرر', admin: 'أدمن' }[r]}</option>`).join('')}</select>` : { user: 'مستخدم', editor: 'محرر', admin: 'أدمن' }[u.role]}</td>
  <td>${adm ? `<select data-e="${esc(u.email)}" data-f="plan">${['free', 'plus'].map(r => `<option ${r === u.plan ? 'selected' : ''} value="${r}">${r === 'free' ? 'مجاني' : 'بلس'}</option>`).join('')}</select>` : u.plan}</td><td>${date(u.created)}</td>
  <td>${adm && u.email !== S.user.email ? `<button class="btn sm ${u.banned ? 'blue' : 'danger'}" data-b="${esc(u.email)}" data-v="${u.banned ? 0 : 1}">${u.banned ? 'رفع الحظر' : 'حظر'}</button>` : ''}</td></tr>`).join('')}</table></div>`;
  el.onchange = async e => { const d = e.target.dataset; if (d.f) { await api('/admin/users', 'POST', { email: d.e, [d.f]: e.target.value }); toast('تم'); } };
  el.onclick = async e => { const d = e.target.dataset; if (d.b) { await api('/admin/users', 'POST', { email: d.b, banned: d.v === '1' }); aUsers(el); } };
}
async function aConnect(el) {
  const d = await api('/admin/integrations');
  const box = (n, k, ic) => `<div class="box" style="margin:10px 0"><b>${ic} ${n}</b> <span class="pill ${d[k].connected ? 'g' : 'y'}">${d[k].connected ? 'مربوط' : 'غير مربوط بعد'}</span><p style="margin-top:6px">المطلوب: ${esc(d[k].needs)}</p></div>`;
  el.innerHTML = `${box('يوتيوب', 'youtube', '▶')}${box('تيك توك', 'tiktok', '♪')}
  <p style="margin:6px 0 14px">بعد الربط، يرفع الموقع الفيديوهات وينشرها ويردّ على التعليقات. حتى ذلك الحين يمكنك تجهيز المنشورات هنا في قائمة النشر.</p>
  <div class="box"><b>قائمة النشر</b><form id="qf"><label class="f">العنوان</label><input name="title" required maxlength="140"><label class="f">الوصف والهاشتاغات</label><textarea name="caption" style="min-height:70px"></textarea>
  <div class="row"><div><label class="f">الوقت</label><input name="when" type="datetime-local"></div><div><label class="f">المنصات</label><div class="sw"><input type="checkbox" name="yt" checked> يوتيوب <input type="checkbox" name="tt" checked> تيك توك</div></div></div>
  <p style="margin-top:10px"><button class="btn sm red">إضافة</button></p></form></div>
  <div class="tw" style="margin-top:14px"><table class="tbl"><tr><th>العنوان</th><th>المنصات</th><th>الوقت</th><th>الحالة</th><th></th></tr>${d.queue.map(q => `<tr><td>${esc(q.title)}</td><td>${q.targets.join(' + ')}</td><td>${esc(q.when)}</td><td>${esc(q.status)}</td><td><button class="btn sm danger" data-x="${q.id}">حذف</button></td></tr>`).join('') || '<tr><td colspan="5">القائمة فارغة</td></tr>'}</table></div>`;
  $('#qf').onsubmit = async e => { e.preventDefault(); const f = new FormData(e.target); await api('/admin/queue', 'POST', { title: f.get('title'), caption: f.get('caption'), when: f.get('when'), targets: [f.has('yt') && 'youtube', f.has('tt') && 'tiktok'].filter(Boolean) }); aConnect(el); };
  el.onclick = async e => { if (e.target.dataset.x) { await api('/admin/queue', 'POST', { action: 'delete', id: e.target.dataset.x }); aConnect(el); } };
}
async function aSettings(el) {
  const { settings: s, cats } = await api('/admin/settings'); const adm = S.user.role === 'admin';
  const T = (k, l) => `<label class="f">${l}</label><input data-s="${k}" value="${esc(s[k])}" ${adm ? '' : 'disabled'}>`;
  const C = (k, l) => `<label class="sw"><input type="checkbox" data-s="${k}" ${s[k] ? 'checked' : ''} ${adm ? '' : 'disabled'}> ${l}</label>`;
  el.innerHTML = `<div class="box"><div class="row"><div>${T('siteName', 'اسم الموقع')}${T('announcement', 'شريط الإعلان (فارغ = مخفي)')}${T('heroTitle', 'عنوان الصفحة الرئيسية')}${T('heroSub', 'وصف الصفحة الرئيسية')}</div><div>${T('youtube', 'رابط قناة يوتيوب')}${T('tiktok', 'رابط حساب تيك توك')}<div style="margin-top:14px">${C('allowSignup', 'السماح بالتسجيل')}${C('commentsOpen', 'فتح التعليقات')}${C('commentsModeration', 'مراجعة التعليقات قبل الظهور')}${C('showPlans', 'إظهار صفحة الخطط')}</div></div></div>
  <h3 style="margin-top:14px">التصنيفات</h3>${cats.map((c, k) => `<div class="bar" style="margin:6px 0"><input data-c="${k}" data-f="icon" value="${esc(c.icon)}" style="max-width:70px"><input data-c="${k}" data-f="name" value="${esc(c.name)}" style="max-width:200px"><input data-c="${k}" data-f="color" type="color" value="${esc(c.color)}" style="max-width:70px;padding:2px"></div>`).join('')}
  ${adm ? '<p style="margin-top:14px"><button class="btn red sm" id="ss">حفظ الإعدادات</button></p>' : '<p class="empty">الإعدادات للأدمن فقط</p>'}</div>`;
  el.oninput = e => { const d = e.target.dataset; if (d.s) s[d.s] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; };
  el.onchange = e => { const d = e.target.dataset; if (d.s && e.target.type === 'checkbox') s[d.s] = e.target.checked; };
  el.addEventListener('input', e => { const d = e.target.dataset; if (d.c !== undefined) cats[d.c][d.f] = e.target.value; });
  if (adm) $('#ss').onclick = async () => { try { await api('/admin/settings', 'POST', { settings: s, cats }); S.home = await api('/home'); toast('تم الحفظ'); } catch (e) { toast(e.message); } };
}
async function aIdeas(el) {
  const l = await api('/admin/suggestions');
  el.innerHTML = l.length ? l.map(x => `<div class="cm"><b>${esc(x.by)}</b> <small>${date(x.t)}</small><div>${esc(x.text)}</div></div>`).join('') : emptyBox('لا اقتراحات بعد');
}

// ---------- router ----------
async function route() {
  const h = location.hash.replace(/^#/, '') || '/'; const [, a, b] = h.split('/');
  try {
    if (!S.home) S.home = await api('/home');
    if (S.token && !S.user) S.user = await api('/me').catch(() => { S.token = ''; localStorage.removeItem('kt_token'); return null; });
    document.title = S.home.settings.siteName;
    if (h === '/') return pHome();
    if (a === 'explore') return pExplore(b);
    if (a === 'episodes') return pEpisodes();
    if (a === 'item') return pItem(b);
    if (a === 'login') return pAuth('login');
    if (a === 'signup') return pAuth('signup');
    if (a === 'setup') return pAuth('setup');
    if (a === 'account') return pAccount();
    if (a === 'plans') return pPlans();
    if (a === 'suggest') return pSuggest();
    if (a === 'admin') return pAdmin();
    pHome();
  } catch (e) { $('#app').innerHTML = `<div class="loader"><div>${mascot()}<div>تعذّر التحميل، حاول مرة أخرى</div></div></div>`; }
}
addEventListener('hashchange', route); route();
