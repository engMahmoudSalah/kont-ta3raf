# ربط يوتيوب وتيك توك بموقع كنت تعرف!

Redirect URIs (انسخهم زي ما هم):
- YouTube: https://kont-ta3raf.mahmodsalah.workers.dev/api/oauth/youtube/callback
- TikTok:  https://kont-ta3raf.mahmodsalah.workers.dev/api/oauth/tiktok/callback

## أولاً: يوتيوب (Google Cloud)
1. افتح console.cloud.google.com وادخل بنفس إيميل قناة "كنت تعرف!".
2. من فوق اضغط اختيار المشروع ثم New Project. سمّيه kont-ta3raf واضغط Create.
3. من القائمة: APIs & Services ثم Library. دوّر على الاتنين وفعّل كل واحد (Enable):
   - YouTube Data API v3
   - YouTube Analytics API
4. APIs & Services ثم OAuth consent screen (أو Google Auth Platform). اضغط Get started:
   - App name: كنت تعرف. User support email: إيميلك. Audience: External. Contact email: إيميلك.
5. من Audience: أضف إيميلك في Test users. بعدها اضغط Publish app (In production). مهم جداً: لو سيبته Testing الربط بيقفل كل 7 أيام. هيظهر تحذير "unverified" وده عادي لتطبيق بتستخدمه لوحدك.
6. من Data Access: Add scopes وأضف: youtube.upload و youtube.force-ssl و yt-analytics.readonly و youtube.readonly.
7. Credentials ثم Create credentials ثم OAuth client ID:
   - Application type: Web application. Name: kont-web
   - Authorized redirect URIs: الصق رابط YouTube أعلاه بالظبط.
   - Create. هيظهر لك Client ID و Client secret.
8. الاتنين دول أسرار: ما تبعتهمش في الشات. هتحطهم في روابط آمنة نبعتها لك (vault).
9. بعدها ادخل الموقع (لوحة التحكم ثم الربط والنشر) واضغط "ربط يوتيوب" ووافق (Advanced ثم Go to kont-ta3raf لو ظهر تحذير).

## ثانياً: تيك توك (TikTok for Developers)
1. افتح developers.tiktok.com وسجّل بحساب تيك توك بتاع القناة (Log in ثم Connect an app).
2. Manage apps ثم Connect an app. اختار حسابك الشخصي (Individual). اكتب اسم التطبيق: Kont Ta3raf.
3. في بيانات التطبيق: ارفع أيقونة (المسكوت)، والوصف، واختار Category مناسب (Education).
4. الروابط المطلوبة: Terms of Service: https://kont-ta3raf.mahmodsalah.workers.dev/#/suggest و Privacy Policy: نفس الرابط مؤقتاً (هنضيف صفحة سياسة خصوصية لو طلبوا).
5. من Products اضغط Add products وفعّل:
   - Login Kit: في Redirect URI حط رابط TikTok أعلاه بالظبط.
   - Content Posting API: فعّل Direct Post وفعّل scopes: video.upload و video.publish. وفعّل user.info.basic من Login Kit.
6. في Content Posting API اختار Direct Post وحط الدومين اللي هترفع منه الفيديوهات في URL properties (لازم تثبت ملكيته).
7. اضغط Submit for review. لحد ما يوافقوا: تقدر ترفع كمسودة، والنشر المباشر بيطلع "خاص" (للنفس فقط) بس. وده من تيك توك مش من الموقع.
8. بعد الإنشاء هتلاقي Client key و Client secret. السر ما يتبعتش في الشات. هنبعت لك روابط آمنة.
9. من الموقع اضغط "ربط تيك توك" ووافق.
ملحوظة: تيك توك مفيش عنده واجهة عامة للرد على التعليقات، فالرد التلقائي يشتغل على يوتيوب بس.

## الأسرار (4 روابط آمنة)
YT_CLIENT_ID, YT_CLIENT_SECRET, TT_CLIENT_KEY, TT_CLIENT_SECRET
