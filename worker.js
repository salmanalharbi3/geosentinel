/**
 * worker.js - GeoSentinel Cloudflare Worker (نسخة نهائية مطورة)
 * يقدم index.html + كل ملفات data/*.json + APIs بسيطة
 * يتعامل مع كل الطلبات بشكل صحيح لتحميل الخريطة والبيانات
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
  // غيّر هذه القيم مرة واحدة فقط
  const GITHUB_USERNAME = 'sadfg2369';       // اسم حسابك على GitHub
  const REPO_NAME       = 'geosentinel';     // اسم الـ repo بالضبط (تأكد منه من رابط GitHub)

  const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main`;

  // 1. تقديم الصفحة الرئيسية (index.html)
  if (path === 'index.html') {
    const htmlUrl = `${BASE_RAW_URL}/index.html`;
    try {
      const html = await fetch(htmlUrl).then(r => {
        if (!r.ok) throw new Error('index.html غير موجود');
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

  // 2. تقديم ملفات JSON من مجلد data (events.json, sites.json, news.json)
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

  // 3. API endpoints (مؤقتة - يمكن توسيعها)
  if (path.startsWith('api/')) {
    const apiName = path.replace('api/', '');

    if (apiName === 'news') {
      const newsUrl = `${BASE_RAW_URL}/data/news.json`;
      try {
        const news = await fetch(newsUrl).then(r => r.json());
        return new Response(JSON.stringify(news), {
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        });
      } catch (e) {
        return new Response(JSON.stringify([{ title: "خطأ في جلب الأخبار", source: "Fallback" }]), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (apiName === 'energy') {
      return new Response(JSON.stringify({
        updated_at: new Date().toISOString(),
        brent_usd: 92.69,
        wti_usd: 90.90,
        source: "Static fallback - سيتم استبداله بـ API حي"
      }), {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    }

    return new Response(JSON.stringify({ error: `API غير مدعوم: ${apiName}` }), { status: 501 });
  }

  // 4. أي طلب آخر → 404
  return new Response('الصفحة غير موجودة (404)', { status: 404 });
}
