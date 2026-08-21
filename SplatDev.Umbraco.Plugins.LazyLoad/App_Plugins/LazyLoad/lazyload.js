// Intersection Observer-based lazy loader for images and iframes
(function () {
    'use strict';

    if ('IntersectionObserver' in window) {
        var lazyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    if (el.dataset.src) {
                        el.src = el.dataset.src;
                        delete el.dataset.src;
                    }
                    el.classList.remove('lazy');
                    lazyObserver.unobserve(el);
                }
            });
        }, { rootMargin: '0px 0px 200px 0px' });

        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('img.lazy, iframe.lazy').forEach(function (el) {
                lazyObserver.observe(el);
            });
        });
    } else {
        // Fallback: load all immediately
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('img.lazy, iframe.lazy').forEach(function (el) {
                if (el.dataset.src) {
                    el.src = el.dataset.src;
                    el.classList.remove('lazy');
                }
            });
        });
    }
})();
