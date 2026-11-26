// play: curiosity meter + daily "صدّق أو لا" game (client-side, saved on device)
const FACTS = [
  ['العسل لا يفسد أبداً إذا حُفظ جيداً.', 1, 'وُجد عسل صالح للأكل في مقابر عمرها آلاف السنين.'],
  ['الأخطبوط له قلب واحد.', 0, 'له ثلاثة قلوب: اثنان للخياشيم وواحد للجسم.'],
  ['الصوت ينتقل في الفضاء الخارجي.', 0, 'لا يوجد هواء ينقل الاهتزازات، فالفضاء صامت.'],
  ['الموز مشعّ إشعاعاً خفيفاً جداً.', 1, 'بسبب البوتاسيوم، لكنه آمن تماماً.'],
  ['السور العظيم في الصين يُرى بالعين المجردة من القمر.', 0, 'هذه خرافة شائعة، فهو رفيع جداً من تلك المسافة.'],
  ['جسم الإنسان فيه عظام أكثر عند الولادة منه عند البالغ.', 1, 'نحو 300 عظمة عند المولود، تلتحم لتصير 206.'],
  ['البرق أسخن من سطح الشمس.', 1, 'قد يصل إلى نحو خمسة أضعاف حرارة سطح الشمس.'],
  ['الأسماك الذهبية ذاكرتها ثلاث ثوانٍ فقط.', 0, 'تتذكر لأشهر وتتعلم مواعيد الطعام.'],
  ['يوم على كوكب الزهرة أطول من سنته.', 1, 'يدور حول نفسه أبطأ مما يدور حول الشمس.'],
  ['النمل لا ينام أبداً.', 0, 'ينام فترات قصيرة متقطعة خلال اليوم.'],
  ['الماء الساخن قد يتجمد أسرع من البارد في ظروف معينة.', 1, 'تُسمى ظاهرة مبيمبا، ولا يزال تفسيرها محل نقاش.'],
  ['لسان الزرافة أزرق مائل للأسود.', 1, 'ربما يحميه من حروق الشمس وهي تأكل.'],
  ['القلب البشري يتوقف عن النبض أثناء العطس.', 0, 'خرافة شائعة، فالقلب يستمر في النبض.'],
  ['الدلافين تنام وجزء من دماغها يبقى مستيقظاً.', 1, 'ينام نصف الدماغ في كل مرة لتظل تتنفس.'],
  ['الحيتان الزرقاء أكبر حيوان عاش على الأرض.', 1, 'يصل طولها إلى نحو 30 متراً.'],
  ['الذهب يصدأ مثل الحديد.', 0, 'الذهب لا يتأكسد بسهولة، ولهذا يبقى لامعاً.'],
  ['المريخ يبدو أحمر بسبب أكسيد الحديد في تربته.', 1, 'أي الصدأ، وهو يغطي سطحه.'],
  ['الإنسان يستخدم 10% فقط من دماغه.', 0, 'خرافة، فنستخدم أجزاء الدماغ كلها على مدار اليوم.'],
  ['الأرض أقرب إلى الشمس في الشتاء بنصف الكرة الشمالي.', 1, 'تكون الأرض في أقرب نقطة في أوائل يناير تقريباً.'],
  ['الفراشة تتذوق بقدميها.', 1, 'عندها مستقبلات طعم في أرجلها.'],
  ['الماس مصنوع من الكربون.', 1, 'نفس عنصر الفحم، لكن بترتيب ذرات مختلف.'],
  ['الشمس كوكب.', 0, 'الشمس نجم، وهي مصدر الضوء والحرارة لنظامنا.'],
  ['الأخطبوط يغيّر لون جلده ليختبئ.', 1, 'يستخدم خلايا خاصة في الجلد للتمويه.'],
  ['القمر يبتعد عن الأرض قليلاً كل سنة.', 1, 'نحو 3.8 سنتيمتر في السنة.'],
  ['الطماطم نوع من الخضار بالتصنيف النباتي.', 0, 'نباتياً هي ثمرة، وإن كنا نستخدمها كخضار.'],
  ['الإنسان يتنفس بالرئتين فقط.', 0, 'الجلد أيضاً يتبادل كمية صغيرة جداً من الغازات.'],
  ['الجمل يخزّن الماء في سنامه.', 0, 'السنام يخزن دهوناً، وليس ماء.'],
  ['البطريق يعيش في القطب الشمالي.', 0, 'البطاريق تعيش في نصف الكرة الجنوبي، والدببة القطبية في الشمال.'],
  ['يمكن سماع الرعد بعد رؤية البرق بسبب فرق سرعة الضوء والصوت.', 1, 'الضوء أسرع بكثير من الصوت.'],
  ['البيضة تطفو دائماً في الماء العذب.', 0, 'البيضة الطازجة تغوص، والقديمة فقط تميل للطفو.'],
];
const LV = [[0, 'نعسان'], [30, 'صاحي'], [80, 'فضولي'], [160, 'متحمس'], [300, 'عبقري']];
const xp = () => Number(localStorage.kt_xp || 0);
function addXp(n, key) {
  if (key) { const s = JSON.parse(localStorage.kt_xpk || '[]'); if (s.includes(key)) return false; s.push(key); localStorage.kt_xpk = JSON.stringify(s.slice(-300)); }
  const before = level(xp()); localStorage.kt_xp = xp() + n; const a = level(xp()); if (a.i > before.i) toast('ترقّيت: ' + a.name + '!'); const m = document.getElementById('meter'); if (m) m.outerHTML = meter(); return true;
}
function level(x) { let i = 0; LV.forEach((l, k) => { if (x >= l[0]) i = k; }); const nx = LV[i + 1]; return { i, name: LV[i][1], pct: nx ? (x - LV[i][0]) / (nx[0] - LV[i][0]) : 1, next: nx ? nx[0] : null }; }
function meter() {
  const x = xp(), L = level(x), ang = -90 + (L.i + L.pct) / LV.length * 180 * (LV.length / (LV.length)) ;
  const a = Math.min(90, -90 + ((L.i + L.pct) / (LV.length - 0.0001)) * 180);
  const cols = ['#9DC4D5', '#2E6FBE', '#F0B400', '#EF642D', '#463C50'];
  const arcs = cols.map((c, k) => { const s = Math.PI + k * Math.PI / 5, e = Math.PI + (k + 1) * Math.PI / 5; const P = t => [60 + 48 * Math.cos(t), 62 + 48 * Math.sin(t)]; const [x1, y1] = P(s), [x2, y2] = P(e); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}A48 48 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${c}" stroke-width="14" fill="none"/>`; }).join('');
  return `<div id="meter" class="meter" role="img" aria-label="مقياس الفضول: ${L.name}"><svg viewBox="0 0 120 76" width="150">${arcs}<g style="transform-origin:60px 62px;transform:rotate(${a.toFixed(0)}deg);transition:transform .8s cubic-bezier(.3,1.5,.5,1)"><path d="M60 62V22" stroke="#181818" stroke-width="4" stroke-linecap="round"/></g><circle cx="60" cy="62" r="7" fill="#181818"/></svg><div><small>مقياس الفضول</small><b>${L.name}</b><span>${x} نقطة${L.next ? ' · التالي ' + L.next : ''}</span></div></div>`;
}
const dayKey = () => new Date().toISOString().slice(0, 10);
function pPlay() {
  const d = Math.floor(Date.now() / 864e5); let n = 0; const st = JSON.parse(localStorage.kt_play || '{"day":"","streak":0,"last":""}');
  const today = dayKey(), done = st.day === today ? 3 : 0; let sc = 0;
  const qs = [0, 1, 2].map(k => FACTS[(d * 3 + k) % FACTS.length]);
  const draw = () => {
    if (n >= 3 || done) {
      const fresh = n >= 3; if (fresh) { const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); st.streak = st.last === y ? st.streak + 1 : 1; st.last = today; st.day = today; st.sc = sc; localStorage.kt_play = JSON.stringify(st); }
      return shell(`<div class="wrap"><div class="box quiz" style="text-align:center;margin:30px auto;max-width:560px">${mascot()}<h1>${fresh ? 'خلصت أسئلة اليوم!' : 'لعبت اليوم'}</h1>${st.sc != null ? `<p><b>نتيجتك: ${st.sc} من 3</b></p>` : ''}<p>تعال بكرة لأسئلة جديدة. أيام متتالية: <b>${st.streak}</b></p>${meter()}<p style="margin-top:14px"><a class="btn red" href="#/explore">اكتشف المزيد</a></p></div></div>`, '/play');
    }
    const [t] = qs[n];
    shell(`<div class="wrap"><div class="box quiz" style="margin:30px auto;max-width:560px"><div class="bar" style="justify-content:space-between"><span class="chip" style="background:var(--red);color:#fff">صدّق أو لا</span><small>${n + 1} من 3 · سلسلة ${st.streak} · ${xp()} نقطة</small></div><div class="say" style="margin:14px 0 4px">${mascot()}<span>شوف الجملة دي وقرر: حقيقة ولا خيال؟</span></div><div class="dots">${[0,1,2].map(i=>`<i class="${i<n?"on":i===n?"cur":""}"></i>`).join("")}</div><h1 style="font-size:26px;margin:16px 0">${t}</h1><div class="bar" style="gap:12px"><button class="btn blue" style="flex:1" data-a="1">صدّق</button><button class="btn red" style="flex:1" data-a="0">لا تصدّق</button></div><div id="pr"></div></div></div>`, '/play');
    document.querySelector('.quiz .dots+h1+.bar').onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return; const [, ok, why] = qs[n], right = Number(b.dataset.a) === ok;
      document.querySelectorAll('[data-a]').forEach(x => x.disabled = true); if (right) { addXp(10); sc++; } else addXp(2);
      document.querySelectorAll('[data-a]').forEach(x => x.classList.add(Number(x.dataset.a) === ok ? 'pk-ok' : 'pk-no'));
      document.getElementById('pr').innerHTML = `<div class="say" style="margin-top:16px;background:${right ? '#dff3df' : '#fde3d8'}"><span><b>${right ? 'صح!' : 'ليس تماماً.'}</b> ${ok ? 'صحيحة' : 'خرافة'}: ${why}</span></div><p style="margin-top:12px"><button class="btn sm" id="nx">${n < 2 ? 'السؤال التالي' : 'إنهاء'}</button></p>`;
      document.getElementById('nx').onclick = () => { n++; draw(); };
    };
  };
  draw();
}
