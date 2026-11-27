// admin pages
// ---------- admin ----------
let tab = 'dash';
const ADMIN_TABS = [['dash', 'نظرة عامة', 'M4 13h6V4H4zM14 20h6V4h-6zM4 20h6v-3H4z'], ['content', 'المحتوى', 'M5 3h10l4 4v14H5zM8 12h8M8 16h8'], ['comments', 'التعليقات', 'M4 5h16v11H9l-5 4z'], ['rules', 'الردود التلقائية', 'M13 2 4 14h7l-1 8 9-12h-7z'], ['users', 'المستخدمون', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6'], ['connect', 'الربط والنشر', 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1'], ['settings', 'إعدادات الموقع', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-1-1-2h-4l-1 2-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z'], ['ideas', 'اقتراحات', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 3 1 3h6s0-2 1-3a6 6 0 0 0-4-10z']];
const labelTables = el => el.querySelectorAll('table.tbl').forEach(t => { const hs = [...t.querySelectorAll('tr:first-child th')].map(h => h.textContent.trim()); t.classList.add('rt'); t.querySelectorAll('tr').forEach(r => r.querySelectorAll('td').forEach((c, k) => { if (hs[k]) c.dataset.l = hs[k]; })); });
async function pAdmin(sub) {
  if (!S.user || S.user.role === 'user') return (location.hash = '#/login');
  if (sub && ADMIN_TABS.some(t => t[0] === sub)) tab = sub;
  const cur = ADMIN_TABS.find(t => t[0] === tab);
  shell(`<div class="adm"><nav class="adm-nav" aria-label="لوحة التحكم">${ADMIN_TABS.map(([k, v, d]) => `<a href="#/admin/${k}" class="${tab === k ? 'on' : ''}" ${tab === k ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg><span>${v}</span></a>`).join('')}</nav>
  <div class="adm-main"><div class="adm-head"><h1>${cur[1]}</h1><span class="pill y">${esc(S.user.name)} · ${S.user.role === 'admin' ? 'أدمن' : 'محرر'}</span></div><div id="ad"><div class="empty">${mascot()}جارٍ التحميل...</div></div></div></div>`, '/admin', { admin: true });
  { const on = document.querySelector('.adm-nav a.on'), nv = on && on.parentElement; if (nv && nv.scrollWidth > nv.clientWidth) nv.scrollLeft += on.getBoundingClientRect().left + on.offsetWidth / 2 - (nv.getBoundingClientRect().left + nv.clientWidth / 2); }
  const el = $('#ad'); try { await ({ dash: aDash, content: aContent, comments: aComments, rules: aRules, users: aUsers, connect: aConnect, settings: aSettings, ideas: aIdeas }[tab])(el); labelTables(el); new MutationObserver(() => labelTables(el)).observe(el, { childList: true }); }
  catch (e) { el.innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}
async function aDash(el) {
  const d = await api('/admin/stats'), t = d.totals; let rng = 14, more = false;
  const sum = (arr, k) => arr.reduce((a, x) => a + (x[k] || 0), 0);
  const draw = () => {
    const days = d.days.slice(-rng), prev = d.days.slice(-rng * 2, -rng), mx = Math.max(1, ...days.map(x => x.views || 0));
    const cv = sum(days, 'views'), pv = sum(prev, 'views'), dl = prev.length ? cv - pv : null;
    const delta = dl === null ? '' : `<em class="dl ${dl >= 0 ? 'up' : 'dn'}">${dl >= 0 ? '+' : ''}${dl} عن الفترة السابقة</em>`;
    const tm = Math.max(1, ...d.top.map(i => i.views || 0)), cm = Math.max(1, ...d.byCat.map(c => c.views || 0));
    const wd = x => new Date(x.d).toLocaleDateString('ar-EG', { weekday: 'short' });
    const alerts = [t.pending ? `<a class="al" href="#/admin/comments"><b>${t.pending}</b> تعليق ينتظر المراجعة</a>` : '', t.items - t.published > 0 ? `<a class="al" href="#/admin/content"><b>${t.items - t.published}</b> عنصر غير منشور</a>` : ''].join('');
    el.innerHTML = `${alerts ? `<div class="als">${alerts}</div>` : ''}<div class="kp"><div><b>${t.published}/${t.items}</b><span>منشور / الكل</span></div><div><b>${fmt(t.views)}</b><span>مشاهدات</span></div><div><b>${t.users}</b><span>مستخدمون</span></div><div><b>${t.likes}</b><span>إعجابات</span></div><div><b>${t.pending}</b><span>تعليقات للمراجعة</span></div><div><b>${sum(days, 'autoreplies')}</b><span>ردود تلقائية (${rng} يوماً)</span></div></div>
    <div class="ovh"><h3>المشاهدات آخر ${rng} يوماً: <b>${fmt(cv)}</b> ${delta}</h3><div class="bar strip" id="rg" role="group" aria-label="المدة">${[7, 14].map(n => `<span class="chip${rng === n ? ' on' : ''}" role="button" tabindex="0" aria-pressed="${rng === n}" data-r="${n}">${n} أيام</span>`).join('')}</div></div>
    <div class="chart2" role="img" aria-label="رسم المشاهدات">${days.map(x => `<div class="cb" title="${x.d}: ${x.views || 0}"><u>${x.views || 0}</u><i style="height:${Math.max(3, (x.views || 0) / mx * 100)}%"></i><small>${wd(x)}</small></div>`).join('')}</div>
    <div class="row" style="margin-top:26px"><div><h3>الأكثر مشاهدة</h3><ol class="rk">${d.top.map(i => `<li><span>${esc(i.title)}</span><i><u style="width:${Math.round((i.views || 0) / tm * 100)}%"></u></i><b>${fmt(i.views || 0)}</b></li>`).join('') || '<li>لا شيء بعد</li>'}</ol></div>
    <div><h3>حسب التصنيف</h3><ol class="rk">${d.byCat.map(c => `<li><span>${esc(c.name)} <small>(${c.n})</small></span><i><u style="width:${Math.round((c.views || 0) / cm * 100)}%"></u></i><b>${fmt(c.views || 0)}</b></li>`).join('')}</ol></div></div>
    <h3 style="margin-top:26px">آخر النشاطات</h3><ul class="tlg">${(more ? d.log : d.log.slice(0, 6)).map(l => `<li><time>${new Date(l.t).toLocaleString('ar-EG')}</time><b>${esc(l.who)}</b> ${esc(l.what)}</li>`).join('') || '<li>لا شيء بعد</li>'}</ul>${d.log.length > 6 ? `<button class="btn w sm" id="lm">${more ? 'أقل' : 'عرض الكل (' + d.log.length + ')'}</button>` : ''}`;
    const rg = $('#rg'); rg.onclick = e => { const c = e.target.closest('[data-r]'); if (c) { rng = Number(c.dataset.r); draw(); } }; rg.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } };
    const lm = $('#lm'); if (lm) lm.onclick = () => { more = !more; draw(); };
  };
  draw();
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
  let f = { q: '', st: '', type: [], cat: [], feat: false, sort: 'new' }, sel = new Set(); const now = Date.now();
  const stOf = i => i.status !== 'published' ? 'draft' : (i.publishAt && i.publishAt > now) ? 'sched' : 'pub';
  const SN = { pub: 'منشور', draft: 'مسودة', sched: 'مجدول' };
  const act = async (a) => { try { await api('/admin/items/bulk', 'POST', { ids: [...sel], action: a }); S.home = await api('/home'); const fresh = await api('/admin/items'); items.length = 0; items.push(...fresh); sel.clear(); draw(); toast('تم'); } catch (e) { toast(e.message); } };
  const draw = () => {
    const cnt = k => items.filter(i => stOf(i) === k).length;
    let r = items.filter(i => (!f.st || stOf(i) === f.st) && (!f.type.length || f.type.includes(i.type)) && (!f.cat.length || f.cat.includes(i.cat)) && (!f.feat || i.featured) && (!f.q || (i.title + ' ' + (i.summary || '') + ' ' + (i.tags || []).join(' ')).includes(f.q)));
    r = r.slice().sort((a, b) => f.sort === 'views' ? (b.views || 0) - (a.views || 0) : f.sort === 'title' ? a.title.localeCompare(b.title, 'ar') : f.sort === 'old' ? (a.created || 0) - (b.created || 0) : (b.created || 0) - (a.created || 0));
    const filt = f.q || f.st || f.type.length || f.cat.length || f.feat;
    el.innerHTML = `<div class="ikp"><button class="${!f.st ? 'on' : ''}" data-st=""><b>${items.length}</b><span>الكل</span></button>${['pub', 'draft', 'sched'].map(k => `<button class="${f.st === k ? 'on' : ''}" data-st="${k}"><b>${cnt(k)}</b><span>${SN[k]}</span></button>`).join('')}</div>
    <div id="sfh"></div>
    <p class="icn">${r.length} من ${items.length}</p>
    ${sel.size ? `<div class="ibk"><b>${sel.size} محدد</b><button class="btn w sm" data-b="publish">نشر الآن</button><button class="btn w sm" data-b="draft">إلى مسودة</button><button class="btn w sm" data-b="feature">اختيار للرئيسية</button><button class="btn w sm" data-b="unfeature">إلغاء الاختيار</button><button class="lk" id="cx2">إلغاء</button></div>` : ''}
    <div class="ilist">${r.map(i => { const s = stOf(i); return `<div class="ig ${sel.has(i.id) ? 'sel' : ''}"><label class="ck"><input type="checkbox" data-sel="${esc(i.id)}" ${sel.has(i.id) ? 'checked' : ''} aria-label="تحديد"></label><div class="ib"><div class="im"><span class="pill ${s === 'pub' ? 'g' : 'y'}">${SN[s]}${s === 'sched' ? ' · ' + date(i.publishAt) : ''}</span><span class="pill">${esc(TYPES[i.type] || i.type)}</span><span class="pill">${esc(catOf(i.cat).name)}</span>${i.featured ? '<span class="pill dp" style="background:var(--sand)">مختار</span>' : ''}${i.ep ? `<small>حلقة ${i.ep}</small>` : ''}</div>
    <div class="it" style="-webkit-line-clamp:2;cursor:default;font-weight:800">${esc(i.title)}</div><div class="im" style="margin-top:6px"><small>${GI.eye} ${fmt(i.views || 0)}</small><small>إعجابات ${i.likes || 0}</small><small>${i.created ? date(i.created) : ''}</small></div>
    <div class="ia"><button class="btn sm w" data-e="${esc(i.id)}">تعديل</button>${S.user.role === 'admin' ? `<button class="btn sm danger" data-d="${esc(i.id)}">حذف</button>` : ''}</div></div></div>`; }).join('') || emptyBox(items.length ? 'مفيش نتائج بالفلتر ده' : 'لا يوجد محتوى بعد')}</div>`;
    sfRender($('#sfh'), { id: 'content', state: f, items, ph: 'ابحث بالعنوان أو الوسم', onChange: draw, after: '<button class="btn sm" id="nw" type="button">+ محتوى جديد</button>',
      groups: [{ key: 'type', label: 'النوع', get: i => i.type, opts: Object.entries(TYPES).map(([v, t]) => ({ v, t })) }, { key: 'cat', label: 'التصنيف', get: i => i.cat, opts: cats.map(c => ({ v: c.id, t: c.name, color: c.color })) }],
      sorts: [['new', 'الأحدث'], ['old', 'الأقدم'], ['views', 'الأكثر مشاهدة'], ['title', 'بالعنوان']],
      extra: (i, s) => (!s.st || stOf(i) === s.st) && (!s.feat || i.featured),
      tags: s => [...(s.st ? [{ t: SN[s.st], clear: x => x.st = '' }] : []), ...(s.feat ? [{ t: 'مختار للرئيسية', clear: x => x.feat = false }] : [])],
      reset: s => { s.st = ''; s.feat = false; },
      presets: [{ t: 'المسودات', set: s => s.st = 'draft' }, { t: 'المجدولة', set: s => { s.st = 'sched'; s.sort = 'old'; } }, { t: 'المختارة للرئيسية', set: s => s.feat = true }, { t: 'الأكثر مشاهدة', set: s => { s.st = 'pub'; s.sort = 'views'; } }, { t: 'الأقدم أولاً', set: s => s.sort = 'old' }] });
    $('#nw').onclick = () => aContent(el, '');
    el.querySelector('.ikp').onclick = e => { const b = e.target.closest('[data-st]'); if (b) { f.st = b.dataset.st; draw(); } };
    el.querySelectorAll('[data-b]').forEach(b => b.onclick = () => act(b.dataset.b));
    const cx = $('#cx2'); if (cx) cx.onclick = () => { sel.clear(); draw(); };
    el.querySelector('.ilist').onclick = async e => {
      const t = e.target;
      if (t.dataset.sel) { t.checked ? sel.add(t.dataset.sel) : sel.delete(t.dataset.sel); return draw(); }
      if (t.dataset.e) return aContent(el, t.dataset.e);
      if (t.dataset.d && confirm('حذف نهائي؟')) { await api('/admin/items/' + t.dataset.d, 'DELETE'); S.home = await api('/home'); aContent(el); }
    };
  };
  draw();
}
async function aComments(el) {
  let l = await api('/admin/comments'); let f = { st: 'pending', q: '', nr: false, sort: 'new' }, sel = new Set(), rp = '';
  const SN = { pending: 'ينتظر', ok: 'ظاهر', hidden: 'مخفي' }, QR = ['شكراً على تعليقك!', 'سؤال حلو، هنجاوب عليه في حلقة قادمة.', 'تمام، اتسجّل عندنا.'];
  if (l.length && !l.some(c => c.status === 'pending')) f.st = '';
  const sOf = c => c.status === 'ok' ? 'ok' : c.status === 'pending' ? 'pending' : 'hidden';
  const call = async (c, a, text) => api('/admin/comments', 'POST', { action: a, id: c.id, item: c.item, text: text || '' });
  const reload = async () => { l = await api('/admin/comments'); draw(); };
  const bulk = async a => { const cs = l.filter(c => sel.has(c.id)); try { for (const c of cs) await call(c, a); sel.clear(); toast('تم'); } catch (e) { toast(e.message); } reload(); };
  const draw = () => {
    const cnt = k => l.filter(c => sOf(c) === k).length, nr = l.filter(c => !c.reply).length;
    let r = l.filter(c => (!f.st || sOf(c) === f.st) && (!f.nr || !c.reply) && (!f.q || (c.text + ' ' + c.by + ' ' + (c.itemTitle || '')).includes(f.q)));
    r = r.slice().sort((a, b) => f.sort === 'old' ? (a.t || 0) - (b.t || 0) : (b.t || 0) - (a.t || 0));
    const filt = f.st || f.q || f.nr;
    el.innerHTML = `<div class="ikp"><button class="${f.st === 'pending' ? 'on' : ''}" data-st="pending"><b>${cnt('pending')}</b><span>ينتظر المراجعة</span></button><button class="${f.st === 'ok' ? 'on' : ''}" data-st="ok"><b>${cnt('ok')}</b><span>ظاهر</span></button><button class="${f.st === 'hidden' ? 'on' : ''}" data-st="hidden"><b>${cnt('hidden')}</b><span>مخفي</span></button><button class="${f.nr ? 'on' : ''}" data-nr="1"><b>${nr}</b><span>بدون ردّ</span></button></div>
    <div class="itb"><input id="mq" type="search" placeholder="ابحث في التعليقات أو الأسماء أو الحلقات" value="${esc(f.q)}"><select id="ms" aria-label="الترتيب"><option value="new" ${f.sort === 'new' ? 'selected' : ''}>الأحدث</option><option value="old" ${f.sort === 'old' ? 'selected' : ''}>الأقدم</option></select></div>
    <p class="icn">${r.length} من ${l.length}${filt ? ' · <button class="lk" id="mcl">عرض الكل</button>' : ''}</p>
    ${sel.size ? `<div class="ibk"><b>${sel.size} محدد</b><button class="btn sm blue" data-b="approve">اعتماد</button><button class="btn sm w" data-b="hide">إخفاء</button><button class="btn sm danger" data-b="delete">حذف</button><button class="lk" id="mx">إلغاء</button></div>` : r.some(c => sOf(c) === 'pending') ? '<div class="ibk" style="background:#fff"><button class="btn sm blue" id="sa">تحديد كل المنتظر واعتماده</button></div>' : ''}
    <div class="ilist">${r.map(c => { const s = sOf(c), o = rp === c.id; return `<div class="ig ${sel.has(c.id) ? 'sel' : ''}"><label class="ck"><input type="checkbox" data-sel="${c.id}" ${sel.has(c.id) ? 'checked' : ''} aria-label="تحديد"></label><div class="ib"><div class="im"><b>${esc(c.by)}</b><span class="pill ${s === 'ok' ? 'g' : s === 'pending' ? 'y' : 'r'}">${SN[s]}</span><small>${esc(c.email || '')} · ${esc(c.itemTitle || '')}${c.t ? ' · ' + date(c.t) : ''}</small></div>
    <div class="it" style="-webkit-line-clamp:unset;cursor:default">${esc(c.text)}</div>${c.reply ? `<div class="rp">${c.reply.auto ? 'ردّ تلقائي: ' : 'ردّك: '}${esc(c.reply.text)}</div>` : ''}
    <div class="ia">${s !== 'ok' ? `<button class="btn sm blue" data-a="approve" data-i="${c.id}">اعتماد</button>` : `<button class="btn sm w" data-a="hide" data-i="${c.id}">إخفاء</button>`}<button class="btn sm w" data-a="open" data-i="${c.id}">${c.reply ? 'عدّل الردّ' : 'ردّ'}</button><button class="btn sm danger" data-a="delete" data-i="${c.id}">حذف</button></div>
    ${o ? `<div class="mrp"><div class="bar strip">${QR.map(q => `<span class="chip" role="button" tabindex="0" data-q="${esc(q)}">${esc(q)}</span>`).join('')}</div><textarea id="mr" maxlength="500" placeholder="اكتب ردّاً">${esc(c.reply && !c.reply.auto ? c.reply.text : '')}</textarea><div class="ia"><button class="btn sm" data-a="send" data-i="${c.id}">إرسال الردّ</button><button class="btn sm w" data-a="close">إلغاء</button></div></div>` : ''}</div></div>`; }).join('') || emptyBox(l.length ? 'مفيش تعليقات بالفلتر ده' : 'لا تعليقات بعد')}</div>`;
    const q = $('#mq'); q.oninput = () => { f.q = q.value; clearTimeout(draw.t); draw.t = setTimeout(() => { draw(); const n = $('#mq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
    $('#ms').onchange = e => { f.sort = e.target.value; draw(); };
    const cl = $('#mcl'); if (cl) cl.onclick = () => { f = { ...f, st: '', q: '', nr: false }; draw(); };
    el.querySelector('.ikp').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.nr) f.nr = !f.nr; else f.st = f.st === b.dataset.st ? '' : b.dataset.st; draw(); };
    el.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { if (b.dataset.b === 'delete' && !confirm(`حذف ${sel.size} تعليق؟`)) return; bulk(b.dataset.b); });
    const mx = $('#mx'); if (mx) mx.onclick = () => { sel.clear(); draw(); };
    const sa = $('#sa'); if (sa) sa.onclick = () => { r.filter(c => sOf(c) === 'pending').forEach(c => sel.add(c.id)); bulk('approve'); };
    el.querySelectorAll('[data-q]').forEach(c => c.onclick = () => { $('#mr').value = c.dataset.q; });
    el.querySelector('.ilist').onclick = async e => {
      const t = e.target;
      if (t.dataset.sel) { t.checked ? sel.add(t.dataset.sel) : sel.delete(t.dataset.sel); return draw(); }
      const a = t.dataset.a; if (!a) return; const c = l.find(x => x.id === t.dataset.i);
      if (a === 'open') { rp = c.id; return draw(); } if (a === 'close') { rp = ''; return draw(); }
      if (a === 'delete' && !confirm('حذف هذا التعليق؟')) return;
      try { if (a === 'send') { const v = $('#mr').value.trim(); if (!v) return toast('اكتب الردّ'); await call(c, 'reply', v); rp = ''; } else await call(c, a); toast('تم'); } catch (er) { toast(er.message); } reload();
    };
  };
  draw();
}
async function aRules(el) {
  let rules = await api('/admin/rules'), saved = JSON.stringify(rules), f = { q: '', on: '' }, test = '';
  const dirty = () => JSON.stringify(rules) !== saved;
  const match = t => rules.findIndex(r => r.on && r.keywords.some(k => k && t.toLowerCase().includes(k.toLowerCase())));
  const dupKw = () => { const m = {}; rules.forEach((r, k) => r.keywords.forEach(w => { const x = w.toLowerCase(); (m[x] = m[x] || new Set()).add(k); })); return Object.fromEntries(Object.entries(m).filter(([, s]) => s.size > 1).map(([w, s]) => [w, [...s]])); };
  const stat = () => { const d = $('#rsv'); if (d) { d.hidden = !dirty(); } };
  const draw = () => {
    const dk = dupKw(), n = rules.length, on = rules.filter(r => r.on).length;
    const vis = rules.map((r, k) => ({ r, k })).filter(({ r }) => (!f.on || (f.on === 'on' ? r.on : !r.on)) && (!f.q || r.keywords.join(' ').includes(f.q) || r.reply.includes(f.q)));
    el.innerHTML = `<p class="icn" style="margin-top:0">عندما يحتوي تعليق على إحدى الكلمات يُضاف الردّ فوراً. أول قاعدة مفعّلة تطابق هي اللي تُطبَّق، فالترتيب مهم.</p>
    <div class="ikp" style="grid-template-columns:repeat(3,1fr)"><button class="${!f.on ? 'on' : ''}" data-o=""><b>${n}</b><span>كل القواعد</span></button><button class="${f.on === 'on' ? 'on' : ''}" data-o="on"><b>${on}</b><span>مفعّلة</span></button><button class="${f.on === 'off' ? 'on' : ''}" data-o="off"><b>${n - on}</b><span>متوقفة</span></button></div>
    <div class="rtest"><label class="f" for="rt" style="margin-top:0">جرّب تعليقاً</label><input id="rt" value="${esc(test)}" placeholder="اكتب تعليقاً وشوف أي قاعدة هتردّ"><p id="rto" class="icn"></p></div>
    <div class="itb"><input id="rq" type="search" placeholder="ابحث في الكلمات أو الردود" value="${esc(f.q)}"><button class="btn sm" id="ar">+ قاعدة</button></div>
    ${Object.keys(dk).length ? `<div class="als"><span class="al">كلمات مكررة في أكتر من قاعدة: <b>${Object.keys(dk).map(esc).join('، ')}</b></span></div>` : ''}
    <div class="ilist">${vis.map(({ r, k }) => `<div class="ig rl ${r.on ? '' : 'off'}" data-k="${k}"><div class="rn"><b>${k + 1}</b><button data-mv="-1" data-i="${k}" aria-label="لأعلى" ${k === 0 ? 'disabled' : ''}>▲</button><button data-mv="1" data-i="${k}" aria-label="لأسفل" ${k === n - 1 ? 'disabled' : ''}>▼</button></div>
      <div class="ib"><div class="im"><label class="tg"><input type="checkbox" data-f="on" data-k="${k}" ${r.on ? 'checked' : ''}><i></i><span>${r.on ? 'مفعّلة' : 'متوقفة'}</span></label><small>${r.hits || 0} استخدام</small></div>
      <div class="kwb" data-k="${k}">${r.keywords.map((w, x) => `<span class="chip kw${dk[w.toLowerCase()] ? ' dp' : ''}">${esc(w)}<button data-rm="${k}:${x}" aria-label="حذف الكلمة">×</button></span>`).join('')}<input class="kwi" data-k="${k}" placeholder="${r.keywords.length ? 'كلمة أخرى' : 'اكتب كلمة واضغط Enter'}" maxlength="40"></div>
      <textarea data-k="${k}" data-f="reply" maxlength="500" placeholder="نص الردّ">${esc(r.reply)}</textarea><div class="im"><small class="cc" data-c="${k}">${r.reply.length} / 500</small>${!r.keywords.length || !r.reply.trim() ? '<span class="pill y">ناقصة: محتاجة كلمات وردّ</span>' : ''}<button class="btn sm danger" data-x="${k}" style="margin-inline-start:auto">حذف</button></div></div></div>`).join('') || emptyBox(n ? 'مفيش قواعد بالفلتر ده' : 'لا توجد قواعد بعد')}</div>
    <div class="ibk" id="rsv" ${dirty() ? '' : 'hidden'}><b>فيه تغييرات لسه ماتحفظتش</b><button class="btn sm red" id="sr">حفظ الكل</button><button class="lk" id="rv">تراجع</button></div>`;
    const tst = () => { const t = $('#rt').value; test = t; const o = $('#rto'); if (!t.trim()) { o.textContent = ''; return; } const m = match(t); o.innerHTML = m < 0 ? 'مفيش قاعدة هتردّ على ده.' : `هتردّ القاعدة <b>${m + 1}</b>: ${esc(rules[m].reply)}`; };
    $('#rt').oninput = tst; tst();
    const q = $('#rq'); q.oninput = () => { f.q = q.value; clearTimeout(draw.t); draw.t = setTimeout(() => { draw(); const x = $('#rq'); x.focus(); x.setSelectionRange(x.value.length, x.value.length); }, 250); };
    el.querySelector('.ikp').onclick = e => { const b = e.target.closest('[data-o]'); if (b) { f.on = b.dataset.o; draw(); } };
    $('#ar').onclick = () => { rules.push({ id: '', keywords: [], reply: '', on: true }); f = { q: '', on: '' }; draw(); const t = el.querySelectorAll('.kwi'); t[t.length - 1].focus(); t[t.length - 1].scrollIntoView({ block: 'center' }); };
    const addKw = (k, v) => { v = v.trim().replace(/[,،]+$/, '').trim(); if (v && !rules[k].keywords.includes(v) && rules[k].keywords.length < 12) { rules[k].keywords.push(v); return true; } return false; };
    el.querySelectorAll('.kwi').forEach(inp => { inp.onkeydown = e => { if (e.key === 'Enter' || e.key === ',' || e.key === '،') { e.preventDefault(); const k = +inp.dataset.k; if (addKw(k, inp.value)) { draw(); const t = el.querySelector(`.kwi[data-k="${k}"]`); t.focus(); } } else if (e.key === 'Backspace' && !inp.value) { const k = +inp.dataset.k; if (rules[k].keywords.pop()) { draw(); el.querySelector(`.kwi[data-k="${k}"]`).focus(); } } }; inp.onblur = () => { const k = +inp.dataset.k; if (inp.value.trim() && addKw(k, inp.value)) draw(); }; });
    el.querySelectorAll('textarea[data-f=reply]').forEach(t => t.oninput = () => { const k = +t.dataset.k; rules[k].reply = t.value; el.querySelector(`[data-c="${k}"]`).textContent = t.value.length + ' / 500'; stat(); });
    el.querySelectorAll('input[data-f=on]').forEach(c => c.onchange = () => { rules[+c.dataset.k].on = c.checked; draw(); });
    el.querySelector('.ilist').onclick = e => {
      const t = e.target;
      if (t.dataset.rm) { const [k, x] = t.dataset.rm.split(':').map(Number); rules[k].keywords.splice(x, 1); return draw(); }
      if (t.dataset.mv) { const k = +t.dataset.i, d = +t.dataset.mv; [rules[k], rules[k + d]] = [rules[k + d], rules[k]]; return draw(); }
      if (t.dataset.x !== undefined && confirm('حذف هذه القاعدة؟')) { rules.splice(+t.dataset.x, 1); draw(); }
    };
    const sr = $('#sr'); sr.onclick = async () => { const bad = rules.findIndex(r => !r.keywords.length || !r.reply.trim()); if (bad >= 0) return toast('القاعدة ' + (bad + 1) + ' ناقصة'); try { rules = await api('/admin/rules', 'POST', { rules }); saved = JSON.stringify(rules); toast('تم الحفظ'); draw(); } catch (er) { toast(er.message); } };
    $('#rv').onclick = async () => { rules = JSON.parse(saved); draw(); };
  };
  draw();
}
async function aUsers(el) {
  let l = await api('/admin/users'); const adm = S.user.role === 'admin', me = S.user.email;
  const RN = { user: 'مستخدم', editor: 'محرر', admin: 'أدمن' }, PN = { free: 'مجاني', plus: 'بلس' }, SN = { on: 'نشط', ban: 'محظور' };
  const f = { q: '', role: [], plan: [], st: [], sort: 'new' };
  const stOf = u => u.banned ? 'ban' : 'on';
  const act = u => (u.done || []).length + (u.bookmarks || []).length;
  const set = async (u, patch, msg) => { try { await api('/admin/users', 'POST', { email: u.email, ...patch }); Object.assign(u, patch); toast(msg || 'تم'); } catch (e) { toast(e.message); } draw(); };
  const draw = () => {
    const c = fn => l.filter(fn).length;
    const r = l.filter(u => (!f.role.length || f.role.includes(u.role)) && (!f.plan.length || f.plan.includes(u.plan)) && (!f.st.length || f.st.includes(stOf(u))) && (!f.q || (u.name + ' ' + u.email).toLowerCase().includes(f.q.toLowerCase())))
      .sort((a, b) => f.sort === 'old' ? a.created - b.created : f.sort === 'name' ? a.name.localeCompare(b.name, 'ar') : f.sort === 'act' ? act(b) - act(a) : b.created - a.created);
    const wk = Date.now() - 7 * 864e5;
    el.innerHTML = `<div class="ikp"><button data-k="all"><b>${l.length}</b><span>كل الحسابات</span></button><button data-k="new"><b>${c(u => u.created > wk)}</b><span>جدد آخر 7 أيام</span></button><button data-k="plus"><b>${c(u => u.plan === 'plus')}</b><span>بلس</span></button><button data-k="ban"><b>${c(u => u.banned)}</b><span>محظورون</span></button></div>
    <div id="sfh"></div><p class="icn">${r.length} من ${l.length}${adm ? '' : ' · العرض فقط (التعديل للأدمن)'}</p>
    <div class="ilist">${r.map(u => `<div class="ig us${u.banned ? ' off' : ''}"><div class="av" aria-hidden="true">${esc((u.name || '?').trim().charAt(0))}</div><div class="ib"><div class="im"><b class="un">${esc(u.name)}</b>${u.email === me ? '<span class="pill y">أنت</span>' : ''}<span class="pill${u.role === 'admin' ? ' dp' : ''}">${RN[u.role]}</span><span class="pill${u.plan === 'plus' ? ' g' : ''}">${PN[u.plan] || u.plan}</span>${u.banned ? '<span class="pill dp">محظور</span>' : ''}</div>
    <div class="ue" dir="ltr">${esc(u.email)}</div><div class="im" style="margin-top:6px"><small>أنهى ${(u.done || []).length}</small><small>محفوظ ${(u.bookmarks || []).length}</small><small>انضم ${date(u.created)}</small></div>
    ${adm && u.email !== me ? `<div class="ia"><label class="usl">الدور<select data-e="${esc(u.email)}" data-f="role">${Object.entries(RN).map(([k, v]) => `<option value="${k}" ${k === u.role ? 'selected' : ''}>${v}</option>`).join('')}</select></label><label class="usl">الخطة<select data-e="${esc(u.email)}" data-f="plan">${Object.entries(PN).map(([k, v]) => `<option value="${k}" ${k === u.plan ? 'selected' : ''}>${v}</option>`).join('')}</select></label><button class="btn sm ${u.banned ? 'blue' : 'danger'}" data-b="${esc(u.email)}">${u.banned ? 'رفع الحظر' : 'حظر'}</button></div>` : ''}</div></div>`).join('') || emptyBox('مفيش حسابات بالفلتر ده')}</div>`;
    sfRender($('#sfh'), { id: 'users', state: f, items: l, ph: 'ابحث بالاسم أو البريد', onChange: draw,
      groups: [{ key: 'role', label: 'الدور', get: u => u.role, opts: Object.entries(RN).map(([v, t]) => ({ v, t })) }, { key: 'plan', label: 'الخطة', get: u => u.plan, opts: Object.entries(PN).map(([v, t]) => ({ v, t })) }, { key: 'st', label: 'الحالة', get: stOf, opts: Object.entries(SN).map(([v, t]) => ({ v, t })) }],
      sorts: [['new', 'الأحدث'], ['old', 'الأقدم'], ['act', 'الأكثر نشاطاً'], ['name', 'بالاسم']],
      presets: [{ t: 'الفريق (أدمن ومحرر)', set: s => s.role = ['admin', 'editor'] }, { t: 'مشتركو بلس', set: s => s.plan = ['plus'] }, { t: 'المحظورون', set: s => s.st = ['ban'] }, { t: 'الأكثر نشاطاً', set: s => s.sort = 'act' }] });
    el.querySelector('.ikp').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; f.role = []; f.plan = []; f.st = []; f.q = ''; f.sort = 'new'; const k = b.dataset.k; if (k === 'plus') f.plan = ['plus']; if (k === 'ban') f.st = ['ban']; if (k === 'new') f.sort = 'new'; draw(); };
    el.querySelectorAll('select[data-f]').forEach(s => s.onchange = () => { const u = l.find(x => x.email === s.dataset.e); if (s.dataset.f === 'role' && s.value === 'admin' && !confirm('منح صلاحية أدمن كاملة لـ ' + u.name + '؟')) return draw(); set(u, { [s.dataset.f]: s.value }); });
    el.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const u = l.find(x => x.email === b.dataset.b); if (!u.banned && !confirm('حظر ' + u.name + '؟')) return; set(u, { banned: !u.banned }, u.banned ? 'اترفع الحظر' : 'تم الحظر'); });
  };
  draw();
}
let CNT = 'yt';
async function aConnect(el) {
  const d = await api('/admin/integrations'); const adm = S.user.role === 'admin';
  const r = (window.HQ && HQ.get('r')) || ''; if (r) { history.replaceState(null, '', '#/admin/connect'); CNT = r.startsWith('tiktok') ? 'tt' : 'yt'; }
  const [rp, ...rm] = r.split(':'); const rmsg = rm.join(':');
  const yt = d.youtube, tt = d.tiktok, Q = d.queue || [];
  const qn = k => Q.filter(q => (q.targets || []).includes(k)).length;
  const steps = (k, p) => `<ol class="cst">
    <li class="${d.configured[k] ? 'ok' : ''}"><b>مفاتيح التطبيق على السيرفر</b><span>${d.configured[k] ? 'تمت إضافتها' : 'لم تُضَف بعد. تُضاف عبر رابط آمن، ولا تُكتب هنا.'}</span></li>
    <li><b>سجّل هذا العنوان كـ Redirect URI في تطبيق ${p}</b><code dir="ltr">${esc(d.redirects[k])}</code><button class="btn sm" data-cp="${esc(d.redirects[k])}" type="button">نسخ</button></li>
    <li><b>اضغط ربط الحساب</b><span>${adm ? 'سيفتح ' + p + ' ويطلب الموافقة، ثم تعود لهنا.' : 'للأدمن فقط.'}</span></li></ol>`;
  const head = (name, p, on, who, err) => `<div class="chd"><div><h3>${name}</h3><span class="pill ${on ? 'g' : 'y'}">${on ? 'مربوط: ' + esc(who) : 'غير مربوط'}</span></div>${adm ? (on ? `<button class="btn sm" data-oa="disc-${p}">فصل الحساب</button>` : `<button class="btn sm red" data-oa="${p}" ${d.configured[p] ? '' : 'disabled'}>ربط الحساب</button>`) : ''}</div>${err ? `<p class="err">${esc(err)}</p>` : ''}`;
  const ytP = () => `${head('يوتيوب', 'youtube', yt.connected, yt.channel, yt.lastError)}
    ${!yt.connected ? `<div class="cnn"><p>لا توجد بيانات لعرضها قبل الربط. لن نعرض أرقاماً من غير حساب حقيقي.</p>${steps('youtube', 'جوجل')}</div>` : `
    <div class="ikp" id="ytk"><button disabled><b>...</b><span>مشتركون</span></button><button disabled><b>...</b><span>مشاهدات القناة</span></button><button disabled><b>...</b><span>فيديوهات</span></button><button disabled><b>${qn('youtube')}</b><span>في قائمة النشر</span></button></div><div id="yout"></div>
    ${adm ? `<details class="cdt" open><summary>الردود على التعليقات</summary><label class="tg"><input type="checkbox" id="yauto" ${d.cfg.ytAuto ? 'checked' : ''}><i></i><span>ردّ تلقائي كل 15 دقيقة بقواعد الردود</span></label><p class="icn">الإعداد الافتراضي: مطفأ. يردّ علناً من قناتك.</p><p class="bar"><button class="btn sm" id="ysd">فحص التعليقات بدون رد</button><button class="btn sm blue" id="ysr">فحص وردّ الآن</button></p><div id="ysout"></div></details>
    <details class="cdt"><summary>رفع فيديو على يوتيوب</summary><form id="yuf"><label class="f">رابط الفيديو (https مباشر لملف mp4)</label><input name="videoUrl" dir="ltr" required><label class="f">العنوان</label><input name="title" required maxlength="100"><label class="f">الوصف</label><textarea name="description"></textarea><div class="row"><div><label class="f">الخصوصية</label><select name="privacy"><option value="private">خاص</option><option value="unlisted">غير مدرج</option><option value="public">عام</option></select></div><div><label class="f">جدولة النشر (اختياري)</label><input name="when" type="datetime-local"></div></div><p style="margin-top:8px"><button class="btn sm red">رفع</button></p><div id="yuo"></div></form></details>` : ''}
    <details class="cdt"><summary>إحصائيات آخر 28 يوم</summary><div id="yan2"><p class="icn">جارٍ التحميل...</p></div></details>`}`;
  const ttP = () => `${head('تيك توك', 'tiktok', tt.connected, tt.name)}
    ${!tt.connected ? `<div class="cnn"><p>لا توجد بيانات لعرضها قبل الربط.</p>${steps('tiktok', 'تيك توك')}</div>` : `
    <div class="ikp"><button disabled><b>${qn('tiktok')}</b><span>في قائمة النشر</span></button><button disabled><b>-</b><span>إحصائيات</span></button></div>
    <p class="icn">واجهة تيك توك المربوطة هنا تتيح الرفع فقط. لا تعرض أرقام المتابعين أو المشاهدات، ولذلك لا نعرض أرقاماً. وتيك توك لا يتيح الرد على التعليقات عبر واجهته العامة.</p>
    ${adm ? `<details class="cdt" open><summary>رفع فيديو على تيك توك</summary><form id="tuf"><label class="f">رابط الفيديو (https، من نطاق موثّق في تطبيق تيك توك)</label><input name="videoUrl" dir="ltr" required><label class="f">العنوان</label><input name="title" maxlength="2000"><label class="f">الوضع</label><select name="mode"><option value="draft">مسودة في تطبيق تيك توك</option><option value="direct">نشر مباشر (خاص حتى المراجعة)</option></select><p style="margin-top:8px"><button class="btn sm red">رفع</button></p><div id="tuo"></div></form></details>` : ''}`}
    <p class="icn">النشر المباشر يبقى خاصاً حتى تُراجَع صلاحيات التطبيق. الرفع كمسودة يعمل مباشرة.</p>`;
  const qP = () => `<div class="box"><b>إضافة منشور للقائمة</b><form id="qf"><label class="f">العنوان</label><input name="title" required maxlength="140"><label class="f">الوصف والهاشتاغات</label><textarea name="caption" style="min-height:70px"></textarea>
    <div class="row"><div><label class="f">الوقت</label><input name="when" type="datetime-local"></div><div><label class="f">المنصات</label><div class="sw"><input type="checkbox" name="yt" checked> يوتيوب <input type="checkbox" name="tt" checked> تيك توك</div></div></div><p style="margin-top:10px"><button class="btn sm red">إضافة</button></p></form></div>
    <div class="ilist" style="margin-top:14px">${Q.map(q => `<div class="ig"><div class="ib"><div class="im">${(q.targets || []).map(t => `<span class="pill">${t === 'youtube' ? 'يوتيوب' : 'تيك توك'}</span>`).join('')}<span class="pill y">${esc(q.status)}</span><small>${esc(q.when || 'بدون وقت')}</small></div><div class="it" style="cursor:default;font-weight:800">${esc(q.title)}</div><div class="ia"><button class="btn sm danger" data-x="${q.id}">حذف</button></div></div></div>`).join('') || emptyBox('القائمة فارغة')}</div>`;
  const tab = (k, t, on) => `<button class="${CNT === k ? 'on' : ''}" data-tab="${k}" role="tab" aria-selected="${CNT === k}">${on == null ? '' : `<i class="dot ${on ? 'g' : ''}"></i>`}${t}</button>`;
  el.innerHTML = `${r ? `<div class="box" style="margin-bottom:10px;background:${rmsg === 'ok' ? '#dff3df' : '#fde3d8'}"><b>${rmsg === 'ok' ? 'تم الربط بنجاح: ' + (rp === 'youtube' ? 'يوتيوب' : 'تيك توك') : 'فشل الربط: ' + esc(rmsg)}</b></div>` : ''}
  <div class="ptabs" role="tablist">${tab('yt', 'يوتيوب', yt.connected)}${tab('tt', 'تيك توك', tt.connected)}${tab('q', 'قائمة النشر (' + Q.length + ')')}</div>
  <div class="pnl">${CNT === 'yt' ? ytP() : CNT === 'tt' ? ttP() : qP()}</div>`;
  const out = (id, h) => { const n = $(id); if (n) n.innerHTML = h; };
  const busy = async (id, fn) => { out(id, '<p class="icn">جارٍ التنفيذ...</p>'); try { await fn(); } catch (x) { out(id, `<p class="err">${esc(x.message)}</p>`); } };
  const tbl = rr => `<div class="tw"><table class="tbl rt"><tr>${rr.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${rr.rows.slice(-14).map(x => `<tr>${x.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table></div>`;
  el.onclick = async e => {
    const t = e.target.closest('button'); if (!t) return; const D = t.dataset;
    if (D.tab) { CNT = D.tab; return aConnect(el); }
    if (D.cp) { try { await navigator.clipboard.writeText(D.cp); toast('تم النسخ'); } catch (x) { toast('انسخه يدوياً'); } return; }
    if (D.x) { await api('/admin/queue', 'POST', { action: 'delete', id: D.x }); return aConnect(el); }
    if (D.oa) { const k = D.oa;
      if (k.startsWith('disc-')) { if (confirm('فصل الحساب؟')) { await api('/admin/oauth/disconnect', 'POST', { provider: k.slice(5) }); aConnect(el); } return; }
      try { const rr = await api('/admin/oauth/start', 'POST', { provider: k }); location.href = rr.url; } catch (x) { toast(x.message); } return; }
    if (t.id === 'ysd') return sync(true);
    if (t.id === 'ysr') { if (confirm('سيرد الموقع علناً على القناة. متأكد؟')) sync(false); }
  };
  const sync = dry => busy('#ysout', async () => { const rr = await api('/admin/yt/sync', 'POST', { dry }); out('#ysout', `<p>تم فحص ${rr.checked} تعليق، ${dry ? 'سيُردّ على ' + rr.rows.filter(x => x.rule).length : 'تم الرد على ' + rr.replied}</p>` + rr.rows.map(x => `<div class="cm"><b>${esc(x.by)}</b> ${x.rule ? '↩' : ''}<div>${esc(x.text)}</div></div>`).join('')); });
  const qf = $('#qf'); if (qf) qf.onsubmit = async e => { e.preventDefault(); const f = new FormData(e.target); await api('/admin/queue', 'POST', { title: f.get('title'), caption: f.get('caption'), when: f.get('when'), targets: [f.has('yt') && 'youtube', f.has('tt') && 'tiktok'].filter(Boolean) }); aConnect(el); };
  if ($('#yauto')) $('#yauto').onchange = async e => { await api('/admin/intcfg', 'POST', { ytAuto: e.target.checked }); toast(e.target.checked ? 'تم تشغيل الرد التلقائي' : 'تم الإيقاف'); };
  if (CNT === 'yt' && yt.connected) { (async () => { try { const rr = await api('/admin/yt/analytics'); const s = rr.stats || {}; const k = $('#ytk'); if (k) { const b = k.querySelectorAll('b'); b[0].textContent = s.subscriberCount != null ? fmt(+s.subscriberCount) : '-'; b[1].textContent = s.viewCount != null ? fmt(+s.viewCount) : '-'; b[2].textContent = s.videoCount != null ? fmt(+s.videoCount) : '-'; } out('#yan2', rr.rows && rr.rows.length ? tbl(rr) : '<p class="icn">لا توجد بيانات لهذه الفترة.</p>'); } catch (x) { out('#yan2', `<p class="err">تعذّر تحميل الإحصائيات: ${esc(x.message)}</p>`); const k = $('#ytk'); if (k) k.querySelectorAll('b').forEach((b, n) => { if (n < 3) b.textContent = '-'; }); } })(); }
  if ($('#yuf')) $('#yuf').onsubmit = e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); if (f.when) f.publishAt = Date.parse(f.when + ':00+02:00'); delete f.when; if (!confirm('رفع الفيديو على قناتك؟')) return; busy('#yuo', async () => { const rr = await api('/admin/yt/upload', 'POST', f); out('#yuo', `<p>تم الرفع: <a href="${esc(rr.url)}" target="_blank" rel="noopener">${esc(rr.url)}</a></p>`); }); };
  if ($('#tuf')) $('#tuf').onsubmit = e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); busy('#tuo', async () => { const rr = await api('/admin/tt/upload', 'POST', f); out('#tuo', `<p>تم الإرسال (${rr.mode}) رقم ${esc(rr.publishId)}</p>`); }); };
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
  let l = await api('/admin/suggestions'); const cats = (S.home && S.home.cats) || [];
  const ST = [['new', 'جديد'], ['plan', 'قيد الدراسة'], ['done', 'اتنفّذ'], ['no', 'مرفوض']];
  let f = { st: '', q: '', cat: '', sort: 'new', dup: false }, sel = new Set(), open = '';
  const parse = x => { const m = /^\[([^\]]+)\]\s*/.exec(x.text); return { cat: m ? m[1] : '', body: m ? x.text.slice(m[0].length) : x.text }; };
  const words = t => new Set(t.replace(/[^\u0600-\u06FFa-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2));
  const dupMap = () => { const ws = l.map(x => words(parse(x).body)), m = {}; for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) { if (ws[i].size < 2 || ws[j].size < 2) continue; let n = 0; ws[i].forEach(w => { if (ws[j].has(w)) n++; }); if (n / Math.min(ws[i].size, ws[j].size) >= .6) { (m[l[i].id] = m[l[i].id] || []).push(l[j].id); (m[l[j].id] = m[l[j].id] || []).push(l[i].id); } } return m; };
  const act = async (a, extra) => { try { await api('/admin/suggestions/bulk', 'POST', { ids: [...sel], action: a, ...extra }); l = await api('/admin/suggestions'); sel.clear(); if (f.dup && !Object.keys(dupMap()).length) f.dup = false; draw(); toast('تم'); } catch (e) { toast(e.message); } };
  const draw = () => {
    const dm = dupMap(), cnt = k => l.filter(x => (x.status || 'new') === k).length, cs = [...new Set(l.map(x => parse(x).cat).filter(Boolean))];
    let r = l.filter(x => (!f.st || (x.status || 'new') === f.st) && (!f.cat || parse(x).cat === f.cat) && (!f.dup || dm[x.id]) && (!f.q || x.text.includes(f.q) || (x.by || '').includes(f.q)));
    r = r.slice().sort((a, b) => f.sort === 'old' ? a.t - b.t : f.sort === 'star' ? (!!b.star - !!a.star) || b.t - a.t : b.t - a.t);
    const ne = Object.keys(dm).length;
    const row = x => { const p = parse(x), s = x.status || 'new', d = dm[x.id], o = open === x.id; return `<div class="ig ${sel.has(x.id) ? 'sel' : ''} s-${s}" data-id="${x.id}"><label class="ck"><input type="checkbox" data-sel="${x.id}" ${sel.has(x.id) ? 'checked' : ''} aria-label="تحديد"></label>
      <div class="ib"><div class="im"><button class="st${x.star ? ' on' : ''}" data-star="${x.id}" aria-label="تمييز" aria-pressed="${!!x.star}">★</button>${p.cat ? `<span class="pill">${esc(p.cat)}</span>` : ''}<span class="pill s${s}">${ST.find(q => q[0] === s)[1]}</span>${x.merged ? `<span class="pill">+${x.merged} مدموج</span>` : ''}${d ? `<span class="pill dp" data-dup="${x.id}">${d.length} مشابه</span>` : ''}<small>${esc(x.by)} · ${date(x.t)}</small></div>
      <div class="it ${o ? 'o' : ''}" data-open="${x.id}">${esc(p.body)}</div>
      ${o ? `<div class="ia">${ST.map(([k, n]) => `<button class="btn w sm" data-mv="${k}" data-i="${x.id}" ${k === s ? 'disabled' : ''}>${n}</button>`).join('')}</div>` : ''}</div></div>`; };
    el.innerHTML = `<div class="ikp">${ST.map(([k, n]) => `<button class="${f.st === k ? 'on' : ''}" data-st="${k}"><b>${cnt(k)}</b><span>${n}</span></button>`).join('')}</div>
    <div class="itb"><input id="iq" type="search" placeholder="ابحث في الاقتراحات" value="${esc(f.q)}"><select id="is" aria-label="الترتيب"><option value="new" ${f.sort === 'new' ? 'selected' : ''}>الأحدث</option><option value="old" ${f.sort === 'old' ? 'selected' : ''}>الأقدم</option><option value="star" ${f.sort === 'star' ? 'selected' : ''}>المميّز أولاً</option></select></div>
    <div class="bar strip" id="ic" role="group" aria-label="التصنيف"><span class="chip${!f.cat ? ' on' : ''}" role="button" tabindex="0" data-c="">الكل</span>${cs.map(c => `<span class="chip${f.cat === c ? ' on' : ''}" role="button" tabindex="0" data-c="${esc(c)}">${esc(c)}</span>`).join('')}${ne ? `<span class="chip${f.dup ? ' on' : ''}" role="button" tabindex="0" data-d="1">المتشابهة (${ne})</span>` : ''}</div>
    <p class="icn">${r.length} من ${l.length}${(f.st || f.cat || f.q || f.dup) ? ' · <button class="lk" id="icl">مسح الفلاتر</button>' : ''}</p>
    ${sel.size ? `<div class="ibk"><b>${sel.size} محدد</b>${ST.map(([k, n]) => `<button class="btn w sm" data-bs="${k}">${n}</button>`).join('')}<button class="btn w sm" data-bk="star">تمييز</button>${sel.size > 1 ? '<button class="btn w sm" id="bm">دمج المتشابه</button>' : ''}${S.user.role === 'admin' ? '<button class="btn w sm" id="bd">حذف</button>' : ''}<button class="lk" id="bx">إلغاء</button></div>` : ''}
    <div class="ilist">${r.map(row).join('') || emptyBox(l.length ? 'مفيش نتائج بالفلتر ده' : 'لا اقتراحات بعد')}</div>`;
    const q = $('#iq'); q.oninput = () => { f.q = q.value; clearTimeout(draw.t); draw.t = setTimeout(() => { draw(); const n = $('#iq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
    $('#is').onchange = e => { f.sort = e.target.value; draw(); };
    const cl = $('#icl'); if (cl) cl.onclick = () => { f = { ...f, st: '', q: '', cat: '', dup: false }; draw(); };
    $('#ic').onclick = e => { const c = e.target.closest('[data-c],[data-d]'); if (!c) return; if (c.dataset.d) f.dup = !f.dup; else f.cat = c.dataset.c; draw(); };
    $('#ic').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } };
    el.querySelector('.ikp').onclick = e => { const b = e.target.closest('[data-st]'); if (b) { f.st = f.st === b.dataset.st ? '' : b.dataset.st; draw(); } };
    el.querySelector('.ilist').onclick = e => {
      const t = e.target;
      if (t.dataset.sel) { t.checked ? sel.add(t.dataset.sel) : sel.delete(t.dataset.sel); return draw(); }
      if (t.dataset.star) { sel = new Set([t.dataset.star]); return act(l.find(x => x.id === t.dataset.star).star ? 'unstar' : 'star'); }
      if (t.dataset.mv) { sel = new Set([t.dataset.i]); return act('status', { status: t.dataset.mv }); }
      if (t.dataset.dup) { const g = [t.dataset.dup, ...dm[t.dataset.dup]]; sel = new Set(g); f = { ...f, st: '', q: '', cat: '', dup: true }; return draw(); }
      const o = t.closest('[data-open]'); if (o) { open = open === o.dataset.open ? '' : o.dataset.open; draw(); }
    };
    el.querySelectorAll('[data-bs]').forEach(b => b.onclick = () => act('status', { status: b.dataset.bs }));
    el.querySelectorAll('[data-bk]').forEach(b => b.onclick = () => act('star'));
    const bm = $('#bm'); if (bm) bm.onclick = () => { const ids = [...sel], keep = l.filter(x => sel.has(x.id)).sort((a, b) => a.t - b.t)[0].id; if (confirm(`دمج ${ids.length} اقتراحات في أقدمهم؟`)) act('merge', { keep }); };
    const bd = $('#bd'); if (bd) bd.onclick = () => { if (confirm(`حذف ${sel.size} اقتراح؟`)) act('delete'); };
    $('#bx') && ($('#bx').onclick = () => { sel.clear(); draw(); });
  };
  draw();
}

