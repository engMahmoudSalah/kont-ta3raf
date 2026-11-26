// kids corner: no accounts, no comments, no outside links. Big buttons, short Arabic.
const KFACTS = [
  ['الشمس', 'الشمس نجمة، مش كوكب! وهي أكبر من الأرض بمليون مرة.', '#F0B400'],
  ['الفيل', 'الفيل يستعمل خرطومه للشرب والتنفس والسلام على أصحابه.', '#9DC4D5'],
  ['القمر', 'القمر بيبعد عننا قدر ما نسافر بالسيارة 160 يوم.', '#B9AEC4'],
  ['النحلة', 'النحلة تزور آلاف الأزهار عشان تعمل معلقة عسل واحدة.', '#FADA80'],
  ['الحوت', 'الحوت الأزرق أكبر حيوان عاش على الأرض، وقلبه بحجم سيارة صغيرة.', '#2E6FBE'],
  ['الغيمة', 'الغيمة مكوّنة من نقط ماء صغيرة جداً بتطفو في السما.', '#9DC4D5'],
];
const KQ = [
  ['إيه اللي بيدّينا ضوء النهار؟', ['الشمس', 'القمر', 'الغيمة'], 0],
  ['أي حيوان عنده خرطوم؟', ['الأسد', 'الفيل', 'القطة'], 1],
  ['السما بتبقى زرقا بالنهار. صح ولا لأ؟', ['صح', 'لأ'], 0],
  ['مين بيعمل العسل؟', ['النحلة', 'الفراشة', 'الذبابة'], 0],
  ['بنشوف الأرض من الفضاء بلون:', ['أصفر', 'أزرق وأخضر', 'أحمر'], 1],
];
function pKids() {
  let q = 0, stars = 0;
  const facts = `<div class="kf">${KFACTS.map(([n, t, c], i) => `<button class="kc" style="background:${c};color:${c === '#2E6FBE' ? '#fff' : 'var(--ink)'}" data-i="${i}" aria-label="${n}"><b>${n}</b><span>${t}</span></button>`).join('')}</div>`;
  const draw = () => {
    const quiz = q >= KQ.length
      ? `<div class="box kq"><h2>برافو! جمعت ${stars} من ${KQ.length} نجوم</h2><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(KQ.length - stars)}</div><button class="btn red" id="kr">نلعب تاني</button></div>`
      : `<div class="box kq"><small>سؤال ${q + 1} من ${KQ.length}</small><h2>${KQ[q][0]}</h2><div class="ka">${KQ[q][1].map((a, i) => `<button class="btn w" data-a="${i}">${a}</button>`).join('')}</div><p id="kv" style="min-height:2em;font-weight:900"></p></div>`;
    shell(`<div class="wrap"><section class="s kids"><div class="say" style="max-width:520px;margin-bottom:18px">${mascot()}<span>أهلاً يا بطل! اضغط على أي كارت وشوف معلومة، وبعدين العب معايا.</span></div><h1 class="h2">ركن الصغار</h1>${facts}<h2 class="h2" style="margin-top:30px">العب واجمع نجوم</h2>${quiz}</section></div>`, '/kids');
    document.querySelector('.kf').onclick = e => { const b = e.target.closest('.kc'); if (b) b.classList.toggle('open'); };
    const ka = document.querySelector('.ka'); if (ka) ka.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return; const ok = Number(b.dataset.a) === KQ[q][2];
      if (ok) stars++; document.querySelectorAll('.ka button').forEach(x => x.disabled = true); b.style.background = ok ? '#bfe8bf' : '#f7c3b0';
      document.getElementById('kv').textContent = ok ? 'صح! ✓' : 'مش بالظبط، جرّب السؤال اللي بعده'; setTimeout(() => { q++; draw(); }, 1100);
    };
    const kr = document.getElementById('kr'); if (kr) kr.onclick = () => { q = 0; stars = 0; addXp(15, 'kids:' + dayKey()); draw(); };
  };
  draw();
}
