/* 星空粒子背景 + 入场动画 */
(function () {
    'use strict';

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ===== 入场动画：延迟在 JS 里控制，避免污染各元素自身的 CSS transition ===== */
    var DELAYS = {
        'delay-1': 100,
        'delay-2': 200,
        'delay-3': 350,
        'delay-4': 500,
        'delay-5': 650,
        'delay-6': 800
    };

    function show(el, ms) {
        setTimeout(function () { el.classList.add('visible'); }, ms);
    }

    Array.prototype.forEach.call(document.querySelectorAll('.animate-in'), function (el) {
        var delay = 0;
        for (var key in DELAYS) {
            if (el.classList.contains(key)) { delay = DELAYS[key]; break; }
        }
        show(el, delay);
    });

    var footer = document.querySelector('.footer');
    if (footer) show(footer, 1000);

    /* ===== 星空粒子 ===== */
    var canvas = document.getElementById('starfield');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, prevW = 0, prevH = 0, dpr = 1;
    var stars = [];
    var shooting = [];
    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    var rafId = null;
    var TAU = Math.PI * 2;

    function starCount() {
        return window.innerWidth < 768 ? 110 : 200;
    }

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        // 上限 2 倍，3x 屏不白烧像素
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        // 之后全部用 CSS 像素坐标作图
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 等比缩放已有星星，尺寸变化时不会整片重排“跳变”
        if (prevW && prevH && stars.length) {
            var rx = W / prevW;
            var ry = H / prevH;
            for (var i = 0; i < stars.length; i++) {
                stars[i].x *= rx;
                stars[i].y *= ry;
            }
        }
        prevW = W;
        prevH = H;
    }

    function buildStars() {
        var n = starCount();
        if (stars.length === n) return;
        stars = [];
        for (var i = 0; i < n; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.3,
                a: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.02 + 0.005,
                phase: Math.random() * TAU,
                depth: Math.random()          // 视差层：0 远 / 1 近
            });
        }
    }

    function pushShooting() {
        shooting.push({
            x: Math.random() * W,
            y: Math.random() * H * 0.3,
            len: Math.random() * 80 + 40,
            speed: Math.random() * 8 + 4,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            a: 1,
            decay: Math.random() * 0.015 + 0.01
        });
    }

    function draw(time) {
        // 视差平滑跟随，避免鼠标移动时星星抖动
        mouseX += (targetX - mouseX) * 0.06;
        mouseY += (targetY - mouseY) * 0.06;
        var offX = (mouseX - W / 2) * 0.01;
        var offY = (mouseY - H / 2) * 0.01;

        ctx.clearRect(0, 0, W, H);

        // 一次设好 fillStyle，靠 globalAlpha 调亮度——比每颗星星拼 rgba 字符串快得多
        ctx.fillStyle = '#c8c8ff';
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var twinkle = Math.sin(time * s.speed + s.phase);
            var alpha = s.a * (0.6 + twinkle * 0.4);
            var px = s.x + offX * s.depth;
            var py = s.y + offY * s.depth;

            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, s.r, 0, TAU);
            ctx.fill();

            // 大星星加一层光晕
            if (s.r > 1.2) {
                ctx.globalAlpha = alpha * 0.1;
                ctx.beginPath();
                ctx.arc(px, py, s.r * 3, 0, TAU);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        // 流星
        if (!reduceMotion) {
            if (Math.random() < 0.003) pushShooting();
            for (var j = shooting.length - 1; j >= 0; j--) {
                var sh = shooting[j];
                var ex = sh.x + Math.cos(sh.angle) * sh.len;
                var ey = sh.y + Math.sin(sh.angle) * sh.len;

                var grad = ctx.createLinearGradient(sh.x, sh.y, ex, ey);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                grad.addColorStop(1, 'rgba(255, 255, 255, ' + sh.a + ')');

                ctx.beginPath();
                ctx.moveTo(sh.x, sh.y);
                ctx.lineTo(ex, ey);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                sh.x += Math.cos(sh.angle) * sh.speed;
                sh.y += Math.sin(sh.angle) * sh.speed;
                sh.a -= sh.decay;
                if (sh.a <= 0) shooting.splice(j, 1);
            }
        }
    }

    function frame(t) {
        draw(t);
        rafId = requestAnimationFrame(frame);
    }

    function start() {
        if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    resize();
    buildStars();

    if (reduceMotion) {
        draw(0);                          // 减少动态效果：只画一帧静态星空
    } else {
        start();
        // 切到后台就停掉 rAF，回来再续，省电省 CPU
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop(); else start();
        });
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        if (resizeTimer) cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(function () {
            resize();
            buildStars();
            if (reduceMotion) draw(0);
        });
    });

    /* ===== 鼠标跟随光效（触屏设备由 CSS 直接隐藏） ===== */
    var glow = document.getElementById('cursorGlow');
    var GLOW_R = 150;   // 与 .cursor-glow 的 300px 尺寸对应，用 translate3d 避开 left/top 触发的重排

    document.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        targetX = e.clientX;
        targetY = e.clientY;
        if (glow) {
            glow.style.transform = 'translate3d(' + (e.clientX - GLOW_R) + 'px,' + (e.clientY - GLOW_R) + 'px,0)';
            glow.style.opacity = '1';
        }
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
        if (glow) glow.style.opacity = '0';
    });

})();
