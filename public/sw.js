
const CACHE_NAME = 'niko-soko-cache-v6';
// This list should include all the static assets that make up the app shell.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/config.ts',
  '/App.tsx',
  '/types.ts',
  '/services/api.ts',
  '/services/mockData.ts',
  // API Mocks
  '/api/providers',
  '/api/catalogue',
  '/api/documents',
  '/api/invitations',
  '/api/gigs',
  '/api/categories',
  '/api/banners',
  '/api/messages',
  // Components
  '/components/AddServiceCardView.tsx',
  '/components/AuthModal.tsx',
  '/components/BusinessAssets.tsx',
  '/components/CatalogueItemDetailModal.tsx',
  '/components/CatalogueView.tsx',
  '/components/DoorProfile.tsx',
  '/components/DocumentDetailView.tsx',
  '/components/GatePass.tsx',
  '/components/GigCard.tsx',
  '/components/InvoiceGenerator.tsx',
  '/components/InvoiceHub.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/MyDocumentsView.tsx',
  '/components/ProfileView.tsx',
  '/components/QuoteGenerator.tsx',
  '/components/ReceiptGenerator.tsx',
  '/components/ScanDocumentView.tsx',
  '/components/ServiceCard.tsx',
  '/components/SuperAdminDashboard.tsx',
  '/components/NikoSoko.tsx',
  '/components/Tukosoko.tsx',
  '/components/GigsPage.tsx',
  '/components/MyToolkit.tsx',
  '/components/WorkshopSetup.tsx',
  '/components/PremisePublicView.tsx',
  '/components/CheckInRequestModal.tsx',
  '/components/admin/AnalyticsPage.tsx',
  '/components/admin/AppearancePage.tsx',
  '/components/admin/BroadcastPage.tsx',
  '/components/admin/CategoriesPage.tsx',
  '/components/admin/DashboardPage.tsx',
  '/components/admin/OrganizationsPage.tsx',
  '/components/admin/UsersPage.tsx',
  // External assets
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests).catch(err => {
            console.error('Failed to cache all URLs:', err);
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
