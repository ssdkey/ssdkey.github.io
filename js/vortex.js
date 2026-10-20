/* 首页漩涡入口：Canvas 螺旋粒子 + 点击进入 about.html */
(function () {
    'use strict';

    var wrap = document.getElementById('vortexWrap');
    var canvas = document.getElementById('vortexCanvas');
    if (!wrap || !canvas || !canvas.getContext) return;

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, CX = 0, CY = 0;
    var TAU = Math.PI * 2;

    var hovering = false;
    var clicked = false;
    var time = 0;
    var swirlSpeed = 0.0015;
    var particles = [];
    var armCount = 4;

    var transitionEl = document.getElementById('pageTransition');
    var hoverQuery = window.matchMedia ? window.matchMedia('(hover: hover)') : null;

    /* ===== 尺寸：按 devicePixelRatio 放大实际像素，避免高分屏糊 ===== */
    function resize() {
        var size = canvas.clientWidth || 280;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        W = size;
        H = size;
        CX = size / 2;
        CY = size / 2;

        initParticles();
    }

    /* ===== 初始化粒子 ===== */
    function initParticles() {
        var count = W < 240 ? 150 : 260;
        particles = [];
        for (var i = 0; i < count; i++) {
            var arm = i % armCount;
            var t = (Math.floor(i / armCount) / (count / armCount)) * Math.PI * 4;
            particles.push({
                r: t * (CX * 0.92 / (Math.PI * 4)),
                baseAngle: t + (arm * TAU) / armCount,
                size: Math.random() * 2.2 + 0.5,
                alpha: Math.random() * 0.6 + 0.3,
                hueShift: Math.random() * 40 - 20
            });
        }
    }

    /* ===== 渐变缓存 =====
       注意：Canvas 渐变会绑定创建时的坐标空间，光臂要跟着旋转，
       所以只有中心光晕可以缓存，光臂渐变必须每帧在旋转后的坐标系里新建。 */
    var glowGrad = null;

    function buildGradients() {
        glowGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, CX * 0.7);
        glowGrad.addColorStop(0, 'rgba(196, 77, 255, 0.18)');
        glowGrad.addColorStop(0.5, 'rgba(110, 142, 251, 0.06)');
        glowGrad.addColorStop(1, 'rgba(196, 77, 255, 0)');
    }

    /* ===== 绘制漩涡 ===== */
    function draw() {
        ctx.clearRect(0, 0, W, H);

        // 中心光晕（柔和，无白点）
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H);

        var speed = swirlSpeed * (hovering ? 1.8 : 1);

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var angle = p.baseAngle + time * speed * 8 + p.r * 0.018;
            var breathe = Math.sin(time * 0.02 + p.r * 0.05) * 3;
            var rr = p.r + breathe;
            var x = CX + Math.cos(angle) * rr;
            var y = CY + Math.sin(angle) * rr;

            // 紫 → 蓝 → 粉
            var hue = 265 + p.hueShift + Math.sin(angle) * 20;
            var light = 60 + Math.sin(time * 0.03 + p.r * 0.04) * 15;

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, TAU);
            ctx.fillStyle = 'hsla(' + hue + ', 80%, ' + light + '%, ' + p.alpha + ')';
            ctx.fill();

            // 外圈粒子带光晕
            if (p.r > CX * 0.5) {
                ctx.beginPath();
                ctx.arc(x, y, p.size * 2.6, 0, TAU);
                ctx.fillStyle = 'hsla(' + hue + ', 80%, ' + light + '%, ' + (p.alpha * 0.12) + ')';
                ctx.fill();
            }
        }

        // 旋转光带
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(time * speed * 3);
        for (var a = 0; a < armCount; a++) {
            ctx.rotate(TAU / armCount);
            var grad = ctx.createLinearGradient(0, 0, CX * 0.85, 0);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
            grad.addColorStop(0.6, 'rgba(196, 77, 255, 0.06)');
            grad.addColorStop(1, 'rgba(196, 77, 255, 0.15)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(CX * 0.4, -CX * 0.18, CX * 0.85, 0);
            ctx.quadraticCurveTo(CX * 0.4, CX * 0.18, 0, 0);
            ctx.fill();
        }
        ctx.restore();
    }

    var rafId = null;

    function loop(t) {
        time = t / 16.666;
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    /* ===== 页面过渡：漩涡放大透明消失后跳转 ===== */
    function goTo(url) {
        if (!transitionEl || reduceMotion) {
            window.location.href = url;
            return;
        }
        var rect = wrap.getBoundingClientRect();
        transitionEl.style.left = (rect.left + rect.width / 2) + 'px';
        transitionEl.style.top = (rect.top + rect.height / 2) + 'px';
        transitionEl.classList.add('active');
        wrap.style.opacity = '0';
        setTimeout(function () { window.location.href = url; }, 800);
    }

    /* ===== 交互：点击/回车进入导航页 ===== */
    wrap.addEventListener('click', function (e) {
        if (clicked) {
            e.preventDefault();
            return;
        }
        // 允许 Ctrl/⌘/中键 新标签页打开，别拦
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
        // 没有过渡层时交给浏览器默认跳转
        if (!transitionEl) return;

        e.preventDefault();
        clicked = true;
        goTo(wrap.getAttribute('href') || 'about.html');
    });

    // 触屏没有 hover，用按下反馈代替
    if (!hoverQuery || hoverQuery.matches) {
        wrap.addEventListener('pointerenter', function () { hovering = true; });
        wrap.addEventListener('pointerleave', function () { hovering = false; });
    }

    /* ===== 启动 ===== */
    resize();
    buildGradients();

    if (reduceMotion) {
        draw();                            // 只画一帧静态漩涡
    } else {
        start();
        // 滚出视口就停，别让一个看不见的 canvas 一直跑
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) start(); else stop();
            }, { threshold: 0.01 }).observe(wrap);
        }
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop(); else start();
        });
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        if (resizeTimer) cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(function () {
            resize();
            buildGradients();
            if (reduceMotion) draw();
        });
    });

})();
