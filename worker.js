addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  let path = url.pathname;

  // إزالة / في البداية إذا وجد
  if (path.startsWith('/')) path = path.slice(1);

  // تقديم index.html
  if (path === '' || path === 'index.html') {
    const html = await fetch('https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/index.html').then(r => r.text());
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  // تقديم ملفات JSON من مجلد data
  if (path.startsWith('data/')) {
    const file = path.replace('data/', '');
    const jsonUrl = `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/${file}`;
    const json = await fetch(jsonUrl).then(r => r.text());
    return new Response(json, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // API بسيطة (يمكن توسيعها لاحقًا)
  if (path === 'api/news') {
    const newsUrl = `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/news.json`;
    const news = await fetch(newsUrl).then(r => r.json());
    return new Response(JSON.stringify(news), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (path === 'api/energy') {
    return new Response(JSON.stringify({
      brent_usd: 92.69,
      wti_usd: 90.90,
      updated_at: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}
