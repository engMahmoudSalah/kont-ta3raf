import * as IG from './integrations.js';
import { CATS, ITEMS, RULES, SETTINGS } from './seed.js';
import { KIDS } from './kidsdata.js';
import { STATIC_ITEMS } from './statics.js';
const KROW = (r, i) => ({ id: i + 1, topic: r[0], level: r[1], n: r[2], t: r[3], c: r[4], q: r[5], a: r[6], w: [r[7], r[8]] });

const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const err = (m, s = 400) => J({ error: m }, s);
const rid = (n = 12) => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
const day = () => new Date().toISOString().slice(0, 10);
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function hash(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, k, 256));
}
const clip = (s, n) => String(s ?? '').slice(0, n);

async function get(env, k, d) { const v = await env.KV.get(k, 'json'); if (k === 'items' && Array.isArray(v)) { const ids = new Set(v.map(x => x.id)); const add = STATIC_ITEMS.filter(x => !ids.has(x.id)); return add.length ? [...add, ...v] : v; } return v ?? d; }
const put = (env, k, v, o) => env.KV.put(k, JSON.stringify(v), o);

async function init(env) {
  if (await env.KV.get('inited') && await env.KV.get('cats2') === null) { const c = await get(env, 'cats', []); for (const x of [{ id: 'faith', name: 'ديني', color: '#9DC4D5', icon: '🕌' }, { id: 'stories', name: 'قصص', color: '#EF642D', icon: '📖' }, { id: 'weird', name: 'أفكار غريبة', color: '#463C50', icon: '🤯' }, { id: 'money', name: 'استثمار وأموال', color: '#F0B400', icon: '💰' }, { id: 'experiences', name: 'تجارب', color: '#2E6FBE', icon: '🧪' }]) if (!c.find(y => y.id === x.id)) c.push(x); await put(env, 'cats', c); await env.KV.put('cats2', '1'); }
  if (await env.KV.get('inited') && await env.KV.get('covers1') !== null && await env.KV.get('pal1') === null) { const c = await get(env, 'cats', []); const pal = { science: '#2E6FBE', nature: '#9DC4D5', history: '#F0B400', tech: '#EF642D', space: '#463C50', body: '#FADA80' }; c.forEach(x => { if (pal[x.id]) x.color = pal[x.id]; }); await put(env, 'cats', c); await env.KV.put('pal1', '1'); }
  if (await env.KV.get('inited') && await env.KV.get('fixdates') !== null && await env.KV.get('covers1') !== null) return;
  if (await env.KV.get('inited') && await env.KV.get('fixdates') !== null) { const it = await get(env, 'items', []); const cv = { 'ep1-airplane-window': '/covers/ep1.jpg', 'ep2-blue-sky': '/covers/ep2.jpg' }; it.forEach(x => { if (cv[x.id] && !x.cover) x.cover = cv[x.id]; }); await put(env, 'items', it); await env.KV.put('covers1', '1'); return; }
  if (await env.KV.get('inited')) { const it = await get(env, 'items', []); const n = Date.now(); it.forEach((x, k) => { if (x.created < 1e12) x.created = n - k * 3600000; }); await put(env, 'items', it); await env.KV.put('fixdates', '1'); return; }
  await put(env, 'items', ITEMS); await put(env, 'rules', RULES); await put(env, 'settings', SETTINGS);
  await put(env, 'cats', CATS); await env.KV.put('inited', '1'); await env.KV.put('fixdates', '0'); await env.KV.put('covers1', '1'); const it = ITEMS.map((x, k) => ({ ...x, created: Date.now() - k * 3600000 })); await put(env, 'items', it);
}
async function hit(env, key, n = 1) {
  const k = 'stat:' + day(); const s = await get(env, k, {});
  s[key] = (s[key] || 0) + n; try { await put(env, k, s, { expirationTtl: 86400 * 120 }); } catch (e) { }
}
async function log(env, who, what) {
  const l = await get(env, 'log', []); l.unshift({ t: Date.now(), who, what: clip(what, 200) });
  await put(env, 'log', l.slice(0, 100));
}
async function me(req, env) {
  const t = (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!t) return null;
  const s = await get(env, 'sess:' + t, null); if (!s) return null;
  const u = await get(env, 'user:' + s.email, null); if (!u || u.banned || (u.delAt && u.delAt <= Date.now())) return null;
  return u;
}
const pub = u => u && ({ email: u.email, name: u.name, role: u.role, plan: u.plan, created: u.created, bookmarks: u.bookmarks, done: u.done, persona: u.persona || '', delAt: u.delAt || 0 });
const GRACE = 7 * 86400000;
async function purgeUser(env, email) {
  const items = await get(env, 'items', []); let ch = false;
  for (const it of items) {
    const cl = await get(env, 'comments:' + it.id, []); const nl = cl.filter(c => c.email !== email && !cl.some(p => p.id === c.parent && p.email === email));
    if (nl.length !== cl.length) await put(env, 'comments:' + it.id, nl);
    const rt = await get(env, 'ratings:' + it.id, {}); if (email in rt) { delete rt[email]; await put(env, 'ratings:' + it.id, rt); const v = Object.values(rt); it.rN = v.length; it.rAvg = v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : 0; ch = true; }
  }
  if (ch) await put(env, 'items', items);
  await env.KV.delete('user:' + email);
  const ul = await get(env, 'users', []); await put(env, 'users', ul.filter(e => e !== email));
  await log(env, 'system', 'حذف نهائي لحساب بعد مهلة 7 أيام: ' + email);
}
async function purgeDue(env) {
  for (const e of await get(env, 'users', [])) { const x = await get(env, 'user:' + e, null); if (x && x.delAt && x.delAt <= Date.now() && x.role !== 'admin') await purgeUser(env, e); }
}
const isStaff = u => u && (u.role === 'admin' || u.role === 'editor');
const live = (i, n = Date.now()) => i.status === 'published' && (!i.publishAt || i.publishAt <= n);
const cview = (c, u) => { const st = isStaff(u); return { id: c.id, by: c.by, text: c.text, t: c.t, status: c.status, reply: c.reply, parent: c.parent || '', likes: (c.likes || []).length, liked: !!(u && (c.likes || []).includes(u.email)), mine: !!(u && c.email === u.email), edited: c.edited || 0, reports: st ? (c.reports || []).length : 0, reported: !!(u && (c.reports || []).includes(u.email)), ...(st ? { email: c.email } : {}) }; };
const slim = i => { const { body, ...r } = i; return r; };

