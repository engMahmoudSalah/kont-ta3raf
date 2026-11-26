// YouTube + TikTok integrations: OAuth, token storage, upload / comments / analytics.
// Secrets come from Worker secrets: YT_CLIENT_ID, YT_CLIENT_SECRET, TT_CLIENT_KEY, TT_CLIENT_SECRET.
const get = async (env, k, d) => (await env.KV.get(k, 'json')) ?? d;
const put = (env, k, v, o) => env.KV.put(k, JSON.stringify(v), o);
const rid = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
export const YT_SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/yt-analytics.readonly', 'https://www.googleapis.com/auth/youtube.readonly'];
export const TT_SCOPES = ['user.info.basic', 'video.upload', 'video.publish'];
const form = o => new URLSearchParams(o).toString();
const redirectUri = (origin, prov) => `${origin}/api/oauth/${prov}/callback`;

export function configured(env) {
  return { youtube: !!(env.YT_CLIENT_ID && env.YT_CLIENT_SECRET), tiktok: !!(env.TT_CLIENT_KEY && env.TT_CLIENT_SECRET) };
}
export async function status(env, origin) {
  const t = await get(env, 'oauth', {}); const cfg = await get(env, 'intcfg', { ytAuto: false });
  return {
    redirects: { youtube: redirectUri(origin, 'youtube'), tiktok: redirectUri(origin, 'tiktok') },
    configured: configured(env), cfg,
    youtube: { connected: !!t.youtube?.refresh, channel: t.youtube?.channel || '', since: t.youtube?.t || 0, lastSync: t.youtube?.lastSync || 0, lastError: t.youtube?.err || '' },
    tiktok: { connected: !!t.tiktok?.access, name: t.tiktok?.name || '', since: t.tiktok?.t || 0, exp: t.tiktok?.refreshExp || 0 },
  };
}

export async function oauthStart(env, origin, prov) {
  const c = configured(env); if (!c[prov]) throw new Error('مفاتيح ' + (prov === 'youtube' ? 'يوتيوب' : 'تيك توك') + ' لم تُضَف بعد');
  const state = rid(); await env.KV.put('oauthstate:' + state, prov, { expirationTtl: 600 });
  if (prov === 'youtube') return 'https://accounts.google.com/o/oauth2/v2/auth?' + form({ client_id: env.YT_CLIENT_ID, redirect_uri: redirectUri(origin, prov), response_type: 'code', scope: YT_SCOPES.join(' '), access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state });
  return 'https://www.tiktok.com/v2/auth/authorize/?' + form({ client_key: env.TT_CLIENT_KEY, scope: TT_SCOPES.join(','), response_type: 'code', redirect_uri: redirectUri(origin, prov), state });
}

export async function oauthCallback(env, origin, prov, q) {
  const st = await env.KV.get('oauthstate:' + (q.get('state') || '')); await env.KV.delete('oauthstate:' + (q.get('state') || ''));
  if (st !== prov) throw new Error('الجلسة انتهت أو غير صالحة، ابدأ الربط من جديد');
  if (q.get('error')) throw new Error('تم إلغاء الربط: ' + q.get('error'));
  const code = q.get('code'); if (!code) throw new Error('لا يوجد كود');
  const t = await get(env, 'oauth', {});
  if (prov === 'youtube') {
    const r = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form({ code, client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, redirect_uri: redirectUri(origin, prov), grant_type: 'authorization_code' }) })).json();
    if (!r.access_token) throw new Error('رفض جوجل الكود: ' + (r.error_description || r.error || ''));
    if (!r.refresh_token && !t.youtube?.refresh) throw new Error('لم يصل refresh token. افصل التطبيق من حساب جوجل وأعد الربط');
    const ch = await (await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { authorization: 'Bearer ' + r.access_token } })).json();
    const c0 = ch.items?.[0]; if (!c0) throw new Error('هذا الحساب ليس عليه قناة يوتيوب');
    t.youtube = { refresh: r.refresh_token || t.youtube.refresh, access: r.access_token, exp: Date.now() + (r.expires_in - 60) * 1000, channelId: c0.id, channel: c0.snippet.title, scope: r.scope, t: Date.now() };
  } else {
    const r = await (await fetch('https://open.tiktokapis.com/v2/oauth/token/', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form({ client_key: env.TT_CLIENT_KEY, client_secret: env.TT_CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri: redirectUri(origin, prov) }) })).json();
    if (!r.access_token) throw new Error('رفض تيك توك الكود: ' + (r.error_description || r.error || ''));
    const me = await (await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', { headers: { authorization: 'Bearer ' + r.access_token } })).json();
    t.tiktok = { access: r.access_token, refresh: r.refresh_token, exp: Date.now() + (r.expires_in - 60) * 1000, refreshExp: Date.now() + (r.refresh_expires_in || 0) * 1000, openId: r.open_id, name: me.data?.user?.display_name || '', scope: r.scope, t: Date.now() };
  }
  await put(env, 'oauth', t);
}
export async function disconnect(env, prov) { const t = await get(env, 'oauth', {}); delete t[prov]; await put(env, 'oauth', t); }

