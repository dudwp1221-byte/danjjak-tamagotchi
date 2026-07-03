// 단짝 다마고치 서비스 워커 — 의존성 없는 간단한 런타임 캐시
// network-first: 온라인이면 최신, 오프라인이면 캐시에서 제공
const CACHE = 'danjjak-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 옛 캐시 정리
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // 같은 출처만 처리
  if (url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      try {
        const net = await fetch(request)
        const cache = await caches.open(CACHE)
        cache.put(request, net.clone())
        return net
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === 'navigate') {
          const index = await caches.match('/')
          if (index) return index
        }
        throw new Error('offline and not cached')
      }
    })(),
  )
})
