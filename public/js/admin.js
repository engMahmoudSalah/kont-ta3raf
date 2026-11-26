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
  const el = $('#ad'); try { await ({ dash: aDash, content: aContent, comments: aComments, rules: aRules, users: aUsers, connect: aConnect, settings: aSettings, ideas: aIdeas }[tab])(el); labelTables(el); new MutationObserver(() => labelTables(el)).observe(el, { childList: true }); }
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

