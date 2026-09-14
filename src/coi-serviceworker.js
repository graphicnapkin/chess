// Retire the previous isolation service worker. Isolation is now delivered by
// HTTP headers, so OAuth redirects no longer depend on service worker reloads.
if (typeof window === 'undefined') {
    self.addEventListener('install', () => self.skipWaiting())
    self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()))
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            const script = registration.active?.scriptURL || ''
            if (new URL(script || location.href).pathname === '/serviceWorker.bundle.js') {
                void registration.unregister()
            }
        }
    }).catch(() => { /* Native headers already provide isolation. */ })
}
