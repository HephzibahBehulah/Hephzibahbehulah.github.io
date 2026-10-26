// Stable URLs must revalidate; manually versioned URLs are not immutable.
export function assetCacheHeaders(response, {privateHost = false} = {}) {
  const headers = new Headers(response.headers);
  const html = headers.get('content-type')?.includes('text/html');
  headers.set('cache-control', privateHost || html ? 'private, no-store' : 'no-cache');
  headers.set('cloudflare-cdn-cache-control', 'no-store');
  if (html) {
    headers.delete('etag');
    headers.delete('last-modified');
    headers.delete('content-length');
  }
  return headers;
}