async function ytToken(env) {
  const t = await get(env, 'oauth', {}); const y = t.youtube; if (!y) throw new Error('يوتيوب غير مربوط');
  if (y.access && y.exp > Date.now()) return { tok: y.access, y };
  const r = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form({ client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: y.refresh, grant_type: 'refresh_token' }) })).json();
  if (!r.access_token) { y.err = 'انتهى التصريح، أعد الربط (' + (r.error || '') + ')'; await put(env, 'oauth', t); throw new Error(y.err); }
  y.access = r.access_token; y.exp = Date.now() + (r.expires_in - 60) * 1000; y.err = ''; await put(env, 'oauth', t);
  return { tok: y.access, y };
}
async function ttToken(env) {
  const t = await get(env, 'oauth', {}); const y = t.tiktok; if (!y) throw new Error('تيك توك غير مربوط');
  if (y.exp > Date.now()) return y.access;
  const r = await (await fetch('https://open.tiktokapis.com/v2/oauth/token/', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form({ client_key: env.TT_CLIENT_KEY, client_secret: env.TT_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: y.refresh }) })).json();
  if (!r.access_token) throw new Error('انتهى تصريح تيك توك، أعد الربط');
  Object.assign(y, { access: r.access_token, refresh: r.refresh_token || y.refresh, exp: Date.now() + (r.expires_in - 60) * 1000 }); await put(env, 'oauth', t);
  return y.access;
}
const yApi = async (env, path, opt = {}) => {
  const { tok } = await ytToken(env);
  const r = await fetch(path.startsWith('http') ? path : 'https://www.googleapis.com/youtube/v3/' + path, { ...opt, headers: { authorization: 'Bearer ' + tok, ...(opt.json ? { 'content-type': 'application/json' } : {}), ...(opt.headers || {}) }, body: opt.json ? JSON.stringify(opt.json) : opt.body });
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error('YouTube: ' + (d.error?.message || r.status)); return d;
};

// ---- analytics ----
export async function ytAnalytics(env, days = 28) {
  const { y } = await ytToken(env); const end = new Date().toISOString().slice(0, 10), start = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const ch = await yApi(env, 'channels?part=statistics&mine=true');
  const rep = await yApi(env, 'https://youtubeanalytics.googleapis.com/v2/reports?' + form({ ids: 'channel==MINE', startDate: start, endDate: end, metrics: 'views,estimatedMinutesWatched,likes,comments,subscribersGained', dimensions: 'day', sort: 'day' }));
  return { channel: y.channel, stats: ch.items?.[0]?.statistics || {}, columns: (rep.columnHeaders || []).map(c => c.name), rows: rep.rows || [] };
}

