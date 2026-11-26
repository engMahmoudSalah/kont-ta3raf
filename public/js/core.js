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
const gi = d => `<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const GI = { eye: gi('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'), heart: gi('<path d="M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z"/>'), check: gi('<path d="M4 12l5 5L20 6"/>') };
const TICON = { video: gi('<path d="M7 4l13 8-13 8z"/>'), article: gi('<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>'), guide: gi('<circle cx="12" cy="12" r="9"/><path d="M15.500 8.500l-2 5-5 2 2-5z"/>'), checklist: gi('<path d="M4 6l2 2 3-3M4 14l2 2 3-3M12 7h8M12 15h8"/>') };
const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
const catOf = id => (S.home.cats.find(c => c.id === id) || { name: '', color: '#1B1B1F', icon: '✦' });
const date = t => new Date(t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });


const PERSONAS = {
  explorer: { name: 'المستكشف', color: '#2E6FBE', cats: ['space', 'nature', 'science', 'body'], line: 'تحب تفتح الباب وتشوف اللي وراه. جهّزنا لك مغامرات من الفضاء والطبيعة.' },
  analyst: { name: 'المحلل', color: '#EF642D', cats: ['tech', 'money', 'science', 'weird'], line: 'تحب تفهم إزاي الأشياء تشتغل وليه. جهّزنا لك تفكيك التقنية والأرقام.' },
  storyteller: { name: 'الحكّاء', color: '#F0B400', cats: ['history', 'stories', 'faith', 'experiences'], line: 'تحب الحكاية اللي وراها معنى. جهّزنا لك قصص وتاريخ وتجارب.' },
  dreamer: { name: 'الحالم', color: '#463C50', cats: ['weird', 'space', 'stories', 'nature'], line: 'خيالك أوسع من الواقع. جهّزنا لك الأفكار الغريبة والعوالم البعيدة.' },
};
const QUIZ = [
  ['لقيت كتاب غريب في مكتبة قديمة، تعمل إيه؟', [['explorer', 'أفتحه فوراً وأشوف فيه إيه'], ['analyst', 'أدوّر على مين كتبه وليه'], ['storyteller', 'أتخيل حكاية صاحبه'], ['dreamer', 'أحلم إنه خريطة لعالم تاني']]],
  ['وقت فاضي نص ساعة، تفضّل:', [['explorer', 'فيديو عن مكان جديد'], ['analyst', 'مقال يشرح حاجة بالتفصيل'], ['storyteller', 'قصة أو تجربة حقيقية'], ['dreamer', 'سؤال غريب أفكر فيه']]],
  ['أكتر جملة تشبهك:', [['explorer', 'خلّيني أجرب بنفسي'], ['analyst', 'وريني الدليل'], ['storyteller', 'احكيلي الحكاية'], ['dreamer', 'وليه لأ؟']]],
  ['لو بتتعلم حاجة جديدة، تحب تبدأ بـ:', [['explorer', 'صورة كبيرة وأمثلة'], ['analyst', 'قائمة خطوات واضحة'], ['storyteller', 'مثال من حياة ناس'], ['dreamer', 'فكرة مجنونة تفتح الدماغ']]],
];
const persona = () => (S.user && S.user.persona) || localStorage.kt_persona || '';
