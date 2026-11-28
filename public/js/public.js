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
let EPC = '';
function pEpisodes() {
  const all = S.home.items.filter(i => i.ep).sort((a, b) => b.ep - a.ep), cs = [...new Set(all.map(i => i.cat))];
  if (EPC && !cs.includes(EPC)) EPC = '';
  const eps = all.filter(i => !EPC || i.cat === EPC);
  shell(`<section class="s"><div class="wrap"><div class="h2">الحلقات<small>${all.length} حلقة، الأحدث أولاً</small></div>
  ${cs.length > 1 ? `<div class="bar strip epf" role="group" aria-label="السلسلة"><button class="chip${!EPC ? ' on' : ''}" data-c="">الكل</button>${cs.map(c => `<button class="chip${EPC === c ? ' on' : ''}" data-c="${esc(c)}">${esc(catOf(c).name)}</button>`).join('')}</div>` : ''}
  <div class="epl">${eps.map(i => `<a class="epr" href="#/item/${esc(i.id)}"><span class="epc">${i.cover ? `<img src="${esc(i.cover)}" alt="" loading="lazy">` : mascot()}<b>${i.ep}</b></span><span class="epb"><span class="meta"><span>${esc(catOf(i.cat).name)}</span><span>${i.minutes} د</span></span><h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></span></a>`).join('') || emptyBox('الحلقات قريباً')}</div></div></section>`, '/episodes');
  document.querySelectorAll('.epf [data-c]').forEach(b => b.onclick = () => { EPC = b.dataset.c; pEpisodes(); });
}
function pExplore(cat) {
  const { cats, items } = S.home; cat = String(cat || (window.HQ && HQ.get('cat')) || '');
  const st = { cat: cats.some(c => c.id === cat) ? [cat] : [], type: [], q: '', sort: 'new' };
  const SORTS = [['new', 'الأحدث'], ['old', 'الأقدم'], ['views', 'الأكثر مشاهدة'], ['short', 'الأقصر وقتاً']];
  shell(`<section class="s"><div class="wrap"><div class="h2">استكشف</div>
  <div id="sfh"></div><p class="xn" id="xn" aria-live="polite"></p>
  <div class="grid" id="res"></div></div></section>`, '/explore');
  const cfg = { id: 'explore', state: st, items, ph: 'ابحث عن معلومة...', onChange: () => draw(), sorts: SORTS,
    groups: [{ key: 'cat', label: 'التصنيف', get: i => i.cat, opts: cats.map(c => ({ v: c.id, t: c.name, color: c.color })) }, { key: 'type', label: 'النوع', get: i => i.type, opts: Object.entries(TYPES).map(([v, t]) => ({ v, t })) }],
    presets: [{ t: 'الأحدث', set: s => s.sort = 'new' }, { t: 'الأكثر مشاهدة', set: s => s.sort = 'views' }, { t: 'قراءة سريعة (الأقصر وقتاً)', set: s => s.sort = 'short' }, { t: 'فيديوهات فقط', set: s => s.type = ['video'] }] };
  const draw = () => {
    sfRender($('#sfh'), cfg);
    const q = st.q.trim().toLowerCase();
    const r = items.filter(i => (!st.cat.length || st.cat.includes(i.cat)) && (!st.type.length || st.type.includes(i.type)) && (!q || (i.title + i.summary + (i.tags || []).join(' ')).toLowerCase().includes(q)));
    const by = { new: (a, b) => (b.publishAt || 0) - (a.publishAt || 0), old: (a, b) => (a.publishAt || 0) - (b.publishAt || 0), views: (a, b) => (b.views || 0) - (a.views || 0), short: (a, b) => (a.minutes || 0) - (b.minutes || 0) };
    r.sort(by[st.sort]);
    $('#xn').textContent = r.length ? `${fmt(r.length)} نتيجة` : '';
    $('#res').innerHTML = r.length ? r.map(card).join('') : `<div style="grid-column:1/-1">${emptyBox('لا نتائج. جرّب كلمة أخرى أو امسح الفلاتر.')}</div>`;
    try { history.replaceState(null, '', '#/explore' + (st.cat.length === 1 ? '/' + st.cat[0] : '')); } catch (e) {}
  };
  draw();
}
async function pItem(id) {
  let d; try { d = await api('/items/' + id); } catch { return shell(emptyBox('المحتوى غير موجود'), ''); }
  const i = d.item, c = catOf(i.cat), u = S.user;
  const saved = u && u.bookmarks.includes(i.id), done = u && u.done.includes(i.id);
  shell(`<div class="wrap"><article class="post"><a class="chip" href="#/explore/${i.cat}" style="background:${c.color}">${esc(c.name)}</a> <span class="chip">${TYPES[i.type]}</span>${i.ep ? ` <span class="chip" style="background:var(--yellow)">الحلقة ${i.ep}</span>` : ''}
  <h1>${esc(i.title)}</h1><div class="meta"><span>${i.minutes} دقائق</span><span>${GI.eye} ${fmt(i.views)}</span><span id="lk">${GI.heart} ${i.likes}</span><span>${date(i.created)}</span></div><div id="rtx"></div>
  ${i.cover && !i.youtube ? `<div class="pcover"><img src="${esc(i.cover)}" alt="${esc(i.title)}"></div>` : ''}${i.youtube ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(i.youtube)}" allowfullscreen loading="lazy" title="${esc(i.title)}"></iframe></div>` : ''}
  <p style="font-weight:900;font-size:20px;margin-top:16px">${esc(i.summary)}</p>${md(i.body)}${i.short ? `<h2>النسخة القصيرة (Short)</h2><div class="vid" style="aspect-ratio:9/16;max-width:320px"><iframe src="https://www.youtube-nocookie.com/embed/${esc(i.short)}" allowfullscreen loading="lazy" title="Short"></iframe></div>` : ''}${i.credit ? `<p style="font-size:14px;color:var(--grey)">${esc(i.credit)}</p>` : ''}${(d.prev || d.next) ? `<div class="bar" style="justify-content:space-between">${d.next ? `<a class="btn sm w" href="#/item/${esc(d.next.id)}">الحلقة ${d.next.ep} ←</a>` : '<span></span>'}${d.prev ? `<a class="btn sm w" href="#/item/${esc(d.prev.id)}">→ الحلقة ${d.prev.ep}</a>` : ''}</div>` : ''}
  <div class="bar" style="margin-top:24px"><button class="btn red sm" id="b-like">${GI.heart} أعجبني</button><button class="btn sm" id="b-save">${saved ? '★ محفوظ' : '☆ احفظ'}</button><button class="btn blue sm" id="b-done">${done ? GI.check + ' تمت القراءة' : 'علّمه كمقروء'}</button>
  <button class="btn w sm" id="b-share">مشاركة</button></div>
  ${i.tiktok ? `<p><a class="chip" href="${esc(i.tiktok)}" target="_blank" rel="noopener">شاهده على تيك توك</a></p>` : ''}
  <div id="cmx" style="margin-top:36px"></div>
  ${d.related.length ? `<h2 style="margin-top:36px">قد يعجبك</h2><div class="grid" style="grid-template-columns:1fr">${d.related.map(card).join('')}</div>` : ''}</article></div>`, '');
  addXp(10, 'v:' + i.id); document.title = i.title + ' | ' + S.home.settings.siteName;
  const need = () => { if (!S.user) { toast('سجّل الدخول أولاً'); location.hash = '#/login'; return true; } };
  $('#b-like').onclick = async () => { try { const r = await api(`/items/${i.id}/like`, 'POST'); $('#lk').innerHTML = GI.heart + ' ' + r.likes; } catch (e) { toast(e.message); } };
  $('#b-save').onclick = async () => { if (need()) return; const r = await api('/me/bookmark', 'POST', { id: i.id }); S.user.bookmarks = r.bookmarks; $('#b-save').textContent = r.bookmarks.includes(i.id) ? '★ محفوظ' : '☆ احفظ'; };
  $('#b-done').onclick = async () => { if (need()) return; const r = await api('/me/done', 'POST', { id: i.id }); S.user.done = r.done; $('#b-done').innerHTML = r.done.includes(i.id) ? GI.check + ' تمت القراءة' : 'علّمه كمقروء'; };
  $('#b-share').onclick = async () => { try { if (navigator.share) await navigator.share({ title: i.title, url: location.origin + '/e/' + i.id }); else { await navigator.clipboard.writeText(location.origin + '/e/' + i.id); toast('تم نسخ الرابط'); } } catch { } };
  rtMount(i); cmMount(i, d.comments);
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
  const dlb = u.delAt ? `<div class="box dlb" role="alert"><b>حسابك مجدول للحذف النهائي يوم ${new Date(u.delAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}</b><p>كل بياناتك (المفضلة والتقدّم والتعليقات والتقييمات) هتتمسح وقتها ومفيش رجوع بعدها. تقدر تسترجع حسابك في أي وقت قبل كده.</p><p><button class="btn red" id="rs">استرجاع حسابي</button></p></div>` : '';
  shell(`<div class="wrap">${dlb}<section class="s"><div class="h2">أهلاً ${esc(u.name)}<small>${esc(u.email)} · خطة ${u.plan === 'plus' ? 'بلس' : 'مجانية'}</small></div>
  <div class="kp" style="margin:20px 0"><div><b>${saved.length}</b><span>محفوظ</span></div><div><b>${done.length}</b><span>مقروء</span></div><div><b>${pct}%</b><span>تقدّمك</span></div></div>
  <div class="acx"><div class="box">${meter()}<p style="margin-top:8px"><small>سلسلة أيام اللعب: <b>${(JSON.parse(localStorage.kt_play || '{}').streak) || 0}</b></small></p></div>
  <div class="box"><b>شخصيتك</b><p style="margin:8px 0">${persona() && PERSONAS[persona()] ? `<span class="chip" style="background:${PERSONAS[persona()].color};color:#fff">${esc(PERSONAS[persona()].name)}</span> ${esc(PERSONAS[persona()].line)}` : 'لم تحدد شخصيتك بعد. اعرف نوع فضولك ونرتّب لك الموقع.'}</p><a class="btn sm" href="#/quiz">${persona() ? 'أعد الاختبار' : 'ابدأ الاختبار'}</a></div>
  <div class="box"><b>تقدّمك حسب التصنيف</b>${S.home.cats.map(c => { const all = items.filter(i => i.cat === c.id), dn = all.filter(i => u.done.includes(i.id)); return all.length ? `<div class="pg"><span>${esc(c.name)}</span><i><u style="width:${Math.round(dn.length / all.length * 100)}%;background:${c.color}"></u></i><small>${dn.length}/${all.length}</small></div>` : ''; }).join('')}</div></div>
  ${(() => { const nx = items.filter(i => u.bookmarks.includes(i.id) && !u.done.includes(i.id)).slice(0, 3); return nx.length ? `<div class="h2" style="font-size:24px;margin-top:26px">كمّل من حيث وقفت</div><div class="grid">${nx.map(card).join('')}</div>` : ''; })()}
  <div class="h2" style="font-size:24px">المفضلة</div><div class="grid">${saved.map(card).join('') || `<div style="grid-column:1/-1">${emptyBox('لم تحفظ شيئاً بعد')}</div>`}</div>
  <div class="pfx"><aside class="pfi"><div class="av" style="background:${persona() && PERSONAS[persona()] ? PERSONAS[persona()].color : 'var(--yellow)'}">${esc((u.name || '?').trim().charAt(0).toUpperCase())}</div><div class="h2" style="font-size:24px">الملف الشخصي<small>${esc(u.email)}</small></div><p><span class="pill y">${u.plan === 'plus' ? 'بلس' : 'خطة مجانية'}</span></p><p class="pfn">تغيّر الاسم أو كلمة المرور من هنا. بريدك لا يتغيّر.</p></aside>
  <form class="pff" id="pf" autocomplete="off"><label class="f" for="pn">الاسم</label><input id="pn" value="${esc(u.name)}" maxlength="60" required>
  <label class="f" for="pp">كلمة مرور جديدة (اختياري)</label><div class="pwr"><input id="pp" type="password" autocomplete="new-password" minlength="10"><button type="button" class="pws" id="pw1" aria-label="إظهار كلمة المرور" aria-pressed="false">إظهار</button></div>
  <div class="pwm" id="pm" hidden><i><u id="pmu"></u></i><small id="pmt"></small></div>
  <label class="f" for="pc" id="pcl" hidden>أعد كتابة كلمة المرور</label><input id="pc" type="password" autocomplete="new-password" hidden>
  <div class="err" id="pe" role="alert" aria-live="polite"></div>
  <div class="pfb"><button class="btn red" id="ps" disabled>حفظ التغييرات</button><button type="button" class="btn w" id="lo">خروج</button></div></form>
  ${u.role === 'admin' ? '' : u.delAt ? '' : `<details class="dgr"><summary>حذف الحساب</summary><p>هنمسح حسابك بعد <b>7 أيام</b>. خلال المهلة تقدر تدخل وتسترجعه بضغطة. بعد 7 أيام بيتمسح نهائياً: المفضلة والتقدّم والتعليقات والتقييمات.</p><label class="f" for="dpw">اكتب كلمة المرور للتأكيد</label><input id="dpw" type="password" autocomplete="current-password"><div class="err" id="de" role="alert"></div><p><button type="button" class="btn w" id="db">جدولة حذف حسابي</button></p></details>`}</div></section></div>`, '/account');
  const nm0 = u.name, pn = $('#pn'), pp = $('#pp'), pc = $('#pc'), ps = $('#ps'), pe = $('#pe');
  const strength = v => { let s = Math.min(v.length / 10, 1) * 50; if (/[A-Za-z]/.test(v) && /\d/.test(v)) s += 25; if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) s += 25; return Math.round(s); };
  const upd = () => {
    const v = pp.value, has = !!v; $('#pm').hidden = !has; pc.hidden = $('#pcl').hidden = !has;
    if (has) { const s = strength(v); $('#pmu').style.width = s + '%'; $('#pmu').style.background = v.length < 10 ? 'var(--red)' : s < 75 ? 'var(--yellow)' : '#3a9a52'; $('#pmt').textContent = v.length < 10 ? `${v.length} / 10 أحرف على الأقل` : s < 75 ? 'مقبولة، زوّد أرقام أو رموز' : 'قوية'; }
    const nameOk = pn.value.trim().length >= 2, dirty = pn.value.trim() !== nm0 || has;
    ps.disabled = !(nameOk && dirty); pe.textContent = '';
  };
  pn.oninput = pp.oninput = pc.oninput = upd;
  $('#pw1').onclick = e => { const sh = pp.type === 'password'; pp.type = pc.type = sh ? 'text' : 'password'; e.target.textContent = sh ? 'إخفاء' : 'إظهار'; e.target.setAttribute('aria-pressed', sh); };
  $('#pf').onsubmit = async e => {
    e.preventDefault(); if (ps.disabled) return;
    if (pp.value && pp.value.length < 10) { pe.textContent = 'كلمة المرور 10 أحرف على الأقل'; return pp.focus(); }
    if (pp.value && pp.value !== pc.value) { pe.textContent = 'كلمتا المرور غير متطابقتين'; return pc.focus(); }
    ps.disabled = true; ps.textContent = 'جارٍ الحفظ...';
    try { S.user = { ...S.user, ...await api('/me/profile', 'POST', { name: pn.value.trim(), password: pp.value }) }; toast(pp.value ? 'تم حفظ الاسم وكلمة المرور' : 'تم الحفظ'); pAccount(); }
    catch (er) { pe.textContent = er.message; ps.textContent = 'حفظ التغييرات'; ps.disabled = false; }
  };
  if ($('#rs')) $('#rs').onclick = async () => { try { S.user = { ...S.user, ...await api('/me/restore', 'POST') }; delete S.user.delAt; toast('تم استرجاع حسابك'); pAccount(); } catch (er) { toast(er.message); } };
  if ($('#db')) $('#db').onclick = async () => { const pw = $('#dpw').value; if (!pw) { $('#de').textContent = 'اكتب كلمة المرور'; return $('#dpw').focus(); } if (!confirm('هنحذف حسابك بعد 7 أيام، وتقدر تسترجعه قبلها. متأكد؟')) return; try { S.user = { ...S.user, ...await api('/me/delete', 'POST', { password: pw }) }; toast('تمت جدولة الحذف'); pAccount(); } catch (er) { $('#de').textContent = er.message; } };
  let lt; $('#lo').onclick = async e => {
    const b = e.target; if (!b.dataset.s) { b.dataset.s = 1; b.textContent = 'متأكد؟ اضغط تاني للخروج'; clearTimeout(lt); lt = setTimeout(() => { delete b.dataset.s; b.textContent = 'خروج'; }, 3500); return; }
    await api('/me/logout', 'POST').catch(() => { }); S.token = ''; S.user = null; localStorage.removeItem('kt_token'); location.hash = '#/';
  };
}
function pPlans() {
  const s = S.home.settings;
  shell(`<div class="wrap"><section class="s"><div class="h2">الخطط<small>ابدأ مجاناً</small></div><div class="plans">${s.plans.map((p, k) => `<div class="plan ${k ? 'hi' : ''}"><h3>${esc(p.name)}</h3><div class="pr">${p.soon ? 'قريباً' : 'بدون بطاقة'}</div><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><a class="btn ${k ? '' : 'red'}" href="#/signup">${p.soon ? 'سجّل لتُبلَّغ' : 'ابدأ الآن'}</a></div>`).join('')}</div></section></div>`, '/plans');
}
function pSuggest() {
  const cats = S.home.cats, ex = ['لماذا نشعر بالدوار في السيارة؟', 'كيف يعمل الـ GPS؟', 'لماذا الموز مقوّس؟', 'ماذا يحدث للنوم عندما نحلم؟'];
  let cat = '';
  shell(`<div class="wrap"><section class="sg sgx"><aside class="sgi"><div class="h2">اقترح موضوعاً<small>ما الذي تتمنى أن نشرحه؟ نقرأ كل اقتراح.</small></div>
  <div class="say">${mascot()}<span>اكتب سؤالاً واحداً واضحاً، وسأحوّله لحلقة.</span></div>
  <ol class="sgs"><li><b>1</b><span>تكتب سؤالك</span></li><li><b>2</b><span>نقرأه ونختار الأفضل</span></li><li><b>3</b><span>نحوّله لحلقة وننشرها</span></li></ol></aside>
  <div class="sgf"><label class="f">التصنيف (اختياري)</label><div class="bar strip" id="sc" role="group" aria-label="التصنيف">${cats.map(c => `<span class="chip" role="button" tabindex="0" aria-pressed="false" data-c="${c.id}" style="--cc:${c.color}">${esc(c.name)}</span>`).join('')}</div>
  <label class="f" for="st">اقتراحك</label><textarea id="st" maxlength="500" placeholder="مثال: ${ex[0]}"></textarea>
  <div class="sgm"><small id="sn" dir="ltr">0 / 500</small><button class="btn red" id="sb">إرسال</button></div><div class="err" id="se" role="alert"></div>
  <label class="f">أو ابدأ من فكرة جاهزة</label><div class="exl" id="se2">${ex.map(e => `<span class="chip" role="button" tabindex="0" data-e="${esc(e)}">${esc(e)}</span>`).join('')}</div></div></section></div>`, '/suggest');
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
      $('.sg').className = 'sg sgdone'; $('.sg').innerHTML = `<div style="text-align:center">${mascot()}<h1 style="margin:10px 0">وصل اقتراحك، شكراً!</h1><p>سنقرأه ونفكّر في تحويله لحلقة.</p><p style="margin-top:14px"><button class="btn red" id="sa">اقترح موضوعاً آخر</button> <a class="btn w" href="#/explore">استكشف</a></p></div>`;
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

const SI = { star: gi('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'), flag: gi('<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>'), reply: gi('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/>'), edit: gi('<path d="M4 20h4l10-10-4-4L4 16z"/>'), trash: gi('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>') };
function stars(v, cls = '') { return [1, 2, 3, 4, 5].map(n => `<span class="stv ${cls}${v >= n - 0.25 ? ' f' : v >= n - 0.75 ? ' h' : ''}">${SI.star}</span>`).join(''); }
function rtMount(i) {
  const host = $('#rtx'); if (!host) return; let mine = i.mine || 0, avg = i.rAvg || 0, n = i.rN || 0;
  const draw = () => {
    host.innerHTML = `<div class="rtb"><div class="rts" aria-label="متوسط التقييم">${n ? `<b>${avg.toFixed(1)}</b><span class="stw">${stars(avg)}</span><small>${n} تقييم</small>` : '<small>لا تقييمات بعد. كن أول من يقيّم الحلقة</small>'}</div>
    <div class="rtm" role="radiogroup" aria-label="قيّم الحلقة"><span class="rtl">${mine ? 'تقييمك' : 'قيّم الحلقة'}</span><span class="stw">${[1, 2, 3, 4, 5].map(k => `<button type="button" class="stb${mine >= k ? ' f' : ''}" data-s="${k}" role="radio" aria-checked="${mine === k}" aria-label="${k} من 5">${SI.star}</button>`).join('')}</span></div></div>`;
    host.onclick = async e => { const b = e.target.closest('[data-s]'); if (!b) return; if (!S.user) { toast('سجّل الدخول للتقييم'); location.hash = '#/login'; return; } try { const r = await api(`/items/${i.id}/rate`, 'POST', { stars: +b.dataset.s }); mine = r.mine; avg = r.rAvg; n = r.rN; i.rAvg = avg; i.rN = n; toast('شكراً على تقييمك'); draw(); } catch (x) { toast(x.message); } };
    const sb = host.querySelectorAll('.stb'); sb.forEach((b, k) => { b.onmouseenter = () => sb.forEach((x, j) => x.classList.toggle('h', j <= k)); b.onmouseleave = () => sb.forEach(x => x.classList.remove('h')); });
  };
  draw();
}
function cmMount(i, all) {
  const host = $('#cmx'); if (!host) return; const u = S.user; const opened = Date.now(); let sort = 'new', shown = 8, open = '', editing = '';
  const stl = { pending: 'بانتظار المراجعة', hidden: 'مخفي' };
  const draw = () => {
    const top = all.filter(c => !c.parent).sort((a, b) => sort === 'likes' ? (b.likes - a.likes) || (b.t - a.t) : b.t - a.t), kids = id => all.filter(c => c.parent === id).sort((a, b) => a.t - b.t);
    const one = (c, sub) => `<div class="cmt${sub ? ' sub' : ''}" id="c-${c.id}"><div class="cmh"><b>${esc(c.by)}</b>${c.mine ? '<span class="pill">أنت</span>' : ''}<small>${date(c.t)}${c.edited ? ' · معدّل' : ''}</small>${c.status !== 'ok' ? `<span class="pill y">${stl[c.status] || c.status}</span>` : ''}</div>
      ${editing === c.id ? `<textarea class="cmed" maxlength="600" data-ed="${c.id}">${esc(c.text)}</textarea><div class="cma"><button class="btn sm red" data-es="${c.id}">حفظ</button><button class="btn sm w" data-ec="1">إلغاء</button></div>` : `<p class="cmx">${esc(c.text)}</p>`}
      ${c.reply ? `<div class="rp"><b>${c.reply.auto ? 'ردّ تلقائي' : 'فريق ' + esc(S.home.settings.siteName)}:</b> ${esc(c.reply.text)}</div>` : ''}
      <div class="cma"><button class="cab${c.liked ? ' on' : ''}" data-l="${c.id}" aria-pressed="${c.liked}" aria-label="إعجاب">${GI.heart}<span>${c.likes || ''}</span></button>${!sub && c.status === 'ok' ? `<button class="cab" data-r="${c.id}">${SI.reply}<span>ردّ</span></button>` : ''}${c.mine ? `<button class="cab" data-e="${c.id}">${SI.edit}<span>تعديل</span></button><button class="cab" data-d="${c.id}">${SI.trash}<span>حذف</span></button>` : `<button class="cab${c.reported ? ' on' : ''}" data-rp="${c.id}" ${c.reported ? 'disabled' : ''}>${SI.flag}<span>${c.reported ? 'تم الإبلاغ' : 'إبلاغ'}</span></button>`}</div>
      ${open === c.id ? `<div class="cmf"><textarea maxlength="600" data-rt="${c.id}" placeholder="اكتب ردّك..." aria-label="ردّ"></textarea><div class="cma"><button class="btn sm red" data-rs="${c.id}">أرسل</button><button class="btn sm w" data-rc="1">إلغاء</button></div></div>` : ''}
      ${sub ? '' : kids(c.id).map(k => one(k, 1)).join('')}</div>`;
    host.innerHTML = `<div class="cmhd"><h2 style="margin:0">التعليقات <span class="pill">${all.length}</span></h2>${top.length > 1 ? `<select id="cso" aria-label="ترتيب التعليقات"><option value="new" ${sort === 'new' ? 'selected' : ''}>الأحدث</option><option value="likes" ${sort === 'likes' ? 'selected' : ''}>الأكثر إعجاباً</option></select>` : ''}</div>
    ${u ? `<div class="cmf main"><label class="f" for="ct">أضف تعليقاً</label><textarea id="ct" maxlength="600" placeholder="شاركنا رأيك أو سؤالك عن الحلقة"></textarea><input class="hp" id="hpw" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="cma"><button class="btn sm red" id="b-cm">أرسل</button><small id="cc" dir="ltr">0 / 600</small><span class="err" id="ce"></span></div></div>` : '<p class="empty"><a class="btn sm" href="#/login">سجّل الدخول للتعليق</a></p>'}
    <div class="cml">${top.slice(0, shown).map(c => one(c)).join('') || emptyBox('كن أول من يعلّق')}</div>${top.length > shown ? `<p><button class="btn sm w" id="cmore">عرض المزيد (${top.length - shown})</button></p>` : ''}`;
    const ct = $('#ct'); if (ct) ct.oninput = () => { $('#cc').textContent = ct.value.length + ' / 600'; };
    const so = $('#cso'); if (so) so.onchange = () => { sort = so.value; draw(); };
    const mo = $('#cmore'); if (mo) mo.onclick = () => { shown += 8; draw(); };
    const send = async (text, parent, errEl) => { try { const r = await api(`/items/${i.id}/comments`, 'POST', { text, parent, opened, website: ($('#hpw') || {}).value || '' }); all.push(r); toast(r.status === 'pending' ? 'وصل تعليقك، بانتظار المراجعة' : 'تم نشر التعليقك'.replace('التعليقك', 'تعليقك')); open = ''; draw(); } catch (e) { if (errEl) errEl.textContent = e.message; else toast(e.message); } };
    const bc = $('#b-cm'); if (bc) bc.onclick = () => send($('#ct').value, '', $('#ce'));
    host.onclick = async e => {
      const b = e.target.closest('button'); if (!b) return; const D = b.dataset;
      const act = async (id, a, extra) => { try { const r = await api(`/items/${i.id}/comments/${id}/${a}`, 'POST', extra || {}); const k = all.findIndex(x => x.id === id); if (r.comment) all[k] = r.comment; else all.splice(0, all.length, ...all.filter(x => x.id !== id && x.parent !== id)); editing = ''; draw(); return r; } catch (x) { toast(x.message); } };
      if (D.l) { if (!u) { toast('سجّل الدخول أولاً'); return; } return act(D.l, 'like'); }
      if (D.r) { open = open === D.r ? '' : D.r; return draw(); }
      if (D.rc) { open = ''; return draw(); }
      if (D.rs) { const t = host.querySelector(`[data-rt="${D.rs}"]`).value; return send(t, D.rs); }
      if (D.rp) { if (!u) { toast('سجّل الدخول أولاً'); return; } if (confirm('الإبلاغ عن هذا التعليق؟')) { const r = await act(D.rp, 'report'); if (r) toast('وصل بلاغك، شكراً'); } return; }
      if (D.e) { editing = D.e; return draw(); }
      if (D.ec) { editing = ''; return draw(); }
      if (D.es) return act(D.es, 'edit', { text: host.querySelector(`[data-ed="${D.es}"]`).value });
      if (D.d) { if (confirm('حذف تعليقك؟')) return act(D.d, 'delete'); }
    };
  };
  draw();
}
