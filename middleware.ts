const PRIVATE_PATH_PREFIX = '/private/';
const PRIVATE_ACCESS_SCRIPT = '/private-access.js';

const ALLOWED_IP_HASHES = new Set([
  'd00ebb0760c6a038fba22af1d1f7dbc2e695b6def197b6c2b46feeb465a21a39',
]);

const LOCAL_IPS = new Set(['127.0.0.1', '::1']);

export const config = {
  matcher: ['/private/:path*', '/private-access.js'],
};

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || '';
}

async function isAllowedRequest(request: Request) {
  const ip = getRequestIp(request);

  if (!ip) {
    return false;
  }

  if (LOCAL_IPS.has(ip)) {
    return true;
  }

  return ALLOWED_IP_HASHES.has(await sha256(ip));
}

function privateAccessScript(allowed: boolean) {
  const script = allowed
    ? "document.querySelectorAll('[data-private-nav]').forEach((item) => item.classList.remove('hidden'));"
    : '';

  return new Response(script, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const allowed = await isAllowedRequest(request);

  if (url.pathname === PRIVATE_ACCESS_SCRIPT) {
    return privateAccessScript(allowed);
  }

  if (url.pathname.startsWith(PRIVATE_PATH_PREFIX) && !allowed) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  }
}
