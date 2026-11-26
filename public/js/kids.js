// kids corner: no accounts, no comments, no outside links. Big buttons, short Arabic.
const KT = [['', 'الكل'], ['space', 'فضاء'], ['animal', 'حيوانات'], ['nature', 'طبيعة'], ['body', 'جسمي']];
const KFACTS = [
  ['space', 'الشمس', 'الشمس نجمة، مش كوكب! وهي أكبر من الأرض بمليون مرة.', '#F0B400'],
  ['animal', 'الفيل', 'الفيل يستعمل خرطومه للشرب والتنفس والسلام على أصحابه.', '#9DC4D5'],
  ['space', 'القمر', 'القمر بيبعد عننا قدر ما نسافر بالسيارة 160 يوم.', '#B9AEC4'],
  ['animal', 'النحلة', 'النحلة تزور آلاف الأزهار عشان تعمل معلقة عسل واحدة.', '#FADA80'],
  ['animal', 'الحوت', 'الحوت الأزرق أكبر حيوان عاش على الأرض، وقلبه بحجم سيارة صغيرة.', '#2E6FBE'],
  ['nature', 'الغيمة', 'الغيمة مكوّنة من نقط ماء صغيرة جداً بتطفو في السما.', '#9DC4D5'],
  ['body', 'القلب', 'قلبك بيدق حوالي مئة ألف مرة كل يوم، وهو شغال وأنت نايم.', '#EF642D'],
  ['nature', 'قوس قزح', 'قوس قزح بيظهر لما الشمس تنور على نقط المطر، وفيه 7 ألوان.', '#FADA80'],
  ['animal', 'الأخطبوط', 'الأخطبوط عنده 3 قلوب، ودمه لونه أزرق.', '#B9AEC4'],
  ['body', 'العظام', 'جسمك فيه أكتر من 200 عظمة، والبيبي بيتولد بحوالي 300.', '#9DC4D5'],
  ['space', 'زحل', 'زحل له حلقات جميلة من الثلج والصخور، وخفيف لدرجة إنه كان يطفو على الماء.', '#F0B400'],
  ['nature', 'الشجرة', 'الشجرة بتاخد غاز من الهوا وبتديك الأكسجين اللي بتتنفسه.', '#FADA80'],
];
const KQ = [
  ['إيه اللي بيدّينا ضوء النهار؟', ['الشمس', 'القمر', 'الغيمة'], 0, 'الشمس نجمة كبيرة بتدّينا الضوء والدفا.'],
  ['أي حيوان عنده خرطوم؟', ['الأسد', 'الفيل', 'القطة'], 1, 'الفيل بيستعمل خرطومه في حاجات كتير.'],
  ['السما بتبقى زرقا بالنهار. صح ولا لأ؟', ['صح', 'لأ'], 0, 'ضوء الشمس بيتفرّق في الجو فنشوف الأزرق.'],
  ['مين بيعمل العسل؟', ['النحلة', 'الفراشة', 'الذبابة'], 0, 'النحل بيجمع رحيق الأزهار ويحوّله لعسل.'],
  ['بنشوف الأرض من الفضاء بلون:', ['أصفر', 'أزرق وأخضر', 'أحمر'], 1, 'الأزرق للمية والأخضر للأرض.'],
  ['كام لون في قوس قزح؟', ['3', '7', '12'], 1, 'سبعة ألوان، من الأحمر للبنفسجي.'],
  ['أكبر حيوان في الدنيا؟', ['الفيل', 'الزرافة', 'الحوت الأزرق'], 2, 'الحوت الأزرق أكبر من أي ديناصور.'],
  ['الشجرة بتديك إيه؟', ['أكسجين', 'سكر', 'صوت'], 0, 'الشجر بيعمل الأكسجين اللي بنتنفسه.'],
  ['كام قلب عند الأخطبوط؟', ['1', '3', '8'], 1, 'ثلاثة قلوب! ودمه أزرق.'],
  ['الشمس هي:', ['كوكب', 'نجمة', 'قمر'], 1, 'نجمة، بس قريبة مننا فبتبان كبيرة.'],
];
const kLoad = () => { try { return JSON.parse(localStorage.getItem('kt_kids') || '{}'); } catch (e) { return {}; } };
const kSave = o => { try { localStorage.setItem('kt_kids', JSON.stringify(o)); } catch (e) { } };
function pKids() {
  const st = kLoad(); st.read = st.read || []; st.best = st.best || 0;
  let tab = 'know', tp = '', q = 0, stars = 0, round = [];
  const newRound = () => { round = KQ.map((x, i) => i).sort(() => Math.random() - .5).slice(0, 5); q = 0; stars = 0; };
  newRound();
  const prog = () => { const p = Math.round(st.read.length / KFACTS.length * 100); return `<div class="kp"><div><b>${st.read.length}</b> من ${KFACTS.length} معلومة قرأتها<i><u style="width:${p}%"></u></i></div><div class="kb"><b>${st.best}</b> أحسن نتيجة</div></div>`; };
  const know = () => {
    const list = KFACTS.map((f, i) => ({ f, i })).filter(x => !tp || x.f[0] === tp);
    return `<div class="bar strip kt" id="kt" role="group" aria-label="الموضوع">${KT.map(([k, n]) => `<span class="chip${tp === k ? ' on' : ''}" role="button" tabindex="0" aria-pressed="${tp === k}" data-t="${k}">${n}</span>`).join('')}<span class="chip kr" role="button" tabindex="0" id="krn">معلومة عشوائية</span></div>
    <div class="kf">${list.map(({ f: [t, n, x, c], i }) => `<button class="kc${st.read.includes(i) ? ' rd' : ''}" style="background:${c};color:${c === '#2E6FBE' ? '#fff' : 'var(--ink)'}" data-i="${i}" aria-expanded="false" aria-label="${n}"><b>${n}</b><span>${x}</span></button>`).join('')}</div>`;
  };
  const play = () => {
    if (q >= round.length) { return `<div class="box kq"><h2>برافو! جمعت ${stars} من ${round.length} نجوم</h2><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(round.length - stars)}</div><p>${stars === round.length ? 'ممتاز، ولا غلطة!' : 'حلو! جرّب تاني وهتجيب أكتر.'}</p><button class="btn red" id="kr">نلعب تاني</button></div>`; }
    const k = KQ[round[q]];
    return `<div class="box kq"><div class="dots">${round.map((_, i) => `<i class="${i < q ? 'on' : i === q ? 'cur' : ''}"></i>`).join('')}</div><small>سؤال ${q + 1} من ${round.length}</small><h2>${k[0]}</h2><div class="ka">${k[1].map((a, i) => `<button class="btn w" data-a="${i}">${a}</button>`).join('')}</div><p id="kv" style="min-height:2.6em;font-weight:900" aria-live="polite"></p></div>`;
  };
  const draw = () => {
    shell(`<div class="wrap"><section class="s kids"><div class="say" style="max-width:520px;margin-bottom:14px">${mascot()}<span>أهلاً يا بطل! اضغط على أي كارت وشوف معلومة، وبعدين العب معايا.</span></div><h1 class="h2">ركن الصغار</h1>${prog()}
    <div class="ktabs" role="tablist"><button role="tab" aria-selected="${tab === 'know'}" data-k="know">اعرف</button><button role="tab" aria-selected="${tab === 'play'}" data-k="play">العب واجمع نجوم</button></div>
    <div class="kbody">${tab === 'know' ? know() : play()}</div></section></div>`, '/kids');
    document.querySelector('.ktabs').onclick = e => { const b = e.target.closest('[data-k]'); if (b && b.dataset.k !== tab) { tab = b.dataset.k; draw(); } };
    const kt = document.getElementById('kt');
    if (kt) {
      const pick = e => { const c = e.target.closest('[data-t]'); if (c) { tp = c.dataset.t; draw(); } };
      kt.onclick = e => {
        if (e.target.closest('#krn')) { const l = KFACTS.map((f, i) => i).filter(i => !tp || KFACTS[i][0] === tp); const i = l[Math.floor(Math.random() * l.length)]; const b = document.querySelector(`.kc[data-i="${i}"]`); if (b && !b.classList.contains('open')) b.click(); if (b) b.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
        pick(e);
      };
      kt.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } };
    }
    const kf = document.querySelector('.kf');
    if (kf) kf.onclick = e => {
      const b = e.target.closest('.kc'); if (!b) return; const o = b.classList.toggle('open'); b.setAttribute('aria-expanded', o);
      const i = Number(b.dataset.i); if (o && !st.read.includes(i)) { st.read.push(i); kSave(st); b.classList.add('rd'); const p = document.querySelector('.kp'); if (p) p.outerHTML = prog(); if (st.read.length === KFACTS.length) { addXp(10, 'kids-read:' + dayKey()); toast('قرأت كل المعلومات، برافو!'); } }
    };
    const ka = document.querySelector('.ka'); if (ka) ka.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return; const k = KQ[round[q]], ok = Number(b.dataset.a) === k[2];
      if (ok) stars++; const bs = [...document.querySelectorAll('.ka button')]; bs.forEach(x => x.disabled = true);
      bs[k[2]].style.background = '#bfe8bf'; if (!ok) b.style.background = '#f7c3b0';
      document.getElementById('kv').textContent = (ok ? 'صح! ' : 'مش بالظبط. ') + k[3];
      setTimeout(() => { q++; if (q >= round.length && stars > st.best) { st.best = stars; kSave(st); } draw(); }, 1700);
    };
    const kr = document.getElementById('kr'); if (kr) kr.onclick = () => { addXp(15, 'kids:' + dayKey()); newRound(); draw(); };
  };
  draw();
}
