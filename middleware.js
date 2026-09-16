const ORIGIN_HOST = 'seguidor.app.br';
const ORIGIN = 'http://177.104.165.255';
const SIGNUP = 'https://engajamento.app.br/signup';

export default async function middleware(request) {
  const url = new URL(request.url);
  const dest = ORIGIN + url.pathname + url.search;
  const headers = new Headers();
  const ua = request.headers.get('user-agent');
  const accept = request.headers.get('accept');
  if (ua) headers.set('user-agent', ua);
  if (accept) headers.set('accept', accept);
  headers.set('accept-encoding', 'identity');
  headers.set('host', ORIGIN_HOST);

  const upstream = await fetch(dest, {
    method: 'GET',
    headers,
    redirect: 'manual',
  });

  const ct = upstream.headers.get('content-type') || '';
  if (ct.includes('text/html')) {
    let html = await upstream.text();
    html = html.replace(
      /(<a id="catalogo-[^"]+") href="#"/g,
      '$1 href="' + SIGNUP + '"'
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
