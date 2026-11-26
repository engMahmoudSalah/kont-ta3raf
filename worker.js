import * as IG from './integrations.js';
import { CATS, ITEMS, RULES, SETTINGS } from './seed.js';

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

async function get(env, k, d) { const v = await env.KV.get(k, 'json'); return v ?? d; }
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
  s[key] = (s[key] || 0) + n; await put(env, k, s, { expirationTtl: 86400 * 120 });
}
async function log(env, who, what) {
  const l = await get(env, 'log', []); l.unshift({ t: Date.now(), who, what: clip(what, 200) });
  await put(env, 'log', l.slice(0, 100));
}
async function me(req, env) {
  const t = (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!t) return null;
  const s = await get(env, 'sess:' + t, null); if (!s) return null;
  const u = await get(env, 'user:' + s.email, null); if (!u || u.banned) return null;
  return u;
}
const pub = u => u && ({ email: u.email, name: u.name, role: u.role, plan: u.plan, created: u.created, bookmarks: u.bookmarks, done: u.done, persona: u.persona || '' });
const isStaff = u => u && (u.role === 'admin' || u.role === 'editor');
const live = (i, n = Date.now()) => i.status === 'published' && (!i.publishAt || i.publishAt <= n);
const slim = i => { const { body, ...r } = i; return r; };

async function rate(env, ip, name, max, ttl = 900) {
  const k = `rl:${name}:${ip}`; const n = Number(await env.KV.get(k) || 0);
  if (n >= max) return false; await env.KV.put(k, String(n + 1), { expirationTtl: ttl }); return true;
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
  async fetch(req, env) {
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
        it.views++; await put(env, 'items', items); hit(env, 'views'); hit(env, 'v:' + it.id);
      }
      const comments = (await get(env, 'comments:' + it.id, [])).filter(c => c.status === 'ok' || isStaff(u));
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
      if (!await rate(env, u.email, 'cm', 8, 3600)) return err('محاولات كثيرة، حاول لاحقاً', 429);
      const text = clip(body.text, 600).trim(); if (text.length < 2) return err('اكتب تعليقاً');
      const key = 'comments:' + mm[1]; const list = await get(env, key, []);
      const c = { id: rid(6), by: u.name, email: u.email, text, t: Date.now(), status: settings.commentsModeration ? 'pending' : 'ok', reply: null };
      const rules = await get(env, 'rules', []);
      const r = rules.find(r => r.on && r.keywords.some(k => k && text.toLowerCase().includes(k.toLowerCase())));
      if (r) { c.reply = { text: r.reply, auto: true, t: Date.now() }; r.hits = (r.hits || 0) + 1; await put(env, 'rules', rules); hit(env, 'autoreplies'); }
      list.push(c); await put(env, key, list.slice(-200)); hit(env, 'comments');
      return J(c);
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
      if (!user || user.banned || user.hash !== await hash(String(body.password || ''), user.salt)) return err('بيانات غير صحيحة', 401);
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
      for (const i of items) for (const c of await get(env, 'comments:' + i.id, [])) out.push({ ...c, item: i.id, itemTitle: i.title });
      return J(out.sort((a, b) => b.t - a.t).slice(0, 200));
    }
    if (p === '/api/admin/comments' && m === 'POST') {
      const key = 'comments:' + clip(body.item, 60); let list = await get(env, key, []);
      const c = list.find(x => x.id === body.id); if (!c) return err('not found', 404);
      if (body.action === 'approve') c.status = 'ok';
      else if (body.action === 'hide') c.status = 'hidden';
      else if (body.action === 'delete') list = list.filter(x => x.id !== body.id);
      else if (body.action === 'reply') c.reply = { text: clip(body.text, 600), auto: false, t: Date.now() };
      await put(env, key, list); await log(env, u.email, 'تعليق: ' + body.action); return J({ ok: true });
    }
    if (p === '/api/admin/rules' && m === 'GET') return J(await get(env, 'rules', []));
    if (p === '/api/admin/rules' && m === 'POST') {
      const rules = (Array.isArray(body.rules) ? body.rules : []).slice(0, 40).map(r => ({ id: clip(r.id, 20) || rid(4), keywords: (r.keywords || []).map(k => clip(k, 40)).filter(Boolean).slice(0, 12), reply: clip(r.reply, 500), on: !!r.on, hits: +r.hits || 0 }));
      await put(env, 'rules', rules); await log(env, u.email, 'تحديث الردود التلقائية'); return J(rules);
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
    if (p.startsWith('/api/admin/oauth/') || p.startsWith('/api/admin/yt/') || p.startsWith('/api/admin/tt/') || p === '/api/admin/intcfg') {
      if (!admin) return err('للأدمن فقط', 403);
      try {
        if (p === '/api/admin/oauth/start' && m === 'POST') return J({ url: await IG.oauthStart(env, url.origin, body.provider === 'tiktok' ? 'tiktok' : 'youtube') });
        if (p === '/api/admin/oauth/disconnect' && m === 'POST') { await IG.disconnect(env, body.provider); await log(env, u.email, 'فصل ' + body.provider); return J({ ok: true }); }
        if (p === '/api/admin/intcfg' && m === 'POST') { await put(env, 'intcfg', { ytAuto: !!body.ytAuto }); await log(env, u.email, 'الرد التلقائي على يوتيوب: ' + (body.ytAuto ? 'تشغيل' : 'إيقاف')); return J({ ok: true }); }
        if (p === '/api/admin/yt/analytics') return J(await IG.ytAnalytics(env, Number(url.searchParams.get('days')) || 28));
        if (p === '/api/admin/yt/sync' && m === 'POST') { const rules = await get(env, 'rules', []); const r = await IG.ytSync(env, rules, { dry: !!body.dry }); if (!body.dry) await put(env, 'rules', rules); return J(r); }
        if (p === '/api/admin/yt/upload' && m === 'POST') { const r = await IG.ytUpload(env, body); await log(env, u.email, 'رفع فيديو يوتيوب ' + r.id); return J(r); }
        if (p === '/api/admin/tt/upload' && m === 'POST') { const r = await IG.ttUpload(env, body); await log(env, u.email, 'رفع فيديو تيك توك'); return J(r); }
      } catch (x) { return err(x.message, 502); }
    }
    if (p === '/api/admin/queue' && m === 'POST') {
      const q = await get(env, 'queue', []);
      if (body.action === 'delete') { await put(env, 'queue', q.filter(x => x.id !== body.id)); return J({ ok: true }); }
      q.unshift({ id: rid(5), title: clip(body.title, 140), caption: clip(body.caption, 600), targets: (body.targets || []).filter(t => ['youtube', 'tiktok'].includes(t)), when: clip(body.when, 30), status: 'جاهز للنشر عند ربط الحساب', t: Date.now() });
      await put(env, 'queue', q.slice(0, 100)); await log(env, u.email, 'إضافة لقائمة النشر'); return J({ ok: true });
    }
    return err('not found', 404);
  },
  async scheduled(ev, env) {
    const cfg = await get(env, 'intcfg', { ytAuto: false }); if (!cfg.ytAuto) return;
    try { const rules = await get(env, 'rules', []); const r = await IG.ytSync(env, rules); if (r.replied) await put(env, 'rules', rules); } catch (e) { const t = await get(env, 'oauth', {}); if (t.youtube) { t.youtube.err = e.message; await put(env, 'oauth', t); } }
  },
};
