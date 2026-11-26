// router: route table, data bootstrap, service worker
const ROUTES = {
  '': () => pHome(), explore: b => pExplore(b), episodes: () => pEpisodes(), item: b => pItem(b),
  login: () => pAuth('login'), signup: () => pAuth('signup'), setup: () => pAuth('setup'),
  account: () => pAccount(), plans: () => pPlans(), suggest: () => pSuggest(), quiz: () => pQuiz(), play: () => pPlay(), admin: b => pAdmin(b),
};
async function route() {
  const hq = location.hash.split('?'); window.HQ = new URLSearchParams(hq[1] || '');
  const [a = '', b, c] = (hq[0].replace(/^#\/?/, '') || '').split('/');
  try {
    if (!S.home) S.home = await api('/home');
    if (S.token && !S.user) S.user = await api('/me').catch(() => { S.token = ''; localStorage.removeItem('kt_token'); return null; });
    document.title = S.home.settings.siteName;
    return await (ROUTES[a] || ROUTES[''])(b, c);
  } catch (e) { $('#app').innerHTML = `<div class="loader"><div>${mascot()}<div>تعذّر التحميل، حاول مرة أخرى</div><p><button class="btn sm" onclick="route()">إعادة المحاولة</button></p></div></div>`; }
}
addEventListener('hashchange', route); route();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));
