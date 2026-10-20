# ssdkey.github.io

我的个人主页（域名：me.iuuv.cn），一个星空主题的单页网站。

首页记录「来到地球的」天数倒计时，带动态漩涡入口；点击漩涡进入「六一」页，展示我的 GitHub 项目（my repositories）与社区主页（about me）。

## 首页截图

![首页截图](img/homepage.jpg)

## 技术栈

- 纯 HTML / CSS / JavaScript（无框架、无构建步骤）
- Canvas 星空粒子背景（`js/starfield.js`）
- Canvas 漩涡动效（`js/vortex.js`）
- GitHub Pages 托管

## 目录

```
index.html      首页：倒计时 + 漩涡入口
about.html      六一页：项目与社区链接
404.html        自定义 404
css/style.css   全部样式
js/starfield.js 星空背景 + 入场动画
js/vortex.js    漩涡 Canvas 与跳转过渡
robots.txt / sitemap.xml / CNAME
```

## 本地预览

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 实现约定

- 入场动画的错峰延迟写在 `js/starfield.js` 的 `DELAYS` 里，不用 CSS `transition-delay`，避免覆盖元素自身的 transition。
- 两个 Canvas 都按 `devicePixelRatio`（上限 2）放大实际像素，高分屏不糊。
- 页面切到后台 / 漩涡滚出视口时暂停 `requestAnimationFrame`。
- 尊重 `prefers-reduced-motion`：只画一帧静态画面，跳过跳转动画。
- 渐变对象不要跨坐标系复用 —— Canvas 渐变绑定创建时的坐标空间，漩涡光臂每帧重建。
