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
