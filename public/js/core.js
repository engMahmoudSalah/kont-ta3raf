// core: state, api client, helpers
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

