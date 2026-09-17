const ORIGIN = 'https://seguidor.app.br';
const PANEL = 'https://engajamento.app.br/';
const SIGNUP = 'https://engajamento.app.br/signup';
const WHATSAPP = 'https://wa.me/5515991327816';

export default async function middleware(request) {
  const url = new URL(request.url);
  const dest = ORIGIN + url.pathname + url.search;
  const headers = new Headers();
  const ua = request.headers.get('user-agent');
  const accept = request.headers.get('accept');
  if (ua) headers.set('user-agent', ua);
  if (accept) headers.set('accept', accept);
  headers.set('accept-encoding', 'identity');

  const upstream = await fetch(dest, {
    method: 'GET',
    headers,
    redirect: 'manual',
  });

  const ct = upstream.headers.get('content-type') || '';
  if (ct.includes('text/html')) {
    let html = await upstream.text();
    html = html.replace(
      /<a href="#" target="_blank" rel="noopener noreferrer" class="btn-ms-dark/g,
      '<a href="' + PANEL + '" target="_blank" rel="noopener noreferrer" class="btn-ms-dark'
    );
    html = html.replace(
      /<a href="#" target="_blank" rel="noopener noreferrer" class="btn-ms w-full/g,
      '<a href="' + SIGNUP + '" target="_blank" rel="noopener noreferrer" class="btn-ms w-full'
    );
    html = html.replace(
      /<a href="#" target="_blank" rel="noopener noreferrer" class="btn-ms-invert/g,
      '<a href="' + SIGNUP + '" target="_blank" rel="noopener noreferrer" class="btn-ms-invert'
    );
    html = html.replace(
      /(<a id="catalogo-[^"]+") href="#"/g,
      '$1 href="' + SIGNUP + '"'
    );
    html = html.replace(
      /<a href="#" target="_blank" rel="noopener noreferrer" class="btn-ms mt-4 inline-flex/g,
      '<a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="btn-ms mt-4 inline-flex'
    );
    return new Response(html, {
      status: upstream.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export const config = {
  matcher: ['/((?!_vercel/).*)'],
};
