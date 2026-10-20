# ssdkey.github.io

我的个人主页（域名：me.iuuv.cn），一个星空主题的单页网站。

首页记录「来到地球的」天数倒计时，带动态漩涡入口；点击漩涡进入 `page/` 下的「六一」页，展示我的 GitHub 项目（my repositories）与社区主页（about me）。

除首页外的页面都在 `page/` 目录里。`404.html` 例外，必须留在根目录，GitHub Pages 只认根目录这一份。

## 首页截图

![首页截图](img/homepage.jpg)

## 技术栈

- 纯 HTML / CSS / JavaScript（无框架、无构建步骤）
- Canvas 星空粒子背景（`js/starfield.js`）
- Canvas 漩涡动效（`js/vortex.js`）
- GitHub Pages 托管

## 目录

```
index.html           首页：倒计时 + 漩涡入口
404.html             自定义 404（必须在根目录）
page/about.html      六一页：项目与社区链接
page/shuang.html     shuang 页：从 1993-03-18 起的计时
css/style.css        全部样式
js/starfield.js      星空背景 + 入场动画
js/vortex.js         漩涡 Canvas 与跳转过渡
js/countdown.js      通用计时器，读 #countdown 的 data-target
robots.txt / sitemap.xml / CNAME
```

## 加一个新的计时页

复制 `page/shuang.html`，改 `#countdown` 上的 `data-target` 即可（ISO 8601，带时区）：

```html
<div class="countdown-wrapper" id="countdown" data-target="1993-03-18T00:00:00+08:00">
```

`page/` 下的页面引用根目录资源要用 `../`，例如 `../css/style.css`、`../js/countdown.js`。

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
