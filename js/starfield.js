(function () {
    'use strict';

    /* ===== 入场动画（用JS触发，兼容Electron） ===== */
    var delays = {
        'delay-1': 100,
        'delay-2': 200,
        'delay-3': 350,
        'delay-4': 500,
        'delay-5': 650,
        'delay-6': 800,
        'delay-7': 950
    };

    document.querySelectorAll('.animate-in').forEach(function (el) {
        var delay = 0;
        for (var i = 0; i < el.classList.length; i++) {
            var cls = el.classList[i];
            if (delays[cls]) { delay = delays[cls]; break; }
        }
        setTimeout(function () { el.classList.add('visible'); }, delay);
    });

    var footer = document.querySelector('.footer');
    if (footer) {
        setTimeout(function () { footer.classList.add('visible'); }, 1100);
    }

    /* ===== 星空粒子背景 ===== */
    var canvas = document.getElementById('starfield');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [];
    var shootingStars = [];
    var mouseX = 0, mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars(count) {
        stars = [];
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2,
                // 视差层 (0=远, 1=近)
                depth: Math.random()
            });
        }
    }

    function createShootingStar() {
        if (Math.random() > 0.003) return; // 低概率生成
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.3,
            length: Math.random() * 80 + 40,
            speed: Math.random() * 8 + 4,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.01
        });
    }

    function drawStars(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制星云/雾气
        var gradient1 = ctx.createRadialGradient(
            canvas.width * 0.2, canvas.height * 0.3, 0,
            canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.4
        );
        gradient1.addColorStop(0, 'rgba(120, 50, 255, 0.04)');
        gradient1.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var gradient2 = ctx.createRadialGradient(
            canvas.width * 0.8, canvas.height * 0.6, 0,
            canvas.width * 0.8, canvas.height * 0.6, canvas.width * 0.35
        );
        gradient2.addColorStop(0, 'rgba(255, 50, 120, 0.03)');
        gradient2.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制星星
        var parallaxX = (mouseX - canvas.width / 2) * 0.01;
        var parallaxY = (mouseY - canvas.height / 2) * 0.01;

        stars.forEach(function (star) {
            var twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
            var alpha = star.alpha * (0.6 + twinkle * 0.4);
            var px = star.x + parallaxX * star.depth;
            var py = star.y + parallaxY * star.depth;

            ctx.beginPath();
            ctx.arc(px, py, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 200, 255, ' + alpha + ')';
            ctx.fill();

            // 大星星加光晕
            if (star.radius > 1.2) {
                ctx.beginPath();
                ctx.arc(px, py, star.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(180, 180, 255, ' + (alpha * 0.1) + ')';
                ctx.fill();
            }
        });

        // 流星
        createShootingStar();
        shootingStars = shootingStars.filter(function (s) { return s.alpha > 0; });
        shootingStars.forEach(function (s) {
            var endX = s.x + Math.cos(s.angle) * s.length;
            var endY = s.y + Math.sin(s.angle) * s.length;

            var grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(1, 'rgba(255, 255, 255, ' + s.alpha + ')');

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.alpha -= s.decay;
        });
    }

    function animateStars(time) {
        drawStars(time);
        requestAnimationFrame(animateStars);
    }

    resizeCanvas();
    createStars(200);
    animateStars(0);

    window.addEventListener('resize', function () {
        resizeCanvas();
        createStars(200);
    });

    /* ===== 鼠标跟随光效 ===== */
    var cursorGlow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.style.opacity = '1';
        }
    });
    document.addEventListener('mouseleave', function () {
        if (cursorGlow) cursorGlow.style.opacity = '0';
    });

})();
