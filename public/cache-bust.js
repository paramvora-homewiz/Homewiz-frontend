// Cache busting script to force browser to reload assets
(function() {
    'use strict';
    
    // Clear all caches on load
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    console.log('Clearing cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            console.log('All caches cleared');
            // Force reload after cache clear
            if (sessionStorage.getItem('cache-cleared') !== 'true') {
                sessionStorage.setItem('cache-cleared', 'true');
                window.location.reload(true);
            }
        });
    }
    
    // Add timestamp to all script/link tags to bust cache
    const timestamp = Date.now();
    const scripts = document.querySelectorAll('script[src]');
    const links = document.querySelectorAll('link[href]');
    
    scripts.forEach(script => {
        if (script.src.includes('/_next/')) {
            const url = new URL(script.src);
            url.searchParams.set('v', timestamp);
            script.src = url.toString();
        }
    });
    
    links.forEach(link => {
        if (link.href.includes('/_next/')) {
            const url = new URL(link.href);
            url.searchParams.set('v', timestamp);
            link.href = url.toString();
        }
    });
})();