addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  let path = url.pathname;

  // تنظيف المسار
  if (path === '/' || path === '') path = '/index.html';
  if (path.startsWith('/')) path = path.slice(1);

  const repo = 'YOUR_USERNAME/YOUR_REPO'; // ← غيّر هنا باسم حسابك واسم الـ repo
  // مثال: 'sadfg2369/geosentinel-repo'

  // تقديم index.html
  if (path === 'index.html') {
    const htmlUrl = `https://raw.githubusercontent.com/${repo}/main/index.html`;
    const html = await fetch(htmlUrl).then(r => r.text());
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  // تقديم ملفات JSON من مجلد data
  if (path.startsWith('data/')) {
    const file = path.replace('data/', '');
    const jsonUrl = `https://raw.githubusercontent.com/${repo}/main/data/${file}`;
    try {
      const json = await fetch(jsonUrl).then(r => {
        if (!r.ok) throw new Error('File not found');
        return r.text();
      });
      return new Response(json, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
    }
  }

  // تقديم API داخل functions/api
  if (path.startsWith('api/')) {
    const apiFile = path.replace('api/', '');
    const apiUrl = `https://raw.githubusercontent.com/${repo}/main/functions/api/${apiFile}`;
    try {
      const apiCode = await fetch(apiUrl).then(r => r.text());
      // هنا نحتاج تنفيذ الكود ديناميكيًا (غير آمن في Workers مباشرة)
      // لذلك نستخدم حل بديل مؤقت: نعيد نتيجة ثابتة أو ندمج المنطق يدويًا
      if (apiFile === 'news.js') {
        // استدعاء منطق news.js مباشرة (نسخ المنطق هنا)
        const feeds = [
          { url: "https://news.google.com/rss/search?q=Middle+East+OR+Iran+OR+Gulf+energy+when:1d&hl=en-US&gl=US&ceid=US:en", source: "Google News" }
        ];
        // ... (يمكن نسخ باقي الكود من news.js هنا لاحقًا)
        return new Response(JSON.stringify([{ title: "News loading...", source: "Temp" }]), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (apiFile === 'energy.js') {
        // استدعاء منطق energy.js مباشرة
        return new Response(JSON.stringify({
          brent_usd: 92.69,
          wti_usd: 90.90,
          updated_at: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'API not found' }), { status: 404 });
    }
  }

  return new Response('Not Found', { status: 404 });
}
