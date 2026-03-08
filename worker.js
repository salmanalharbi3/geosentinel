/**
 * worker.js - GeoSentinel Cloudflare Worker
 * يقدم الصفحة الرئيسية index.html + ملفات JSON الثابتة + APIs بسيطة
 * تم تطويره ليعمل مع هيكل المشروع الحالي (data/ + functions/api/)
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  let path = url.pathname;

  // تنظيف المسار
  if (path === '/' || path === '') path = '/index.html';
  if (path.startsWith('/')) path = path.slice(1);

  // === بيانات حساب GitHub الخاص بك ===
  // غيّر هذه القيم مرة واحدة فقط حسب حسابك
  const GITHUB_USERNAME = 'sadfg2369';       // اسم حسابك على GitHub
  const REPO_NAME       = 'geosentinel';     // اسم الـ repository بالضبط (شوف الرابط في GitHub)

  const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main`;

  // 1. تقديم الصفحة الرئيسية (index.html)
  if (path === 'index.html') {
    const htmlUrl = `${BASE_RAW_URL}/index.html`;
    try {
      const html = await fetch(htmlUrl).then(r => {
        if (!r.ok) throw new Error('index.html not found');
        return r.text();
      });
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    } catch (e) {
      return new Response(
        `<h1>خطأ في تحميل الصفحة</h1><p>${e.message}</p><p>تأكد من وجود index.html في الـ repo</p>`,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }
  }

  // 2. تقديم أي ملف JSON داخل مجلد data (events.json, sites.json, news.json)
  if (path.startsWith('data/')) {
    const fileName = path.replace('data/', '');
    const fileUrl = `${BASE_RAW_URL}/data/${fileName}`;
    try {
      const content = await fetch(fileUrl).then(r => {
        if (!r.ok) throw new Error(`${fileName} غير موجود`);
        return r.text();
      });
      return new Response(content, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: `الملف غير موجود: ${fileName}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3. تقديم API داخل functions/api (energy.js و news.js حاليًا)
  if (path.startsWith('api/')) {
    const apiName = path.replace('api/', '');

    // API للأخبار (news.js) - حاليًا نعطي رد بسيط، يمكن توسيعه لاحقًا
    if (apiName === 'news') {
      const newsUrl = `${BASE_RAW_URL}/data/news.json`;
      try {
        const news = await fetch(newsUrl).then(r => r.json());
        return new Response(JSON.stringify(news), {
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        });
      } catch (e) {
        return new Response(
          JSON.stringify([{ title: "خطأ في جلب الأخبار", source: "Fallback" }]),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // API لأسعار الطاقة (energy.js) - حاليًا رد ثابت، يمكن استبداله بـ API حقيقي لاحقًا
    if (apiName === 'energy') {
      return new Response(
        JSON.stringify({
          updated_at: new Date().toISOString(),
          brent_usd: 92.69,
          wti_usd: 90.90,
          source: "Static fallback - سيتم استبداله بـ API حي قريبًا"
        }),
        {
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        }
      );
    }

    // أي API أخرى غير مدعومة
    return new Response(
      JSON.stringify({ error: `API غير مدعوم: ${apiName}` }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // أي مسار آخر → 404
  return new Response(
    'الصفحة غير موجودة (404)',
    { status: 404, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }
  );
}
