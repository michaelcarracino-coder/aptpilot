/* AptPilot service worker.
 *
 * Deliberately conservative. The two ways a service worker ruins a product are
 * (a) pinning users to a stale build and (b) serving cached authenticated or
 * payment data, so:
 *   - navigations are network-first, falling back to a cached shell only when
 *     genuinely offline, so a deploy is picked up on the next load;
 *   - /api, Supabase and Stripe are never touched by the worker at all;
 *   - only content-hashed build assets are cached-first, which is safe because
 *     their filenames change whenever their contents do.
 *
 * Bump CACHE_VERSION to force every client to drop its old caches.
 */
const CACHE_VERSION = 'v1'
const SHELL_CACHE = `aptpilot-shell-${CACHE_VERSION}`
const ASSET_CACHE = `aptpilot-assets-${CACHE_VERSION}`
const IMAGE_CACHE = `aptpilot-images-${CACHE_VERSION}`
const OFFLINE_URL = '/index.html'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => c.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE])
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Anything that is user-specific, transactional, or money-related must always
// hit the network — never cache it, never serve it from cache.
function isNeverCached(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.hostname.endsWith('supabase.co') ||
    url.hostname.endsWith('stripe.com') ||
    url.hostname.endsWith('railway.app')
  )
}

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  let url
  try { url = new URL(request.url) } catch { return }
  if (isNeverCached(url)) return
  // Leave cross-origin requests (fonts, Pexels) to the browser's own cache
  // except images, handled below.
  const sameOrigin = url.origin === self.location.origin

  // 1. Navigations: network-first so new deploys are picked up immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone()
          caches.open(SHELL_CACHE).then(c => c.put(OFFLINE_URL, copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(OFFLINE_URL, { ignoreSearch: true })
          .then(r => r || Response.error()))
    )
    return
  }

  // 2. Content-hashed build assets: cache-first, safe because the filename
  //    changes whenever the contents do.
  if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then(res => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(ASSET_CACHE).then(c => c.put(request, copy)).catch(() => {})
        }
        return res
      }))
    )
    return
  }

  // 3. Images: stale-while-revalidate, so photography loads instantly on
  //    repeat visits without going stale forever.
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(hit => {
        const network = fetch(request).then(res => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(IMAGE_CACHE).then(c => c.put(request, copy)).catch(() => {})
          }
          return res
        }).catch(() => hit)
        return hit || network
      })
    )
  }
})

/* Push notifications.
 *
 * This is the reason AptPilot is worth shipping as an installed app at all:
 * a push is instant and free, where SMS costs money per message and is
 * currently blocked pending Twilio toll-free verification. The handlers are
 * wired up here; sending requires a push service + VAPID keys on the server,
 * which is not built yet.
 */
self.addEventListener('push', event => {
  if (!event.data) return
  let payload
  try { payload = event.data.json() } catch { payload = { body: event.data.text() } }

  const title = payload.title || 'New no-fee listing'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.tag || 'listing-alert',
      data: { url: payload.url || '/dashboard' },
      requireInteraction: false,
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(target); return client.focus() }
      }
      return self.clients.openWindow(target)
    })
  )
})
