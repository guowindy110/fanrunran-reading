# 范润然 10 篇阅读训练包 · 静态站点（GitHub Pages 部署包）

这是一个**自包含的静态网站**：纯 HTML / CSS / JS，没有构建步骤、没有后端依赖。
所有资源都用相对路径互相引用，丢到任意静态托管（GitHub Pages / Netlify / Vercel / 自己的服务器）即可直接运行。

入口页：`index.html`（= 10 篇成品包索引 + 成长花园路径）。

---

## 方式一：GitHub 网页上传（不用命令行，最简单）

1. 登录 GitHub → 右上角 **+** → **New repository**。
   - 名字随意，例如 `fanrunran-reading`；选 **Public**；**不要**勾选 “Add a README”。点 **Create repository**。
2. 在空仓库页点 **uploading an existing file**。
3. 把本文件夹（`范润然10篇阅读包_site`）里的**所有文件**（包括 `index.html`、各 `.html`、`.css`、`.js`、`.md`，以及隐藏的 `.nojekyll`）全选拖进上传框 → **Commit changes**。
   - 提示：`.nojekyll` 是隐藏文件，Finder 里按 `Cmd+Shift+.` 显示隐藏文件再一起拖。它能避免 GitHub 用 Jekyll 处理页面，建议带上。
4. 进 **Settings → Pages**：
   - **Source** 选 **Deploy from a branch**；**Branch** 选 `main`、目录 `/ (root)` → **Save**。
5. 等 1–2 分钟，刷新该页，顶部会显示网址：
   `https://<你的用户名>.github.io/<仓库名>/`
   打开它就是阅读包首页。

## 方式二：命令行（Git）

在本文件夹内执行（把 `<你的用户名>`、`<仓库名>` 换成自己的）：

```bash
git init
git add -A
git commit -m "范润然 10 篇阅读训练包"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后同样到 **Settings → Pages** 选 `main` / `/(root)` 开启。

---

## 部署后能用到什么

- **索引页**：10 天成长花园路径（1-10 篇均已开放）、篇目导航、左侧总控；右侧「完整原稿」在 Pages（http 环境）下能正常加载（本地双击文件时因浏览器限制读不到，Pages 上没这个问题）。
- **每篇学生页**：阅读材料 + 作答区 + 计时器 + 自动保存（存在浏览器本地）+ 「导出画像输入(JSON)」「导出作答文本」。第 2 篇、第 8-10 篇使用通用回测卷学生页，按链接参数加载对应卷子。
- **每篇助学者解读页**：答案要点、评分点、卡点提示等。

## 重要：关于“记录学生信息并回流画像”

这个静态站点目前**只在本地浏览器**保存作答（localStorage 自动保存），并能**手动导出** JSON / 文本。
它**还不会**自动把作答上传、自动评分、并写回学生的八轴画像——那需要一个后端（见主项目蓝图 M9）。
也就是说：现在能“留下作答记录并导出”，但“自动汇总到画像、跨设备长期留存”还没接通。详见与本站同源的主项目文档。

---

## 文件清单

| 文件 | 作用 |
|---|---|
| `index.html` / `fanrunran-10-reading-pack.html` | 索引页（同一内容，入口用 index.html） |
| `fanrunran-reading-student-0X-*.html`（7） | 第 1–7 篇学生做题页 |
| `fanrunran-reading-retro-student.html` | 第 2、8–10 篇回测卷通用学生页 |
| `fanrunran-reading-retro-review.html` | 第 2、8–10 篇回测卷通用助学者解读页 |
| `fanrunran-reading-review-0X-*.html`（7） | 第 1–7 篇助学者解读页 |
| `fanrunran-reading-output-0X-*.md`（10） | 第 1–10 篇完整原稿（索引页右栏读取） |
| `fanrunran-reading-page.css` | 每日页样式（童趣花园） |
| `fanrunran-reading-tokens.css` | 设计 token（颜色/圆角/字体） |
| `fanrunran-reading-page.js` | 计时/自动保存/导出 |
| `fanrunran-self-selected-reading-kit.md` | 选材工作台规则 |
| `.nojekyll` | 关掉 Jekyll 处理 |

> 第 2 篇已由短视频材料替换为回测卷四《威尼斯的小艇》《水巷人家》；第 8 篇为《家书》，第 9 篇为《人民英雄纪念碑的设计智慧》，第 10 篇为回测卷三《一字之师》。
