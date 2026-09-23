(function () {
    'use strict';

    var wrap = document.getElementById('vortexWrap');
    var canvas = document.getElementById('vortexCanvas');
    if (!wrap || !canvas) return;

    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    var CX = W / 2;
    var CY = H / 2;

    var hovering = false;      // 鼠标悬停
    var clicked = false;       // 已点击（跳转中）
    var time = 0;
    var swirlSpeed = 0.0015;   // 基准旋转速度（约为原速的30%)
    var particles = [];
    var armCount = 4;          // 螺旋臂数量
    var particleCount = 260;

    // 过渡层与目标地址
    var transitionEl = document.getElementById('pageTransition');
    var TARGET = 'about.html';

    /* ===== 初始化粒子 ===== */
    function initParticles() {
        particles = [];
        for (var i = 0; i < particleCount; i++) {
            // 沿螺旋臂分布
            var arm = i % armCount;
            var t = (Math.floor(i / armCount) / (particleCount / armCount)) * Math.PI * 4;
            var r = t * (CX * 0.92 / (Math.PI * 4)); // 半径从内向外
            particles.push({
                arm: arm,
                r: r,
                baseAngle: t + (arm * Math.PI * 2) / armCount,
                size: Math.random() * 2.2 + 0.5,
                alpha: Math.random() * 0.6 + 0.3,
                hueShift: Math.random() * 40 - 20
            });
        }
    }

    /* ===== 绘制漩涡 ===== */
    function draw() {
        ctx.clearRect(0, 0, W, H);

        // 中心光晕（柔和，无白点）
        var glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, CX * 0.7);
        glow.addColorStop(0, 'rgba(196, 77, 255, 0.18)');
        glow.addColorStop(0.5, 'rgba(110, 142, 251, 0.06)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        var speed = swirlSpeed * (hovering ? 1.8 : 1);

        particles.forEach(function (p) {
            var angle = p.baseAngle + time * speed * 8 + p.r * 0.018;
            var x = CX + Math.cos(angle) * p.r;
            var y = CY + Math.sin(angle) * p.r;

            // 向中心轻微收缩再随旋转推出，形成流动感
            var breathe = Math.sin(time * 0.02 + p.r * 0.05) * 3;
            var rr = p.r + breathe;
            x = CX + Math.cos(angle) * rr;
            y = CY + Math.sin(angle) * rr;

            // 颜色：紫 → 蓝 → 粉 渐变
            var hue = 265 + p.hueShift + Math.sin(angle) * 20;
            var sat = 80;
            var light = 60 + Math.sin(time * 0.03 + p.r * 0.04) * 15;

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'hsla(' + hue + ', ' + sat + '%, ' + light + '%, ' + p.alpha + ')';
            ctx.fill();

            // 外圈粒子带光晕
            if (p.r > CX * 0.5) {
                ctx.beginPath();
                ctx.arc(x, y, p.size * 2.6, 0, Math.PI * 2);
                ctx.fillStyle = 'hsla(' + hue + ', ' + sat + '%, ' + light + '%, ' + (p.alpha * 0.12) + ')';
                ctx.fill();
            }
        });

        // 旋转光带
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(time * speed * 3);
        for (var a = 0; a < armCount; a++) {
            ctx.rotate((Math.PI * 2) / armCount);
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

    function loop(t) {
        time = t / 16.666;
        draw();
        requestAnimationFrame(loop);
    }

    /* ===== 交互：点击漩涡进入导航页 ===== */
    wrap.addEventListener('click', function () {
        if (clicked) return;
        clicked = true;
        goTo(TARGET);
    });

    canvas.addEventListener('mouseenter', function () { hovering = true; });
    canvas.addEventListener('mouseleave', function () { hovering = false; });

    /* ===== 页面过渡：漩涡放大透明消失后跳转 ===== */
    function goTo(url) {
        if (!transitionEl) {
            window.location.href = url;
            return;
        }
        // 从漩涡中心位置触发：漩涡放大 + 变透明 + 消失
        var rect = wrap.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        transitionEl.style.left = cx + 'px';
        transitionEl.style.top = cy + 'px';
        transitionEl.classList.add('active');
        wrap.style.opacity = '0';
        setTimeout(function () {
            window.location.href = url;
        }, 800);
    }

    /* ===== 启动 ===== */
    initParticles();
    requestAnimationFrame(loop);

})();
