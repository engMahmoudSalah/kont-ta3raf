// ui: shared components (mascot, cards, markdown, page shell)
function mascot(cls = '') {
  return `<svg class="mascot ${cls}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#181818"/><g class="eyes"><circle cx="33.2" cy="45" r="14.4" fill="#FBFBF9"/><circle cx="66.8" cy="45" r="14.4" fill="#FBFBF9"/><circle cx="31" cy="45" r="5.3" fill="#181818"/><circle cx="65" cy="45" r="5.3" fill="#181818"/></g><path d="M23 27l20-2.4M57 24.6l20 2.4" stroke="#EF642D" stroke-width="3.4"/><path d="M41.5 67q8.5 8 17 0" fill="none" stroke="#FBFBF9" stroke-width="2.8" stroke-linecap="round"/></svg>`;
}
const cloud = cls => `<svg class="${cls}" viewBox="0 0 120 80" aria-hidden="true"><path d="M22 66q-16-2-14-18 2-14 18-14 6-22 32-20 20 2 22 20 22-2 24 18 0 14-18 14z" fill="#FBFBF9" stroke="#181818" stroke-width="5" stroke-linejoin="round"/></svg>`;
function art() {
  const rays = [0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => `<line x1="50" y1="6" x2="50" y2="18" stroke="#F0B400" stroke-width="7" stroke-linecap="round" transform="rotate(${a} 50 50)"/>`).join('');
  return `<div class="hero-art">${cloud('c1')}${cloud('c2')}
  <svg class="sunb" viewBox="0 0 100 100" aria-hidden="true">${rays}<circle cx="50" cy="50" r="24" fill="#F0B400" stroke="#181818" stroke-width="5"/></svg>
  ${mascot('big')}
  <svg class="bang" viewBox="0 0 40 100" aria-hidden="true"><rect x="5" y="3" width="30" height="58" rx="10" fill="#EF642D" stroke="#181818" stroke-width="4"/><circle cx="20" cy="82" r="14" fill="#EF642D" stroke="#181818" stroke-width="4"/></svg></div>`;
}
const emptyBox = t => `<div class="empty">${mascot()}${t}</div>`;
const ICONS = {
  science: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/>',
  nature: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-4 6-6 9-8"/>',
  history: '<path d="M3 20h18M12 4 4 20M12 4l8 16M8 13h8"/>',
  tech: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  space: '<circle cx="12" cy="12" r="5"/><path d="M2 15c4 3 14-1 20-6M4 9C8 6 17 8 21 15" opacity=".0"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)"/>',
  faith: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 4v3M15.5 5.5h3"/>',
  stories: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 8h6M9 12h6"/>',
  weird: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/><path d="M10 9.5a2 2 0 1 1 2.5 2 1 1 0 0 0-.5 1"/>',
  money: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9c-.5-1-1.5-1.5-2.500-1.500-1.500 0-2.500.8-2.500 2s1 1.700 2.500 2 2.500.8 2.500 2-1 2-2.500 2c-1.200 0-2.200-.6-2.700-1.600M12 6v1.500M12 16.500V18"/>',
  experiences: '<path d="M12 3l2.500 5.500L20 9.200l-4 4 1 5.800-5-2.800-5 2.800 1-5.800-4-4 5.500-.7z"/>',
  body: '<path d="M12 21C5 15 3 11 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 13z"/>',
};
const cicon = (id, sz = 28) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="#181818" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id] || '<circle cx="12" cy="12" r="8"/>'}</svg>`;
function card(i) {
  const c = catOf(i.cat);
  return `<a class="card" href="#/item/${esc(i.id)}">${i.cover ? `<div class="th cov"><em>${esc(c.name)}</em><img src="${esc(i.cover)}" alt="${esc(i.title)}" loading="lazy"></div>` : `<div class="th" style="background:${c.color}"><em>${esc(c.name)}</em>${mascot()}</div>`}
  <div class="bd"><div class="meta">${i.ep ? `<span class="pill y">حلقة ${i.ep}</span>` : ''}${i.publishAt > Date.now() ? '<span class="pill r">مجدول</span>' : ''}<span>${TICON[i.type] || ''} ${TYPES[i.type] || ''}</span><span>${i.minutes} د</span><span>👁 ${fmt(i.views)}</span></div>
  <h3>${esc(i.title)}</h3><p>${esc(i.summary)}</p></div></a>`;
}
function md(t) {
  const out = []; let ul = false;
  for (const raw of String(t).split('\n')) {
    const l = raw.trim();
    if (l.startsWith('- ')) { if (!ul) { out.push('<ul>'); ul = true; } out.push(`<li><span>${esc(l.slice(2))}</span></li>`); continue; }
    if (ul) { out.push('</ul>'); ul = false; }
    if (l.startsWith('## ')) out.push(`<h2>${esc(l.slice(3))}</h2>`); else if (l) out.push(`<p>${esc(l)}</p>`);
  }
  if (ul) out.push('</ul>'); return out.join('');
}
function shell(inner, route, o = {}) {
  const s = S.home.settings; const u = S.user;
  const link = (h, t) => `<a href="#${h}" class="${route === h ? 'on' : ''}" ${route === h ? 'aria-current="page"' : ''}>${t}</a>`;
  $('#app').innerHTML = `${s.announcement ? `<div class="ann" role="note">${esc(s.announcement)}</div>` : ''}
  <a class="skip" href="#main" onclick="event.preventDefault();document.getElementById('main').focus()">تخطّي إلى المحتوى</a><header class="top"><div class="wrap"><a class="logo" href="#/">${mascot()}${esc(s.siteName)}</a>
  <button class="burger" aria-label="القائمة" aria-expanded="false" onclick="const n=document.querySelector('nav.m');this.setAttribute('aria-expanded',n.classList.toggle('open'))"><span></span></button>
  <nav class="m" onclick="this.classList.remove('open')">${link('/', 'الرئيسية')}${link('/episodes', 'الحلقات')}${link('/explore', 'استكشف')}${s.showPlans ? link('/plans', 'الخطط') : ''}${link('/suggest', 'اقترح موضوعاً')}
  ${u ? `${u.role !== 'user' ? link('/admin', 'لوحة التحكم') : ''}${link('/account', 'حسابي')}` : `${link('/login', 'دخول')}<a class="btn sm" href="#/signup">انضم مجاناً</a>`}</nav></div></header>
  <main id="main" class="${o.admin ? 'is-admin' : ''}">${inner}</main>
  <footer><div class="wrap"><div><b style="font-size:20px">${esc(s.siteName)}</b><br>معلومة قصيرة كل يوم، مصنّفة ومراجعة.</div>
  <div>${s.youtube ? `<a href="${esc(s.youtube)}" target="_blank" rel="noopener">يوتيوب</a> · ` : ''}${s.tiktok ? `<a href="${esc(s.tiktok)}" target="_blank" rel="noopener">تيك توك</a>` : ''}<br><a href="#/suggest">اقترح موضوعاً</a></div></div></footer>`;
  if (!o.keepScroll) scrollTo(0, 0);
}

