/* 通用「已走过多久」计数器
   用法：<div class="countdown-wrapper" id="countdown" data-target="1994-09-25T00:00:00+08:00"> */
(function () {
    'use strict';

    var root = document.getElementById('countdown');
    if (!root) return;

    var target = new Date(root.getAttribute('data-target') || '').getTime();
    if (isNaN(target)) return;

    var els = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };

    // 只在数值真的变化时动一下，用 transform/opacity 走合成层，不触发重排
    function setNum(el, val) {
        if (!el || el.textContent === val) return;
        el.textContent = val;
        el.style.transform = 'translateY(-4px)';
        el.style.opacity = '0.45';
        raf(function () {
            raf(function () {
                el.style.transform = '';
                el.style.opacity = '';
            });
        });
    }

    function pad(n, len) {
        var s = String(n);
        while (s.length < len) s = '0' + s;
        return s;
    }

    function render() {
        var diff = Date.now() - target;
        if (diff < 0) return;

        setNum(els.days, pad(Math.floor(diff / 86400000), 5));
        setNum(els.hours, pad(Math.floor(diff / 3600000) % 24, 2));
        setNum(els.minutes, pad(Math.floor(diff / 60000) % 60, 2));
        setNum(els.seconds, pad(Math.floor(diff / 1000) % 60, 2));
    }

    // 对齐到整秒，避免 setInterval 长期漂移
    function tick() {
        render();
        setTimeout(tick, 1000 - (Date.now() % 1000));
    }

    render();
    tick();

    // 从后台切回来立即校正一次
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) render();
    });

})();
