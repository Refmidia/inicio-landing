const ORIGIN = 'https://seguidor.app.br';
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

  return upstream;
}

export const config = {
  matcher: ['/((?!_vercel/).*)'],
};
