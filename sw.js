// Service Worker for Admin System - 重新整理優化版
const CACHE_NAME = 'admin-system-v2.3.0';
const CACHE_VERSION = '2.3.0';

// 關鍵資源列表
const CRITICAL_RESOURCES = [
    '/admin.html',
    '/index.html',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage-compat.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js',
    'https://cdn.jsdelivr.net/npm/flatpickr',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'
];

// 快取策略設定
const CACHE_STRATEGIES = {
    // 關鍵資源：快取優先，網路備用
    critical: 'cache-first',
    // API 請求：網路優先，快取備用
    api: 'network-first',
    // 靜態資源：快取優先
    static: 'cache-first'
};

// Service Worker 安裝
self.addEventListener('install', (event) => {
    console.info('🔧 Service Worker 安裝中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.info('📦 快取關鍵資源...');
                return cache.addAll(CRITICAL_RESOURCES.map(url => {
                    // 處理相對路徑
                    if (url.startsWith('/')) {
                        return new Request(url, { cache: 'reload' });
                    }
                    return new Request(url, { 
                        cache: 'reload',
                        mode: 'cors',
                        credentials: 'omit'
                    });
                }));
            })
            .then(() => {
                console.info('✅ 關鍵資源快取完成');
                self.skipWaiting(); // 立即激活
            })
            .catch((error) => {
                console.error('❌ 資源快取失敗:', error);
            })
    );
});

// Service Worker 激活
self.addEventListener('activate', (event) => {
    console.info('🚀 Service Worker 激活中...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.info(`🗑️ 清除舊快取: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.info('✅ Service Worker 激活完成');
                return self.clients.claim(); // 立即控制所有頁面
            })
    );
});

// 請求攔截處理
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // 跳過非 GET 請求
    if (request.method !== 'GET') {
        return;
    }
    
    // 跳過 Chrome extension 請求
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // 判斷資源類型並應用對應策略
    let strategy = getResourceStrategy(url);
    
    event.respondWith(
        handleRequest(request, strategy)
            .catch((error) => {
                console.error('請求處理失敗:', error);
                return fetch(request);
            })
    );
});

// 判斷資源策略
function getResourceStrategy(url) {
    const pathname = url.pathname;
    const hostname = url.hostname;
    
    // Firebase API 請求
    if (hostname.includes('firestore.googleapis.com') || 
        hostname.includes('firebase.googleapis.com')) {
        return CACHE_STRATEGIES.api;
    }
    
    // CDN 資源
    if (hostname.includes('gstatic.com') || 
        hostname.includes('jsdelivr.net')) {
        return CACHE_STRATEGIES.critical;
    }
    
    // HTML 頁面
    if (pathname.endsWith('.html') || pathname === '/') {
        return CACHE_STRATEGIES.critical;
    }
    
    // 預設策略
    return CACHE_STRATEGIES.static;
}

// 處理請求
async function handleRequest(request, strategy) {
    const cache = await caches.open(CACHE_NAME);
    
    switch (strategy) {
        case 'cache-first':
            return cacheFirst(request, cache);
        case 'network-first':
            return networkFirst(request, cache);
        case 'cache-only':
            return cacheOnly(request, cache);
        case 'network-only':
            return networkOnly(request);
        default:
            return fetch(request);
    }
}

// 快取優先策略
async function cacheFirst(request, cache) {
    try {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // 在背景中更新快取
            updateCacheInBackground(request, cache);
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// 網路優先策略
async function networkFirst(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// 僅快取策略
async function cacheOnly(request, cache) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    throw new Error('No cache available');
}

// 僅網路策略
async function networkOnly(request) {
    return fetch(request);
}

// 在背景中更新快取
function updateCacheInBackground(request, cache) {
    // 避免過於頻繁的背景更新
    const lastUpdate = self.lastCacheUpdate || 0;
    const now = Date.now();
    
    if (now - lastUpdate > 60000) { // 1分鐘內只更新一次
        self.lastCacheUpdate = now;
        
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            })
            .catch(() => {
                // 靜默失敗，不影響使用者體驗
            });
    }
}

// 訊息處理
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then((status) => {
                event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
            });
            break;
    }
});

// 清除所有快取
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.info('🗑️ 所有快取已清除');
    } catch (error) {
        console.error('快取清除失敗:', error);
    }
}

// 取得快取狀態
async function getCacheStatus() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        return {
            version: CACHE_VERSION,
            cachedResourcesCount: keys.length,
            cacheSize: await getCacheSize(cache)
        };
    } catch (error) {
        return { error: error.message };
    }
}

// 計算快取大小（估算）
async function getCacheSize(cache) {
    try {
        const keys = await cache.keys();
        let totalSize = 0;
        
        for (const key of keys.slice(0, 10)) { // 只計算前10個以提升性能
            try {
                const response = await cache.match(key);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            } catch (e) {
                // 忽略個別錯誤
            }
        }
        
        return Math.round(totalSize / 1024); // 返回 KB
    } catch (error) {
        return 0;
    }
} 