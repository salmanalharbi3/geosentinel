addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/' || path === '/index.html') {
    const html = await fetch('https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/index.html').then(r => r.text());
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  if (path === '/api/news') {
    const news = await fetch('https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/news.json').then(r => r.json());
    return new Response(JSON.stringify(news), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (path === '/api/energy') {
    return new Response(JSON.stringify({ brent: 92.69, wti: 90.90, updated: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}
