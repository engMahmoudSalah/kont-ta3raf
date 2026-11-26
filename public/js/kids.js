// kids corner: no accounts, no comments, no outside links. Facts and questions come from /api/kids/facts.
const KT = [['', 'الكل'], ['space', 'فضاء'], ['animal', 'حيوانات'], ['nature', 'طبيعة'], ['body', 'جسمي']];
const KL = [[1, 'سهل'], [2, 'متوسط'], [3, 'صعب']];
const KG = [['mix', 'مزيج متغيّر'], ['mc', 'اختار الصح'], ['tf', 'صح ولا غلط'], ['mt', 'وصّل'], ['sp', 'سريع 30 ثانية']];
const KB = [[10, 'فضولي'], [30, 'مستكشف'], [70, 'عالِم صغير'], [150, 'بطل المعرفة']];
const KC = { space: '#B9AEC4', animal: '#FADA80', nature: '#9DC4D5', body: '#F4B59B' };
const kLoad = () => { try { return JSON.parse(localStorage.getItem('kt_kids2') || '{}'); } catch (e) { return {}; } };
const kSave = o => { try { localStorage.setItem('kt_kids2', JSON.stringify(o)); } catch (e) { } };
const kShuf = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const kFetch = async (level, n, ex, topic) => (await api(`/kids/facts?level=${level}&n=${n}&topic=${topic || ''}&ex=${(ex || []).slice(-60).join(',')}`));
function pKids() {
  const st = kLoad(); st.read = st.read || []; st.seen = st.seen || []; st.stars = st.stars || 0; st.best = st.best || {}; st.lvl = st.lvl || 1; st.rounds = st.rounds || 0;
  let tab = 'know', tp = '', game = 'mix', last = '', tm = null, ver = 0, total = 0, batch = [];
  const lv = () => KL.find(x => x[0] === st.lvl)[1];
  const stop = () => { clearInterval(tm); tm = null; ver++; };
  const head = () => { const b = KB.filter(x => st.stars >= x[0]).pop(); return `<div class="kgp"><div><b>${st.read.length}</b> معلومة قرأتها${total ? ' من ' + total + ' في هذا المستوى' : ''}<i><u style="width:${total ? Math.min(100, Math.round(st.read.length / Math.max(total, st.read.length) * 100)) : 0}%"></u></i></div><div class="kgb"><b>${st.stars}</b> نجمة${b ? ' · ' + b[1] : ''}</div></div>`; };
  const lvbar = () => `<div class="klv" role="group" aria-label="المستوى">${KL.map(([n, t]) => `<button data-l="${n}" aria-pressed="${st.lvl === n}">${t}</button>`).join('')}</div>`;
  const view = () => {
    stop();
    shell(`<div class="wrap"><section class="s kids"><div class="say" style="max-width:520px;margin-bottom:14px">${mascot()}<span>أهلاً يا بطل! اضغط على أي كارت وشوف معلومة، وبعدين العب معايا.</span></div><h1 class="h2">ركن الصغار</h1><div id="kh">${head()}</div>
    <div class="kbar2"><div class="ktabs" role="tablist">${[['know', 'اعرف'], ['play', 'العب'], ['me', 'نجومي']].map(([k, n]) => `<button role="tab" aria-selected="${tab === k}" data-k="${k}">${n}</button>`).join('')}</div>${tab !== 'me' ? lvbar() : ''}</div>
    <div class="kbody" id="kb"></div></section></div>`, '/kids');
    document.querySelector('.ktabs').onclick = e => { const b = e.target.closest('[data-k]'); if (b && b.dataset.k !== tab) { tab = b.dataset.k; view(); } };
    const lb = document.querySelector('.klv'); if (lb) lb.onclick = e => { const b = e.target.closest('[data-l]'); if (b) { st.lvl = Number(b.dataset.l); kSave(st); batch = []; view(); } };
    ({ know, play, me })[tab]();
  };
  const hd = () => { const h = document.getElementById('kh'); if (h) h.innerHTML = head(); };
  const kb = () => document.getElementById('kb');
  const loading = () => { kb().innerHTML = '<div class="kload">جارٍ تجهيز معلومات جديدة...</div>'; };
  const fail = f => { kb().innerHTML = `<div class="box kq"><p>الاتصال ضعيف دلوقتي. جرّب تاني.</p><button class="btn red" id="kre">إعادة المحاولة</button></div>`; document.getElementById('kre').onclick = f; };
  // ---------- know ----------
  async function know(more) {
    const v = ++ver; loading();
    try {
      const r = await kFetch(st.lvl, 6, more ? st.seen : [], tp); if (v !== ver) return;
      total = r.total; batch = r.facts; batch.forEach(f => { if (!st.seen.includes(f.id)) st.seen.push(f.id); }); st.seen = st.seen.slice(-120); kSave(st); hd();
      kb().innerHTML = `<div class="bar strip kt" id="kt" role="group" aria-label="الموضوع">${KT.map(([k, n]) => `<span class="chip${tp === k ? ' on' : ''}" role="button" tabindex="0" aria-pressed="${tp === k}" data-t="${k}">${n}</span>`).join('')}<span class="chip kr" role="button" tabindex="0" id="krn">هات معلومات جديدة</span></div>
      <div class="kf">${batch.map(f => `<button class="kc${st.read.includes(f.id) ? ' rd' : ''}" style="background:${KC[f.topic] || '#FADA80'}" data-i="${f.id}" aria-expanded="false" aria-label="${esc(f.n)}"><b>${esc(f.n)}</b><span>${esc(f.t)}</span></button>`).join('')}</div>${r.recycled ? '<p class="kn">شفت كل معلومات المستوى ده، دي معلومات بتتكرر. جرّب مستوى تاني أو موضوع تاني.</p>' : ''}`;
      const kt = document.getElementById('kt');
      kt.onclick = e => { if (e.target.closest('#krn')) return know(true); const c = e.target.closest('[data-t]'); if (c) { tp = c.dataset.t; know(); } };
      kt.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } };
      document.querySelector('.kf').onclick = e => {
        const b = e.target.closest('.kc'); if (!b) return; const o = b.classList.toggle('open'); b.setAttribute('aria-expanded', o);
        const i = Number(b.dataset.i); if (o && !st.read.includes(i)) { st.read.push(i); kSave(st); b.classList.add('rd'); hd(); }
      };
    } catch (e) { if (v === ver) fail(() => know(more)); }
  }
  // ---------- play ----------
  function play() {
    kb().innerHTML = `<div class="bar strip kt" id="kg" role="group" aria-label="نوع اللعبة">${KG.map(([k, n]) => `<span class="chip${game === k ? ' on' : ''}" role="button" tabindex="0" aria-pressed="${game === k}" data-g="${k}">${n}</span>`).join('')}</div><div class="box kq" id="kq"><h2>جاهز؟</h2><p>المستوى: <b>${lv()}</b>. كل نجمة بتتحسب ×${st.lvl}.</p><button class="btn red" id="kgo">ابدأ اللعب</button></div>`;
    const g = document.getElementById('kg'); g.onclick = e => { const c = e.target.closest('[data-g]'); if (c) { game = c.dataset.g; play(); } }; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } };
    document.getElementById('kgo').onclick = () => round();
  }
  async function round() {
    stop(); const v = ver; let ty = game; if (ty === 'mix') { const o = ['mc', 'tf', 'mt', 'sp'].filter(x => x !== last); ty = o[Math.floor(Math.random() * o.length)]; } last = ty;
    const q = document.getElementById('kq'); q.innerHTML = '<div class="kload">جارٍ تجهيز الأسئلة...</div>';
    try {
      const r = await kFetch(st.lvl, ty === 'sp' ? 14 : ty === 'mt' ? 4 : 5, st.seen, ''); if (v !== ver) return;
      r.facts.forEach(f => { if (!st.seen.includes(f.id)) st.seen.push(f.id); }); st.seen = st.seen.slice(-120);
      ({ mc, tf, mt, sp })[ty](r.facts, q, v);
    } catch (e) { if (v === ver) q.innerHTML = '<p>الاتصال ضعيف. </p><button class="btn red" id="kre">إعادة المحاولة</button>', document.getElementById('kre').onclick = round; }
  }
  const gname = t => KG.find(x => x[0] === t)[1];
  function done(stars, max, q) {
    const earn = stars * st.lvl; st.stars += earn; st.rounds++; const key = last + st.lvl; st.best[key] = Math.max(st.best[key] || 0, stars); kSave(st); hd();
    if (stars) addXp(Math.min(15, earn * 2), 'kids:' + dayKey() + ':' + st.rounds);
    q.innerHTML = `<h2>${stars === max ? 'ممتاز! ولا غلطة' : stars ? 'برافو!' : 'حاول تاني، هتعملها'}</h2><div class="stars">${'★'.repeat(Math.min(stars, 10))}${'☆'.repeat(Math.max(0, Math.min(max - stars, 10)))}</div><p>${gname(last)}: ${stars} من ${max}${st.lvl > 1 ? ` · كسبت ${earn} نجمة (×${st.lvl})` : ''}</p><div class="bar" style="justify-content:center"><button class="btn red" id="kn">جولة جديدة${game === 'mix' ? ' (لعبة مختلفة)' : ''}</button><button class="btn w" id="kc2">غيّر اللعبة</button></div>`;
    document.getElementById('kn').onclick = round; document.getElementById('kc2').onclick = play;
  }
  const dots = (n, i) => `<div class="dots">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div>`;
  function mc(fs, q, v) {
    let i = 0, s = 0;
    const nx = () => {
      if (i >= fs.length) return done(s, fs.length, q); const f = fs[i], os = kShuf([f.a, ...f.w]);
      q.innerHTML = `${dots(fs.length, i)}<small>${gname('mc')} · سؤال ${i + 1} من ${fs.length}</small><h2>${esc(f.q)}</h2><div class="ka">${os.map(o => `<button class="btn w" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><p class="kv" aria-live="polite"></p>`;
      q.querySelector('.ka').onclick = e => { const b = e.target.closest('[data-o]'); if (!b) return; const ok = b.dataset.o === f.a; if (ok) s++; q.querySelectorAll('.ka button').forEach(x => { x.disabled = true; if (x.dataset.o === f.a) x.style.background = '#bfe8bf'; }); if (!ok) b.style.background = '#f7c3b0'; q.querySelector('.kv').textContent = (ok ? 'صح! ' : 'مش بالظبط. ') + f.t; setTimeout(() => { if (v === ver) { i++; nx(); } }, 1900); };
    }; nx();
  }
  function tf(fs, q, v) {
    let i = 0, s = 0; const qs = fs.map(f => { const t = Math.random() < .5; return { f, x: t ? f.a : kShuf(f.w)[0], t }; });
    const nx = () => {
      if (i >= qs.length) return done(s, qs.length, q); const { f, x, t } = qs[i];
      q.innerHTML = `${dots(qs.length, i)}<small>${gname('tf')} · ${i + 1} من ${qs.length}</small><h2>${esc(f.q)}</h2><p class="kans">الإجابة: <b>${esc(x)}</b></p><div class="ka two"><button class="btn w" data-a="1">صح</button><button class="btn w" data-a="0">غلط</button></div><p class="kv" aria-live="polite"></p>`;
      q.querySelector('.ka').onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const ok = (b.dataset.a === '1') === t; if (ok) s++; q.querySelectorAll('.ka button').forEach(x => x.disabled = true); b.style.background = ok ? '#bfe8bf' : '#f7c3b0'; q.querySelector('.kv').textContent = (ok ? 'صح! ' : 'مش بالظبط. ') + f.t; setTimeout(() => { if (v === ver) { i++; nx(); } }, 1900); };
    }; nx();
  }
  function mt(fs, q, v) {
    let sel = null, ok = 0, bad = 0, first = new Set(); const names = kShuf(fs), clues = kShuf(fs);
    q.innerHTML = `<small>${gname('mt')}: اختار الاسم وبعدين اللي يناسبه</small><div class="mtg"><div id="mn">${names.map(f => `<button class="btn w" data-i="${f.id}">${esc(f.n)}</button>`).join('')}</div><div id="mc">${clues.map(f => `<button class="btn w" data-i="${f.id}">${esc(f.c)}</button>`).join('')}</div></div><p class="kv" aria-live="polite"></p>`;
    q.onclick = e => {
      const b = e.target.closest('.mtg button'); if (!b || b.disabled) return; const isN = b.parentElement.id === 'mn';
      if (isN) { q.querySelectorAll('#mn button').forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
      if (!sel) { q.querySelector('.kv').textContent = 'اختار الاسم الأول'; return; }
      if (sel.dataset.i === b.dataset.i) { if (!bad || !first.has('x' + b.dataset.i)) { } ok++; if (!first.has(b.dataset.i)) first.add('ok' + b.dataset.i); sel.disabled = b.disabled = true; sel.classList.remove('sel'); sel.style.background = b.style.background = '#bfe8bf'; sel = null; q.querySelector('.kv').textContent = ''; if (ok === fs.length) { const stars = Math.max(0, fs.length - bad); setTimeout(() => { q.onclick = null; if (v === ver) done(stars, fs.length, q); }, 900); } }
      else { bad++; first.add('x' + sel.dataset.i); b.style.background = '#f7c3b0'; setTimeout(() => { b.style.background = ''; }, 500); q.querySelector('.kv').textContent = 'جرّب تاني'; }
    };
  }
  function sp(fs, q, v) {
    let left = 30, s = 0, n = 0, pool = fs.slice(), cur = null;
    const nx = () => { if (!pool.length) return end(); const f = pool.pop(), t = Math.random() < .5; cur = { f, x: t ? f.a : kShuf(f.w)[0], t }; q.querySelector('.sq').innerHTML = `<h2>${esc(f.q)}</h2><p class="kans"><b>${esc(cur.x)}</b></p>`; };
    const end = () => { clearInterval(tm); if (v === ver) done(s, Math.max(n, s), q); };
    q.innerHTML = `<small>${gname('sp')}: جاوب بأسرع ما تقدر</small><div class="tmb"><i id="tmi"></i></div><b id="tmn">30</b><div class="sq"></div><div class="ka two"><button class="btn w" data-a="1">صح</button><button class="btn w" data-a="0">غلط</button></div>`;
    q.querySelector('.ka').onclick = e => { const b = e.target.closest('[data-a]'); if (!b || !cur) return; n++; if ((b.dataset.a === '1') === cur.t) s++; nx(); };
    tm = setInterval(() => { left--; document.getElementById('tmn').textContent = left; document.getElementById('tmi').style.width = (left / 30 * 100) + '%'; if (left <= 0) end(); }, 1000); document.getElementById('tmi').style.width = '100%'; nx();
  }
  // ---------- me ----------
  function me() {
    const nb = KB.find(x => st.stars < x[0]);
    kb().innerHTML = `<div class="kme"><div class="box"><b>نجومك</b><div class="big">${st.stars}</div><small>${nb ? `باقي ${nb[0] - st.stars} نجمة على «${nb[1]}»` : 'وصلت لأعلى لقب!'}</small><i class="pgi"><u style="width:${nb ? Math.round(st.stars / nb[0] * 100) : 100}%"></u></i></div>
    <div class="box"><b>ألقابك</b><div class="bdg">${KB.map(([n, t]) => `<span class="${st.stars >= n ? 'on' : ''}">${t}<small>${n} نجمة</small></span>`).join('')}</div></div>
    <div class="box"><b>أفضل نتائجك</b><ul class="bst">${KL.map(([l, n]) => `<li><span>${n}</span>${KG.filter(g => g[0] !== 'mix').map(g => `<em>${g[1]}: ${st.best[g[0] + l] || 0}</em>`).join('')}</li>`).join('')}</ul></div>
    <div class="box"><b>معلوماتك</b><p>قرأت <b>${st.read.length}</b> معلومة، ولعبت <b>${st.rounds}</b> جولة.</p></div></div>`;
  }
  view();
}