async function rate(env, ip, name, max, ttl = 900) {
  const k = `rl:${name}:${ip}`; const n = Number(await env.KV.get(k) || 0);
  if (n >= max) return false; try { await env.KV.put(k, String(n + 1), { expirationTtl: ttl }); } catch (e) { } return true;
}


async function saveItem(env, u, body) {
  const items = await get(env, 'items', []); const cats = await get(env, 'cats', []);
  const id = clip(body.id, 60).replace(/[^\w-]/g, ''); let it = id && items.find(i => i.id === id);
  if (!cats.find(c => c.id === body.cat)) return err('تصنيف غير صالح');
  if (!clip(body.title, 140).trim()) return err('العنوان مطلوب');
  const ytid = v => clip(v, 40).replace(/[^\w-]/g, '');
  const url = v => /^(\/[\w\/.-]+|https:\/\/[^\s"'<>]+)$/.test(String(v || '')) ? clip(v, 300) : '';
  const pa = Number(body.publishAt) || 0;
  const f = { cat: body.cat, type: ['video', 'article', 'guide', 'checklist'].includes(body.type) ? body.type : 'article', title: clip(body.title, 140), summary: clip(body.summary, 300), body: clip(body.body, 20000), tags: (body.tags || []).slice(0, 8).map(t => clip(t, 24)), status: ['published', 'draft'].includes(body.status) ? body.status : 'draft', featured: !!body.featured, minutes: Math.max(1, Math.min(60, +body.minutes || 3)), youtube: ytid(body.youtube), short: ytid(body.short), tiktok: url(body.tiktok), cover: url(body.cover), ep: Math.max(0, Math.min(9999, parseInt(body.ep) || 0)), credit: clip(body.credit, 200), publishAt: pa > 1e12 && pa < 4e12 ? pa : 0 };
  if (it) Object.assign(it, f); else { it = { id: id || rid(5), views: 0, likes: 0, created: Date.now(), ...f }; items.unshift(it); }
  await put(env, 'items', items); await log(env, u ? u.email : 'publish-api', 'حفظ محتوى: ' + it.title); return J(it);
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url); const p = url.pathname; const m = req.method;
    const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    if (p === '/sitemap.xml') {
      await init(env); const items = (await get(env, 'items', [])).filter(i => live(i));
      const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.origin}/</loc></url>${['/privacy', '/terms'].map(x => `<url><loc>${url.origin}${x}</loc></url>`).join('')}${items.map(i => `<url><loc>${url.origin}/e/${escH(i.id)}</loc><lastmod>${new Date(i.publishAt || i.created || Date.now()).toISOString().slice(0, 10)}</lastmod></url>`).join('')}</urlset>`;
      return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
    }
    let em;
    if ((em = p.match(/^\/e\/([\w-]+)$/))) {
      await init(env); const it = (await get(env, 'items', [])).find(i => i.id === em[1] && live(i));
      if (!it) return Response.redirect(url.origin + '/', 302);
      const img = it.cover ? url.origin + it.cover : url.origin + '/og.jpg'; const dest = `${url.origin}/#/item/${it.id}`;
      const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escH(it.title)} | كنت تعرف!</title><meta name="description" content="${escH(it.summary)}"><meta property="og:type" content="article"><meta property="og:title" content="${escH(it.title)}"><meta property="og:description" content="${escH(it.summary)}"><meta property="og:image" content="${escH(img)}"><meta property="og:url" content="${url.origin}/e/${escH(it.id)}"><link rel="canonical" href="${url.origin}/e/${escH(it.id)}"><script type="application/ld+json">${JSON.stringify(it.youtube ? { '@context': 'https://schema.org', '@type': 'VideoObject', name: it.title, description: it.summary, thumbnailUrl: [img], uploadDate: new Date(it.publishAt || it.created || Date.now()).toISOString(), embedUrl: 'https://www.youtube-nocookie.com/embed/' + it.youtube, inLanguage: 'ar' } : { '@context': 'https://schema.org', '@type': 'Article', headline: it.title, description: it.summary, image: [img], datePublished: new Date(it.publishAt || it.created || Date.now()).toISOString(), inLanguage: 'ar' }).replace(/</g, '\\u003c')}</script><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url=${escH(dest)}"></head><body><a href="${escH(dest)}">${escH(it.title)}</a><script>location.replace(${JSON.stringify(dest)})</script></body></html>`;
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
    }
    if (!p.startsWith('/api/')) return env.ASSETS.fetch(req);
    await init(env);
    const ip = req.headers.get('cf-connecting-ip') || 'x';
    let body = {};
    if (m !== 'GET') { try { body = await req.json(); } catch { body = {}; } }
    const u = await me(req, env);

    // ---------- public ----------
    if (p === '/api/home' && m === 'GET') {
      const [items, settings, cats] = await Promise.all([get(env, 'items', []), get(env, 'settings', {}), get(env, 'cats', [])]);
      const pubItems = items.filter(i => live(i));
      hit(env, 'home');
      return J({ settings, cats: cats.map(c => ({ ...c, count: pubItems.filter(i => i.cat === c.id).length })), items: pubItems.map(slim) });
    }
    if (p === '/api/items' && m === 'GET') {
      const items = (await get(env, 'items', [])).filter(i => live(i));
      return J(items.map(slim));
    }
    let mm;
    if ((mm = p.match(/^\/api\/items\/([\w-]+)$/)) && m === 'GET') {
      const items = await get(env, 'items', []); const it = items.find(i => i.id === mm[1]);
      if (!it || (!live(it) && !isStaff(u))) return err('not found', 404);
      if (live(it) && await rate(env, ip + mm[1], 'view', 1, 1800)) {
        it.views++; try { await put(env, 'items', items); } catch (e) { } hit(env, 'views'); hit(env, 'v:' + it.id);
      }
      const comments = (await get(env, 'comments:' + it.id, [])).filter(c => c.status === 'ok' || isStaff(u) || (u && c.email === u.email)).map(c => cview(c, u));
      const rt = await get(env, 'ratings:' + it.id, {}); it.mine = u ? (rt[u.email] || 0) : 0;
      const related = items.filter(i => i.cat === it.cat && i.id !== it.id && live(i)).slice(0, 3).map(slim);
      const eps = items.filter(i => i.ep && live(i)).sort((a, b) => a.ep - b.ep); const k = eps.findIndex(i => i.id === it.id);
      return J({ item: it, comments, related, prev: k > 0 ? slim(eps[k - 1]) : null, next: k >= 0 && k < eps.length - 1 ? slim(eps[k + 1]) : null });
    }
    if ((mm = p.match(/^\/api\/items\/([\w-]+)\/like$/)) && m === 'POST') {
      if (!await rate(env, ip + mm[1], 'like', 1, 86400)) return err('تم تسجيل إعجابك من قبل', 429);
      const items = await get(env, 'items', []); const it = items.find(i => i.id === mm[1]);
      if (!it) return err('not found', 404); it.likes++; await put(env, 'items', items); hit(env, 'likes');
      return J({ likes: it.likes });
    }
    if ((mm = p.match(/^\/api\/items\/([\w-]+)\/comments$/)) && m === 'POST') {
      const settings = await get(env, 'settings', {});
      if (!settings.commentsOpen) return err('التعليقات مغلقة حالياً', 403);
      if (!u) return err('سجّل الدخول للتعليق', 401);
      if (body.website) return err('تعذّر الإرسال');
      if (body.opened && Date.now() - Number(body.opened) < 2500) return err('انتظر لحظة قبل الإرسال');
      if (!await rate(env, u.email, 'cm', 8, 3600)) return err('محاولات كثيرة، حاول لاحقاً', 429);
      const text = clip(body.text, 600).replace(/\s+\n/g, '\n').trim(); if (text.length < 2) return err('اكتب تعليقاً');
      if ((text.match(/https?:\/\//gi) || []).length > 1) return err('الروابط غير مسموحة في التعليقات');
      if (/(.)\1{9,}/.test(text)) return err('النص يبدو مكرراً بلا معنى');
      const key = 'comments:' + mm[1]; const list = await get(env, key, []);
      if (list.some(x => x.email === u.email && x.text === text && Date.now() - x.t < 600000)) return err('أرسلت نفس التعليق للتو');
      let parent = '';
      if (body.parent) { const pc = list.find(x => x.id === body.parent && !x.parent && x.status === 'ok'); if (!pc) return err('التعليق الأصلي غير متاح'); parent = pc.id; }
      const c = { id: rid(6), by: u.name, email: u.email, text, t: Date.now(), status: settings.commentsModeration ? 'pending' : 'ok', reply: null, parent, likes: [], reports: [] };
      if (!parent) {
        const rules = await get(env, 'rules', []);
        const r = rules.find(r => r.on && r.keywords.some(k => k && text.toLowerCase().includes(k.toLowerCase())));
        if (r) { c.reply = { text: r.reply, auto: true, t: Date.now() }; r.hits = (r.hits || 0) + 1; await put(env, 'rules', rules); hit(env, 'autoreplies'); }
      }
      list.push(c); await put(env, key, list.slice(-400)); hit(env, 'comments');
      return J(cview(c, u));
    }
    if ((mm = p.match(/^\/api\/items\/([\w-]+)\/comments\/(\w+)\/(like|report|edit|delete)$/)) && m === 'POST') {
      if (!u) return err('سجّل الدخول أولاً', 401);
      const key = 'comments:' + mm[1]; let list = await get(env, key, []); const c = list.find(x => x.id === mm[2]);
      if (!c || (c.status !== 'ok' && c.email !== u.email && !isStaff(u))) return err('not found', 404);
      c.likes = c.likes || []; c.reports = c.reports || [];
      if (mm[3] === 'like') { if (!await rate(env, u.email, 'clike', 60, 3600)) return err('محاولات كثيرة', 429); const k = c.likes.indexOf(u.email); if (k >= 0) c.likes.splice(k, 1); else c.likes.push(u.email); }
      else if (mm[3] === 'report') {
        if (c.email === u.email) return err('لا يمكنك الإبلاغ عن تعليقك');
        if (!await rate(env, u.email, 'creport', 10, 3600)) return err('محاولات كثيرة', 429);
        if (!c.reports.includes(u.email)) c.reports.push(u.email);
        if (c.reports.length >= 3 && c.status === 'ok') { c.status = 'pending'; c.autoHeld = true; }
      }
      else if (mm[3] === 'edit') {
        if (c.email !== u.email) return err('forbidden', 403);
        if (Date.now() - c.t > 86400000) return err('انتهت مهلة التعديل (24 ساعة)');
        const text = clip(body.text, 600).trim(); if (text.length < 2) return err('اكتب تعليقاً');
        if ((text.match(/https?:\/\//gi) || []).length > 1) return err('الروابط غير مسموحة في التعليقات');
        c.text = text; c.edited = Date.now(); if ((await get(env, 'settings', {})).commentsModeration) c.status = 'pending';
      }
      else if (mm[3] === 'delete') { if (c.email !== u.email && !isStaff(u)) return err('forbidden', 403); list = list.filter(x => x.id !== c.id && x.parent !== c.id); }
      await put(env, key, list); return J({ ok: true, comment: list.includes(c) ? cview(c, u) : null });
    }
    if ((mm = p.match(/^\/api\/items\/([\w-]+)\/rate$/)) && m === 'POST') {
      if (!u) return err('سجّل الدخول للتقييم', 401);
      const stars = Math.round(Number(body.stars)); if (!(stars >= 1 && stars <= 5)) return err('التقييم من 1 إلى 5');
      if (!await rate(env, u.email, 'rate', 40, 3600)) return err('محاولات كثيرة', 429);
      const items = await get(env, 'items', []); const it = items.find(i => i.id === mm[1]); if (!it || !live(it)) return err('not found', 404);
      const rt = await get(env, 'ratings:' + it.id, {}); rt[u.email] = stars; await put(env, 'ratings:' + it.id, rt);
      const v = Object.values(rt); it.rN = v.length; it.rAvg = Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10; await put(env, 'items', items);
      hit(env, 'ratings'); return J({ rAvg: it.rAvg, rN: it.rN, mine: stars });
    }
    if (p === '/api/kids/facts' && m === 'GET') {
      const sp = url.searchParams, lv = Number(sp.get('level')) || 0, tp = sp.get('topic') || '', n = Math.min(24, Math.max(1, Number(sp.get('n')) || 6));
      const ex = new Set((sp.get('ex') || '').split(',').map(Number).filter(Boolean));
      const extra = await get(env, 'kids:extra', []);
      const all = [...KIDS.map(KROW), ...extra.map((r, i) => ({ ...r, id: 1000 + i }))];
      const pool = all.filter(f => (!lv || f.level === lv) && (!tp || f.topic === tp));
      let fresh = pool.filter(f => !ex.has(f.id)); const recycled = fresh.length < n;
      if (recycled) fresh = pool;
      for (let i = fresh.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [fresh[i], fresh[j]] = [fresh[j], fresh[i]]; }
      return J({ facts: fresh.slice(0, n), total: pool.length, all: all.length, recycled });
    }
    if (p === '/api/suggest' && m === 'POST') {
      if (!await rate(env, ip, 'sug', 5, 3600)) return err('محاولات كثيرة', 429);
      const text = clip(body.text, 500).trim(); if (text.length < 4) return err('اكتب اقتراحك');
      const l = await get(env, 'suggestions', []); l.unshift({ id: rid(6), text, by: u ? u.name : 'زائر', t: Date.now() });
      await put(env, 'suggestions', l.slice(0, 200)); hit(env, 'suggestions'); return J({ ok: true });
    }

    if (p === '/api/publish' && m === 'POST') {
      const k = req.headers.get('x-publish-key') || '';
      if (!env.PUBLISH_KEY || k.length < 20 || k !== env.PUBLISH_KEY) { await rate(env, ip, 'pkfail', 20, 3600); return err('forbidden', 403); }
      if (!await rate(env, ip, 'pk', 60, 3600)) return err('محاولات كثيرة', 429);
      return saveItem(env, null, body);
    }

    // ---------- auth ----------
    if (p === '/api/auth/signup' && m === 'POST') {
      const settings = await get(env, 'settings', {});
      if (!settings.allowSignup) return err('التسجيل مغلق', 403);
      if (!await rate(env, ip, 'signup', 6, 3600)) return err('محاولات كثيرة', 429);
      const email = clip(body.email, 120).toLowerCase().trim(); const pw = String(body.password || '');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('بريد غير صالح');
      if (pw.length < 8) return err('كلمة المرور 8 أحرف على الأقل');
      if (await env.KV.get('user:' + email)) return err('البريد مسجّل من قبل', 409);
      const salt = rid(8);
      const user = { email, name: clip(body.name, 40).trim() || email.split('@')[0], role: 'user', plan: 'free', salt, hash: await hash(pw, salt), created: Date.now(), bookmarks: [], done: [] };
      await put(env, 'user:' + email, user);
      const ul = await get(env, 'users', []); ul.push(email); await put(env, 'users', ul);
      hit(env, 'signups');
      const t = rid(24); await put(env, 'sess:' + t, { email }, { expirationTtl: 86400 * 30 });
      return J({ token: t, user: pub(user) });
    }
    if (p === '/api/auth/login' && m === 'POST') {
      if (!await rate(env, ip, 'login', 10)) return err('محاولات كثيرة، حاول بعد 15 دقيقة', 429);
      const email = clip(body.email, 120).toLowerCase().trim();
      const user = await get(env, 'user:' + email, null);
      if (!user || user.banned || (user.delAt && user.delAt <= Date.now()) || user.hash !== await hash(String(body.password || ''), user.salt)) return err('بيانات غير صحيحة', 401);
      const t = rid(24); await put(env, 'sess:' + t, { email }, { expirationTtl: 86400 * 30 });
      return J({ token: t, user: pub(user) });
    }
    if (p === '/api/auth/setup' && m === 'POST') {
      // first admin only, needs the setup key secret
      if (!await rate(env, ip, 'setup', 5, 3600)) return err('محاولات كثيرة', 429);
      const ul = await get(env, 'users', []);
      for (const e of ul) { const x = await get(env, 'user:' + e, null); if (x && x.role === 'admin') return err('الأدمن موجود بالفعل', 403); }
      if (!env.ADMIN_SETUP_KEY || String(body.key || "").trim() !== String(env.ADMIN_SETUP_KEY).trim()) return err('مفتاح غير صحيح', 403);
      const email = clip(body.email, 120).toLowerCase().trim(); const pw = String(body.password || '');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || pw.length < 10) return err('بريد صالح وكلمة مرور 10 أحرف على الأقل');
      const salt = rid(8);
      const user = { email, name: clip(body.name, 40) || 'الأدمن', role: 'admin', plan: 'plus', salt, hash: await hash(pw, salt), created: Date.now(), bookmarks: [], done: [] };
      await put(env, 'user:' + email, user); if (!ul.includes(email)) { ul.push(email); await put(env, 'users', ul); }
      await log(env, email, 'أُنشئ حساب الأدمن');
      const t = rid(24); await put(env, 'sess:' + t, { email }, { expirationTtl: 86400 * 30 });
      return J({ token: t, user: pub(user) });
    }
    if (p === '/api/auth/status' && m === 'GET') {
      const ul = await get(env, 'users', []); let has = false;
      for (const e of ul) { const x = await get(env, 'user:' + e, null); if (x && x.role === 'admin') { has = true; break; } }
      return J({ hasAdmin: has });
    }
    if (p === '/api/me' && m === 'GET') return u ? J(pub(u)) : err('unauth', 401);
    if (p === '/api/me/logout' && m === 'POST') {
      const t = (req.headers.get('authorization') || '').replace('Bearer ', ''); if (t) await env.KV.delete('sess:' + t); return J({ ok: true });
    }
    if (p === '/api/me/bookmark' && m === 'POST') {
      if (!u) return err('unauth', 401); const id = clip(body.id, 60);
      u.bookmarks = u.bookmarks.includes(id) ? u.bookmarks.filter(x => x !== id) : [...u.bookmarks, id].slice(-200);
      await put(env, 'user:' + u.email, u); return J({ bookmarks: u.bookmarks });
    }
    if (p === '/api/me/done' && m === 'POST') {
      if (!u) return err('unauth', 401); const id = clip(body.id, 60);
      u.done = u.done.includes(id) ? u.done.filter(x => x !== id) : [...u.done, id].slice(-500);
      await put(env, 'user:' + u.email, u); return J({ done: u.done });
    }
    if (p === '/api/me/persona' && m === 'POST') {
      if (!u) return err('unauth', 401);
      if (!['explorer', 'analyst', 'storyteller', 'dreamer'].includes(body.type)) return err('نوع غير صالح');
      u.persona = body.type; await put(env, 'user:' + u.email, u); return J(pub(u));
    }
    if (p === '/api/me/delete' && m === 'POST') {
      if (!u) return err('unauth', 401);
      if (u.role === 'admin') return err('حساب الأدمن لا يُحذف من هنا', 403);
      if (!await rate(env, u.email, 'delacc', 5, 3600)) return err('محاولات كثيرة', 429);
      if (u.hash !== await hash(String(body.password || ''), u.salt)) return err('كلمة المرور غير صحيحة', 401);
      if (!u.delAt) { u.delAt = Date.now() + GRACE; await put(env, 'user:' + u.email, u); await log(env, u.email, 'طلب حذف الحساب (مهلة 7 أيام)'); }
      return J(pub(u));
    }
    if (p === '/api/me/restore' && m === 'POST') {
      if (!u) return err('unauth', 401);
      if (u.delAt) { delete u.delAt; await put(env, 'user:' + u.email, u); await log(env, u.email, 'استرجاع الحساب قبل الحذف'); }
      return J(pub(u));
    }
    if (p === '/api/me/profile' && m === 'POST') {
      if (!u) return err('unauth', 401);
      if (body.name) u.name = clip(body.name, 40).trim() || u.name;
      if (body.password) {
        if (String(body.password).length < 8) return err('كلمة المرور 8 أحرف على الأقل');
        u.salt = rid(8); u.hash = await hash(String(body.password), u.salt);
      }
      await put(env, 'user:' + u.email, u); return J(pub(u));
    }

    if ((em = p.match(/^\/api\/oauth\/(youtube|tiktok)\/callback$/)) && m === 'GET') {
      let msg = 'ok';
      try { await IG.oauthCallback(env, url.origin, em[1], url.searchParams); } catch (x) { msg = x.message; }
      return Response.redirect(url.origin + '/#/admin/connect?r=' + encodeURIComponent(em[1] + ':' + msg), 302);
    }

    // ---------- staff ----------
    if (!p.startsWith('/api/admin/')) return err('not found', 404);
    if (!isStaff(u)) return err('forbidden', 403);
    const admin = u.role === 'admin';

    if (p === '/api/admin/kids/facts' && m === 'POST') {
      if (!admin) return err('forbidden', 403);
      const f = { topic: clip(body.topic, 12), level: Math.min(3, Math.max(1, Number(body.level) || 1)), n: clip(body.n, 40), t: clip(body.t, 240), c: clip(body.c, 60), q: clip(body.q, 120), a: clip(body.a, 60), w: [clip(body.w1, 60), clip(body.w2, 60)] };
      if (!['space', 'animal', 'nature', 'body'].includes(f.topic) || !f.n || !f.t || !f.c || !f.q || !f.a || !f.w[0] || !f.w[1]) return err('كل الحقول مطلوبة');
      const l = await get(env, 'kids:extra', []); l.push(f); await put(env, 'kids:extra', l.slice(-300)); return J({ ok: true, count: l.length });
    }
    if (p === '/api/admin/stats') {
      const out = []; const now = Date.now();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
        out.push({ d, ...(await get(env, 'stat:' + d, {})) });
      }
      const items = await get(env, 'items', []); const users = await get(env, 'users', []);
      const pend = []; for (const i of items) { const c = await get(env, 'comments:' + i.id, []); c.filter(x => x.status === 'pending').forEach(x => pend.push(x)); }
      const cats = await get(env, 'cats', []);
      const byCat = cats.map(c => ({ name: c.name, views: items.filter(i => i.cat === c.id).reduce((a, b) => a + b.views, 0), n: items.filter(i => i.cat === c.id).length }));
      return J({
        days: out, totals: { items: items.length, published: items.filter(i => i.status === 'published').length, users: users.length, views: items.reduce((a, b) => a + b.views, 0), likes: items.reduce((a, b) => a + b.likes, 0), pending: pend.length },
        top: [...items].sort((a, b) => b.views - a.views).slice(0, 5).map(slim), byCat, log: await get(env, 'log', []).then(l => l.slice(0, 15)),
      });
    }
    if (p === '/api/admin/items' && m === 'GET') return J((await get(env, 'items', [])).map(slim));
    if (p === '/api/admin/items/bulk' && m === 'POST') {
      const ids = new Set((body.ids || []).map(String).slice(0, 200)), act = String(body.action || ''); if (!ids.size) return err('اختار عنصراً');
      if (!['publish', 'draft', 'feature', 'unfeature'].includes(act)) return err('إجراء غير معروف');
      const items = await get(env, 'items', []); let n = 0;
      for (const i of items) if (ids.has(i.id)) { n++; if (act === 'publish') { i.status = 'published'; i.publishAt = 0; } else if (act === 'draft') i.status = 'draft'; else i.featured = act === 'feature'; }
      await put(env, 'items', items); await log(env, u.email, 'إجراء جماعي على المحتوى: ' + act + ' (' + n + ')'); return J({ ok: true, n });
    }
    if (p === '/api/admin/items' && m === 'POST') {
      return saveItem(env, u, body);
    }
    if (false) {
      const items = await get(env, 'items', []); const cats = await get(env, 'cats', []);
      let id = clip(body.id, 60).replace(/[^\w-]/g, ''); let it = id && items.find(i => i.id === id);
      if (!cats.find(c => c.id === body.cat)) return err('تصنيف غير صالح');
      if (!clip(body.title, 140).trim()) return err('العنوان مطلوب');
      const yt = clip(body.youtube, 40).replace(/[^\w-]/g, '');
      const f = { cat: body.cat, type: ['video', 'article', 'guide', 'checklist'].includes(body.type) ? body.type : 'article', title: clip(body.title, 140), summary: clip(body.summary, 300), body: clip(body.body, 20000), tags: (body.tags || []).slice(0, 8).map(t => clip(t, 24)), status: ['published', 'draft'].includes(body.status) ? body.status : 'draft', featured: !!body.featured, minutes: Math.max(1, Math.min(60, +body.minutes || 3)), youtube: yt, tiktok: clip(body.tiktok, 200), cover: /^(\/[\w\/.-]+|https:\/\/[^\s"'<>]+)$/.test(String(body.cover || '')) ? clip(body.cover, 300) : '' };
      if (it) Object.assign(it, f); else { it = { id: id || rid(5), views: 0, likes: 0, created: Date.now(), ...f }; items.unshift(it); }
      await put(env, 'items', items); await log(env, u.email, 'حفظ محتوى: ' + it.title); return J(it);
    }
    if ((mm = p.match(/^\/api\/admin\/items\/([\w-]+)$/)) && m === 'DELETE') {
      if (!admin) return err('forbidden', 403);
      const items = (await get(env, 'items', [])).filter(i => i.id !== mm[1]); await put(env, 'items', items);
      await env.KV.delete('comments:' + mm[1]); await log(env, u.email, 'حذف محتوى ' + mm[1]); return J({ ok: true });
    }
    if (p === '/api/admin/comments' && m === 'GET') {
      const items = await get(env, 'items', []); const out = [];
      for (const i of items) for (const c of await get(env, 'comments:' + i.id, [])) out.push({ ...c, likes: (c.likes || []).length, reports: (c.reports || []).length, item: i.id, itemTitle: i.title });
      return J(out.sort((a, b) => b.t - a.t).slice(0, 200));
    }
    if (p === '/api/admin/comments' && m === 'POST') {
      const key = 'comments:' + clip(body.item, 60); let list = await get(env, key, []);
      const c = list.find(x => x.id === body.id); if (!c) return err('not found', 404);
      if (body.action === 'approve') c.status = 'ok';
      else if (body.action === 'hide') c.status = 'hidden';
      else if (body.action === 'delete') list = list.filter(x => x.id !== body.id && x.parent !== body.id);
      else if (body.action === 'dismiss') { c.reports = []; c.autoHeld = false; if (c.status === 'pending') c.status = 'ok'; }
      else if (body.action === 'reply') c.reply = { text: clip(body.text, 600), auto: false, t: Date.now() };
      await put(env, key, list); await log(env, u.email, 'تعليق: ' + body.action); return J({ ok: true });
    }
    if (p === '/api/admin/ratings' && m === 'GET') {
      const items = await get(env, 'items', []); const out = [];
      for (const i of items) { const rt = await get(env, 'ratings:' + i.id, {}); const v = Object.values(rt); const dist = [1, 2, 3, 4, 5].map(n => v.filter(x => x === n).length); out.push({ id: i.id, title: i.title, ep: i.ep || 0, n: v.length, avg: v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : 0, dist }); }
      return J(out);
    }
    if (p === '/api/admin/rules' && m === 'GET') return J(await get(env, 'rules', []));
    if (p === '/api/admin/rules' && m === 'POST') {
      const rules = (Array.isArray(body.rules) ? body.rules : []).slice(0, 40).map(r => ({ id: clip(r.id, 20) || rid(4), keywords: (r.keywords || []).map(k => clip(k, 40)).filter(Boolean).slice(0, 12), reply: clip(r.reply, 500), on: !!r.on, hits: +r.hits || 0 }));
      await put(env, 'rules', rules); await log(env, u.email, 'تحديث الردود التلقائية'); return J(rules);
    }
    if (p === '/api/admin/suggestions/bulk' && m === 'POST') {
      const ids = new Set((body.ids || []).map(String).slice(0, 200)), act = String(body.action || ''); let l = await get(env, 'suggestions', []);
      if (!ids.size) return err('اختار اقتراحاً');
      if (act === 'status') { const st = String(body.status || ''); if (!['new', 'plan', 'done', 'no'].includes(st)) return err('حالة غير صحيحة'); l.forEach(x => { if (ids.has(x.id)) x.status = st; }); }
      else if (act === 'star' || act === 'unstar') l.forEach(x => { if (ids.has(x.id)) x.star = act === 'star'; });
      else if (act === 'delete') { if (!admin) return err('forbidden', 403); l = l.filter(x => !ids.has(x.id)); }
      else if (act === 'merge') { const keep = String(body.keep || ''); if (!ids.has(keep) || ids.size < 2) return err('اختار اقتراحين على الأقل'); const k = l.find(x => x.id === keep); k.merged = (k.merged || 0) + ids.size - 1; l = l.filter(x => !ids.has(x.id) || x.id === keep); }
      else return err('إجراء غير معروف');
      await put(env, 'suggestions', l); return J({ ok: true, count: l.length });
    }
    if (p === '/api/admin/suggestions') return J(await get(env, 'suggestions', []));
    if (p === '/api/admin/users' && m === 'GET') {
      const out = []; for (const e of await get(env, 'users', [])) { const x = await get(env, 'user:' + e, null); if (x) out.push({ ...pub(x), banned: !!x.banned }); }
      return J(out);
    }
    if (p === '/api/admin/users' && m === 'POST') {
      if (!admin) return err('forbidden', 403);
      const x = await get(env, 'user:' + clip(body.email, 120), null); if (!x) return err('not found', 404);
      if (x.email === u.email && (body.role || body.banned)) return err('لا يمكنك تعديل نفسك');
      if (['admin', 'editor', 'user'].includes(body.role)) x.role = body.role;
      if (['free', 'plus'].includes(body.plan)) x.plan = body.plan;
      if (typeof body.banned === 'boolean') x.banned = body.banned;
      await put(env, 'user:' + x.email, x); await log(env, u.email, 'تعديل مستخدم ' + x.email); return J({ ok: true });
    }
    if (p === '/api/admin/settings' && m === 'GET') return J({ settings: await get(env, 'settings', {}), cats: await get(env, 'cats', []) });
    if (p === '/api/admin/settings' && m === 'POST') {
      if (!admin) return err('forbidden', 403);
      const s = await get(env, 'settings', {}); const b = body.settings || {};
      for (const k of ['siteName', 'heroTitle', 'heroSub', 'announcement', 'youtube', 'tiktok']) if (typeof b[k] === 'string') s[k] = clip(b[k], 300);
      for (const k of ['showPlans', 'allowSignup', 'commentsOpen', 'commentsModeration']) if (typeof b[k] === 'boolean') s[k] = b[k];
      await put(env, 'settings', s);
      if (Array.isArray(body.cats)) await put(env, 'cats', body.cats.slice(0, 12).map(c => ({ id: clip(c.id, 20).replace(/[^\w-]/g, ''), name: clip(c.name, 30), color: /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : '#2457D6', icon: clip(c.icon, 4) })).filter(c => c.id && c.name));
      await log(env, u.email, 'تحديث إعدادات الموقع'); return J({ ok: true });
    }
    if (p === '/api/admin/integrations' && m === 'GET') {
      return J({ ...(await IG.status(env, url.origin)), queue: await get(env, 'queue', []) });
    }
    if (p.startsWith('/api/admin/oauth/') || p.startsWith('/api/admin/yt/') || p.startsWith('/api/admin/tt/') || p === '/api/admin/intcfg' || p.startsWith('/api/admin/ai/')) {
      if (!admin) return err('للأدمن فقط', 403);
      try {
        if (p === '/api/admin/oauth/start' && m === 'POST') return J({ url: await IG.oauthStart(env, url.origin, body.provider === 'tiktok' ? 'tiktok' : 'youtube') });
        if (p === '/api/admin/oauth/disconnect' && m === 'POST') { await IG.disconnect(env, body.provider); await log(env, u.email, 'فصل ' + body.provider); return J({ ok: true }); }
        if (p === '/api/admin/intcfg' && m === 'POST') { await put(env, 'intcfg', { ytAuto: !!body.ytAuto }); await log(env, u.email, 'الرد التلقائي على يوتيوب: ' + (body.ytAuto ? 'تشغيل' : 'إيقاف')); return J({ ok: true }); }
        if (p === '/api/admin/ai/cfg' && m === 'POST') { const sp = body.scope === 'tt' ? 'tt:' : ''; const c = await IG.aiCfg(env, sp); delete c.sp; const b = body || {}; if (b.provider !== undefined) c.provider = IG.AI_PROVIDERS[b.provider] ? b.provider : ''; c.model = ''; if (b.models && typeof b.models === 'object') { c.models = { ...(c.models || {}) }; for (const k of Object.keys(IG.AI_PROVIDERS)) if (typeof b.models[k] === 'string') c.models[k] = clip(b.models[k], 80).replace(/[^\w.\-:\/]/g, ''); } if (['off', 'review', 'auto'].includes(b.mode)) c.mode = b.mode; if (b.auto && typeof b.auto === 'object') { const n = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Math.round(+v) || d)); c.auto = { interval: n(b.auto.interval, 1, 1440, 5), delay: n(b.auto.delay ?? 2, 0, 1440, 0), perRun: n(b.auto.perRun, 1, 10, 3), dailyCap: n(b.auto.dailyCap, 1, 200, 30), maxAgeH: n(b.auto.maxAgeH, 1, 720, 24), quiet: !!b.auto.quiet, qFrom: n(b.auto.qFrom, 0, 23, 0), qTo: n(b.auto.qTo, 0, 23, 7) }; if (b.auto.delay === 0 || b.auto.delay === '0') c.auto.delay = 0; } if (typeof b.tone === 'string') c.tone = clip(b.tone, 800); if (b.maxLen) c.maxLen = Math.min(500, Math.max(60, +b.maxLen || 280)); if (typeof b.signature === 'string') c.signature = clip(b.signature, 60); await put(env, sp ? 'aicfg:tt' : 'aicfg', c); await log(env, u.email, 'إعدادات الذكاء الاصطناعي: ' + (c.provider || '-') + ' / ' + c.mode); return J(c); }
        if (p === '/api/admin/ai/key' && m === 'POST') { try { if (body.remove) { await IG.aiKeyRemove(env, body.provider, body.scope === 'tt' ? 'tt:' : ''); await log(env, u.email, 'حذف مفتاح الذكاء الاصطناعي: ' + body.provider); } else { await IG.aiKeySave(env, body.provider, body.key, body.scope === 'tt' ? 'tt:' : ''); await log(env, u.email, 'حفظ مفتاح الذكاء الاصطناعي: ' + body.provider); } } catch (e) { return err(e.message, 400); } return J({ ok: true, keys: await IG.aiKeyMeta(env, body.scope === 'tt' ? 'tt:' : '') }); }
        if (p === '/api/admin/ai/test' && m === 'POST') { if (!IG.AI_PROVIDERS[body.provider]) return err('مزوّد غير معروف', 400); const md = typeof body.model === 'string' ? clip(body.model, 80).replace(/[^\w.\-:\/]/g, '') : ''; try { return J(await IG.aiTest(env, body.provider, md, body.scope === 'tt' ? 'tt:' : '')); } catch (e) { return J({ ok: false, error: String(e.message).slice(0, 240) }); } }
        if (p === '/api/admin/ai/models' && m === 'POST') { if (!IG.AI_PROVIDERS[body.provider]) return err('مزوّد غير معروف', 400); return J(await IG.aiModels(env, body.provider, body.scope === 'tt' ? 'tt:' : '')); }
        if (p === '/api/admin/ai/draft' && m === 'POST') { const c = await IG.aiCfg(env, body.scope === 'tt' ? 'tt:' : ''); if (IG.AI_PROVIDERS[body.provider]) c.provider = body.provider; if (typeof body.model === 'string' && body.model) c.model = clip(body.model, 80).replace(/[^\w.\-:\/]/g, ''); if (typeof body.tone === 'string' && body.tone) c.tone = clip(body.tone, 800); return J(await IG.aiReply(env, c, { comment: clip(body.comment, 600), video: clip(body.video, 120), by: clip(body.by, 40) })); }
        if (p === '/api/admin/yt/analytics') return J(await IG.ytAnalytics(env, Number(url.searchParams.get('days')) || 28));
        if (p === '/api/admin/tt/ai' && m === 'POST') { if (!['caption', 'ideas', 'insights'].includes(body.kind)) return err('نوع غير معروف', 400); const r = await IG.ttAi(env, body.kind, body.input); return J({ text: r.text }); }
        if (p === '/api/admin/yt/overview') return J(await IG.ytOverview(env));
        if (p === '/api/admin/yt/deep') return J(await IG.ytDeep(env, Math.min(90, Math.max(7, Number(url.searchParams.get('days')) || 28))));
        if (p === '/api/admin/yt/comments') return J({ items: await IG.ytComments(env) });
        if (p === '/api/admin/yt/reply' && m === 'POST') { const r = await IG.ytReply(env, clip(body.id, 80), body.text, body.mode === 'ai-review' ? 'ai-review' : 'manual', { by: clip(body.by, 40), video: clip(body.video, 100), text: clip(body.ctext, 200) }); await log(env, u.email, 'ردّ على تعليق يوتيوب'); return J(r); }
        if (p === '/api/admin/yt/replylog') return J({ items: await IG.replyLog(env) });
        if (p === '/api/admin/tt/overview') return J(await IG.ttOverview(env));
        if (p === '/api/admin/yt/sync' && m === 'POST') { const rules = await get(env, 'rules', []); const r = await IG.ytSync(env, rules, { dry: !!body.dry }); if (!body.dry) await put(env, 'rules', rules); return J(r); }
        if (p === '/api/admin/yt/upload' && m === 'POST') { const r = await IG.ytUpload(env, body); await log(env, u.email, 'رفع فيديو يوتيوب ' + r.id); return J(r); }
        if (p === '/api/admin/tt/upload' && m === 'POST') { const r = await IG.ttUpload(env, body); await log(env, u.email, 'رفع فيديو تيك توك'); return J(r); }
      } catch (x) { return err(x.message, 502); }
    }
    if (p === '/api/admin/queue' && m === 'POST') {
      let q = await get(env, 'queue', []);
      if (body.action === 'delete') { q = q.filter(x => x.id !== body.id); await put(env, 'queue', q); return J({ ok: true }); }
      if (body.action === 'run') return J({ ok: true, ...(await IG.qRunDue(env)) });
      if (body.action === 'now' || body.action === 'retry') { const it = q.find(x => x.id === body.id); if (!it) return err('غير موجود', 404); if (it.locked && Date.now() - it.locked < 20 * 60 * 1000) return err('قيد النشر الآن', 409); if (body.action === 'retry') { for (const k of it.targets) if (it.results?.[k]?.state === 'err') delete it.results[k]; } it.at = it.at && it.at > Date.now() && body.action === 'now' ? Date.now() : it.at; await put(env, 'queue', q); ctx.waitUntil(IG.qPublish(env, it.id)); await log(env, u.email, 'نشر من القائمة: ' + clip(it.title, 40)); return J({ ok: true }); }
      const targets = (Array.isArray(body.targets) ? body.targets : []).filter(t => ['youtube', 'tiktok'].includes(t));
      if (!clip(body.title, 140).trim()) return err('اكتب العنوان', 400); if (!targets.length) return err('اختر منصة واحدة على الأقل', 400);
      if (!/^https:\/\/[^\s]+$/.test(String(body.videoUrl || ''))) return err('رابط الفيديو لازم يبدأ بـ https', 400);
      const at = body.at ? +body.at : 0; if (body.at && !(at > 0)) return err('وقت غير صحيح', 400);
      q.unshift({ id: rid(5), title: clip(body.title, 100), caption: clip(body.caption, 2000), videoUrl: String(body.videoUrl).slice(0, 600), privacy: ['private', 'unlisted', 'public'].includes(body.privacy) ? body.privacy : 'private', ttMode: body.ttMode === 'direct' ? 'direct' : 'draft', targets, at, results: {}, status: at > Date.now() ? 'scheduled' : 'ready', t: Date.now() });
      await put(env, 'queue', q.slice(0, 100)); await log(env, u.email, 'إضافة لقائمة النشر'); return J({ ok: true, id: q[0].id });
    }
    return err('not found', 404);
  },
  async scheduled(ev, env) {
    // cron fires every minute; each job decides by the minute counter, so quiet minutes cost only a few KV reads
    const mn = Math.floor(Date.now() / 60000);
    try { await IG.qRunDue(env); } catch (e) { }
    try { await IG.ytAiAuto(env); } catch (e) { }
    if (mn % 60 === 7) { try { await purgeDue(env); } catch (e) { } }
    if (mn % 15 !== 0) return;
    const cfg = await get(env, 'intcfg', { ytAuto: false }); if (!cfg.ytAuto) return;
    try { const rules = await get(env, 'rules', []); const r = await IG.ytSync(env, rules); if (r.replied) await put(env, 'rules', rules); } catch (e) { const t = await get(env, 'oauth', {}); if (t.youtube) { t.youtube.err = e.message; await put(env, 'oauth', t); } }
  },
};
