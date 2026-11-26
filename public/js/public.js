// public pages
// ---------- pages ----------

function thumb(i) { const c = catOf(i.cat); return i.cover ? `<img src="${esc(i.cover)}" alt="${esc(i.title)}" loading="lazy">` : `<span class="mth" style="background:${c.color}">${mascot()}</span>`; }
function poster(i, cls) { const c = catOf(i.cat); return `<a class="pst ${cls}" href="#/item/${esc(i.id)}"><div class="pim">${thumb(i)}<em>${esc(c.name)}</em></div><h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></a>`; }
function lrow(i, n) { const c = catOf(i.cat); return `<a class="lr" style="--k:${n % 3}" href="#/item/${esc(i.id)}"><b class="num">${String(n + 1).padStart(2, '0')}</b><span class="lt"><small style="--cc:${c.color}">${esc(c.name)} · ${i.minutes} د</small><h3>${esc(i.title)}</h3></span><span class="lth">${thumb(i)}</span></a>`; }
function pHome() {
  const { settings: s, cats, items } = S.home; const feat = items.filter(i => i.featured).slice(0, 2);
  const latest = [...items].sort((a, b) => b.created - a.created).slice(0, 6);
  const lat = [...items].filter(x => x.type === 'video').sort((a, b) => (b.ep || 0) - (a.ep || 0))[0] || latest[0];
  const pos = [[6, 36], [22, 46], [76, 34], [90, 44], [4, 56], [93, 58], [14, 64], [84, 68], [28, 68], [66, 68], [46, 38]];
  const cols = ['#F0B400', '#EF642D', '#9DC4D5', '#FADA80', '#2E6FBE', '#fff'];
  shell(`<section class="scene" id="scene" style="--px:0;--py:0;--sy:0"><div class="sk"></div><div class="grain"></div>
  <div class="pl pl-q" style="--d:.15" aria-hidden="true">؟</div>
  <div class="pl pl-o" style="--d:.6">${cats.slice(0, 11).map((c, n) => `<a class="orb o${n}" href="#/explore?cat=${c.id}" style="inset-inline-start:min(${(pos[n][0]*.8).toFixed(0)}%,calc(100% - 158px));top:${pos[n][1]}%;--c:${cols[n % 6]};--dl:${(n * -.7).toFixed(1)}s"><span>${cicon(c.id, 22)}${esc(c.name)}</span></a>`).join('')}</div>
  <div class="pl pl-t" style="--d:.3"><h1>${esc(s.heroTitle).split(" ").map((w, n) => `<span style="--i:${n}">${w}</span>`).join(" ")}</h1></div>
  <div class="pl pl-m" style="--d:.5"><div class="hero-art">${mascot('big')}</div></div>
  <div class="pl pl-f" style="--d:1.1" aria-hidden="true">${cloud('fc1')}${cloud('fc2')}${cloud('fc3')}</div>
  </section>
  <section class="intro"><div class="sc-bot"><div class="hq" aria-live="polite"><small>كنت تعرف؟</small><b id="hqt"></b><a id="hqa" class="btn sm blue" href="#/explore">اعرف الإجابة ←</a><button class="hqn" id="hqn" aria-label="سؤال آخر">↻ سؤال تاني</button></div>
  <p class="sub">${persona() && PERSONAS[persona()] ? esc(PERSONAS[persona()].line) : esc(s.heroSub)}</p>${persona() && PERSONAS[persona()] ? `<span class="chip" style="background:${PERSONAS[persona()].color};color:#fff;margin-top:8px;display:inline-block">أهلاً يا ${PERSONAS[persona()].name}</span>` : ''}
  <div class="cta"><a class="btn red" href="#/explore">ابدأ الاستكشاف ←</a><a class="btn w" href="#/play">العب صدّق أو لا</a>${lat ? `<a class="btn y" href="#/item/${lat.id}">أحدث حلقة ▸</a>` : ''}</div></section>
  <div class="marq"><div>${cats.map(c => `${esc(c.name)}`).join(' &nbsp;✦&nbsp; ')} &nbsp;✦&nbsp; ${cats.map(c => `${esc(c.name)}`).join(' &nbsp;✦&nbsp; ')}</div></div>
  <section class="s"><div class="wrap"><div class="stk"><i class="tape"></i>${meter()}<div class="stx"><b>لعبة اليوم: صدّق أو لا</b><span>3 معلومات، بعضها خرافة. كل إجابة ومقال تقرأه يرفع مقياس فضولك.</span><a class="btn red sm" href="#/play">العب الآن ←</a></div></div></div></section>
  ${newsBand(items)}
  ${forYou(items, cats)}
  <section class="s"><div class="wrap"><div class="h2">اختر عالمك<small>${cats.length} عالماً، وكل واحد فيه ما يستحق أن تعرفه</small></div>
  <div class="cloud">${orderCats(cats).map((c, n) => `<a class="cl${DARKC.has(c.id) ? " dk" : ""} s${[2, 0, 1, 0, 2, 1, 0, 1, 2, 0, 1][n % 11]}" style="--bg:${c.color};--r:${[-3, 2, -1.5, 3, -2, 1.5, -3.5, 2.5, -1, 3, -2.5][n % 11]}deg" href="#/explore/${c.id}"><i>${cicon(c.id, 26)}</i><b>${esc(c.name)}</b><small>${c.count}</small></a>`).join('')}</div></div></div></section>
  ${feat.length ? `<section class="s" style="padding-top:0"><div class="wrap"><div class="h2">مختارات<small>ابدأ من هنا</small></div><div class="pins">${feat.map((f, n) => poster(f, n ? 'p2' : 'p1')).join('')}</div></div></section>` : ''}
  <section class="s" style="padding-top:0"><div class="wrap"><div class="h2">الأحدث</div><div class="lst">${latest.slice(0, 1).map(f => poster(f, 'big')).join('')}<div class="lrs">${latest.slice(1).map((f, n) => lrow(f, n + 1)).join('')}</div></div>
  <p style="text-align:center;margin-top:24px"><a class="btn" href="#/explore">كل المحتوى</a></p></div></section>
  <section class="s"><div class="wrap"><div class="h2">كيف يعمل؟</div><div class="path"><div class="st" style="--o:0"><b class="n">1</b><h3>تصفّح</h3><p>محتوى مصنّف حسب الموضوع والنوع.</p></div>
  <div class="st" style="--o:1"><b class="n">2</b><h3>احفظ وتابع</h3><p>أضف للمفضلة وعلّم ما أنهيته.</p></div>
  <div class="st" style="--o:2"><b class="n">3</b><h3>شارك وناقش</h3><p>علّق واقترح موضوع الحلقة القادمة.</p></div></div></div></div></section>
  <section class="s" style="padding-top:0"><div class="wrap"><div class="band"><div class="tapeline" aria-hidden="true"><span>كنت تعرف؟ ✦ اعرف أكتر ✦ كنت تعرف؟ ✦ اعرف أكتر ✦ كنت تعرف؟ ✦ اعرف أكتر ✦ كنت تعرف؟ ✦ اعرف أكتر</span></div><h2>جاهز تعرف أكثر؟</h2><a class="btn" href="#/signup">انضم مجاناً</a></div></div></section>`, '/');
  initHero(items);
}
function pEpisodes() {
  const eps = S.home.items.filter(i => i.ep).sort((a, b) => b.ep - a.ep);
  shell(`<section class="s"><div class="wrap"><div class="h2">الحلقات<small>حلقة جديدة كل يوم، من الأحدث إلى الأقدم</small></div>
  <div class="grid" style="grid-template-columns:1fr;max-width:760px">${eps.map(i => `<a class="card" href="#/item/${esc(i.id)}" ><div style="aspect-ratio:16/9;border-bottom:var(--b);background:var(--ink);display:grid;place-items:center">${i.cover ? `<img src="${esc(i.cover)}" alt="${esc(i.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">` : mascot()}</div>
  <div class="bd"><div class="meta"><span class="pill y">حلقة ${i.ep}</span><span>${esc(catOf(i.cat).name)}</span><span>${i.minutes} د</span></div><h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></div></a>`).join('') || emptyBox('الحلقات قريباً')}</div></div></section>`, '/episodes');
}
function pExplore(cat) {
  const { cats, items } = S.home; cat = String(cat || (window.HQ && HQ.get('cat')) || '');
  const st = { cat: cats.some(c => c.id === cat) ? cat : '', type: '', q: '', sort: 'new' };
  const SORTS = { new: 'الأحدث', old: 'الأقدم', views: 'الأكثر مشاهدة', short: 'الأقصر وقتاً' };
  shell(`<section class="s"><div class="wrap"><div class="h2">استكشف</div>
  <div class="bar"><input id="q" type="search" placeholder="ابحث عن معلومة..." aria-label="بحث" style="max-width:320px"></div>
  <div class="bar" id="fc" role="group" aria-label="التصنيف"></div><div class="bar" id="ft" role="group" aria-label="النوع"></div>
  <div class="bar xbar"><small id="xn" aria-live="polite"></small><select id="xs" aria-label="الترتيب">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button class="btn sm" id="xc" type="button" hidden>مسح الفلاتر</button></div>
  <div class="grid" id="res"></div></div></section>`, '/explore');
  const chip = (on, a, v, t, n, col) => `<span class="chip ${on ? 'on' : ''}" role="button" tabindex="0" aria-pressed="${on}" data-${a}="${v}"${col ? ` style="--cc:${col}"` : ''}>${t}${n != null ? `<em>${n}</em>` : ''}</span>`;
  const draw = () => {
    $('#fc').innerHTML = chip(!st.cat, 'c', '', 'الكل', items.length) + cats.map(c => chip(st.cat === c.id, 'c', c.id, esc(c.name), items.filter(i => i.cat === c.id).length, c.color)).join('');
    $('#ft').innerHTML = chip(!st.type, 't', '', 'كل الأنواع', items.length) + Object.entries(TYPES).map(([k, v]) => chip(st.type === k, 't', k, v, items.filter(i => i.type === k).length)).join('');
    const q = st.q.trim().toLowerCase();
    const r = items.filter(i => (!st.cat || i.cat === st.cat) && (!st.type || i.type === st.type) && (!q || (i.title + i.summary + (i.tags || []).join(' ')).toLowerCase().includes(q)));
    const by = { new: (a, b) => (b.publishAt || 0) - (a.publishAt || 0), old: (a, b) => (a.publishAt || 0) - (b.publishAt || 0), views: (a, b) => (b.views || 0) - (a.views || 0), short: (a, b) => (a.minutes || 0) - (b.minutes || 0) };
    r.sort(by[st.sort]);
    const dirty = st.cat || st.type || q;
    $('#xn').textContent = r.length ? `${fmt(r.length)} نتيجة` : '';
    $('#xc').hidden = !dirty;
    $('#res').innerHTML = r.length ? r.map(card).join('') : `<div style="grid-column:1/-1">${emptyBox('لا نتائج. جرّب كلمة أخرى أو امسح الفلاتر.')}</div>`;
    try { history.replaceState(null, '', '#/explore' + (st.cat ? '/' + st.cat : '')); } catch (e) {}
  };
  draw(); $('#fc').scrollLeft = 0;
  $('#q').oninput = e => { st.q = e.target.value; draw(); };
  $('#xs').onchange = e => { st.sort = e.target.value; draw(); };
  $('#xc').onclick = () => { st.cat = ''; st.type = ''; st.q = ''; $('#q').value = ''; draw(); };
  const pick = e => { const t = e.target.closest('.chip'); if (!t) return; if (t.dataset.c !== undefined) st.cat = t.dataset.c; else if (t.dataset.t !== undefined) st.type = t.dataset.t; else return; draw(); const on = document.querySelector('#' + (t.dataset.c !== undefined ? 'fc' : 'ft') + ' .on'); if (on) on.focus({ preventScroll: true }); };
  ['#fc', '#ft'].forEach(id => { $(id).onclick = pick; $(id).onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } }; });
}
async function pItem(id) {
  let d; try { d = await api('/items/' + id); } catch { return shell(emptyBox('المحتوى غير موجود'), ''); }
  const i = d.item, c = catOf(i.cat), u = S.user;
  const saved = u && u.bookmarks.includes(i.id), done = u && u.done.includes(i.id);
  const cm = list => list.length ? list.map(x => `<div class="cm"><b>${esc(x.by)}</b> <small>${date(x.t)}${x.status !== 'ok' ? ' · ' + (x.status === 'pending' ? 'بانتظار المراجعة' : 'مخفي') : ''}</small><div>${esc(x.text)}</div>${x.reply ? `<div class="rp"><b>${x.reply.auto ? 'ردّ تلقائي' : 'فريق ' + esc(S.home.settings.siteName)}:</b> ${esc(x.reply.text)}</div>` : ''}</div>`).join('') : emptyBox('كن أول من يعلّق');
  shell(`<div class="wrap"><article class="post"><a class="chip" href="#/explore/${i.cat}" style="background:${c.color}">${esc(c.name)}</a> <span class="chip">${TYPES[i.type]}</span>${i.ep ? ` <span class="chip" style="background:var(--yellow)">الحلقة ${i.ep}</span>` : ''}
  <h1>${esc(i.title)}</h1><div class="meta"><span>${i.minutes} دقائق</span><span>${GI.eye} ${fmt(i.views)}</span><span id="lk">${GI.heart} ${i.likes}</span><span>${date(i.created)}</span></div>
  ${i.cover && !i.youtube ? `<div class="pcover"><img src="${esc(i.cover)}" alt="${esc(i.title)}"></div>` : ''}${i.youtube ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(i.youtube)}" allowfullscreen loading="lazy" title="${esc(i.title)}"></iframe></div>` : ''}
  <p style="font-weight:900;font-size:20px;margin-top:16px">${esc(i.summary)}</p>${md(i.body)}${i.short ? `<h2>النسخة القصيرة (Short)</h2><div class="vid" style="aspect-ratio:9/16;max-width:320px"><iframe src="https://www.youtube-nocookie.com/embed/${esc(i.short)}" allowfullscreen loading="lazy" title="Short"></iframe></div>` : ''}${i.credit ? `<p style="font-size:14px;color:var(--grey)">${esc(i.credit)}</p>` : ''}${(d.prev || d.next) ? `<div class="bar" style="justify-content:space-between">${d.next ? `<a class="btn sm w" href="#/item/${esc(d.next.id)}">الحلقة ${d.next.ep} ←</a>` : '<span></span>'}${d.prev ? `<a class="btn sm w" href="#/item/${esc(d.prev.id)}">→ الحلقة ${d.prev.ep}</a>` : ''}</div>` : ''}
  <div class="bar" style="margin-top:24px"><button class="btn red sm" id="b-like">${GI.heart} أعجبني</button><button class="btn sm" id="b-save">${saved ? '★ محفوظ' : '☆ احفظ'}</button><button class="btn blue sm" id="b-done">${done ? GI.check + ' تمت القراءة' : 'علّمه كمقروء'}</button>
  <button class="btn w sm" id="b-share">مشاركة</button></div>
  ${i.tiktok ? `<p><a class="chip" href="${esc(i.tiktok)}" target="_blank" rel="noopener">شاهده على تيك توك</a></p>` : ''}
  <h2 style="margin-top:36px">التعليقات</h2><div id="cms">${cm(d.comments)}</div>
  ${u ? `<label class="f">أضف تعليقاً</label><textarea id="ct" maxlength="600"></textarea><p style="margin-top:8px"><button class="btn sm" id="b-cm">أرسل</button></p><div class="err" id="ce"></div>` : '<p class="empty"><a class="btn sm" href="#/login">سجّل الدخول للتعليق</a></p>'}
  ${d.related.length ? `<h2 style="margin-top:36px">قد يعجبك</h2><div class="grid" style="grid-template-columns:1fr">${d.related.map(card).join('')}</div>` : ''}</article></div>`, '');
  addXp(10, 'v:' + i.id); document.title = i.title + ' | ' + S.home.settings.siteName;
  const need = () => { if (!S.user) { toast('سجّل الدخول أولاً'); location.hash = '#/login'; return true; } };
  $('#b-like').onclick = async () => { try { const r = await api(`/items/${i.id}/like`, 'POST'); $('#lk').innerHTML = GI.heart + ' ' + r.likes; } catch (e) { toast(e.message); } };
  $('#b-save').onclick = async () => { if (need()) return; const r = await api('/me/bookmark', 'POST', { id: i.id }); S.user.bookmarks = r.bookmarks; $('#b-save').textContent = r.bookmarks.includes(i.id) ? '★ محفوظ' : '☆ احفظ'; };
  $('#b-done').onclick = async () => { if (need()) return; const r = await api('/me/done', 'POST', { id: i.id }); S.user.done = r.done; $('#b-done').innerHTML = r.done.includes(i.id) ? GI.check + ' تمت القراءة' : 'علّمه كمقروء'; };
  $('#b-share').onclick = async () => { try { if (navigator.share) await navigator.share({ title: i.title, url: location.origin + '/e/' + i.id }); else { await navigator.clipboard.writeText(location.origin + '/e/' + i.id); toast('تم نسخ الرابط'); } } catch { } };
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
    try { const r = await api(setup ? '/auth/setup' : sign ? '/auth/signup' : '/auth/login', 'POST', f); S.token = r.token; localStorage.kt_token = r.token; S.user = r.user; toast('أهلاً ' + r.user.name); location.hash = r.user.role === 'admin' ? '#/admin' : sign ? '#/quiz' : '#/account'; }
    catch (x) { $('#ae').textContent = x.message; }
  };
}
async function pAccount() {
  if (!S.user) return (location.hash = '#/login');
  const u = S.user, items = S.home.items, saved = items.filter(i => u.bookmarks.includes(i.id)), done = items.filter(i => u.done.includes(i.id));
  const pct = items.length ? Math.round(done.length / items.length * 100) : 0;
  shell(`<div class="wrap"><section class="s"><div class="h2">أهلاً ${esc(u.name)}<small>${esc(u.email)} · خطة ${u.plan === 'plus' ? 'بلس' : 'مجانية'}</small></div>
  <div class="kp" style="margin:20px 0"><div><b>${saved.length}</b><span>محفوظ</span></div><div><b>${done.length}</b><span>مقروء</span></div><div><b>${pct}%</b><span>تقدّمك</span></div></div>
  <div class="acx"><div class="box">${meter()}<p style="margin-top:8px"><small>سلسلة أيام اللعب: <b>${(JSON.parse(localStorage.kt_play || '{}').streak) || 0}</b></small></p></div>
  <div class="box"><b>شخصيتك</b><p style="margin:8px 0">${persona() && PERSONAS[persona()] ? `<span class="chip" style="background:${PERSONAS[persona()].color};color:#fff">${esc(PERSONAS[persona()].name)}</span> ${esc(PERSONAS[persona()].line)}` : 'لم تحدد شخصيتك بعد. اعرف نوع فضولك ونرتّب لك الموقع.'}</p><a class="btn sm" href="#/quiz">${persona() ? 'أعد الاختبار' : 'ابدأ الاختبار'}</a></div>
  <div class="box"><b>تقدّمك حسب التصنيف</b>${S.home.cats.map(c => { const all = items.filter(i => i.cat === c.id), dn = all.filter(i => u.done.includes(i.id)); return all.length ? `<div class="pg"><span>${esc(c.name)}</span><i><u style="width:${Math.round(dn.length / all.length * 100)}%;background:${c.color}"></u></i><small>${dn.length}/${all.length}</small></div>` : ''; }).join('')}</div></div>
  ${(() => { const nx = items.filter(i => u.bookmarks.includes(i.id) && !u.done.includes(i.id)).slice(0, 3); return nx.length ? `<div class="h2" style="font-size:24px;margin-top:26px">كمّل من حيث وقفت</div><div class="grid">${nx.map(card).join('')}</div>` : ''; })()}
  <div class="h2" style="font-size:24px">المفضلة</div><div class="grid">${saved.map(card).join('') || `<div style="grid-column:1/-1">${emptyBox('لم تحفظ شيئاً بعد')}</div>`}</div>
  <div class="box" style="margin-top:30px;max-width:460px"><b>الملف الشخصي</b><label class="f">الاسم</label><input id="pn" value="${esc(u.name)}"><label class="f">كلمة مرور جديدة (اختياري، 10 أحرف على الأقل)</label><input id="pp" type="password" autocomplete="new-password" minlength="10">
  <p style="margin-top:12px"><button class="btn sm" id="ps">حفظ</button> <button class="btn w sm" id="lo">خروج</button></p></div></section></div>`, '/account');
  $('#ps').onclick = async () => { if ($('#pp').value && $('#pp').value.length < 10) return toast('كلمة المرور 10 أحرف على الأقل'); try { S.user = { ...S.user, ...await api('/me/profile', 'POST', { name: $('#pn').value, password: $('#pp').value }) }; toast('تم الحفظ'); $('#pp').value = ''; } catch (e) { toast(e.message); } };
  $('#lo').onclick = async () => { await api('/me/logout', 'POST').catch(() => { }); S.token = ''; S.user = null; localStorage.removeItem('kt_token'); location.hash = '#/'; };
}
function pPlans() {
  const s = S.home.settings;
  shell(`<div class="wrap"><section class="s"><div class="h2">الخطط<small>ابدأ مجاناً</small></div><div class="plans">${s.plans.map((p, k) => `<div class="plan ${k ? 'hi' : ''}"><h3>${esc(p.name)}</h3><div class="pr">${p.soon ? 'قريباً' : 'بدون بطاقة'}</div><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><a class="btn ${k ? '' : 'red'}" href="#/signup">${p.soon ? 'سجّل لتُبلَّغ' : 'ابدأ الآن'}</a></div>`).join('')}</div></section></div>`, '/plans');
}
function pSuggest() {
  const cats = S.home.cats, ex = ['لماذا نشعر بالدوار في السيارة؟', 'كيف يعمل الـ GPS؟', 'لماذا الموز مقوّس؟', 'ماذا يحدث للنوم عندما نحلم؟'];
  let cat = '';
  shell(`<div class="wrap"><div class="box auth sg"><div class="h2">اقترح موضوعاً<small>ما الذي تتمنى أن نشرحه؟ نقرأ كل اقتراح.</small></div>
  <div class="say" style="margin:12px 0">${mascot()}<span>اكتب سؤالاً واحداً واضحاً، وسأحوّله لحلقة.</span></div>
  <label class="f">التصنيف (اختياري)</label><div class="bar" id="sc" role="group" aria-label="التصنيف">${cats.map(c => `<span class="chip" role="button" tabindex="0" aria-pressed="false" data-c="${c.id}" style="--cc:${c.color}">${esc(c.name)}</span>`).join('')}</div>
  <label class="f" for="st">اقتراحك</label><textarea id="st" maxlength="500" placeholder="مثال: ${ex[0]}"></textarea>
  <div class="bar" style="justify-content:space-between"><small id="sn" dir="ltr">0 / 500</small><span class="bar" id="se2">${ex.map(e => `<span class="chip" role="button" tabindex="0" data-e="${esc(e)}">${esc(e)}</span>`).join('')}</span></div>
  <p style="margin-top:12px"><button class="btn red" id="sb">إرسال</button></p><div class="err" id="se" role="alert"></div></div></div>`, '/suggest');
  const t = $('#st'), cnt = () => { $('#sn').textContent = t.value.length + ' / 500'; };
  t.oninput = () => { cnt(); $('#se').textContent = ''; };
  const pickC = e => { const c = e.target.closest('[data-c]'); if (!c) return; cat = cat === c.dataset.c ? '' : c.dataset.c; document.querySelectorAll('#sc .chip').forEach(x => { const on = x.dataset.c === cat; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); };
  const pickE = e => { const c = e.target.closest('[data-e]'); if (!c) return; t.value = c.dataset.e; cnt(); t.focus(); };
  const kb = f => e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(e); } };
  $('#sc').onclick = pickC; $('#sc').onkeydown = kb(pickC); $('#se2').onclick = pickE; $('#se2').onkeydown = kb(pickE);
  $('#sb').onclick = async () => {
    const v = t.value.trim(); if (v.length < 5) { $('#se').textContent = 'اكتب اقتراحاً من 5 أحرف على الأقل'; return; }
    const b = $('#sb'); b.disabled = true; $('#se').textContent = '';
    try { const c = cats.find(x => x.id === cat); await api('/suggest', 'POST', { text: (c ? '[' + c.name + '] ' : '') + v });
      $('.sg').innerHTML = `<div style="text-align:center">${mascot()}<h1 style="margin:10px 0">وصل اقتراحك، شكراً!</h1><p>سنقرأه ونفكّر في تحويله لحلقة.</p><p style="margin-top:14px"><button class="btn red" id="sa">اقترح موضوعاً آخر</button> <a class="btn w" href="#/explore">استكشف</a></p></div>`;
      $('#sa').onclick = pSuggest; toast('وصل اقتراحك، شكراً!');
    } catch (e) { $('#se').textContent = e.message; b.disabled = false; }
  };
}


let _ty;
function typeIt(el, txt) {
  clearInterval(_ty); if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = txt; return; }
  let n = 0; el.setAttribute('aria-label', txt); el.textContent = '';
  _ty = setInterval(() => { if (!document.body.contains(el)) return clearInterval(_ty); el.textContent = txt.slice(0, ++n); if (n >= txt.length) clearInterval(_ty); }, 28);
}
function initHero(items) {
  const q = items.filter(i => i.type !== 'checklist'); const t = $('#hqt'), a = $('#hqa'), m = document.querySelector('.hero-art .big'); if (!t || !q.length) return;
  let k = Math.floor(Math.random() * q.length), iv;
  const show = () => { const i = q[k % q.length]; a.href = '#/item/' + i.id; typeIt(t, i.title); t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); };
  const next = () => { k++; show(); clearInterval(iv); iv = setInterval(tick, 6000); };
  const tick = () => { if (!document.getElementById('hqt')) return clearInterval(iv); k++; show(); };
  show(); iv = setInterval(tick, 6000);
  $('#hqn').onclick = next;
  m.style.cursor = 'pointer'; m.onclick = () => { m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); next(); };
  const pu = [...m.querySelectorAll('.eyes circle')].slice(2);
  const look = e => {
    if (!document.body.contains(m)) return document.removeEventListener('pointermove', look);
    const r = m.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, f = Math.min(1, d / 160) * 5.5;
    pu.forEach(c => c.setAttribute('transform', `translate(${(dx / d * f).toFixed(2)} ${(dy / d * f).toFixed(2)})`));
  };
  document.addEventListener('pointermove', look, { passive: true });
  initPar();
}
function initPar() {
  const sc = document.getElementById('scene'); if (!sc || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let px = 0, py = 0, tx = 0, ty = 0, vis = true, raf = 0, sy = 0; const hd = document.querySelector('header.top'); hd.classList.add('ov');
  const io = new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) loop(); }); io.observe(sc);
  document.addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  addEventListener('scroll', () => { sy = scrollY; hd.classList.toggle('solid', sy > 30); }, { passive: true });
  const loop = () => {
    if (!document.body.contains(sc)) return; px += (tx - px) * .08; py += (ty - py) * .08;
    sc.style.setProperty('--px', px.toFixed(3)); sc.style.setProperty('--py', py.toFixed(3)); sc.style.setProperty('--sy', sy);
    if (vis && !document.hidden) raf = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && vis) loop(); }); loop();
}

function pQuiz() {
  let k = 0; const sc = { explorer: 0, analyst: 0, storyteller: 0, dreamer: 0 };
  const draw = () => {
    if (k >= QUIZ.length) {
      const t = Object.entries(sc).sort((a, b) => b[1] - a[1])[0][0], P = PERSONAS[t];
      localStorage.kt_persona = t; if (S.user) api('/me/persona', 'POST', { type: t }).then(u => { S.user = { ...S.user, ...u }; }).catch(() => { });
      return shell(`<div class="wrap"><div class="box quiz" style="text-align:center;margin:30px auto;max-width:560px">${mascot()}<span class="chip" style="background:${P.color};color:#fff">شخصيتك</span><h1 style="margin:10px 0">${P.name}</h1><p>${P.line}</p><p style="margin-top:18px"><a class="btn red" href="#/">شوف صفحتك الرئيسية ←</a></p></div></div>`, '/quiz');
    }
    const [q, ans] = QUIZ[k];
    shell(`<div class="wrap"><div class="box quiz" style="margin:30px auto;max-width:560px"><small>سؤال ${k + 1} من ${QUIZ.length}</small><div class="bar" style="height:8px;background:#fff;border:1.5px solid var(--line);border-radius:8px;margin:6px 0 16px;overflow:hidden"><i style="display:block;height:100%;width:${(k / QUIZ.length) * 100}%;background:var(--red)"></i></div><h1 style="font-size:24px;margin-bottom:14px">${q}</h1>
    <div class="qa">${ans.map(([t, l]) => `<button class="btn w" data-t="${t}" style="width:100%;margin-bottom:10px;text-align:start;justify-content:flex-start">${l}</button>`).join('')}</div></div></div>`, '/quiz');
    document.querySelector('.qa').onclick = e => { const t = e.target.closest('[data-t]'); if (!t) return; sc[t.dataset.t]++; k++; draw(); };
  };
  draw();
}
function forYou(items, cats) {
  const t = persona(); if (!t) return `<section class="s" style="padding-top:0"><div class="wrap"><div class="box" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:var(--sand)">${mascot()}<div style="flex:1;min-width:200px"><b>أي نوع قارئ أنت؟</b><br>4 أسئلة سريعة، وبعدها الموقع يتغيّر على مزاجك.</div><a class="btn red sm" href="#/quiz">ابدأ الاختبار</a></div></div></section>`;
  const P = PERSONAS[t], pick = items.filter(i => P.cats.includes(i.cat)).sort((a, b) => P.cats.indexOf(a.cat) - P.cats.indexOf(b.cat) || b.created - a.created).slice(0, 3);
  return `<section class="s" style="padding-top:0"><div class="wrap"><div class="h2">مخصّص لك: ${P.name}<small>${P.line} <a href="#/quiz"><b>غيّر شخصيتك</b></a></small></div><div class="grid" style="margin-top:18px;border-top:6px solid ${P.color};padding-top:18px">${pick.map(card).join('') || '<p class="empty">قريباً</p>'}</div></div></section>`;
}

function orderCats(cats) { const t = persona(); if (!t) return cats; const o = PERSONAS[t].cats; return [...cats].sort((a, b) => { const x = o.indexOf(a.id), y = o.indexOf(b.id); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); }); }
function newsBand(items) {
  const L = [...items].filter(i => i.created <= Date.now()).sort((a, b) => b.created - a.created).slice(0, 4);
  const f = FACTS[Math.floor(Date.now() / 864e5) % FACTS.length];
  const rows = [...L.map((i, n) => `<a class="hl h${n}" href="#/item/${i.id}"><i></i><b>${esc(i.title)}</b></a>`), `<a class="hl alt" href="#/play"><i></i><b>${esc(f[0])}</b><small>صح أم خرافة؟ تعال اكتشف ←</small></a>`];
  return `<section class="s"><div class="wrap"><div class="h2"><span class="live">عاجل من ماسكوت</span><small>آخر ما وصل إلى كنت تعرف</small></div><div class="hls">${rows.join('')}</div></div></section>`;
}