// ---- comments + auto replies ----
export async function ytSync(env, rules, { dry = false } = {}) {
  const t = await get(env, 'oauth', {}); const y = t.youtube; if (!y) throw new Error('يوتيوب غير مربوط');
  const d = await yApi(env, 'commentThreads?' + form({ part: 'snippet', allThreadsRelatedToChannelId: y.channelId, maxResults: 50, order: 'time', textFormat: 'plainText' }));
  const seen = new Set(await get(env, 'yt:seen', [])); const out = []; let replied = 0;
  for (const th of d.items || []) {
    const s = th.snippet, c = s.topLevelComment.snippet; if (seen.has(th.id) || s.totalReplyCount > 0 || c.authorChannelId?.value === y.channelId) continue;
    const r = rules.find(r => r.on && r.keywords.some(k => k && c.textDisplay.toLowerCase().includes(k.toLowerCase())));
    const row = { id: th.id, video: s.videoId, by: c.authorDisplayName, text: c.textDisplay.slice(0, 200), rule: r?.id || null, replied: false };
    if (r && !dry) { await yApi(env, 'comments?part=snippet', { method: 'POST', json: { snippet: { parentId: th.id, textOriginal: r.reply } } }); r.hits = (r.hits || 0) + 1; replied++; row.replied = true; seen.add(th.id); }
    else if (!r) seen.add(th.id);
    out.push(row);
  }
  if (!dry) { await put(env, 'yt:seen', [...seen].slice(-600)); t.youtube.lastSync = Date.now(); await put(env, 'oauth', t); }
  return { checked: (d.items || []).length, replied, rows: out.slice(0, 30), rules };
}

// ---- upload ----
export async function ytUpload(env, { videoUrl, title, description, privacy = 'private', publishAt, tags = [] }) {
  if (!/^https:\/\//.test(videoUrl || '')) throw new Error('رابط الفيديو لازم يبدأ بـ https');
  const src = await fetch(videoUrl); if (!src.ok || !src.body) throw new Error('تعذّر تحميل الفيديو من الرابط');
  const len = src.headers.get('content-length'); if (!len) throw new Error('الرابط لا يعطي حجم الملف');
  const status = { privacyStatus: publishAt ? 'private' : privacy, selfDeclaredMadeForKids: false }; if (publishAt) status.publishAt = new Date(publishAt).toISOString();
  const { tok } = await ytToken(env);
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json', 'x-upload-content-length': len, 'x-upload-content-type': src.headers.get('content-type') || 'video/mp4' }, body: JSON.stringify({ snippet: { title: String(title).slice(0, 100), description: String(description || '').slice(0, 4900), tags }, status }) });
  const loc = init.headers.get('location'); if (!loc) throw new Error('YouTube: ' + ((await init.json().catch(() => ({}))).error?.message || init.status));
  const up = await fetch(loc, { method: 'PUT', headers: { 'content-length': len }, body: src.body });
  const d = await up.json().catch(() => ({})); if (!up.ok) throw new Error('YouTube: ' + (d.error?.message || up.status));
  return { id: d.id, url: 'https://youtu.be/' + d.id };
}
export async function ttUpload(env, { videoUrl, title, mode = 'draft', privacy = 'SELF_ONLY' }) {
  if (!/^https:\/\//.test(videoUrl || '')) throw new Error('رابط الفيديو لازم يبدأ بـ https');
  const tok = await ttToken(env); const draft = mode !== 'direct';
  const r = await (await fetch('https://open.tiktokapis.com/v2/post/publish/' + (draft ? 'inbox/video/init/' : 'video/init/'), { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ ...(draft ? {} : { post_info: { title: String(title).slice(0, 2000), privacy_level: privacy } }), source_info: { source: 'PULL_FROM_URL', video_url: videoUrl } }) })).json();
  if (r.error?.code && r.error.code !== 'ok') throw new Error('TikTok: ' + (r.error.message || r.error.code));
  return { publishId: r.data?.publish_id, mode: draft ? 'draft' : 'direct' };
}
