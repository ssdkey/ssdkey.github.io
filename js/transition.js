(function () {
    'use strict';

    var el = document.getElementById('pageTransition');
    if (!el) return;

    /* ===== 进入动画：全屏漩涡扩散后收缩，露出页面 ===== */
    el.classList.add('active');
    // 先确保渲染，再播放收缩
    requestAnimationFrame(function () {
        setTimeout(function () {
            el.classList.add('shrink');
        }, 180);
    });
    setTimeout(function () {
        el.classList.remove('active');
        el.classList.remove('shrink');
    }, 950);

    /* ===== 站内导航点击：播放过渡后跳转 ===== */
    var links = document.querySelectorAll('a[data-transition]');
    links.forEach(function (a) {
        a.addEventListener('click', function (e) {
            var href = a.getAttribute('href');
            if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0) return;
            e.preventDefault();
            goTo(href);
        });
    });

    function goTo(url) {
        el.classList.remove('shrink');
        el.classList.add('active');
        el.style.pointerEvents = 'auto';
        setTimeout(function () {
            window.location.href = url;
        }, 850);
    }

})();
